'use strict';
/* RUN177: 118 offline FI/RU elements, subject-specific shortcuts, and interactive quiz. */
const t=require('node:test'),a=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('periodic-table.html','utf8'),js=fs.readFileSync('periodic-table.js','utf8');
const science=fs.readFileSync('science.html','utf8'),scienceJs=fs.readFileSync('science-trainer.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const tableRev=(html.match(/periodic-table\.js\?v=([^"]+)/)||[])[1],scienceRev=(science.match(/science-trainer\.js\?v=([^"]+)/)||[])[1];
const c={window:{}};
vm.runInNewContext(fs.readFileSync('periodic-elements.js','utf8'),c);
const data=Array.from(c.window.RS_PERIODIC_ELEMENTS,v=>Object.assign({},v));
const byNum=Object.fromEntries(data.map(e=>[e.n,e]));
t('complete validated 118 elements with correct first/last, no hypothetical 119',()=>{
 a.equal(data.length,118);a.equal(new Set(data.map(e=>e.n)).size,118);
 a.deepEqual(data.map(x=>x.n),Array.from({length:118},(_,i)=>i+1));
 a.equal(byNum[1].s,'H');a.equal(byNum[1].fi,'vety');a.equal(byNum[1].ru,'водород');
 a.equal(byNum[118].s,'Og');a.equal(byNum[118].fi,'oganesson');
 a.equal(byNum[26].s,'Fe');a.equal(byNum[26].fi,'rauta');a.equal(byNum[26].ru,'железо');
 a.equal(byNum[79].s,'Au');a.equal(byNum[79].ru,'золото');
 for(const e of data){
  a.ok(/^[A-Z][a-z]?$/.test(e.s),'IUPAC symbol '+e.n);
  a.ok(e.fi&&e.ru&&e.en,'three languages '+e.n);
  a.ok(Number.isInteger(e.p)&&e.p>=1&&e.p<=7,'period '+e.n);
  a.ok(e.g===null||(Number.isInteger(e.g)&&e.g>=1&&e.g<=18),'group '+e.n);
  a.ok(typeof e.m==='number'&&e.m>0,'approximate mass '+e.n);
  a.ok(['solid','liquid','gas',null].includes(e.st),'state '+e.n);
 }
});
t('correct traditional main rows plus f-block separately and hydrogen exception',()=>{
 for(const z of [2,10,18,36,54,86,118])a.equal(byNum[z].g,18);
 for(const z of [9,17,35,53,85,117])a.equal(byNum[z].g,17);
 a.equal(byNum[1].g,1);a.equal(byNum[1].c,'nonmetal');
 a.equal(byNum[17].p,3);a.equal(byNum[17].s,'Cl');
 a.equal(byNum[72].g,4);a.equal(byNum[104].g,4);
 for(let n=57;n<=71;n++){a.equal(byNum[n].row,8);a.equal(byNum[n].g,null);a.equal(byNum[n].p,6);}
 for(let n=89;n<=103;n++){a.equal(byNum[n].row,9);a.equal(byNum[n].g,null);a.equal(byNum[n].p,7);}
});
t('static bilingual chemistry page, fully offline and ES5 syntax',()=>{
 a.match(html,/periodic-elements\.js\?v=run177-1/);
 a.ok(tableRev,'periodic script version');
 a.match(html,/Таблица Менделеева/);
 a.match(html,/Лантаноиды/);
 a.match(js,/Электронные оболочки/);
 a.match(html,/атомных единицах массы/);
 for(const path of ['periodic-table.html','periodic-elements.js?v=run177-1','periodic-table.js?v='+tableRev])a.ok(sw.includes('./'+path),'offline cache '+path);
 a.ok(science.includes('periodic-table.html'),'linked from chemistry');
 a.ok(scienceRev,'science trainer version');
 a.doesNotThrow(()=>new vm.Script(js));
 a.doesNotThrow(()=>new vm.Script(scienceJs));
 a.doesNotMatch(js,/localStorage|sessionStorage|indexedDB|firebase|XMLHttpRequest|fetch\(/i);
});
t('118 clickable cells render; search, selected group and training operate in JSDOM',()=>{
 const {JSDOM}=require('jsdom');
 const dom=new JSDOM(html,{url:'https://example.invalid/periodic-table.html',runScripts:'outside-only'});
 const w=dom.window,d=w.document;
 for(const file of ['periodic-elements.js','periodic-table.js'])w.eval(fs.readFileSync(file,'utf8'));
 d.dispatchEvent(new w.Event('DOMContentLoaded'));
 a.equal(d.querySelectorAll('#periodic-grid .element').length,118);
 a.equal(d.querySelectorAll('.placeholder').length,2);
 a.match(d.getElementById('detail').textContent,/водород/);
 d.querySelector('#periodic-grid .element[data-n="26"]').click();
 a.match(d.getElementById('detail').textContent,/железо/);
 a.match(d.getElementById('detail').textContent,/Ryhmä \/ Группа/);
 a.match(d.getElementById('detail').textContent,/Elektronikuoret/);
 const search=d.getElementById('element-search');
 search.value='кислород';search.dispatchEvent(new w.Event('input'));
 a.match(d.getElementById('detail').textContent,/кислород/);
 a.ok(d.querySelector('#periodic-grid .element[data-n="8"].selected'));
 const period=d.getElementById('period-filter');search.value='';search.dispatchEvent(new w.Event('input'));
 period.value='3';period.dispatchEvent(new w.Event('change'));
 a.match(d.getElementById('count').textContent,/8 из 118/);
 const group=d.getElementById('group-filter');period.value='all';period.dispatchEvent(new w.Event('change'));
 group.value='17';group.dispatchEvent(new w.Event('change'));
 a.match(d.getElementById('count').textContent,/6 из 118/);
 group.value='lanthanide';group.dispatchEvent(new w.Event('change'));
 a.match(d.getElementById('count').textContent,/15 из 118/);
 d.getElementById('tab-quiz').click();
 a.equal(d.getElementById('detail').hidden,true);
 d.getElementById('quiz-start').click();
 a.ok(d.getElementById('quiz-response'));
 const itemText=d.getElementById('quiz-content').textContent;
 a.ok(itemText.includes('Вопрос'));
 d.getElementById('quiz-response').value='не знаю';
 d.getElementById('quiz-check').click();
 a.ok(d.getElementById('quiz-next'));
 d.getElementById('quiz-next').click();
 a.ok(d.getElementById('quiz-response'));
 w.close();
});
t('quick links match current subject for both concepts and notation',()=>{
 const {JSDOM}=require('jsdom');
 const dom=new JSDOM(science,{url:'https://example.invalid/science.html?section=physics',runScripts:'outside-only'});
 const w=dom.window,d=w.document;
 for(const f of ['science-physics-data.js','science-chemistry-data.js','science-notation.js','science-physics-phenomena.js','science-trainer.js'])
  w.eval(fs.readFileSync(f,'utf8'));
 d.dispatchEvent(new w.Event('DOMContentLoaded'));
 function shown(selector){return Array.from(d.querySelectorAll(selector)).filter(b=>!b.hidden).map(x=>x.textContent);}
 a.ok(shown('[data-q]').includes('Ньютон'));
 a.ok(shown('[data-q]').includes('Hitaus · Инерция'));
 a.ok(shown('[data-q]').includes('Liukuminen · Скольжение'));
 a.ok(!shown('[data-q]').includes('Пестициды'));
 a.ok(shown('[data-symbol]').includes('s'));
 a.ok(!shown('[data-symbol]').includes('Z'));
 a.equal(d.getElementById('periodic-link').hidden,true);
 const scope=d.getElementById('scope');scope.value='chemistry';scope.dispatchEvent(new w.Event('change'));
 a.deepEqual(shown('[data-q]'),['Атом','Таблица Менделеева','Металлы','Пестициды']);
 a.ok(shown('[data-symbol]').includes('Z'));
 a.ok(!shown('[data-symbol]').includes('s'));
 a.equal(d.getElementById('periodic-link').hidden,false);
 const v=scope.value;d.querySelector('[data-symbol="Fe"]').click();
 a.equal(scope.value,v,'symbol click preserves selected subject');
 scope.value='organic';scope.dispatchEvent(new w.Event('change'));
 a.ok(shown('[data-q]').includes('Алканы'));
 a.ok(!shown('[data-q]').includes('Таблица Менделеева'));
 a.equal(d.getElementById('periodic-link').hidden,true);
 scope.value='all';scope.dispatchEvent(new w.Event('change'));
 a.ok(shown('[data-q]').includes('Ньютон')&&shown('[data-q]').includes('Пестициды'));
 w.close();
});
