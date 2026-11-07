'use strict';
/* RUN-040. Offline-only backup codec of personal raw Firestore documents.
 * Test project only. No cloud, credentials, restore, or browser exposure.
 * SHA-256 proves readback integrity against manifest, not authenticity.
 */
const crypto=require('node:crypto');
const PROJECT='sanastoyhteiso-v3-development';
const SCOPE='sync_v3-events-baseline-words';
const HEADER=['snapshot_id','kind','document_name','chunk_index','chunk_count','json_chunk'];
const MAX_DOCS=20000,MAX_ROWS=50000,MAX_DOC=1100000,CHUNK=20000;
const BASE='projects/'+PROJECT+'/databases/(default)/documents/sync_v3/';
function obj(v){return v!==null&&typeof v==='object'&&!Array.isArray(v)&&Object.getPrototypeOf(v)===Object.prototype;}
function goodId(v){return typeof v==='string'&&/^[A-Za-z0-9_-]{2,128}$/.test(v)&&
  !['__proto__','prototype','constructor'].includes(v);}
function identity(meta){
  if(!obj(meta)||meta.project!==PROJECT)throw Error('Wrong backup project');
  if(!goodId(meta.uid)||!goodId(meta.snapshotId))throw Error('Invalid backup identity');
  if(typeof meta.readTime!=='string'||
    !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,9})?Z$/.test(meta.readTime)||
    !Number.isFinite(Date.parse(meta.readTime)))throw Error('Invalid UTC snapshot readTime');
}
function clean(x,depth=0){
  if(depth>35)throw Error('Firestore JSON depth exceeded');
  if(x===null||typeof x==='string'||typeof x==='boolean')return x;
  if(typeof x==='number'&&Number.isFinite(x))return x;
  if(Array.isArray(x))return x.map(y=>clean(y,depth+1));
  if(!obj(x))throw Error('Invalid Firestore JSON value');
  const out={};
  for(const k of Object.keys(x).sort()){
    if(['__proto__','prototype','constructor'].includes(k)||/[\x00-\x1f]/.test(k))
      throw Error('Unsafe Firestore JSON key');
    out[k]=clean(x[k],depth+1);
  }
  return out;
}
function canon(x){return JSON.stringify(clean(x));}
function doc(source,kind,uid){
  if(!obj(source)||!obj(source.fields)||typeof source.name!=='string')
    throw Error('Incomplete Firestore source document');
  const prefix=BASE+uid+'/';
  let ok=false;
  if(kind==='baseline')ok=source.name===prefix+'state/baseline';
  if(kind==='event')ok=source.name.startsWith(prefix+'events/')&&
    /^E_[a-f0-9]{32}$/.test(source.name.slice((prefix+'events/').length));
  if(kind==='word')ok=source.name.startsWith(prefix+'words/')&&
    /^W_[a-f0-9]{32}$/.test(source.name.slice((prefix+'words/').length));
  if(!ok)throw Error('Unexpected Firestore source path');
  const out={name:source.name,fields:clean(source.fields)};
  for(const k of ['createTime','updateTime'])
    if(Object.prototype.hasOwnProperty.call(source,k)){
      if(typeof source[k]!=='string'||source[k].length>80)throw Error('Bad document timestamp');
      out[k]=source[k];
    }
  if(canon(out).length>MAX_DOC)throw Error('Firestore source document too large');
  return out;
}
const ORDER={baseline:0,event:1,word:2};
function items(source){
  if(!obj(source)||!Array.isArray(source.events)||!Array.isArray(source.words)||
    !(source.baseline===null||source.baseline===undefined||obj(source.baseline)))
    throw Error('Incomplete personal Firestore source');
  const result=[];
  if(source.baseline)result.push({kind:'baseline',document:doc(source.baseline,'baseline',source.uid)});
  for(const e of source.events)result.push({kind:'event',document:doc(e,'event',source.uid)});
  for(const w of source.words)result.push({kind:'word',document:doc(w,'word',source.uid)});
  if(result.length>MAX_DOCS)throw Error('Too many personal documents');
  result.sort((a,b)=>ORDER[a.kind]-ORDER[b.kind]||a.document.name.localeCompare(b.document.name));
  const seen=new Set();
  for(const row of result){
    if(seen.has(row.document.name))throw Error('Duplicate Firestore document');
    seen.add(row.document.name);
  }
  return result;
}
function payload(meta,records){return {version:1,scope:SCOPE,project:meta.project,
  uid:meta.uid,snapshotId:meta.snapshotId,readTime:meta.readTime,records};}
function digest(x){return crypto.createHash('sha256').update(canon(x),'utf8').digest('hex');}
function split(s){
  const parts=[];
  for(let start=0;start<s.length;){
    let end=Math.min(s.length,start+CHUNK);
    if(end<s.length&&end>start&&/[\uD800-\uDBFF]/.test(s[end-1]))end--;
    if(end<=start)throw Error('Invalid Unicode chunk boundary');
    parts.push(s.slice(start,end));start=end;
  }
  return parts;
}
function counts(records){
  return {baseline:records.filter(x=>x.kind==='baseline').length,
    events:records.filter(x=>x.kind==='event').length,
    words:records.filter(x=>x.kind==='word').length};
}
function pack(source){
  identity(source);
  const records=items(source),rows=[HEADER.slice()];
  for(const record of records){
    const parts=split(canon(record.document));
    for(let i=0;i<parts.length;i++){
      rows.push([source.snapshotId,record.kind,record.document.name,
        String(i),String(parts.length),parts[i]]);
      if(rows.length-1>MAX_ROWS)throw Error('Backup Sheets rows limit');
    }
  }
  return {manifest:{schemaVersion:1,scope:SCOPE,project:PROJECT,uid:source.uid,
    snapshotId:source.snapshotId,readTime:source.readTime,
    documentCount:records.length,sections:counts(records),rowCount:rows.length-1,
    sha256:digest(payload(source,records)),writeMode:'NEW_PRIVATE_SHEET_RAW_ONLY',
    complete:false,liveSheetsVerified:false,restoreTested:false},rows};
}
function verify(rows,manifest,expected){
  identity(expected);
  if(!obj(manifest)||manifest.schemaVersion!==1||manifest.scope!==SCOPE||
    manifest.project!==expected.project||manifest.uid!==expected.uid||
    manifest.snapshotId!==expected.snapshotId||manifest.readTime!==expected.readTime||
    !/^[a-f0-9]{64}$/.test(manifest.sha256||'')||
    !Number.isInteger(manifest.documentCount)||manifest.documentCount<0||
    manifest.documentCount>MAX_DOCS||!Number.isInteger(manifest.rowCount)||
    manifest.rowCount<0||manifest.rowCount>MAX_ROWS||!obj(manifest.sections))
    throw Error('Backup manifest invalid or wrong owner');
  if(!Array.isArray(rows)||rows.length!==manifest.rowCount+1||
    !Array.isArray(rows[0])||canon(rows[0])!==canon(HEADER))
    throw Error('Missing backup rows or header');
  let i=1;const records=[],seen=new Set();
  while(i<rows.length){
    const a=rows[i];
    if(!Array.isArray(a)||a.length!==6||a[0]!==expected.snapshotId||
      !Object.prototype.hasOwnProperty.call(ORDER,a[1])||
      typeof a[2]!=='string'||!/^(0|[1-9]\d*)$/.test(String(a[3]))||
      !/^[1-9]\d*$/.test(String(a[4])))
      throw Error('Malformed backup row');
    const total=Number(a[4]),kind=a[1],name=a[2];
    if(total>Math.ceil(MAX_DOC/CHUNK)+1||seen.has(name))
      throw Error('Duplicate or oversized backup document');
    const chunks=[];
    for(let n=0;n<total;n++){
      const row=rows[i+n];
      if(!Array.isArray(row)||row.length!==6||
        row[0]!==expected.snapshotId||row[1]!==kind||row[2]!==name||
        String(row[3])!==String(n)||String(row[4])!==String(total)||
        typeof row[5]!=='string'||row[5].length<1||row[5].length>CHUNK)
        throw Error('Missing, reordered or corrupt document chunk');
      chunks.push(row[5]);
    }
    const raw=chunks.join('');
    if(raw.length>MAX_DOC)throw Error('Oversized decoded document');
    let decoded;
    try{decoded=JSON.parse(raw);}catch(e){throw Error('Invalid backed-up JSON');}
    const restored=doc(decoded,kind,expected.uid);
    if(restored.name!==name||canon(restored)!==raw)
      throw Error('Noncanonical backup document');
    records.push({kind,document:restored});
    seen.add(name);i+=total;
    if(records.length>MAX_DOCS)throw Error('Too many backed-up documents');
  }
  const source={...expected,baseline:(records.find(x=>x.kind==='baseline')||{}).document||null,
    events:records.filter(x=>x.kind==='event').map(x=>x.document),
    words:records.filter(x=>x.kind==='word').map(x=>x.document)};
  const normalized=items(source);
  if(canon(records)!==canon(normalized))throw Error('Backup item ordering or duplication invalid');
  if(canon(manifest.sections)!==canon(counts(records))||
     manifest.documentCount!==records.length)
    throw Error('Backup counts mismatch');
  if(digest(payload(expected,records))!==manifest.sha256)throw Error('Backup SHA-256 mismatch');
  return {ok:true,offlineVerified:true,liveSheetsVerified:false,
    canAutomaticallyRestore:false,source,counts:counts(records),sha256:manifest.sha256};
}
module.exports={PROJECT,SCOPE,HEADER,pack,verify,identity};
