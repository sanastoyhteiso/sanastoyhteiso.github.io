'use strict';
// RUN152: regression for owner-supplied Moodle screenshots and immune system PDF/PPTX.
// Synthetic Node only: no live accounts, Firebase, localStorage or patient data.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>fs.readFileSync(p,'utf8');
const src=read('riveria-anatomy-exam.js');
function catalog(){const ctx={window:{}};vm.runInNewContext(read('data.js'),ctx);vm.runInNewContext(src,ctx);return ctx.window.RS_DATA;}
const names=['fagosyytti','interferoni','antigeeni','tulehdusreaktio','plasmasolu','seerumi','fibrinogeeni','synnynnäinen immuniteetti','hankittu immuniteetti','normaalifloora','makrofagi','T-muistisolu','T-tappajasolu','B-imusolu','immunologinen muisti','C-reaktiivinen proteiini','histamiini','plasma','fagosytoosi','hapen kuljetus','värekarvat'];
test('21 new terms are unique with FI/RU descriptions and proper exam topic',()=>{
 const d=catalog(),ids=d.terms.map(x=>x.id),fis=d.terms.map(x=>x.fi.toLocaleLowerCase('fi-FI'));
 assert.equal(d.terms.length,1446);
 assert.equal(d.examTopics.length,10);
 assert.equal(new Set(ids).size,ids.length);assert.equal(new Set(fis).size,fis.length);
 for(let i=0;i<names.length;i++){
  const x=d.terms.find(y=>y.id==='T'+(90284+i));
  assert.ok(x,names[i]);assert.equal(x.fi,names[i]);
  assert.ok(x.ru&&x.en&&x.examNoteFi.length>=35&&x.examNoteRu.length>=35);
  assert.ok(x.examTopics.includes(x.fi==='värekarvat'?'EXAM06':'EXAM04'));
 }
});
test('Moodle quiz answers are already covered; avoid 3 hormone duplicates',()=>{
 const d=catalog();
 for(const word of ['trombosyytti','lymfosyytti','erytrosyytti','granulosyytti','insuliini','glukagoni','glykogeeni']){
  const hit=d.terms.filter(x=>x.fi.toLocaleLowerCase('fi-FI')===word);
  assert.equal(hit.length,1,word+' must occur only once');
  assert.ok(hit[0].examNoteFi&&hit[0].examNoteRu,word);
 }
 const glucagon=d.terms.find(x=>x.fi==='glukagoni');
 assert.match(glucagon.examNoteFi,/verensoker/i);
 const glycogen=d.terms.find(x=>x.fi==='glykogeeni');
 assert.match(glycogen.examNoteFi,/varastomuoto/i);
});
test('plasma and plasmasolu are NOT confused, original base SHA remains unchanged',()=>{
 const d=catalog(),plasma=d.terms.find(x=>x.fi==='plasma'),cell=d.terms.find(x=>x.fi==='plasmasolu');
 assert.ok(plasma&&cell);assert.notEqual(plasma.id,cell.id);
 assert.match(cell.examNoteRu,/не плазма крови/i);
 assert.match(plasma.examNoteRu,/жидкая часть крови/i);
 const crypto=require('node:crypto'),buf=Buffer.from(read('data.js'));
 const blobSha=crypto.createHash('sha1').update(Buffer.from('blob '+buf.length+'\0')).update(buf).digest('hex');
 assert.equal(blobSha,'fa65cf3ba0683309050a7dc729d6898699a63bbc');
});
test('all previous RUN151 IDs, notes and topic pages stay stable',()=>{
 const d=catalog();for(let i=90278;i<=90283;i++)assert.equal(d.terms.filter(x=>x.id==='T'+i).length,1);
 assert.equal(d.examTopics.find(x=>x.id==='EXAM04').pages,'53–66');
 assert.equal(d.examTopics.find(x=>x.id==='EXAM05').pages,'67–80');
 assert.equal(d.examTopics.find(x=>x.id==='EXAM06').pages,'81–89');
 for(const x of d.terms.filter(x=>x.examTopics))assert.ok(x.examNoteFi&&x.examNoteRu);
 assert.equal(d.terms.filter(x=>x.fi==='veriryhmä').length,0,'excluded EI scope');
});
test('ES5 and consistent offline cache version for the new source',()=>{
 const html=read('index.html'),sw=read('sw.js'),needle='riveria-anatomy-exam.js?v=immune-run152-v1';
 assert.ok(html.includes(needle));assert.ok(sw.includes(needle));
 assert.ok(sw.includes('riveria-sanasto-community-v3.0.0-rc21'));
 assert.doesNotMatch(src,/\blet\s+|\bconst\s+|=>|\?\./);
 assert.doesNotMatch(src,/localStorage\.setItem|firebase\.auth|firestore|fetch\s*\(/i);
});
