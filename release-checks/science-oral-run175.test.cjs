'use strict';
/* RUN175: source-informed physics/chemistry quick answers, no user data writes. */
const t=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const x={window:{}};
for(const path of ['science-physics-data.js','science-chemistry-data.js','science-physics-phenomena.js'])
  vm.runInNewContext(fs.readFileSync(path,'utf8'),x,{filename:path});
const rows=Array.from(x.window.RS_SCIENCE_CARDS, v=>Object.assign({},v));
const html=fs.readFileSync('science.html','utf8');
const js=fs.readFileSync('science-trainer.js','utf8');
const app=fs.readFileSync('app.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const byId=Object.fromEntries(rows.map(x=>[x.id,x]));
t('132 non-duplicated FI/RU spoken-answer cards with explicit origin',()=>{
 a.equal(rows.length,132);
 a.equal(new Set(rows.map(x=>x.id)).size,rows.length);
 a.equal(rows.filter(x=>x.section==='physics').length,65);
 a.equal(rows.filter(x=>x.section==='chemistry').length,53);
 a.equal(rows.filter(x=>x.section==='organic').length,14);
 a.equal(rows.filter(x=>x.page>0).length,71);
 for(const r of rows){
  for(const field of ['fi','ru','shortFi','shortRu','moreFi','moreRu'])
    a.ok(typeof r[field]==='string'&&r[field].length>(field==='fi'||field==='ru'?1:15),'missing '+field+': '+r.id);
  a.ok(r.page===0||(Number.isInteger(r.page)&&r.page>=1&&r.page<=17),r.id);
  a.ok(['physics','chemistry','organic'].includes(r.section),r.id);
  if(r.page===0)a.ok(/extra|user/.test(r.origin||'extra'),r.id);
 }
});
t('requested oral questions and source notebook are represented',()=>{
 for(const id of ['P01','P02','P03','P04','P06','P14','P15','P16','C01','C10','C13','C14','C44'])
   a.ok(byId[id]&&byId[id].shortFi&&byId[id].shortRu,id);
 a.match(byId.C44.fi,/torjunta-aine/i);
 a.equal(byId.C44.origin,'user','pesticides from user question, not notebook');
 a.equal(byId.P01.page,1);
 a.equal(byId.P14.page,5);
 a.equal(byId.C10.page,17);
 a.ok(rows.every(r=>!/(?:Илья|Милослава|Сургут|velardream|@gmail)/i.test(JSON.stringify(r))),'no personal data');
});
t('school calculations and symbols are physically meaningful',()=>{
 for(const [id,pattern] of Object.entries({
  P01:/v = s \/ t/,P02:/s = v/,P03:/t = s/,P04:/a =/,P05:/3,6/,P15:/ΣF = m × a/,
  P08:/½mv²/,C06:/Z =/,C07:/A = Z \+ N/,C25:/2H₂ \+ O₂/,C30:/18,015/,
  C31:/44,01/,C32:/55,5/,O11:/CH₄ \+ 2O₂/
 })){
  a.match(byId[id].formula,pattern,id);
 }
});
t('independent public study and speaking practice both work without user storage',()=>{
 for(const name of ['id="guide"','id="train"','id="query"','id="scope"','id="origin"','data-q="пестициды"'])
  a.ok(html.includes(name),name);
 for(const file of ['science-physics-data.js','science-chemistry-data.js','science-notation.js'])
  a.ok(html.includes(file+'?v=20261110-1'),file);
 a.ok(html.includes('science-trainer.js?v=20261110-3'));
 a.ok(html.includes('science-physics-phenomena.js?v=run179-1'));
 a.ok(js.includes('details class="science-card"'),'tap-to-reveal cards');
 a.ok(js.includes('Selitä omin sanoin'),'speaking practice');
 a.ok(js.includes('Kertaan'),'mistake retry');
 a.ok(js.includes('section=(physics|chemistry|organic)'),'separate deep links');
 a.doesNotMatch(js,/localStorage|sessionStorage|firebase|fetch\(|XMLHttpRequest|indexedDB/);
 a.doesNotThrow(()=>new vm.Script(js),'compatible JS');
 a.doesNotThrow(()=>new vm.Script(app),'existing site script still compiles');
});
t('only separate science links added to original 40-question exam, no progress modifications',()=>{
 for(const url of ['./science.html?section=physics','./science.html?section=chemistry','./science.html?section=organic'])
  a.ok(app.includes(url),url);
 a.ok(app.includes('47 заданий, 68 вопросов'),'medication calculator preserved');
 a.ok(app.includes('function renderMockExam('),'existing mock exam preserved');
 for(const s of ['./science.html','./science-trainer.js?v=20261110-3','./science-notation.js?v=20261110-1','./science-physics-phenomena.js?v=run179-1','./science-physics-data.js?v=20261110-1','./science-chemistry-data.js?v=20261110-1'])
  a.ok(sw.includes(s),'offline resource missing '+s);
});

t('mobile-style guide filters and speaking practice actually render in a browser DOM',()=>{
 const {JSDOM}=require('jsdom');
 const dom=new JSDOM(html,{url:'https://example.invalid/science.html?section=physics',runScripts:'outside-only'});
 const w=dom.window,d=w.document;
 for(const p of ['science-physics-data.js','science-chemistry-data.js','science-notation.js','science-physics-phenomena.js','science-trainer.js'])
  w.eval(fs.readFileSync(p,'utf8'));
 d.dispatchEvent(new w.Event('DOMContentLoaded'));
 a.equal(d.getElementById('scope').value,'physics','deep link selects physics');
 a.match(d.getElementById('count').textContent,/65 из 132/);
 const search=d.getElementById('query');
 search.value='закон ньютона';
 search.dispatchEvent(new w.Event('input',{bubbles:true}));
 a.ok(d.querySelectorAll('#list .science-card').length>=3,'all Newton laws visible, plus linked inertia');
 const first=d.querySelector('#list .science-card');
 a.ok(first.textContent.includes('FI')&&first.textContent.includes('RU'),'both language responses');
 d.getElementById('tab-train').click();
 a.equal(d.getElementById('train').hidden,false);
 d.getElementById('start-train').click();
 a.ok(d.querySelector('#reveal'),'oral question displayed');
 d.getElementById('reveal').click();
 a.equal(d.getElementById('reveal-answer').hidden,false);
 a.ok(d.querySelector('#knew')&&d.querySelector('#missed'),'self-assessment options');
 d.getElementById('scope').value='all';
 d.getElementById('scope').dispatchEvent(new w.Event('change'));
 search.value='пестициды';
 search.dispatchEvent(new w.Event('input'));
 a.equal(d.querySelectorAll('#list .science-card').length,1,'pesticides discoverable by Russian keyword');
 a.match(d.getElementById('list').textContent,/Из списка вопросов/);
 w.close();
});
