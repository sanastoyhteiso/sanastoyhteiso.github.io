'use strict';
/* RUN157: regression for missing exam entry in independent mobile navigation. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM}=require('jsdom');
const read=p=>fs.readFileSync(p,'utf8');
test('both desktop and mobile menus visibly expose Exam directly after Tests',()=>{
 const html=read('index.html');
 const doc=new JSDOM(html).window.document;
 for(const selector of ['#side-nav','#mobile-nav-scroll']){
  const nav=doc.querySelector(selector);
  assert.ok(nav,selector);
  const names=Array.from(nav.querySelectorAll('button[data-view]')).map(x=>x.getAttribute('data-view'));
  const practice=names.indexOf('practice');
  const exam=names.indexOf('exam');
  assert.ok(practice>=0,selector+' Tests absent');
  assert.equal(exam,practice+1,selector+' Exam must follow Tests');
  assert.equal(names.filter(x=>x==='exam').length,1,selector+' Exam must appear once');
  const button=nav.querySelector('[data-view="exam"]');
  assert.match(button.textContent,/Экзамен/);
 }
});
function browser(){
 const d=new JSDOM('<!doctype html><html lang="ru"><body>'+
  '<button data-view="cards">Cards</button><button data-view="practice">Tests</button>'+
  '<button data-view="exam" class="mobile-item">Экзамен</button>'+
  '<h1 id="page-title"></h1><p id="page-subtitle"></p>'+
  '<div id="online-status"></div><div id="storage-status"></div>'+
  '<main id="main-content"></main><div id="toast"></div></body></html>',
  {url:'https://sanastoyhteiso.github.io/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=d.window;w.scrollTo=()=>{};w.Math.random=()=>0.31;
 for(const p of ['data.js','riveria-anatomy-exam.js','riveria-true-false.js','exam-rounds-run155.js','mock-exam-run156.js'])w.eval(read(p));
 w.RS_FAMILY={uid:'test-run157',storageKey:k=>'run157_'+k,sharedEnabled:()=>true};
 w.RS_COMM={subscribedTerms:()=>[],renderUsers:()=>{},renderLibrary:()=>{}};
 w.RS_I18N={getLanguage:()=> 'ru',category:(fi,ru)=>ru};
 w.eval(read('app.js'));
 w.document.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
 return d;
}
test('Tests offers direct Exam entry; exam opens without changing scores, old quiz remains',()=>{
 const d=browser();try{
  const w=d.window,doc=w.document;
  const old=w.localStorage.getItem('run157_rs_scores_v1');
  doc.querySelector('[data-view="practice"]').click();
  const entry=doc.querySelector('#main-content [data-view="exam"]');
  assert.ok(entry,'visible exam link in Tests missing');
  assert.match(entry.textContent,/40 заданий/);
  assert.ok(doc.querySelector('[data-action="quiz-choose"]'),'four-option quiz preserved');
  entry.click();
  assert.match(doc.getElementById('page-title').textContent,/Экзамен/);
  assert.match(doc.getElementById('main-content').textContent,/\/ 40/);
  assert.ok(doc.getElementById('mock-dir'));
  assert.equal(w.localStorage.getItem('run157_rs_scores_v1'),old,'navigation must not update study progress');
  doc.querySelector('[data-view="practice"]').click();
  assert.ok(doc.querySelector('#main-content [data-view="exam"]'));
  doc.querySelector('.mobile-item[data-view="exam"]').click();
  assert.match(doc.getElementById('page-title').textContent,/Экзамен/);
 }finally{d.window.close();}
});
test('offline worker and script use the same current navigation version',()=>{
 const html=read('index.html'),sw=read('sw.js'),src=read('app.js');
 assert.match(html,/app\.js\?v=exam-navigation-run157-v1/);
 assert.match(sw,/app\.js\?v=exam-navigation-run157-v1/);
 assert.match(sw,/v3\.0\.0-rc26/);
 assert.match(src,/data-view="exam"/);
 assert.doesNotMatch(src,/=>|\?\./,'old Safari parser compatibility');
});
