'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {EventEmitter} = require('node:events');
const mod = require('../admin/ops/check-prod-published-rules-readonly.cjs');

const PROJECT = 'riveria-sanasto-community-test';
const email = 'owner@example.invalid';
const rulesetPath = 'projects/' + PROJECT + '/rulesets/fake-immutable-ruleset';
const release = {name:mod.RELEASE,rulesetName:rulesetPath};
function gcloud(args) {
  if (args[0] === 'config') return PROJECT;
  if (args[0] === 'auth' && args[1] === 'list') return email;
  if (args[0] === 'auth' && args[1] === 'print-access-token') return 't'.repeat(90);
  throw Error('unexpected gcloud command');
}
function ruleset(content) {return {name:rulesetPath,source:{files:[{name:'firestore.rules',content}]}};}
const safeSource = "rules_version = '2'; service cloud.firestore { match /databases/{database}/documents { match /sync_v3/{uid}/events/{eventId} { allow read: if false; } match /admin_metrics/{metricId} { allow get: if false; } } }";

test('hard-pins PROD project and active owner identity; refuses alternate key file', () => {
  assert.equal(mod.PROJECT, PROJECT);
  assert.equal(mod.checkIdentity(gcloud, {}), true);
  assert.throws(() => mod.checkIdentity(args => args[0] === 'config' ? 'other' : email, {}), /PROJECT_MISMATCH/);
  assert.throws(() => mod.checkIdentity(gcloud, {GOOGLE_CLOUD_PROJECT:'wrong'}), /PROJECT_ENV_MISMATCH/);
  assert.throws(() => mod.checkIdentity(gcloud, {GOOGLE_APPLICATION_CREDENTIALS:'/tmp/key.json'}), /KEY_FILE_NOT_ALLOWED/);
  assert.throws(() => mod.checkIdentity(args => args[0] === 'config' ? PROJECT : email+'\nother@example.invalid', {}), /ACTIVE_IDENTITY_UNAVAILABLE/);
});
test('accepts only exact default Firestore release pointing to same-project immutable ruleset', () => {
  assert.equal(mod.rulesetName(release), rulesetPath);
  assert.equal(mod.rulesetName({...release,name:mod.RELEASE+'/(default)'}), rulesetPath);
  assert.throws(() => mod.rulesetName({...release,name:'projects/'+PROJECT+'/releases/firebase.storage'}), /RELEASE_IDENTITY_MISMATCH/);
  assert.throws(() => mod.rulesetName({...release,rulesetName:'projects/other/rulesets/fake-immutable-ruleset'}), /RULESET_PROJECT_MISMATCH/);
  assert.throws(() => mod.rulesetName({...release,rulesetName:'projects/'+PROJECT+'/rulesets/../unsafe'}), /RULESET_PROJECT_MISMATCH/);
});
test('inspects immutable source without treating path presence as permission or running writes', () => {
  const s = mod.inspectRuleset(ruleset(safeSource));
  assert.equal(s.firestore, true);
  assert.equal(s.syncPath, true);
  assert.equal(s.adminMetricsPath, true);
  assert.match(s.sha256, /^[0-9a-f]{64}$/);
  const no = mod.inspectRuleset(ruleset('service cloud.firestore {}'));
  assert.equal(no.adminMetricsPath,false);
  assert.equal(no.syncPath,false);
  assert.throws(() => mod.inspectRuleset({source:{files:[]}}), /RULESET_SOURCE_INVALID/);
});
test('reads the released Ruleset through exactly two GET endpoints, no raw content output', async () => {
  const paths = [], messages = [];
  const fetch = async (resource, token) => {
    assert.equal(token,'t'.repeat(90));
    paths.push(resource);
    if (resource === mod.RELEASE) return release;
    if (resource === rulesetPath) return ruleset(safeSource);
    throw Error('unexpected URL');
  };
  const r = await mod.run(gcloud,fetch,x=>messages.push(x),{});
  assert.equal(r.adminMetricsPath,true);
  assert.deepEqual(paths,[mod.RELEASE,rulesetPath]);
  assert.ok(messages.includes('ADMIN_METRICS_MATCH_PRESENT=YES'));
  assert.ok(messages.includes('CLIENT_ALLOW_DENY_TEST=NOT_RUN'));
  assert.ok(messages.includes('AGGREGATE_DOCUMENT_EXISTENCE=NOT_RUN'));
  assert.ok(messages.includes('READBACK_COMPLETE=NO_CHANGES'));
  assert.ok(!messages.join('\n').includes(email));
  assert.ok(!messages.join('\n').includes('t'.repeat(90)));
  assert.ok(!messages.join('\n').includes(safeSource));
});
test('fails closed on another project or mismatched second response', async () => {
  let count=0;
  await assert.rejects(mod.run(args => args[0] === 'config' ? 'other' : email,
      async()=>{count++;return release;},()=>{},{}), /PROJECT_MISMATCH/);
  assert.equal(count,0);
  await assert.rejects(mod.run(gcloud,async r => r === mod.RELEASE
      ? release : {...ruleset(safeSource),name:'projects/other/rulesets/fake-immutable-ruleset'},()=>{},{}), /RULESET_IDENTITY_MISMATCH/);
});
test('transport forces HTTPS GET and script contains no publish or mutation call', async () => {
  let urlSeen = '', methodSeen = '', tokenSeen = '';
  const transport = {get(url, options, callback) {
    urlSeen = url; methodSeen = 'GET'; tokenSeen = options.headers.Authorization;
    const req = new EventEmitter();
    req.setTimeout = () => {};
    req.destroy = () => {};
    process.nextTick(() => {
      const response = new EventEmitter(); response.statusCode = 200;
      callback(response);
      response.emit('data', Buffer.from(JSON.stringify(release)));
      response.emit('end');
    });
    return req;
  }};
  assert.deepEqual(await mod.getJson(mod.RELEASE,'t'.repeat(90),transport),release);
  assert.ok(urlSeen.startsWith('https://firebaserules.googleapis.com/v1/projects/'+PROJECT+'/releases/'));
  assert.equal(methodSeen,'GET');
  assert.equal(tokenSeen,'Bearer '+'t'.repeat(90));
  const source = fs.readFileSync(require.resolve('../admin/ops/check-prod-published-rules-readonly.cjs'),'utf8');
  for (const x of [/https\.request\s*\(/, /\.post\s*\(/, /\.put\s*\(/, /\.patch\s*\(/,
    /\.delete\s*\(/, /setCustomUserClaims\s*\(/, /createRelease\s*\(/, /updateRelease\s*\(/]) {
    assert.equal(x.test(source),false,'forbidden API: '+x);
  }
  assert.ok(source.includes('if (process.argv.length !== 2)'));
});
