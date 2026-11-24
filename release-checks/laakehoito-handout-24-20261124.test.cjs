'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const txt=file=>fs.readFileSync(path.join(root,file),'utf8');
const source=txt('data.js');
const data=JSON.parse(source.replace(/^window\.RS_DATA=/,'').replace(/;\s*$/,''));
const required=[
 'anafylaksia','PKV-lääke','lääkehoidon arviointi','omavalvonta','tabletti','kapseli',
 'injektio','infuusio','peräpuikko','silmätipat','lääkelaastari','inhalaatio',
 'voide','liuos','verenpaine','verensokeri','antibiootti','insuliini',
 'antikoagulantti','kipulääke','diureetti','kortisoni','laksatiivi','lääkehaitta'
];
const old={
 'anafylaksia':'T00682','tabletti':'T00355','kapseli':'T00364','peräpuikko':'T00385',
 'silmätipat':'T00373','lääkelaastari':'T00384','voide':'T00380',
 'verenpaine':'T00271','verensokeri':'T00287','insuliini':'T01251'
};
const norm=x=>String(x).normalize('NFC').toLocaleLowerCase('fi').trim();
test('every photographed term has a single full FI/RU/EN entry, with examples',()=>{
 assert.equal(required.length,24);
 assert.ok(data.terms.length>=1321);
 assert.equal(data.version,'2.2.3');
 const ids=new Set(),finnish=new Set();
 for(const term of data.terms){
  assert.equal(ids.has(term.id),false,'duplicate ID '+term.id);ids.add(term.id);
  assert.equal(finnish.has(norm(term.fi)),false,'duplicate Finnish spelling '+term.fi);
  finnish.add(norm(term.fi));
 }
 for(const fi of required){
  const matches=data.terms.filter(x=>norm(x.fi)===norm(fi));
  assert.equal(matches.length,1,fi+' must be present exactly once');
  const t=matches[0];
  assert.ok(t.ru&&t.ru.length>5,fi+' missing Russian');
  assert.ok(t.en&&t.en.length>4,fi+' missing English');
  assert.ok(t.example&&t.example.length>15,fi+' missing Finnish explanation');
  assert.ok(t.exampleRu&&t.exampleRu.length>15,fi+' missing Russian explanation');
  if(old[fi])assert.equal(t.id,old[fi],'preserve existing student progress ID for '+fi);
  else assert.ok(Number(t.id.slice(1))>=1308,'new word must receive new ID '+fi);
 }
});
test('important pharmacology distinctions remain correct',()=>{
 const term=fi=>data.terms.find(x=>norm(x.fi)===norm(fi));
 assert.match(term('PKV-lääke').ru,/центральную нервную систему/);
 assert.match(term('omavalvonta').ru,/контроль качества/);
 assert.match(term('anafylaksia').exampleRu,/немедленной помощи/);
 assert.match(term('antibiootti').exampleRu,/не против вирусных/);
 assert.match(term('kortisoni').ru,/глюкокортикоид/);
 assert.match(term('antikoagulantti').ru,/свёртываемость крови/);
 assert.match(term('lääkehaitta').ru,/нежелательное последствие/);
 assert.match(term('lääkelaastari').en,/medicated patch/);
 assert.match(term('verensokeri').ru,/глюкозы/);
});
test('HTML, About and offline service worker use matching medication catalog revision',()=>{
 const html=txt('index.html'),about=txt('about.html'),sw=txt('sw.js');
 for(const s of [html,about])assert.match(s,/src="data\.js\?v=2\.2\.3"/);
 assert.match(sw,/\.\/data\.js\?v=2\.2\.3/);
 assert.match(sw,/CACHE_NAME='riveria-sanasto-community-v3\.0\.0-rc49'/);
});
