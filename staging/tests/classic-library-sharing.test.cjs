/* Staging classic — no remote server. Library export/import is data-only and
 * opt-in. This test uses two separate synthetic devices to prevent accidental
 * "same-browser" false positives. All JS and tests are offline.
 */
'use strict';
const assert=require('assert');
const fs=require('fs'),path=require('path'),acorn=require('acorn');
const source=fs.readFileSync(path.join(__dirname,'../classic/rs-library-model.js'),'utf8');
acorn.parse(source,{ecmaVersion:5});
const Factory=require('../classic/rs-library-model.js');
function storage(){
 const store={};
 return {getItem:k=>Object.prototype.hasOwnProperty.call(store,k)?store[k]:null,
   setItem:(k,v)=>{store[k]=String(v);},snapshot:()=>JSON.parse(JSON.stringify(store))};
}
const name='rs_v3_classic_synthetic_only__rs_libraries_v1';
const id='lib_synthetic_library_12345';
const storageA=storage(),storageB=storage();
const a=Factory.create({storage:storageA,key:name,newId:()=>id});
const b=Factory.create({storage:storageB,key:name,newId:()=>id});
assert.equal(a.list().length,2,'Two fictional libraries should be visible');
assert.equal(a.subscriptions().length,0,'Do not pre-subscribe anyone');
assert.equal(a.subscribedTerms().length,0,'Opt-in means zero terms by default');
assert.ok(a.get('lib_demo_anatomy_2026').terms.length>0);
assert.equal(a.subscribe('lib_demo_anatomy_2026',true),true);
assert.equal(a.subscribedTerms().length,3);
assert.ok(a.subscribedTerms().every(x=>x.id.indexOf('shared_lib_demo_')===0));
assert.equal(a.subscribe('lib_demo_anatomy_2026',true),true,'Repeated join must be idempotent');
assert.equal(a.subscriptions().length,1);
assert.equal(a.subscribe('lib_demo_anatomy_2026',false),false);
assert.equal(a.subscribedTerms().length,0);
const own=[{id:'L_owner',fi:'kuntoutussuunnitelma',
 ru:'план реабилитации',en:'rehabilitation plan',
 cat:'Hoitotyö',seen:22,correct:21,score:{learned:true},email:'private@example.invalid'}];
const created=a.create('Oma hoiva','Hoitotyö',own);
assert.equal(created.source,'mine');
assert.equal(created.terms[0].fi,'kuntoutussuunnitelma');
assert.ok(!('email' in created.terms[0])&&!('score' in created.terms[0]));
assert.throws(()=>a.subscribe(id,true),/Cannot subscribe/,'No duplicate own word scores');
const json=a.exportJSON(id);
assert.ok(json.includes('sanastoyhteiso-v3-public-library'));
assert.ok(!json.includes('private@example.invalid'));
assert.ok(!json.includes('scores')&&!json.includes('seen')&&!json.includes('correct'));
assert.ok(!json.includes('L_owner')&&!json.includes('learned'));
assert.equal(storageB.getItem(name),null,'Separate device must not have received any data automatically');
const imported=b.importJSON(json);
assert.equal(imported.already,false);
assert.equal(imported.library.id,id);
assert.equal(b.importJSON(json).already,true,'Repeat import is idempotent');
assert.equal(b.subscribedTerms().length,0,'Import never auto-subscribes');
b.subscribe(id,true);
assert.equal(b.subscribedTerms().length,1);
assert.equal(b.subscribedTerms()[0].fi,'kuntoutussuunnitelma');
assert.notEqual(b.subscribedTerms()[0].id,own[0].id,'No shared learning ID collisions');
assert.deepEqual(a.subscriptions(),[],'Subscription must not affect another device');
const payload=JSON.parse(json);
assert.throws(()=>b.importJSON(JSON.stringify({...payload,title:'Malicious replacement'})),/conflict/);
assert.equal(b.get(id).title,'Oma hoiva','Never silently replace subscriber collection');
assert.throws(()=>b.importJSON(JSON.stringify({...payload,uid:'sensitive'})),/metadata/);
assert.throws(()=>b.importJSON(JSON.stringify({...payload,terms:[{...payload.terms[0],scores:{}}]})),/Private|unsupported/);
assert.throws(()=>b.importJSON(JSON.stringify({...payload,version:999})),/format/);
assert.throws(()=>b.importJSON(JSON.stringify({...payload,terms:[{fi:'a',ru:'т'}]})),/Invalid/);
assert.throws(()=>b.importJSON(JSON.stringify({...payload,id:'__proto__'})),/ID/);
assert.throws(()=>b.importJSON('not valid JSON'),/Invalid shared/);
const badId={...payload,id:'lib_other_good_12345',
 terms:[{fi:'<img src=x onerror=alert(1)>',ru:'тестовая надпись',cat:'Тема'}]};
assert.equal(b.importJSON(JSON.stringify(badId)).library.terms[0].fi,
 '<img src=x onerror=alert(1)>','Render layer must escape all imported text');
const before=storageB.snapshot();
const corrupt='{"version":1,"books":[{"id":"lib_bad_123456","title":"hi"}],"subscriptions":[]}';
storageB.setItem(name,corrupt);
assert.throws(()=>b.list(),/Invalid|Corrupt|needs/);
assert.throws(()=>b.subscribe(id,false),/Invalid|Corrupt|needs/);
assert.equal(storageB.getItem(name),corrupt,'Corrupted state must remain untouched, for recovery');
assert.ok(before[name].includes('kuntoutussuunnitelma'));
assert.throws(()=>Factory.create({storage:storage(),key:'rs_scores_v1'}),/isolated synthetic/);
console.log('PASS: isolated two-device library JSON exchange, optional subscriptions, score isolation, reject corrupt/conflicting/unsafe imports');
