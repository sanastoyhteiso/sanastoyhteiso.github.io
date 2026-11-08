'use strict';
/* RUN154 bilingual three-mode regression. No external data or accounts. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {JSDOM}=require('jsdom');
const read=p=>fs.readFileSync(p,'utf8');
const ctx={window:{}};vm.runInNewContext(read('riveria-true-false.js'),ctx);
const bank=ctx.window.RS_TRUE_FALSE.questions;
function browser(){
 const dom=new JSDOM('<!doctype html><html lang="ru"><body>'+
 '<button data-view="cards">Cards</button><button data-view="practice">Quiz</button>'+
 '<button data-view="dictionary">Dictionary</button><h1 id="page-title"></h1>'+
 '<p id="page-subtitle"></p><div id="online-status"></div><div id="storage-status"></div>'+
 '<main id="main-content"></main><div id="toast"></div></body></html>',
 {url:'https://sanastoyhteiso.github.io/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;w.scrollTo=()=>{};w.Math.random=()=>0.34;
 w.eval(read('data.js'));w.eval(read('riveria-anatomy-exam.js'));w.eval(read('riveria-true-false.js'));w.eval(read('exam-rounds-run155.js'));
 w.RS_FAMILY={uid:'synthetic-run154',storageKey:k=>'run154_'+k,sharedEnabled:()=>true};
 w.RS_COMM={subscribedTerms:()=>[],renderUsers:()=>{},renderLibrary:()=>{}};
 let locale='ru';w.RS_I18N={getLanguage:()=>locale,category:(fi,ru)=>locale==='fi'?fi:ru};
 w.eval(read('app.js'));w.document.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
 return {w,d:w.document,close:()=>dom.window.close(),language:lang=>{locale=lang;w.document.documentElement.lang=lang;w.RS_APP_LOCALE(lang);}};
}
test('all thirty original Finnish questions have substantive Russian equivalents and no changes to keys',()=>{
 assert.equal(bank.length,30);
 for(const q of bank){
  assert.ok(q.ru&&q.ru.length>=18,q.id);
  assert.ok(q.fi&&q.fi.length>=18,q.id);
  assert.ok(q.explanationFi&&q.explanationRu);
  if(q.correct===false)assert.ok(q.correctStatementFi&&q.correctStatementRu);
 }
});
test('T/F uses RU main FI secondary then FI main RU secondary and one feedback box',()=>{
 const b=browser();try{
  b.d.querySelector('[data-view="practice"]').click();
  b.d.querySelector('[data-action="quiz-mode"][data-value="truefalse"]').click();
  let q=b.d.querySelector('.exam-question-bilingual');
  assert.equal(q.querySelector('.exam-question-main').getAttribute('lang'),'ru');
  assert.equal(q.querySelector('.exam-question-secondary').getAttribute('lang'),'fi');
  const before=b.w.localStorage.getItem('run154_rs_scores_v1');
  const cat=b.d.getElementById('quiz-cat');cat.value='EXAM05';
  cat.dispatchEvent(new b.w.Event('change',{bubbles:true}));
  let found=false;
  for(let n=0;n<10;n++){
    let main=b.d.querySelector('.exam-question-main').textContent;
    if(main.includes('Вены всегда')){found=true;break;}
    b.d.querySelector('[data-action="tf-next"]').click();
  }
  assert.ok(found,'must find false statement among the ten EXAM05 questions');
  b.d.querySelector('[data-action="tf-choose"][data-value="true"]').click();
  assert.equal(b.d.querySelectorAll('.exam-feedback-one').length,1);
  assert.equal(b.d.querySelectorAll('.exam-explain').length,1,'no repeated explanation blocks');
  assert.match(b.d.querySelector('.exam-feedback-one').textContent,/Oikea väite/);
  assert.match(b.d.querySelector('.exam-feedback-one').textContent,/FI:/);
  assert.match(b.d.querySelector('.exam-feedback-one').textContent,/RU:/);
  b.language('fi');
  q=b.d.querySelector('.exam-question-bilingual');
  assert.equal(q.querySelector('.exam-question-main').getAttribute('lang'),'fi');
  assert.equal(q.querySelector('.exam-question-secondary').getAttribute('lang'),'ru');
  assert.equal(b.d.querySelectorAll('.exam-feedback-one').length,1);
  assert.equal(b.w.localStorage.getItem('run154_rs_scores_v1'),before);
  b.language('en');
  assert.equal(b.d.querySelector('.exam-question-main').getAttribute('lang'),'en','English original question must use reviewed EN translation');
 }finally{b.close();}
});
test('matching shows RU main and FI under it, no duplicated definition after feedback',()=>{
 const b=browser();try{
  b.d.querySelector('[data-view="practice"]').click();
  b.d.querySelector('[data-action="quiz-mode"][data-value="matching"]').click();
  assert.equal(b.d.querySelectorAll('[data-match-index]').length,4);
  assert.equal(b.d.querySelectorAll('.exam-question-bilingual').length,4);
  assert.equal(b.d.querySelector('.exam-question-main').getAttribute('lang'),'ru');
  const text=b.d.querySelector('.exam-question-main').textContent;
  assert.ok(text.length>12);
  b.language('fi');
  assert.equal(b.d.querySelector('.exam-question-main').getAttribute('lang'),'fi');
  const old=b.w.localStorage.getItem('run154_rs_scores_v1');
  b.d.querySelector('[data-action="match-check"]').click();
  assert.equal(b.d.querySelectorAll('.exam-explain').length,0,'same definitions should not be repeated below each match');
  assert.match(b.d.getElementById('main-content').textContent,/Oikea pari/);
  assert.equal(b.w.localStorage.getItem('run154_rs_scores_v1'),old);
 }finally{b.close();}
});
test('multiple choice shows each statement bilingually and one feedback per option',()=>{
 const b=browser();try{
  b.d.querySelector('[data-view="practice"]').click();
  b.d.querySelector('[data-action="quiz-mode"][data-value="multiselect"]').click();
  assert.equal(b.d.querySelectorAll('.exam-multi-choice .exam-question-bilingual').length,4);
  assert.equal(b.d.querySelector('.exam-question-main').getAttribute('lang'),'ru');
  b.language('fi');
  assert.equal(b.d.querySelector('.exam-question-main').getAttribute('lang'),'fi');
  const old=b.w.localStorage.getItem('run154_rs_scores_v1');
  b.d.querySelector('[data-action="multi-check"]').click();
  assert.equal(b.d.querySelectorAll('.exam-feedback-one').length,4);
  assert.equal(b.d.querySelectorAll('.exam-explain').length,4,'no duplicate explanation panels');
  assert.match(b.d.getElementById('main-content').textContent,/Oikea väite/);
  assert.equal(b.w.localStorage.getItem('run154_rs_scores_v1'),old);
  b.d.querySelector('[data-action="quiz-mode"][data-value="translate"]').click();
  assert.ok(b.d.querySelector('[data-action="quiz-choose"]'),'four-option original unmodified');
 }finally{b.close();}
});
test('ES5 new code, versioned cache and Safari 12 readable font fallbacks',()=>{
 const app=read('app.js'),html=read('index.html'),sw=read('sw.js'),css=read('style.css');
 assert.doesNotMatch(app,/=>|\?\./);
 assert.match(html,/app\.js\?v=remove-duplicate-exam-run160-v1/);
 assert.match(html,/riveria-true-false\.js\?v=run156-en-1/);
 assert.match(html,/style\.css\?v=answer-feedback-run158-1/);
 assert.match(sw,/v3\.0\.0-rc28/);
 assert.match(sw,/riveria-true-false\.js\?v=run156-en-1/);
 assert.ok(css.includes('font-size:25px;font-size:clamp'));
});
