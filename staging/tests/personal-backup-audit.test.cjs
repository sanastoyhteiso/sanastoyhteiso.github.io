'use strict';
const assert=require('assert');
const audit=require('../rs-personal-backup-audit.js');
const scores={};
for(let i=0;i<236;i++){
  scores['T'+String(i+1).padStart(5,'0')]=i<138?
    {seen:i===0?2:1,correct:i===0?2:1,wrong:0,learned:true}:
    {seen:i<155?2:1,correct:0,wrong:i<155?2:1,learned:false};
}
const backup={app:'Riveria Sanasto',version:1,created:'2026-11-02T22:00:00Z',
  scores,userWords:[{id:'SELF_PRIVATE',fi:'PRIVATE_CONTENT',ru:'PRIVATE_CONTENT'}],
  favorites:{T00001:true},favoriteMeta:{},deletedWords:{}};
const reference={seen:254,correct:139,wrong:115,termsWithCorrectAnswer:138};
let r=audit.check(backup,reference);
assert.equal(r.ok,true);assert.deepEqual(r.warnings,[]);
assert.equal(r.metrics.scoredTerms,236);assert.equal(r.metrics.seen,254);
assert.equal(r.metrics.correct,139);assert.equal(r.metrics.wrong,115);
assert.equal(r.metrics.termsWithCorrectAnswer,138);
assert.equal(r.metrics.favoriteTerms,1);assert.equal(r.metrics.userWords,1);
assert.equal(r.readyForMigration,false);
assert.equal(JSON.stringify(r).includes('PRIVATE_CONTENT'),false);
const modified=JSON.parse(JSON.stringify(backup));
modified.scores.T00001.learned=false;
r=audit.check(modified,reference);
assert.equal(r.ok,true);assert.ok(r.warnings.some(s=>s.indexOf('learned flags')!==-1));
modified.scores.T00001.seen=7;
r=audit.check(modified,reference);
assert.equal(r.ok,false);assert.ok(r.errors.some(s=>s.indexOf('mismatch')!==-1));
modified.userWords.push({...modified.userWords[0]});
r=audit.check(modified,reference);
assert.equal(r.ok,false);assert.ok(r.errors.some(s=>s.indexOf('Duplicate')!==-1));
assert.equal(audit.check('not-json').ok,false);
assert.equal(audit.check({app:'unrelated'}).ok,false);
console.log('PASS: 267-row historical aggregate compatibility; personal JSON never uploaded or displayed');
