/* Static and syntax safety checks for isolated V3 profile pilot.
 * No Firebase connections or real profile writes.
 */
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert'),acorn=require('acorn');
const base=path.join(__dirname,'../auth-pilot');
const html=fs.readFileSync(path.join(base,'profile.html'),'utf8');
const script=fs.readFileSync(path.join(base,'profile-pilot.js'),'utf8');
acorn.parse(script,{ecmaVersion:5});
assert.match(html,/sanastoyhteiso-v3-development/);
assert.match(html,/firestore\.googleapis\.com/);
assert.match(html,/firebase-firestore-compat\.js/);
assert.match(html,/profile-contract\.js/);
assert.match(html,/profile-store\.js/);
assert.match(html,/profile-pilot\.js/);
assert.match(html,/noindex,nofollow/);
assert.match(html,/connect-src/);
assert.doesNotMatch(html,/unsafe-eval|unsafe-hashes/);
assert.match(script,/guard\.validate/);
assert.match(script,/site\.pathname!==PATH/);
assert.match(script,/client\.read\(\)/);
assert.match(script,/client\.ensureRegistered\(\)/);
assert.match(script,/addEventListener\('click',function\(\)/);
assert.match(script,/get\(\{source:'server'\}\)/);
assert.match(script,/permission-denied/);
assert.match(script,/synthetic|SYNTHETIC/i);
assert.doesNotMatch(script,/setItem|localStorage|sessionStorage|console\./);
assert.doesNotMatch(script,/\.add\(|\.delete\(|\.set\(|\.update\(/);
assert.doesNotMatch(script,/firebase\.initializeApp\(/);
assert.doesNotMatch(script,/riveria-sanasto-community-test\/users/);
console.log('PASS: isolated, button-gated v3 profile pilot, server denial read and ES5 syntax');
