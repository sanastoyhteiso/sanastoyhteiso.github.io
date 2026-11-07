'use strict';
/* RUN-077. Real release family.js Google login acceptance with synthetic
 * Firebase + browser DOM. No network, actual identity, cloud or data writes.
 * The test says nothing about live Firebase or physical Safari/PWA.
 */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const SOURCE=fs.readFileSync('family.js','utf8');
const HTML=fs.readFileSync('index.html','utf8');
function tick(){return new Promise(r=>setImmediate(r));}
function fixture(opts={}){
  const nodes={};
  for(const id of ['family-login-form','family-submit','family-gate',
    'family-message','family-setup-warning','family-account-badge','family-cloud-state']){
    const listeners={};
    nodes[id]={hidden:false,disabled:false,textContent:'',className:'',
      addEventListener(k,fn){listeners[k]=fn;},listeners};
  }
  const classes=new Map(),saved=new Map(Object.entries(opts.saved||{}));
  const localStorage={getItem:k=>saved.has(k)?saved.get(k):null,
    setItem:(k,v)=>saved.set(String(k),String(v)),removeItem:k=>saved.delete(k)};
  const timers=new Map();let nextId=0;
  function setTimer(fn,ms){const id=++nextId;timers.set(id,{fn,ms});return id;}
  function clearTimer(id){timers.delete(id);}
  const document={readyState:'complete',getElementById:k=>nodes[k]||null,
    body:{classList:{toggle:(k,v)=>classes.set(k,v)}}};
  const navigator={onLine:opts.offline!==true};
  const user={uid:'synthetic_owner_1',email:'demo@example.invalid',emailVerified:true};
  const calls={popup:0,persistence:0,initialize:0};
  const auth={currentUser:null,
    setPersistence(){calls.persistence++;return Promise.resolve();},
    onAuthStateChanged(cb){cb(opts.signedIn?user:null);return ()=>{};},
    signInWithPopup(){
      calls.popup++;
      if(opts.popup==='blocked')return Promise.reject({code:'auth/popup-blocked'});
      if(opts.popup==='offline')return Promise.reject({code:'auth/network-request-failed'});
      if(opts.popup==='stalled')return new Promise(()=>{});
      if(opts.popup==='throw')throw {code:'auth/popup-blocked'};
      return Promise.resolve({user});
    }};
  const authApi=function(){return auth;};
  authApi.Auth={Persistence:{LOCAL:'LOCAL'}};
  authApi.GoogleAuthProvider=function(){};
  const firebase={apps:[],initializeApp(){
      calls.initialize++;
      if(opts.initError)throw Error('Synthetic Firebase init failure');
      this.apps.push({});
    },auth:authApi};
  const window={RS_FIREBASE_CONFIG:{apiKey:opts.badConfig?'PASTE_KEY':
      'synthetic-API-KEY-1234567890123456',projectId:'riveria-sanasto-community-test',
      authDomain:'synthetic.invalid'},firebase:opts.noSdk?undefined:firebase,
    addEventListener(){},console:{warn(){}},confirm(){return true;}};
  const context={window,document,navigator,localStorage,setTimeout:setTimer,
    clearTimeout:clearTimer,Promise,console:{warn(){}},Date,JSON,Array,Object,
    String,Number,Math,Error};
  if(!opts.noSdk)context.firebase=firebase;
  vm.runInNewContext(SOURCE,context,{filename:'release-family.js',timeout:2000});
  function submit(){
    const fn=nodes['family-login-form'].listeners.submit;
    assert.equal(typeof fn,'function','Real login submit handler missing');
    let prevented=false;fn({preventDefault(){prevented=true;}});
    assert.equal(prevented,true);
  }
  return {nodes,classes,saved,timers,calls,user,window,submit,
    timeout(){
      const pending=[...timers.values()].filter(t=>t.ms===25000);
      assert.equal(pending.length,1,'Missing 25s stalled-login protection');
      pending[0].fn();
    },
    message:()=>nodes['family-message'].textContent};
}
test('real release HTML includes enabled Google login button and family.js handler',()=>{
  assert.match(HTML,/<form\s+id="family-login-form">/);
  assert.match(HTML,/<button[^>]+type="submit"[^>]+id="family-submit"[^>]*>/);
  assert.doesNotMatch(HTML,/<button[^>]+id="family-submit"[^>]+disabled\b/);
  assert.ok(SOURCE.includes("f.addEventListener('submit',login)"));
});
test('initial login is enabled and duplicate clicks open only one popup',async()=>{
  const x=fixture();
  assert.equal(x.nodes['family-submit'].disabled,false);
  assert.equal(x.classes.get('family-locked'),true);
  x.submit();x.submit();
  assert.equal(x.calls.popup,1);
  assert.equal(x.nodes['family-submit'].disabled,true);
  await tick();await tick();
  assert.equal(x.window.RS_FAMILY.uid,x.user.uid);
  assert.equal(x.classes.get('family-locked'),false);
  assert.equal(x.nodes['family-submit'].disabled,false);
  assert.equal(JSON.parse(x.saved.get('rs_family_auth_v1')).uid,x.user.uid);
  assert.equal(x.timers.size,0);
});
test('blocked Google popup recovers button and preserves local learning data',async()=>{
  const progress='{"T00001":{"seen":4}}';
  const x=fixture({popup:'blocked',saved:{rs_scores_v1:progress}});
  x.submit();await tick();await tick();
  assert.equal(x.nodes['family-submit'].disabled,false);
  assert.match(x.message(),/обычном браузере/);
  assert.equal(x.saved.get('rs_scores_v1'),progress);
  x.submit();await tick();await tick();
  assert.equal(x.calls.popup,2,'retry should stay available');
});
test('offline entry gives a usable error rather than dead login',()=>{
  const x=fixture({offline:true});x.submit();
  assert.equal(x.calls.popup,0);
  assert.equal(x.nodes['family-submit'].disabled,false);
  assert.match(x.message(),/нужен интернет/);
});
test('missing Firebase SDK leaves button enabled and gives diagnostic',()=>{
  const x=fixture({noSdk:true});
  assert.match(x.message(),/Firebase Authentication не загрузился/);
  x.submit();
  assert.equal(x.nodes['family-submit'].disabled,false);
  assert.match(x.message(),/Модуль входа ещё не готов/);
});
test('Firebase initialization error leaves button enabled and gives diagnostic',()=>{
  const x=fixture({initError:true});
  assert.match(x.message(),/Ошибка запуска Firebase/);
  x.submit();assert.equal(x.nodes['family-submit'].disabled,false);
  assert.match(x.message(),/Модуль входа ещё не готов/);
});
test('stalled popup times out, re-enables button, does not erase local answers',()=>{
  const progress='{"T00001":{"correct":1}}';
  const x=fixture({popup:'stalled',saved:{rs_scores_v1:progress}});
  x.submit();assert.equal(x.nodes['family-submit'].disabled,true);
  x.timeout();
  assert.equal(x.nodes['family-submit'].disabled,false);
  assert.match(x.message(),/не завершён/);
  assert.equal(x.saved.get('rs_scores_v1'),progress);
});
test('previously signed-in Firebase account skips popup and opens study UI',()=>{
  const x=fixture({signedIn:true});
  assert.equal(x.calls.popup,0);
  assert.equal(x.classes.get('family-locked'),false);
  assert.equal(x.window.RS_FAMILY.uid,x.user.uid);
  assert.equal(x.calls.persistence,1);
});
test('unconfigured Firebase shows setup warning, not an unresponsive button',()=>{
  const x=fixture({badConfig:true});
  assert.equal(x.calls.initialize,0);
  assert.equal(x.nodes['family-setup-warning'].hidden,false);
  assert.match(x.message(),/настроить Firebase/);
  x.submit();assert.equal(x.nodes['family-submit'].disabled,false);
});
