'use strict';
/**
 * RUN-135 — LEGACY event quarantine, not a migration.
 * SCOPE: deterministic, OFFLINE, fake fixtures only. Do not feed owner data.
 * Legacy "score"/"scope" semantics are unproven, so no V3 event is emitted.
 * No Firebase/Google/HTTP/filesystem access.
 */
const SCOPE='OFFLINE_SYNTHETIC_LEGACY_EVENTS_QUARANTINE_ONLY';
const KINDS=Object.freeze(['score','scope']);
const MAX_ROWS=10000;
const MAX_JSON_BYTES=4096;

function fakeToken(value,prefix) {
  return typeof value==='string' &&
    value.startsWith(prefix) &&
    /^[a-z0-9_]{4,72}$/.test(value.slice(prefix.length));
}
function safeJsonTree(value,depth=0) {
  if(depth>12)throw Error('UNSAFE_SYNTHETIC_JSON');
  if(value===null||typeof value==='boolean')return;
  if(typeof value==='number'&&Number.isFinite(value))return;
  if(typeof value==='string'&&value.length<=1000&&
      !/[\u0000-\u001f]/.test(value))return;
  if(Array.isArray(value)){
    if(value.length>100)throw Error('UNSAFE_SYNTHETIC_JSON');
    value.forEach(x=>safeJsonTree(x,depth+1));
    return;
  }
  if(value && typeof value==='object' &&
     Object.getPrototypeOf(value)===Object.prototype){
    const keys=Object.keys(value);
    if(keys.length>64)throw Error('UNSAFE_SYNTHETIC_JSON');
    for(const key of keys){
      if(['__proto__','prototype','constructor'].includes(key)||
         key.length>128)throw Error('UNSAFE_SYNTHETIC_JSON');
      safeJsonTree(value[key],depth+1);
    }
    return;
  }
  throw Error('UNSAFE_SYNTHETIC_JSON');
}
function readFakeRow(row) {
  if(!Array.isArray(row)||row.length!==6)throw Error('INVALID_SYNTHETIC_ROW');
  const [id,timestamp,deviceId,kind,targetId,jsonData]=row;
  if(!fakeToken(id,'synthetic_event_')||
     !fakeToken(deviceId,'synthetic_device_')||
     !fakeToken(targetId,'synthetic_target_')||
     typeof timestamp!=='string'||
     !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(timestamp)||
     Number.isNaN(Date.parse(timestamp)) ||
     !KINDS.includes(kind) ||
     typeof jsonData!=='string'||
     jsonData.length>MAX_JSON_BYTES)throw Error('INVALID_SYNTHETIC_ROW');
  let payload;
  try{payload=JSON.parse(jsonData);}catch(_){throw Error('UNSAFE_SYNTHETIC_JSON');}
  if(!payload||typeof payload!=='object'||Array.isArray(payload)||
     payload.synthetic_marker!==true)throw Error('UNSAFE_SYNTHETIC_JSON');
  safeJsonTree(payload);
  return {id,kind};
}
function quarantine(input) {
  if(!input||input.scope!==SCOPE||
     !fakeToken(input.syntheticOwner,'synthetic_owner_')||
     !Array.isArray(input.rows)||input.rows.length>MAX_ROWS)
    throw Error('SYNTHETIC_FIXTURE_REQUIRED');
  const seen=new Set(), counts={score:0,scope:0};
  for(const row of input.rows){
    const item=readFakeRow(row);
    if(seen.has(item.id))throw Error('DUPLICATE_SYNTHETIC_EVENT');
    seen.add(item.id);
    counts[item.kind]++;
  }
  const legacyTypeCounts=Object.freeze(counts);
  return Object.freeze({
    mode:SCOPE,
    classification:'QUARANTINE_UNMAPPED',
    legacyTypeCounts,
    inspectedSyntheticRows:input.rows.length,
    quarantinedRows:input.rows.length,
    v3Events:Object.freeze([]),
    sourceIdentityConfirmed:false,
    sourceContentIntegrityVerified:false,
    payloadSemanticsProven:false,
    realBackupReadbackVerified:false,
    automaticMigrationAllowed:false,
    liveFirestoreRestoreVerified:false,
    cloudWritesPerformed:false,
    productionReady:false
  });
}
module.exports={SCOPE,KINDS,quarantine};
