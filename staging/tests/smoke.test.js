/* Run locally after clone: node staging/tests/smoke.test.js
   This does NOT contact Firebase, Google, GitHub or real users. */
'use strict';
var assert=require('assert');
var fs=require('fs');
var path=require('path');
var vm=require('vm');
var core=require('../rs-sync-core.js');
var backup=require('../rs-backup-plan.js');
var admin=require('../rs-admin-preview.js');
var catalog=require('../rs-catalog-release.js');
var root=path.resolve(__dirname,'../..'),ctx={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'data.js'),'utf8'),ctx,{timeout:10000});
var terms=JSON.parse(JSON.stringify(ctx.window.RS_DATA.terms));
assert(terms.length>=1296,'Unexpected term deletion');
assert.strictEqual(catalog.uniqueTerms(terms),true);
assert.strictEqual(catalog.checkRelease(terms,terms.concat([{
  id:'T99999',fi:'testi-ilmaus',ru:'тестовое выражение',en:'test expression'
}])).safeToAutoPublish,true);
assert.strictEqual(catalog.checkRelease(terms,terms.slice(1)).safeToAutoPublish,false);
assert.strictEqual(catalog.checkDue(10000,0,false,true,6000),false);
assert.strictEqual(catalog.checkDue(10000,0,true,true,6000),true);
var baseline=core.legacyBaseline({
 T00001:{seen:2,correct:2,wrong:0,learned:true}
},[],{});
var one=core.event('E_1','D_1','answer','T00001',{correct:true},100);
var two=core.event('E_2','D_2','answer','T00001',{correct:false},101);
var folded=core.fold(baseline,[two,one,one]);
assert.strictEqual(folded.state.scores.T00001.seen,4);
assert.strictEqual(folded.state.scores.T00001.correct,3);
assert.strictEqual(folded.state.scores.T00001.wrong,1);
assert.strictEqual(folded.duplicates,1);
assert.strictEqual(core.nextQueue([one,two],['E_1']).length,1);
var staged=backup.planNewSnapshot('exampleUser','snapshot_20261102',baseline,1793650000000);
assert.strictEqual(staged.status,'PREPARED_NOT_UPLOADED');
assert.strictEqual(backup.fromRows(staged.rows,'exampleUser','snapshot_20261102').records,1);
assert.throws(function(){backup.fromRows(staged.rows,'anotherUser','snapshot_20261102');});
assert.strictEqual(admin.render({admin:false},{registered:100}),"");
assert(admin.render({admin:true},{registered:100}).indexOf('100')>=0);
assert(admin.render({admin:true},{catalogVersion:'<img src=x>'}).indexOf('<img')<0);
console.log('PASS: staging preflight, no network or production modifications');
