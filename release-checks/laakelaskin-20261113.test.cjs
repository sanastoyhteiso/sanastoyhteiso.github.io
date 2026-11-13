'use strict';
/* RUN-20261113: offline medicine-calculation study helper. */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const core=fs.readFileSync('laakelaskin-core.js','utf8');
const calc=fs.readFileSync('laakelaskin.html','utf8');
const training=fs.readFileSync('laakelaskut.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const ctx={};
vm.runInNewContext(core,ctx,{filename:'laakelaskin-core.js'});
const C=ctx.RS_MED_CALC;
function approx(a,b){assert.ok(Math.abs(a-b)<=1e-9,'expected '+b+', got '+a);}
test('expression parser supports decimals, parentheses, signs, and rejects invalid input',()=>{
 approx(C.expression('2,5 × (1000 ÷ 4)'),625);
 approx(C.expression('1200 × 20 ÷ (4 × 60)'),100);
 approx(C.expression('-(10 - 15)'),5);
 assert.throws(()=>C.expression('1/0'),/Деление/);
 assert.throws(()=>C.expression('alert(1)'),/Проверьте/);
});
test('unit conversions never infer mass to volume or IU to mg',()=>{
 approx(C.convert('0,75','g','mcg'),750000);
 approx(C.convert('2,5','dl','ml'),250);
 approx(C.convert('200','ml','l'),.2);
 approx(C.convert('1,5','h','min'),90);
 approx(C.convert('500','mg','kg'),.0005);
 assert.throws(()=>C.convert(1,'g','l'),/Несовместимые/);
 assert.throws(()=>C.convert(1,'IU','mg'),/Несовместимые/);
});
test('tablet, liquid, body weight, infusion, drops and concentration formulas',()=>{
 approx(C.solve('tablet',{dose:'0,75',doseUnit:'g',strength:'250',strengthUnit:'mg'}).value,3);
 approx(C.solve('liquid',{dose:'120',doseUnit:'mcg',strength:'0,2',strengthUnit:'mg'}).value,.6);
 approx(C.solve('amount',{volume:'2,5',strength:'1,25'}).value,3.125);
 const weighted=C.solve('weight',{rate:'25',doseUnit:'mcg',weight:'60',doses:'1',strength:'2',strengthUnit:'mg'});
 approx(weighted.value,1500);approx(weighted.extra.value,.75);
 approx(C.solve('infusion',{volume:'500',time:'1,5'}).value,500/1.5);
 approx(C.solve('drops',{volume:'1000',factor:'20',time:'720'}).value,1000*20/720);
 approx(C.solve('dropVolume',{rate:'30',factor:'20',time:'90'}).value,135);
 approx(C.solve('stock',{total:'28',each:'2',times:'2'}).value,7);
 const mix=C.solve('mix',{strength:'50',strengthUnit:'mcg',volume:'10',final:'50',speed:'2'});
 approx(mix.value,10);approx(mix.extra.value,20);
 approx(C.solve('percent',{percent:'0,25'}).value,2.5);
 assert.throws(()=>C.solve('tablet',{dose:10,strength:0}),/положительное/);
 assert.throws(()=>C.solve('liquid',{dose:1,doseUnit:'IU',strength:2,strengthUnit:'mg'}),/Несовместимые/);
});
test('full-screen overlay does not change exercise state and safely validates messages',()=>{
 assert.match(training,/id="open-laskin"/);
 assert.match(training,/id="calc-layer"/);
 assert.match(training,/calc-layer\.maximized/);
 assert.match(training,/height:100dvh/);
 assert.match(training,/e\.origin!==window\.location\.origin/);
 assert.match(training,/e\.source!==frame\.contentWindow/);
 assert.match(training,/RS_LAAKELASKIN_ANSWER/);
 assert.match(training,/document\.getElementById\('response'\)/);
 assert.match(training,/laakelaskin\.html\?v=20261113-1/);
 assert.match(training,/function reset\(/,'trainer controller preserved');
});
test('standalone calculator has keypad and ten templates, educational warning, no backend',()=>{
 assert.match(calc,/id="keys"/);
 for(const id of ['tablet','liquid','amount','weight','infusion','drops','dropVolume','stock','mix','percent'])
  assert.match(calc,new RegExp('value="'+id+'"'));
 assert.match(calc,/Только для учёбы/);
 assert.doesNotMatch(calc,/firebase|fetch\(/i);
 const inline=calc.match(/<script>\s*([\s\S]*?)<\/script>/);
 assert.ok(inline);
 assert.doesNotThrow(()=>new vm.Script(inline[1]));
 assert.doesNotThrow(()=>new vm.Script(core));
});
test('both calculator files use versioned offline cache entries',()=>{
 assert.match(sw,/laakelaskin\.html/);
 assert.match(sw,/laakelaskin-core\.js\?v=20261113-1/);
 assert.match(sw,/laakelaskut\.html/);
 assert.match(sw,/v3\.0\.0-rc43/);
});
