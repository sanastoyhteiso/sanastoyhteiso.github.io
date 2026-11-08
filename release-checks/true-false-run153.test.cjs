'use strict';
// RUN153 pilot: separate true/false study mode, all offline synthetic data.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {JSDOM}=require('jsdom');
const load=p=>fs.readFileSync(p,'utf8');
function bank(){
 const ctx={window:{}};vm.runInNewContext(load('riveria-true-false.js'),ctx);
 return ctx.window.RS_TRUE_FALSE.questions;
}
function browser(){
 const dom=new JSDOM('<!doctype html><html lang="ru"><body>'+
 '<button data-view="cards">Cards</button><button data-view="practice">Quiz</button>'+
 '<button data-view="dictionary">Dictionary</button><h1 id="page-title"></h1>'+
 '<p id="page-subtitle"></p><div id="online-status"></div>'+
 '<div id="storage-status"></div><main id="main-content"></main>'+
 '<div id="toast"></div></body></html>',{
 url:'https://sanastoyhteiso.github.io/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;w.scrollTo=()=>{};
 w.Math.random=()=>0.34;
 w.eval(load('data.js'));w.eval(load('riveria-anatomy-exam.js'));
 w.eval(load('riveria-true-false.js'));w.eval(load('exam-rounds-run155.js'));
 w.RS_FAMILY={uid:'synthetic-run153',storageKey:k=>'run153_'+k,sharedEnabled:()=>true};
 w.RS_COMM={subscribedTerms:()=>[],renderUsers:()=>{},renderLibrary:()=>{}};
 w.eval(load('app.js'));
 w.document.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
 return {dom,w,d:w.document};
}
test('30 verified source-linked statements: all ten topics, two correct outcomes',()=>{
 const q=bank();assert.equal(q.length,30);
 assert.equal(new Set(q.map(x=>x.id)).size,30);
 for(let i=1;i<=10;i++){
  const topic='EXAM'+String(i).padStart(2,'0');
  const items=q.filter(x=>x.topic===topic);
  assert.equal(items.length,3,topic);
  assert.ok(items.some(x=>x.correct===true));
  assert.ok(items.some(x=>x.correct===false));
 }
 const source=load('riveria-anatomy-exam.js');
 for(const x of q){
  assert.ok(x.fi.length>=18&&x.explanationFi.length>25&&x.explanationRu.length>25);
  assert.ok(source.includes('"'+x.sourceFi+'"'),'missing source term '+x.sourceFi);
  assert.equal(typeof x.correct,'boolean');
 }
});
test('all false answers show an affirmative FI statement with Russian translation',()=>{
 const q=bank();
 for(const x of q.filter(x=>!x.correct)){
  assert.ok(x.correctStatementFi&&x.correctStatementFi.length>30,x.id);
  assert.ok(x.correctStatementRu&&x.correctStatementRu.length>30,x.id);
  assert.notEqual(x.correctStatementFi,x.fi);
  assert.doesNotMatch(x.correctStatementFi,/^(Ei |Älä )/i,'prefer affirmative correction '+x.id);
 }
 const app=load('app.js');
 assert.ok(app.includes('Oikea väite / Правильное утверждение:'));
 assert.ok(app.includes('correctStatementFi'));
 assert.ok(app.includes('correctStatementRu'));
});
test('new mode exposes two quiz types, grades without modifying learned scores',()=>{
 const b=browser();try{
  b.d.querySelector('[data-view="practice"]').click();
  assert.ok(b.d.querySelector('[data-action="quiz-choose"]'),'original four-answer quiz still available');
  b.d.querySelector('[data-action="quiz-mode"][data-value="truefalse"]').click();
  assert.ok(b.d.querySelector('[data-action="tf-choose"][data-value="true"]'));
  assert.ok(b.d.querySelector('[data-action="tf-choose"][data-value="false"]'));
  const prior=b.w.localStorage.getItem('run153_rs_scores_v1');
  const topic=b.d.getElementById('quiz-cat');
  topic.value='EXAM05';topic.dispatchEvent(new b.w.Event('change',{bubbles:true}));
  assert.ok(b.d.querySelector('[data-action="tf-choose"]'));
  b.d.querySelector('[data-action="tf-choose"][data-value="false"]').click();
  assert.ok(b.d.querySelector('.answer'));
  assert.match(b.d.getElementById('main-content').textContent,/Oikea vastaus/);
  assert.match(b.d.getElementById('main-content').textContent,/FI:/);
  assert.match(b.d.getElementById('main-content').textContent,/RU:/);
  assert.equal(b.w.localStorage.getItem('run153_rs_scores_v1'),prior,'T/F must never change learned scores');
  assert.ok(b.d.querySelector('[data-action="tf-next"]'));
  b.d.querySelector('[data-action="quiz-mode"][data-value="translate"]').click();
  assert.ok(b.d.querySelector('[data-action="quiz-choose"]'),'original quiz survives switching');
 }finally{b.dom.window.close();}
});
test('static ES5 compatible, cache version and mode scripts synchronized',()=>{
 const app=load('app.js'),data=load('riveria-true-false.js'),html=load('index.html'),sw=load('sw.js');
 assert.doesNotMatch(app,/=>|\?\./);
 assert.doesNotMatch(data,/\bconst\b|\blet\b|=>|\?\./);
 assert.ok(html.includes('riveria-true-false.js?v=run156-en-1'));
 assert.ok(sw.includes('riveria-true-false.js?v=run156-en-1'));
 assert.ok(html.includes('app.js?v=exam-cloud-run161-v1'));
 assert.ok(sw.includes('app.js?v=exam-cloud-run161-v1'));
 assert.ok(sw.includes('riveria-sanasto-community-v3.0.0-rc29'));
});


test('matching dropdown pairs work in all ten exam topics, show correct pairs and FI/RU notes',()=>{
 const b=browser();try{
  b.d.querySelector('[data-view="practice"]').click();
  b.d.querySelector('[data-action="quiz-mode"][data-value="matching"]').click();
  const old=b.w.localStorage.getItem('run153_rs_scores_v1');
  for(let i=1;i<=10;i++){
    const topic='EXAM'+String(i).padStart(2,'0'),select=b.d.getElementById('quiz-cat');
    select.value=topic;select.dispatchEvent(new b.w.Event('change',{bubbles:true}));
    const dropdowns=b.d.querySelectorAll('[data-match-index]');
    assert.equal(dropdowns.length,4,topic);
    for(const dd of dropdowns)assert.equal(dd.options.length,5,'placeholder and four unique answers');
    dropdowns[0].value=dropdowns[0].options[1].value;
    b.d.querySelector('[data-action="match-check"]').click();
    const result=b.d.getElementById('main-content').textContent;
    assert.match(result,/Oikea pari/);
    assert.equal(b.d.querySelectorAll('.exam-question-bilingual').length,4,'four paired definitions must remain visible');
    assert.equal(b.d.querySelectorAll('.exam-question-secondary').length,4,'every definition has a readable second language');
    assert.equal(b.d.querySelectorAll('.exam-explain').length,0,'do not duplicate bilingual definitions after grading');
  }
  assert.equal(b.w.localStorage.getItem('run153_rs_scores_v1'),old);
 }finally{b.dom.window.close();}
});
test('multiple-selection checks every option, reveals corrected FI/RU statements',()=>{
 const b=browser();try{
  b.d.querySelector('[data-view="practice"]').click();
  b.d.querySelector('[data-action="quiz-mode"][data-value="multiselect"]').click();
  const before=b.w.localStorage.getItem('run153_rs_scores_v1');
  for(let i=1;i<=10;i++){
    const topic='EXAM'+String(i).padStart(2,'0'),s=b.d.getElementById('quiz-cat');
    s.value=topic;s.dispatchEvent(new b.w.Event('change',{bubbles:true}));
    assert.equal(b.d.querySelectorAll('[data-multi-index]').length,4,topic);
    assert.equal(b.d.querySelectorAll('[data-multi-index]:checked').length,0,'no answers preselected');
    b.d.querySelector('[data-action="multi-check"]').click();
    const text=b.d.getElementById('main-content').textContent;
    assert.match(text,/Oikea väite/);
    assert.match(text,/FI:/);assert.match(text,/RU:/);
    assert.ok(b.d.querySelector('[data-action="multi-next"]'));
  }
  assert.equal(b.w.localStorage.getItem('run153_rs_scores_v1'),before);
  b.d.querySelector('[data-action="quiz-mode"][data-value="translate"]').click();
  assert.ok(b.d.querySelector('[data-action="quiz-choose"]'));
 }finally{b.dom.window.close();}
});
