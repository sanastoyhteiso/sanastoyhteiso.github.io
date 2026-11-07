'use strict';
/* RUN-135: fake legacy events only. Never read or embed real owner backup rows. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {SCOPE,KINDS,quarantine}=require('../backup-v3/legacy-event-quarantine.cjs');
const make=(kind,n=1)=>[
  'synthetic_event_'+String(n).padStart(4,'0'),
  '2026-11-02T10:11:12Z','synthetic_device_0001',
  kind,'synthetic_target_0001',
  JSON.stringify({synthetic_marker:true,fake_counter:n})
];
const sample=()=>({scope:SCOPE,syntheticOwner:'synthetic_owner_0001',
  rows:[make('score',1),make('scope',2)]});
const copy=(x)=>JSON.parse(JSON.stringify(x));

test('legacy score/scope are counted, quarantined and NEVER mapped to V3',()=>{
  const input=sample(),original=copy(input),out=quarantine(input);
  assert.deepEqual(KINDS,['score','scope']);
  assert.equal(out.classification,'QUARANTINE_UNMAPPED');
  assert.deepEqual(out.legacyTypeCounts,{score:1,scope:1});
  assert.equal(out.quarantinedRows,2);
  assert.deepEqual(out.v3Events,[]);
  assert.equal(out.automaticMigrationAllowed,false);
  assert.equal(out.liveFirestoreRestoreVerified,false);
  assert.equal(out.cloudWritesPerformed,false);
  assert.equal(out.productionReady,false);
  assert.deepEqual(input,original);
  assert.equal(JSON.stringify(out).includes('synthetic_target'),false);
});

test('200 synthetic events follow observed sample counts without data disclosure',()=>{
  const input=sample();
  input.rows=Array.from({length:200},(_,i)=>make(i<191?'score':'scope',i+1));
  const out=quarantine(input);
  assert.deepEqual(out.legacyTypeCounts,{score:191,scope:9});
  assert.equal(out.quarantinedRows,200);
  assert.equal(out.v3Events.length,0);
});

test('real identifiers, unknown type, wrong mode and malformed rows fail closed',()=>{
  const a=sample();a.syntheticOwner='real-user-id';
  assert.throws(()=>quarantine(a),/SYNTHETIC_FIXTURE_REQUIRED/);
  const b=sample();b.scope='LIVE';
  assert.throws(()=>quarantine(b),/SYNTHETIC_FIXTURE_REQUIRED/);
  const c=sample();c.rows[0][0]='real-event-id';
  assert.throws(()=>quarantine(c),/INVALID_SYNTHETIC_ROW/);
  const d=sample();d.rows[0][4]='T00001';
  assert.throws(()=>quarantine(d),/INVALID_SYNTHETIC_ROW/);
  const e=sample();e.rows[0][3]='answer';
  assert.throws(()=>quarantine(e),/INVALID_SYNTHETIC_ROW/);
  const f=sample();f.rows[0]=f.rows[0].slice(0,5);
  assert.throws(()=>quarantine(f),/INVALID_SYNTHETIC_ROW/);
  const g=sample();g.rows=[make('score',1),make('score',1)];
  assert.throws(()=>quarantine(g),/DUPLICATE_SYNTHETIC_EVENT/);
});

test('unsafe or genuine-looking JSON must not be read as proven semantics',()=>{
  const a=sample();a.rows[0][5]='not-json';
  assert.throws(()=>quarantine(a),/UNSAFE_SYNTHETIC_JSON/);
  const b=sample();b.rows[0][5]='{"correct":true}';
  assert.throws(()=>quarantine(b),/UNSAFE_SYNTHETIC_JSON/);
  const c=sample();c.rows[0][5]='{"synthetic_marker":true,"__proto__":{"polluted":true}}';
  assert.throws(()=>quarantine(c),/UNSAFE_SYNTHETIC_JSON/);
  const d=sample();d.rows[0][5]='x'.repeat(4097);
  assert.throws(()=>quarantine(d),/INVALID_SYNTHETIC_ROW/);
  const e=sample();e.rows=Array(10001).fill([]);
  assert.throws(()=>quarantine(e),/SYNTHETIC_FIXTURE_REQUIRED/);
});

test('standalone quarantine code has no Cloud, Google, network or file writes',()=>{
  const source=fs.readFileSync(path.join(__dirname,'../backup-v3/legacy-event-quarantine.cjs'),'utf8');
  for(const re of [/require\(['"](?:firebase|googleapis|https?|@google|fs|child_process)/,
      /fetch\s*\(/, /XMLHttpRequest/, /process\.env/,
      /writeFileSync\s*\(/, /setCustomUserClaims\s*\(/,
      /\.collection\s*\(/, /\.doc\s*\(/, /execFileSync\s*\(/])
    assert.equal(re.test(source),false,String(re));
  assert.ok(source.includes("classification:'QUARANTINE_UNMAPPED'"));
  assert.ok(source.includes('automaticMigrationAllowed:false'));
});
