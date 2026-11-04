/* Synthetic browser integration: real full UI, mock Firebase and fake IndexedDB.
 * No network calls, no real UID, no production Firebase or user data.
 */
'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const {JSDOM}=require('jsdom');
const {IDBFactory}=require('fake-indexeddb');
const html=fs.readFileSync('index.html','utf8');
const dom=new JSDOM(html,{url:'https://sanastoyhteiso.github.io/',runScripts:'outside-only',
 pretendToBeVisual:true});
const w=dom.window,d=w.document,events={};
const user={uid:'mock-owner',email:'owner@example.invalid',emailVerified:true};
Object.defineProperty(w,'indexedDB',{configurable:true,value:new IDBFactory()});
Object.defineProperty(w,'crypto',{configurable:true,value:crypto.webcrypto});
w.confirm=()=>true;w.alert=()=>{};
function get(k,other){const x=w.localStorage.getItem('test_uid__'+k);return x?JSON.parse(x):other;}
function put(k,v){w.localStorage.setItem('test_uid__'+k,JSON.stringify(v));}
w.RS_FAMILY={
 uid:user.uid,email:user.email,sharedEnabled:()=>true,statusText:()=> 'Проверка',
 storageKey:k=>'test_uid__'+k,
 getState:()=>{
  const words={};get('rs_user_words_v1',[]).forEach(x=>words[x.id]=x);
  const favorites={};const fav=get('rs_favorites_v1',{});
  Object.keys(fav).forEach(id=>favorites[id]={starred:!!fav[id],updatedAt:1});
  return {scores:get('rs_scores_v1',{}),words,favorites,scope:{value:'all',updatedAt:1}};
 },
 putState:x=>{
  put('rs_scores_v1',x.scores);
  put('rs_user_words_v1',Object.keys(x.words).map(k=>x.words[k]));
  const f={};Object.keys(x.favorites).forEach(k=>f[k]=!!x.favorites[k].starred);
  put('rs_favorites_v1',f);
  if(w.RS_FAMILY_REFRESH)w.RS_FAMILY_REFRESH(false);
  return true;
 },
 sync:()=>Promise.resolve(true),schedule:()=>{},migrate:()=>{},logout:()=>{}
};
w.RS_COMM={subscribedTerms:()=>[],renderUsers:()=>{},renderLibrary:()=>{},sync:()=>Promise.resolve(true)};
function snapshot(items){return {metadata:{fromCache:false,hasPendingWrites:false},
 forEach:fn=>items.forEach(x=>fn({id:x.id,data:()=>x})),size:items.length};}
function colRef(){
 return {
  orderBy:function(){return this;},
  limit:function(){return this;},
  startAfter:function(){return this;},
  get:()=>Promise.resolve(snapshot(Object.values(events))),
  onSnapshot:function(metadata,cb){cb(snapshot(Object.values(events)));return ()=>{};},
  doc:function(eventId){return{
   get:()=>Promise.resolve({exists:!!events[eventId],data:()=>events[eventId]}),
   set:e=>{if(events[eventId])throw Error('duplicate cloud write');events[eventId]=e;return Promise.resolve();}
  };}
 };
}
const firestore=function(){return{collection:()=>({doc:()=>({collection:()=>colRef()})})};};
firestore.FieldPath={documentId:()=>({key:'documentId'})};
const auth={currentUser:user,onAuthStateChanged:cb=>{cb(user);return ()=>{};}};
w.firebase={auth:()=>auth,firestore:firestore};
w.RS_FIREBASE_CONFIG={projectId:'riveria-sanasto-community-test'};
const scripts=['data.js','app.js','v3-sync-core.js','v3-sync-shadow.js',
 'v3-sync-engine.js','v3-sync-pages.js','v3-sync-finds.js',
 'v3-sync-sha256.js','v3-sync-diff.js','v3-sync-release.js'];
scripts.forEach(n=>w.eval(fs.readFileSync(n,'utf8')+'\n//# sourceURL='+n));
d.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
async function run(){
 assert.ok(d.getElementById('main-content').textContent.includes('Карточ'));
 assert.ok(d.getElementById('v3-release-bar'));
 assert.equal(w.RS_V3_RELEASE.isActive(),false);
 const enabled=await w.RS_V3_RELEASE.begin(true);
 assert.equal(enabled,true,'verified account can opt-in after server read and backup');
 assert.equal(w.RS_V3_RELEASE.isActive(),true);
 assert.ok(Object.keys(w.localStorage).some(k=>k.indexOf('rs_unified_v3_prior_backup_')===0));
 let flip=d.querySelector('[data-action="flip"]');
 assert.ok(flip,'full classic UI must render a study card');
 flip.click();
 const answer=d.querySelector('[data-action="mark-good"]');
 assert.ok(answer);
 answer.click();
 await sleep(100);
 assert.equal(Object.keys(events).length,1,'one public answer goes to immutable server history');
 assert.equal(Object.values(events)[0].kind,'answer');
 assert.match(Object.values(events)[0].target,/^T\d{5,7}$/);
 const stored=w.RS_FAMILY.getState();
 assert.ok(Object.keys(stored.scores).length>=1);
 const add=d.querySelector('[data-view="add"]');
 assert.ok(add);
 add.click();
 assert.ok(d.getElementById('v3-finds-panel'),'full UI contains live My Finds');
 const fi=d.querySelector('#add-form [name="fi"]');
 fi.value='peseytyminen';fi.dispatchEvent(new w.Event('input',{bubbles:true}));
 await sleep(10);
 const buttons=[...d.querySelectorAll('#v3-find-matches button')];
 assert.ok(buttons.some(x=>x.textContent.includes('peseytyminen')),'existing term is suggested');
 buttons.filter(x=>x.textContent.includes('peseytyminen'))[0].click();
 await sleep(100);
 assert.ok(Object.values(events).some(x=>x.kind==='collection_set'&&x.target==='T00045'),
 'existing term must be saved as a find, without creating private duplicate');
 assert.equal(Object.values(events).filter(x=>x.kind==='word_upsert').length,0);
 assert.ok(Object.keys(w.RS_V3_RELEASE.getState().finds).length>=1);
 console.log('PASS unified real UI: opt-in Auth, backup, IndexedDB, answer event, find existing word, no duplicate');
 dom.window.close();
}
run().catch(e=>{console.error(e);process.exitCode=1;dom.window.close();});
