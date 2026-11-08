'use strict';
/* RUN164 Latin from the existing verified user-provided glossary, no generated
 * Latin translations, no repeated source term in one 40-question exam.
 * Synthetic browser/account only; does not access live Firebase or accounts. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {JSDOM}=require('jsdom'),read=p=>fs.readFileSync(p,'utf8');
function seededMath(seed){
 let x=seed>>>0;
 const m=Object.create(Math);
 m.random=()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296;};
 return m;
}
function catalog(seed){
 const ctx={window:{},Math:seededMath(seed)};
 for(const p of ['data.js','riveria-anatomy-exam.js','riveria-true-false.js',
  'exam-rounds-run155.js','mock-exam-run156.js'])vm.runInNewContext(read(p),ctx);
 return ctx.window;
}
function browser(){
 const dom=new JSDOM('<!doctype html><html lang="ru"><body>'+
  '<button data-view="cards">Cards</button><button data-view="practice">Tests</button>'+
  '<button data-view="exam">Exam</button><button data-view="dictionary">Dictionary</button>'+
  '<h1 id="page-title"></h1><p id="page-subtitle"></p>'+
  '<div id="online-status"></div><div id="storage-status"></div>'+
  '<main id="main-content"></main><div id="toast"></div></body></html>',
  {url:'https://sanastoyhteiso.github.io/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;w.scrollTo=()=>{};w.Math.random=()=>.411;
 for(const p of ['data.js','riveria-anatomy-exam.js','riveria-true-false.js',
  'exam-rounds-run155.js','mock-exam-run156.js'])w.eval(read(p));
 w.RS_FAMILY={uid:'run164-test',storageKey:k=>'run164_'+k,sharedEnabled:()=>true};
 w.RS_COMM={subscribedTerms:()=>[],renderUsers:()=>{},renderLibrary:()=>{}};
 w.RS_I18N={getLanguage:()=> 'ru',category:(fi,ru)=>ru};
 w.eval(read('app.js'));w.document.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
 return {w,d:w.document,close:()=>dom.window.close()};
}
test('RUN164: all 10 topics retain 40 pages and unique source terms with >=4 Latin choices across random seeds/directions',()=>{
 let totals=0;
 for(const direction of ['fi-ru','ru-fi','fi-en','en-fi']){
  for(let seed=1;seed<=12;seed++){
   const w=catalog(seed*1699+direction.length);
   const q=w.RS_MOCK_EXAM.build(w.RS_DATA,w.RS_TRUE_FALSE.questions,direction);
   assert.equal(q.length,40,'cannot build 40 for '+direction+' seed '+seed);
   assert.equal(new Set(q.map(x=>x.id)).size,40);
   assert.equal(q.filter(x=>x.latin).length,5,'balanced 5 Latin translation pages');
   const modes={},topics={},reserved=new Set(),signatures=new Set(),latinNames=new Set();
   for(const question of q){
    modes[question.type]=(modes[question.type]||0)+1;
    topics[question.topic]=(topics[question.topic]||0)+1;
    if(question.type==='translate'){
     const signature=question.from+'|'+question.item[question.from].toLowerCase();
     assert.ok(!signatures.has(signature),'same 4-choice prompt repeated');signatures.add(signature);
     assert.ok(!reserved.has(question.item.id),'translation repeats another core term: '+question.item.id);
     reserved.add(question.item.id);
     assert.equal(question.options.length,4);
     assert.equal(new Set(question.options.map(x=>x.toLocaleLowerCase())).size,4);
     assert.ok(question.options.includes(question.answer));
     assert.equal(question.answer,question.item[question.to]);
     if(question.latin){
      assert.equal(question.from,'la');
      assert.ok(question.item.la,'Latin question must have a sourced Latin field');
      const latin=question.item.la.toLocaleLowerCase();
      assert.ok(!latinNames.has(latin),'repeated Latin question');latinNames.add(latin);
     }
    }else if(question.type==='truefalse'){
     const sign=question.question.fi.toLowerCase();
     assert.ok(!signatures.has(sign),'T/F duplicate assertion');signatures.add(sign);
     if(question.question.sourceId){
      assert.ok(!reserved.has(question.question.sourceId),'T/F core term reused');
      reserved.add(question.question.sourceId);
     }
    }else if(question.type==='matching'){
     assert.equal(question.question.items.length,4);
     assert.equal(new Set(question.question.options).size,4);
     for(const term of question.question.items){
      assert.ok(!reserved.has(term.id),'matching repeated term '+term.fi);
      reserved.add(term.id);
     }
    }else{
     assert.equal(question.question.items.length,4);
     assert.equal(question.question.items.filter(x=>x.correct).length,2);
     for(const term of question.question.items){
      assert.ok(!reserved.has(term.sourceId),'multiple choice repeated core term '+term.sourceFi);
      reserved.add(term.sourceId);
     }
    }
   }
   for(const type of ['translate','truefalse','matching','multiselect'])assert.equal(modes[type],10);
   for(let i=1;i<=10;i++)assert.equal(topics['EXAM'+String(i).padStart(2,'0')],4);
   totals++;
  }
 }
 assert.equal(totals,48);
});
test('RUN164: standalone cards teach Latin front-to-Russian and reverse Finnish-to-Latin',()=>{
 const b=browser();try{
  const d=b.d,w=b.w;
  assert.ok(d.querySelector('[data-action="latin-cards"]'));
  assert.ok(d.querySelector('#cards-dir option[value="la-ru"]'));
  assert.ok(d.querySelector('#cards-dir option[value="ru-la"]'));
  assert.ok(d.querySelector('#cards-dir option[value="fi-la"]'));
  d.querySelector('[data-action="latin-cards"]').click();
  assert.ok(d.querySelector('[data-action="latin-cards"].primary'));
  assert.equal(d.querySelector('#cards-dir').value,'la-ru');
  const latin=d.querySelector('.flash-term').textContent;
  assert.ok(w.RS_DATA.terms.some(x=>x.la===latin),'front must be an actual sourced Latin term');
  d.querySelector('[data-action="flip"]').click();
  assert.ok(d.querySelector('.flash-trans').textContent.trim());
  assert.match(d.querySelector('.flashcard').textContent,/Latina/);
  const select=d.querySelector('#cards-dir');select.value='fi-la';
  select.dispatchEvent(new w.Event('change',{bubbles:true}));
  const fi=d.querySelector('.flash-term').textContent;
  d.querySelector('[data-action="flip"]').click();
  assert.ok(w.RS_DATA.terms.some(x=>x.fi===fi&&x.la===d.querySelector('.flash-trans').textContent));
  d.querySelector('[data-action="latin-cards"]').click();
  assert.ok(!d.querySelector('[data-action="latin-cards"].primary'));
  assert.equal(d.querySelector('#cards-dir').value,'auto','restore original direction');
 }finally{b.close();}
});
test('RUN164: four-option practice offers Latin to Russian and Russian to Latin with sourced options',()=>{
 const b=browser();try{
  const d=b.d,w=b.w;d.querySelector('[data-view="practice"]').click();
  for(const direction of ['la-ru','ru-la','la-fi','fi-la','la-en','en-la']){
   const e=d.querySelector('#quiz-dir');assert.ok(e.querySelector('option[value="'+direction+'"]'));
   e.value=direction;e.dispatchEvent(new w.Event('change',{bubbles:true}));
   assert.ok(d.querySelector('.exam-run-progress'),'must have 10 Latin practice questions');
   const prompt=d.querySelector('.flash-term').textContent.trim(),
    options=[...d.querySelectorAll('[data-action="quiz-choose"]')].map(x=>x.textContent.trim());
   assert.equal(options.length,4);
   assert.equal(new Set(options.map(x=>x.toLowerCase())).size,4);
   const origin=direction.split('-')[0],target=direction.split('-')[1],
    words=w.RS_DATA.terms.filter(x=>x[origin]===prompt&&x[target]);
   assert.ok(words.length,'prompt must exist in original glossary');
   assert.ok(words.some(x=>options.includes(x[target])),'answer must be sourced');
   if(origin==='la')assert.match(d.getElementById('main-content').textContent,/Что означает латинский термин/);
  }
 }finally{b.close();}
});
test('RUN164: new exam Latin prompt displays four choices, old 40-question completion and saved draft schema survive',()=>{
 const b=browser();try{
  const d=b.d,w=b.w;d.querySelector('[data-view="exam"]').click();
  const seed=w.RS_MOCK_EXAM.build(w.RS_DATA,w.RS_TRUE_FALSE.questions,'ru-fi');
  assert.equal(seed.length,40);const latin=seed.find(q=>q.latin);assert.ok(latin);
  const k='run164_rs_mock_exam_progress_v1';
  const run={questions:seed,index:0,answers:[],direction:'ru-fi'};
  w.localStorage.setItem(k,JSON.stringify({schema:1,choice:'ru-fi',run}));
  w.RS_FAMILY_REFRESH(true);d.querySelector('[data-view="exam"]').click();
  assert.ok(d.querySelector('.exam-run-progress'));
  assert.equal(JSON.parse(w.localStorage.getItem(k)).run.questions.length,40);
  // Reopen a previously saved question without touching the saved answers.
  const saved=JSON.parse(w.localStorage.getItem(k));saved.run.index=seed.indexOf(latin);
  saved.run.answers=seed.slice(0,saved.run.index).map(q=>
    w.RS_MOCK_EXAM.evaluate(q,q.type==='translate'?q.answer:
      q.type==='truefalse'?q.question.correct:
      q.type==='matching'?q.question.items.map(x=>x.fi):
        q.question.items.map(x=>!!x.correct)));
  w.localStorage.setItem(k,JSON.stringify(saved));w.RS_FAMILY_REFRESH(true);
  d.querySelector('[data-view="exam"]').click();
  assert.ok(d.querySelector('.exam-run-progress'));
  assert.ok(d.getElementById('main-content').textContent.includes('Что означает латинский термин?'));
  assert.equal(d.querySelectorAll('[data-action="mock-answer"]').length,4);
  assert.equal(JSON.parse(w.localStorage.getItem(k)).run.answers.length,saved.run.answers.length);
  // Crucially old non-Latin questions also render even after adding Latin support.
  const legacy=JSON.parse(w.localStorage.getItem(k));
  const legacyIndex=legacy.run.questions.findIndex(x=>x.type==='translate'&&!x.latin);
  assert.ok(legacyIndex>=0);
  legacy.run.index=legacyIndex;legacy.run.answers=legacy.run.questions.slice(0,legacyIndex).map(q=>
    w.RS_MOCK_EXAM.evaluate(q,q.type==='translate'?q.answer:
      q.type==='truefalse'?q.question.correct:
      q.type==='matching'?q.question.items.map(x=>x.fi):
        q.question.items.map(x=>!!x.correct)));
  w.localStorage.setItem(k,JSON.stringify(legacy));
  w.RS_FAMILY_REFRESH(true);d.querySelector('[data-view="exam"]').click();
  assert.ok(d.querySelectorAll('[data-action="mock-answer"]').length===4);
  assert.equal(JSON.parse(w.localStorage.getItem(k)).run.questions.length,40);
 }finally{b.close();}
});
test('RUN164: input data unchanged and versioned assets include Latin engine offline; ES5 compatibility',()=>{
 const app=read('app.js'),engine=read('mock-exam-run156.js'),rounds=read('exam-rounds-run155.js'),
  html=read('index.html'),sw=read('sw.js'),css=read('style.css');
 assert.ok(app.includes("data-action=\"latin-cards\""));
 assert.ok(app.includes("['la-ru','Латынь → русский']"));
 assert.ok(engine.includes("latinCount<Math.min(4"));
 assert.ok(rounds.includes('buildMatchingFrom'));
 assert.ok(html.includes('mock-exam-run156.js?v=latin-run164-v1'));
 assert.ok(html.includes('exam-rounds-run155.js?v=latin-run164-v1'));
 assert.ok(html.includes('app.js?v=exam-preserve-run167-1'));
 assert.ok(sw.includes('riveria-sanasto-community-v3.0.0-rc34'));
 assert.ok(sw.includes('mock-exam-run156.js?v=latin-run164-v1'));
 assert.ok(css.includes('.flashcard'));
 assert.doesNotMatch(app,/=>|\?\./);
 assert.doesNotMatch(engine,/=>|\?\./);
 assert.doesNotMatch(rounds,/=>|\?\./);
});
