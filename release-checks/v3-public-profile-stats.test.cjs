'use strict';
/* RUN142 NEW-020: real community.js with synthetic data and mocked REST only.
 * No actual user data, network, Firebase write, credentials or live diagnostics.
 */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {JSDOM}=require('jsdom');

function setup(optin){
 const dom=new JSDOM('<!doctype html><html><body><div id="main-content"></div><div id="community-status"></div></body></html>',{
   url:'https://sanastoyhteiso.github.io/',runScripts:'outside-only',pretendToBeVisual:true
 });
 const w=dom.window,d=w.document,uid='synthetic-owner-142',requests=[];
 const store=k=>'rs_family_v1_'+uid+'__'+k;
 // The legacy snapshot has deliberately wrong/stale progress.
 const legacy={};for(let n=0;n<138;n++)legacy['T'+String(n+1).padStart(5,'0')]={correct:1};
 w.localStorage.setItem(store('rs_scores_v1'),JSON.stringify(legacy));
 const profile=k=>'rs_community_2_'+uid+'_'+k;
 if(optin){w.localStorage.setItem(profile('stats'),'true');w.localStorage.setItem(profile('name'),'"Synthetic Owner"');}
 const v3={
   scores:{
     T00001:{correct:1,learned:true},
     T00002:{correct:3,learned:true},
     T00003:{correct:4,learned:false}, // explicit manual unlearned takes precedence
     M00001:{correct:10,learned:true} // out of displayed vocabulary
   },words:{},favorites:{}
 };
 w.RS_V3_RELEASE={isActive:()=>true,getState:()=>v3};
 w.RS_FIREBASE_CONFIG={projectId:'riveria-sanasto-community-test'};
 w.RS_COMMUNITY_CONFIG={};
 w.RS_DATA={terms:[1,2,3].map(i=>({id:'T'+String(i).padStart(5,'0')})),phrases:[]};
 w.RS_FAMILY={uid,email:'test@example.invalid',sharedEnabled:()=>true,
   storageKey:store,getToken:()=>Promise.resolve('test-synthetic-token')};
 class MockXHR{
   open(method,url){this.method=method;this.url=url;}
   setRequestHeader(){}
   send(body){
     requests.push({method:this.method,url:this.url,body:body?JSON.parse(body):null});
     Promise.resolve().then(()=>{
       this.status=200;
       this.responseText=JSON.stringify(this.method==='POST'?[
         {document:{name:'projects/test/databases/(default)/documents/users/'+uid,
           fields:{alias:{stringValue:'Synthetic Owner'},learned:{integerValue:'138'},publicStats:{booleanValue:true}}}},
         {document:{name:'projects/test/databases/(default)/documents/users/synthetic-another',
           fields:{alias:{stringValue:'Other Learner'},learned:{integerValue:'89'},publicStats:{booleanValue:true}}}}
       ]:{});
       this.onload();
     });
   }
 }
 w.XMLHttpRequest=MockXHR;
 w.eval(fs.readFileSync('community.js','utf8')+'\n//# sourceURL=community.js');
 d.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
 return {w,d,dom,requests,uid,v3};
}
const drain=async()=>{await Promise.resolve();await Promise.resolve();await Promise.resolve();};
test('owner V3 public list uses latest learned flags, not stale V2 138; other versions marked unknown',async()=>{
 const x=setup(true);try{
  await x.w.RS_COMM.refreshUsers();
  x.w.RS_COMM.renderUsers(x.d.getElementById('main-content'));
  const text=x.d.getElementById('main-content').textContent;
  assert.match(text,/Synthetic Owner/);
  assert.match(text,/2 выучено в V3/);
  assert.doesNotMatch(text,/138 выученных/);
  assert.match(text,/Other Learner/);
  assert.match(text,/версия не указана/);
 }finally{x.dom.window.close();}
});
test('confirmed V3 sync updates only explicitly opted-in own Firestore profile to 2',async()=>{
 const x=setup(true);try{
  x.w.RS_COMM.onV3Confirmed();
  await drain();
  const patches=x.requests.filter(r=>r.method==='PATCH');
  assert.equal(patches.length,1);
  assert.ok(patches[0].url.endsWith('/documents/users/'+x.uid));
  assert.equal(patches[0].body.fields.learned.integerValue,'2');
  assert.equal(patches[0].body.fields.publicStats.booleanValue,true);
  assert.equal(patches[0].body.fields.alias.stringValue,'Synthetic Owner');
  x.w.RS_COMM.onV3Confirmed();await drain();
  assert.equal(x.requests.filter(r=>r.method==='PATCH').length,1,'no extra writes for unchanged count');
 }finally{x.dom.window.close();}
});
test('no public consent means zero public profile writes even after successful sync',async()=>{
 const x=setup(false);try{
  x.w.RS_COMM.onV3Confirmed();await drain();
  assert.equal(x.requests.filter(r=>r.method==='PATCH').length,0);
 }finally{x.dom.window.close();}
});
test('unknown V3 state never publishes stale legacy count',async()=>{
 const x=setup(true);try{
  x.w.RS_V3_RELEASE.getState=()=>null;
  x.w.RS_COMM.onV3Confirmed();await drain();
  assert.equal(x.requests.filter(r=>r.method==='PATCH').length,0);
 }finally{x.dom.window.close();}
});
