'use strict';
/* RUN179: explicitly requested Hitaus / inertia + Liukuminen / sliding and a school-physics coverage audit. */
const t=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const rawFiles=['science-physics-data.js','science-chemistry-data.js','science-notation.js','science-physics-phenomena.js'];
const c={window:{}};
for(const p of rawFiles)vm.runInNewContext(fs.readFileSync(p,'utf8'),c,{filename:p});
const all=Array.from(c.window.RS_SCIENCE_CARDS,v=>Object.assign({},v));
const n=c.window.RS_SCIENCE_NOTATION,byId=Object.fromEntries(all.map(x=>[x.id,x]));
const html=fs.readFileSync('science.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
t('preserve 100 original cards, insert 32 new physical phenomena near parent topics',()=>{
 a.equal(all.length,132);
 a.equal(all.filter(x=>x.section==='physics').length,65);
 a.equal(all.filter(x=>x.section==='chemistry').length,53);
 a.equal(all.filter(x=>x.section==='organic').length,14);
 a.equal(all.filter(x=>x.page>0).length,71);
 a.equal(Object.keys(n).length,113);
 a.equal(new Set(all.map(x=>x.id)).size,all.length);
 for(const id of ['P14a','P14b','P32a','P32b','P32c','P32d','P32e','P32f']){
  a.ok(byId[id],id);
  a.equal(byId[id].page,0,id);
 }
 const allIds=all.map(x=>x.id);
 a.ok(allIds.indexOf('P14')<allIds.indexOf('P14a')&&allIds.indexOf('P14a')<allIds.indexOf('P15'));
 a.ok(allIds.indexOf('P32')<allIds.indexOf('P32a')&&allIds.indexOf('P32f')<allIds.indexOf('P33'));
});
t('inertia is explicitly separate from friction and wheelchair examples are bilingual',()=>{
 a.match(byId.P14a.fi,/^Hitaus/);
 a.match(byId.P14a.ru,/Инерция/);
 a.match(byId.P14a.shortFi,/Newtonin ensimmäiseen lakiin/);
 a.match(byId.P14a.shortRu,/первый закон Ньютона/);
 a.match(byId.P14b.fi,/pyörätuoli/);
 a.match(byId.P14b.moreRu,/Пациент/);
 a.match(byId.P14b.moreFi,/hoito-ohjeen mukaan/);
 a.match(byId.P32a.fi,/Liukuminen/);
 a.match(byId.P32a.shortRu,/Скольжение/);
 a.match(byId.P32a.moreRu,/трение — сила/);
 a.match(byId.P32b.fi,/Liukukitka/);
 a.match(byId.P32c.fi,/Lepokitka/);
 a.match(byId.P32f.fi,/Liukastuminen/);
 a.equal(byId.P32c.origin,'extra');
 a.equal(byId.P32f.origin,'extra');
 a.match(byId.P14a.keywords,/hitos/,'common misspelling still searchable');
});
t('audit covers distinct mechanical, thermal, electrical, wave and optical phenomena',()=>{
 for(const id of ['P04a','P04b','P08a','P10a','P10b','P11a','P12a','P17a','P17b',
  'P18a','P18b','P18c','P18d','P27a','P27b','P29a','P33a','P34','P35','P36','P37','P38','P39']){
  const r=byId[id];a.ok(r,id);
  a.equal(r.section,'physics',id);
  for(const field of ['fi','ru','shortFi','shortRu','moreFi','moreRu'])
   a.ok(typeof r[field]==='string'&&r[field].length>(field==='fi'||field==='ru'?2:10),id+' '+field);
  a.equal(r.page,0,id);
  a.equal(r.origin,'extra',id);
 }
 a.equal(n.P11a.symbol,'ρ');
 a.equal(n.P32d.symbol,'μ');
 a.equal(n.P29a.symbol,'P');
 a.equal(n.P39.symbol,'f');
 a.equal(n.P32b.symbol,'Fₖ / μₖ');
});
t('site displays fast links to user topics and caches standalone offline data',()=>{
 for(const q of ['hitaus','äkillinen pysähtyminen','liukuminen','kitka','liukukitka','lepokitka'])
  a.ok(html.includes('data-q="'+q+'" data-topics="physics"'),q);
 a.ok(html.includes('science-physics-phenomena.js?v=run179-1'));
 a.ok(sw.includes("./science-physics-phenomena.js?v=run179-1"));
 a.doesNotThrow(()=>new vm.Script(fs.readFileSync('science-physics-phenomena.js','utf8')));
 a.doesNotMatch(fs.readFileSync('science-physics-phenomena.js','utf8'),/fetch\(|XMLHttpRequest|firebase|localStorage|sessionStorage|indexedDB/);
});
t('old Safari-compatible UI can find inertia, sliding and friction in FI/RU including misspelling',()=>{
 const {JSDOM}=require('jsdom');
 const dom=new JSDOM(html,{url:'https://example.invalid/science.html?section=physics',runScripts:'outside-only'});
 const w=dom.window,d=w.document;
 for(const file of rawFiles.concat(['science-trainer.js']))
  w.eval(fs.readFileSync(file,'utf8'));
 d.dispatchEvent(new w.Event('DOMContentLoaded'));
 a.equal(d.getElementById('scope').value,'physics');
 a.match(d.getElementById('count').textContent,/65 из 132/);
 const input=d.getElementById('query');
 function search(q){
  input.value=q;input.dispatchEvent(new w.Event('input',{bubbles:true}));
  return Array.from(d.querySelectorAll('.science-card')).map(x=>x.getAttribute('data-card-id'));
 }
 for(const q of ['hitaus','инерция','hitos'])a.ok(search(q).includes('P14a'),q);
 for(const q of ['liukuminen','скольжение'])a.ok(search(q).includes('P32a'),q);
 for(const q of ['liukukitka','трение скольжения'])a.ok(search(q).includes('P32b'),q);
 a.ok(search('lepokitka').includes('P32c'));
 a.ok(search('pyörätuoli').includes('P14b'));
 const id='P14a';search('hitaus');
 const cell=d.querySelector('.science-card[data-card-id="'+id+'"]');
 a.ok(cell,'separate inertia card visible');
 cell.open=true;
 a.match(cell.textContent,/Инерция/);
 a.match(cell.textContent,/hitaus/);
 a.match(cell.textContent,/коляска/i);
 d.querySelector('[data-q="liukuminen"]').click();
 a.ok(d.querySelector('.science-card[data-card-id="P32a"]'),'tap quick link locates sliding');
 d.getElementById('tab-train').click();
 d.getElementById('start-train').click();
 a.ok(d.getElementById('reveal'),'oral exercise still works');
 w.close();
});
