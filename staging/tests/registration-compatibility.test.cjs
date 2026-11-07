/* Staging-only safeguard: registration must survive the v3 cutover.
 * These tests read the exact currently published app but NEVER modify it.
 */
'use strict';
const assert=require('assert');
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../..');
const read=pathPart=>fs.readFileSync(path.join(root,pathPart),'utf8');
const html=read('index.html'),auth=read('family.js'),profile=read('account-settings.js');
assert.ok(html.includes('id="family-gate"'),'Existing Google entry screen must remain available in production');
assert.ok(html.includes('id="family-submit"'),'Registration/login button must remain');
assert.ok(/firebase\.auth\.GoogleAuthProvider/.test(auth),'Existing Google sign-in must remain');
assert.ok(/auth\.signInWithPopup\(provider\)/.test(auth),'Current Google account registration is preserved');
assert.ok(/auth\.onAuthStateChanged/.test(auth),'Firebase must restore a signed-in user');
assert.ok(/getEmailVerificationStatus/.test(auth),'Existing email verification is preserved');
assert.ok(/sendEmailVerification/.test(auth),'Email confirmation must remain accessible');
assert.ok(/function storageKey\(/.test(auth),'Progress remains partitioned by UID');
assert.ok(/function logout\(/.test(auth),'Existing sign-out remains available');
assert.ok(/profileSaved/.test(profile)&&/publicStats/.test(profile),
  'Profile nickname and privacy settings must be retained');
assert.ok(/displayName/.test(profile),'Profile nickname should remain user-controlled');
assert.ok(/rs_community_2_/.test(profile),'Old profile local cache keys remain known for migration');
const doc=read('staging/backend/REGISTRATION_AND_ACCOUNTS_V3_RU.md');
assert.ok(doc.includes('UID Firebase отличается между проектами'));
assert.ok(doc.includes('riveria-sanasto-community-test'));
assert.ok(doc.includes('preserve')||doc.includes('сохранить'));
const classic=read('staging/classic/index.html');
assert.ok(!classic.includes('id="family-gate"')&&classic.includes("connect-src 'none'"),
  'Offline classic demo must not pretend to have real registration');
console.log('PASS: existing Google registration and profile semantics are preserved while v3 pilot Auth stays isolated');
