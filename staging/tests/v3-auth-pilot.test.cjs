/* Isolated Google Auth pilot UI: synthetic JSDOM regression.
 * Nothing here calls Firebase or network: both Auth and SDK are fakes.
 * Physical Safari/Google popup behavior remains a separate device test.
 */
'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path');
const acorn=require('acorn'),{JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'../..');
const dir=path.join(root,'staging/auth-pilot');
const read=name=>fs.readFileSync(path.join(dir,name),'utf8');
const html=read('index.html'),publicConfig=read('config.js'),pilotJS=read('pilot.js');
const backendNames=['v3-staging-project-guard.js','rs-v3-firebase-compat-auth.js',
 'rs-v3-auth-controller.js'];
const backend=backendNames.map(x=>fs.readFileSync(path.join(root,'staging/backend',x),'utf8'));
[publicConfig,pilotJS,...backend].forEach(s=>acorn.parse(s,{ecmaVersion:5}));
const expectedID='sanastoyhteiso-v3-development';
assert.ok(publicConfig.includes("projectId:'"+expectedID+"'"));
assert.ok(publicConfig.includes("authDomain:'"+expectedID+".firebaseapp.com'"));
assert.ok(publicConfig.includes("productionProjectId:'riveria-sanasto-community-test'"));
assert.ok(publicConfig.includes("appId:'1:482528465775:web:0d6f9e35c379989206ce9a'"));
assert.ok(publicConfig.includes("apiKey:'AIzaSyDGkOv5dw2e0UuBPJkATlgxHYdlSqKleHo'"));
assert.ok(!publicConfig.includes('initializeApp('));
assert.ok(!publicConfig.includes('PRIVATE KEY'));
assert.ok(html.includes('noindex,nofollow'));
assert.ok(html.includes("default-src 'none'"));
assert.ok(!html.includes("connect-src 'none'"),'Auth pilot must explicitly allow Firebase Auth');
assert.ok(!html.includes('firebase-firestore'));
assert.ok(!html.includes('firebase-analytics'));
assert.ok(!html.includes('firebase-storage'));
assert.ok(!html.includes('serviceWorker.register'));
assert.ok(!html.includes('rs-demo-offline'));
assert.ok(html.includes('firebase-app-compat.js')&&html.includes('firebase-auth-compat.js'));
assert.ok(html.includes('data-pilot-lang="fi"')&&html.includes('data-pilot-lang="en"')&&html.includes('data-pilot-lang="ru"'));
const scriptRefs=[...html.matchAll(/<script defer src="([^"]+)"/g)].map(x=>x[1]);
assert.deepStrictEqual(scriptRefs,[
 'config.js','guard.js',
 'https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js',
 'https://www.gstatic.com/firebasejs/12.19.0/firebase-auth-compat.js',
 'adapter.js','controller.js','pilot.js'
]);
function makeSdk(){
  const calls={initialize:0,popups:0,signouts:0,active:null,observer:null,
    provider:null};
  const auth={
    currentUser:null,
    onAuthStateChanged(fn){calls.observer=fn;fn(this.currentUser);return()=>{calls.observer=null;};},
    signInWithPopup(provider){
      calls.popups++;calls.provider=provider;
      const current={uid:'syntheticAuthUser',email:'demo@example.invalid',
        displayName:'Synthetic User',emailVerified:true,
        getIdToken:()=>Promise.resolve('NEVER-PUT-TOKEN-ON-PAGE'),
        reload:()=>Promise.resolve()};
      auth.currentUser=current;
      if(calls.observer)calls.observer(current);
      return Promise.resolve({user:current});
    },
    signOut(){calls.signouts++;auth.currentUser=null;
      if(calls.observer)calls.observer(null);return Promise.resolve();}
  };
  function sdkAuth(){return auth}
  sdkAuth.GoogleAuthProvider=function(){};
  const sdk={
    apps:[],auth:sdkAuth,
    initializeApp(config,name){
      calls.initialize++;
      const app={options:config,name};
      this.apps.push(app);return app;
    }
  };
  return {sdk,calls};
}
function bootstrap(url,allowSdk){
  const dom=new JSDOM(html,{url,runScripts:'outside-only'});
  const w=dom.window;
  const {sdk,calls}=makeSdk();
  if(allowSdk)w.firebase=sdk;
  w.eval(publicConfig);
  w.eval(backend[0]);
  w.eval(backend[1]);
  w.eval(backend[2]);
  w.eval(pilotJS);
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  return {w,calls,close:()=>dom.window.close()};
}
function tick(){return new Promise(resolve=>setImmediate(resolve))}
(async()=>{
 const good=bootstrap('https://velardream-ctrl.github.io/riveria-sanasto-community-test/v3-classic/auth-pilot/',true);
 const d=good.w.document;
 assert.equal(good.calls.initialize,1,'Initialize only one isolated named Firebase app');
 assert.equal(good.calls.popups,0,'Never open a popup automatically');
 assert.equal(d.getElementById('pilot-project').textContent,expectedID);
 assert.equal(d.getElementById('pilot-login').disabled,false);
 d.querySelector('[data-pilot-lang="ru"]').click();
 assert.equal(d.getElementById('pilot-login').textContent,'Войти через Google');
 d.getElementById('pilot-login').click();
 assert.equal(good.calls.popups,1,'Popup must start synchronously inside click');
 await tick();await tick();
 assert.equal(d.getElementById('pilot-email').textContent,'demo@example.invalid');
 assert.equal(d.getElementById('pilot-login').disabled,true);
 assert.ok(d.getElementById('pilot-status').textContent.includes('подтверждён'),
   'After synthetic Google login actual status: '+JSON.stringify(d.getElementById('pilot-status').textContent));
 assert.ok(!d.documentElement.textContent.includes('NEVER-PUT-TOKEN-ON-PAGE'));
 assert.equal(good.w.localStorage.length,0,'Pilot UI never saves personal learning data');
 d.getElementById('pilot-logout').click();
 await tick();await tick();
 assert.equal(good.calls.signouts,1);
 assert.equal(d.getElementById('pilot-login').disabled,false);
 assert.equal(d.getElementById('pilot-email').textContent,'—');
 good.close();
 const outside=bootstrap('https://sanastoyhteiso.github.io/v3-classic/auth-pilot/',true);
 assert.equal(outside.calls.initialize,0,'Never initialize SDK on production origin');
 assert.equal(outside.w.document.getElementById('pilot-login').disabled,true);
 assert.equal(outside.w.document.getElementById('pilot-message').hidden,false);
 outside.close();
 const wrongPath=bootstrap('https://velardream-ctrl.github.io/riveria-sanasto-community-test/v3-classic/',true);
 assert.equal(wrongPath.calls.initialize,0,'Only dedicated auth-pilot route may initialize');
 wrongPath.close();
 const noSdk=bootstrap('https://velardream-ctrl.github.io/riveria-sanasto-community-test/v3-classic/auth-pilot/',false);
 assert.equal(noSdk.w.document.getElementById('pilot-login').disabled,true);
 noSdk.close();
 console.log('PASS: owner web config, isolated auth pilot, Google click, sign-out, no profile/Firestore reads, denied production origin');
})().catch(e=>{console.error(e);process.exit(1)});
