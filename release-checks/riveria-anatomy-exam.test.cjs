'use strict';
/*
 * RUN146: actual production base data and app.js loaded in synthetic browser.
 * NO Firebase/Google Drive, network, real user data, UID, medical record or cloud write.
 * Exam scope is based on owner-supplied topic/page list, NOT a copied textbook.
 */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const {JSDOM}=require('jsdom');
const excluded=['Ihon aistinelimet','Veriryhmät','Munuaisten toiminnan säätely','Virtsaamisheijaste'];
function source(){
 const w={};
 const context={window:w};
 vm.runInNewContext(fs.readFileSync('data.js','utf8'),context);
 const original=w.RS_DATA.terms.slice();
 const n=original.length;
 const originalCor=original.find(x=>x.id==='T00574');
 assert.ok(originalCor&&originalCor.fi==='sydän');
 vm.runInNewContext(fs.readFileSync('riveria-anatomy-exam.js','utf8'),context);
 return {d:w.RS_DATA,n,original,originalCor};
}
test('61 user Latin terms integrated without replacing 1,296 base term IDs',()=>{
 const {d,n,originalCor}=source();
 assert.equal(n,1296);
 assert.equal(d.terms.find(x=>x.id==='T00574'),originalCor,'in-place enrichment preserves ID and stored progress');
 assert.equal(originalCor.la,'cor');
 assert.ok(d.terms.find(x=>x.fi==='haima').examTopics.includes('EXAM09'),
   'pancreas belongs to both digestive and hormonal systems, same existing ID');
 assert.ok(originalCor.examNoteFi.includes('Rintaontelossa'));
 assert.ok(originalCor.examNoteRu.includes('грудной'));
 assert.equal(d.terms.filter(x=>x.la&&x.examTopics).length,61);
 assert.equal(d.terms.filter(x=>x.id.startsWith('T900')&&x.la).length,24);
 assert.ok(d.terms.length>n);
 const ids=d.terms.map(x=>x.id);
 assert.equal(new Set(ids).size,ids.length,'new anatomy terms must never collide with existing progress IDs');
});
test('exactly ten official owner exam topic filters with FI/RU notes, no EI inclusions',()=>{
 const {d}=source();
 assert.equal(d.examTopics.length,10);
 assert.deepEqual(Array.from(d.examTopics,x=>x.id),Array.from({length:10},(_,i)=>'EXAM'+String(i+1).padStart(2,'0')));
 assert.deepEqual(Array.from(d.examTopics,x=>x.pages),['7–12, 17','25–30','31–52','53–66','67–80','81–89','91–106','107–114','131–146','161–190']);
 for(const topic of d.examTopics){
  const items=d.terms.filter(x=>Array.isArray(x.examTopics)&&x.examTopics.includes(topic.id));
  assert.ok(items.length>=4,topic.id+' must offer multiple meaningful cards for practice');
  for(const x of items){
   assert.ok(x.examNoteFi&&x.examNoteRu,'missing bilingual explanatory note: '+x.fi);
   assert.ok(x.fi&&x.ru&&x.en,'each exam card must work in FI/RU/EN: '+x.fi);
   assert.equal(x.examSource.includes('independent explanatory notes'),true);
  }
  for(const forbidden of excluded)assert.ok(items.every(x=>x.fi.toLocaleLowerCase()!==forbidden.toLocaleLowerCase()),
     topic.id+' must not include excluded chapter: '+forbidden);
 }
});
function browser(){
 const dom=new JSDOM('<!doctype html><html lang="ru"><body>'+
 '<button data-view="cards">Cards</button><button data-view="practice">Quiz</button>'+
 '<button data-view="dictionary">Dictionary</button><h1 id="page-title"></h1>'+
 '<p id="page-subtitle"></p><div id="online-status"></div>'+
 '<div id="storage-status"></div><main id="main-content"></main>'+
 '<div id="toast"></div></body></html>',{
   url:'https://sanastoyhteiso.github.io/',runScripts:'outside-only',pretendToBeVisual:true
 });
 const w=dom.window;
 w.scrollTo=()=>{};
 // Deterministic but does not assume a specific randomized word.
 w.Math.random=()=>0.34;
 w.eval(fs.readFileSync('data.js','utf8'));
 w.eval(fs.readFileSync('riveria-anatomy-exam.js','utf8'));
 w.RS_FAMILY={uid:'synthetic-run146',storageKey:k=>'run146_'+k,sharedEnabled:()=>true};
 w.RS_COMM={subscribedTerms:()=>[],renderUsers:()=>{},renderLibrary:()=>{}};
 w.eval(fs.readFileSync('app.js','utf8')+'\n//# sourceURL=app.js');
 w.document.dispatchEvent(new w.Event('DOMContentLoaded',{bubbles:true}));
 return {dom,w,d:w.document};
}
test('10 exam entries appear in Cards / Quiz / Dictionary dropdown, no Latin learning direction',()=>{
 const b=browser();try{
  for(const [view,select] of [['cards','cards-cat'],['practice','quiz-cat'],['dictionary','dict-cat']]){
   b.d.querySelector('[data-view="'+view+'"]').click();
   const opts=Array.from(b.d.querySelectorAll('#'+select+' option')).filter(x=>/^EXAM/.test(x.value));
   assert.equal(opts.length,10,'missing topic dropdown in '+view);
   assert.ok(opts[0].textContent.includes('Ihmiselimistö ja solut'));
   assert.ok(opts[9].textContent.includes('Hermosto ja aistit'));
   assert.ok(opts[0].textContent.includes('7–12, 17'));
   const direction=b.d.querySelectorAll('select[id$="-dir"] option');
   for(const x of direction)assert.ok(!/\bla\b|latin/i.test(x.value),'Latin must not appear as learning direction');
  }
 }finally{b.dom.window.close();}
});
test('dictionary filters relevant topic and searches in Latin and bilingual explanations',()=>{
 const b=browser();try{
  b.d.querySelector('[data-view="dictionary"]').click();
  const select=b.d.getElementById('dict-cat');select.value='EXAM03';
  select.dispatchEvent(new b.w.Event('change',{bubbles:true}));
  const input=b.d.getElementById('dict-search');input.value='femur';
  input.dispatchEvent(new b.w.Event('input',{bubbles:true}));
  assert.match(b.d.getElementById('dict-results').textContent,/reisiluu/);
  assert.match(b.d.getElementById('dict-results').textContent,/femur/);
  assert.match(b.d.getElementById('dict-results').textContent,/FI:/);
  assert.match(b.d.getElementById('dict-results').textContent,/RU:/);
  // The source glossary outside this exam is not dropped.
  assert.equal(b.w.RS_DATA.terms.some(x=>x.id==='T00001'),true);
 }finally{b.dom.window.close();}
});
test('cards reveal location/function + optional Latin only after flipping, no premature answer leak',()=>{
 const b=browser();try{
  const select=b.d.getElementById('cards-cat');select.value='EXAM02';
  select.dispatchEvent(new b.w.Event('change',{bubbles:true}));
  assert.equal(b.d.querySelectorAll('.exam-explain').length,0,'do not reveal definitions before flip');
  const flip=b.d.querySelector('[data-action="flip"]');assert.ok(flip);
  flip.click();
  assert.match(b.d.getElementById('main-content').textContent,/FI:/);
  assert.match(b.d.getElementById('main-content').textContent,/RU:/);
  assert.ok(b.d.querySelector('.exam-explain'));
 }finally{b.dom.window.close();}
});
test('all ten topics are available in quiz and notes appear only after choosing an answer',()=>{
 const b=browser();try{
  b.d.querySelector('[data-view="practice"]').click();
  const select=b.d.getElementById('quiz-cat');select.value='EXAM09';
  select.dispatchEvent(new b.w.Event('change',{bubbles:true}));
  assert.ok(b.d.querySelector('[data-action="quiz-choose"]'),'four+ hormone quiz choices');
  assert.equal(b.d.querySelectorAll('.exam-explain').length,0);
  b.d.querySelector('[data-action="quiz-choose"]').click();
  assert.ok(b.d.querySelector('.answer'));
  assert.ok(b.d.querySelector('.exam-explain'),'bilingual explanatory feedback');
 }finally{b.dom.window.close();}
});
test('loading public material does not write/reset synthetic V3 study scores',()=>{
 const b=browser();try{
  const key=b.w.RS_FAMILY.storageKey('rs_scores_v1');
  assert.equal(b.w.localStorage.getItem(key),null);
  b.w.localStorage.setItem(key,JSON.stringify({T00574:{learned:true,correct:3}}));
  b.w.RS_FAMILY_REFRESH(false);
  assert.equal(JSON.parse(b.w.localStorage.getItem(key)).T00574.learned,true);
 }finally{b.dom.window.close();}
});
