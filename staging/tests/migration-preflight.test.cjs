/* Synthetic-only two-backup preflight; no user data, Firebase, or network. */
'use strict';
const assert=require('assert'),fs=require('fs'),path=require('path');
const acorn=require('acorn'),base=path.join(__dirname,'..');
for(const name of ['rs-migration-preflight.js','migration-preflight-page.js'])
 acorn.parse(fs.readFileSync(path.join(base,name),'utf8'),{ecmaVersion:5});
const compare=require('../rs-migration-preflight.js').compare;
const auditor=require('../rs-personal-backup-audit.js');
const older={app:'Riveria Sanasto',version:1,created:'2026-11-02T17:00:00.000Z',
 scores:{TERM_SECRET:{seen:2,correct:1,wrong:1,learned:true}},
 userWords:[{id:'PRIVATE_WORD_ID',fi:'PRIVATE_FI',ru:'PRIVATE_RU',example:'SECRET_EXAMPLE'}],
 favorites:{TERM_SECRET:true},favoriteMeta:{TERM_SECRET:{updatedAt:1}},
 deletedWords:{DELETED_PRIVATE:123}};
const newer=JSON.parse(JSON.stringify(older));
newer.created='2026-11-03T17:00:00.000Z';
newer.scores.TERM_SECRET={seen:3,correct:2,wrong:1,learned:true};
newer.scores.NEW_SECRET={seen:1,correct:0,wrong:1,learned:false};
newer.userWords.push({id:'NEW_PRIVATE',fi:'PRIVATE_FI2',ru:'PRIVATE_RU2'});
newer.favorites.NEW_SECRET=true;
let x=compare(JSON.stringify(older),JSON.stringify(newer),auditor);
assert.equal(x.ok,true);
assert.equal(x.readyForMigration,false);
assert.equal(x.metrics.older.seen,2);
assert.equal(x.metrics.newer.seen,4);
assert.equal(x.metrics.differences.newWords,1);
assert.equal(x.metrics.differences.newFavorites,1);
for(const term of ['PRIVATE_WORD_ID','PRIVATE_FI','PRIVATE_RU','TERM_SECRET','SECRET_EXAMPLE','DELETED_PRIVATE'])
 assert.equal(JSON.stringify(x).includes(term),false,'Private content leaked');
let bad=JSON.parse(JSON.stringify(newer));
bad.scores.TERM_SECRET={seen:1,correct:1,wrong:0};
assert.equal(compare(older,bad,auditor).metrics.differences.decreasedCounters,1);
bad=JSON.parse(JSON.stringify(newer));bad.userWords.shift();
assert.equal(compare(older,bad,auditor).metrics.differences.removedWords,1);
bad=JSON.parse(JSON.stringify(newer));delete bad.deletedWords.DELETED_PRIVATE;
assert.equal(compare(older,bad,auditor).metrics.differences.removedDeletionMarkers,1);
bad=JSON.parse(JSON.stringify(newer));bad.scores.TERM_SECRET.seen=10;
assert.equal(compare(older,bad,auditor).ok,false,'Malformed counters block');
bad=JSON.parse(JSON.stringify(newer));bad.created=older.created;
assert.equal(compare(older,bad,auditor).ok,false,'Same date blocks');
bad=JSON.parse(JSON.stringify(newer));delete bad.favoriteMeta;
assert.equal(compare(older,bad,auditor).ok,false,'Missing metadata blocks');
bad=JSON.parse(JSON.stringify(newer));bad.userWords[0].example='EDITED_PRIVATE';
x=compare(older,bad,auditor);
assert.equal(x.metrics.differences.changedWords,1);
assert.ok(x.warnings.length>0);
assert.equal(compare('{not JSON',JSON.stringify(newer),auditor).ok,false);
const html=fs.readFileSync(path.join(base,'migration-preflight.html'),'utf8');
assert.match(html,/connect-src 'none'/);
assert.match(html,/script-src 'self'/);
assert.match(html,/noindex,nofollow/);
assert.doesNotMatch(html,/https?:\/\/|unsafe-eval/);
const page=fs.readFileSync(path.join(base,'migration-preflight-page.js'),'utf8');
assert.match(page,/FileReader/);
assert.doesNotMatch(page,/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage|indexedDB/);
console.log('PASS: private two-backup on-device preflight, conflicts and ES5');
