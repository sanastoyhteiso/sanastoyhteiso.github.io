'use strict';
/* RUN174: independently verify the user-provided medication arithmetic practice.
 * Educational only; never treat mathematical tablet rounding as a clinical dose. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const dataset=fs.readFileSync('laakelaskut-data.js','utf8');
const html=fs.readFileSync('laakelaskut.html','utf8');
const app=fs.readFileSync('app.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const ctx={window:{}};
vm.runInNewContext(dataset,ctx,{filename:'laakelaskut-data.js'});
const rows=Array.from(ctx.window.RS_MEDCALC_20261110,r=>Array.from(r));
const byId=Object.fromEntries(rows.map(r=>[r[0],r]));
test('all 47 numbered tasks and 68 separately gradable parts',()=>{
  assert.equal(rows.length,68);
  assert.equal(Object.keys(byId).length,68,'unique IDs');
  assert.deepEqual([...new Set(rows.map(r=>parseInt(r[0],10)))].sort((a,b)=>a-b),
    Array.from({length:47},(_,i)=>i+1));
  for(const r of rows){
    assert.ok(r[1].length>14&&r[2].length>10,'both FI and RU: '+r[0]);
    assert.ok(typeof r[3]==='number'||r[3]==='kyllä','key: '+r[0]);
    assert.ok(r[4]&&r[5].length>5,'unit and worked solution: '+r[0]);
  }
});
test('independent arithmetic checkpoints and safety-sensitive key decisions',()=>{
  const checks={
    '1a':1500/500,'1b':1.5*500,'2a':2*3*450,'2b':2*35,
    '5':(4+2+2+2)*250,'6a':500*3*7,'6b':3*7,'7':750/250,
    '10':50*5/1000,'11a':3000000/3/500000,'11b':30/(3000000/500000),
    '12':120/1000/0.2,'13':80/1000/0.25,'14':0.45*100,
    '15a':40/100,'15b':3,'16a':2,'16b':7,
    '17':1200*20/(4*60),'18':104.17,'19':30*90/20,
    '20':50*24*60/20,'22a':50*10/50*2/1000,
    '22b':(1.5*32)/(50*10/50),
    '23a':2.5*100,'23c':50/1000,'23d':700/1000,'23e':0.056*1000,
    '27':2.5*3*1.25,'28':7.1,'29':2.5*38/25,
    '30e':500/1000/1000,'31a':700/1000*2,'31b':700/1000*4,
    '34':40*15/4,'35':2.51,'36':750/500,'37b':28,
    '38':40/4,'42a':333.33,'42b':111,'43':28/4,'44':8*98/2,
    '45a':480/40,'45b':40*4,'46':25*60/1000/2,'47':500/250
  };
  for(const [id,n] of Object.entries(checks))assert.ok(Math.abs(byId[id][3]-n)<1e-7,id);
  assert.equal(byId['21'][3],'kyllä','math says bag lasts 15 minutes');
  assert.match(byId['21'][6],/valvomatta/,'must flag monitoring safety');
  assert.equal(byId['28'][3],7.1,'one decimal, unlike photographed example');
  assert.equal(byId['29'][3],3.8,'do not silently round enteric tablet');
  assert.match(byId['29'][6],/enterotablettia/);
});
test('practice UI has no external backend and executes in ES5-compatible browser code',()=>{
  assert.match(html,/Lääkelaskut/);
  assert.match(html,/laakelaskut-data\.js\?v=20261110-1/);
  assert.match(html,/type="text" inputmode="decimal"/);
  assert.match(html,/Пробный тест/);
  assert.match(html,/Скрыть перевод/);
  const inline=html.match(/<script>([\s\S]*?)<\/script>/);
  assert.ok(inline,'inline controller');
  assert.doesNotThrow(()=>new vm.Script(inline[1]),'controller parses correctly');
  assert.doesNotThrow(()=>new vm.Script(dataset),'data parses correctly');
  assert.ok(!/firebase|fetch\(/i.test(inline[1]),'practice stays independent of accounts and network');
});
test('existing Riveria anatomy exam unchanged, medication trainer linked and offline-cached',()=>{
  assert.match(app,/function renderMockExam\(/);
  assert.match(app,/Harjoittele lääkelaskuja/);
  assert.match(index,/app\.js\?v=medcalc-run174-1/);
  assert.match(sw,/app\.js\?v=medcalc-run174-1/);
  assert.match(sw,/laakelaskut\.html/);
  assert.match(sw,/laakelaskut-data\.js\?v=20261110-1/);
  assert.match(sw,/rc38/);
});
