'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {PROJECT,evaluate}=require('../backup-v3/backup-health-contract.cjs');
const now='2026-11-05T11:00:00Z';
const sha='a'.repeat(64);
function fixture(){
  return {project:PROJECT,nowUtc:now,
    firstExpectedAt:'2026-11-04T08:00:00Z',
    lastAttempt:{outcome:'SUCCESS',finishedAt:'2026-11-05T10:05:00Z'},
    lastBackup:{createdAt:'2026-11-05T10:00:00Z',
      manifest:{project:PROJECT,complete:true,liveSheetsVerified:true,
        writeMode:'NEW_PRIVATE_SHEET_RAW_ONLY',sha256:sha,restoreTested:false}}};
}
test('no evidence never claims OK',()=>{
  const x=evaluate(null);assert.equal(x.backupStatus,'NO_DATA');
  assert.equal(x.restoreStatus,'NO_DATA');assert.equal(x.monitoringConnected,false);
});
test('latest verified TEST snapshot is healthy, restore remains untested',()=>{
  const x=evaluate(fixture());assert.equal(x.backupStatus,'OK');
  assert.equal(x.restoreStatus,'NO_DATA');assert.equal(x.alertRequired,false);
  assert.equal(x.productionReady,false);
});
test('missing first backup after deadline requires attention',()=>{
  const x=fixture();delete x.lastBackup;
  assert.equal(evaluate(x).backupReasonCodes[0],'FIRST_BACKUP_DEADLINE_MISSED');
  assert.equal(evaluate(x).alertRequired,true);
});
test('initially missing backup is unknown before deadline',()=>{
  const x=fixture();delete x.lastBackup;x.firstExpectedAt='2026-11-06T08:00:00Z';
  assert.equal(evaluate(x).backupStatus,'NO_DATA');
});
test('wrong Firebase project fails closed',()=>{
  const x=fixture();x.project='riveria-sanasto-community-test';
  assert.equal(evaluate(x).backupStatus,'PROBLEM');
  assert.deepEqual(evaluate(x).backupReasonCodes,['WRONG_PROJECT']);
});
test('aged manifest cannot be considered healthy',()=>{
  const x=fixture();x.lastBackup.createdAt='2026-11-03T10:00:00Z';
  assert.ok(evaluate(x).backupReasonCodes.includes('BACKUP_STALE'));
});
test('incomplete or forged Sheet readback cannot become OK',()=>{
  for(const change of [{complete:false},{liveSheetsVerified:false},{sha256:'badhash'},
    {project:'another-test-project'},{writeMode:'OVERWRITE_PUBLIC_SHEET'}]){
    const x=fixture();Object.assign(x.lastBackup.manifest,change);
    assert.equal(evaluate(x).backupStatus,'PROBLEM');
    assert.ok(evaluate(x).backupReasonCodes.includes('UNVERIFIED_OR_INVALID_MANIFEST'));
  }
});
test('missing latest attempt evidence is not OK',()=>{
  const x=fixture();delete x.lastAttempt;
  assert.equal(evaluate(x).backupStatus,'NO_DATA');
});
test('latest failed attempt raises a problem even after recent success',()=>{
  const x=fixture();x.lastAttempt={outcome:'FAILED',finishedAt:'2026-11-05T10:40:00Z'};
  assert.equal(evaluate(x).backupStatus,'PROBLEM');
  assert.ok(evaluate(x).alertCodes.includes('LATEST_ATTEMPT_FAILED'));
});
test('old failure before a newer success does not override it',()=>{
  const x=fixture();x.lastAttempt={outcome:'FAILED',finishedAt:'2026-11-05T09:00:00Z'};
  assert.equal(evaluate(x).backupStatus,'OK');
});
test('unknown attempt outcome and future dates fail closed',()=>{
  const x=fixture();x.lastAttempt.outcome='RUNNING';
  assert.ok(evaluate(x).backupReasonCodes.includes('UNKNOWN_ATTEMPT_OUTCOME'));
  x.lastAttempt.outcome='SUCCESS';x.lastBackup.createdAt='2026-11-06T13:00:00Z';
  assert.ok(evaluate(x).backupReasonCodes.includes('FUTURE_BACKUP_TIMESTAMP'));
});
test('unrelated restore evidence is not accepted',()=>{
  const x=fixture();x.lastRestoreDrill={outcome:'SUCCESS',verifiedAt:now,
    method:'ISOLATED_TEST_RESTORE_READBACK',manifestSha256:'b'.repeat(64)};
  assert.equal(evaluate(x).restoreStatus,'NO_DATA');
});
test('independent isolated readback evidence is separately recognized',()=>{
  const x=fixture();x.lastRestoreDrill={outcome:'SUCCESS',verifiedAt:now,
    method:'ISOLATED_TEST_RESTORE_READBACK',manifestSha256:sha};
  const out=evaluate(x);assert.equal(out.restoreStatus,'OK');
  assert.equal(out.monitoringConnected,false);
});
test('failed independent restore requires attention',()=>{
  const x=fixture();x.lastRestoreDrill={outcome:'FAILED',verifiedAt:now};
  assert.equal(evaluate(x).restoreStatus,'PROBLEM');
  assert.ok(evaluate(x).alertCodes.includes('RESTORE_DRILL_FAILED'));
});
test('no private identity, Sheet ID, words, or email can echo into status JSON',()=>{
  const x=fixture();x.uid='private_user_012';x.email='private@example.org';
  x.personalTerms=['секретный термин'];x.lastBackup.sheetId='private-sheet-012';
  x.lastAttempt.message='patient_name_sensitive';
  const body=JSON.stringify(evaluate(x));
  for(const s of ['private_user_012','private@example.org','секретный термин',
    'private-sheet-012','patient_name_sensitive'])assert.equal(body.includes(s),false);
});
