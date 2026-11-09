'use strict';
/* Owner-provided "Sydän, veri ja verenkierto" PDF; check public exam terms only.
 * No network requests, login, real Firestore access or user progress writes.
 */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.join(__dirname,'..');
const file=n=>fs.readFileSync(path.join(root,n),'utf8');
const source=JSON.parse(file('content-imports/heart-blood-pdf/SYDAN_VERI_VERENKIERTO_TERMS_20261108.json'));
const catalog=file('data.js'),adapter=file('riveria-anatomy-exam.js');
const norm=v=>String(v||'').trim().normalize('NFKC').toLocaleLowerCase('fi-FI');
function load(){
 const w={},ctx={window:w};
 vm.runInNewContext(catalog,ctx,{timeout:5000});
 const baseline=w.RS_DATA.terms.map(x=>({id:x.id,fi:x.fi,ru:x.ru,en:x.en,example:x.example,exampleRu:x.exampleRu}));
 vm.runInNewContext(adapter,ctx,{timeout:5000});
 return{d:w.RS_DATA,baseline};
}
test('valid 65 user PDF entries exclusively from supported slides, omits blood-group EI',()=>{
 assert.equal(source.records.length,65);
 assert.equal(source.summary.total,65);
 assert.deepEqual(source.summary.topics,{EXAM04:17,EXAM05:36,EXAM09:10,EXAM10:2});
 assert.equal(new Set(source.records.map(x=>norm(x.fi))).size,65);
 for(const x of source.records){
   assert.ok(x.slide>=2&&x.slide<=17,'slide 18–19 blood groups EI forbidden');
   assert.ok(['EXAM04','EXAM05','EXAM09','EXAM10'].includes(x.topic));
   assert.ok(x.ru.length>3&&x.en.length>3);
   assert.ok(x.explanationFi.length>=40&&x.explanationRu.length>=35,x.fi);
   assert.doesNotMatch(x.fi,/veriryhm|reesus|ABO|Rh-|Rh\+/i);
 }
});
test('production 1296 base words stay byte-stable and 65 new public IDs are collision-free',()=>{
 const b=Buffer.from(catalog,'utf8');
 const sha=crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
 assert.equal(sha,'fa65cf3ba0683309050a7dc729d6898699a63bbc');
 const {d,baseline}=load();
 assert.equal(baseline.length,1296);
 assert.equal(d.terms.length,1485,'1457 previously unique words + 28 RUN170 Moodle terms');
 assert.equal(new Set(d.terms.map(x=>x.id)).size,1485);
 assert.equal(new Set(d.terms.map(x=>norm(x.fi))).size,1485);
 for(let i=0;i<1296;i++)for(const f of Object.keys(baseline[i]))assert.deepEqual(d.terms[i][f],baseline[i][f],baseline[i].id+' '+f);
 const added=d.terms.filter(x=>/^T902(?:[1-6]\d|7[0-7])$/.test(x.id));
 assert.equal(added.filter(x=>Number(x.id.slice(1))>=90213).length,65);
});
test('each compound is in an EXISTING exam subject with full FI/RU and accurate slide metadata',()=>{
 const {d}=load();
 assert.equal(d.examTopics.length,10,'no eleventh dropdown category');
 assert.deepEqual(Array.from(d.examTopics,x=>x.pages),['7–12, 17','25–30','31–52','53–66','67–80','81–89','91–106','107–114','131–146','161–190']);
 const lookup=new Map(d.terms.map(x=>[norm(x.fi),x]));
 for(let i=0;i<source.records.length;i++){
  const expected=source.records[i],actual=lookup.get(norm(expected.fi));
  assert.ok(actual,'missing '+expected.fi);
  assert.equal(actual.id,'T'+(90213+i),'new ID contract '+expected.fi);
  assert.ok(actual.examTopics.includes(expected.topic),'incorrect exam topic '+expected.fi);
  assert.equal(actual.examPdfSlide,expected.slide,'incorrect source slide '+expected.fi);
  assert.equal(actual.ru,expected.ru);
  assert.equal(actual.en,expected.en);
  assert.equal(actual.la,expected.latin||undefined,'Latin should remain optional '+expected.fi);
  assert.equal(actual.examNoteFi,expected.explanationFi);
  assert.equal(actual.examNoteRu,expected.explanationRu);
 }
});
test('previous Riveria 289 mappings, explanations and old study IDs remain unaffected',()=>{
 const {d}=load();
 const old=JSON.parse(file('release-checks/exam-required-fi-topics-20261108.json'));
 assert.equal(old.required.length,289);
 const lookup=new Map(d.terms.map(x=>[norm(x.fi),x]));
 for(const r of old.required){
  const item=lookup.get(norm(r.fi));assert.ok(item,r.fi);
  assert.ok(item.examTopics.includes(r.topic),'old topic '+r.fi);
  assert.ok(item.examNoteFi&&item.examNoteRu,r.fi);
  if(r.sourceId)assert.equal(item.id,r.sourceId,'old ID '+r.fi);
 }
 for(const id of ['T90003','T90006','T90101','T90154','T90200','T90212'])assert.ok(d.terms.some(x=>x.id===id),id);
 assert.equal(d.terms.filter(x=>x.examTopics&&x.examTopics.includes('EXAM04')).length>=29,true);
});
test('Latin/FI/RU presentation and historic iOS12 compatible app remain visible',()=>{
 const app=file('app.js'),html=file('index.html'),sw=file('sw.js');
 const latin=app.indexOf("if(x.la)h+='<p><b>Latina:</b>");
 const finnish=app.indexOf("if(x.examNoteFi)h+='<p><b>FI:</b>");
 const russian=app.indexOf("if(x.examNoteRu)h+='<p><b>RU:</b>");
 assert.ok(latin>=0&&latin<finnish&&finnish<russian,'Latin → FI → RU renderer');
 assert.ok(html.includes('riveria-anatomy-exam.js?v=moodle-run170-1'));
 assert.ok(sw.includes('riveria-anatomy-exam.js?v=moodle-run170-1'));
 assert.ok(sw.includes('riveria-sanasto-community-v3.0.0-rc36'));
 assert.doesNotMatch(adapter,/\blet\s+|\bconst\s+|=>|\?\./,'module must remain ES5 for old Safari');
 assert.doesNotMatch(adapter,/localStorage\.setItem|fetch\s*\(|firestore|firebase\.auth/i);
});
