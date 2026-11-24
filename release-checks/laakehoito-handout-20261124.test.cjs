'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const raw = fs.readFileSync(path.join(root, 'data.js'), 'utf8');
const data = JSON.parse(raw.replace(/^window\.RS_DATA=/, '').replace(/;\s*$/, ''));
const required = [
 'annostelu','vaikuttava aine','resepti','sivuvaikutus',
 'itsehoitolääke','lääkehoitosuunnitelma','lääkkeen säilytys','lääkekortti',
 'lääkepoikkeama','lääkkeen jakaminen','lääkeinteraktio','vasta-aihe',
 'puoliintumisaika','depot-valmiste','geneerinen lääke','lääkekuorma'
];
const existing = {
 'resepti':'T00314','itsehoitolääke':'T00316','lääkehoitosuunnitelma':'T00352',
 'lääkekortti':'T00318','vasta-aihe':'T00347'
};
test('all 16 study-handout medication terms are present, explained and deduplicated', () => {
 assert.equal(data.terms.length,1307);
 assert.equal(data.version,'2.2.2');
 assert.equal(data.date,'2026-11-24');
 const ids = new Set();
 for(const term of data.terms){
  assert.match(term.id,/^T[0-9]{5,7}$/);
  assert.equal(ids.has(term.id),false,'duplicate term ID: '+term.id);
  ids.add(term.id);
 }
 for(const fi of required){
  const found=data.terms.filter(x=>x.fi.normalize('NFC').toLocaleLowerCase('fi')===fi);
  assert.equal(found.length,1,'expected one dictionary entry for '+fi);
  const word=found[0];
  assert.equal(word.cat,'Lääkehoito');
  assert.equal(word.catRu,'Лекарственная терапия');
  assert.ok(word.ru.length>=6,'missing Russian explanation for '+fi);
  assert.ok(word.en.length>=5,'missing English term for '+fi);
  assert.ok(word.example.length>=12,'missing Finnish educational explanation for '+fi);
  assert.ok(word.exampleRu.length>=12,'missing Russian explanation for '+fi);
  if(existing[fi])assert.equal(word.id,existing[fi],'must keep learner progress ID for '+fi);
  else assert.ok(Number(word.id.slice(1))>=1297,'new term should use stable appended ID: '+fi);
 }
});
test('corrects potentially misleading handwritten definitions', () => {
 const find=fi=>data.terms.find(x=>x.fi===fi);
 assert.match(find('vaikuttava aine').ru,/действующее вещество/);
 assert.match(find('itsehoitolääke').ru,/безрецептурное/);
 assert.match(find('lääkekortti').example,/käytössä olevat lääkkeet/);
 assert.match(find('vasta-aihe').ru,/противопоказание/);
 assert.match(find('puoliintumisaika').exampleRu,/уменьшается вдвое/);
 assert.match(find('lääkepoikkeama').example,/lääkityspoikkeama/);
 assert.match(find('geneerinen lääke').example,/sama vaikuttava aine/);
});
test('main page and service worker use the same offline dictionary revision', () => {
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 assert.match(html,/src="data\.js\?v=2\.2\.2"/);
 assert.match(sw,/\.\/data\.js\?v=2\.2\.2/);
 assert.match(sw,/riveria-sanasto-community-v3\.0\.0-rc48/);
});
