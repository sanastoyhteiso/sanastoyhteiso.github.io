'use strict';
/*
 * RUN-119 — owner-operated READ-ONLY published Firebase Rules checkpoint.
 * EXACT project: riveria-sanasto-community-test, default Firestore database.
 * GET current Release then GET immutable Ruleset using the official Rules REST API.
 * Never print OAuth token, account name, source rules, user data or whole response.
 * This is evidence of deployed source only, NOT a client Rules allow/deny test.
 *
 * Requires owner Cloud Shell: gcloud active login with Rules read permission.
 * No external key file, no Firebase write, no rule Publish, no deployment.
 */
const {execFileSync} = require('node:child_process');
const https = require('node:https');
const crypto = require('node:crypto');

const PROJECT = 'riveria-sanasto-community-test';
const RELEASE = 'projects/' + PROJECT + '/releases/cloud.firestore';
const API_HOST = 'firebaserules.googleapis.com';
const ENV_KEYS = ['GOOGLE_CLOUD_PROJECT', 'GCLOUD_PROJECT', 'CLOUDSDK_CORE_PROJECT'];
const MAX_BYTES = 1024 * 1024;

function gcloud(args) {
  return execFileSync('gcloud', args, {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 20000
  }).trim();
}
function checkIdentity(read, env) {
  if (read(['config', 'get-value', 'project']) !== PROJECT)
    throw Error('PROJECT_MISMATCH');
  for (const k of ENV_KEYS) {
    if (env[k] && env[k] !== PROJECT) throw Error('PROJECT_ENV_MISMATCH');
  }
  if (env.GOOGLE_APPLICATION_CREDENTIALS) throw Error('KEY_FILE_NOT_ALLOWED');
  const accounts = read(['auth', 'list', '--filter=status:ACTIVE', '--format=value(account)'])
    .split(/\r?\n/).map(v => v.trim()).filter(Boolean);
  if (accounts.length !== 1 || !/^[^@\s]+@[^@\s]+$/.test(accounts[0]))
    throw Error('ACTIVE_IDENTITY_UNAVAILABLE');
  // No account names are printed or written to GitHub.
  return true;
}
function rulesetName(release) {
  if (!release || ![RELEASE, RELEASE + '/(default)'].includes(release.name))
    throw Error('RELEASE_IDENTITY_MISMATCH');
  const name = release.rulesetName;
  const prefix = 'projects/' + PROJECT + '/rulesets/';
  if (typeof name !== 'string' || !name.startsWith(prefix) ||
      !/^[A-Za-z0-9_-]{8,128}$/.test(name.slice(prefix.length)))
    throw Error('RULESET_PROJECT_MISMATCH');
  return name;
}
function inspectRuleset(ruleset) {
  if (!ruleset || !Array.isArray(ruleset.source && ruleset.source.files) ||
      ruleset.source.files.length < 1 || ruleset.source.files.length > 10)
    throw Error('RULESET_SOURCE_INVALID');
  const files = ruleset.source.files;
  if (!files.every(f => f && typeof f.content === 'string' && f.content.length < MAX_BYTES))
    throw Error('RULESET_SOURCE_INVALID');
  const content = files.map(f => f.content).join('\n');
  if (content.length > MAX_BYTES) throw Error('RULESET_SOURCE_INVALID');
  const hash = crypto.createHash('sha256').update(content, 'utf8').digest('hex');
  return {
    sha256: hash,
    firestore: /service\s+cloud\.firestore\s*\{/.test(content),
    syncPath: /match\s+\/sync_v3\//.test(content),
    adminMetricsPath: /match\s+\/admin_metrics\/\{[A-Za-z_][A-Za-z0-9_]*\}/.test(content)
  };
}
function getJson(resource, token, network = https) {
  if (!/^[A-Za-z0-9_()./-]+$/.test(resource) ||
      !resource.startsWith('projects/' + PROJECT + '/'))
    return Promise.reject(Error('INVALID_API_RESOURCE'));
  if (typeof token !== 'string' || token.length < 40)
    return Promise.reject(Error('OAUTH_TOKEN_UNAVAILABLE'));
  return new Promise((resolve, reject) => {
    let completed = false;
    function fail(e) { if (!completed) {completed = true; reject(e);} }
    const req = network.get('https://' + API_HOST + '/v1/' + resource, {
      headers: {Authorization: 'Bearer ' + token, Accept: 'application/json'}
    }, res => {
      const chunks = []; let bytes = 0;
      res.on('data', part => {
        bytes += part.length;
        if (bytes > MAX_BYTES) { req.destroy(); fail(Error('RULES_RESPONSE_TOO_LARGE')); }
        else chunks.push(part);
      });
      res.on('error', () => fail(Error('RULES_API_READ_FAILED')));
      res.on('end', () => {
        if (completed) return;
        if (res.statusCode !== 200) return fail(Error('RULES_API_READ_FAILED'));
        try {
          const decoded = JSON.parse(Buffer.concat(chunks).toString('utf8'));
          completed = true;
          resolve(decoded);
        } catch (_ignored) { fail(Error('RULES_RESPONSE_INVALID')); }
      });
    });
    req.on('error', () => fail(Error('RULES_API_READ_FAILED')));
    req.setTimeout(15000, () => req.destroy(Error('RULES_API_TIMEOUT')));
  });
}
async function run(read = gcloud, fetch = getJson, emit = console.log, env = process.env) {
  checkIdentity(read, env);
  emit('PROJECT_CHECK=PASS');
  emit('MODE=READ_ONLY');
  const token = read(['auth', 'print-access-token']);
  if (typeof token !== 'string' || token.length < 40)
    throw Error('OAUTH_TOKEN_UNAVAILABLE');
  const release = await fetch(RELEASE, token);
  const immutable = rulesetName(release);
  const ruleset = await fetch(immutable, token);
  if (ruleset.name !== immutable) throw Error('RULESET_IDENTITY_MISMATCH');
  const parsed = inspectRuleset(ruleset);
  emit('ACTIVE_RELEASE_READ=YES');
  emit('RULESET_SHA256=' + parsed.sha256);
  emit('FIRESTORE_RULES_SOURCE=' + (parsed.firestore ? 'YES' : 'NO'));
  emit('SYNC_V3_MATCH_PRESENT=' + (parsed.syncPath ? 'YES' : 'NO'));
  emit('ADMIN_METRICS_MATCH_PRESENT=' + (parsed.adminMetricsPath ? 'YES' : 'NO'));
  emit('CLIENT_ALLOW_DENY_TEST=NOT_RUN');
  emit('AGGREGATE_DOCUMENT_EXISTENCE=NOT_RUN');
  emit('READBACK_COMPLETE=NO_CHANGES');
  return parsed;
}
async function main() {
  try {
    if (process.argv.length !== 2) throw Error('READ_ONLY_NO_ARGUMENTS');
    await run();
  } catch (e) {
    const allowed = new Set([
      'PROJECT_MISMATCH', 'PROJECT_ENV_MISMATCH', 'KEY_FILE_NOT_ALLOWED',
      'ACTIVE_IDENTITY_UNAVAILABLE', 'READ_ONLY_NO_ARGUMENTS',
      'RELEASE_IDENTITY_MISMATCH', 'RULESET_PROJECT_MISMATCH',
      'RULESET_SOURCE_INVALID', 'RULESET_IDENTITY_MISMATCH',
      'INVALID_API_RESOURCE', 'OAUTH_TOKEN_UNAVAILABLE',
      'RULES_RESPONSE_TOO_LARGE', 'RULES_API_READ_FAILED', 'RULES_RESPONSE_INVALID'
    ]);
    // Neither raw HTTP errors nor source text, tokens, UID, or account are emitted.
    console.error('STOP=' + (e && allowed.has(e.message) ? e.message : 'RULES_READ_UNAVAILABLE'));
    console.error('NO_WRITES_ATTEMPTED=YES');
    process.exitCode = 1;
  }
}
if (require.main === module) main();
module.exports = {PROJECT, RELEASE, checkIdentity, rulesetName, inspectRuleset, getJson, run};
