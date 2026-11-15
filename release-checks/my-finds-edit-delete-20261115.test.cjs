'use strict';
/* 2026-11-15: reversible, owner-scoped personal-word revisions.
 * Immutable events use already-deployed word_upsert + collection_set fields.
 * No live account/network or patient data. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const core=require('../v3-sync-core.js');
const engine=require('../v3-sync-engine.js');
const shadow=require('../v3-sync-shadow.js');
const release=fs.readFileSync('v3-sync-release.js','utf8');
const app=fs.readFileSync('app.js','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const id='W_'+'a'.repeat(32),device='D_'+'b'.repeat(32);
const eid=n=>'E_'+n.toString(16).padStart(32,'0');
function ev(n,fi,ru,catRu){
 return core.event(eid(n),device,'word_upsert',id,{
  id,fi,ru,en:'',cat:'Omat sanat',catRu,updatedAt:n
 },n);
}
test('edit corrects Finnish and Russian in place, retains identity and immutable history',()=>{
 const first=ev(100,'virhe suomeksi','неверный перевод','Мои слова');
 const correction=ev(200,'oikea sana','верное значение','Мои слова|edit:'+first.id);
 const out=core.fold({},[first,correction]);
 assert.equal(out.applied,2);
 assert.equal(Object.keys(out.state.words).length,1);
 assert.equal(out.state.words[id].fi,'oikea sana');
 assert.equal(out.state.words[id].ru,'верное значение');
 assert.equal(out.state.words[id]._revision,correction.id);
 assert.equal(out.state.words[id].catRu,'Мои слова');
 assert.equal(out.state.words[id].deleted,false);
 const replay=core.fold({},[first,correction]);
 assert.deepEqual(replay.state,out.state);
});
test('stale edit / unauthorized edit without parent fail closed',()=>{
 const first=ev(100,'first','один','Мои слова');
 const updated=ev(200,'second','два','Мои слова|edit:'+first.id);
 const stale=ev(300,'third','три','Мои слова|edit:'+first.id);
 assert.throws(()=>core.fold({},[first,updated,stale]),/revision/);
 assert.throws(()=>core.fold({},[first,ev(300,'third','три','Мои слова')]),/Conflicting definitions/);
 assert.throws(()=>core.fold({},[ev(200,'changed','другое','Мои слова|edit:'+first.id)]),/revision/);
 assert.throws(()=>core.fold({},[first,ev(300,'changed','другое','Мои слова|edit:E_wrong')]),/Malformed/);
});
test('delete uses a revisioned tombstone: no resurrection on re-fetch',()=>{
 const first=ev(100,'turha sana','лишнее слово','Мои слова');
 const del=ev(200,'turha sana','лишнее слово','Мои слова|delete:'+first.id);
 const state=core.fold({},[first,del]).state;
 assert.equal(state.words[id].deleted,true);
 assert.equal(state.words[id]._revision,del.id);
 assert.equal(Object.keys(state.words).length,1,'restore must preserve tombstone');
 assert.doesNotThrow(()=>shadow.snapshot(state));
 const again=core.fold({},[first,del]).state;
 assert.deepEqual(again,state);
 // Another initial upsert cannot override the deletion.
 assert.equal(core.fold({},[first,del,ev(300,'turha sana','лишнее слово','Мои слова')]).state.words[id].deleted,true);
});
test('explicit restore requires the deletion revision, removes tombstone',()=>{
 const first=ev(100,'sana','слово','Мои слова');
 const del=ev(200,'sana','слово','Мои слова|delete:'+first.id);
 const restore=ev(300,'sana','исправленное слово','Мои слова|edit:'+del.id);
 const out=core.fold({},[first,del,restore]);
 assert.equal(out.state.words[id].deleted,false);
 assert.equal(out.state.words[id].ru,'исправленное слово');
 assert.equal(out.state.words[id]._revision,restore.id);
});
test('no public shared word can be revised using a private-word marker',()=>{
 const bad=core.event(eid(1),device,'word_upsert','T00001',{
  id:'T00001',fi:'abc',ru:'def',en:'',cat:'Omat sanat',
  catRu:'Мои слова|edit:'+eid(2),updatedAt:1
 },1);
 assert.throws(()=>core.fold({},[bad]),/revision/);
});
test('the current browser uses a real editor and separate semantic remove/delete actions',()=>{
 assert.match(release,/function updateOwnWord\(/);
 assert.match(release,/function deleteOwnWord\(/);
 assert.match(release,/function drawSaved\(/);
 assert.match(release,/Сохранить исправления/);
 assert.match(release,/Убрать из находок/);
 assert.match(release,/Удалить слово/);
 assert.match(release,/item\.deleted/);
 assert.match(release,/privateWord\(/);
 assert.match(app,/id="edit-word-form"/);
 assert.match(app,/data-action="edit-word"/);
 assert.match(app,/function deleteLegacyWord\(/);
 assert.match(app,/window\.RS_V3_RELEASE\.renderFinds\(root\)/);
 assert.match(sw,/v3-sync-core\.js\?v=word-edit-20261115-1/);
 assert.match(sw,/v3-sync-engine\.js\?v=word-edit-20261115-1/);
 assert.match(sw,/v3-sync-release\.js\?v=word-edit-20261115-1/);
});
