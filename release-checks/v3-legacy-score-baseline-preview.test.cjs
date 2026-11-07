'use strict';
/* RUN137: counter baseline SHAPE preview with invented identifiers and values only. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {SCOPE,preview}=require('../backup-v3/legacy-score-baseline-preview.cjs');
function row(n,counters,term='0001'){
  return {eventId:'synthetic_event_'+String(n).padStart(4,'0'),
    targetId:'synthetic_target_'+term,kind:'score',eventTime:1762078200000+n,counters};
}
const count=(correct,wrong,learned)=>({
  correct,wrong,seen:correct+wrong,last:1762078200000,learned,learnedUpdatedAt:1762078200000
});
const input=(rows)=>({scope:SCOPE,syntheticOwner:'synthetic_owner_0001',rows});
test('synthetic cumulative snapshots are shape-checked, NOT replayed as answers',()=>{
  const a=input([row(1,count(1,0,true)),row(2,count(2,1,true))]);
  const before=JSON.stringify(a),v=preview(a);
  assert.equal(v.classification,'SYNTHETIC_COUNTER_SHAPE_ONLY');
  assert.equal(v.inspectedSyntheticEvents,2);
  assert.equal(v.inspectedSyntheticTargets,1);
  assert.equal(v.ambiguousLearnedTargets,0);
  assert.equal(v.syntheticCandidateCount,1);
  assert.deepEqual(v.baselineDocuments,[]);
  assert.deepEqual(v.v3Events,[]);
  assert.equal(v.automaticMigrationAllowed,false);
  assert.equal(v.realFirestoreRestoreVerified,false);
  assert.equal(JSON.stringify(a),before);
});
test('manual learned=false after earlier correct answers remains explicit',()=>{
  const v=preview(input([row(1,count(3,1,false))]));
  assert.equal(v.ambiguousLearnedTargets,0);
  assert.equal(v.classification,'SYNTHETIC_COUNTER_SHAPE_ONLY');
  assert.equal(v.automaticMigrationAllowed,false);
});
test('missing or conflicting learned state is quarantined, never inferred',()=>{
  const a=count(3,1,true);delete a.learned;
  const v=preview(input([row(1,a)]));
  assert.equal(v.classification,'LEARNED_STATE_UNPROVEN');
  assert.equal(v.ambiguousLearnedTargets,1);
  const w=preview(input([row(1,count(1,0,true)),row(2,count(2,0,false))]));
  assert.equal(w.ambiguousLearnedTargets,1);
  assert.equal(w.syntheticCandidateCount,0);
});
test('nonadditive cross-device maxima and inconsistent counters fail closed',()=>{
  const a=count(1,0,true);a.seen=2;
  assert.throws(()=>preview(input([row(1,a)])),/INVALID_SYNTHETIC_COUNTERS/);
  const b=input([row(1,count(2,0,true)),row(2,count(1,1,true))]);
  assert.throws(()=>preview(b),/COUNTER_MERGE_CONFLICT/);
});
test('reject non-synthetic IDs, scopes, unknown keys, malformed and duplicate events',()=>{
  const r=count(0,0,false);
  const a=input([row(1,r)]);a.syntheticOwner='real_uid';
  assert.throws(()=>preview(a),/SYNTHETIC_FIXTURE_REQUIRED/);
  const b=input([row(1,r)]);b.rows[0].targetId='T00001';
  assert.throws(()=>preview(b),/INVALID_SYNTHETIC_SCORE/);
  const c=input([row(1,r)]);c.rows[0].kind='scope';
  assert.throws(()=>preview(c),/INVALID_SYNTHETIC_SCORE/);
  const d=input([row(1,r)]);d.rows[0].counters.__proto__={x:1};
  // "__proto__" setter mutates the object prototype and must be rejected.
  assert.throws(()=>preview(d),/INVALID_SYNTHETIC_SCORE/);
  const e=input([row(1,r),row(1,r)]);
  assert.throws(()=>preview(e),/DUPLICATE_SYNTHETIC_EVENT/);
  const f=input([row(1,{...r,privateField:'secret'})]);
  assert.throws(()=>preview(f),/INVALID_SYNTHETIC_COUNTERS/);
  const g=input([]);
  assert.throws(()=>preview(g),/SYNTHETIC_FIXTURE_REQUIRED/);
});
test('offline code makes no external I/O, writes or hidden learned inferences',()=>{
  const src=fs.readFileSync(path.join(__dirname,'../backup-v3/legacy-score-baseline-preview.cjs'),'utf8');
  for(const re of [/require\(['"](?:firebase|googleapis|https?|@google|fs|child_process)/,
      /fetch\s*\(/, /XMLHttpRequest/, /process\.env/,
      /writeFileSync\s*\(/, /setCustomUserClaims\s*\(/,
      /\.collection\s*\(/, /\.doc\s*\(/])
    assert.equal(re.test(src),false,String(re));
  assert.ok(src.includes("classification:ambiguous?'LEARNED_STATE_UNPROVEN'"));
  assert.ok(src.includes('automaticMigrationAllowed:false'));
});
