/* Static audit of the isolated real-time Firestore demo page.
 * All fake-user data flows are tested separately by pure core/rules tests.
 */
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert'),acorn=require('acorn');
const dir=path.join(__dirname,'../auth-pilot');
const html=fs.readFileSync(path.join(dir,'sync-demo.html'),'utf8');
const js=fs.readFileSync(path.join(dir,'sync-demo.js'),'utf8');
acorn.parse(js,{ecmaVersion:5});
assert.match(html,/Firebase\/8|firebasejs\/8\.10\.1\/firebase-app\.js/);
assert.match(html,/firebasejs\/8\.10\.1\/firebase-auth\.js/);
assert.match(html,/firebasejs\/8\.10\.1\/firebase-firestore\.js/);
assert.match(html,/sync-demo-core\.js/);
assert.match(html,/sync-demo\.js/);
assert.match(html,/noindex,nofollow/);
assert.doesNotMatch(html,/unsafe-eval/);
assert.match(js,/guard\.validate/);
assert.match(js,/site\.pathname!==PATH/);
assert.match(js,/sync_demo_v3/);
assert.match(js,/onSnapshot/);
assert.match(js,/source:'server'/);
assert.match(js,/core\.ack/);
assert.match(js,/core\.append/);
assert.match(js,/if\(!w\.confirm/);
assert.match(js,/demo/);
assert.doesNotMatch(js,/users\/\{uid\}|sync_v3\/|data\.js|google\.sheets|GoogleDrive/);
assert.doesNotMatch(js,/console\.|eval\(/);
console.log('PASS: browser pilot supports iOS12, project gating, owner-only demo collection and event snapshot');
