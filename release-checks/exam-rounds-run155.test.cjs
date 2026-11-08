'use strict';
/* RUN155 deterministic offline regression: 10 distinct exercises in every 10 topics and every mode. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {JSDOM}=require('jsdom'),read=p=>fs.readFileSync(p,'utf8');
function catalog(){
 const ctx={window:{}};for(const p of ['data.js','riveria-anatomy-exam.js','riveria-true-false.js','exam-rounds-run155.js']){
 vm.runInNewContext(read(p),ctx);}
 return ctx.window;
}
function browser(){
 const dom=new JSDOM('<!doctype html><html lang="ru"><body><button data-view="cards">Cards</button><button data-view="practice">Quiz</button><button data-view="dictionary">Dictionary</button><h1 id="page-title"></h1><p id="page-subtitle"></p><div id="online-status"></div><div id="storage-status"></div><main id="main-content"></main><div id="toast"></div></body></html>',
  {url:'https://sanastoyhteiso.github.io/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;w.scrollTo=()=>{};w.Math.random=()=>0.42;
 for(const p of ['data.js','riveria-anatomy-exam.js','riveria-true-false.js','exam-rounds-run155.js'])w.eval(read(p));
 w.RS_FAMILY={uid:'synthetic-run155',storageKey:k=>'run155_'+k,sharedEnabled:()=>true};
 w.RS_COMM={subscribedTerms:()=>[],renderUsers:()=>{},renderLibrary:()=>{}};
 let language='ru';w.RS_I18N={getLanguage:()=>language,category:(fi,ru)=>language==='fi'?fi:ru};
 w.eval(read('app.js'));w.document.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
 return {w,d:w.document,close:()=>dom.window.close(),lang:x=>{language=x;w.RS_APP_LOCALE(x);}};
}
const modes=['translate','truefalse','matching','multiselect'];
test('ten different sourced exercises for all 10 exam topics, with correct answers and no repeated group',()=>{
 const w=catalog(),g=w.RS_EXAM_ROUNDS,bank=w.RS_TRUE_FALSE.questions;
 for(let t=1;t<=10;t++){
  const topic='EXAM'+String(t).padStart(2,'0');
  const words=g.validTerms(w.RS_DATA,topic);
  assert.ok(words.length>=10,topic+' glossary pool should have at least 10 different terms');
  for(const mode of ['truefalse','matching','multiselect']){
   const questions=g.build(mode,topic,w.RS_DATA,bank,10);
   assert.equal(questions.length,10,topic+' '+mode);
   assert.equal(new Set(questions.map(q=>q.id)).size,10,topic+' '+mode+' repeated exercise');
   if(mode==='truefalse'){
    for(const q of questions){
     assert.ok(q.fi&&q.ru&&q.explanationFi&&q.explanationRu);
     assert.equal(typeof q.correct,'boolean');
     if(!q.correct)assert.ok(q.correctStatementFi&&q.correctStatementRu);
    }
    assert.ok(questions.some(x=>x.correct===false),topic+' false cases');
    assert.ok(questions.some(x=>x.correct===true),topic+' true cases');
   }else if(mode==='matching'){
    for(const q of questions){
     assert.equal(q.items.length,4);assert.equal(q.options.length,4);
     assert.equal(new Set(q.items.map(x=>x.id)).size,4);
     assert.equal(new Set(q.options).size,4);
    }
   }else{
    for(const q of questions){
     assert.equal(q.items.length,4);
     assert.equal(q.items.filter(x=>x.correct).length,2);
     assert.equal(q.items.filter(x=>!x.correct).length,2);
     assert.equal(new Set(q.items.map(x=>x.sourceId)).size,4);
    }
   }
  }
 }
});
test('each four-mode session shows 1..10, no repeated exercise, then summary and restart',()=>{
 for(const mode of modes){
  const b=browser();try{
   b.d.querySelector('[data-view="practice"]').click();
   b.d.querySelector('[data-action="quiz-mode"][data-value="'+mode+'"]').click();
   const cat=b.d.getElementById('quiz-cat');
   cat.value='EXAM05';cat.dispatchEvent(new b.w.Event('change',{bubbles:true}));
   let signatures=[],sessionStart=b.w.localStorage.getItem('run155_rs_scores_v1');
   for(let n=1;n<=10;n++){
    const count=b.d.querySelector('.exam-run-progress');
    assert.ok(count,mode+' no progress count');
    assert.match(count.textContent,new RegExp('Задание / Tehtävä: '+n+' / 10'),mode+' progress');
    let signature='';
    if(mode==='translate'){
     signature=b.d.querySelector('.flash-term').textContent;
     b.d.querySelector('[data-action="quiz-choose"]').click();
    }else if(mode==='truefalse'){
     signature=b.d.querySelector('.exam-question-main').textContent;
     b.d.querySelector('[data-action="tf-choose"][data-value="true"]').click();
    }else if(mode==='matching'){
     signature=Array.from(b.d.querySelectorAll('[id^="match-label-"]')).map(x=>x.textContent).join('|');
     b.d.querySelector('[data-action="match-check"]').click();
    }else{
     signature=Array.from(b.d.querySelectorAll('.exam-multi-choice')).map(x=>x.textContent).join('|');
     b.d.querySelector('[data-action="multi-check"]').click();
    }
    signatures.push(signature);
    assert.ok(signature.length>=2,'short medical terms are valid question texts');
    const next=b.d.querySelector('[data-action="'+(mode==='translate'?'quiz-next':mode==='truefalse'?'tf-next':mode==='matching'?'match-next':'multi-next')+'"]');
    assert.ok(next,mode+' next button missing');
    next.click();
   }
   assert.equal(new Set(signatures).size,10,mode+' duplicated exercise');
   assert.ok(b.d.querySelector('.exam-run-done'),mode+' should finish after ten');
   assert.match(b.d.querySelector('.exam-run-done').textContent,/10/);
   assert.ok(!b.d.querySelector('[data-action="tf-choose"]'),mode+' must not auto-repeat');
   if(mode!=='translate')assert.equal(b.w.localStorage.getItem('run155_rs_scores_v1'),sessionStart,'new modes must not write learning results');
   b.d.querySelector('[data-action="exam-restart"]').click();
   assert.ok(b.d.querySelector('.exam-run-progress'),mode+' restart needs a fresh session');
   assert.match(b.d.querySelector('.exam-run-progress').textContent,/1 \/ 10/);
  }finally{b.close();}
 }
});
test('changing selected exam topic resets ten-round plan; RU/FI switch does not restart progress',()=>{
 const b=browser();try{
  b.d.querySelector('[data-view="practice"]').click();
  b.d.querySelector('[data-action="quiz-mode"][data-value="truefalse"]').click();
  let select=b.d.getElementById('quiz-cat');
  select.value='EXAM04';select.dispatchEvent(new b.w.Event('change',{bubbles:true}));
  b.d.querySelector('[data-action="tf-choose"][data-value="true"]').click();
  b.d.querySelector('[data-action="tf-next"]').click();
  assert.match(b.d.querySelector('.exam-run-progress').textContent,/2 \/ 10/);
  b.lang('fi');assert.match(b.d.querySelector('.exam-run-progress').textContent,/2 \/ 10/);
  assert.equal(b.d.querySelector('.exam-question-main').getAttribute('lang'),'fi');
  select=b.d.getElementById('quiz-cat');select.value='EXAM02';select.dispatchEvent(new b.w.Event('change',{bubbles:true}));
  assert.match(b.d.querySelector('.exam-run-progress').textContent,/1 \/ 10/);
  assert.equal(b.d.querySelector('.exam-question-main').getAttribute('lang'),'fi');
 }finally{b.close();}
});
test('versioned Safari12 assets and privacy: no learned writes from the round generator',()=>{
 const html=read('index.html'),sw=read('sw.js'),app=read('app.js'),module=read('exam-rounds-run155.js'),css=read('style.css');
 assert.ok(html.includes('exam-rounds-run155.js?v=run155-v1'));
 assert.ok(sw.includes('exam-rounds-run155.js?v=run155-v1'));
 assert.ok(html.includes('app.js?v=exam-review-run163-v1'));
 assert.ok(sw.includes('riveria-sanasto-community-v3.0.0-rc31'));
 assert.doesNotMatch(module.replace(/\/\*[\s\S]*?\*\//g,''),/=>|\?\.|\blet\b|\bconst\b|firebase|fetch\s*\(|localStorage|indexedDB/i);
 assert.doesNotMatch(app,/=>|\?\./);
 assert.ok(css.includes('.exam-run-progress'));
});
