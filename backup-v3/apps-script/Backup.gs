/* RUN-042 — STANDALONE TEST-ONLY GOOGLE APPS SCRIPT BACKUP CANDIDATE.
 * NEVER run against production. One explicitly authorized TEST UID only.
 * No web deployment, no Service Account key, no Firestore writes.
 * Daily triggers DISABLED until owner sets private Script Properties and
 * authorizes installDailyTestBackup() in the Apps Script editor.
 * This file is generated from pinned RUN-040/041 codecs; never fetch/eval
 * remote source at runtime. Keep owner UID out of code and public GitHub.
 */
var V3BackupCore=(function(){
  'use strict';
  var cryptoShim={createHash:function(algorithm){
    if(algorithm!=='sha256')throw Error('Only SHA-256 supported');
    var plain='';
    return {update:function(data,encoding){
      if(encoding!=='utf8')throw Error('Only UTF-8 supported');
      plain+=String(data);return this;
    },digest:function(format){
      if(format!=='hex')throw Error('Only hex supported');
      var bytes=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,
        plain,Utilities.Charset.UTF_8);
      return bytes.map(function(b){return ('0'+(b&255).toString(16)).slice(-2);}).join('');
    }};
  }};
  var codecModule={exports:{}};
  (function(module,require){
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

  })(codecModule,function(name){
    if(name==='node:crypto')return cryptoShim;
    throw Error('Forbidden module in Apps Script backup codec');
  });
  var flowModule={exports:{}};
  (function(module,require){
'use strict';
/* RUN-041 trusted backup orchestration interface, NO Google client included.
 * Inject authenticated Firestore read-only and private Sheets adapters.
 * NEVER overwrites existing Sheets, NEVER writes Firestore, NEVER restores.
 * Owner-approved TEST-only workflow. Mock CI is NOT a live backup.
 */
const codec=require('./firestore-source-codec.cjs');
const PAGE_LIMIT=250,MAX_DOCS=20000,BATCH=20;
function validToken(token){return typeof token==='string'&&token.length>0&&token.length<=5000;}
function assertAdapter(source,sink){
  if(!source||typeof source.listDocuments!=='function'||typeof source.getBaseline!=='function')
    throw Error('Firestore read-only adapter missing');
  for(const k of ['createNewPrivate','writeRowsRaw','readRows','writeManifest','readManifest'])
    if(!sink||typeof sink[k]!=='function')throw Error('Private Sheets adapter missing '+k);
}
async function pages(adapter,kind,meta){
  const out=[],seen=new Set();
  let cursor='',pageCount=0;
  while(true){
    if(++pageCount>PAGE_LIMIT)throw Error('Firestore pagination safety limit');
    const page=await adapter.listDocuments({project:meta.project,uid:meta.uid,
      readTime:meta.readTime,kind,pageToken:cursor});
    if(!page||!Array.isArray(page.documents))throw Error('Firestore listing incomplete');
    for(const d of page.documents){
      out.push(d);
      if(out.length>MAX_DOCS)throw Error('Firestore documents safety limit');
    }
    const next=page.nextPageToken||'';
    if(typeof next!=='string'||(next&&!validToken(next)))
      throw Error('Invalid Firestore page cursor');
    if(!next)break;
    if(seen.has(next)||next===cursor)throw Error('Firestore repeating page cursor');
    seen.add(next);cursor=next;
  }
  return out;
}
async function readSource(adapter,meta){
  codec.identity(meta);
  const events=await pages(adapter,'events',meta);
  const words=await pages(adapter,'words',meta);
  // Adapter MUST throw on permission/auth/transport errors. Only actual
  // Firestore NOT_FOUND is a valid signal for an absent baseline.
  const baseline=await adapter.getBaseline({project:meta.project,uid:meta.uid,
    readTime:meta.readTime});
  if(baseline!==null&&(typeof baseline!=='object'||Array.isArray(baseline)))
    throw Error('Invalid baseline API result');
  return {...meta,events,words,baseline};
}
async function runBackup(opts){
  if(!opts||!opts.meta)throw Error('Missing backup configuration');
  const meta=opts.meta;
  codec.identity(meta); // before touching any adapter
  if(opts.explicitApproval!=='CREATE PRIVATE TEST BACKUP'||
     opts.destination!=='NEW_PRIVATE_GOOGLE_SHEET_ONLY')
    throw Error('Missing independent owner approval for private TEST backup');
  const reader=opts.reader,writer=opts.writer;
  assertAdapter(reader,writer);
  // These steps are all READ-ONLY before any Sheet is created.
  const source=await readSource(reader,meta);
  const planned=codec.pack(source);
  codec.verify(planned.rows,planned.manifest,meta);
  // Trust boundary: NEW document only; no known Sheet ID accepted here.
  const destination=await writer.createNewPrivate({
    project:meta.project,snapshotId:meta.snapshotId,
    rowCount:planned.manifest.rowCount+1,
    onlyNew:true,publicAccess:false
  });
  if(!destination||destination.createdNew!==true||destination.private!==true||
     typeof destination.id!=='string'||!/^[A-Za-z0-9_-]{10,200}$/.test(destination.id))
    throw Error('New private Sheet not confirmed; do not write');
  for(let start=0;start<planned.rows.length;start+=BATCH){
    const chunk=planned.rows.slice(start,start+BATCH);
    const result=await writer.writeRowsRaw(destination.id,start+1,chunk);
    if(!result||result.updatedRows!==chunk.length||result.valueInputOption!=='RAW')
      throw Error('Sheets RAW write not confirmed');
  }
  const reread=await writer.readRows(destination.id,planned.rows.length);
  const verified=codec.verify(reread,planned.manifest,meta);
  if(!verified.ok)throw Error('Sheets read-back integrity failed');
  // Manifest is written only after a full provider read-back; an
  // incomplete or corrupted copy remains private and UNVERIFIED.
  const committed={...planned.manifest,
    complete:true,liveSheetsVerified:true,restoreTested:false,
    copiedTo:'PRIVATE_NEW_TEST_SHEET'};
  const writeResult=await writer.writeManifest(destination.id,committed);
  if(writeResult!==true)throw Error('Private backup manifest not committed');
  const stored=await writer.readManifest(destination.id);
  if(!stored||JSON.stringify(stored)!==JSON.stringify(committed))
    throw Error('Private backup manifest read-back failed');
  return {ok:true,providerReadBackVerified:true,actualFirestoreRestoreDone:false,
    newPrivateSheetCreated:true,documentCount:committed.documentCount,
    rowCount:committed.rowCount,sha256:committed.sha256,
    // Sheet ID remains private in caller memory; never print it to CI.
    privateSheetId:destination.id};
}
module.exports={runBackup,readSource,PAGE_LIMIT};

  })(flowModule,function(name){
    if(name==='./firestore-source-codec.cjs')return codecModule.exports;
    throw Error('Forbidden module in Apps Script backup flow');
  });
  return flowModule.exports;
})();
// Config and owner permissions only in PRIVATE Script Properties.
var V3BackupApp=(function(){
  'use strict';
  var PROJECT='sanastoyhteiso-v3-development';
  var FIRESTORE='https://firestore.googleapis.com/v1/projects/'+PROJECT+
    '/databases/(default)/documents/sync_v3/';
  var SHEETS='https://sheets.googleapis.com/v4/spreadsheets';
  var DRIVE='https://www.googleapis.com/drive/v3/files/';
  var ENABLED='YES_OWNER_APPROVED_TEST_ONLY';
  function scriptProperties(){return PropertiesService.getScriptProperties();}
  function approved(){
    return scriptProperties().getProperty('V3_TEST_BACKUP_APPROVED')===ENABLED;
  }
  function uid(){
    var value=scriptProperties().getProperty('V3_TEST_BACKUP_UID');
    if(typeof value!=='string'||!/^[A-Za-z0-9_-]{2,128}$/.test(value))
      throw Error('Owner TEST UID not configured privately');
    return value;
  }
  function fetchJson(method,url,payload){
    // Runtime URL allowlist: not configurable via Script Properties or user text.
    if(!/^https:\/\/(firestore\.googleapis\.com\/v1\/projects\/sanastoyhteiso-v3-development\/databases\/\(default\)\/documents\/sync_v3\/|sheets\.googleapis\.com\/v4\/spreadsheets|www\.googleapis\.com\/drive\/v3\/files\/)/.test(url))
      throw Error('STOP: unapproved API URL');
    if(['GET','POST','PUT'].indexOf(method)<0)
      throw Error('STOP: unsafe API method');
    if(method!=='GET'&&url.indexOf('firestore.googleapis.com')>=0)
      throw Error('STOP: Firestore must remain READ-ONLY');
    var args={method:method.toLowerCase(),muteHttpExceptions:true,
      headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken(),
        Accept:'application/json'}};
    if(payload!==undefined){
      args.contentType='application/json';
      args.payload=JSON.stringify(payload);
    }
    var res=UrlFetchApp.fetch(url,args);
    var status=res.getResponseCode();
    if(status<200||status>=300){
      // Never log response body, token, UID, or private learner data.
      var ex=new Error('TEST backup Google API '+method+' HTTP '+status);
      ex.httpStatus=status;throw ex;
    }
    try{return JSON.parse(res.getContentText()||'{}');}
    catch(e){throw Error('TEST backup API JSON parse error');}
  }
  function enc(s){return encodeURIComponent(s);}
  function source(){
    return {
      listDocuments:function(a){
        if(a.project!==PROJECT||a.kind!=='events'&&a.kind!=='words')
          throw Error('Wrong TEST source request');
        var url=FIRESTORE+a.uid+'/'+a.kind+'?pageSize=100&readTime='+enc(a.readTime);
        if(a.pageToken)url+='&pageToken='+enc(a.pageToken);
        var data=fetchJson('GET',url);
        return {documents:data.documents||[],nextPageToken:data.nextPageToken||''};
      },
      getBaseline:function(a){
        if(a.project!==PROJECT)throw Error('Wrong TEST project');
        var url=FIRESTORE+a.uid+'/state/baseline?readTime='+enc(a.readTime);
        try{return fetchJson('GET',url);}
        catch(e){
          if(e.httpStatus===404)return null;
          throw e;
        }
      }
    };
  }
  function newTitle(s){return 'PRIVATE SANASTO V3 TEST BACKUP '+s;}
  function range(sheet,a1){return enc(sheet+'!'+a1);}
  function sheets(){
    return {
      createNewPrivate:function(a){
        if(a.project!==PROJECT||a.onlyNew!==true||a.publicAccess!==false)
          throw Error('Unsafe private Sheets destination');
        var created=fetchJson('POST',SHEETS,{
          properties:{title:newTitle(a.snapshotId)},
          sheets:[
            {properties:{title:'Records',gridProperties:{
              rowCount:Math.max(100,a.rowCount+10),columnCount:6}}},
            {properties:{title:'Manifest',gridProperties:{rowCount:20,columnCount:2}}}
          ]
        });
        var id=created.spreadsheetId;
        if(typeof id!=='string'||!/^[A-Za-z0-9_-]{10,200}$/.test(id))
          throw Error('New Google Sheet ID missing');
        var perms=fetchJson('GET',DRIVE+id+'/permissions?fields=permissions(type,role),nextPageToken');
        if(!perms||!Array.isArray(perms.permissions)||perms.nextPageToken||
           perms.permissions.length<1||
           perms.permissions.some(function(p){
             return p.type!=='user'||p.role!=='owner';
           }))
          throw Error('New TEST backup is not confirmed private owner-only');
        return {id:id,createdNew:true,private:true};
      },
      writeRowsRaw:function(id,start,rows){
        var end=start+rows.length-1;
        var url=SHEETS+'/'+id+'/values/'+range('Records','A'+start+':F'+end)+'?valueInputOption=RAW';
        var result=fetchJson('PUT',url,{majorDimension:'ROWS',values:rows});
        return {updatedRows:result.updatedRows,valueInputOption:'RAW'};
      },
      readRows:function(id,n){
        var url=SHEETS+'/'+id+'/values/'+range('Records','A1:F'+n)+
          '?valueRenderOption=UNFORMATTED_VALUE';
        var result=fetchJson('GET',url);
        return result.values||[];
      },
      writeManifest:function(id,manifest){
        var url=SHEETS+'/'+id+'/values/'+range('Manifest','A1:B1')+'?valueInputOption=RAW';
        var result=fetchJson('PUT',url,{majorDimension:'ROWS',
          values:[['backup_manifest_json',JSON.stringify(manifest)]]});
        return result.updatedRows===1;
      },
      readManifest:function(id){
        var url=SHEETS+'/'+id+'/values/'+range('Manifest','A1:B1')+
          '?valueRenderOption=UNFORMATTED_VALUE';
        var result=fetchJson('GET',url);
        if(!result.values||!result.values[0]||
           result.values[0][0]!=='backup_manifest_json')
          throw Error('Backup manifest read-back missing');
        try{return JSON.parse(result.values[0][1]);}
        catch(e){throw Error('Backup manifest JSON invalid');}
      }
    };
  }
  function settings(){
    return {testProject:PROJECT,backupEnabled:approved(),
      hasPrivateUid:Boolean(scriptProperties().getProperty('V3_TEST_BACKUP_UID')),
      currentRulesVerified:false,physicalRestoreTested:false};
  }
  function run(){
    if(!approved())throw Error('TEST backup not explicitly enabled');
    var lock=LockService.getScriptLock();
    if(!lock.tryLock(1000))throw Error('TEST backup already running');
    try{
      var start=Date.now();
      var meta={project:PROJECT,uid:uid(),
        snapshotId:'snap_'+new Date(start).toISOString().replace(/[-:.TZ]/g,'_')+
          Utilities.getUuid().replace(/-/g,'').slice(0,24),
        readTime:new Date(start-60000).toISOString()};
      var job={meta:meta,reader:source(),writer:sheets(),
        explicitApproval:'CREATE PRIVATE TEST BACKUP',
        destination:'NEW_PRIVATE_GOOGLE_SHEET_ONLY'};
      return V3BackupCore.runBackup(job).then(function(result){
        // Only aggregate result; never log a Sheet ID, UID, OAuth token or text.
        Logger.log('PRIVATE TEST backup complete, records='+result.documentCount+
          ' sha256='+result.sha256);
        return {complete:true,recordCount:result.documentCount};
      }).finally(function(){lock.releaseLock();});
    }catch(e){
      lock.releaseLock();
      throw e;
    }
  }
  return {settings:settings,run:run};
})();
function inspectTestBackupConfig(){return V3BackupApp.settings();}
function backupOnceTestOnly(){return V3BackupApp.run();}
function backupDailyTestOnly(){return V3BackupApp.run();}
function installDailyTestBackup(){
  if(!V3BackupApp.settings().backupEnabled||
     !V3BackupApp.settings().hasPrivateUid)
    throw Error('TEST backup owner approval/settings missing');
  var existing=ScriptApp.getProjectTriggers().filter(function(t){
    return t.getHandlerFunction()==='backupDailyTestOnly';
  });
  if(existing.length)throw Error('Existing TEST daily backup trigger: do not duplicate');
  ScriptApp.newTrigger('backupDailyTestOnly').timeBased().everyDays(1).create();
}
