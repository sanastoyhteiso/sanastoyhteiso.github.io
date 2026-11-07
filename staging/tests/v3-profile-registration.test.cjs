/* STAGING only — synthetic user registration/profile persistence tests.
 * No Firestore, tokens, personal records, or network accesses.
 */
'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path'),acorn=require('acorn');
const schema=require('../backend/rs-v3-profile-contract.js');
const src=fs.readFileSync(path.join(__dirname,'../backend/rs-v3-profile-contract.js'),'utf8');
acorn.parse(src,{ecmaVersion:5});
assert.equal(schema.cleanAlias('  Minun nimi  '),'Minun nimi');
assert.throws(()=>schema.cleanAlias('somebody@example.invalid'),/alias/);
assert.throws(()=>schema.cleanAlias('<script>'),/alias/);
assert.throws(()=>schema.cleanAlias(''),/alias/);
const first=schema.initial('Test Student',1793730000000);
assert.equal(first.alias,'Test Student');
assert.equal(first.learned,0);
assert.equal(first.publicStats,false,'Registration should be private by default');
assert.deepStrictEqual(Object.keys(first).sort(),['alias','learned','publicStats','updatedAt']);
assert.equal(schema.validProfile(first),true);
const fallback=schema.initial('bad@example.invalid',1793730000000);
assert.equal(fallback.alias,'Opiskelija','Do not publish email as alias');
assert.equal(schema.validProfile({...first,email:'leak@example.invalid'}),false);
assert.equal(schema.validProfile({...first,learned:-1}),false);
const updated=schema.edit({...first,learned:37},'Student 123',true,1793730000001);
assert.equal(updated.learned,37,'Profile edit must not reset study results');
assert.equal(updated.publicStats,true);
assert.throws(()=>schema.edit(first,'Another',true,1),/timestamps/);
const profiles={};let creates=0,updates=0,uid='alice';
const active={getState:()=>({status:'verified',user:{uid,verified:true,displayName:'Test '+uid}})};
const store={
  read(id){return Promise.resolve(profiles[id]||null);},
  create(id,record){
    if(profiles[id])return Promise.reject({code:'already-exists'});
    creates++;profiles[id]=JSON.parse(JSON.stringify(record));return Promise.resolve();
  },
  update(id,record){
    if(!profiles[id])return Promise.reject(Error('Missing'));
    updates++;profiles[id]=JSON.parse(JSON.stringify(record));return Promise.resolve();
  }
};
let clock=1793730000000;
const client=schema.create({auth:active,store,clock:()=>++clock});
(async()=>{
  const firstCreated=await client.ensureRegistered();
  assert.equal(firstCreated.alias,'Test alice');
  assert.equal(creates,1);
  assert.equal((await client.ensureRegistered()).alias,'Test alice');
  assert.equal(creates,1,'Repeated sign-in should reuse existing profile');
  profiles.alice.learned=57; // synthetic progress made on first device
  const adjusted=await client.updatePreferences('My nickname',false);
  assert.equal(adjusted.learned,57);
  assert.equal(adjusted.alias,'My nickname');
  assert.equal(creates,1);assert.equal(updates,1);
  uid='bob';
  const second=await client.ensureRegistered();
  assert.equal(creates,2);assert.equal(second.alias,'Test bob');
  assert.equal(second.publicStats,false);
  assert.equal(profiles.alice.alias,'My nickname');
  assert.equal(profiles.alice.learned,57);
  uid='alice';
  assert.equal((await client.read()).learned,57,'Return to an existing account');
  const invalid={...profiles.alice,accessToken:'forbidden'};
  profiles.alice=invalid;
  await assert.rejects(client.ensureRegistered(),/schema/);
  assert.equal(creates,2,'Do not rewrite unexpected existing records');
  profiles.alice=adjusted;
  uid='bob';
  const privateDefault=await client.read();
  assert.equal(privateDefault.publicStats,false);
  const strictAuth={getState:()=>({status:'unverified',
    user:{uid:'bob',verified:false,displayName:'Bob'}})};
  const denied=schema.create({auth:strictAuth,store,clock:()=>++clock});
  await assert.rejects(denied.ensureRegistered(),/Verified/);
  await assert.rejects(denied.read(),/Verified/);
  assert.equal(creates,2);
  console.log('PASS: new Google-user profiles private by default; repeat sign-in preserves aliases/progress; account isolation, unverified and corrupt records denied');
})().catch(e=>{console.error(e);process.exit(1)});
