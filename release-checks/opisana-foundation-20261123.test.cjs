'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const base=path.resolve(__dirname,'..');
const config={apiKey:'synthetic-api-key',projectId:'riveria-sanasto-community-test',authDomain:'riveria-sanasto-community-test.firebaseapp.com'};
function read(p){return fs.readFileSync(path.join(base,p),'utf8');}
function setup(html,source){
 const dom=new JSDOM(read(html),{url:'https://sanastoyhteiso.github.io/'+html,runScripts:'outside-only'});
 const w=dom.window,d=w.document;let callback;
 Object.defineProperty(w.navigator,'language',{configurable:true,value:'ru-RU'});
 w.RS_FIREBASE_CONFIG=config;
 const auth={currentUser:null,onIdTokenChanged:function(f){callback=f;}};
 const firebase={apps:[],initializeApp:function(c){const app={options:c};this.apps.push(app);return app;},
  app:function(){return this.apps[0];},auth:function(){return auth;}};
 w.firebase=firebase;
 w.eval(read(source));d.dispatchEvent(new w.Event('DOMContentLoaded'));
 return {dom,w,d,auth,emit:function(user){auth.currentUser=user;callback(user);}};
}
function user(uid,admin){
 return {uid:uid,email:uid+'@example.test',displayName:uid,emailVerified:true,isAnonymous:false,
 getIdTokenResult:function(){return Promise.resolve({claims:{user_id:uid,admin:admin===true}});}};
}
function flush(){return new Promise(function(r){setImmediate(r);});}
test('student cabinet stays hidden without verified auth and reads only current UID local data',async function(){
 const b=setup('cabinet/index.html','cabinet/cabinet.js');
 try{
  assert.equal(b.d.getElementById('cabinet').hidden,true);
  b.w.localStorage.setItem('rs_family_v1_person1__rs_scores_v1',JSON.stringify({'T012345':{seen:3,correct:2,wrong:1}}));
  b.w.localStorage.setItem('rs_family_v1_person2__rs_scores_v1',JSON.stringify({'T012345':{seen:4000,correct:4000,wrong:0}}));
  b.emit(user('person1',false));await flush();
  assert.equal(b.d.getElementById('cabinet').hidden,false);
  assert.equal(b.d.getElementById('profile-email').textContent,'person1@example.test');
  assert.match(b.d.getElementById('progress-metrics').textContent,/3/);
  assert.doesNotMatch(b.d.getElementById('progress-metrics').textContent,/4000/);
  b.emit(null);await flush();
  assert.equal(b.d.getElementById('cabinet').hidden,true);
  assert.equal(b.d.getElementById('profile-email').textContent,'');
 }finally{b.dom.window.close();}
});
test('student with V3-only or no legacy data never sees invented zero progress',async function(){
 const b=setup('cabinet/index.html','cabinet/cabinet.js');
 try{
  b.emit(user('fresh-learner',false));await flush();
  assert.equal(b.d.querySelectorAll('.metric').length,0);
  assert.match(b.d.getElementById('progress-caption').textContent,/не значит/);
  assert.match(b.d.getElementById('scope-note').textContent,/IndexedDB/);
 }finally{b.dom.window.close();}
});
test('admin menu planner is denied without signed admin claim and never publishes site changes',async function(){
 const b=setup('admin/layout/index.html','admin/layout/layout.js');
 try{
  b.emit(user('ordinary-student',false));await flush();
  assert.equal(b.d.getElementById('admin-area').hidden,true);
  assert.equal(b.d.querySelectorAll('[data-section-id]').length,0);
  b.emit(user('site-owner',true));await flush();
  assert.equal(b.d.getElementById('admin-area').hidden,false);
  assert.equal(b.d.querySelectorAll('[data-section-id]').length,9);
  const checkbox=b.d.querySelector('[data-section-id="cards"] input[type="checkbox"]');
  checkbox.checked=false;checkbox.dispatchEvent(new b.w.Event('change',{bubbles:true}));
  const saved=JSON.parse(b.w.localStorage.getItem('rs_opisana_admin_layout_draft_v1_site-owner'));
  assert.equal(saved.find(x=>x.id==='cards').visible,false);
  assert.equal(b.w.localStorage.getItem('rs_opisana_admin_layout_draft_v1_ordinary-student'),null);
  b.emit(user('site-owner',false));await flush();
  assert.equal(b.d.getElementById('admin-area').hidden,true);
  assert.equal(b.d.querySelectorAll('[data-section-id]').length,0);
 }finally{b.dom.window.close();}
});
test('new pages remain unlinked from existing public navigation and have no cloud writes',function(){
 const index=read('index.html'),admin=read('admin/index.html');
 assert.doesNotMatch(index,/href=["'](?:\.\/)?cabinet\//);
 assert.doesNotMatch(index,/href=["'](?:\.\/)?admin\/layout\//);
 assert.doesNotMatch(admin,/href=["']layout\//);
 assert.match(read('admin/layout/layout.js'),/getIdTokenResult\(true\)/);
 assert.doesNotMatch(read('admin/layout/layout.js'),/firebase\.firestore|db\.collection|fetch\s*\(/);
 assert.doesNotMatch(read('cabinet/cabinet.js'),/\.set\(|firebase\.firestore|db\.collection|fetch\s*\(/);
});
