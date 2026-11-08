'use strict';
/* RUN156: no external accounts or writes, synthetic browser, full exam and exact passing threshold. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {JSDOM}=require('jsdom'),read=p=>fs.readFileSync(p,'utf8');
function data(){
 const ctx={window:{}};
 for(const p of ['data.js','riveria-anatomy-exam.js','riveria-true-false.js','exam-rounds-run155.js','mock-exam-run156.js'])vm.runInNewContext(read(p),ctx);
 return ctx.window;
}
function browser(){
 const dom=new JSDOM('<!doctype html><html lang="ru"><body>'+
 '<button data-view="cards">Cards</button><button data-view="practice">Tests</button>'+
 '<button data-view="exam">Exam</button><button data-view="dictionary">Dictionary</button>'+
 '<h1 id="page-title"></h1><p id="page-subtitle"></p><div id="online-status"></div>'+
 '<div id="storage-status"></div><main id="main-content"></main><div id="toast"></div></body></html>',
 {url:'https://sanastoyhteiso.github.io/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;w.scrollTo=()=>{};w.Math.random=()=>0.367;
 for(const p of ['data.js','riveria-anatomy-exam.js','riveria-true-false.js','exam-rounds-run155.js','mock-exam-run156.js'])w.eval(read(p));
 w.RS_FAMILY={uid:'synthetic-run156',storageKey:k=>'run156_'+k,sharedEnabled:()=>true};
 w.RS_COMM={subscribedTerms:()=>[],renderUsers:()=>{},renderLibrary:()=>{}};
 let locale='ru';w.RS_I18N={getLanguage:()=>locale,category:(fi,ru)=>locale==='fi'?fi:ru};
 w.eval(read('app.js'));w.document.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
 return {w,d:w.document,lang:x=>{locale=x;w.RS_APP_LOCALE(x);},close:()=>dom.window.close()};
}
test('exactly 40 unique pages = 10 each mode, 4 modes across 10 topics, all four directions',()=>{
 const w=data(),bank=w.RS_TRUE_FALSE.questions;
 for(const direction of ['fi-ru','ru-fi','fi-en','en-fi']){
  const q=w.RS_MOCK_EXAM.build(w.RS_DATA,bank,direction);
  assert.equal(q.length,40,direction);
  assert.equal(new Set(q.map(x=>x.id)).size,40,direction+' duplicate page');
  const counts={},topics={};
  for(const x of q){
   counts[x.type]=(counts[x.type]||0)+1;
   topics[x.topic]=(topics[x.topic]||0)+1;
   assert.ok(x.topic.match(/^EXAM(0[1-9]|10)$/));
   if(x.type==='translate'){
    assert.equal(x.options.length,4);assert.ok(x.item[x.from]&&x.item[x.to]);
   }else if(x.type==='truefalse'){
    assert.ok(x.question.fi&&x.question.ru&&x.question.en);
   }else{
    assert.equal(x.question.items.length,4);
    if(x.type==='matching')assert.equal(new Set(x.question.options).size,4);
    else assert.equal(x.question.items.filter(z=>z.correct).length,2);
   }
  }
  for(const mode of ['translate','truefalse','matching','multiselect'])assert.equal(counts[mode],10);
  for(let i=1;i<=10;i++)assert.equal(topics['EXAM'+String(i).padStart(2,'0')],4);
 }
});
test('40 questions scored out of 40, 32/40 pass while 31/40 fail, partial marks supported',()=>{
 const w=data(),engine=w.RS_MOCK_EXAM;
 let answers=Array.from({length:40},(_,i)=>({score:i<32?1:0}));
 assert.equal(engine.report({answers}).percent,80);
 assert.equal(engine.report({answers}).passed,true);
 answers=Array.from({length:40},(_,i)=>({score:i<31?1:0}));
 assert.equal(engine.report({answers}).passed,false);
 assert.equal(engine.report({answers}).percent,77.5);
 const q=engine.build(w.RS_DATA,w.RS_TRUE_FALSE.questions,'fi-ru');
 const matching=q.find(x=>x.type==='matching'),multi=q.find(x=>x.type==='multiselect');
 const right=matching.question.items.map(x=>x.fi);
 assert.equal(engine.evaluate(matching,right).score,1);
 const wrong=right.slice();wrong[0]='';assert.equal(engine.evaluate(matching,wrong).score,.75);
 const correct=multi.question.items.map(x=>!!x.correct);
 assert.equal(engine.evaluate(multi,correct).score,1);
 assert.equal(engine.evaluate(multi,correct.map(x=>!x)).score,0);
 const half=correct.slice();half[correct.indexOf(true)]=false;
 assert.equal(engine.evaluate(multi,half).score,.5);
});
test('exam UI displays only direction, locks wrong or blank partial, hides keys until result, no progress writes',()=>{
 const b=browser();try{
  b.d.querySelector('[data-view="exam"]').click();
  assert.ok(b.d.getElementById('mock-dir'));
  assert.ok(!b.d.getElementById('quiz-cat'),'mock exam has no per-topic selector');
  assert.ok(!b.d.querySelector('[data-action="tf-next"]'),'no skip/other-question action');
  assert.ok(!b.d.querySelector('[data-action="quiz-next"]'),'no skip translation question');
  const initial=b.w.localStorage.getItem('run156_rs_scores_v1');
  const seenModes={},selectedLabels=[];
  for(let n=1;n<=40;n++){
   const p=b.d.querySelector('.exam-run-progress');
   assert.ok(p,'missing page '+n);assert.match(p.textContent,new RegExp('Экзамен / Koe: '+n+' / 40'));
   assert.ok(!b.d.querySelector('[data-action="mock-next"]'),'cannot go next without answer');
   const match=b.d.querySelectorAll('[data-mock-match]');
   const multi=b.d.querySelectorAll('[data-mock-multi]');
   const buttons=b.d.querySelectorAll('[data-action="mock-answer"]');
   if(match.length){
    seenModes.matching=true;
    b.d.querySelector('[data-action="mock-check"]').click();
    assert.ok(!b.d.querySelector('[data-action="mock-next"]'),'blank matching answer cannot proceed');
    for(const x of match)x.value=x.options[1].value;
    b.d.querySelector('[data-action="mock-check"]').click();
   }else if(multi.length){
    seenModes.multiselect=true;
    b.d.querySelector('[data-action="mock-check"]').click();
    assert.ok(!b.d.querySelector('[data-action="mock-next"]'),'blank multi cannot proceed');
    multi[0].checked=true;
    b.d.querySelector('[data-action="mock-check"]').click();
   }else if(buttons.length===2){seenModes.truefalse=true;buttons[0].click();}
   else {seenModes.translate=true;buttons[0].click();}
   assert.ok(b.d.querySelector('[data-action="mock-next"]'),'answer must unlock next');
   assert.ok(!b.d.querySelector('.exam-review'),'answer key hidden until finish');
   b.d.querySelector('[data-action="mock-next"]').click();
  }
  assert.deepEqual(Object.keys(seenModes).sort(),['matching','multiselect','translate','truefalse']);
  assert.ok(b.d.querySelector('.exam-run-done'),'must have final page');
  assert.match(b.d.querySelector('.exam-run-done').textContent,/40 баллов/);
  assert.match(b.d.getElementById('main-content').textContent,/Полный лист экзамена/);
  assert.equal(b.w.localStorage.getItem('run156_rs_scores_v1'),initial,'exam did not grade learning progress');
  b.d.querySelector('[data-action="mock-restart"]').click();
  assert.match(b.d.querySelector('.exam-run-progress').textContent,/1 \/ 40/);
 }finally{b.close();}
});
test('language selector in three existing new practice modes respects FI RU EN and auto',()=>{
 const b=browser();try{
  b.d.querySelector('[data-view="practice"]').click();
  for(const mode of ['truefalse','matching','multiselect']){
   b.d.querySelector('[data-action="quiz-mode"][data-value="'+mode+'"]').click();
   for(const [dir,primary,secondary] of [['ru-fi','ru','fi'],['fi-ru','fi','ru'],['en-fi','en','fi'],['fi-en','fi','en']]){
    const control=b.d.getElementById('quiz-dir');
    assert.ok(control,mode+' must expose direction');
    control.value=dir;control.dispatchEvent(new b.w.Event('change',{bubbles:true}));
    assert.equal(b.d.querySelector('.exam-question-main').getAttribute('lang'),primary,mode+' '+dir);
    const second=b.d.querySelector('.exam-question-secondary').getAttribute('lang');
    // English in matching has an instructional subtitle rather than leaking correct dropdown answer.
    assert.equal(second,secondary,mode+' '+dir);
   }
  }
  b.d.querySelector('[data-action="quiz-mode"][data-value="translate"]').click();
  assert.ok(b.d.querySelector('[data-action="quiz-choose"]'),'old test preserved');
 }finally{b.close();}
});
test('ES5, cache rc25, exam nav, and all versioned scripts present',()=>{
 const html=read('index.html'),sw=read('sw.js'),app=read('app.js'),src=read('mock-exam-run156.js');
 assert.match(html,/data-view="exam"/);
 assert.match(html,/mock-exam-run156\.js\?v=latin-run164-v1/);
 assert.match(html,/app\.js\?v=exam-preserve-run167-1/);
 assert.match(html,/riveria-true-false\.js\?v=run156-en-1/);
 assert.match(sw,/v3\.0\.0-rc35/);
 assert.match(sw,/mock-exam-run156\.js\?v=latin-run164-v1/);
 assert.doesNotMatch(src.replace(/\/\*[\s\S]*?\*\//g,''),/=>|\?\.|\bconst\b|\blet\b|fetch\s*\(|localStorage|firestore|firebase/i);
 assert.doesNotMatch(app,/=>|\?\./);
});


test('auto language picks site direction; exam direction stays fixed after first answer and refreshes only before start',()=>{
 const b=browser();try{
  b.d.querySelector('[data-view="exam"]').click();
  b.lang('fi');
  assert.equal(b.d.querySelector('#mock-dir').value,'auto');
  let match=b.d.querySelectorAll('[data-mock-match]'),multi=b.d.querySelectorAll('[data-mock-multi]'),buttons=b.d.querySelectorAll('[data-action="mock-answer"]');
  if(match.length){for(const x of match)x.value=x.options[1].value;b.d.querySelector('[data-action="mock-check"]').click();}
  else if(multi.length){multi[0].checked=true;b.d.querySelector('[data-action="mock-check"]').click();}
  else buttons[0].click();
  const exactPage=b.d.querySelector('.exam-run-progress').textContent;
  b.lang('en');
  assert.equal(b.d.querySelector('.exam-run-progress').textContent,exactPage);
  assert.ok(b.d.querySelector('[data-action="mock-next"]'),'language switch does not erase accepted exam answer');
  b.d.querySelector('[data-action="mock-next"]').click();
  assert.match(b.d.querySelector('.exam-run-progress').textContent,/2 \/ 40/);
 }finally{b.close();}
});
