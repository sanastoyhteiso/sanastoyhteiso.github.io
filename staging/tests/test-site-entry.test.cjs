/* Staging-only regression for swapping ONLY the old test root entry.
 * No real repo, browser, Firebase or service worker is modified.
 */
'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
const acorn=require('acorn'),{JSDOM}=require('jsdom');
const dir=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(dir,'test-site-entry.html'),'utf8');
const source=fs.readFileSync(path.join(dir,'test-entry-v3.js'),'utf8');
acorn.parse(source,{ecmaVersion:5});
const doc=new JSDOM(html,{runScripts:'outside-only'});
assert.equal(doc.window.document.querySelectorAll('script[src]').length,1);
assert.equal(doc.window.document.querySelector('script[src]').getAttribute('src'),'./test-entry-v3.js');
assert.equal(doc.window.document.querySelector('#open-v3-classic').getAttribute('href'),'./v3-classic/');
assert.ok(html.includes("connect-src 'none'"),'No Firebase connections from test entry');
assert.ok(!/firebase|googleusercontent|gstatic\.com|app\.js/.test(html));
assert.ok(html.includes('noindex,nofollow'));
function testWindow(registration,caches){
  const urls=[],scope='/riveria-sanasto-community-test/';
  const win={
    navigator:{serviceWorker:{getRegistration:()=>Promise.resolve(registration)}},
    location:{pathname:scope,href:'https://velardream-ctrl.github.io'+scope,
      replace:(v)=>urls.push(v)},
    caches:caches||{keys:()=>Promise.resolve([]),delete:()=>Promise.resolve(true)}
  };
  vm.runInNewContext(source,{window:win,Promise},{timeout:2000});
  return {urls,win};
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
  const noSw=testWindow(null);await tick();
  assert.deepStrictEqual(noSw.urls,['./v3-classic/']);
  let unregistered=0;const deleted=[];
  const own={scope:'https://velardream-ctrl.github.io/riveria-sanasto-community-test/',
    unregister:()=>{unregistered++;return Promise.resolve(true);}};
  const ownVisit=testWindow(own,{
    keys:()=>Promise.resolve(['riveria-sanasto-community-v2.1.3','another-product-cache']),
    delete:(name)=>{deleted.push(name);return Promise.resolve(true);}
  });
  await tick();await tick();await tick();
  assert.equal(unregistered,1);
  assert.deepStrictEqual(deleted,['riveria-sanasto-community-v2.1.3']);
  assert.deepStrictEqual(ownVisit.urls,['./v3-classic/']);
  const foreign={scope:'https://velardream-ctrl.github.io/another-repo/',
    unregister:()=>{throw Error('Never touch another service worker');}};
  const foreignVisit=testWindow(foreign);await tick();
  assert.deepStrictEqual(foreignVisit.urls,['./v3-classic/']);
  console.log('PASS: test-root v3 handoff, Safari ES5, isolated service worker retirement, no Firebase/config');
  doc.window.close();
})().catch(e=>{console.error(e);process.exit(1)});
