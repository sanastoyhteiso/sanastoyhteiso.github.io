'use strict';
const assert=require('assert'),fs=require('fs');
const files=['staging/firestore-readonly-check.html','staging/local-backup-check.html'];
for(const file of files){
  const html=fs.readFileSync(file,'utf8');
  const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .map(m=>m[1]).filter(x=>x.trim());
  assert.equal(scripts.length,1,'Expected exactly one inline bootstrap '+file);
  assert.doesNotThrow(()=>new Function(scripts[0]),'Invalid old-Safari bootstrap '+file);
  assert.equal(/\bfetch\s*\(|\bsendBeacon\s*\(|\bWebSocket\b/.test(html),false);
  assert.equal(/\blocalStorage\.setItem\s*\(/.test(html),false);
}
const audit=fs.readFileSync('staging/local-backup-check.html','utf8');
assert.ok(audit.includes('reader.readAsText(f'));
assert.equal(/XMLHttpRequest/.test(audit),false);
const firestore=fs.readFileSync('staging/firestore-readonly-check.html','utf8');
assert.ok(firestore.includes("x.open('GET',url,true)"));
assert.ok(firestore.includes("if(method!=='GET'"));
assert.equal(/x\.open\(['"](POST|PATCH|PUT|DELETE)/.test(firestore),false);
console.log('PASS: test pages compile; personal backup cannot upload; Firestore page GET-only');
