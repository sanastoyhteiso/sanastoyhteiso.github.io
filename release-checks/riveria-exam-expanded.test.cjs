'use strict';
/* RUN EXAM-EXPAND-20261108. Offline-only: no real Firebase, Drive, users, progress or network. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const sourceData=fs.readFileSync(path.join(root,'data.js'),'utf8');
const sourceExam=fs.readFileSync(path.join(root,'riveria-anatomy-exam.js'),'utf8');
const sourceApp=fs.readFileSync(path.join(root,'app.js'),'utf8');

function boot(){
  const context={window:{}};
  vm.runInNewContext(sourceData,context,{timeout:2500,filename:'data.js'});
  const original=context.window.RS_DATA.terms.map(x=>({id:x.id,fi:x.fi,ru:x.ru,en:x.en}));
  const total=context.window.RS_DATA.terms.length;
  vm.runInNewContext(sourceExam,context,{timeout:2500,filename:'riveria-anatomy-exam.js'});
  return {data:context.window.RS_DATA,original,total};
}
const byFi=(data,fi)=>data.terms.find(x=>x.fi.toLocaleLowerCase('fi-FI')===fi.toLocaleLowerCase('fi-FI'));
const exam=(data,id)=>data.terms.filter(x=>Array.isArray(x.examTopics)&&x.examTopics.includes(id));
test('10 user-defined exam topics are present, with substantially expanded cards',()=>{
  const d=boot().data;
  assert.equal(d.examTopics.length,10);
  const min={EXAM01:48,EXAM02:28,EXAM03:52,EXAM04:38,EXAM05:43,
    EXAM06:29,EXAM07:30,EXAM08:47,EXAM09:30,EXAM10:43};
  for(const [id,count] of Object.entries(min)){
    const cards=exam(d,id);
    assert.ok(cards.length>=count,id+' has '+cards.length+' vs '+count);
    assert.equal(new Set(cards.map(x=>x.id)).size,cards.length,'duplicate IDs in '+id);
    assert.ok(cards.every(x=>x.examNoteFi&&x.examNoteRu),id+' missing explanations');
  }
  assert.ok(exam(d,'EXAM04').some(x=>x.fi==='verihiutale'));
  assert.ok(exam(d,'EXAM04').some(x=>x.fi==='lymfosyytti'));
  assert.ok(exam(d,'EXAM04').some(x=>x.fi==='veren hyytyminen'));
  assert.ok(exam(d,'EXAM02').some(x=>x.fi==='sarveiskerros'));
});

test('original 1,296 study terms retain their IDs, FI/RU/EN and order',()=>{
  const {data:d,original,total}=boot();
  assert.equal(total,1296);
  assert.ok(d.terms.length>total);
  assert.equal(new Set(d.terms.map(x=>x.id)).size,d.terms.length,'duplicate term ID');
  assert.equal(new Set(d.terms.map(x=>x.fi.trim().toLocaleLowerCase('fi-FI'))).size,d.terms.length,'duplicate FI lemma');
  for(let i=0;i<total;i++){
    const old=original[i],x=d.terms[i];
    assert.equal(x.id,old.id);
    assert.equal(x.fi,old.fi);
    assert.equal(x.ru,old.ru);
    assert.equal(x.en,old.en);
  }
  assert.equal(byFi(d,'verihiutale').id,'T00588');
  assert.equal(byFi(d,'sydän').id,'T00574');
  assert.equal(byFi(d,'hermo').id,'T00571');
});

test('exam vocabulary has meaningful FI/RU explanations and Latin when appropriate',()=>{
  const d=boot().data;
  const terms=d.terms.filter(x=>x.examTopics?.length);
  assert.ok(terms.length>=377);
  const latin=terms.filter(x=>x.la&&x.la.trim());
  assert.ok(latin.length>=270,'Latin coverage '+latin.length);
  for(const x of terms){
    assert.ok(x.examNoteFi.trim().length>15,'FI definition: '+x.fi);
    assert.ok(x.examNoteRu.trim().length>15,'RU definition: '+x.fi);
    assert.equal(typeof x.ru,'string');
    assert.equal(typeof x.en,'string');
    assert.ok(x.ru&&x.en,'translations: '+x.fi);
    if(x.la)assert.equal(/[А-Яа-яЁё]/.test(x.la),false,'Cyrillic in Latin: '+x.fi);
  }
  assert.equal(byFi(d,'virtsaputki').la,'urethra');
  assert.equal(byFi(d,'lonkkaluu').la,'os coxae');
  assert.equal(byFi(d,'paksusuoli').la,'intestinum crassum');
});

test('EI excluded textbook areas never enter any exam deck',()=>{
  const d=boot().data;
  const banned=['munuaisten toiminnan säätely','virtsaamisheijaste',
    'virtsaamisen tarve',"ADH:n vaikutus",'veriryhmä','ihon aistinelimet'];
  const all=d.terms.filter(x=>Array.isArray(x.examTopics)&&x.examTopics.length);
  for(const x of all)assert.equal(banned.some(y=>x.fi.toLowerCase()===y.toLowerCase()),false,'EI '+x.fi);
  for(const x of d.terms.filter(x=>banned.includes(x.fi.toLowerCase())))
    assert.ok(!x.examTopics||x.examTopics.length===0,'excluded original included '+x.fi);
});

test('terms may occur in multiple exam topics with one stable ID and one score',()=>{
  const d=boot().data;
  for(const [fi,a,b] of [['imusolmuke','EXAM01','EXAM04'],
    ['haima','EXAM07','EXAM09'],['aivot','EXAM01','EXAM10'],
    ['veri','EXAM04','EXAM05'],['luuydin','EXAM03','EXAM04']]){
    const x=byFi(d,fi);
    assert.ok(x,'missing '+fi);
    assert.ok(x.examTopics.includes(a)&&x.examTopics.includes(b),'cross-topic '+fi);
    assert.equal(d.terms.filter(z=>z.id===x.id).length,1,'ID repeated '+fi);
  }
});

test('new exam module remains client-only and uses stable existing study/filter contract',()=>{
  assert.ok(sourceExam.includes("entry.examTopics.indexOf(one[1])"));
  assert.ok(sourceApp.includes("x.examTopics.indexOf(id)>=0"));
  assert.ok(sourceApp.includes("!isLearned(x.id)"));
  assert.equal(/XMLHttpRequest|firebase\.|fetch\s*\(|localStorage\.setItem|indexedDB\.open/.test(sourceExam),false);
  assert.equal(/\b(let|const|class)\s+[A-Za-z_$]/.test(sourceExam),false,'preserve Safari 12 ES5 script syntax');
});
