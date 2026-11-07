'use strict';
// RUN-039: offline syntax regression for a conservative Safari 12 baseline.
// Static ECMAScript 2018 parse only: does NOT prove iOS 12 runtime support.
// No Firebase, network, browser cookies or private learner data.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const acorn=require('acorn');
const root=process.cwd();
function parse(source,label,shouldPass=true){
  try{
    acorn.parse(source,{ecmaVersion:2018,sourceType:'script',allowHashBang:false});
    if(!shouldPass)throw Error('Parser accepted an unsupported fixture: '+label);
  }catch(e){
    if(!shouldPass && !String(e.message).startsWith('Parser accepted'))return;
    throw Error('iOS12 syntax check failed in '+label+': line '+(e.loc&&e.loc.line||'?')+
      ', column '+(e.loc&&e.loc.column||'?')+' ('+e.message+')');
  }
}
parse('var x={a:1}; var y=x.a;','plain ES5');
parse('async function example(){await Promise.resolve(1)}','ES2017 baseline');
for(const bad of [
  'var x={}; x?.name;', 'var x=null; x ?? 1;', 'var x=0; x ||= 2;',
  'class X { #secret=1 }'
]){
  parse(bad,'unsupported fixture',false);
}
const html=fs.readFileSync('index.html','utf8');
const tag=/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
const local=new Set(),inline=[],external=[];
let match;
while((match=tag.exec(html))!==null){
  const attr=match[1]||'',body=match[2]||'';
  const type=attr.match(/\btype\s*=\s*['"]([^'"]+)['"]/i);
  if(type&&!/^(?:text\/javascript|application\/javascript|module)$/i.test(type[1]))continue;
  const src=attr.match(/\bsrc\s*=\s*['"]([^'"]+)['"]/i);
  if(src){
    const full=src[1];
    if(/^https?:\/\//i.test(full)||/^\/\//.test(full)){external.push(full);continue;}
    const file=full.split(/[?#]/)[0].replace(/^\.\//,'');
    if(!/^[A-Za-z0-9._/-]+$/.test(file)||file.startsWith('/')||file.includes('..'))
      throw Error('Unsafe local script source path');
    local.add(file);
  }else if(body.trim())inline.push(body);
}
assert.ok(local.size>=12,'Expected complete local UI/SW script references');
for(const critical of ['family.js','app.js','community.js','v3-sync-engine.js',
  'v3-sync-release.js','v3-sync-core.js','v3-sync-finds.js']){
  assert.ok(local.has(critical),'Critical UI script missing: '+critical);
}
local.add('sw.js');
for(const file of local){
  const pathname=path.resolve(root,file);
  assert.ok(pathname.startsWith(root+path.sep),'Unsafe source path');
  const src=fs.readFileSync(pathname,'utf8');
  parse(src,file);
}
inline.forEach((source,i)=>parse(source,'index.html:inline['+(i+1)+']'));
assert.ok(inline.length>=1,'Expected original HTML inline login/i18n code');
console.log('PASS RUN-039 conservative ES2018 parse:',local.size,
  'local JS files,',inline.length,'inline scripts; external CDN excluded;',
  external.length,'remote scripts must be reviewed separately. Physical iOS12 still OPEN.');
