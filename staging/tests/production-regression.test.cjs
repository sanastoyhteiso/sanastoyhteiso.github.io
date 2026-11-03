/* STAGING-ONLY static regression guard for the CURRENT published app.
 * NEVER opens a browser, sends requests, touches a real account or edits files.
 * Detects accidental script/module omissions during future migration work.
 */
'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.resolve(__dirname,'../..');
const file=name=>fs.readFileSync(path.join(root,name),'utf8');
const html=file('index.html');
const names=['cards','practice','dictionary','mediatri','add','libraries','users','backup'];
for(const name of names){
  assert.ok(html.includes('data-view="'+name+'"'),'Missing visible module '+name);
}
const localeOptions=['fi','en','ru'];
for(const language of localeOptions){
  assert.ok(html.includes('data-login-lang="'+language+'"'),'Missing login language '+language);
  assert.ok(html.includes('<option value="'+language+'">'),'Missing UI language '+language);
}
const matches=Array.from(html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi));
assert.ok(matches.length>=8,'Unexpected production script list');
let localScripts=0;
for(const match of matches){
  const src=match[1];
  if(/^https?:\/\//i.test(src))continue;
  const normalized=decodeURIComponent(src.split('?')[0].split('#')[0]);
  assert.ok(!normalized.startsWith('/')&&!normalized.includes('..'),
    'Unsafe local script path '+normalized);
  assert.ok(!normalized.startsWith('staging/'),'Unapproved staging module on the live site');
  assert.ok(fs.existsSync(path.join(root,normalized)),'Missing loaded module '+normalized);
  assert.doesNotThrow(()=>new vm.Script(file(normalized),{filename:normalized}),
    'Broken production JavaScript syntax in '+normalized);
  localScripts++;
}
assert.ok(localScripts>=7,'Unexpected loss of production scripts');
for(const required of ['app.js','family.js','community.js','data.js']){
  assert.ok(matches.some(m=>m[1].split('?')[0]===required),
    'Required active module not loaded: '+required);
}
const context={window:{}};
vm.runInNewContext(file('data.js'),context,{timeout:15000});
const data=context.window.RS_DATA;
assert.ok(data&&Array.isArray(data.terms));
const groups=[
  ['terms',1296],['phrases',84],['mediatri',183],
  ['keyterms',212],['scenarios',40],['headings',21]
];
for(const [name,min] of groups){
  assert.ok(Array.isArray(data[name]),'Missing public dictionary section '+name);
  assert.ok(data[name].length>=min,
    'Unexpected loss of '+name+': '+data[name].length+' < '+min);
}
const termIds=new Set();
for(const item of data.terms){
  assert.ok(item&&/^T[0-9]{5,}$/.test(item.id),'Malformed term ID');
  assert.ok(!termIds.has(item.id),'Duplicate term ID '+item.id);
  termIds.add(item.id);
  for(const code of ['fi','ru','en']){
    assert.ok(typeof item[code]==='string'&&item[code].trim(),
      'Missing '+code+' translation for '+item.id);
  }
}
const app=file('app.js');
for(const feature of ['renderCards','renderQuiz','renderDict','renderMediatri',
  'renderBackup','renderLearned','rs:datachange','rs_scores_v1',
  'rs_user_words_v1','rs_favorites_v1']){
  assert.ok(app.includes(feature),'Missing app feature '+feature);
}
assert.ok(file('community.js').includes('Google Drive'),
  'Legacy progress sync was unexpectedly removed before safe migration');
assert.ok(file('family.js').includes('getToken'),
  'Existing Firebase auth token accessor was unexpectedly removed');
console.log('PASS: live app static modules, FI/RU/EN login, 1296 terms + extra catalog, no staging injection');
