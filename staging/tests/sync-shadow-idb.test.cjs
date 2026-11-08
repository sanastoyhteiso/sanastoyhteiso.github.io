/* Staging-only transactional IDB tests. Synthetic learners, no network.
 * fake-indexeddb simulates cross-tab IDB transactions (not real Safari proof).
 */
'use strict';
const assert=require('assert');
const {IDBFactory}=require('fake-indexeddb');
const Core=require('../rs-sync-core.js');
const Shadow=require('../rs-sync-shadow-idb.js');
const idb=new IDBFactory();
let active='alice',legacyWrites=0,remoteWrites=0;
const mk=()=>Shadow.create({indexedDB:idb,core:Core,
  activeUid:()=>active,enableStagingWrites:true,now:()=>1793700000000});
const tabA=mk(),tabB=mk();
const E=n=>'E_'+n.toString(16).padStart(32,'0');
const D1='D_'+'a'.repeat(32),D2='D_'+'b'.repeat(32);
const baseline={scores:{},words:{},favorites:{}};
for(let i=0;i<236;i++){
  const k='T'+String(i+1).padStart(5,'0');
  baseline.scores[k]={correct:i<138?1:0,wrong:1,seen:i<138?2:1,learned:i<138};
}
for(let i=0;i<150;i++){
  const id='custom-word-'+i;
  baseline.words[id]={id,fi:'Oma sana '+i,ru:'Личное слово '+i};
}
for(let i=0;i<70;i++)baseline.favorites['T'+String(i+1).padStart(5,'0')]=true;
function answer(n,good,device){
  return Core.event(E(n),device||D1,'answer','T00001',
    {correct:!!good},1793700000000+n);
}
function preview(state,ids){
  return {ok:true,readyToApply:false,state,
    includedPendingIds:ids};
}
async function run(){
  assert.throws(()=>Shadow.create({indexedDB:idb,core:Core,activeUid:()=>active}),
    /explicitly enabled/);
  await assert.rejects(()=>tabA.initialize('alice',baseline,'NO'),/not approved/);
  assert.equal(await tabA.read('alice'),null);
  let status=await tabA.initialize('alice',baseline,'VERIFIED_STAGING_SHADOW_ONLY');
  assert.equal(status.revision,0);
  assert.equal(status.scoreCount,236);
  assert.equal(status.wordCount,150);
  assert.equal((await tabA.read('alice')).state.favorites.T00001,true);
  await assert.rejects(()=>tabB.initialize('alice',baseline,'VERIFIED_STAGING_SHADOW_ONLY'),
    /must never be overwritten/);
  // Two browser tabs with same UID and same revision: exactly one transaction wins.
  const x=answer(1,true,D1),y=answer(2,false,D2);
  const raced=await Promise.allSettled([
    tabA.appendLocal('alice',x,0),
    tabB.appendLocal('alice',y,0)
  ]);
  assert.equal(raced.filter(r=>r.status==='fulfilled').length,1);
  assert.equal(raced.filter(r=>r.status==='rejected').length,1);
  assert.match(String(raced.find(r=>r.status==='rejected').reason),/revision conflict/);
  let record=await tabA.read('alice');
  assert.equal(record.revision,1);
  assert.equal(record.pending.length,1);
  assert.equal(record.state.scores.T00001.seen,3);
  const winner=record.pending[0];
  const loser=winner.id===x.id?y:x;
  status=await tabB.appendLocal('alice',loser,record.revision);
  assert.equal(status.revision,2);
  record=await tabA.read('alice');
  assert.equal(record.pending.length,2);
  assert.equal(record.state.scores.T00001.seen,4);
  assert.equal(record.state.scores.T00001.correct,2);
  assert.equal(record.state.scores.T00001.wrong,2);
  await assert.rejects(()=>tabA.appendLocal('alice',loser,2),/Duplicate shadow pending event ID/);
  assert.equal((await tabA.read('alice')).revision,2);
  assert.equal((await tabA.read('alice')).history.length,2);
  // A verified remote preview includes both pending IDs and a new phone event.
  const remote=answer(3,true,D2);
  const merged=Core.fold(baseline,[winner,loser,remote]).state;
  await assert.rejects(()=>tabA.stageCloud('alice',
    preview(merged,[winner.id]),2,'VERIFIED_READ_ONLY_PREVIEW_TO_SHADOW'),
    /does not include every local pending/);
  assert.equal((await tabA.read('alice')).revision,2);
  await assert.rejects(()=>tabA.stageCloud('alice',
    preview(merged,[winner.id,loser.id]),1,'VERIFIED_READ_ONLY_PREVIEW_TO_SHADOW'),
    /revision conflict/);
  const downgraded=JSON.parse(JSON.stringify(merged));
  downgraded.scores.T00001.correct=0;
  downgraded.scores.T00001.seen=downgraded.scores.T00001.wrong;
  await assert.rejects(()=>tabA.stageCloud('alice',
    preview(downgraded,[winner.id,loser.id]),2,'VERIFIED_READ_ONLY_PREVIEW_TO_SHADOW'),
    /would lose local answer counters/);
  // Real-world regression 2026-11-04: totals can increase while an old
  // learned term with one correct answer vanishes from the new snapshot.
  const vanishedLearned=JSON.parse(JSON.stringify(merged));
  assert.equal(vanishedLearned.scores.T00002.correct,1);
  delete vanishedLearned.scores.T00002;
  assert.ok(Object.keys(vanishedLearned.scores).length<
    Object.keys(merged.scores).length);
  await assert.rejects(()=>tabA.stageCloud('alice',
    preview(vanishedLearned,[winner.id,loser.id]),2,
    'VERIFIED_READ_ONLY_PREVIEW_TO_SHADOW'),
    /would lose local answer counters/);
  assert.equal((await tabA.read('alice')).revision,2,
    'missing old learned answer must never replace shadow state');
  const removedWord=JSON.parse(JSON.stringify(merged));
  delete removedWord.words['custom-word-0'];
  await assert.rejects(()=>tabA.stageCloud('alice',
    preview(removedWord,[winner.id,loser.id]),2,'VERIFIED_READ_ONLY_PREVIEW_TO_SHADOW'),
    /would remove a personal word/);
  await assert.rejects(()=>tabA.stageCloud('alice',
    preview(merged,[winner.id,loser.id]),2,'UNAPPROVED'),
    /not approved/);
  status=await tabA.stageCloud('alice',
    preview(merged,[winner.id,loser.id]),2,'VERIFIED_READ_ONLY_PREVIEW_TO_SHADOW');
  assert.equal(status.revision,3);
  record=await tabB.read('alice');
  assert.equal(record.state.scores.T00001.seen,5);
  assert.equal(record.pending.length,2,'cloud preview cannot silently ACK local events');
  assert.equal(Object.keys(record.state.words).length,150);
  assert.equal(record.history.length,2);
  assert.equal(record.history[1].revision,2);
  await assert.rejects(()=>tabB.stageCloud('alice',
    preview(merged,[winner.id,loser.id]),2,'VERIFIED_READ_ONLY_PREVIEW_TO_SHADOW'),
    /revision conflict/);
  // Partially confirmed uploads remove ONLY acknowledged IDs, never counters.
  await assert.rejects(()=>tabA.acknowledge('alice',[winner.id],3,'NO'),
    /not verified/);
  await assert.rejects(()=>tabA.acknowledge('alice',[E(999)],3,
    'VERIFIED_SERVER_EVENT_ACK_TO_SHADOW'),/does not match pending/);
  await assert.rejects(()=>tabA.acknowledge('alice',[winner.id,winner.id],3,
    'VERIFIED_SERVER_EVENT_ACK_TO_SHADOW'),/duplicate acknowledged/);
  assert.equal((await tabA.read('alice')).revision,3);
  status=await tabB.acknowledge('alice',[winner.id],3,
    'VERIFIED_SERVER_EVENT_ACK_TO_SHADOW');
  assert.equal(status.revision,4);
  assert.equal(status.pending,1);
  record=await tabA.read('alice');
  assert.equal(record.state.scores.T00001.seen,5);
  assert.equal(record.pending[0].id,loser.id);
  await assert.rejects(()=>tabA.acknowledge('alice',[loser.id],3,
    'VERIFIED_SERVER_EVENT_ACK_TO_SHADOW'),/revision conflict/);
  // Account isolation: changing active UID never exposes prior learner state.
  active='bob';
  await assert.rejects(()=>tabA.read('alice'),/account changed/);
  assert.equal(await tabA.read('bob'),null);
  const bob={scores:{},words:{},favorites:{}};
  await tabB.initialize('bob',bob,'VERIFIED_STAGING_SHADOW_ONLY');
  assert.equal((await tabB.read('bob')).uid,'bob');
  assert.equal((await tabB.read('bob')).pending.length,0);
  active='alice';
  assert.equal((await tabA.read('alice')).revision,4);
  assert.equal((await tabA.read('alice')).pending.length,1);
  assert.equal(legacyWrites,0);
  // Local personal notes survive a stale or partial cloud read.
  active='carol';
  await tabA.initialize('carol',{scores:{},words:{},favorites:{}},
    'VERIFIED_STAGING_SHADOW_ONLY');
  const selected=Core.event(E(98765),D1,'collection_set','T00014',
    {list:'finds',added:true,topic:'study',note:'Saved locally'},1793700987650);
  await tabA.appendLocal('carol',selected,0);
  const findState=(await tabA.read('carol')).state;
  assert.equal(findState.finds.T00014.note,'Saved locally');
  const missingFind=JSON.parse(JSON.stringify(findState));
  delete missingFind.finds.T00014;
  await assert.rejects(()=>tabA.stageCloud('carol',
    preview(missingFind,[selected.id]),1,'VERIFIED_READ_ONLY_PREVIEW_TO_SHADOW'),
    /would remove a saved personal selection/);
  const staleFind=JSON.parse(JSON.stringify(findState));
  staleFind.finds.T00014.updatedAt--;
  staleFind.finds.T00014.note='stale cloud note';
  await assert.rejects(()=>tabA.stageCloud('carol',
    preview(staleFind,[selected.id]),1,'VERIFIED_READ_ONLY_PREVIEW_TO_SHADOW'),
    /overwrite a newer personal selection/);
  const conflictFind=JSON.parse(JSON.stringify(findState));
  conflictFind.finds.T00014.note='changed with same timestamp';
  await assert.rejects(()=>tabA.stageCloud('carol',
    preview(conflictFind,[selected.id]),1,'VERIFIED_READ_ONLY_PREVIEW_TO_SHADOW'),
    /conflicting personal selection revision/);
  assert.equal((await tabA.read('carol')).revision,1);
  assert.equal((await tabA.read('carol')).state.finds.T00014.note,'Saved locally');
  active='alice';
  assert.equal(remoteWrites,0);
  console.log('PASS: atomic IndexedDB shadow transactions, tab conflict, 236 scores, 150 words, pending preservation, UID isolation');
}
run().catch(e=>{console.error(e);process.exit(1);});
