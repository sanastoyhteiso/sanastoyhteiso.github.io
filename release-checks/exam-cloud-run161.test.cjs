'use strict';
/* RUN161: synthetic tests only. No real Firebase user, credential, or production write. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {JSDOM}=require('jsdom');
const read=p=>fs.readFileSync(p,'utf8');
function store(){
 const records={};let allow=true;
 return {
  records,permit:x=>{allow=x;},
  firebase:user=>({
   auth:()=>({currentUser:user}),
   firestore:()=>({
    collection:name=>({doc:uid=>({key:name+'/'+uid,uid})}),
    runTransaction:fn=>{
     if(!allow)return Promise.reject(Object.assign(new Error('Permission denied'),{code:'permission-denied'}));
     const pending=[];
     const tx={
      get:ref=>Promise.resolve({
       exists:!!records[ref.key],
       data:()=>records[ref.key]?JSON.parse(JSON.stringify(records[ref.key])):undefined
      }),
      set:(ref,value)=>pending.push([ref.key,JSON.parse(JSON.stringify(value))])
     };
     return Promise.resolve(fn(tx)).then(out=>{
      if(!allow)throw Object.assign(new Error('Permission denied'),{code:'permission-denied'});
      for(const [k,v] of pending)records[k]=v;
      return out;
     });
    }
   })
  })
 };
}
function windowFor(db,uid,verified=true){
 const win={navigator:{onLine:true},RS_FAMILY:{uid},firebase:db.firebase({uid,emailVerified:verified})};
 vm.runInNewContext(read('exam-cloud-run161.js'),{window:win,Promise,Math,Date,JSON});
 return win;
}
function seeded(){
 const ctx={window:{}};
 for(const p of ['data.js','riveria-anatomy-exam.js','riveria-true-false.js','exam-rounds-run155.js','mock-exam-run156.js'])
  vm.runInNewContext(read(p),ctx);
 const w=ctx.window;
 const qs=w.RS_MOCK_EXAM.build(w.RS_DATA,w.RS_TRUE_FALSE.questions,'fi-ru');
 assert.equal(qs.length,40);
 const answers=[];
 for(let i=0;i<14;i++){
  const q=qs[i];let value;
  if(q.type==='translate')value=q.options[0];
  else if(q.type==='truefalse')value=false;
  else if(q.type==='matching')value=q.question.items.map(x=>x[q.question.answerKey==='la'?'la':'fi']);
  else value=q.question.items.map(x=>!!x.correct);
  answers.push(w.RS_MOCK_EXAM.evaluate(q,value));
 }
 return {schema:1,choice:'fi-ru',run:{questions:qs,index:14,answers,direction:'fi-ru'}};
}
const valid=d=>d&&d.schema===1&&d.run&&d.run.questions&&d.run.questions.length===40;
test('first device 14 answered -> cloud, second blank device resumes 15/40, then returns updated progress',async()=>{
 const db=store(),a=windowFor(db,'user-a'),b=windowFor(db,'user-a');
 const draft=seeded();
 const uploaded=await a.RS_EXAM_CLOUD.sync(draft,valid);
 assert.equal(uploaded.kind,'uploaded');
 assert.equal(uploaded.draft.run.index,14);
 const cloudKey='mock_exam_progress_v1/user-a';
 assert.ok(db.records[cloudKey]);
 const blank=seeded();blank.run.index=0;blank.run.answers=[];
 blank.run.questions=blank.run.questions.slice().reverse();blank.choice='ru-fi';blank.run.direction='ru-fi';
 const fromPhone=await b.RS_EXAM_CLOUD.sync(blank,valid);
 assert.equal(fromPhone.kind,'downloaded');
 assert.equal(fromPhone.draft.run.index,14,'the phone must resume on question 15');
 assert.equal(fromPhone.draft.run.answers.length,14);
 assert.equal(fromPhone.draft.run.questions[0].id,uploaded.draft.run.questions[0].id);
 // On phone the student advances to question 16. The old computer reads without overwriting.
 const newer=JSON.parse(JSON.stringify(fromPhone.draft));
 newer.run.index=15;
 const saved=await b.RS_EXAM_CLOUD.sync(newer,valid);
 assert.equal(saved.kind,'uploaded');
 const again=await a.RS_EXAM_CLOUD.sync(uploaded.draft,valid);
 assert.equal(again.kind,'downloaded');
 assert.equal(again.draft.run.index,15);
});
test('two divergent nonempty attempts cannot silently overwrite each other',async()=>{
 const db=store(),a=windowFor(db,'user-a'),b=windowFor(db,'user-a');
 const first=await a.RS_EXAM_CLOUD.sync(seeded(),valid);
 const second=seeded();second.attemptId='A_100_200';second.run.questions=second.run.questions.slice().reverse();
 second.run.answers=second.run.answers.slice(0,12);second.run.index=12;
 const before=JSON.stringify(db.records);
 const result=await b.RS_EXAM_CLOUD.sync(second,valid);
 assert.equal(result.kind,'conflict');
 assert.equal(JSON.stringify(db.records),before,'conflict must not overwrite the remote exam');
 const short=JSON.parse(JSON.stringify(first.draft));short.run.answers=short.run.answers.slice(0,4);short.run.index=4;
 const fetched=await b.RS_EXAM_CLOUD.sync(short,valid);
 assert.equal(fetched.kind,'downloaded','shorter prefix must pull longer remote');
});
test('no cross-account reads, unverified user and denied rules fail closed',async()=>{
 const db=store();
 const alice=windowFor(db,'alice'),bob=windowFor(db,'bob');
 await alice.RS_EXAM_CLOUD.sync(seeded(),valid);
 const bobBlank=seeded();bobBlank.run.index=0;bobBlank.run.answers=[];
 const result=await bob.RS_EXAM_CLOUD.sync(bobBlank,valid);
 assert.equal(result.kind,'uploaded');
 assert.ok(db.records['mock_exam_progress_v1/alice']);
 assert.ok(db.records['mock_exam_progress_v1/bob']);
 assert.notEqual(db.records['mock_exam_progress_v1/alice'].attemptId,db.records['mock_exam_progress_v1/bob'].attemptId);
 const unverified=windowFor(db,'alice',false);
 await assert.rejects(()=>unverified.RS_EXAM_CLOUD.sync(seeded(),valid),/verify-email/);
 db.permit(false);
 await assert.rejects(()=>alice.RS_EXAM_CLOUD.sync(seeded(),valid),/Permission denied/);
 assert.equal(db.records['mock_exam_progress_v1/alice'].answersCount,14);
});
test('stale account and corrupt server document never erase the local attempt',async()=>{
 const db=store(),a=windowFor(db,'alice');const local=seeded();
 const previous=JSON.stringify(local);
 db.records['mock_exam_progress_v1/alice']={schema:1,ownerUid:'alice',snapshot:'{"broken":"wrong"}'};
 await assert.rejects(()=>a.RS_EXAM_CLOUD.sync(local,valid),/cloud-invalid/);
 assert.equal(JSON.stringify(local),previous);
 const helper=a.RS_EXAM_CLOUD;
 assert.equal(helper.choose(null,local).kind,'download');
 assert.equal(helper.choose(local,null).kind,'upload');
});
test('private UI resumes after fresh browser from the same cloud account',async()=>{
 const db=store(),account='alice';
 const first=seeded();
 await windowFor(db,account).RS_EXAM_CLOUD.sync(first,valid);
 function browser(){
  const dom=new JSDOM('<!doctype html><html lang="ru"><body>'+
   '<button data-view="cards">Cards</button><button data-view="practice">Tests</button>'+
   '<button data-view="exam">Exam</button><h1 id="page-title"></h1>'+
   '<p id="page-subtitle"></p><div id="online-status"></div>'+
   '<div id="storage-status"></div><main id="main-content"></main><div id="toast"></div></body></html>',
  {url:'https://sanastoyhteiso.github.io/',runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window;w.scrollTo=()=>{};w.Math.random=()=>.45;
  w.RS_FAMILY={uid:account,storageKey:k=>'test_alice__'+k,sharedEnabled:()=>true};
  w.RS_COMM={subscribedTerms:()=>[],renderUsers:()=>{},renderLibrary:()=>{}};
  w.RS_I18N={getLanguage:()=> 'ru',category:(fi,ru)=>ru};
  w.firebase=db.firebase({uid:account,emailVerified:true});
  for(const file of ['data.js','riveria-anatomy-exam.js','riveria-true-false.js',
   'exam-rounds-run155.js','mock-exam-run156.js','exam-cloud-run161.js','app.js'])w.eval(read(file));
  w.document.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
  return dom;
 }
 const dom=browser();try{
  const w=dom.window,d=w.document;
  d.querySelector('[data-view="exam"]').click();
  assert.match(d.getElementById('main-content').textContent,/Проверяю облачную копию/);
  await new Promise(resolve=>setTimeout(resolve,40));
  assert.match(d.querySelector('.exam-run-progress').textContent,/15 \/ 40/);
  assert.match(d.querySelector('.exam-autosave-ok').textContent,/Экзамен сохраняется автоматически/);
  assert.equal(d.querySelectorAll('.exam-autosave-ok').length,1,'exactly one green save banner');
  assert.match(d.getElementById('main-content').textContent,/на всех устройствах/);
  const draft=JSON.parse(w.localStorage.getItem('test_alice__rs_mock_exam_progress_v1'));
  assert.equal(draft.run.answers.length,14);
  assert.equal(draft.run.index,14);
 }finally{dom.window.close();}
});
test('ES5, explicit private owner-only rules, no legacy score or Firebase tariff writes',()=>{
 const client=read('exam-cloud-run161.js');
 const app=read('app.js');
 const rules=read('release-checks/firestore-exam-sync-run161-review-only.rules.txt');
 assert.doesNotMatch(client.replace(/\/\*[\s\S]*?\*\//g,''),/=>|\?\.|\bconst\b|\blet\b/);
 assert.ok(rules.includes('match /mock_exam_progress_v1/{uid}'));
 assert.ok(rules.includes('request.auth.uid == uid'));
 assert.ok(rules.includes('request.auth.token.email_verified == true'));
 assert.ok(rules.includes('allow list: if false'));
 assert.ok(rules.includes('allow delete: if false'));
 assert.ok(app.includes("storageKey('rs_mock_exam_cloud_archive_v1')"));
 assert.ok(app.includes('mockCloudQueue()'));
 assert.ok(!client.includes('rs_scores_v1'));
 assert.ok(!client.includes('sync_v3/'));
});


test('RUN162: failed cloud sync shows one warning, not a misleading green save confirmation',async()=>{
 const dom=new JSDOM('<!doctype html><html lang="ru"><body>'+
  '<button data-view="cards">Cards</button><button data-view="exam">Exam</button>'+
  '<h1 id="page-title"></h1><p id="page-subtitle"></p>'+
  '<div id="online-status"></div><div id="storage-status"></div>'+
  '<main id="main-content"></main><div id="toast"></div></body></html>',
  {url:'https://sanastoyhteiso.github.io/',runScripts:'outside-only',pretendToBeVisual:true});
 try{
  const w=dom.window,d=w.document;
  w.scrollTo=()=>{};w.Math.random=()=>0.38;
  w.RS_FAMILY={uid:'test-user',storageKey:k=>'run162_'+k,sharedEnabled:()=>true};
  w.RS_COMM={subscribedTerms:()=>[],renderUsers:()=>{},renderLibrary:()=>{}};
  w.RS_I18N={getLanguage:()=> 'ru',category:(fi,ru)=>ru};
  for(const file of ['data.js','riveria-anatomy-exam.js','riveria-true-false.js',
   'exam-rounds-run155.js','mock-exam-run156.js'])w.eval(read(file));
  w.RS_EXAM_CLOUD={sync:()=>Promise.reject(Object.assign(new Error('offline'),{code:'unavailable'}))};
  w.eval(read('app.js'));d.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
  d.querySelector('[data-view="exam"]').click();
  await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(d.querySelectorAll('.exam-autosave-warning').length,1);
  assert.equal(d.querySelectorAll('.exam-autosave-ok').length,0);
  assert.match(d.querySelector('.exam-autosave-warning').textContent,/только на этом устройстве/);
  assert.ok(d.querySelector('[data-action="mock-cloud-retry"]'));
  assert.match(d.querySelector('.exam-run-progress').textContent,/1 \/ 40/);
 }finally{dom.window.close();}
});
