/* STAGING ONLY. Syntax compatibility gate for old Safari / iOS 12.
 * Acorn ECMAScript 2018 is a conservative PARSER gate, NOT proof of real
 * Safari availability, API support, IndexedDB durability or UI correctness.
 * Reads local source only; no Firebase/network/user records.
 */
'use strict';
const assert=require('assert');
const fs=require('fs');
const path=require('path');
const acorn=require('acorn');
const root=path.resolve(__dirname,'../..');
function read(name){return fs.readFileSync(path.join(root,name),'utf8');}
function parse2018(src,name){
  assert.doesNotThrow(()=>acorn.parse(src,{ecmaVersion:2018,sourceType:'script',
    allowHashBang:false}),name+' uses syntax unsupported by the conservative Safari 12 gate');
}
function parseES5(src,name){
  assert.doesNotThrow(()=>acorn.parse(src,{ecmaVersion:5,sourceType:'script'}),
    name+' must remain ES5-compatible for older embedded browsers');
}
const html=read('index.html');
const scripts=Array.from(html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi));
let inline=0,files=0;
for(const s of scripts){
  const attrs=s[1],body=s[2],src=attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
  const type=attrs.match(/\btype\s*=\s*["']([^"']+)["']/i);
  if(type&&type[1]!=='text/javascript'&&type[1]!=='application/javascript'&&
     type[1]!=='module')continue;
  if(src){
    if(/^https?:\/\//i.test(src[1]))continue;
    const file=src[1].split('?')[0].split('#')[0];
    parse2018(read(file),file);files++;
  }else if(body.trim()){parse2018(body,'index.html inline script '+(++inline));}
}
assert.ok(files>=8,'Most production JS modules must be checked');
assert.ok(inline>=1,'Inline bootstraps must be parsed');
parse2018(read('sw.js'),'sw.js (service worker)');
const stage=[
  'rs-sync-core.js','rs-event-ids.js','rs-sync-journal.js',
  'rs-firestore-transport.js','rs-sync-http.js','rs-sync-controller.js',
  'rs-sync-cloud-read.js','rs-sync-local-adapter.js','rs-sync-shadow-idb.js',
  'rs-sync-shadow-reconcile.js','rs-sync-recovery-audit.js',
  'rs-v3-demo.js','rs-v3-public-catalog.js',
  'rs-sha256.js','rs-backup-plan.js',
  'rs-catalog-release.js','rs-admin-preview.js'
];
stage.forEach(file=>parseES5(read('staging/'+file),'staging/'+file));
// Exercise guard itself; newer syntax must be rejected as intended.
assert.throws(()=>acorn.parse('const a = value?.result ?? 0;',{
  ecmaVersion:2018,sourceType:'script'}));
assert.throws(()=>acorn.parse('const a=1;',{ecmaVersion:5,sourceType:'script'}));
console.log('PASS: '+files+' published JS files, '+inline+
  ' inline scripts, service worker and '+stage.length+
  ' ES5 staging modules pass Safari 12 conservative syntax gate');
