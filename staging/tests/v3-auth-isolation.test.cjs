/* Offline-only test of future Google registration/session controller.
 * No network, Firebase SDK, real credentials or user accounts.
 */
'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path'),acorn=require('acorn');
const guard=require('../backend/v3-staging-project-guard.js');
const controller=require('../backend/rs-v3-auth-controller.js');
const adapterFactory=require('../backend/rs-v3-firebase-compat-auth.js');
for(const name of ['rs-v3-auth-controller.js','rs-v3-firebase-compat-auth.js']){
  const src=fs.readFileSync(path.join(__dirname,'../backend',name),'utf8');
  acorn.parse(src,{ecmaVersion:5});
  assert.ok(!/localStorage|sessionStorage|Firebase secret|PRIVATE KEY/.test(src));
}
const testId='sanastoyhteiso-v3-development';
const cfg={projectId:testId,authDomain:testId+'.firebaseapp.com',
  apiKey:'AIza'+'A'.repeat(35),appId:'1:111:web:222'};
function options(){return {
  guard,site:{origin:'https://velardream-ctrl.github.io',
    pathname:'/riveria-sanasto-community-test/v3-classic/'},
  expectedProjectId:testId,
  productionProjectId:'riveria-sanasto-community-test',
  firebase:cfg
};}
function user(uid,verified){
  return {uid,email:uid+'@example.invalid',emailVerified:verified,
    displayName:'Demo '+uid, getIdToken:()=>Promise.resolve('TEST_TOKEN_SHOULD_NOT_LEAK')};
}
function mock(){
  let current=null,onChange=null,popupCount=0,signouts=0;
  return {
    adapter:{
      onAuthStateChanged(fn){onChange=fn;return ()=>{onChange=null;};},
      currentUser(){return current;},
      signInWithGoogle(){popupCount++;const u=user('firstUser',false);current=u;
        if(onChange)onChange(u);return Promise.resolve({user:u});},
      signOut(){signouts++;current=null;if(onChange)onChange(null);return Promise.resolve();},
      reloadCurrentUser(){return Promise.resolve();},
      getIdToken(u){return u.getIdToken();}
    },
    set(u){current=u;if(onChange)onChange(u);},
    get(){return current;},
    popupCount:()=>popupCount,signouts:()=>signouts
  };
}
(async()=>{
 let called=false;
 const fail=mock();const bad=options();bad.firebase={...cfg,projectId:'riveria-sanasto-community-test'};
 assert.throws(()=>controller.create({...bad,adapter:{...fail.adapter,
   onAuthStateChanged(){called=true;return ()=>{};}}}),/verified|staging|project|existing/i);
 assert.equal(called,false,'No SDK call before safety guard');
 const m=mock(),auth=controller.create({...options(),adapter:m.adapter});
 let states=[],unsub=auth.subscribe(s=>states.push(s));
 assert.equal(auth.getState().status,'signed_out');
 await assert.rejects(auth.getVerifiedIdToken(),/Verified/);
 auth.start();assert.equal(auth.getState().status,'checking');
 const login=auth.signInWithGoogle();
 assert.equal(m.popupCount(),1,'Google popup is invoked immediately during user click');
 await login;
 assert.equal(auth.getState().status,'unverified');
 assert.equal(auth.getState().user.uid,'firstUser');
 await assert.rejects(auth.getVerifiedIdToken(),/Verified/);
 assert.equal(JSON.stringify(states).includes('TEST_TOKEN'),false);
 const verified=user('firstUser',true);
 m.set(verified);
 const refreshed=await auth.refreshEmailVerification();
 assert.equal(refreshed.status,'verified');
 assert.equal(await auth.getVerifiedIdToken(),'TEST_TOKEN_SHOULD_NOT_LEAK');
 assert.equal(JSON.stringify(auth.getState()).includes('TOKEN'),false);
 let resolvePending;
 m.adapter.getIdToken=()=>new Promise(resolve=>{resolvePending=resolve;});
 const waiting=auth.getVerifiedIdToken();
 await Promise.resolve();
 const another=user('anotherUser',true);
 m.set(another);
 resolvePending('EXPIRED_TOKEN');
 await assert.rejects(waiting,/changed/,'Reject token from old account');
 assert.equal(auth.getState().user.uid,'anotherUser');
 assert.equal(auth.getState().status,'verified');
 await auth.signOut();
 assert.equal(m.signouts(),1);
 assert.equal(auth.getState().status,'signed_out');
 // A stale SDK event must not log the user back in after explicit sign-out.
 m.set(another);
 assert.equal(auth.getState().status,'signed_out');
 await assert.rejects(auth.getVerifiedIdToken(),/Verified/);
 unsub();auth.close();
 assert.throws(()=>auth.start(),/closed/);
 // Even an injected fake SDK must never initialize before guard validation.
 let starts=0;
 const authApi={
   currentUser:null,
   onAuthStateChanged(fn){this.listener=fn;return ()=>{};},
   signInWithPopup(){return Promise.resolve({user:this.currentUser});},
   signOut(){this.currentUser=null;return Promise.resolve();},
 };
 function sdkAuth(){return authApi;}
 sdkAuth.GoogleAuthProvider=function(){this.providerId='google.com';};
 const sdk={
   apps:[],auth:sdkAuth,
   initializeApp(opts,name){starts++;const app={name,options:opts};
     this.apps.push(app);return app;}
 };
 assert.throws(()=>adapterFactory.create({
   ...options(),config:{...cfg,projectId:'riveria-sanasto-community-test'},
   sdk}),/existing|project|Firebase|staging/i);
 assert.equal(starts,0);
 const app=adapterFactory.create({...options(),config:cfg,sdk});
 assert.equal(starts,1);assert.equal(app.projectId,testId);
 const again=adapterFactory.create({...options(),config:cfg,sdk});
 assert.equal(starts,1,'Do not initialize a second conflicting Firebase app');
 assert.equal(again.currentUser(),null);
 sdk.apps[0].options.projectId='riveria-sanasto-community-test';
 assert.throws(()=>adapterFactory.create({...options(),config:cfg,sdk}),/another Firebase project/);
 console.log('PASS: real registration contract preserved; offline Auth adapter guarded, Google popup synchronous, email verification and token races safe');
})().catch(e=>{console.error(e);process.exit(1);});
