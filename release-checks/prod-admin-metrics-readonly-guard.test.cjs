'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {PROJECT,DOC,activeIdentity,eligible,probe} = require('../admin/ops/check-prod-admin-metrics-readonly.cjs');
const email = 'owner@example.invalid';
const owner = {email, disabled:false, emailVerified:true,
  providerData:[{providerId:'google.com'}], customClaims:{admin:true,otherRole:true}};
function env() {return {GOOGLE_CLOUD_PROJECT: PROJECT};}
function readGcloud(args) {
  if (args[0] === 'config') return PROJECT;
  if (args[0] === 'auth') return email;
  throw Error('unexpected command');
}
test('PROD-only project, one fixed aggregate path, default no-arguments',()=>{
  assert.equal(PROJECT,'riveria-sanasto-community-test');
  assert.equal(DOC,'admin_metrics/current');
  assert.equal(activeIdentity(readGcloud,env()),email);
  assert.throws(()=>activeIdentity(args=>args[0]==='config'?'sanastoyhteiso-v3-development':email,env()),/PROJECT_MISMATCH/);
  assert.throws(()=>activeIdentity(readGcloud,{GCLOUD_PROJECT:'other'}),/PROJECT_ENV_MISMATCH/);
  assert.throws(()=>activeIdentity(readGcloud,{GOOGLE_APPLICATION_CREDENTIALS:'/private/key.json'}),/KEY_FILE_NOT_ALLOWED/);
  assert.throws(()=>activeIdentity(args=>args[0]==='config'?PROJECT:email+'\nother@example.invalid',env()),/ACTIVE_IDENTITY_UNAVAILABLE/);
});
test('requires verified, enabled Google provider with strict admin === true',()=>{
  assert.equal(eligible(owner,email),true);
  assert.equal(eligible({...owner,customClaims:{admin:'true'}},email),false);
  assert.equal(eligible({...owner,customClaims:{admin:false}},email),false);
  assert.equal(eligible({...owner,customClaims:{}},email),false);
  assert.equal(eligible({...owner,emailVerified:false},email),false);
  assert.equal(eligible({...owner,disabled:true},email),false);
  assert.equal(eligible({...owner,providerData:[{providerId:'password'}]},email),false);
  assert.equal(eligible(owner,'other@example.invalid'),false);
});
test('reads only fixed aggregate metadata and emits no account or document content',async()=>{
  const lines=[]; const reads=[];
  const auth={getUserByEmail: async target=>{assert.equal(target,email);return owner;}};
  const db={doc: path=>{reads.push(path);return {get:async()=>({exists:true,data:()=>{throw Error('data must not be read');}})}}};
  assert.equal(await probe(auth,db,email,x=>lines.push(x)),true);
  assert.deepEqual(reads,[DOC]);
  assert.ok(lines.includes('ADMIN_METRICS_DOC_PRESENT=YES'));
  assert.ok(lines.includes('FIRESTORE_CLIENT_RULES=NOT_TESTED_ADMIN_SDK_BYPASS'));
  assert.ok(lines.includes('SERVER_TELEMETRY=NOT_TESTED'));
  assert.ok(!lines.join('\n').includes(email));
});
test('missing aggregate is truthful, never called healthy',async()=>{
  const lines=[];
  const db={doc:()=>({get:async()=>({exists:false})})};
  assert.equal(await probe({getUserByEmail:async()=>owner},db,email,x=>lines.push(x)),false);
  assert.ok(lines.includes('ADMIN_METRICS_DOC_PRESENT=NO'));
  assert.ok(!lines.includes('STATUS=OK'));
});
test('never reads any documents if admin claim is missing',async()=>{
  let accessed=false;
  const db={doc:()=>{accessed=true; throw Error('must not read Firestore');}};
  await assert.rejects(probe({getUserByEmail:async()=>({...owner,customClaims:{}})},db,email,()=>{}),/OWNER_ADMIN_CLAIM_REQUIRED/);
  assert.equal(accessed,false);
});
test('malformed snapshot fails closed',async()=>{
  await assert.rejects(probe({getUserByEmail:async()=>owner},
    {doc:()=>({get:async()=>({exists:'true'})})},email,()=>{}),/DOC_READ_NOT_VERIFIED/);
});
test('script has no write/admin escalation/list/data exfiltration API calls',()=>{
  const source=fs.readFileSync(require.resolve('../admin/ops/check-prod-admin-metrics-readonly.cjs'),'utf8');
  const withoutLifecycleCleanup = source.replace('await app.delete();','');
  for(const pattern of [/\.set\(/,/\.update\(/,/\.delete\(/,/\.add\(/,
    /\.data\(/,/setCustomUserClaims\(/,/listUsers\(/,/getUser\(/,/\.collection\(/]) {
    assert.equal(pattern.test(withoutLifecycleCleanup),false,'forbidden API: '+pattern);
  }
  assert.ok(source.includes("if (process.argv.length !== 2)"));
  assert.ok(source.includes("projectId:PROJECT"));
});
