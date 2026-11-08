/* Staging only: verified baseline + cloud events into isolated IDB shadow.
 * The real app, Firestore and personal backups are not accessed.
 */
'use strict';
const assert=require('assert');
const {IDBFactory}=require('fake-indexeddb');
const crypto=require('crypto').webcrypto;
const Core=require('../rs-sync-core.js');
const Transport=require('../rs-firestore-transport.js');
const SHA=require('../rs-sha256.js');
const Reader=require('../rs-sync-cloud-read.js');
const Shadow=require('../rs-sync-shadow-idb.js');
const Coordinator=require('../rs-sync-shadow-reconcile.js');
const uid='mock-owner',device1='D_'+'a'.repeat(32),device2='D_'+'b'.repeat(32);
const E=n=>'E_'+n.toString(16).padStart(32,'0');
const base={scores:{T00001:{seen:1,correct:1,wrong:0,learned:true}},
  words:{'personal-1':{id:'personal-1',fi:'hoito',ru:'уход'}},
  favorites:{T00001:true}};
let active=uid,oldOff=true,online=true,mode='normal',releaseRemote,enteredRemote;
let baseDocument,remote=[
  Core.event(E(10),device2,'answer','T00001',{correct:false},1793700000000)
];
const tr={
  getBaseline:async who=>{
    assert.equal(who,uid);
    return mode==='missing'?null:baseDocument;
  },
  decodeDocument:Transport.decodeDocument,
  listEvents:async who=>{
    assert.equal(who,uid);
    if(mode==='paused')return new Promise(resolve=>{
      releaseRemote=resolve;enteredRemote();
    });
    return remote;
  }
};
const reader=Reader.create({core:Core,transport:tr,activeUid:()=>active,
  verifyHash:s=>SHA.digest(s,crypto)});
const shadow=Shadow.create({indexedDB:new IDBFactory(),core:Core,
  activeUid:()=>active,enableStagingWrites:true,now:()=>1793700000000});
const coordinator=Coordinator.create({shadow,cloudReader:reader,
  activeUid:()=>active,legacySyncDisabled:()=>oldOff,
  online:()=>online,shadowOnly:true});
async function run(){
  const sha=await SHA.digest(base,crypto);
  baseDocument=Transport.baselineDocument(uid,{
    migrationId:'M_mock',createdAt:1793700000000,sha256:sha,snapshot:base});
  await shadow.initialize(uid,base,'VERIFIED_STAGING_SHADOW_ONLY');
  const local=Core.event(E(11),device1,'answer','T00001',
    {correct:true},1793700000020);
  const afterLocal=await shadow.appendLocal(uid,local,0);
  assert.equal(afterLocal.revision,1);
  await assert.rejects(()=>coordinator.run(uid,'NOT_APPROVED'),/not authorized/);
  let result=await coordinator.run(uid,'VERIFIED_STAGING_RECONCILIATION_ONLY');
  assert.equal(result.ok,true);
  assert.equal(result.shadowOnly,true);
  assert.equal(result.pending,1);
  let state=await shadow.read(uid);
  assert.equal(state.state.scores.T00001.seen,3);
  assert.equal(state.state.scores.T00001.correct,2);
  assert.equal(state.state.scores.T00001.wrong,1);
  assert.equal(state.state.words['personal-1'].fi,'hoito');
  assert.equal(state.pending[0].id,local.id);
  const before=state.state.scores.T00001.seen;
  result=await coordinator.run(uid,'VERIFIED_STAGING_RECONCILIATION_ONLY');
  state=await shadow.read(uid);
  assert.equal(state.state.scores.T00001.seen,before,'repeat cloud GET must not double count');
  assert.equal(state.pending.length,1,'preview must not ACK a pending answer');
  // Race: a new local answer occurs after cloud read but before shadow commit.
  let listStarted=new Promise(resolve=>{enteredRemote=resolve;});
  mode='paused';
  const inFlight=coordinator.run(uid,'VERIFIED_STAGING_RECONCILIATION_ONLY');
  await listStarted;
  const revisionBefore=(await shadow.read(uid)).revision;
  await shadow.appendLocal(uid,Core.event(E(12),device1,'answer','T00001',
    {correct:false},1793700000030),revisionBefore);
  releaseRemote(remote);
  await assert.rejects(()=>inFlight,/revision conflict/);
  state=await shadow.read(uid);
  assert.equal(state.pending.length,2);
  assert.equal(state.state.scores.T00001.seen,4);
  // User switches while a GET is in flight: no shadow write for other UID.
  listStarted=new Promise(resolve=>{enteredRemote=resolve;});
  const logoutFlight=coordinator.run(uid,'VERIFIED_STAGING_RECONCILIATION_ONLY');
  await listStarted;active='other';
  releaseRemote(remote);
  await assert.rejects(()=>logoutFlight,/Account changed|Owner account changed/);
  active=uid;
  mode='missing';
  const revisionAtError=(await shadow.read(uid)).revision;
  await assert.rejects(()=>coordinator.run(uid,'VERIFIED_STAGING_RECONCILIATION_ONLY'),
    /baseline is missing/);
  assert.equal((await shadow.read(uid)).revision,revisionAtError);
  mode='normal';online=false;
  await assert.rejects(()=>coordinator.run(uid,'VERIFIED_STAGING_RECONCILIATION_ONLY'),
    /Offline/);
  online=true;oldOff=false;
  await assert.rejects(()=>coordinator.run(uid,'VERIFIED_STAGING_RECONCILIATION_ONLY'),
    /migration gate changed/);
  assert.equal((await shadow.read(uid)).pending.length,2);
  console.log('PASS: verified cloud-to-shadow transaction, offline double-count safety, concurrent answer/logout');
}
run().catch(e=>{console.error(e);process.exit(1);});
