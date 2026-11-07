'use strict';
/* RUN-143: real client and admin adapters in a synthetic jsdom browser.
 * No external network, Firebase account, Cloudflare deployment, UID data,
 * answers, raw errors or private rows are used.
 */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');
const SITE='https://sanastoyhteiso.github.io/';
const ENDPOINT='https://unit-test.worker.workers.dev';
function app(configured){
 const dom=new JSDOM('<!doctype html><html><body><div id="placeholder"></div></body></html>',{
  url:SITE,runScripts:'outside-only',pretendToBeVisual:true
 });
 const w=dom.window,records=[],user={
  uid:'mock-anon-143',emailVerified:true,
  getIdToken:async()=> 'synthetic.jwt.token'
 };
 Object.defineProperty(w,'crypto',{configurable:true,value:require('node:crypto').webcrypto});
 w.RS_FIREBASE_CONFIG={projectId:'riveria-sanasto-community-test'};
 w.RS_TELEMETRY_CONFIG={enabled:configured===true,endpoint:configured?ENDPOINT:''};
 w.RS_FAMILY={uid:user.uid};
 w.firebase={auth:()=>({currentUser:user})};
 w.fetch=async(url,opts)=>{
  records.push({url,opts});
  return {status:201,ok:true,json:async()=>({ok:true,duplicate:false})};
 };
 w.eval(fs.readFileSync('monitoring-client.js','utf8'));
 w.eval(fs.readFileSync('study-diagnostics.js','utf8'));
 return {dom,w,records,user};
}
const drain=async()=>{for(let n=0;n<15;n++)await Promise.resolve();};
test('monitoring defaults off and user must explicitly opt-in',async()=>{
 const a=app(false);try{
  assert.equal(a.w.RS_MONITOR_CLIENT.isConfigured(),false);
  assert.equal(a.w.RS_MONITOR_CLIENT.setConsent(true),false);
  assert.equal(a.w.RS_V3_LOCAL_DIAGNOSTICS.record('APP_RENDER_FAILED'),true);
  await drain();assert.equal(a.records.length,0);
  assert.match(a.w.RS_MONITOR_CLIENT.panelHtml(),/пока не подключён/);
 }finally{a.dom.window.close();}
});
test('consent limits transmitted payload to five allowlisted fields and bearer ID token',async()=>{
 const a=app(true);try{
  assert.equal(a.w.RS_MONITOR_CLIENT.isEnabled(),false);
  assert.equal(a.w.RS_MONITOR_CLIENT.setConsent(true),true);
  assert.equal(a.w.RS_MONITOR_CLIENT.isEnabled(),true);
  assert.equal(a.w.RS_V3_LOCAL_DIAGNOSTICS.record('SYNC_UPLOAD_FAILED'),true);
  await drain();
  assert.equal(a.records.length,1);
  assert.equal(a.records[0].url,ENDPOINT+'/v1/events');
  const body=JSON.parse(a.records[0].opts.body);
  assert.deepEqual(Object.keys(body).sort(),['browser','code','id','release','v']);
  assert.equal(body.code,'SYNC_UPLOAD_FAILED');
  assert.match(body.id,/^E_[a-f0-9]{32}$/);
  assert.equal(a.records[0].opts.headers.Authorization,'Bearer synthetic.jwt.token');
  assert.ok(!JSON.stringify(body).includes(a.user.uid));
  assert.ok(!JSON.stringify(body).includes('email'));
  assert.ok(!JSON.stringify(body).includes('message'));
  assert.equal(a.w.RS_MONITOR_CLIENT.setConsent(false),true);
  assert.equal(a.w.RS_MONITOR_CLIENT.isEnabled(),false);
  assert.equal(a.w.RS_V3_LOCAL_DIAGNOSTICS.record('BACKUP_VERIFY_FAILED'),true);
  await drain();assert.equal(a.records.length,1);
 }finally{a.dom.window.close();}
});
test('invalid code and authenticated account mismatch never emit',async()=>{
 const a=app(true);try{
  a.w.RS_MONITOR_CLIENT.setConsent(true);
  assert.equal(a.w.RS_MONITOR_CLIENT.queueCode('wrong-answer'),false);
  a.w.RS_FAMILY.uid='different-synthetic-user';
  assert.equal(a.w.RS_MONITOR_CLIENT.queueCode('SYNC_UPLOAD_FAILED'),false);
  await drain();assert.equal(a.records.length,0);
 }finally{a.dom.window.close();}
});
test('admin adapter accepts only current verified aggregate data, no stale or guessed health',async()=>{
 const a=app(true);try{
  a.w.eval(fs.readFileSync('admin/monitoring-admin.js','utf8'));
  assert.equal(a.w.RS_MONITOR_ADMIN.configured(),true);
  a.w.fetch=async()=>({ok:true,json:async()=>({
    backendConnected:true,serverDataOnly:true,monitoringActive:true,
    monitoringCoverageVerified:false,updatedAt:new Date().toISOString(),
    errors24h:1,errorGroups:[{code:'SYNC_DOWNLOAD_FAILED',count:1}],
    browserGroups:[{browser:'ios-safari',count:1}]
  })});
  const data=await a.w.RS_MONITOR_ADMIN.read(a.user);
  assert.equal(data.errors24h,1);
  assert.equal(data.monitoringCoverageVerified,false);
  a.w.fetch=async()=>({ok:true,json:async()=>({...data,updatedAt:'2020-01-01T00:00:00Z'})});
  await assert.rejects(a.w.RS_MONITOR_ADMIN.read(a.user),/Stale monitoring/);
  a.w.fetch=async()=>({ok:true,json:async()=>({...data,errorGroups:[{code:'raw error stack',count:1}]})});
  await assert.rejects(a.w.RS_MONITOR_ADMIN.read(a.user),/Invalid telemetry response/);
 }finally{a.dom.window.close();}
});

test('opted-in technical failures queue offline and transmit after connectivity returns',async()=>{
 const a=app(true);try{
  a.w.RS_MONITOR_CLIENT.setConsent(true);
  Object.defineProperty(a.w.navigator,'onLine',{configurable:true,value:false});
  assert.equal(a.w.RS_V3_LOCAL_DIAGNOSTICS.record('CACHE_MISMATCH'),true);
  await drain();assert.equal(a.records.length,0);
  Object.defineProperty(a.w.navigator,'onLine',{configurable:true,value:true});
  a.w.dispatchEvent(new a.w.Event('online'));await drain();
  assert.equal(a.records.length,1);
  assert.equal(JSON.parse(a.records[0].opts.body).code,'CACHE_MISMATCH');
 }finally{a.dom.window.close();}
});
