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
w.confirm=()=>true;w.alert=()=>{};w.scrollTo=()=>{};
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
let authObserver=null;
const auth={currentUser:user,onAuthStateChanged:cb=>{authObserver=cb;cb(user);return ()=>{};}};
w.firebase={auth:()=>auth,firestore:firestore};
w.RS_FIREBASE_CONFIG={projectId:'riveria-sanasto-community-test'};
const scripts=['data.js','v3-mediatri-guide.js','app.js','v3-sync-core.js','v3-sync-shadow.js',
 'v3-sync-engine.js','v3-sync-pages.js','v3-sync-finds.js',
 'v3-sync-sha256.js','v3-sync-diff.js','v3-sync-release.js'];
scripts.forEach(n=>w.eval(fs.readFileSync(n,'utf8')+'\n//# sourceURL='+n));
d.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
async function run(){
 assert.ok(d.getElementById('main-content').textContent.includes('Карточ'));
 const medButton=d.querySelector('[data-view="mediatri"]');
 medButton.click();
 assert.ok(d.getElementById('rs-med-guide-results'),
   'Mediatri guide should appear in full unified interface');
 assert.ok(d.getElementById('rs-med-guide-results').textContent.length>15);
 d.querySelector('[data-view="cards"]').click();
 assert.ok(d.getElementById('v3-release-bar'));
 assert.equal(w.RS_V3_RELEASE.isActive(),false);
 const enabled=await w.RS_V3_RELEASE.begin(true);
 assert.equal(enabled,true,'verified account can opt-in after server read and backup');
 assert.equal(w.RS_V3_RELEASE.isActive(),true);
 // Tests should be immediately interactive even during periodic V3 cloud activity:
 // never leave the user in a permanent spinner/loading state.
 d.querySelector('[data-view="practice"]').click();
 assert.ok(d.getElementById('quiz-cat'),'tests topic selector rendered');
 assert.ok(d.querySelectorAll('[data-action="quiz-choose"]').length>=4,
   'V3 tests show at least 4 clickable answers without awaiting a cloud response');
 d.dispatchEvent(new w.Event('visibilitychange'));
 await sleep(80);
 assert.ok(d.querySelectorAll('[data-action="quiz-choose"]').length>=4,
   'returning from another browser tab must not indefinitely block quiz choices');
 d.querySelector('[data-view="cards"]').click();
 assert.ok(Object.keys(w.localStorage).some(k=>k.indexOf('rs_unified_v3_prior_backup_')===0));
 let flip=d.querySelector('[data-action="flip"]');
 assert.ok(flip,'full classic UI must render a study card');
 flip.click();
 const answer=d.querySelector('[data-action="mark-good"]');
 assert.ok(answer);
 answer.click();
 for(let i=0;i<24&&Object.keys(events).length===0;i++)await sleep(50);
 if(Object.keys(events).length!==1){
   console.error('DIAGNOSTIC first answer',{
     active:w.RS_V3_RELEASE.isActive(),
     status:d.getElementById('v3-release-bar')?.textContent,
     localScores:w.RS_FAMILY.getState().scores,
     cloudEvents:Object.keys(events),
     snapshot:w.RS_V3_RELEASE.getState()?.scores
   });
 }
 assert.equal(Object.keys(events).length,1,'one public answer goes to immutable server history');
 assert.equal(Object.values(events)[0].kind,'answer');
 assert.match(Object.values(events)[0].target,/^[TMPH]\d{5,7}$/);
 const stored=w.RS_FAMILY.getState();
 assert.ok(Object.keys(stored.scores).length>=1);
 const add=d.querySelector('[data-view="add"]');
 assert.ok(add);
 add.click();
 assert.ok(d.getElementById('v3-finds-panel'),'full UI contains live My Finds');
 // Draft is stored per account immediately and restored after a cloud refresh
 // or returning from a different browser tab.
 let fi=d.querySelector('#add-form [name="fi"]');
 fi.value='tarkistamaton sana';fi.dispatchEvent(new w.Event('input',{bubbles:true}));
 let ru=d.querySelector('#add-form [name="ru"]');
 ru.value='черновик перевода';ru.dispatchEvent(new w.Event('input',{bubbles:true}));
 d.getElementById('v3-find-topic').value='study';
 d.getElementById('v3-find-topic').dispatchEvent(new w.Event('change',{bubbles:true}));
 d.getElementById('v3-find-note').value='не опубликовано';
 d.getElementById('v3-find-note').dispatchEvent(new w.Event('input',{bubbles:true}));
 const draftKey=w.RS_FAMILY.storageKey('rs_v3_find_draft_v1');
 assert.equal(JSON.parse(w.localStorage.getItem(draftKey)).fi,'tarkistamaton sana');
 w.RS_FAMILY_REFRESH(false); // V3 cloud readback rebuilds the #add-form
 assert.equal(d.querySelector('#add-form [name="fi"]').value,'tarkistamaton sana');
 assert.equal(d.querySelector('#add-form [name="ru"]').value,'черновик перевода');
 assert.equal(d.getElementById('v3-find-topic').value,'study');
 assert.equal(d.getElementById('v3-find-note').value,'не опубликовано');
 d.dispatchEvent(new w.Event('visibilitychange'));
 await sleep(80);
 assert.equal(d.querySelector('#add-form [name="fi"]').value,'tarkistamaton sana');
 assert.equal(d.querySelector('#add-form [name="ru"]').value,'черновик перевода');
 assert.equal(JSON.parse(w.localStorage.getItem(draftKey)).fi,'tarkistamaton sana');
 assert.equal(Object.values(events).filter(x=>x.kind==='word_upsert').length,0,
   'autosaved draft must not be uploaded to Firebase before explicit Add');
 fi=d.querySelector('#add-form [name="fi"]');
 fi.value='peseytyminen';fi.dispatchEvent(new w.Event('input',{bubbles:true}));
 ru=d.querySelector('#add-form [name="ru"]');
 ru.value='';ru.dispatchEvent(new w.Event('input',{bubbles:true}));
 await sleep(10);
 const buttons=[...d.querySelectorAll('#v3-find-matches button')];
 assert.ok(buttons.some(x=>x.textContent.includes('peseytyminen')),'existing term is suggested');
 buttons.filter(x=>x.textContent.includes('peseytyminen'))[0].click();
 await sleep(100);
 assert.ok(Object.values(events).some(x=>x.kind==='collection_set'&&x.target==='T00045'),
 'existing term must be saved as a find, without creating private duplicate');
 assert.equal(Object.values(events).filter(x=>x.kind==='word_upsert').length,0);
 assert.ok(Object.keys(w.RS_V3_RELEASE.getState().finds).length>=1);
 assert.equal(w.localStorage.getItem(draftKey),null,
   'draft clears only after successfully adding an existing word');
 // The new primary button must create a private W_ word and its finding together,
 // and must retain the selected category and optional personal note.
 let newFi=d.querySelector('#add-form [name="fi"]');
 assert.ok(newFi,'form restored after adding an existing find');
 newFi.value='koesanasto-147';newFi.dispatchEvent(new w.Event('input',{bubbles:true}));
 let newRu=d.querySelector('#add-form [name="ru"]');
 newRu.value='проверочное слово';newRu.dispatchEvent(new w.Event('input',{bubbles:true}));
 d.getElementById('v3-find-topic').value='practice';
 d.getElementById('v3-find-note').value='с моего занятия';
 d.getElementById('v3-find-note').dispatchEvent(new w.Event('input',{bubbles:true}));
 const primary=d.getElementById('v3-find-add');
 assert.ok(primary&&primary.textContent.includes('Сохранить новое'),
   'new words need a visible explicit add action');
 primary.click();
 for(let i=0;i<40&&!Object.values(events).some(e=>e.kind==='collection_set'&&/^W_/.test(e.target));i++)
   await sleep(50);
 const personalWord=Object.values(events).find(e=>e.kind==='word_upsert'&&/^W_/.test(e.target));
 const personalFind=Object.values(events).find(e=>e.kind==='collection_set'&&e.target===(personalWord&&personalWord.target));
 assert.ok(personalWord,'new word created with private identity');
 assert.ok(personalFind,'new personal word added to My Finds');
 assert.equal(personalFind.data.topic,'practice');
 assert.equal(personalFind.data.note,'с моего занятия');
 assert.equal(w.localStorage.getItem(draftKey),null,'draft clears only after successful double write');
 // Switching Google accounts without an intermediate signed-out event must
 // invalidate the old owner. A queued old answer cannot become new-owner data.
 const beforeSwitch=Object.keys(events).length;
 d.querySelector('[data-view="cards"]').click();
 d.querySelector('[data-action="flip"]').click();
 d.querySelector('[data-action="mark-good"]').click();
 const secondUser={uid:'mock-second-owner',email:'second@example.invalid',emailVerified:true};
 w.RS_FAMILY.uid=secondUser.uid;
 auth.currentUser=secondUser;
 authObserver(secondUser);
 await sleep(120);
 assert.equal(w.RS_V3_RELEASE.isActive(),false,'old V3 session must close on direct account switch');
 assert.equal(w.RS_V3_RELEASE.getState(),null,'old account snapshot must disappear');
 assert.equal(Object.keys(events).length,beforeSwitch,'old pending write cannot run under another account');
 // Return to the same owner: verified local deltas should be recovered once.
 w.RS_FAMILY.uid=user.uid;
 auth.currentUser=user;
 authObserver(user);
 await sleep(280);
 assert.equal(w.RS_V3_RELEASE.isActive(),true,'original account can safely resume');
 assert.equal(Object.keys(events).length,beforeSwitch+1,'local answer recovered exactly once');
 console.log('PASS unified real UI: V3 opt-in, full UI, no duplicate finds, direct account switch and pending-event recovery');
 dom.window.close();
}
run().catch(e=>{console.error(e);process.exitCode=1;dom.window.close();});
