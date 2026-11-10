'use strict';
/* RUN178: large classification shortcuts, color meanings, quick ferrum lookup.
 * Must not change the 118-elements database, original quiz, or user data. */
const test=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('periodic-table.html','utf8'),js=fs.readFileSync('periodic-table.js','utf8');
const sw=fs.readFileSync('sw.js','utf8'),source=fs.readFileSync('periodic-elements.js','utf8');
const c={window:{}};vm.runInNewContext(source,c);
const all=Array.from(c.window.RS_PERIODIC_ELEMENTS,e=>Object.assign({},e));
test('offline table still has all 118 recognised elements and case-sensitive chemistry symbols',()=>{
 a.equal(all.length,118);
 a.equal(new Set(all.map(e=>e.n)).size,118);
 a.equal(all.find(e=>e.n===26).s,'Fe');
 a.equal(all.find(e=>e.n===26).fi,'rauta');
 a.equal(all.find(e=>e.n===26).ru,'железо');
 a.equal(all.find(e=>e.n===1).c,'nonmetal');
 a.ok(sw.includes('./periodic-table.js?v=run178-1'));
 a.ok(html.includes('periodic-table.js?v=run178-1'));
 a.doesNotThrow(()=>new vm.Script(js));
 a.doesNotMatch(js,/localStorage|sessionStorage|indexedDB|firebase|XMLHttpRequest|fetch\(/i);
});
test('category and phase sets cover elements without treating gas as a chemical category',()=>{
 const metals=['alkali','alkaline','transition','post','lanthanide','actinide'];
 const nonmetals=['nonmetal','halogen','noble'];
 a.equal(all.filter(e=>metals.includes(e.c)).length,88);
 a.equal(all.filter(e=>nonmetals.includes(e.c)).length,20);
 a.equal(all.filter(e=>e.c==='metalloid').length,6);
 a.equal(all.filter(e=>e.c==='unknown').length,4);
 a.equal(all.filter(e=>e.st==='gas').length,11);
 a.equal(all.filter(e=>e.st==='liquid').length,2);
 a.ok(all.some(e=>e.st==='gas'&&e.c==='noble'));
 a.ok(all.some(e=>e.c==='nonmetal'&&e.st==='solid'));
});
test('user-visible broad buttons and color legend distinguish chemistry from physical state',()=>{
 for(const key of ['all','metal','nonmetal','metalloid','gas','liquid','solid'])
  a.ok(html.includes('data-overview="'+key+'"'),key);
 for(const x of ['Что означают цвета?','Каждый цвет — химическое семейство','агрегатное состояние','Водород (H)','Fe — rauta — железо'])
  a.ok(html.includes(x),x);
 for(const x of ['id="overview-help"','id="family-help"','id="find-fe"'])
  a.ok(html.includes(x),x);
 a.ok(html.includes('periodic-table.js?v=run178-1'));
});
test('interactive highlights, color families, ferrum lookup, and reset all work in simulated browser',()=>{
 const {JSDOM}=require('jsdom');
 const dom=new JSDOM(html,{url:'https://example.invalid/periodic-table.html',runScripts:'outside-only'});
 const w=dom.window,d=w.document;
 for(const code of [source,js])w.eval(code);
 d.dispatchEvent(new w.Event('DOMContentLoaded'));
 const count=()=>Number(d.getElementById('count').textContent.split(' ')[0]);
 const cell=n=>d.querySelector('#periodic-grid .element[data-n="'+n+'"]');
 const broad=x=>d.querySelector('[data-overview="'+x+'"]');
 const cat=x=>d.querySelector('[data-family="'+x+'"]');
 a.equal(d.querySelectorAll('.element').length,118);
 a.equal(d.querySelectorAll('#legend [data-family]').length,12);
 for(const c of Array.from(d.querySelectorAll('#legend [data-family]')).slice(1))
  a.ok(c.querySelector('.dot'),'each chemistry category has a color swatch');
 broad('metal').click();
 a.equal(count(),88);
 a.ok(!cell(26).classList.contains('dimmed'),'Fe is a metal');
 a.ok(cell(1).classList.contains('dimmed'),'hydrogen is a nonmetal');
 a.equal(broad('metal').getAttribute('aria-pressed'),'true');
 a.match(d.getElementById('overview-help').textContent,/щелочные/);
 broad('nonmetal').click();
 a.equal(count(),20);
 a.ok(!cell(1).classList.contains('dimmed'),'H is nonmetal despite left location');
 a.ok(!cell(8).classList.contains('dimmed'));
 a.ok(cell(26).classList.contains('dimmed'));
 broad('metalloid').click();
 a.equal(count(),6);a.ok(!cell(14).classList.contains('dimmed'));
 broad('gas').click();
 a.equal(count(),11);
 a.ok(!cell(8).classList.contains('dimmed'));
 a.ok(cell(26).classList.contains('dimmed'));
 a.match(d.getElementById('overview-help').textContent,/агрегатное состояние/);
 broad('liquid').click();
 a.equal(count(),2);
 a.ok(!cell(35).classList.contains('dimmed'));
 a.ok(!cell(80).classList.contains('dimmed'));
 cat('transition').click();
 a.equal(count(),38);
 a.equal(broad('all').getAttribute('aria-pressed'),'true');
 a.match(d.getElementById('family-help').textContent,/Переходный металл/);
 a.ok(!cell(26).classList.contains('dimmed'));
 a.ok(cell(8).classList.contains('dimmed'));
 d.getElementById('find-fe').click();
 a.equal(count(),1);
 a.equal(d.getElementById('element-search').value,'Fe');
 a.ok(cell(26).classList.contains('selected'));
 a.ok(!cell(26).classList.contains('dimmed'));
 a.match(d.getElementById('detail').textContent,/железо/);
 const query=d.getElementById('element-search');
 query.value='ferrum';query.dispatchEvent(new w.Event('input'));
 a.equal(count(),1);
 a.ok(cell(26).classList.contains('selected'));
 query.value='феррум';query.dispatchEvent(new w.Event('input'));
 a.equal(count(),1);
 query.value='железо';query.dispatchEvent(new w.Event('input'));
 a.equal(count(),1);
 d.getElementById('clear').click();
 a.equal(count(),118);
 a.equal(broad('all').getAttribute('aria-pressed'),'true');
 a.ok(!cell(26).classList.contains('dimmed'));
 a.ok(!cell(8).classList.contains('dimmed'));
 w.close();
});
