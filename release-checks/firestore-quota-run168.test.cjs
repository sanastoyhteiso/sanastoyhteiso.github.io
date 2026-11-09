'use strict';
/* RUN168: synthetic user and no real Firebase, credentials or private learner data. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM}=require('jsdom');
const read=p=>fs.readFileSync(p,'utf8');
function setup(xhrHandler){
 const dom=new JSDOM('<!doctype html><html lang="ru"><body><div id="main-content"></div><div id="community-status"></div>'+
  '<div id="account-profile-status"></div><input id="community-name" value="Before">'+
  '<input type="checkbox" id="community-public-stats"></body></html>',{
  url:'https://sanastoyhteiso.github.io/',runScripts:'outside-only',pretendToBeVisual:true
 });
 const w=dom.window,d=w.document,requests=[];
 w.RS_FIREBASE_CONFIG={projectId:'riveria-sanasto-community-test'};
 w.RS_COMMUNITY_CONFIG={};
 w.RS_FAMILY={uid:'synthetic-owner',email:'test@example.invalid',
  storageKey:function(k){return 'run168_owner__'+k;},
  getToken:function(){return Promise.resolve('synthetic');},getEmailVerificationStatus:function(){return Promise.resolve(true);}};
 w.RS_DATA={terms:[],phrases:[]};
 w.RS_V3_RELEASE={isActive:function(){return true;},getState:function(){return {scores:{},words:{}};}};
 w.RS_ACCOUNT=undefined;
 function FakeXHR(){}
 FakeXHR.prototype.open=function(method,url){this.method=method;this.url=url;};
 FakeXHR.prototype.setRequestHeader=function(){};
 FakeXHR.prototype.send=function(body){
  var req={method:this.method,url:this.url,body:body},self=this;requests.push(req);
  Promise.resolve().then(function(){
   var response=xhrHandler(req,requests.length);
   self.status=response.status;
   self.responseText=JSON.stringify(response.value||{});
   self.onload();
  });
 };
 w.XMLHttpRequest=FakeXHR;
 w.eval(read('firestore-quota-guard.js'));
 return {w,d,dom,requests,close:function(){dom.window.close();}};
}
const exhausted={status:429,value:{error:{status:'RESOURCE_EXHAUSTED',message:'Quota exceeded.'}}};
const sample={status:200,value:[{document:{name:'projects/test/databases/(default)/documents/users/member',fields:{
 alias:{stringValue:'Public Person'},learned:{integerValue:'7'},publicStats:{booleanValue:true}
}}}]};
test('guard has only project-wide time/count metadata, persists across reload and ignores permission errors',function(){
 const x=setup(function(){return sample;});
 try{
  const g=x.w.RS_FIRESTORE_QUOTA_GUARD;
  assert.equal(g.allowed(),true);
  assert.equal(g.mark(403,{error:{status:'PERMISSION_DENIED'}}),false);
  assert.equal(g.allowed(),true);
  assert.equal(g.mark(429,exhausted.value),true);
  assert.equal(g.allowed(),false);
  assert.ok(g.minutes()>=14&&g.minutes()<=15);
  const raw=x.w.localStorage.getItem('rs_firestore_quota_pause_v1_riveria-sanasto-community-test');
  assert.ok(raw);
  assert.deepEqual(Object.keys(JSON.parse(raw)).sort(),['count','last','until','v']);
  assert.ok(!raw.includes('owner')&&!raw.includes('token')&&!raw.includes('email')&&!raw.includes('answers'));
  x.w.eval(read('firestore-quota-guard.js'));
  assert.equal(x.w.RS_FIRESTORE_QUOTA_GUARD.allowed(),false);
 }finally{x.close();}
});
test('HTTP429 in users list triggers a shared cooldown; repeated clicks never repeat the server read',async function(){
 const x=setup(function(){return exhausted;});
 try{
  x.w.eval(read('community.js'));x.d.dispatchEvent(new x.w.Event('DOMContentLoaded'));
  await assert.rejects(x.w.RS_COMM.refreshUsers(),/Лимит Firestore/);
  assert.equal(x.requests.length,1);
  await assert.rejects(x.w.RS_COMM.refreshUsers(),/Лимит Firestore/);
  assert.equal(x.requests.length,1,'no second read while Firebase is quota-limited');
  x.w.RS_COMM.renderUsers(x.d.getElementById('main-content'));
  const body=x.d.getElementById('main-content').textContent;
  assert.match(body,/Лимит Firestore/);
  assert.doesNotMatch(body,/Пока нет публичных профилей/);
  assert.ok(!body.includes('test@example.invalid'),'email should not appear in public list');
 }finally{x.close();}
});
test('valid public results are shown and next click within 60 seconds uses in-memory list, not more reads',async function(){
 const x=setup(function(){return sample;});
 try{
  x.w.eval(read('community.js'));x.d.dispatchEvent(new x.w.Event('DOMContentLoaded'));
  await x.w.RS_COMM.refreshUsers();
  await x.w.RS_COMM.refreshUsers();
  assert.equal(x.requests.length,1,'refresh without changes reuses result briefly');
  x.w.RS_COMM.renderUsers(x.d.getElementById('main-content'));
  assert.match(x.d.getElementById('main-content').textContent,/Public Person/);
  assert.doesNotMatch(x.d.getElementById('main-content').textContent,/Quota exceeded/);
 }finally{x.close();}
});
test('account profile 429 blocks settings read, preserves typed profile and stops auto retry',async function(){
 const x=setup(function(){return exhausted;});
 try{
  x.w.eval(read('account-settings.js'));x.d.dispatchEvent(new x.w.Event('DOMContentLoaded'));
  x.w.RS_ACCOUNT.onAuth();
  for(let i=0;i<8;i++)await Promise.resolve();
  assert.equal(x.requests.length,1,'settings read must be blocked once profile hits quota 429');
  const t=x.d.getElementById('account-profile-status').textContent;
  assert.match(t,/Лимит Firestore/);
  assert.equal(x.d.getElementById('community-name').value,'Before');
  await x.w.RS_ACCOUNT.refresh();
  assert.equal(x.requests.length,1,'manual read during quota cooldown should not contact Firebase');
  x.w.dispatchEvent(new x.w.Event('focus'));
  await Promise.resolve();
  assert.equal(x.requests.length,1,'focus should not launch repeated background network queries');
 }finally{x.close();}
});
test('scripting remains ES5 and cannot log or send token, UID or user-answer payload',function(){
 const q=read('firestore-quota-guard.js'),community=read('community.js'),account=read('account-settings.js');
 for(const [name,source] of [['guard',q],['community',community],['account',account]]){
  assert.doesNotMatch(source.replace(/\/\*[\s\S]*?\*\//g,''),/=>|\?\.|\?\?|(\bconst|\blet|\bclass)\s+[A-Za-z_$]/,name+' must run on Safari 12');
 }
 assert.doesNotMatch(q,/\.send\(|\.getToken\(|\.set\(/,'guard should not send any requests');
 const html=read('index.html'),sw=read('sw.js');
 assert.ok(html.indexOf('firestore-quota-guard.js?v=quota-run168-1')<html.indexOf('community.js?v=quota-run168-1'),'guard must load first');
 ['firestore-quota-guard.js?v=quota-run168-1','community.js?v=quota-run168-1','account-settings.js?v=quota-run168-1'].forEach(function(v){
  assert.ok(html.includes(v));assert.ok(sw.includes(v));
 });
 assert.ok(sw.includes('riveria-sanasto-community-v3.0.0-rc37'));
});
