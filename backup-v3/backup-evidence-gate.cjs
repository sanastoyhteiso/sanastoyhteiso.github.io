'use strict';
/*
 * RUN-046. Pure orchestration of TEST-only provider readback evidence.
 * It NEVER connects to Google, Firebase, a browser, or a mailbox.
 * Real adapters must run in authenticated OWNER server context with private
 * configuration. Mock acceptance is not proof of any live Google backup.
 *
 * No raw manifest, UID, spreadsheet ID, row data or provider exception
 * is returned or logged. No Firestore/Sheets write/restore methods.
 */
const codec=require('./firestore-source-codec.cjs');
const health=require('./backup-health-contract.cjs');
const MAX_TEST_DOCS=300,MAX_TEST_SHEET_ROWS=1200;
const SPREADSHEET='application/vnd.google-apps.spreadsheet';
function plain(x){return x!==null&&typeof x==='object'&&!Array.isArray(x);}
function validTime(x){return typeof x==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,9})?Z$/.test(x)&&Number.isFinite(Date.parse(x));}
function result(code,healthStatus='PROBLEM'){
  return {verified:false,reasonCode:code,backupStatus:healthStatus,
    restoreStatus:'NO_DATA',alertRequired:healthStatus==='PROBLEM',
    operationallyProven:false,monitoringConnected:false,
    liveCloudAccessPerformedByThisModule:false,productionReady:false};
}
function providerStatus(err){
  // Never propagate Google response bodies or sensitive exception text.
  const status=err&&Number(err.httpStatus||err.statusCode);
  return status===401||status===403?'PROVIDER_ACCESS_DENIED':'PROVIDER_READ_FAILED';
}
async function inspect(opts){
  const config=opts&&opts.config;
  try{
    if(!plain(config)||!config.uid||!config.snapshotId) return result('INVALID_PRIVATE_CONFIG');
    codec.identity(config); // includes strict TEST project and UID/snapshot format
    if(!validTime(opts.nowUtc)||typeof config.sheetId!=='string'||
      !/^[A-Za-z0-9_-]{10,200}$/.test(config.sheetId))
      return result('INVALID_PRIVATE_CONFIG');
  }catch(_e){return result('INVALID_PRIVATE_CONFIG');}
  const p=opts.provider;
  const methods=['getFileMetadata','getPermissions','readManifest','readRows','readAttempt'];
  if(!plain(p)||methods.some(k=>typeof p[k]!=='function'))
    return result('TRUSTED_PROVIDER_MISSING','NO_DATA');
  // The caller must supply a trusted injected adapter; it cannot be proven here.
  let file,perms,manifest,rows,attempt;
  try{
    file=await p.getFileMetadata(config.sheetId);
    perms=await p.getPermissions(config.sheetId);
  }catch(e){return result(providerStatus(e));}
  if(!plain(file)||file.id!==config.sheetId||file.mimeType!==SPREADSHEET||
    !validTime(file.createdTime))return result('INVALID_PROVIDER_FILE_METADATA');
  // Conservative pilot: exact owner-only; any unknown permission fails closed.
  if(!Array.isArray(perms)||perms.length!==1||!plain(perms[0])||
    perms[0].type!=='user'||perms[0].role!=='owner')
    return result('PRIVATE_PERMISSION_UNVERIFIED');
  try{manifest=await p.readManifest(config.sheetId);}
  catch(e){return result(providerStatus(e));}
  if(!plain(manifest)||manifest.complete!==true||
    manifest.liveSheetsVerified!==true||
    manifest.writeMode!=='NEW_PRIVATE_SHEET_RAW_ONLY'||
    manifest.copiedTo!=='PRIVATE_NEW_TEST_SHEET'||
    manifest.project!==config.project||manifest.uid!==config.uid||
    manifest.snapshotId!==config.snapshotId||manifest.readTime!==config.readTime||
    !Number.isInteger(manifest.documentCount)||manifest.documentCount>MAX_TEST_DOCS||
    manifest.documentCount<0||!Number.isInteger(manifest.rowCount)||
    manifest.rowCount>=MAX_TEST_SHEET_ROWS||manifest.rowCount<0)
    return result('PRIVATE_MANIFEST_INVALID');
  try{
    rows=await p.readRows(config.sheetId,manifest.rowCount+1);
    // This checks complete row order/identity plus SHA-256 and section counts.
    codec.verify(rows,manifest,config);
  }catch(e){
    if(e&&Number(e.httpStatus||e.statusCode)>=400)return result(providerStatus(e));
    return result('PRIVATE_ROWS_INTEGRITY_FAILED');
  }
  try{attempt=await p.readAttempt(config.sheetId);}
  catch(e){return result(providerStatus(e));}
  if(!plain(attempt)||attempt.snapshotId!==config.snapshotId||
    attempt.outcome!=='SUCCESS'||!validTime(attempt.finishedAt)||
    Date.parse(attempt.finishedAt)<Date.parse(file.createdTime))
    return result('ATTEMPT_EVIDENCE_MISSING','NO_DATA');
  const status=health.evaluate({project:config.project,nowUtc:opts.nowUtc,
    lastBackup:{createdAt:file.createdTime,
      manifest:{project:manifest.project,complete:manifest.complete,
        liveSheetsVerified:manifest.liveSheetsVerified,
        writeMode:manifest.writeMode,sha256:manifest.sha256}},
    lastAttempt:{outcome:'SUCCESS',finishedAt:attempt.finishedAt}});
  return {verified:status.backupStatus==='OK',
    reasonCode:status.backupStatus==='OK'?'PROVIDER_READBACK_VERIFIED':
      (status.backupReasonCodes[0]||'HEALTH_NOT_OK'),
    backupStatus:status.backupStatus,restoreStatus:status.restoreStatus,
    alertRequired:status.alertRequired,documentCount:manifest.documentCount,
    operationallyProven:false,monitoringConnected:false,
    liveCloudAccessPerformedByThisModule:false,productionReady:false};
}
module.exports={inspect,MAX_TEST_DOCS,MAX_TEST_SHEET_ROWS};
