/* All synthetic vocabulary; does not read a user dictionary or Firebase. */
'use strict';
const assert=require('assert'),fs=require('fs'),crypto=require('crypto'),acorn=require('acorn');
const finder=require('../auth-pilot/study-v3-finds.js');
const sha=require('../rs-sha256.js');
acorn.parse(fs.readFileSync('staging/auth-pilot/study-v3-finds.js','utf8'),{ecmaVersion:5});
const publicWord={id:'T00001',fi:'Peseytyminen',ru:'умывание'};
const oldPersonal={id:'W_'+'a'.repeat(32),fi:' PESEYTYMINEN ',ru:'личная редакция'};
const inflected={id:'T00002',fi:'peseytymisessä',ru:'при мытье'};
const other={id:'T00003',fi:'syöminen',ru:'приём пищи'};
const entries=[oldPersonal,inflected,publicWord,other];
assert.equal(finder.normalize('   PESEYTYMINEN.   '),'peseytyminen');
assert.equal(finder.normalize('KÄSI'),'käsi');
assert.notEqual(finder.normalize('käsi'),finder.normalize('kasi'),'Finnish vowels are distinct');
assert.deepEqual(finder.matching(entries,'PESEYTYMINEN').exact.map(x=>x.id),
 ['T00001','W_'+'a'.repeat(32)],'Public ID preferred to existing personal clone');
assert.equal(finder.matching(entries,'peseytymisessä').exact[0].id,'T00002');
assert.ok(finder.matching(entries,'peseytymisessä').similar.some(x=>x.id==='T00001'),
 'Related inflected form may be suggested but never auto-merged');
assert.equal(finder.matching(entries,'tuntematon').exact.length,0);
assert.equal(finder.matching(entries,'').similar.length,0);
(async()=>{
 const a=await finder.personalId('sameOwner','Testihoiva',sha,crypto.webcrypto);
 const b=await finder.personalId('sameOwner','  TESTIHOIVA ',sha,crypto.webcrypto);
 const c=await finder.personalId('otherOwner','Testihoiva',sha,crypto.webcrypto);
 assert.match(a,/^W_[a-f0-9]{32}$/);
 assert.equal(a,b,'Two devices use one stable identity for the same owner/lemma');
 assert.notEqual(a,c,'Different accounts derive distinct IDs');
 await assert.rejects(()=>finder.personalId('x','',sha,crypto.webcrypto),/identity/);
 await assert.rejects(()=>finder.personalId('x','word',sha,{}),/SHA-256 unavailable/);
 console.log('PASS: FI exact lookup, inflection suggestions, stable per-owner SHA-256 IDs, ES5');
})().catch(e=>{console.error(e);process.exitCode=1;});
