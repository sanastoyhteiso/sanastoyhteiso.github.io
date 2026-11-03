/* STAGING ONLY. Run the real, isolated v3 demonstration UI in JSDOM.
 * Uses synthetic words + fake-indexeddb; no Firebase/Google/network access.
 * JSDOM is not an actual Safari 12 browser or mobile device verification.
 */
'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const {JSDOM}=require('jsdom');
const {IDBFactory}=require('fake-indexeddb');
const root=path.resolve(__dirname,'../..');
const html=fs.readFileSync(path.join(root,'staging/site-v3-demo.html'),'utf8');
const indexedDB=new IDBFactory();
const expected=[
 'rs-sync-core.js','rs-sync-shadow-idb.js',
 'rs-sync-shadow-reconcile.js','rs-sync-recovery-audit.js',
 'rs-admin-preview.js','rs-v3-demo.js'
];
assert.ok(html.includes('connect-src &#39;none&#39;')||
  html.includes("connect-src 'none'"),'Demo must disable external network connections');
assert.ok(html.includes('noindex,nofollow'));
assert.ok(!/https?:\/\/(?:www\.)?(?:firebase|googleapis|accounts\.google|gstatic)/i.test(html));
assert.ok(!/localStorage\.|getToken\(|firebase\.auth\(/.test(html));
const scripts=Array.from(html.matchAll(/<script\s+src="([^"]+)"\s*><\/script>/g)).map(x=>x[1]);
assert.deepStrictEqual(scripts,expected,'Only approved local staging modules may be loaded');
const code=scripts.map(name=>fs.readFileSync(path.join(root,'staging',name),'utf8'));
function createWindow(){
 const dom=new JSDOM(html,{runScripts:'outside-only',
   url:'https://demo.invalid/staging/site-v3-demo.html'});
 const w=dom.window;
 Object.defineProperty(w,'indexedDB',{configurable:true,value:indexedDB});
 w.fetch=()=>{throw Error('Demo is not allowed to fetch anything');};
 w.XMLHttpRequest=function(){throw Error('Demo must not use XHR');};
 code.forEach((s,i)=>w.eval(s+'\n//# sourceURL='+scripts[i]));
 w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
 assert.ok(w.RS_V3_DEMO,'Missing demo test controller');
 return {dom,w,ready:w.RS_V3_DEMO.idle()};
}
function click(w,selector){
 const node=w.document.querySelector(selector);
 assert.ok(node,'Missing control: '+selector);
 node.click();
}
async function run(){
 const a=createWindow(),w=a.w;
 await a.ready;
 let record=await w.RS_V3_DEMO.read();
 assert.equal(record.uid,'demo-v3-synthetic-only');
 assert.equal(record.phase,'shadow');
 assert.equal(record.revision,0);
 assert.equal(Object.keys(record.state.scores).length,3);
 assert.equal(record.pending.length,0);
 const first=w.document.querySelector('.demo-card h2').textContent;
 assert.equal(first,'hoiva-avustaja');
 click(w,'[data-action=know]');
 await w.RS_V3_DEMO.idle();
 record=await w.RS_V3_DEMO.read();
 assert.equal(record.state.scores.T00001.correct,1);
 assert.equal(record.state.scores.T00001.learned,true);
 assert.equal(record.pending.length,1);
 click(w,'[data-action=favorite]');
 await w.RS_V3_DEMO.idle();
 record=await w.RS_V3_DEMO.read();
 assert.equal(record.state.favorites.T00001,true);
 assert.equal(record.pending.length,2);
 click(w,'[data-tab=dictionary]');
 const form=w.document.getElementById('demo-word-form');
 form.elements.namedItem('fi').value='kuntoutus';
 form.elements.namedItem('ru').value='реабилитация';
 form.elements.namedItem('en').value='rehabilitation';
 form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 await w.RS_V3_DEMO.idle();
 record=await w.RS_V3_DEMO.read();
 assert.equal(Object.keys(record.state.words).length,1);
 assert.equal(record.pending.length,3);
 assert.ok(w.document.getElementById('demo-results').textContent.includes('kuntoutus'));
 const search=w.document.getElementById('demo-search');
 search.value='rehabilitation';
 search.dispatchEvent(new w.Event('input',{bubbles:true}));
 assert.equal(w.document.querySelectorAll('#demo-results li').length,1);
 click(w,'[data-tab=sync]');
 const beforeSeen=record.state.scores.T00002.seen;
 click(w,'[data-action=sync]');
 await w.RS_V3_DEMO.idle();
 record=await w.RS_V3_DEMO.read();
 assert.equal(record.state.scores.T00002.seen,beforeSeen+1);
 assert.equal(record.state.scores.T00002.correct,1);
 assert.equal(record.pending.length,3,'Mock reconciliation must never drop unconfirmed answers');
 assert.equal(Object.keys(record.state.words).length,1);
 click(w,'[data-action=sync]');
 await w.RS_V3_DEMO.idle();
 const twice=await w.RS_V3_DEMO.read();
 assert.equal(twice.state.scores.T00002.seen,1,'Repeating mock cloud read must not double count');
 click(w,'[data-tab=recovery]');
 click(w,'[data-action=audit]');
 await w.RS_V3_DEMO.idle();
 assert.ok(w.document.querySelector('#demo-content').textContent.includes('Предыдущих снимков'));
 assert.ok(w.document.querySelector('#demo-content').textContent.includes('Не отправлено'));
 click(w,'[data-tab=admin]');
 assert.ok(w.document.querySelector('.rs-admin-grid'));
 assert.equal(w.document.querySelectorAll('.rs-admin-tile').length,6);
 assert.ok(w.document.querySelector('.demo-warning').textContent.includes('вымышленные'));
 const language=w.document.getElementById('demo-language');
 language.value='fi';language.dispatchEvent(new w.Event('change',{bubbles:true}));
 assert.ok(w.document.querySelector('#demo-heading').textContent.includes('Testiversio'));
 assert.ok(w.document.querySelector('#demo-content').textContent.includes('Rekisteröityneet'));
 language.value='en';language.dispatchEvent(new w.Event('change',{bubbles:true}));
 assert.ok(w.document.querySelector('#demo-content').textContent.includes('Registered users'));
 a.dom.window.close();
 // Reopen the same separate IndexedDB, without writing into production localStorage.
 const b=createWindow();
 await b.ready;
 const reopened=await b.w.RS_V3_DEMO.read();
 assert.equal(reopened.pending.length,3);
 assert.equal(reopened.state.scores.T00001.correct,1);
 assert.equal(reopened.state.scores.T00002.correct,1);
 assert.equal(Object.keys(reopened.state.words).length,1);
 assert.equal(reopened.revision,twice.revision);
 assert.equal(b.w.localStorage.length,0,'Demo must not write any production localStorage key');
 b.dom.window.close();
 console.log('PASS: staging v3 demo FI/RU/EN, card answer, favorites, personal word, fake two-device sync, recovery, admin, reload; no real data');
}
run().catch(e=>{console.error(e);process.exit(1);});
