/* Offline integration tests: no Firebase credentials or network required.
 * Run: node staging/tests/sync-integration.test.js
 */
'use strict';
const assert=require('assert');
const C=require('../rs-sync-core.js');
const J=require('../rs-sync-journal.js');
const T=require('../rs-firestore-transport.js');
const Controller=require('../rs-sync-controller.js');
const Audit=require('../rs-legacy-audit.js');
const IDs=require('../rs-event-ids.js');
const baseline={scores:{T00001:{correct:1,wrong:0,seen:1,learned:true}},
  words:[],favorites:{}};
const docs={},events={};
let active='testowner',requests=0,disconnected=false;
const request=async(method,url,body,token)=>{
  requests++;if(disconnected)throw Error('network unavailable');
  const location=url.split('?')[0],id=url.indexOf('documentId=')>=0?url.split('documentId=')[1]:location.split('/').pop();
  if(method==='PATCH'){if(docs[location])return {status:412};docs[location]=body;return{status:200,body};}
  if(method==='POST'){if(events[id])return{status:409};events[id]=body;return{status:201,body};}
  const value=events[id]||docs[location];return {status:value?200:404,body:value||null};
};
const transport=T.create({projectId:'demo-test',activeUid:()=>active,
  getToken:async()=>('token-never-persisted'),request});
const json={};const storage={getItem:k=>json[k]||null,setItem:(k,v)=>{json[k]=v;}};
let n=0,oldDriveOff=true,online=false,current=baseline;
const journal=J.create({core:C,storage,uid:'testowner',device:'device_mac',
  newId:()=>('E_'+(++n)),now:()=>1793650000000,legacySyncDisabled:()=>oldDriveOff});
const listeners={};
const controller=Controller.create({journal,transport,uid:'testowner',
  activeUid:()=>active,legacySyncDisabled:()=>oldDriveOff,
  online:()=>online,visible:()=>true,getSnapshot:()=>current,
  subscribe:(ev,cb)=>{listeners[ev]=cb;return()=>{delete listeners[ev];}},
  delay:()=>777,clear:()=>{}});
async function run(){
  assert.equal(journal.initialize(current).phase,'migration_required');
  assert.throws(()=>controller.start(),/migration/);
  assert.throws(()=>journal.activate(current,'invalid'));
  const migration={migrationId:'M_demo',createdAt:1793650000000,
    sha256:'a'.repeat(64),snapshot:J.snapshot(current)};
  await assert.rejects(()=>transport.putBaseline('testowner',migration,'unapproved'));
  assert.equal((await transport.putBaseline('testowner',migration,'VERIFIED_PERSONAL_JSON_AND_SHEET')).saved,true);
  assert.equal((await transport.putBaseline('testowner',migration,'VERIFIED_PERSONAL_JSON_AND_SHEET')).alreadyExisted,true);
  await assert.rejects(()=>transport.putBaseline('testowner',{...migration,sha256:'b'.repeat(64)},'VERIFIED_PERSONAL_JSON_AND_SHEET'));
  journal.activate(current,'VERIFIED_BASELINE_AND_LEGACY_SYNC_DISABLED');
  controller.start();
  current={scores:{T00001:{correct:2,wrong:0,seen:2,learned:true}},
    words:[],favorites:{T00001:true}};
  const captured=controller.capture();
  assert.equal(captured.created,2);
  assert.equal(journal.status().pending,2);
  assert.equal(await controller.flush(),false); // offline, no data lost
  online=true;disconnected=true;
  assert.equal(await controller.flush(),false);
  assert.equal(journal.status().pending,2);
  disconnected=false;
  assert.equal(await controller.flush(),true);
  assert.equal(journal.status().pending,0);
  assert.equal(Object.keys(events).length,2);
  assert.equal(controller.capture().created,0); // reopen/re-read no duplicate
  // Independently generated events from a second device accumulate by event ID.
  const phone=C.event('E_phone','device_iphone','answer','T00001',{correct:false},1793650001000);
  assert.deepEqual(await transport.putEvents('testowner',[phone]),['E_phone']);
  assert.deepEqual(await transport.putEvents('testowner',[phone]),['E_phone']); // idempotent retry
  const all=[C.event('E_1','device_mac','answer','T00001',{correct:true},1793650000000),
    C.event('E_2','device_mac','favorite_set','T00001',{starred:true},1793650000000),phone];
  const state=C.fold(C.legacyBaseline(baseline.scores,baseline.words,baseline.favorites),all);
  assert.equal(state.state.scores.T00001.seen,3);
  assert.equal(state.state.scores.T00001.correct,2);
  assert.equal(state.state.scores.T00001.wrong,1);
  assert.equal(state.duplicates,0);
  const legacyRows=[
    ['L1','100','D1','score','T00001','{"correct":1,"wrong":0,"seen":1,"last":100}'],
    ['L2','101','D1','scope','scope','{"value":"all","updatedAt":101}']];
  const report=Audit.audit(legacyRows);
  assert.equal(report.ok,true);assert.equal(report.totals.learned,1);
  active='another-account';
  assert.equal(await controller.flush(),false);
  await assert.rejects(()=>transport.putEvents('testowner',[phone]));
  active='testowner';oldDriveOff=false;
  assert.equal(controller.capture(),false); // migration safety gate
  assert.equal(journal.status().pending,0);
  oldDriveOff=true;
  assert.throws(()=>journal.capture({scores:{T00001:{correct:0,wrong:0,seen:0}},
    words:[],favorites:{}}),/divergence/);
  controller.stop();
  const crypto={getRandomValues:a=>{for(let i=0;i<a.length;i++)a[i]=i;return a;}};
  assert.equal(IDs.create({crypto}).next().length,34);
  console.log('PASS: baseline, offline, retry, different devices, account isolation, no double count');
}
run().catch(e=>{console.error(e);process.exit(1);});
