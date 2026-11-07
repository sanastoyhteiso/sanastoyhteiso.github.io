'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const {JSDOM} = require('jsdom');
const html = fs.readFileSync(path.join(__dirname, '../v3-preview/index.html'), 'utf8');

function harness(options = {}) {
  const dom = new JSDOM(html, {
    url: options.url || 'https://sanastoyhteiso.github.io/v3-preview/',
    runScripts: 'outside-only',
    pretendToBeVisual: true
  });
  const w = dom.window, d = w.document;
  let onAuth, onError, written = null;
  const operations = [];
  const auth = {
    currentUser: null,
    onAuthStateChanged(fn, err) { onAuth = fn; onError = err; },
    signInWithPopup() { operations.push('popup'); return Promise.resolve({user: auth.currentUser}); }
  };
  function authFactory() {return auth;}
  authFactory.GoogleAuthProvider = function() {};
  w.RS_FIREBASE_CONFIG = {
    projectId: options.projectId || 'riveria-sanasto-community-test',
    authDomain: 'riveria-sanasto-community-test.firebaseapp.com'
  };
  w.firebase = {apps:[],initializeApp(v) {this.apps.push({options:v});}, auth: authFactory};
  d.open = () => {operations.push('open'); return d;};
  d.write = s => {operations.push('write'); written = s;};
  d.close = () => {operations.push('close');};
  const scripts = Array.from(d.querySelectorAll('script'));
  assert.ok(scripts.length >= 4, 'pilot wrapper missing original app gate script');
  w.eval(scripts[scripts.length-1].textContent);
  return {
    w,d,auth,operations, get written(){return written;},
    emit(user){auth.currentUser=user; if(onAuth)onAuth(user);},
    fail(){if(onError)onError(new Error('synthetic'));},
    button(){return d.getElementById('pilot-start');},
    checkbox(){return d.getElementById('pilot-consent');},
    message(){return d.getElementById('pilot-status').textContent;},
    tick:()=>new Promise(resolve=>setImmediate(resolve)),
    close(){w.close();}
  };
}
function user(values=[true], overrides={}) {
  let calls=0;
  const o={emailVerified:true,isAnonymous:false,providerData:[{providerId:'google.com'}],
    getIdTokenResult(force){
      assert.equal(force,true);
      const value=values[Math.min(calls++,values.length-1)];
      return Promise.resolve({claims:{admin:value}});
    }};
  return Object.assign(o,overrides);
}
function consent(h) {
  h.checkbox().checked = true;
  h.checkbox().dispatchEvent(new h.w.Event('change',{bubbles:true}));
}

test('without session, launch disabled and no release scripts execute',async()=>{
  const h=harness();
  h.emit(null);
  await h.tick();
  consent(h);
  assert.equal(h.button().disabled,true);
  h.button().click();
  assert.equal(h.written,null);
  assert.deepEqual(h.operations,[]);
  h.close();
});
test('ordinary verified user without server admin claim cannot load candidate',async()=>{
  const h=harness();
  h.emit(user([false]));
  await h.tick();
  consent(h);
  assert.equal(h.button().disabled,true);
  assert.match(h.message(),/роль администратора не подтверждена/);
  h.button().click();
  assert.equal(h.written,null);
  assert.deepEqual(h.operations,[]);
  h.close();
});
test('non-Google and unverified users fail before requesting ID token',async()=>{
  for(const override of [{emailVerified:false},{isAnonymous:true},{providerData:[{providerId:'password'}]}]){
    const h=harness();
    h.emit(user([true],override));
    await h.tick();
    consent(h);
    assert.equal(h.button().disabled,true);
    assert.equal(h.written,null);
    h.close();
  }
});
test('verified Google admin requires deliberate acknowledgement and fresh second token',async()=>{
  const h=harness();
  h.emit(user([true,true]));
  await h.tick();
  assert.equal(h.button().disabled,true);
  assert.equal(h.written,null);
  consent(h);
  assert.equal(h.button().disabled,false);
  h.button().click();
  await h.tick();
  assert.deepEqual(h.operations,['open','write','close']);
  assert.ok(h.written.includes('v3-sync-release.js'));
  assert.ok(h.written.includes('v3-mediatri-guide.js'));
  assert.ok(h.written.includes('admin-entry.js'));
  h.close();
});
test('claim revoked after initial check cannot load release candidate',async()=>{
  const h=harness();
  h.emit(user([true,false]));
  await h.tick();
  consent(h);
  assert.equal(h.button().disabled,false);
  h.button().click();
  await h.tick();
  assert.equal(h.written,null);
  assert.ok(h.button().disabled);
  assert.match(h.message(),/роль изменились/);
  h.close();
});
test('wrong Firebase project or wrong web origin fails closed',async()=>{
  for(const opts of [{projectId:'sanastoyhteiso-v3-development'},
                      {url:'https://velardream-ctrl.github.io/riveria-sanasto-community-test/'}]){
    const h=harness(opts);
    h.emit(user([true,true]));
    await h.tick();
    consent(h);
    assert.equal(h.button().disabled,true);
    assert.equal(h.written,null);
    assert.match(h.message(),/утверждённом адресе/);
    h.close();
  }
});
