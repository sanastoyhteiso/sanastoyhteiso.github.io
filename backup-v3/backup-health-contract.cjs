'use strict';
/*
 * RUN-044: pure TEST-only health/failure contract for a private Firestore ->
 * Google Sheets backup. No network, no schedules, no notifications, no PII.
 *
 * Input MUST come from a future trusted provider read-back/auditor.
 * Values supplied by a caller are assertions, NOT live evidence by themselves.
 * Never use this module to mark a production backup as verified.
 */
const PROJECT='sanastoyhteiso-v3-development';
const FRESHNESS_MS=30*60*60*1000;
const FUTURE_TOLERANCE_MS=5*60*1000;
const STATES=Object.freeze({OK:'OK',PROBLEM:'PROBLEM',NO_DATA:'NO_DATA'});
function object(x){return !!x&&typeof x==='object'&&!Array.isArray(x);}
function timestamp(s){
  if(typeof s!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,9})?Z$/.test(s))return null;
  const n=Date.parse(s);
  return Number.isFinite(n)?n:null;
}
function result(backupStatus,backupReasons,restoreStatus,restoreReasons){
  const alerted=backupStatus===STATES.PROBLEM||restoreStatus===STATES.PROBLEM;
  return {scope:'ONE_ACCOUNT_TEST_ONLY',project:PROJECT,backupStatus,
    backupReasonCodes:backupReasons,restoreStatus,
    restoreReasonCodes:restoreReasons,alertRequired:alerted,
    alertCodes:alerted?[...backupStatus===STATES.PROBLEM?backupReasons:[],
      ...restoreStatus===STATES.PROBLEM?restoreReasons:[]]:[],
    monitoringConnected:false,liveBackendVerifiedByThisModule:false,
    productionReady:false};
}
function evaluate(evidence){
  if(!object(evidence))return result('NO_DATA',['NO_TRUSTED_EVIDENCE'],'NO_DATA',['RESTORE_NOT_TESTED']);
  if(evidence.project!==PROJECT)return result('PROBLEM',['WRONG_PROJECT'],'NO_DATA',['RESTORE_NOT_TESTED']);
  const now=timestamp(evidence.nowUtc);
  if(now===null)return result('NO_DATA',['INVALID_CLOCK_EVIDENCE'],'NO_DATA',['RESTORE_NOT_TESTED']);
  const backup=evidence.lastBackup;
  if(!object(backup)){
    const deadline=timestamp(evidence.firstExpectedAt);
    if(deadline!==null&&now>deadline)
      return result('PROBLEM',['FIRST_BACKUP_DEADLINE_MISSED'],'NO_DATA',['RESTORE_NOT_TESTED']);
    return result('NO_DATA',['NO_PROVIDER_READBACK'],'NO_DATA',['RESTORE_NOT_TESTED']);
  }
  const created=timestamp(backup.createdAt),man=backup.manifest;
  let status='OK',reasons=[];
  if(!object(man)||man.project!==PROJECT||man.complete!==true||
      man.liveSheetsVerified!==true||man.writeMode!=='NEW_PRIVATE_SHEET_RAW_ONLY'||
      !/^[a-f0-9]{64}$/.test(String(man.sha256||''))){
    status='PROBLEM';reasons.push('UNVERIFIED_OR_INVALID_MANIFEST');
  }
  if(created===null){
    status='PROBLEM';reasons.push('INVALID_BACKUP_TIMESTAMP');
  }else if(created>now+FUTURE_TOLERANCE_MS){
    status='PROBLEM';reasons.push('FUTURE_BACKUP_TIMESTAMP');
  }else if(now-created>FRESHNESS_MS){
    status='PROBLEM';reasons.push('BACKUP_STALE');
  }
  const attempt=evidence.lastAttempt;
  if(!object(attempt)){
    if(status==='OK'){status='NO_DATA';reasons.push('NO_ATTEMPT_PROOF');}
  }else{
    const attemptTime=timestamp(attempt.finishedAt);
    if(attemptTime===null||attemptTime>now+FUTURE_TOLERANCE_MS){
      status='PROBLEM';reasons.push('INVALID_ATTEMPT_TIMESTAMP');
    }else if(attempt.outcome==='FAILED'){
      if(created===null||attemptTime>=created){
        status='PROBLEM';reasons.push('LATEST_ATTEMPT_FAILED');
      }
    }else if(attempt.outcome!=='SUCCESS'){
      status='PROBLEM';reasons.push('UNKNOWN_ATTEMPT_OUTCOME');
    }else if(created!==null&&attemptTime<created){
      if(status==='OK'){status='NO_DATA';reasons.push('ATTEMPT_PROOF_MISMATCH');}
    }
  }
  const drill=evidence.lastRestoreDrill;
  let restore='NO_DATA',restoreReasons=['RESTORE_NOT_TESTED'];
  if(object(drill)){
    const drillAt=timestamp(drill.verifiedAt);
    if(drill.outcome==='FAILED'){
      restore='PROBLEM';restoreReasons=['RESTORE_DRILL_FAILED'];
    }else if(drill.outcome==='SUCCESS'&&drill.method==='ISOLATED_TEST_RESTORE_READBACK'&&
      drillAt!==null&&drillAt<=now+FUTURE_TOLERANCE_MS&&
      object(man)&&drill.manifestSha256===man.sha256){
      restore='OK';restoreReasons=[];
    }else{
      restore='NO_DATA';restoreReasons=['RESTORE_PROOF_INCOMPLETE'];
    }
  }
  return result(status,reasons,restore,restoreReasons);
}
module.exports={PROJECT,STATES,FRESHNESS_MS,evaluate};
