'use strict';
/* RUN173: the public About counter must count the exact same merged bundled vocabulary as the app.
   No hard-coded numeric total and no user-scoped storage/auth queries. */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),{JSDOM}=require('jsdom');
const about=fs.readFileSync('about.html','utf8');
const index=fs.readFileSync('index.html','utf8');
const base=fs.readFileSync('data.js','utf8');
const exam=fs.readFileSync('riveria-anatomy-exam.js','utf8');
const dom=new JSDOM(about,{runScripts:'outside-only',url:'https://sanastoyhteiso.github.io/about.html'});
const document=dom.window.document;
const scripts=Array.from(document.querySelectorAll('script'));
const scriptSrcs=scripts.map(s=>s.getAttribute('src')).filter(Boolean);
const counterScript=scripts.filter(s=>s.textContent.includes('var count=terms.length'))[0];
const format=(n,lang)=>String(n).replace(/\B(?=(\d{3})+(?!\d))/g,lang==='en'?',':' ');

test('About uses the same versioned base AND Riveria anatomy source files as the main app',()=>{
 const baseSrc=scriptSrcs.filter(x=>/^data\.js\?v=/.test(x));
 const examSrc=scriptSrcs.filter(x=>/^riveria-anatomy-exam\.js\?v=/.test(x));
 assert.equal(baseSrc.length,1,'base catalog loaded once');
 assert.equal(examSrc.length,1,'exam vocabulary loaded once');
 assert.ok(index.includes('<script src="'+baseSrc[0]+'"></script>'),'base version must match application exactly');
 assert.ok(index.includes('<script src="'+examSrc[0]+'"></script>'),'exam version must match application exactly');
 assert.ok(scriptSrcs.indexOf(baseSrc[0])<scriptSrcs.indexOf(examSrc[0]),'merge requires base loaded first');
 assert.ok(counterScript,'dynamic count script missing');
 assert.ok(!about.includes('1485'),'About must not freeze numeric snapshot of count in markup or JS');
});

test('FI/EN/RU counters show actual length after real dataset + exam module is merged',()=>{
 dom.window.eval(base);
 const baseLength=dom.window.RS_DATA.terms.length;
 dom.window.eval(exam);
 const mergedLength=dom.window.RS_DATA.terms.length;
 assert.ok(mergedLength>baseLength,'merged anatomy words must raise the counter above base-only count');
 dom.window.eval(counterScript.textContent);
 const spans=Array.from(document.querySelectorAll('[data-rs-term-count]'));
 assert.equal(spans.length,3);
 for(const span of spans)assert.equal(span.textContent,format(mergedLength,span.getAttribute('data-lang')),span.getAttribute('data-lang')+' stale count');
});

test('counter updates automatically when the word catalog grows later — no hardcoded count',()=>{
 const more=dom.window.RS_DATA.terms.length;
 dom.window.RS_DATA.terms.push({id:'T-RUN173-SYNTHETIC',fi:'testisana',ru:'тестовое слово'});
 dom.window.eval(counterScript.textContent);
 for(const span of document.querySelectorAll('[data-rs-term-count]')){
   const lang=span.getAttribute('data-lang');
   assert.equal(span.textContent,format(more+1,lang),'new words reflected automatically in '+lang);
 }
});

test('instructions and private account state are untouched by count script',()=>{
 for(const lang of ['fi','en','ru'])assert.ok(document.getElementById('getting-started-'+lang),'RUN172 instructions remain '+lang);
 assert.ok(!/localStorage|sessionStorage|IndexedDB|fetch\(|firebase\.|getToken/.test(counterScript.textContent),'public word count must not depend on user state or cloud');
});
