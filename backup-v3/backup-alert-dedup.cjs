'use strict';
/*
 * RUN-046: offline-only deduplicated alert planning. No e-mail, webhooks,
 * clocks, persistent storage or user-specific identifiers. Persist ack state
 * only AFTER a trusted delivery adapter confirms it sent the notification.
 */
const crypto=require('node:crypto');
const PROJECT='sanastoyhteiso-v3-development';
const RESEND_MS=24*60*60*1000;
const ALLOWED=new Set([
 'WRONG_PROJECT','FIRST_BACKUP_DEADLINE_MISSED','UNVERIFIED_OR_INVALID_MANIFEST',
 'INVALID_BACKUP_TIMESTAMP','FUTURE_BACKUP_TIMESTAMP','BACKUP_STALE',
 'INVALID_ATTEMPT_TIMESTAMP','LATEST_ATTEMPT_FAILED',
 'UNKNOWN_ATTEMPT_OUTCOME','RESTORE_DRILL_FAILED',
 'PROVIDER_ACCESS_DENIED','PROVIDER_READ_FAILED',
 'PRIVATE_PERMISSION_UNVERIFIED','PRIVATE_MANIFEST_INVALID',
 'PRIVATE_ROWS_INTEGRITY_FAILED','INVALID_PROVIDER_FILE_METADATA'
]);
function date(x){return typeof x==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,9})?Z$/.test(x)&&
  Number.isFinite(Date.parse(x))?Date.parse(x):null;}
function fingerprint(kind,reasons){
  return crypto.createHash('sha256').update(PROJECT+'|'+kind+'|'+reasons.join('|'),'utf8').digest('hex');
}
function noAction(reason){return {action:'NONE',reasonCode:reason,deliveryPerformed:false,
  project:PROJECT,productionReady:false};}
function plan({health,previous,nowUtc}){
  const now=date(nowUtc);
  if(now===null||!health||typeof health!=='object')return noAction('INVALID_EVIDENCE');
  if(health.project&&health.project!==PROJECT)return noAction('WRONG_PROJECT');
  if(!['OK','PROBLEM','NO_DATA'].includes(health.backupStatus)||
    !['OK','PROBLEM','NO_DATA'].includes(health.restoreStatus))return noAction('INVALID_EVIDENCE');
  const problem=health.backupStatus==='PROBLEM'||health.restoreStatus==='PROBLEM';
  const reasons=[...new Set(Array.isArray(health.alertCodes)?health.alertCodes:[])]
    .filter(x=>ALLOWED.has(x)).sort();
  const prev=previous&&typeof previous==='object'?previous:null;
  if(problem){
    if(reasons.length===0)return noAction('PROBLEM_WITHOUT_TRUSTED_CODE');
    const key=fingerprint('PROBLEM',reasons);
    const sent=prev&&date(prev.lastSentUtc);
    if(prev&&prev.incidentOpen===true&&prev.fingerprint===key&&
       sent!==null&&sent<=now&&now-sent<RESEND_MS){
      return {action:'SUPPRESS',reasonCode:'DUPLICATE_ALERT',deliveryPerformed:false,
        project:PROJECT,productionReady:false};
    }
    return {action:'SEND',kind:'PROBLEM',reasonCodes:reasons,
      idempotencyKey:key,deliveryPerformed:false,project:PROJECT,
      productionReady:false};
  }
  // Unknown evidence is not a recovery; never clear an open incident on NO_DATA.
  if(health.backupStatus!=='OK'||health.restoreStatus==='PROBLEM')
    return noAction('NOT_CONFIRMED_RECOVERY');
  if(!prev||prev.incidentOpen!==true)return noAction('NO_OPEN_INCIDENT');
  return {action:'SEND',kind:'RECOVERY',reasonCodes:['BACKUP_RECOVERED'],
    idempotencyKey:fingerprint('RECOVERY',['BACKUP_RECOVERED']),
    deliveryPerformed:false,project:PROJECT,productionReady:false};
}
function acknowledge(planResult,previous,sentUtc,deliveryConfirmed){
  // Caller must only call after trusted transport ACK and durable storage.
  if(deliveryConfirmed!==true||!planResult||planResult.action!=='SEND'||
     !/^[a-f0-9]{64}$/.test(planResult.idempotencyKey||'')||
     !['PROBLEM','RECOVERY'].includes(planResult.kind)||date(sentUtc)===null)
    return {acknowledged:false,previousUnchanged:true};
  return {acknowledged:true,previousUnchanged:false,state:{
    incidentOpen:planResult.kind==='PROBLEM',fingerprint:planResult.idempotencyKey,
    lastSentUtc:sentUtc}};
}
module.exports={plan,acknowledge,RESEND_MS};
