'use strict';
/* RUN167. Synthetic browser only: never access real learner data or Firebase. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {JSDOM}=require('jsdom'),read=p=>fs.readFileSync(p,'utf8');
function browser(initial){
 const dom=new JSDOM('<!doctype html><html lang="ru"><body>'+
  '<button data-view="cards">Карточки</button><button data-view="exam">Экзамен</button>'+
  '<h1 id="page-title"></h1><p id="page-subtitle"></p>'+
  '<div id="online-status"></div><div id="storage-status"></div>'+
  '<main id="main-content"></main><div id="toast"></div></body></html>',
  {url:'https://sanastoyhteiso.github.io/',runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window,d=w.document;let uid='first-account';
 w.scrollTo=function(){};w.Math.random=function(){return .364;};
 w.RS_FAMILY={get uid(){return uid;},storageKey:function(k){return 'run167_'+uid+'__'+k;},sharedEnabled:function(){return true;}};
 w.RS_COMM={subscribedTerms:function(){return [];},renderUsers:function(){},renderLibrary:function(){}};
 w.RS_I18N={getLanguage:function(){return 'ru';},category:function(fi,ru){return ru;}};
 const key='run167_first-account__rs_mock_exam_progress_v1';
 if(initial!==undefined)w.localStorage.setItem(key,initial);
 for(const f of ['data.js','riveria-anatomy-exam.js','riveria-true-false.js',
  'exam-rounds-run155.js','mock-exam-run156.js','app.js'])w.eval(read(f));
 d.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
 return {w,d,key,setUid:function(next){uid=next;w.RS_FAMILY_REFRESH(true);},close:function(){dom.window.close();}};
}
test('unrecognised previous exam must survive byte-for-byte, never become new 1/40',function(){
 const old=JSON.stringify({schema:1,choice:'fi-ru',run:{questions:[{id:'old'}],index:1,answers:[{score:1,perfect:true}],direction:'fi-ru'},oldVersion:'before-upgrade'});
 const b=browser(old);
 try{
  b.d.querySelector('[data-view="exam"]').click();
  assert.match(b.d.getElementById('main-content').textContent,/оставлена без изменений/);
  assert.ok(b.d.querySelector('[data-action="mock-export-preserved"]'));
  assert.equal(b.d.querySelector('.exam-run-progress'),null,'cannot silently replace old saved result with question 1');
  assert.equal(b.w.localStorage.getItem(b.key),old,'source bytes must remain unchanged');
  b.setUid('second-account');
  b.d.querySelector('[data-view="exam"]').click();
  assert.match(b.d.querySelector('.exam-run-progress').textContent,/1 \/ 40/,'separate user gets own session');
  b.setUid('first-account');
  b.d.querySelector('[data-view="exam"]').click();
  assert.match(b.d.getElementById('main-content').textContent,/оставлена без изменений/);
  assert.equal(b.w.localStorage.getItem(b.key),old,'switching accounts must not damage unrecognized old attempt');
 }finally{b.close();}
});
test('unparseable JSON is retained without attempting cloud upload or new blank write',function(){
 const raw='{"schema":1,"run":{"answers":[{"score":1}],"broken":';
 const b=browser(raw);
 try{
  let calls=0;
  b.w.RS_EXAM_CLOUD={sync:function(){calls++;return Promise.resolve({kind:'empty'});}};
  b.d.querySelector('[data-view="exam"]').click();
  assert.ok(b.d.querySelector('[data-action="mock-export-preserved"]'));
  assert.equal(b.w.localStorage.getItem(b.key),raw);
  assert.equal(calls,0,'a corrupt local record must not be uploaded or overwritten');
 }finally{b.close();}
});
test('a valid answered exam survives simulated same-account reauthentication',function(){
 const b=browser();
 try{
  b.d.querySelector('[data-view="exam"]').click();
  let answers=b.d.querySelectorAll('[data-action="mock-answer"]');
  const multi=b.d.querySelectorAll('[data-mock-multi]'),pairs=b.d.querySelectorAll('[data-mock-match]');
  if(pairs.length){for(const pair of pairs)pair.value=pair.options[1].value;b.d.querySelector('[data-action="mock-check"]').click();}
  else if(multi.length){multi[0].checked=true;b.d.querySelector('[data-action="mock-check"]').click();}
  else {assert.ok(answers.length);answers[0].click();}
  let saved=b.w.localStorage.getItem(b.key);
  assert.ok(saved&&JSON.parse(saved).run.answers.length===1,'one answer stored');
  b.setUid('first-account');
  b.d.querySelector('[data-view="exam"]').click();
  assert.ok(b.d.querySelector('[data-action="mock-next"]'),'saved answer remains accessible after reauthentication');
  assert.equal(JSON.parse(b.w.localStorage.getItem(b.key)).run.answers.length,1);
 }finally{b.close();}
});
test('diagnostics ignore failed resources while recording genuine runtime errors',function(){
 const listeners={},stored={},ctx={
  RS_FIREBASE_CONFIG:{projectId:'riveria-sanasto-community-test'},
  location:{hostname:'sanastoyhteiso.github.io',pathname:'/'},
  sessionStorage:{getItem:function(k){return stored[k]||null;},setItem:function(k,v){stored[k]=v;}},
  addEventListener:function(type,fn){(listeners[type]||(listeners[type]=[])).push(fn);}
 };
 vm.runInNewContext(read('study-diagnostics.js'),ctx,{timeout:1500});
 const api=ctx.RS_V3_LOCAL_DIAGNOSTICS;
 listeners.error[0]({target:{tagName:'IMG'}});
 listeners.error[0]({target:{tagName:'SCRIPT'}});
 assert.equal(api.entries().length,0,'resource loading is not proof of app render failure');
 listeners.error[0]({}); // synthetic runtime event without resource target
 assert.equal(api.entries().length,1);
 assert.equal(api.entries()[0].code,'APP_RENDER_FAILED');
 assert.ok(!JSON.stringify(stored).includes('IMG'));
});
