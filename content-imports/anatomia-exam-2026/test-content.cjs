'use strict';
// Read-only validation for the DRAFT exam vocabulary pack.
// Requires only Node built-ins; does not read or write any account/cloud data.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const here=__dirname;
const read=(p)=>fs.readFileSync(path.join(here,p),'utf8');
const data=JSON.parse(read('EXAM_VOCAB_10_TOPICS_289.json'));
const selection=JSON.parse(read('EXAM_TERM_SELECTION.json'));
const latin=JSON.parse(fs.readFileSync(path.join(here,'../anatomia-latina/anatomia_latin_fi_ru_en_61.json'),'utf8'));
const original=fs.readFileSync(path.join(here,'../../data.js'));
const contents=original.toString('utf8');
const old=JSON.parse(contents.slice(contents.indexOf('{'),contents.lastIndexOf('}')+1));
const lookup=new Map(old.terms.map(x=>[x.id,x]));
const norm=s=>String(s).trim().normalize('NFKC').toLocaleLowerCase('fi-FI');
const records=data.records;
const sameLatin=new Map(latin.records.map(x=>[norm(x.fi),x.la]));
test('source main blob and existing library IDs remain unchanged',()=>{
 const prefix=Buffer.from('blob '+original.length+'\0');
 const sha=crypto.createHash('sha1').update(prefix).update(original).digest('hex');
 assert.equal(sha,data.base_data_blob_sha);
 assert.equal(sha,selection.source_sha);
 assert.equal(old.terms.length,1296);
 assert.equal(new Set(old.terms.map(x=>x.id)).size,1296);
});
test('exact 10 requested chapters and balanced per-topic counts',()=>{
 assert.equal(selection.topic_boundaries.length,10);
 assert.equal(data.summary.total,289);
 assert.deepEqual(data.summary.perTopic.map(x=>x.total),[41,8,51,12,34,25,24,46,16,32]);
 assert.equal(data.summary.perTopic.reduce((s,x)=>s+x.total,0),289);
 const chapters=new Set(records.map(x=>x.exam_topic));
 assert.deepEqual([...chapters].sort(),selection.topic_boundaries.map(x=>x.id));
});
test('246 existing records retain original FI, ID, RU and EN',()=>{
 const existing=records.filter(x=>x.existing_id!==null);
 assert.equal(existing.length,246);
 for(const x of existing){
  const orig=lookup.get(x.existing_id);
  assert.ok(orig,x.existing_id);
  assert.equal(x.fi,orig.fi);
  assert.equal(x.ru,orig.ru);
  assert.equal(x.en,orig.en);
  assert.equal(x.record_type,'enrich-existing');
 }
 assert.equal(new Set(existing.map(x=>x.existing_id)).size,246);
});
test('43 new FI entries have no ID and do not duplicate existing dictionary',()=>{
 const novel=records.filter(x=>x.existing_id===null);
 assert.equal(novel.length,43);
 assert.equal(novel.filter(x=>x.record_type==='PR16-candidate').length,24);
 assert.equal(novel.filter(x=>x.record_type==='exam-core-candidate').length,19);
 const mainFI=new Set(old.terms.map(x=>norm(x.fi)));
 for(const x of novel){assert.equal(x.existing_id,null);assert.equal(mainFI.has(norm(x.fi)),false,x.fi);}
 assert.equal(new Set(records.map(x=>norm(x.fi))).size,289);
});
test('all selected words have complete FI and RU explanations',()=>{
 for(const x of records){
   assert.ok(x.fi&&x.ru&&x.en,x.fi);
   assert.ok(x.explanationFi.length>=40,x.fi);
   assert.ok(x.explanationRu.length>=40,x.fi);
   assert.equal(/<script|<iframe|javascript:/i.test(x.explanationFi+x.explanationRu),false,x.fi);
   assert.ok(x.latin_status==='study_hint'||x.latin_status==='no_unambiguous_anatomical_term');
   assert.equal(Boolean(x.latin),x.latin_status==='study_hint');
 }
 assert.equal(records.filter(x=>x.latin).length,270);
 assert.equal(records.filter(x=>!x.latin).length,19);
});
test('61 user-supplied Latin mappings remain intact in our 289 records',()=>{
 const rmap=new Map(records.map(x=>[norm(x.fi),x]));
 assert.equal(latin.records.length,61);
 for(const x of latin.records){const got=rmap.get(norm(x.fi));assert.ok(got,x.fi);assert.equal(got.latin,x.la,x.fi);}
});
test('EI exclusions, blood groups, skin receptors and reproduction not imported',()=>{
 const disallowed=new Set(selection.explicitly_excluded.map(x=>x.id));
 for(const x of records){
  assert.equal(x.existing_id!==null&&disallowed.has(x.existing_id),false,x.fi);
  assert.equal(/^(Sairaudet:|Anatomia: Lisääntymiselimistö)/.test(x.category),false,x.fi);
  assert.equal(/veriryhmä|virtsaamisheijaste|ihon aistinelimet/i.test(x.fi),false,x.fi);
 }
 assert.equal(selection.exclusions.length,4);
});
test('CSV is UTF8-BOM and contains 289 data records, with no multiline cells',()=>{
 const csv=fs.readFileSync(path.join(here,'EXAM_VOCAB_10_TOPICS_289.csv'),'utf8');
 assert.equal(csv[0],'\uFEFF');
 const rows=csv.slice(1).trim().split('\r\n');
 assert.equal(rows.length,290);
 assert.ok(rows[0].includes('explanationFi')&&rows[0].includes('explanationRu'));
});
test('main source/PR9/production have no modification from this validator',()=>{
 const self=read('test-content.cjs');
 for(const x of [/writeFileSync\s*\(/,/unlinkSync\s*\(/,/fetch\s*\(/,/setCustomUserClaims\s*\(/,/require\s*\(\s*['\"]firebase-admin['\"]\s*\)/,/require\s*\(\s*['\"]child_process['\"]\s*\)/])
   assert.equal(x.test(self),false,String(x));
 assert.equal(data.status,'CONTENT_READY_DRAFT_NOT_DEPLOYED');
});
