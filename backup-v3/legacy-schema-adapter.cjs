'use strict';
/**
 * RUN-133. Inert LEGACY SCHEMA inspector, NOT a migration service.
 * Supports only synthetic fixture rows with a deliberately fake owner marker.
 * No Firebase/Google APIs, file writes, return of source values or PII.
 * Real owner Sheets must NEVER be passed to this function.
 */
const SCOPE='OFFLINE_SYNTHETIC_LEGACY_SCHEMA_ONLY';
const SPECS=Object.freeze({
  Events:['event_id','timestamp','device_id','type','target_id','json_data'],
  RS_Progress:['id','correct','wrong','seen','last'],
  RS_UserWords:['id','fi','ru','category','category ru','example','updatedat','deleted'],
  RS_Favorites:['id','starred','updatedat']
});
const MAX_ROWS=10000,MAX_FIELD=10000;
function normalize(v) {
  return typeof v==='string'?v.trim().toLowerCase().replace(/\s+/g,' '):'';
}
function checkHeader(name,headers) {
  const spec=SPECS[name];
  if(!spec||!Array.isArray(headers)||headers.length!==spec.length)
    throw Error('LEGACY_HEADER_MISMATCH');
  const got=headers.map(normalize);
  if(new Set(got).size!==got.length || got.some((v,i)=>v!==spec[i]))
    throw Error('LEGACY_HEADER_MISMATCH');
}
function nonempty(v){return v!==null&&v!==undefined&&String(v).trim()!=='';}
function safeText(v,max=MAX_FIELD){
  if(typeof v!=='string'||v.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v))
    throw Error('INVALID_LEGACY_ROW');
  return v;
}
function token(v){
  if(typeof v!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(v)||
      ['__proto__','prototype','constructor'].includes(v))
    throw Error('INVALID_LEGACY_ROW');
  return v;
}
function integer(v){
  if(typeof v==='number'&&Number.isSafeInteger(v)&&v>=0)return v;
  if(typeof v==='string'&&/^(0|[1-9][0-9]{0,14})$/.test(v)&&Number.isSafeInteger(+v))return +v;
  throw Error('INVALID_LEGACY_ROW');
}
function dateLike(v) {
  if(typeof v==='number'&&Number.isSafeInteger(v)&&v>=0)return;
  if(typeof v==='string' && (/^[0-9]{10,16}$/.test(v) ||
    /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d/.test(v)))return;
  throw Error('INVALID_LEGACY_ROW');
}
function bool(v){
  if(v===true||v===false)return;
  if(v===0||v===1)return;
  if(typeof v==='string'&&/^(true|false|0|1)$/i.test(v))return;
  throw Error('INVALID_LEGACY_ROW');
}
function safeObject(v,depth=0){
  if(depth>15)throw Error('INVALID_LEGACY_ROW');
  if(v===null||typeof v==='boolean'||typeof v==='string')return;
  if(typeof v==='number'&&Number.isFinite(v))return;
  if(Array.isArray(v)){if(v.length>500)throw Error('INVALID_LEGACY_ROW');v.forEach(x=>safeObject(x,depth+1));return;}
  if(!v||typeof v!=='object'||Object.getPrototypeOf(v)!==Object.prototype)
    throw Error('INVALID_LEGACY_ROW');
  const keys=Object.keys(v);
  if(keys.length>100)throw Error('INVALID_LEGACY_ROW');
  for(const k of keys){if(['__proto__','constructor','prototype'].includes(k))throw Error('INVALID_LEGACY_ROW');safeObject(v[k],depth+1);}
}
function validateRow(name,row){
  if(!Array.isArray(row)||row.length>SPECS[name].length)throw Error('INVALID_LEGACY_ROW');
  const values=Array.from({length:SPECS[name].length},(_,i)=>row[i]===undefined?'':row[i]);
  if(values.every(v=>!nonempty(v)))return null;
  const id=token(values[0]);
  if(name==='Events'){
    dateLike(values[1]);token(values[2]);
    safeText(values[3],40);
    if(!/^[A-Za-z][A-Za-z0-9_-]{1,39}$/.test(values[3]))throw Error('INVALID_LEGACY_ROW');
    token(values[4]);
    const json=safeText(values[5]);
    if(json.length>MAX_FIELD)throw Error('INVALID_LEGACY_ROW');
    let obj;try{obj=JSON.parse(json);}catch(_e){throw Error('INVALID_LEGACY_ROW');}
    safeObject(obj);
  } else if(name==='RS_Progress'){
    integer(values[1]);integer(values[2]);integer(values[3]);dateLike(values[4]);
  } else if(name==='RS_UserWords'){
    safeText(values[1],120);safeText(values[2],180);
    safeText(values[3],120);safeText(values[4],120);
    safeText(values[5],500);dateLike(values[6]);bool(values[7]);
  } else if(name==='RS_Favorites'){
    bool(values[1]);dateLike(values[2]);
  }
  return id;
}
function inspect(opts){
  if(!opts||opts.scope!==SCOPE||
     typeof opts.syntheticOwner!=='string'||
     !/^synthetic_[a-z0-9_]{4,64}$/.test(opts.syntheticOwner))
    throw Error('SYNTHETIC_FIXTURE_REQUIRED');
  const k=opts.sourceKind,expected=k==='events'?['Events']:
    k==='master'?['RS_Progress','RS_UserWords','RS_Favorites']:null;
  if(!expected||!opts.sheets||Object.getPrototypeOf(opts.sheets)!==Object.prototype||
    Object.keys(opts.sheets).length!==expected.length||
    expected.some(key=>!Object.prototype.hasOwnProperty.call(opts.sheets,key)))
    throw Error('LEGACY_SCHEMA_SCOPE_MISMATCH');
  const counts={};
  for(const name of expected){
    const sheet=opts.sheets[name];
    if(!sheet||typeof sheet!=='object')throw Error('LEGACY_HEADER_MISMATCH');
    checkHeader(name,sheet.headers);
    if(!Array.isArray(sheet.rows)||sheet.rows.length>MAX_ROWS)
      throw Error('LEGACY_TOO_MANY_ROWS');
    const seen=new Set();
    let count=0;
    for(const row of sheet.rows){
      const id=validateRow(name,row);
      if(id===null)continue;
      if(seen.has(id))throw Error('LEGACY_DUPLICATE_KEY');
      seen.add(id);count++;
    }
    counts[name]=count;
  }
  return Object.freeze({
    ok:true,mode:SCOPE,sourceKind:k,schema:'legacy-sanasto-2026-v1',
    supportedHeaders:true,inspectedSyntheticRows:Object.freeze(counts),
    sourceIdentityConfirmed:false,sourceContentIntegrityVerified:false,
    automaticEventMappingAllowed:false,unambiguousMigrationProven:false,
    GoogleDriveReadbackVerified:false,realFirestoreRestoreVerified:false,
    cloudWritesPerformed:false,productionReady:false
  });
}
module.exports={SCOPE,SPECS,inspect,checkHeader};
