'use strict';
/* RUN-133: only synthetic rows, not private owner Sheets contents. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {SCOPE,SPECS,inspect}=require('../backup-v3/legacy-schema-adapter.cjs');
const fake='synthetic_owner_fixture';
const clone=x=>JSON.parse(JSON.stringify(x));
function inputEvents(){
  return {scope:SCOPE,syntheticOwner:fake,sourceKind:'events',
    sheets:{Events:{headers:SPECS.Events.slice(),
      rows:[['E_123','2026-11-02T10:11:12Z','D_synthetic_01','answer','T00001',
        '{"correct":true,"context":"Hoiva"}']]}}};
}
function inputMaster(){
  return {scope:SCOPE,syntheticOwner:fake,sourceKind:'master',
    sheets:{
      RS_Progress:{headers:['ID','Correct','Wrong','Seen','Last'],
        rows:[['T00001',1,0,1,'2026-11-02T10:11:12Z']]},
      RS_UserWords:{headers:['ID','FI','RU','Category','Category RU','Example','UpdatedAt','Deleted'],
        rows:[['W_123','terve','здоровый','Terveys','Здоровье','=','2026-11-02T10:11:12Z',false]]},
      RS_Favorites:{headers:['ID','Starred','UpdatedAt'],
        rows:[['T00001',true,'2026-11-02T10:11:12Z']]}
    }};
}
test('legacy progress events header identifies old format without converting to Firestore V3',()=>{
  const data=inputEvents(),before=clone(data);
  const out=inspect(data);
  assert.equal(out.ok,true);
  assert.equal(out.schema,'legacy-sanasto-2026-v1');
  assert.deepEqual(out.inspectedSyntheticRows,{Events:1});
  assert.equal(out.automaticEventMappingAllowed,false);
  assert.equal(out.realFirestoreRestoreVerified,false);
  assert.equal(out.GoogleDriveReadbackVerified,false);
  assert.equal(out.cloudWritesPerformed,false);
  assert.equal(out.productionReady,false);
  assert.deepEqual(data,before);
  assert.equal(JSON.stringify(out).includes('Hoiva'),false);
  assert.equal(JSON.stringify(out).includes('T00001'),false);
});
test('pre-migration master headers classify progress, personal words and favorites safely',()=>{
  const out=inspect(inputMaster());
  assert.deepEqual(out.inspectedSyntheticRows,
    {RS_Progress:1,RS_UserWords:1,RS_Favorites:1});
  assert.equal(out.unambiguousMigrationProven,false);
  assert.equal(out.sourceIdentityConfirmed,false);
  assert.equal(out.sourceContentIntegrityVerified,false);
});
test('exact header order, completeness, and source-set are mandatory',()=>{
  const a=inputEvents();a.sheets.Events.headers[1]='device_id';
  assert.throws(()=>inspect(a),/LEGACY_HEADER_MISMATCH/);
  const b=inputMaster();delete b.sheets.RS_Favorites;
  assert.throws(()=>inspect(b),/LEGACY_SCHEMA_SCOPE_MISMATCH/);
  const c=inputMaster();c.sheets.RS_UserWords.headers.push('secret');
  assert.throws(()=>inspect(c),/LEGACY_HEADER_MISMATCH/);
  const d=inputEvents();d.sheets.Events.headers[1]='event_id';
  assert.throws(()=>inspect(d),/LEGACY_HEADER_MISMATCH/);
  const extra=inputEvents();extra.sheets.Other={headers:[],rows:[]};
  assert.throws(()=>inspect(extra),/LEGACY_SCHEMA_SCOPE_MISMATCH/);
});
test('reject duplicate, malformed JSON, injection and invalid progress data',()=>{
  const a=inputEvents();a.sheets.Events.rows.push(clone(a.sheets.Events.rows[0]));
  assert.throws(()=>inspect(a),/LEGACY_DUPLICATE_KEY/);
  const b=inputEvents();b.sheets.Events.rows[0][5]='{"oops":';
  assert.throws(()=>inspect(b),/INVALID_LEGACY_ROW/);
  const c=inputEvents();c.sheets.Events.rows[0][5]='{"__proto__":{"polluted":true}}';
  assert.throws(()=>inspect(c),/INVALID_LEGACY_ROW/);
  const d=inputMaster();d.sheets.RS_Progress.rows[0][1]=-1;
  assert.throws(()=>inspect(d),/INVALID_LEGACY_ROW/);
  const e=inputMaster();e.sheets.RS_Favorites.rows[0][1]='maybe';
  assert.throws(()=>inspect(e),/INVALID_LEGACY_ROW/);
});
test('fail closed against non-synthetic caller; no real user ids accepted',()=>{
  const e=inputEvents();
  assert.throws(()=>inspect({...e,scope:'LIVE_SHEETS'}),/SYNTHETIC_FIXTURE_REQUIRED/);
  assert.throws(()=>inspect({...e,syntheticOwner:'real-uid'}),/SYNTHETIC_FIXTURE_REQUIRED/);
  assert.throws(()=>inspect({...e,sourceKind:'arbitrary'}),/LEGACY_SCHEMA_SCOPE_MISMATCH/);
  const tooMany=inputEvents();tooMany.sheets.Events.rows=Array(10001).fill([]);
  assert.throws(()=>inspect(tooMany),/LEGACY_TOO_MANY_ROWS/);
});
test('no Google, Firebase, HTTP, Sheets SDK, environment tokens or persistent writes',()=>{
  const src=fs.readFileSync(path.join(__dirname,'../backup-v3/legacy-schema-adapter.cjs'),'utf8');
  for(const r of [/require\(['"](?:firebase|googleapis|https?|@google)/,
    /fetch\s*\(/, /XMLHttpRequest/, /process\.env\./,
    /writeFileSync\s*\(/, /setCustomUserClaims\s*\(/, /\.collection\s*\(/,
    /\.doc\s*\(/, /execFileSync\s*\(/])assert.equal(r.test(src),false,String(r));
  assert.ok(src.includes('automaticEventMappingAllowed:false'));
});
