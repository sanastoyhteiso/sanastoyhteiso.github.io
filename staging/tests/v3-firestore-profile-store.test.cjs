/* Synthetic SDK test of isolated transactional profile adapter.
 * No Firebase network calls, credentials, real users or site modifications.
 */
'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path');
const acorn=require('acorn');
const guard=require('../backend/v3-staging-project-guard.js');
const profiles=require('../backend/rs-v3-profile-contract.js');
const storeFactory=require('../backend/rs-v3-firestore-profile-store.js');
const source=fs.readFileSync(path.join(__dirname,'../backend/rs-v3-firestore-profile-store.js'),'utf8');
acorn.parse(source,{ecmaVersion:5});
const ID='sanastoyhteiso-v3-development';
const config={projectId:ID,authDomain:ID+'.firebaseapp.com',
 apiKey:'AIza'+'A'.repeat(35)};
const opts=()=>({
 guard,config,expectedProjectId:ID,
 productionProjectId:'riveria-sanasto-community-test',
 site:{origin:'https://velardream-ctrl.github.io',
  pathname:'/riveria-sanasto-community-test/v3-classic/auth-pilot/'},
 profiles
});
function fake(){
 const docs={},calls={firestore:0,transactions:0,reads:0,writes:0},listeners={};
 let currentUser={uid:'alice',verified:true},rev=1;
 const auth={getState:()=>({
   status:currentUser.verified?'verified':'unverified',user:currentUser,
   revision:rev,projectId:ID})};
 const same=x=>JSON.parse(JSON.stringify(x));
 const firestore={
  collection(name){
   if(name!=='users')throw Error('Wrong collection '+name);
   return {doc(uid){return {
     uid,
     get(){calls.reads++;return Promise.resolve({
       exists:Object.prototype.hasOwnProperty.call(docs,uid),
       data(){return same(docs[uid]);}
     });}
   };}};
  },
  runTransaction(fn){
   calls.transactions++;
   const staged=[];
   const tx={
    get(ref){return firestore.collection('users').doc(ref.uid).get();},
    set(ref,record){staged.push({uid:ref.uid,record:same(record),op:'set'});},
    update(ref,record){staged.push({uid:ref.uid,record:same(record),op:'update'});}
   };
   return Promise.resolve().then(()=>fn(tx)).then(()=>{
     staged.forEach(entry=>{
       calls.writes++;
       docs[entry.uid]=entry.record;
     });
   });
  }
 };
 const app={name:'sanastoyhteiso-v3-staging-auth',
  options:{projectId:ID,apiKey:config.apiKey}};
 const sdk={apps:[app],firestore(appGot){
    assert.strictEqual(appGot,app,'Must reuse EXACT guarded Auth SDK app');
    calls.firestore++;return firestore;
 }};
 return {docs,calls,sdk,auth,changeUser(uid,verified=true){
   currentUser={uid,verified};rev++;
 },bump(uid,learned){
   docs[uid].learned=learned;docs[uid].updatedAt++;
 },inject(uid,data){docs[uid]=data;}};
}
(async()=>{
 const f=fake();
 const wrong=opts();wrong.config={...config,projectId:'riveria-sanasto-community-test'};
 assert.throws(()=>storeFactory.create({...wrong,auth:f.auth,sdk:f.sdk}),/project|Firebase|staging/i);
 assert.equal(f.calls.firestore,0,'Never call Firestore SDK if the project guard rejects');
 const store=storeFactory.create({...opts(),auth:f.auth,sdk:f.sdk});
 assert.equal(store.projectId,ID);
 assert.equal(await store.read('alice'),null);
 const initial=profiles.initial('Alice',1793740000000);
 await store.create('alice',initial);
 assert.equal(f.docs.alice.alias,'Alice');
 assert.equal(f.docs.alice.publicStats,false);
 assert.equal(f.docs.alice.learned,0);
 assert.equal(await store.read('alice').then(r=>r.alias),'Alice');
 await assert.rejects(store.create('alice',profiles.initial('Replaced',1793740000001)),/already exists/);
 assert.equal(f.docs.alice.alias,'Alice','Never replace registered profile');
 await assert.rejects(store.create('alice',{...initial,email:'private@example.invalid'}),/Invalid profile/);
 await assert.rejects(store.read('bob'),/Account changed/);
 await assert.rejects(store.update('bob',initial),/Account changed/);
 const edited=profiles.edit(initial,'Alice new nickname',true,1793740000002);
 await store.update('alice',edited);
 assert.equal(f.docs.alice.alias,'Alice new nickname');
 assert.equal(f.docs.alice.publicStats,true);
 assert.equal(f.docs.alice.learned,0);
 f.bump('alice',19);
 const stale=profiles.edit(edited,'Outdated session edit',false,1793740000003);
 await assert.rejects(store.update('alice',stale),/Concurrent learning/);
 assert.equal(f.docs.alice.learned,19);
 assert.equal(f.docs.alice.alias,'Alice new nickname');
 const refreshed=await store.read('alice');
 const next=profiles.edit(refreshed,'Alice refreshed',false,refreshed.updatedAt+1);
 await store.update('alice',next);
 assert.equal(f.docs.alice.learned,19,'Updating alias cannot reset progress');
 f.changeUser('bob');
 assert.equal(await store.read('bob'),null);
 await assert.rejects(store.read('alice'),/Account changed/);
 await store.create('bob',profiles.initial('Bob',1793740000100));
 assert.equal(f.docs.alice.learned,19);
 assert.equal(f.docs.bob.learned,0);
 f.changeUser('alice');
 assert.equal((await store.read('alice')).alias,'Alice refreshed','Account switching preserves profile');
 f.inject('alice',{alias:'Unsafe',learned:1,privateWords:['secret']});
 await assert.rejects(store.read('alice'),/Invalid existing/);
 await assert.rejects(store.create('alice',initial),/already exists/);
 assert.ok(f.docs.alice.privateWords[0]==='secret','Never overwrite corrupt existing profile');
 f.changeUser('unverified',false);
 const lastTransactions=f.calls.transactions;
 await assert.rejects(store.create('unverified',initial),/Account changed/);
 assert.equal(f.calls.transactions,lastTransactions,'Unverified must not reach transaction');
 const impostor=fake();
 impostor.sdk.apps[0].options.projectId='riveria-sanasto-community-test';
 assert.throws(()=>storeFactory.create({...opts(),auth:impostor.auth,sdk:impostor.sdk}),
   /Matching isolated/);
 assert.equal(impostor.calls.firestore,0,'Wrong Auth SDK app must be rejected');
 console.log('PASS: isolated v3 Firestore profile transaction adapter; repeat login, stale updates, private counts, account switching and wrong project');
})().catch(e=>{console.error(e);process.exit(1)});
