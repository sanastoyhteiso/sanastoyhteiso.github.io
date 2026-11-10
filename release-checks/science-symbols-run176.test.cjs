'use strict';
/* RUN176: verify notation is readable, physically correct, searchable, and independent of user data. */
const test=require('node:test'), assert=require('node:assert/strict'), fs=require('node:fs'), vm=require('node:vm');
const paths=['science-physics-data.js','science-chemistry-data.js','science-notation.js','science-physics-phenomena.js','science-trainer.js'];
const ctx={window:{RS_SCIENCE_CARDS:[]}};
for(const path of paths.slice(0,4))vm.runInNewContext(fs.readFileSync(path,'utf8'),ctx,{filename:path});
const cards=Array.from(ctx.window.RS_SCIENCE_CARDS);
const notes=ctx.window.RS_SCIENCE_NOTATION, html=fs.readFileSync('science.html','utf8'), sw=fs.readFileSync('sw.js','utf8');
test('113 cards have canonical symbols, units or contextual chemistry notation',()=>{
 assert.equal(cards.length,132);
 assert.equal(Object.keys(notes).length,113);
 const ids=new Set(cards.map(x=>x.id));
 for(const [id,n] of Object.entries(notes)){
  assert.ok(ids.has(id),id+' must exist in study notes');
  assert.ok(n.symbol&&typeof n.symbol==='string'&&n.fi&&n.ru,id+' has FI/RU');
  assert.ok(Array.isArray(n.keys)&&n.keys.length,id+' has search keys');
  assert.ok(n.kind,id+' has notation kind');
 }
 for(const id of ['C10','C44','C45','C52','O01','P17'])
  assert.ok(!notes[id],id+' intentionally has no universal single symbol');
});
test('different physical quantities and units are explicitly disambiguated',()=>{
 for(const [id,symbol,unit] of [
  ['P01','v','m/s, km/h'],['P02','s','m, km'],['P03','t','s, min, h'],
  ['P04','a','m/s²'],['P06','E','J'],['P10','F','N'],['P11','m','kg, g'],
  ['P18','T / t','K / °C'],['P28','I','A'],['P29','U','V'],
  ['P30','R','Ω'],['P33','p','Pa'],['C06','Z',''],['C07','A',''],
  ['C29','n','mol'],['C30','M','g/mol'],['C50','pH','']
 ]) {
  assert.equal(notes[id].symbol,symbol,id);
  assert.equal(notes[id].unit,unit,id);
 }
 assert.match(notes.P10.ru,/F.*сила|F.*символ/);
 assert.match(notes.P10.ru,/N.*единица/);
 assert.match(notes.P03.ru,/секунд.*s/);
 assert.match(notes.P12.ru,/разные величины/);
 assert.match(notes.P31.ru,/работ.*W.*мощност.*P/i);
 assert.match(notes.C18.ru,/Строчная s/);
 assert.match(notes.C14.ru,/азот/);
 assert.equal(notes.C34.symbol,'GHS02');
 assert.equal(notes.C37.symbol,'GHS06');
 assert.equal(notes.O07.symbol,'−OH');
});
test('markup loads notation before versioned trainer and caches it offline',()=>{
 assert.match(html,/science-notation\.js\?v=20261110-1/);
 assert.match(html,/science-trainer\.js\?v=20261110-3/);
 assert.match(html,/science-physics-phenomena\.js\?v=run179-1/);
 assert.ok(html.indexOf('science-notation.js?v=20261110-1') < html.indexOf('science-trainer.js?v=20261110-3'));
 for(const asset of ['./science-notation.js?v=20261110-1','./science-physics-phenomena.js?v=run179-1','./science-trainer.js?v=20261110-3'])
  assert.ok(sw.includes(asset),'SW missing '+asset);
 assert.match(html,/data-symbol="s"/);
 assert.match(html,/data-symbol="N"/);
 assert.match(html,/data-symbol="GHS02"/);
 for(const path of paths)assert.doesNotThrow(()=>new vm.Script(fs.readFileSync(path,'utf8')),path);
 const js=fs.readFileSync('science-trainer.js','utf8');
 assert.doesNotMatch(js,/localStorage|sessionStorage|indexedDB|firebase|fetch\(|XMLHttpRequest/);
});
test('actual browser UI distinguishes s from S and supports the symbol quick links',()=>{
 const {JSDOM}=require('jsdom');
 const dom=new JSDOM(html,{url:'https://example.invalid/science.html',runScripts:'outside-only'});
 const w=dom.window,d=w.document;
 for(const path of paths)w.eval(fs.readFileSync(path,'utf8'));
 d.dispatchEvent(new w.Event('DOMContentLoaded'));
 const input=d.getElementById('query');
 function search(q){
  input.value=q;
  input.dispatchEvent(new w.Event('input',{bubbles:true}));
  return Array.from(d.querySelectorAll('#list .science-card')).map(el=>el.getAttribute('data-card-id'));
 }
 const s=search('s');
 assert.ok(s.includes('P02'),'lowercase s means distance');
 assert.ok(s.includes('P03'),'lowercase s may also mean second');
 assert.ok(!s.includes('C18'),'lowercase s must not mean sulfur');
 const S=search('S');
 assert.ok(S.includes('C18'),'uppercase S is sulfur');
 assert.ok(!S.includes('P02'),'uppercase S is not the path variable');
 const N=search('N');
 assert.ok(N.includes('P10'),'N is a newton');
 assert.ok(N.includes('C14'),'N is nitrogen in chemical notation');
 const m=search('m');
 assert.ok(m.includes('P11'),'m is mass');
 assert.ok(!m.includes('C30'),'m is not uppercase molar mass M');
 const M=search('M');
 assert.ok(M.includes('C30'),'M is molar mass');
 assert.ok(!M.includes('P11'),'M is not lowercase mass m');
 search('s');
 const first=d.querySelector('#list .science-card');
 assert.ok(first.querySelector('summary .notation-chip'),'symbol precedes the bilingual name');
 first.open=true;
 assert.ok(first.querySelector('.notation-box .notation-values'));
 assert.match(first.textContent,/Yksikkö \/ Единица/);
 const quick=d.querySelector('[data-symbol="GHS02"]');
 quick.click();
 assert.equal(input.value,'GHS02');
 assert.ok(d.querySelector('.science-card[open]'),'quick lookup automatically opens first result');
 assert.ok(search('−OH').includes('O07'),'organic functional groups indexed');
 d.getElementById('tab-train').click();
 d.getElementById('start-train').click();
 assert.ok(d.querySelector('#reveal'));
 d.getElementById('reveal').click();
 assert.ok(d.querySelector('#reveal-answer'),'notation available in oral training');
 w.close();
});
