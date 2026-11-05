'use strict';
/* RUN-042 Apps Script end-to-end OFFLINE runtime simulation. This is NOT real
 * Google OAuth, Firestore, Sheets, Apps Script, or scheduled execution.
 * No keys, emails, UID or actual learner documents are used.
 */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const crypto=require('node:crypto');
const code=fs.readFileSync('backup-v3/apps-script/Backup.gs','utf8');
const head='  (function(module,require){\n';
const first=code.indexOf(head),firstEnd=code.indexOf('\n  })(codecModule',first);
const second=code.indexOf(head,firstEnd+10),secondEnd=code.indexOf('\n  })(flowModule',second);
test('Apps Script bundled SHA codec and flow exactly match audited source files',()=>{
  assert.ok(first>=0&&firstEnd>first&&second>firstEnd&&secondEnd>second);
  assert.equal(code.slice(first+head.length,firstEnd).trim(),
    fs.readFileSync('backup-v3/firestore-source-codec.cjs','utf8').trim(),
    'Apps Script codec must never drift from independently tested source');
  assert.equal(code.slice(second+head.length,secondEnd).trim(),
    fs.readFileSync('backup-v3/private-sheets-flow.cjs','utf8').trim(),
    'Apps Script flow must never drift from independently tested source');
  const manifest=JSON.parse(fs.readFileSync('backup-v3/apps-script/appsscript.json','utf8'));
  assert.equal(manifest.runtimeVersion,'V8');
  assert.deepEqual(manifest.oauthScopes.sort(),[
    'https://www.googleapis.com/auth/script.external_request',
    'https://www.googleapis.com/auth/script.scriptapp',
    'https://www.googleapis.com/auth/datastore',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file'
  ].sort());
});
function sandbox(options={}){
  const project='sanastoyhteiso-v3-development';
  const uid='synthetic_test_owner_only';
  const fileId='SyntheticPrivateSheet01abcdef';
  const state={http:[],tokenCalls:0,created:0,triggerCreates:0,lockHeld:false,
    lockedCount:0,releasedCount:0,records:[],manifest:[],logs:[],
    options:Object.assign({approved:false,uid:true,public:false,firestore403:false,
      corruptRead:false,write403:false,alreadyTriggered:false},options)};
  const props={
    V3_TEST_BACKUP_APPROVED:state.options.approved?'YES_OWNER_APPROVED_TEST_ONLY':'',
    V3_TEST_BACKUP_UID:state.options.uid?uid:''
  };
  function reply(status,value){
    return {getResponseCode:()=>status,getContentText:()=>JSON.stringify(value||{})};
  }
  function fetch(url,args){
    const method=String(args.method||'').toUpperCase();
    assert.equal(typeof args.headers.Authorization,'string');
    assert.match(args.headers.Authorization,/^Bearer synthetic-no-real-OAuth-token$/);
    const decoded=decodeURIComponent(url);
    state.http.push({method,url:decoded});
    assert.match(url,/^https:\/\/(?:firestore|sheets|www)\.googleapis\.com\//);
    if(url.indexOf('firestore.googleapis.com/')>=0){
      assert.equal(method,'GET','Firestore must remain immutable/read-only');
      assert.ok(url.includes('/projects/'+project+'/'));
      assert.ok(url.includes('/sync_v3/'+uid+'/'));
      if(state.options.firestore403)return reply(403,{error:{message:'PRIVATE SHOULD NOT LEAK'}});
      if(decoded.includes('/events?')||decoded.includes('/words?'))return reply(200,{documents:[]});
      if(decoded.includes('/state/baseline?'))return reply(404,{});
      throw Error('Unexpected Firestore path in synthetic Apps Script test');
    }
    if(method==='POST'&&url==='https://sheets.googleapis.com/v4/spreadsheets'){
      state.created++;return reply(200,{spreadsheetId:fileId});
    }
    if(decoded.includes('/drive/v3/files/'+fileId+'/permissions?')&&method==='GET'){
      return reply(200,{permissions:state.options.public?
        [{type:'anyone',role:'reader'}]:[{type:'user',role:'owner'}]});
    }
    if(decoded.includes('/spreadsheets/'+fileId+'/values/')){
      const payload=args.payload?JSON.parse(args.payload):null;
      if(method==='PUT'){
        assert.match(decoded,/valueInputOption=RAW$/);
        if(state.options.write403)return reply(403,{});
        if(decoded.includes('values/Records!')){
          assert.equal(payload.majorDimension,'ROWS');
          assert.ok(Array.isArray(payload.values));
          const m=decoded.match(/Records!A(\d+):F(\d+)/);
          assert.ok(m,'Proper records range required');
          const start=Number(m[1])-1;
          payload.values.forEach((r,i)=>{state.records[start+i]=r});
          return reply(200,{updatedRows:payload.values.length});
        }
        if(decoded.includes('values/Manifest!')){
          state.manifest=payload.values;
          return reply(200,{updatedRows:1});
        }
      }
      if(method==='GET'){
        if(decoded.includes('values/Records!')){
          const rec=JSON.parse(JSON.stringify(state.records));
          if(state.options.corruptRead&&rec[0])rec[0][0]='altered_header';
          return reply(200,{values:rec});
        }
        if(decoded.includes('values/Manifest!'))return reply(200,{values:state.manifest});
      }
    }
    throw Error('Unexpected Google API operation in offline Apps Script test');
  }
  const context={
    Utilities:{DigestAlgorithm:{SHA_256:'SHA256'},Charset:{UTF_8:'UTF8'},
      computeDigest(_algo,value,_charset){return [...crypto.createHash('sha256')
        .update(String(value),'utf8').digest()].map(x=>x>=128?x-256:x)},
      getUuid:()=> 'abcd1234-abcd-1234-abcd-123456789abc'},
    PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]})},
    ScriptApp:{
      getOAuthToken(){state.tokenCalls++;return 'synthetic-no-real-OAuth-token'},
      getProjectTriggers:()=>state.options.alreadyTriggered?
        [{getHandlerFunction:()=> 'backupDailyTestOnly'}]:[],
      newTrigger:function(name){
        assert.equal(name,'backupDailyTestOnly');
        return {timeBased(){return this},everyDays(n){assert.equal(n,1);return this},
          create(){state.triggerCreates++;return this}};
      }
    },
    LockService:{getScriptLock(){return{
      tryLock(n){assert.equal(n,1000);state.lockedCount++;state.lockHeld=true;return true},
      releaseLock(){assert.equal(state.lockHeld,true);state.lockHeld=false;state.releasedCount++}
    }}},
    UrlFetchApp:{fetch},
    Logger:{log(s){state.logs.push(s)}}
  };
  vm.runInNewContext(code,context,{filename:'Backup.gs',timeout:1000});
  return{state,context,props,uid,fileId};
}
test('without owner approval: no API call, OAuth, new Sheet, trigger or locked job',()=>{
  const x=sandbox();
  assert.equal(x.context.inspectTestBackupConfig().backupEnabled,false);
  assert.throws(()=>x.context.backupOnceTestOnly(),/not explicitly enabled/);
  assert.throws(()=>x.context.installDailyTestBackup(),/approval\/settings missing/);
  assert.equal(x.state.http.length,0);
  assert.equal(x.state.tokenCalls,0);
  assert.equal(x.state.triggerCreates,0);
});
test('configured UID alone is not backup approval',()=>{
  const x=sandbox({approved:false,uid:true});
  assert.throws(()=>x.context.backupDailyTestOnly(),/not explicitly enabled/);
  assert.equal(x.state.created,0);
});
test('approved owner with missing UID stops before any I/O',()=>{
  const x=sandbox({approved:true,uid:false});
  assert.throws(()=>x.context.backupOnceTestOnly(),/TEST UID not configured/);
  assert.equal(x.state.created,0);
  assert.equal(x.state.http.length,0);
  assert.equal(x.state.releasedCount,1);
});
test('synthetic owner-only backup validates private RAW Sheets provider read-back',async()=>{
  const x=sandbox({approved:true});
  assert.equal(x.context.inspectTestBackupConfig().backupEnabled,true);
  const task=x.context.backupOnceTestOnly();
  assert.equal(typeof task.then,'function');
  assert.equal(x.state.lockHeld,true,'lock held through all async verification');
  const result=await task;
  assert.equal(result.complete,true);
  assert.equal(result.recordCount,0);
  assert.equal(x.state.created,1);
  assert.equal(x.state.lockHeld,false);
  assert.equal(x.state.releasedCount,1);
  assert.equal(x.state.tokenCalls,x.state.http.length);
  assert.ok(x.state.http.every(y=>!y.url.includes('riveria-sanasto-community-test')));
  const firestore=x.state.http.filter(y=>y.url.includes('firestore.googleapis.com'));
  assert.equal(firestore.length,3);
  assert.ok(firestore.every(y=>y.method==='GET'));
  const writable=x.state.http.filter(y=>y.method!=='GET');
  assert.ok(writable.every(y=>y.url.includes('sheets.googleapis.com')));
  assert.equal(x.state.records.length,1);
  assert.equal(x.state.manifest.length,1);
  const man=JSON.parse(x.state.manifest[0][1]);
  assert.equal(man.complete,true);
  assert.equal(man.liveSheetsVerified,true);
  assert.equal(man.restoreTested,false);
  assert.equal(man.project,'sanastoyhteiso-v3-development');
  assert.equal(x.state.triggerCreates,0,'backup run must not create schedule');
  assert.ok(x.state.logs.every(v=>!v.includes(x.uid)&&!v.includes(x.fileId)&&
    !v.includes('synthetic-no-real-OAuth-token')));
});
test('403 reading Firestore leaves no Sheet and releases lock',async()=>{
  const x=sandbox({approved:true,firestore403:true});
  await assert.rejects(x.context.backupOnceTestOnly(),/HTTP 403/);
  assert.equal(x.state.created,0);
  assert.equal(x.state.releasedCount,1);
});
test('newly created Sheet is rejected if externally shared',async()=>{
  const x=sandbox({approved:true,public:true});
  await assert.rejects(x.context.backupOnceTestOnly(),/not confirmed private owner-only/);
  assert.equal(x.state.created,1);
  assert.equal(x.state.records.length,0);
  assert.equal(x.state.manifest.length,0);
  assert.equal(x.state.releasedCount,1);
});
test('write failure/corrupt read-back cannot commit verified manifest',async()=>{
  for(const opts of [{write403:true},{corruptRead:true}]){
    const x=sandbox({approved:true,...opts});
    await assert.rejects(x.context.backupOnceTestOnly(),/HTTP 403|Missing backup rows|invalid header|SHA-256/i);
    assert.equal(x.state.manifest.length,0,'failed Sheets read-back must not commit verified manifest');
    assert.equal(x.state.releasedCount,1);
  }
});
test('daily trigger creation is separate, never duplicated, and requires owner gate',()=>{
  const x=sandbox({approved:true});
  x.context.installDailyTestBackup();
  assert.equal(x.state.triggerCreates,1);
  assert.equal(x.state.created,0);
  assert.equal(x.state.tokenCalls,0);
  const duplicate=sandbox({approved:true,alreadyTriggered:true});
  assert.throws(()=>duplicate.context.installDailyTestBackup(),/do not duplicate/);
  assert.equal(duplicate.state.triggerCreates,0);
});
