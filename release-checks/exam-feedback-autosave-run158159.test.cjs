'use strict';
/* RUN158/159: feedback UX and durable, account-separated, offline exam progress.
 * Synthetic browser only. No real credentials, accounts or cloud writes.
 */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM}=require('jsdom');
const read=p=>fs.readFileSync(p,'utf8');
const key=uid=>'test_'+uid+'__rs_mock_exam_progress_v1';
function browser(uid,storage){
 const dom=new JSDOM('<!doctype html><html lang="ru"><body>'+
  '<button data-view="cards">Cards</button><button data-view="practice">Tests</button>'+
  '<button data-view="exam">Exam</button><button data-view="dictionary">Dictionary</button>'+
  '<h1 id="page-title"></h1><p id="page-subtitle"></p>'+
  '<div id="online-status"></div><div id="storage-status"></div>'+
  '<main id="main-content"></main><div id="toast"></div></body></html>',
 {url:'https://sanastoyhteiso.github.io/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;w.scrollTo=()=>{};w.Math.random=()=>0.27;
 w.RS_FAMILY={uid:uid,storageKey:k=>uid?'test_'+uid+'__'+k:null,sharedEnabled:()=>true};
 if(storage){for(const k of Object.keys(storage))w.localStorage.setItem(k,storage[k]);}
 for(const p of ['data.js','riveria-anatomy-exam.js','riveria-true-false.js','exam-rounds-run155.js','mock-exam-run156.js'])w.eval(read(p));
 w.RS_COMM={subscribedTerms:()=>[],renderUsers:()=>{},renderLibrary:()=>{}};
 w.RS_I18N={getLanguage:()=> 'ru',category:(fi,ru)=>ru};
 w.eval(read('app.js'));w.document.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
 return {w,d:w.document,close:()=>dom.window.close()};
}
function examAnswer(b){
 const d=b.d,matching=d.querySelectorAll('[data-mock-match]'),
  multi=d.querySelectorAll('[data-mock-multi]'),
  buttons=d.querySelectorAll('[data-action="mock-answer"]');
 if(matching.length){
  for(const x of matching)x.value=x.options[1].value;
  d.querySelector('[data-action="mock-check"]').click();
 }else if(multi.length){
  multi[0].checked=true;
  d.querySelector('[data-action="mock-check"]').click();
 }else {
  assert.ok(buttons.length===2||buttons.length===4);
  buttons[0].click();
 }
 assert.ok(d.querySelector('[data-action="mock-next"]'));
}
test('false assertion correctly rejected: green tick for Epätosi, wrong Tosi red cross',()=>{
 const a=browser('A');try{
  a.d.querySelector('[data-view="practice"]').click();
  a.d.querySelector('[data-action="quiz-mode"][data-value="truefalse"]').click();
  const cat=a.d.getElementById('quiz-cat');cat.value='EXAM05';
  cat.dispatchEvent(new a.w.Event('change',{bubbles:true}));
  let found=false;
  for(let i=0;i<10;i++){
    if(a.d.querySelector('.exam-question-bilingual').textContent.includes('Laskimot vievät aina verta pois sydämestä')){
      found=true;break;
    }
    a.d.querySelector('[data-action="tf-next"]').click();
  }
  assert.ok(found,'must encounter known false statement');
  a.d.querySelector('[data-action="tf-choose"][data-value="false"]').click();
  assert.ok(a.d.querySelector('.exam-judgement.correct'));
  assert.match(a.d.querySelector('.exam-judgement').textContent,/✓ Правильно!/);
  assert.match(a.d.querySelector('.exam-judgement').textContent,/Твой выбор/);
  assert.match(a.d.querySelector('.exam-judgement').textContent,/Epätosi/);
  assert.ok(a.d.querySelector('.quiz-picked-correct[data-value="false"]'));
 }finally{a.close();}
 const b=browser('B');try{
  b.d.querySelector('[data-view="practice"]').click();
  b.d.querySelector('[data-action="quiz-mode"][data-value="truefalse"]').click();
  const cat=b.d.getElementById('quiz-cat');cat.value='EXAM05';
  cat.dispatchEvent(new b.w.Event('change',{bubbles:true}));
  let found=false;
  for(let i=0;i<10;i++){
    if(b.d.querySelector('.exam-question-bilingual').textContent.includes('Laskimot vievät aina verta pois sydämestä')){
      found=true;break;
    }
    b.d.querySelector('[data-action="tf-next"]').click();
  }
  assert.ok(found);
  b.d.querySelector('[data-action="tf-choose"][data-value="true"]').click();
  assert.ok(b.d.querySelector('.exam-judgement.wrong'));
  assert.match(b.d.querySelector('.exam-judgement').textContent,/✕ Ошибка/);
  assert.ok(b.d.querySelector('.quiz-picked-wrong[data-value="true"]'));
 }finally{b.close();}
});
test('multiple-select colors reflect user choice accuracy, not whether the statement is true',()=>{
 const b=browser('A');try{
  b.d.querySelector('[data-view="practice"]').click();
  b.d.querySelector('[data-action="quiz-mode"][data-value="multiselect"]').click();
  const checkboxes=b.d.querySelectorAll('[data-multi-index]');
  assert.equal(checkboxes.length,4);
  b.d.querySelector('[data-action="multi-check"]').click();
  const feedback=b.d.querySelectorAll('.exam-judgement');
  assert.equal(feedback.length,4);
  assert.equal(b.d.querySelectorAll('.exam-judgement.correct').length,2,'unselected false statements are correct selections');
  assert.equal(b.d.querySelectorAll('.exam-judgement.wrong').length,2,'unselected true statements are errors');
  assert.match(feedback[0].textContent,/Ты не отметил утверждение/);
  assert.ok(b.d.querySelector('.exam-feedback-one'));
 }finally{b.close();}
});
test('exam saves exact 40-question order, answers, direction and next page across navigation and reload',()=>{
 const a=browser('A');let saved,expectedId;
 try{
  const d=a.d,w=a.w;
  d.querySelector('[data-view="exam"]').click();
  assert.match(d.querySelector('.exam-run-progress').textContent,/1 \/ 40/);
  assert.ok(d.querySelector('.exam-autosave-ok'));
  const oldScore=w.localStorage.getItem('test_A__rs_scores_v1');
  examAnswer(a);
  let snapshot=JSON.parse(w.localStorage.getItem(key('A')));
  assert.equal(snapshot.run.answers.length,1);
  assert.equal(snapshot.run.index,0);
  d.querySelector('[data-action="mock-next"]').click();
  assert.match(d.querySelector('.exam-run-progress').textContent,/2 \/ 40/);
  snapshot=JSON.parse(w.localStorage.getItem(key('A')));
  assert.equal(snapshot.run.index,1);
  assert.equal(snapshot.run.questions.length,40);
  expectedId=snapshot.run.questions[1].id;
  saved=w.localStorage.getItem(key('A'));
  d.querySelector('[data-view="practice"]').click();
  d.querySelector('[data-view="exam"]').click();
  assert.match(d.querySelector('.exam-run-progress').textContent,/2 \/ 40/);
  w.RS_FAMILY_REFRESH(true);
  d.querySelector('[data-view="exam"]').click();
  assert.match(d.querySelector('.exam-run-progress').textContent,/2 \/ 40/);
  assert.equal(w.localStorage.getItem('test_A__rs_scores_v1'),oldScore);
 }finally{a.close();}
 const b=browser('A',{[key('A')]:saved});
 try{
  b.d.querySelector('[data-view="exam"]').click();
  assert.match(b.d.querySelector('.exam-run-progress').textContent,/2 \/ 40/);
  assert.equal(JSON.parse(b.w.localStorage.getItem(key('A'))).run.questions[1].id,expectedId);
  examAnswer(b);b.d.querySelector('[data-action="mock-next"]').click();
  assert.match(b.d.querySelector('.exam-run-progress').textContent,/3 \/ 40/);
 }finally{b.close();}
 const other=browser('B',{[key('A')]:saved});
 try{
  other.d.querySelector('[data-view="exam"]').click();
  assert.match(other.d.querySelector('.exam-run-progress').textContent,/1 \/ 40/,'another account cannot see previous attempt');
  assert.equal(JSON.parse(other.w.localStorage.getItem(key('A'))).run.index,1);
 }finally{other.close();}
});
test('completed exam result persists, restart clears only this attempt and keeps unrelated keys',()=>{
 const b=browser('A');try{
  const d=b.d,w=b.w;
  w.localStorage.setItem('test_A__rs_scores_v1','{"dummy":123}');
  d.querySelector('[data-view="exam"]').click();
  for(let n=1;n<=40;n++){
    examAnswer(b);
    d.querySelector('[data-action="mock-next"]').click();
  }
  assert.ok(d.querySelector('.exam-run-done'));
  const snapshot=w.localStorage.getItem(key('A')),data=JSON.parse(snapshot);
  assert.equal(data.run.index,40);assert.equal(data.run.answers.length,40);
  d.querySelector('[data-view="dictionary"]').click();
  d.querySelector('[data-view="exam"]').click();
  assert.ok(d.querySelector('.exam-run-done'));
  d.querySelector('[data-action="mock-restart"]').click();
  assert.match(d.querySelector('.exam-run-progress').textContent,/1 \/ 40/);
  const restarted=JSON.parse(w.localStorage.getItem(key('A')));
  assert.equal(restarted.run.index,0);assert.equal(restarted.run.answers.length,0);
  assert.equal(w.localStorage.getItem('test_A__rs_scores_v1'),'{"dummy":123}');
 }finally{b.close();}
});
test('bad or unavailable storage never crashes the exam and visibly warns when saving is impossible',()=>{
 const missing=browser(null);
 try{
  missing.d.querySelector('[data-view="exam"]').click();
  assert.ok(missing.d.querySelector('.exam-autosave-warning'));
  assert.match(missing.d.querySelector('.exam-run-progress').textContent,/1 \/ 40/);
 }finally{missing.close();}
 const corrupted=browser('A',{[key('A')]:'{"schema":1,"run":{"index":99}}'});
 try{
  corrupted.d.querySelector('[data-view="exam"]').click();
  assert.match(corrupted.d.querySelector('.exam-run-progress').textContent,/1 \/ 40/);
  const parsed=JSON.parse(corrupted.w.localStorage.getItem(key('A')));
  assert.equal(parsed.run.questions.length,40);assert.equal(parsed.run.index,0);
 }finally{corrupted.close();}
});
test('new feedback and autosave use ES5; offline cache and UI assets must match',()=>{
 const html=read('index.html'),sw=read('sw.js'),app=read('app.js'),css=read('style.css');
 assert.ok(app.includes('mockSaveDraft()'));
 assert.ok(app.includes('mockReadDraft()'));
 assert.ok(app.includes('truthAnswerFeedback('));
 assert.ok(app.includes('multipleAnswerFeedback('));
 assert.ok(css.includes('.exam-autosave-warning'));
 assert.ok(html.includes('app.js?v=exam-preserve-run167-1'));
 assert.ok(sw.includes('app.js?v=exam-preserve-run167-1'));
 assert.ok(sw.includes('riveria-sanasto-community-v3.0.0-rc34'));
 assert.doesNotMatch(app,/=>|\?\./);
});
