'use strict';
// RUN151: public glossary regression. Synthetic only; no cloud, accounts or progress writes.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const source=read('riveria-anatomy-exam.js'),original=read('data.js');
function catalog(){const ctx={window:{}};vm.runInNewContext(original,ctx);vm.runInNewContext(source,ctx);return ctx.window.RS_DATA;}
const cases=[
 ['T90278','kyynärvaltimo','arteria ulnaris'],
 ['T90279','värttinävaltimo','arteria radialis'],
 ['T90280','polvitaivevaltimo','arteria poplitea'],
 ['T90281','jalanselänvaltimo','arteria dorsalis pedis'],
 ['T90282','taaempi säärivaltimo','arteria tibialis posterior'],
 ['T90283','pohjevaltimo','arteria fibularis']
];
test('six new distinct arteries, verified FI/RU/EN/Latin and topic',()=>{
 const d=catalog();assert.equal(d.examTopics.length,10);
 const ids=d.terms.map(x=>x.id),names=d.terms.map(x=>x.fi.toLocaleLowerCase());
 assert.equal(new Set(ids).size,ids.length);
 assert.equal(new Set(names).size,names.length);
 for(const [id,fi,la] of cases){
  const x=d.terms.find(x=>x.id===id);
  assert.ok(x,fi);assert.equal(x.fi,fi);assert.equal(x.la,la);
  assert.ok(x.ru&&x.en&&x.examNoteFi.length>35&&x.examNoteRu.length>40);
  assert.ok(x.examTopics.includes('EXAM05'));
 }
 const posterior=d.terms.find(x=>x.id==='T90282'),fibular=d.terms.find(x=>x.id==='T90283');
 assert.notEqual(posterior.la,fibular.la);
 assert.match(posterior.examNoteFi,/ei ole sama suoni/i);
});
test('previous three source terms and all 65 PDF terms retain original IDs',()=>{
 const d=catalog();
 for(const [id,fi] of [['T90224','kaulavaltimo'],['T90225','olkavaltimo'],['T90227','lonkkavaltimo']]){
  const x=d.terms.find(x=>x.id===id);assert.equal(x.fi,fi);assert.ok(x.la&&x.examNoteFi&&x.examNoteRu);
 }
 for(let i=90213;i<=90277;i++)assert.equal(d.terms.filter(x=>x.id==='T'+i).length,1);
 assert.equal(d.terms.length,1485);
});
test('offline cache links same version and ES5 adapter',()=>{
 const html=read('index.html'),sw=read('sw.js');
 const link='riveria-anatomy-exam.js?v=moodle-run170-1';
 assert.ok(html.includes(link));assert.ok(sw.includes(link));
 assert.ok(sw.includes('riveria-sanasto-community-v3.0.0-rc37'));
 assert.doesNotMatch(source,/\blet\s+|\bconst\s+|=>|\?\./);
 assert.doesNotMatch(source,/localStorage\.setItem|firebase\.auth|firestore|fetch\s*\(/i);
});
