'use strict';
/* RUN163: every incorrect post-exam card must show its original prompt,
 * all initial choices, the learner's actual choice and the correct answer.
 * All test users and data are synthetic. No Firebase/production writes.
 */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM}=require('jsdom');
const read=p=>fs.readFileSync(p,'utf8');
function completed(direction,scenario){
 const dom=new JSDOM('<!doctype html><html lang="ru"><body>'+
  '<button data-view="cards">Cards</button><button data-view="practice">Tests</button>'+
  '<button data-view="exam">Exam</button><button data-view="dictionary">Dictionary</button>'+
  '<h1 id="page-title"></h1><p id="page-subtitle"></p>'+
  '<div id="online-status"></div><div id="storage-status"></div>'+
  '<main id="main-content"></main><div id="toast"></div></body></html>',
  {url:'https://sanastoyhteiso.github.io/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,d=w.document;w.scrollTo=()=>{};w.Math.random=()=>0.237;
 for(const p of ['data.js','riveria-anatomy-exam.js','riveria-true-false.js',
  'exam-rounds-run155.js','mock-exam-run156.js'])w.eval(read(p));
 const q=w.RS_MOCK_EXAM.build(w.RS_DATA,w.RS_TRUE_FALSE.questions,direction);
 assert.equal(q.length,40);
 const answers=q.map(item=>{
  if(scenario==='all-correct'){
   if(item.type==='translate')return w.RS_MOCK_EXAM.evaluate(item,item.answer);
   if(item.type==='truefalse')return w.RS_MOCK_EXAM.evaluate(item,item.question.correct);
   if(item.type==='matching')return w.RS_MOCK_EXAM.evaluate(item,item.question.items.map(x=>x.fi));
   return w.RS_MOCK_EXAM.evaluate(item,item.question.items.map(x=>!!x.correct));
  }
  if(scenario==='partial'&&item.type==='matching'){
   return w.RS_MOCK_EXAM.evaluate(item,item.question.items.map((x,i)=>i<2?x.fi:item.question.items[(i+1)%4].fi));
  }
  if(scenario==='partial'&&item.type==='multiselect'){
   var used=false;
   return w.RS_MOCK_EXAM.evaluate(item,item.question.items.map(x=>{if(x.correct&&!used){used=true;return true;}return false;}));
  }
  if(item.type==='translate')return w.RS_MOCK_EXAM.evaluate(item,item.options.find(o=>o!==item.answer));
  if(item.type==='truefalse')return w.RS_MOCK_EXAM.evaluate(item,!item.question.correct);
  if(item.type==='matching'){
   const terms=item.question.items;
   return w.RS_MOCK_EXAM.evaluate(item,terms.map((term,i)=>terms[(i+1)%terms.length].fi));
  }
  return w.RS_MOCK_EXAM.evaluate(item,item.question.items.map(term=>!term.correct));
 });
 assert.equal(answers.length,40);
 if(!scenario||scenario==='all-wrong')assert.ok(answers.every(x=>x.score<1));
 const uid='exam_review_synthetic';
 const k='test_'+uid+'__rs_mock_exam_progress_v1';
 const draft={schema:1,choice:direction,run:{questions:q,index:40,answers,direction}};
 w.localStorage.setItem(k,JSON.stringify(draft));
 const original=w.localStorage.getItem(k);
 w.RS_FAMILY={uid,storageKey:x=>'test_'+uid+'__'+x,sharedEnabled:()=>true};
 w.RS_COMM={subscribedTerms:()=>[],renderUsers:()=>{},renderLibrary:()=>{}};
 w.RS_I18N={getLanguage:()=> 'ru',category:(fi,ru)=>ru};
 w.eval(read('app.js'));d.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
 d.querySelector('[data-view="exam"]').click();
 return {w,d,q,answers,original,k,close:()=>dom.window.close()};
}
for(const direction of ['fi-ru','ru-fi','en-fi']){
 test('RUN163 complete question + correction for each of 4 test types, direction '+direction,()=>{
  const b=completed(direction);try{
   const d=b.d,details=d.querySelectorAll('.exam-review');
   assert.ok(d.querySelector('.exam-run-done'),'40/40 completed screen');
   assert.equal(details.length,40,'40 synthetic wrong pages generate 40 review cards');
   assert.match(d.querySelector('.exam-run-done h2').textContent,/Сдано|Не сдано|Hyväksytty|Hylätty/);
   assert.ok(d.getElementById('main-content').textContent.includes('Полный лист экзамена'));
   assert.equal(d.querySelectorAll('.exam-review-missed').length,40);
   assert.ok(details[0].querySelector('summary').textContent.includes('0 / 1 балл'));
   assert.ok(d.querySelector('[data-action="mock-restart"]'),'can retake completed exam');
   assert.match(d.querySelector('.exam-run-done').textContent,/Новый экзамен/);
   assert.match(d.querySelector('.exam-run-done').textContent,/заменит текущий разбор/);
   const modes=new Set();
   for(let i=0;i<details.length;i++){
    const row=details[i],q=b.q[i],grade=b.answers[i];
    modes.add(q.type);
    assert.match(row.textContent,/Исходное задание/,'all review cards must show original task');
    assert.ok(row.querySelector('summary').textContent.includes('Задание '+(i+1)), 'original question number is shown');
    assert.match(row.textContent,/Правильн|Oikea|valinta/);
    assert.ok(row.querySelector('.exam-review-original'));
    if(q.type==='translate'){
     assert.ok(row.textContent.includes(q.item[q.from]),'original prompt term missing');
     assert.equal(row.querySelectorAll('.exam-review-options li').length,4,'all original options shown');
     for(const option of q.options)assert.ok(row.textContent.includes(option));
     assert.ok(row.textContent.includes(grade.selected));
     assert.ok(row.textContent.includes(q.answer));
     assert.ok(row.querySelector('.exam-review-wrong'));
     assert.ok(row.querySelector('.exam-review-right'));
     assert.ok(row.textContent.includes(q.item.examNoteRu));
    }else if(q.type==='truefalse'){
     assert.ok(row.textContent.includes(q.question.fi),'original FI true/false assertion missing');
     assert.ok(row.textContent.includes(direction==='en-fi'?q.question.en:q.question.ru),'original bilingual assertion missing');
     assert.match(row.textContent,/Твой выбор/);
     assert.match(row.textContent,/Правильный ответ/);
     assert.match(row.textContent,/✕ Ошибка/);
     assert.ok(row.textContent.includes(q.question.correct?
       q.question.explanationRu:
       (q.question.correctStatementRu||q.question.explanationRu)));
    }else if(q.type==='matching'){
     const pairs=row.querySelectorAll('.exam-review-row');
     assert.equal(pairs.length,4,'all original 4 matching definitions needed');
     for(let m=0;m<4;m++){
      assert.ok(pairs[m].textContent.includes(q.question.items[m].examNoteFi));
      if(direction!=='en-fi')assert.ok(pairs[m].textContent.includes(q.question.items[m].examNoteRu));
      assert.match(pairs[m].textContent,/Твой выбор/);
      assert.match(pairs[m].textContent,/Правильная пара/);
      assert.ok(pairs[m].textContent.includes(q.question.items[m].fi));
      assert.ok(pairs[m].textContent.includes(grade.selected[m]));
      assert.ok(pairs[m].classList.contains('exam-review-wrong'));
     }
    }else{
     const lines=row.querySelectorAll('.exam-review-row');
     assert.equal(lines.length,4,'all 4 original multi-select statements needed');
     for(let m=0;m<4;m++){
      const claim=q.question.items[m],line=lines[m];
      assert.ok(line.textContent.includes(claim.fi),'original FI claim missing');
      assert.ok(line.textContent.includes(direction==='en-fi'?claim.en:claim.ru),'original localized claim missing');
      assert.match(line.textContent,/Твой выбор/);
      assert.match(line.textContent,/Правильное действие/);
      assert.ok(line.classList.contains('exam-review-wrong'));
      assert.ok(line.textContent.includes(claim.correct?
        claim.explanationRu:
        (claim.correctStatementRu||claim.explanationRu)));
     }
    }
   }
   assert.deepEqual([...modes].sort(),['matching','multiselect','translate','truefalse']);
   assert.equal(b.w.localStorage.getItem(b.k),b.original,'review must never mutate saved 40 answers');
  }finally{b.close();}
 });
}

test('RUN163 all 40 correct are listed with 1 / 1 and only compact explanations',()=>{
 const b=completed('ru-fi','all-correct');
 try{
  const d=b.d,rows=d.querySelectorAll('.exam-review');
  assert.equal(rows.length,40);
  assert.equal(d.querySelectorAll('.exam-review-passed').length,40);
  assert.equal(d.querySelectorAll('.exam-review-missed').length,0);
  for(let i=0;i<40;i++){
   assert.ok(rows[i].querySelector('summary').textContent.includes('Задание '+(i+1)));
   assert.match(rows[i].querySelector('summary').textContent,/1 \/ 1 балл/);
   assert.match(rows[i].querySelector('summary').textContent,/✓ Верно/);
   assert.ok(rows[i].querySelector('.exam-review-original'));
   if(b.q[i].type==='truefalse')
    assert.equal(rows[i].querySelectorAll('.exam-explain').length,0,'correct true-false must be concise');
   if(b.q[i].type==='translate')
    assert.equal(rows[i].querySelectorAll('.exam-explain').length,0,'correct translation must be concise');
  }
  assert.match(d.querySelector('.exam-run-done').textContent,/40 \/ 40 баллов/);
  assert.match(d.getElementById('main-content').textContent,/Ошибочных и частично правильных/);
  assert.equal(b.w.localStorage.getItem(b.k),b.original,'full report must be read-only');
 }finally{b.close();}
});
test('RUN163 half-credit cases display 0,5 / 1 and correct-versus-wrong rows',()=>{
 const b=completed('fi-ru','partial');
 try{
  const rows=b.d.querySelectorAll('.exam-review');
  assert.equal(rows.length,40);
  let partial=0;
  for(let i=0;i<40;i++){
   const q=b.q[i],row=rows[i],score=b.answers[i].score;
   if(q.type==='matching'){
    assert.equal(score,0.5);
    assert.ok(row.querySelector('summary').textContent.includes('0,5 / 1 балл'));
    assert.ok(row.querySelectorAll('.exam-review-right').length>=2);
    assert.ok(row.querySelectorAll('.exam-review-wrong').length>=2);
    partial++;
   }else if(q.type==='multiselect'){
    assert.equal(score,0.5);
    assert.ok(row.querySelector('summary').textContent.includes('0,5 / 1 балл'));
    assert.ok(row.querySelectorAll('.exam-review-right').length>=1);
    assert.ok(row.querySelectorAll('.exam-review-wrong').length>=1);
    partial++;
   }
  }
  assert.equal(partial,20);
  assert.equal(b.w.localStorage.getItem(b.k),b.original);
 }finally{b.close();}
});

test('RUN163 no answer key or review panels shown before the 40th answer',()=>{
 const dom=new JSDOM('<!doctype html><html lang="ru"><body>'+
  '<button data-view="cards">Cards</button><button data-view="exam">Exam</button>'+
  '<h1 id="page-title"></h1><p id="page-subtitle"></p>'+
  '<div id="online-status"></div><div id="storage-status"></div>'+
  '<main id="main-content"></main><div id="toast"></div></body></html>',
  {url:'https://sanastoyhteiso.github.io/',runScripts:'outside-only',pretendToBeVisual:true});
 try{
  const w=dom.window,d=w.document;w.scrollTo=()=>{};w.Math.random=()=>0.237;
  for(const p of ['data.js','riveria-anatomy-exam.js','riveria-true-false.js',
   'exam-rounds-run155.js','mock-exam-run156.js'])w.eval(read(p));
  w.RS_FAMILY={uid:'test',storageKey:k=>'test_'+k,sharedEnabled:()=>true};
  w.RS_COMM={subscribedTerms:()=>[],renderUsers:()=>{},renderLibrary:()=>{}};
  w.RS_I18N={getLanguage:()=> 'ru',category:(fi,ru)=>ru};
  w.eval(read('app.js'));d.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
  d.querySelector('[data-view="exam"]').click();
  assert.ok(d.querySelector('.exam-run-progress'));
  assert.equal(d.querySelectorAll('.exam-review').length,0);
  assert.equal(d.querySelectorAll('.exam-review-original').length,0);
 }finally{dom.window.close();}
});
test('RUN163 ES5 compatible; consistent mobile CSS and cloud schema unchanged',()=>{
 const app=read('app.js'),css=read('style.css'),html=read('index.html'),sw=read('sw.js');
 assert.ok(app.includes('function mockReviewTerm('));
 assert.ok(app.includes('function mockErrorReview('));
 assert.ok(css.includes('.exam-review-original'));
 assert.ok(css.includes('.exam-review-row'));
 assert.match(html,/app\.js\?v=exam-review-run163-v1/);
 assert.match(html,/style\.css\?v=exam-review-run163-1/);
 assert.match(sw,/v3\.0\.0-rc31/);
 assert.doesNotMatch(app,/=>|\?\./,'must remain compatible with legacy Safari');
});
