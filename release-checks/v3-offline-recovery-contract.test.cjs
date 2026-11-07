'use strict';
// RUN-034: offline synthetic-only owner safety and event/restore contract.
// No Firebase SDK, network, production keys, real users, or writes.
const assert=require('node:assert/strict');
const core=require('../v3-sync-core.js');
const engine=require('../v3-sync-engine.js');
const uid='synthetic-owner';
const device='D_'+'1'.repeat(32);
const when=1793000000000;
const id=(digit)=>'E_'+String(digit).repeat(32);
const wordId='W_'+'c'.repeat(32);
const findData={list:'finds',added:true,topic:'study',note:''};
const finds=require('../v3-sync-finds.js');
const examples=[
  {id:'H00001',fi:'hoito',ru:'уход'},
  {id:'M00001',fi:'hoito',ru:'уход'},
  {id:'P00055',fi:'hoito',ru:'уход'},
  {id:'T00001',fi:'hoito',ru:'уход'},
  {id:'L00001',fi:'hoito',ru:'invalid'},
  {id:'T/../../admin',fi:'hoito',ru:'invalid'}
];
// finds matching hides unpersistable source IDs while retaining all valid classes.
assert.deepEqual(finds.matching(examples,'hoito').exact.map(x=>x.id).sort(),
  ['H00001','M00001','P00055','T00001']);
const pilot=engine.create({
  stagingOnly:true,uid,core,shadow:{},device,
  remote:{list:()=>Promise.resolve([]),put:()=>Promise.resolve()},
  activeUid:()=>uid,random:()=> 'a'.repeat(32)
});
// All published-term classes and private W IDs are valid in the
// UNDEPLOYED additive Rules candidate. Deployed TEST Rules need separate audit.
for(const term of ['T00001','M00001','P00055','H00001',wordId])
  assert.equal(core.valid(pilot.makeEvent('collection_set',term,findData,when)),true,
    'valid owner-only find '+term);
for(const term of ['L00001','T/../../admin','M001','S00001']){
  assert.throws(()=>pilot.makeEvent('collection_set',term,findData,when),
    /Invalid real term target\/date/,'invalid cloud find target '+term);
}
assert.throws(()=>pilot.makeEvent('word_delete',wordId,{deleted:true},when),
  /Invalid real term target\/date/,'no unreviewed word deletion');
const baseline=core.legacyBaseline({
  T00001:{correct:1,wrong:0,seen:1,learned:true,last:when-1000}
},[],{T00001:true});
const before=JSON.stringify(baseline);
const answer=core.event(id('1'),device,'answer','T00001',
  {correct:false,reviewLearned:true},when);
const result=core.fold(baseline,[answer,answer]);
assert.equal(result.applied,1);
assert.equal(result.duplicates,1);
assert.equal(result.invalid,0);
assert.deepEqual([result.state.scores.T00001.seen,
  result.state.scores.T00001.correct,result.state.scores.T00001.wrong],[2,1,1]);
assert.equal(result.state.scores.T00001.learned,false);
assert.equal(JSON.stringify(baseline),before,'fold cannot mutate legacy baseline');
const invalid=Object.assign({},answer,{id:'../bad'});
const safe=core.fold(baseline,[invalid,answer,answer]);
assert.equal(safe.applied,1);assert.equal(safe.invalid,1);assert.equal(safe.duplicates,1);
assert.equal(core.nextQueue([answer],[answer.id]).length,0);
assert.equal(core.mergeQueues([answer],[answer]).length,1,'duplicate queue entries forbidden');
const word1=core.event(id('2'),device,'word_upsert',wordId,
  {id:wordId,fi:'terve',ru:'здоровый',en:'healthy'},when);
const word2=core.event(id('3'),device,'word_upsert',wordId,
  {id:wordId,fi:'terve',ru:'другое значение',en:'healthy'},when+1);
assert.throws(()=>core.fold(core.legacyBaseline(),[word1,word2]),
  /Conflicting definitions/,'do not overwrite another device translation silently');
const backup={
  schemaVersion:1,uid,snapshotId:'synthetic-dated-001',createdAt:when+10000,
  snapshot:{scores:baseline.scores,words:baseline.words,favorites:baseline.favorites}
};
assert.equal(core.restorePreview(baseline,backup,'other-owner').ok,false,
  'cross-UID restore must be refused');
const preview=core.restorePreview(baseline,backup,uid);
assert.equal(preview.ok,true);
assert.equal(preview.dryRun,true);
assert.equal(JSON.stringify(baseline),before);
const missing=Object.assign({},backup,{snapshot:{scores:{},words:{}}});
assert.equal(core.restorePreview(baseline,missing,uid).ok,false,
  'incomplete backup cannot restore');
const manifest=core.snapshotManifest(uid,'snapshot-dated-001',when,baseline,[answer]);
assert.equal(manifest.complete,false,'backup planned does not equal uploaded');
assert.equal(manifest.restoreTested,false,'preview does not equal verified live restore');
assert.equal(manifest.eventCount,1);
// Rules candidates MUST stay in lockstep. The emulator alone is insufficient
// if the owner-facing UNDEPLOYED production fragment diverges or is malformed.
const fs=require('node:fs');
const prepared=fs.readFileSync('release-checks/firestore-v3-production-additive.rules.txt','utf8');
const emulated=fs.readFileSync('release-checks/firestore-v3-prod-emulator.rules','utf8');
function ownerFindsClause(s){
  assert.equal(s.split('function v3ReleasePayload').length-1,1,
    'Duplicate or missing payload function');
  assert.equal(s.split('function v3ReleaseEvent').length-1,1,
    'Duplicate or missing event function');
  const start=s.indexOf("(k == 'collection_set'");
  assert.ok(start>=0,'collection_set Rules missing');
  const end=s.indexOf("d.note.size() <= 350)",start);
  assert.ok(end>start,'collection_set clause truncated');
  return s.slice(start,end+("d.note.size() <= 350)").length).replace(/\s+/g,'');
}
const ownerFragment=ownerFindsClause(prepared),ownerFixture=ownerFindsClause(emulated);
assert.equal(ownerFragment,ownerFixture,'Prepared Rules differ from emulator fixture');
assert.ok(ownerFragment.includes("^[TMPH][0-9]{5,7}$"),'All public term classes must match');
assert.ok(ownerFragment.includes("^W_[a-f0-9]{32}$"),'Private word IDs must match');

console.log('PASS RUN-034 synthetic sync/UID/dedup/word-conflict/restore preview contract; NO live backup');
