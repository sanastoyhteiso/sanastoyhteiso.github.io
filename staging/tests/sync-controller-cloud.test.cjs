/* Staging only: no network, no Firebase writes, no personal data.
 * Test controller's read-only cloud preview and fail-closed race checks.
 */
'use strict';
const assert=require('assert');
const Core=require('../rs-sync-core.js');
const Journal=require('../rs-sync-journal.js');
const Controller=require('../rs-sync-controller.js');
const E=n=>'E_'+n.toString(16).padStart(32,'0');
const device='D_'+'c'.repeat(32);
const baseline={scores:{T00001:{correct:1,wrong:0,seen:1,learned:true,last:1}},
  words:[],favorites:{}};
const store={},storage={writes:0,getItem:k=>store[k]||null,
  setItem:(k,v)=>{storage.writes++;store[k]=v;}};
let active='owner',oldSyncOff=true,online=true,visible=true,local=JSON.parse(JSON.stringify(baseline));
let calls=0,loader=null,timerFns=[],now=100000;
let newIdN=4;
const journal=Journal.create({core:Core,storage,uid:'owner',device,
  newId:()=>E(++newIdN),now:()=>++now,legacySyncDisabled:()=>oldSyncOff});
const cloudEvent=Core.event(E(9),'D_'+'d'.repeat(32),'answer','T00001',{correct:false},110000);
const cloudState=Core.fold(Journal.snapshot(baseline),[cloudEvent]).state;
function response(pending){
  return {ok:true,readyToApply:false,cloudEvents:1,localPending:pending.length,state:cloudState};
}
const cloudReader={load:(uid,pending)=>{
  calls++;assert.equal(uid,'owner');
  return loader?loader(pending):Promise.resolve(response(pending));
}};
const controller=Controller.create({uid:'owner',journal,
  transport:{putEvents:()=>Promise.resolve([])},cloudReader,
  normalizeSnapshot:Journal.snapshot,activeUid:()=>active,
  legacySyncDisabled:()=>oldSyncOff,getSnapshot:()=>local,
  online:()=>online,visible:()=>visible,subscribe:()=>()=>{},
  delay:fn=>{timerFns.push(fn);return timerFns.length;},clear:()=>{},
  now:()=>++now});
function deferred(){
  let release;
  const promise=new Promise(resolve=>{release=resolve;});
  return {promise,release};
}
async function run(){
  assert.throws(()=>controller.start(),/migration/);
  journal.activate(local,'VERIFIED_BASELINE_AND_LEGACY_SYNC_DISABLED');
  controller.start();
  const startWrites=storage.writes;
  let result=await controller.checkRemote();
  assert.equal(result.ok,true);
  assert.equal(result.readyToApply,false);
  assert.equal(result.needsReview,true);
  assert.equal(result.previewState.scores.T00001.wrong,1);
  assert.equal(storage.writes,startWrites,'preview must never persist anything');
  assert.equal(journal.status().pending,0);
  assert.equal(controller.status().remote.events,1);
  const firstCalls=calls;
  local.scores.T00001.correct=2;
  local.scores.T00001.seen=2; // local UI changed before capture
  result=await controller.checkRemote();
  assert.equal(result.ok,false);
  assert.equal(calls,firstCalls,'uncaptured local changes must block cloud fetch');
  assert.equal(storage.writes,startWrites);
  assert.equal(controller.capture().created,1);
  assert.equal(journal.status().pending,1);
  assert.equal(storage.writes,startWrites+1);
  let hold=deferred();loader=()=>hold.promise;
  const inFlight=controller.checkRemote();
  await Promise.resolve();
  local.favorites.T00001=true;
  assert.equal(controller.capture().created,1);
  hold.release(response([]));
  result=await inFlight;
  assert.equal(result.ok,false,'new answer/change during cloud read must discard stale preview');
  assert.equal(journal.status().pending,2,'both local events must survive');
  assert.equal(controller.status().remote.lastError.length>0,true);
  // An ACK during remote read also invalidates the captured journal generation.
  hold=deferred();loader=()=>hold.promise;
  const afterAck=controller.checkRemote();
  await Promise.resolve();
  journal.acknowledge([E(5)]);
  hold.release(response([]));
  assert.equal((await afterAck).ok,false);
  assert.equal(journal.status().pending,1);
  // Logout, lost connectivity and controller stop always invalidate in-flight reads.
  hold=deferred();loader=()=>hold.promise;
  const duringLogout=controller.checkRemote();
  await Promise.resolve();active='other';
  hold.release(response([]));
  assert.equal((await duringLogout).ok,false);
  active='owner';
  online=false;
  assert.equal((await controller.checkRemote()).skipped,true);
  online=true;
  hold=deferred();loader=()=>hold.promise;
  const duringStop=controller.checkRemote();
  await Promise.resolve();controller.stop();
  hold.release(response([]));
  assert.equal((await duringStop).ok,false);
  assert.equal(journal.status().pending,1);
  assert.equal(controller.status().enabled,false);
  // Default is strictly manual: no cloud reads from start() or UI events.
  assert.equal(calls,5);
  assert.equal(timerFns.length>0,true,'local pending queue schedules upload only');
  // Never silently turn Drive sync off or write Firestore.
  assert.equal(oldSyncOff,true);
  console.log('PASS: guarded read-only two-device preview, no writes, pending/ACK/logout/stop races');
}
run().catch(e=>{console.error(e);process.exit(1);});
