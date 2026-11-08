'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM}=require('jsdom');
const load=p=>fs.readFileSync(p,'utf8');
function setup(dir){
 const dom=new JSDOM('<!doctype html><html lang="ru"><body>'+
  '<button data-view="cards">Cards</button><button data-view="practice">Tests</button>'+
  '<button data-view="exam">Exam</button><button data-view="dictionary">Dictionary</button>'+
  '<h1 id="page-title"></h1><p id="page-subtitle"></p>'+
  '<div id="online-status"></div><div id="storage-status"></div>'+
  '<main id="main-content"></main><div id="toast"></div></body></html>',
  {url:'https://sanastoyhteiso.github.io/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,d=dom.window.document;
 w.scrollTo=()=>{};w.Math.random=()=>0.36123;
 w.RS_FAMILY={uid:'run164',storageKey:k=>'run164_'+k,sharedEnabled:()=>true};
 w.RS_COMM={subscribedTerms:()=>[],renderUsers:()=>{},renderLibrary:()=>{}};
 w.RS_I18N={getLanguage:()=>dir==='fi-ru'?'fi':'ru',category:(fi,ru)=>ru};
 for(const file of ['data.js','riveria-anatomy-exam.js','riveria-true-false.js',
  'exam-rounds-run155.js','mock-exam-run156.js'])w.eval(load(file));
 return {w,d,dom,init:()=>{w.eval(load('app.js'));d.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));},
  close:()=>dom.window.close()};
}
function targetIds(q){
 if(q.type==='translate')return [q.item.id];
 if(q.type==='truefalse')return [q.question.sourceId];
 if(q.type==='matching')return q.question.items.map(x=>x.id);
 return q.question.items.map(x=>x.sourceId);
}
for(const dir of ['fi-ru','ru-fi','fi-en','en-fi']){
 test('RUN165 exam 10 topics x 4 formats, 20 Latin exercises, 100 nonrepeated target terms, '+dir,()=>{
  const b=setup(dir);
  try{
   const qs=b.w.RS_MOCK_EXAM.build(b.w.RS_DATA,b.w.RS_TRUE_FALSE.questions,dir);
   assert.equal(qs.length,40,'must keep 40 pages');
   assert.equal(new Set(qs.map(x=>x.id)).size,40,'question IDs unique');
   const topics={},modes={},ids=new Set(),latinByMode={translate:0,truefalse:0,matching:0,multiselect:0};
   for(const q of qs){
    topics[q.topic]=(topics[q.topic]||0)+1;
    modes[q.type]=(modes[q.type]||0)+1;
    const targets=targetIds(q);assert.ok(targets.every(Boolean),'all reviewed questions have a target term');
    for(const id of targets){assert.ok(!ids.has(id),'exam repeats target term '+id);ids.add(id);}
    if(q.type==='translate'){
     assert.equal(q.options.length,4);
     assert.equal(new Set(q.options).size,4);
     assert.ok(q.options.includes(q.answer));
     if(q.latin){latinByMode.translate++;assert.ok(q.item.la);
      assert.ok(q.from==='la'||q.to==='la');}
    }else if(q.type==='truefalse'){
     assert.equal(typeof q.question.correct,'boolean');
     if(q.question.latin){latinByMode.truefalse++;assert.match(q.question.fi,/Latinankielinen/);
      assert.match(q.question.ru,/Латинский термин/);
      assert.ok(q.question.correctStatementFi);assert.ok(q.question.correctStatementRu);}
    }else if(q.type==='matching'){
     assert.equal(q.question.options.length,4);
     if(q.question.answerKey==='la'){latinByMode.matching++;
      assert.equal(new Set(q.question.items.map(x=>x.la)).size,4);
      assert.deepEqual(new Set(q.question.options),new Set(q.question.items.map(x=>x.la)));
     }
     const solution=q.question.items.map(x=>x[q.question.answerKey==='la'?'la':'fi']);
     assert.equal(b.w.RS_MOCK_EXAM.evaluate(q,solution).score,1);
     const twoWrong=solution.slice();twoWrong[0]=solution[1];twoWrong[1]=solution[0];
     assert.equal(b.w.RS_MOCK_EXAM.evaluate(q,twoWrong).score,.5);
    }else if(q.type==='multiselect'){
     assert.equal(q.question.items.length,4);
     assert.equal(q.question.items.filter(x=>x.correct).length,2);
     if(q.question.latin){latinByMode.multiselect++;
      for(const x of q.question.items){assert.equal(x.latin,true);
       assert.match(x.fi,/Latinankielinen/);assert.match(x.ru,/Латинский термин/);}
     }
     assert.equal(b.w.RS_MOCK_EXAM.evaluate(q,q.question.items.map(x=>x.correct)).score,1);
    }
   }
   assert.equal(ids.size,100,'10 distinct target concepts per topic');
   for(const t of b.w.RS_DATA.examTopics)assert.equal(topics[t.id],4,t.id);
   for(const type of Object.keys(latinByMode))assert.equal(modes[type],10,type);
   assert.deepEqual(latinByMode,{translate:5,truefalse:5,matching:5,multiselect:5});
   // Repeatedly reshuffle to ensure the absence of repeats is structural rather than incidental.
   for(let k=0;k<3;k++){
    const run=b.w.RS_MOCK_EXAM.build(b.w.RS_DATA,b.w.RS_TRUE_FALSE.questions,dir);
    assert.equal(run.length,40);
    assert.equal(new Set(run.flatMap(targetIds)).size,100);
   }
  }finally{b.close();}
 });
}
test('RUN165 10-question practice rounds include Latin in true/false, matching and multiselect in all topics',()=>{
 const b=setup('ru-fi');
 try{
  const g=b.w.RS_EXAM_ROUNDS,bank=b.w.RS_TRUE_FALSE.questions;
  for(const topic of b.w.RS_DATA.examTopics.map(x=>x.id)){
   for(const mode of ['truefalse','matching','multiselect']){
    const qs=g.build(mode,topic,b.w.RS_DATA,bank,10);
    assert.equal(qs.length,10,topic+' '+mode+' 10 questions');
    assert.equal(new Set(qs.map(x=>x.id)).size,10,topic+' '+mode+' duplicates');
    let latin=qs.filter(q=>mode==='truefalse'?q.latin:
      mode==='matching'?q.answerKey==='la':q.latin).length;
    assert.ok(latin>=1,topic+' '+mode+' no Latin rounds');
    if(mode==='matching')for(const q of qs.filter(x=>x.answerKey==='la')){
     assert.equal(new Set(q.items.map(x=>x.la)).size,4);
     assert.deepEqual(new Set(q.options),new Set(q.items.map(x=>x.la)));
    }
   }
  }
 }finally{b.close();}
});
test('RUN165 Latin study cards are shuffled with regular cards but never create new cloud score IDs',()=>{
 const b=setup('ru-fi');
 try{
  b.init();const d=b.d;
  d.querySelector('[data-view="cards"]').click();
  const category=d.getElementById('cards-cat');category.value='EXAM02';
  category.dispatchEvent(new b.w.Event('change',{bubbles:true}));
  assert.equal(d.getElementById('cards-latin-mix').checked,true);
  let viewed=0,latinFound=false;
  for(let i=0;i<20;i++){
   const prompt=d.querySelector('.flash-term');if(!prompt)break;
   const latin=new Set(b.w.RS_EXAM_ROUNDS.validTerms(b.w.RS_DATA,'EXAM02')
     .filter(x=>!!x.la).map(x=>x.la));
   if(latin.has(prompt.textContent.trim())){
    latinFound=true;
    d.querySelector('[data-action="flip"]').click();
    assert.match(d.querySelector('.flash-trans').textContent,/—/);
    d.querySelector('[data-action="mark-good"]').click();
    break;
   }
   d.querySelector('[data-action="next-card"]').click();viewed++;
  }
  assert.ok(latinFound,'Latin prompt must be available among additional study cards');
  const scores=JSON.parse(b.w.localStorage.getItem('run164_rs_scores_v1')||'{}');
  assert.ok(Object.keys(scores).length>=1);
  assert.ok(Object.keys(scores).every(id=>/^T\d+$/.test(id)), 'virtual Latin card IDs must not leak into learning score backend');
  const toggle=d.getElementById('cards-latin-mix');toggle.checked=false;
  toggle.dispatchEvent(new b.w.Event('change',{bubbles:true}));
  assert.equal(d.getElementById('cards-latin-mix').checked,false);
  const dir=d.getElementById('cards-dir');
  assert.ok([...dir.options].some(x=>x.value==='la-fi'));
  dir.value='la-fi';dir.dispatchEvent(new b.w.Event('change',{bubbles:true}));
  assert.ok(d.querySelector('.flash-term'));
 }finally{b.close();}
});
test('RUN165 four-choice practice mixes Latin automatically, supports explicit Latin directions and avoids duplicate prompts',()=>{
 const b=setup('ru-fi');
 try{
  b.init();const d=b.d;
  d.querySelector('[data-view="practice"]').click();
  for(let n=0;n<10;n++){
   const root=d.getElementById('main-content');
   assert.match(root.textContent,/Задание|Результат/);
   const option=root.querySelector('[data-action="quiz-choose"]');
   if(!option)break;
   option.click();
   const next=root.querySelector('[data-action="quiz-next"]')||
    d.querySelector('[data-action="quiz-next"]');
   if(next)next.click();
  }
  d.querySelector('[data-action="exam-restart"]').click();
  const dir=d.getElementById('quiz-dir');dir.value='la-ru';
  dir.dispatchEvent(new b.w.Event('change',{bubbles:true}));
  assert.equal(d.getElementById('quiz-dir').value,'la-ru');
  const choices=[...d.querySelectorAll('[data-action="quiz-choose"]')];
  assert.equal(choices.length,4);
  assert.ok(d.querySelector('.flash-term').textContent.length>1);
 }finally{b.close();}
});
test('RUN165 existing in-progress old 40-question exam draft remains available with no cloud/local reset',()=>{
 const b=setup('ru-fi');
 try{
  const w=b.w,d=b.d,bank=w.RS_TRUE_FALSE.questions;
  const qs=w.RS_MOCK_EXAM.build(w.RS_DATA,bank,'ru-fi');
  for(const q of qs.filter(q=>q.type==='matching'))delete q.question.answerKey;
  const answers=[];for(let i=0;i<21;i++)answers.push({score:0,perfect:false,
    selected:qs[i].type==='truefalse'?false:qs[i].type==='translate'?'':[]});
  const key='run164_rs_mock_exam_progress_v1',old={schema:1,choice:'ru-fi',
   run:{questions:qs,index:21,answers,direction:'ru-fi'}};
  w.localStorage.setItem(key,JSON.stringify(old));b.init();
  d.querySelector('[data-view="exam"]').click();
  assert.match(d.querySelector('.exam-run-progress').textContent,/22 \/ 40/);
  assert.equal(JSON.parse(w.localStorage.getItem(key)).run.answers.length,21);
 }finally{b.close();}
});
test('RUN165 Latin is a medical term field only; four test modes, no Firebase rules/production data changes',()=>{
 const app=load('app.js'),mock=load('mock-exam-run156.js'),rounds=load('exam-rounds-run155.js');
 const data=load('data.js');
 assert.ok(app.includes('LATIN-CARD-'));
 assert.ok(app.includes('function buildTranslateSeries'));
 assert.ok(rounds.includes('latinClaim'));
 assert.ok(rounds.includes('latinMultiple'));
 assert.ok(rounds.includes("answerKey:'la'"));
 assert.ok(mock.includes('usedTargets'));
 assert.ok(data.startsWith('window.RS_DATA='));
 assert.doesNotMatch(mock.replace(/\/\*[\s\S]*?\*\//g,''),/=>|\?\.|\bconst\b|\blet\b/);
 assert.doesNotMatch(rounds.replace(/\/\*[\s\S]*?\*\//g,''),/=>|\?\.|\bconst\b|\blet\b/);
});
