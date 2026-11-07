'use strict';
/*
 * Sanastoyhteiso / RUN-115: owner-operated Firebase Auth custom-claim setup.
 * PRODUCTION project ONLY; --dry-run by default. --apply changes ONE existing
 * account only after explicit owner confirmation inside trusted Cloud Shell.
 * Never copy UID/email/tokens/claims backups to chat or public GitHub.
 * No Firebase service-account key files, Firestore operations or billing.
 */
const {execFileSync} = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const readline = require('node:readline');

const PROJECT = 'riveria-sanasto-community-test';
const ENV_KEYS = ['GOOGLE_CLOUD_PROJECT', 'GCLOUD_PROJECT', 'CLOUDSDK_CORE_PROJECT'];

function mode(args) {
  if (args.length === 0 || (args.length === 1 && args[0] === '--dry-run')) return 'dry-run';
  if (args.length === 1 && args[0] === '--apply') return 'apply';
  throw Error('MODE: use --dry-run or --apply');
}
function gcloud(args) {
  return execFileSync('gcloud', args, {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 20000
  }).trim();
}
function identity() {
  if (gcloud(['config', 'get-value', 'project']) !== PROJECT)
    throw Error('PROJECT_MISMATCH');
  for (const k of ENV_KEYS) {
    if (process.env[k] && process.env[k] !== PROJECT)
      throw Error('PROJECT_ENV_MISMATCH');
  }
  const accounts = gcloud(['auth', 'list', '--filter=status:ACTIVE', '--format=value(account)'])
    .split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  if (accounts.length !== 1 || !/^[^@\s]+@[^@\s]+$/.test(accounts[0]))
    throw Error('ACTIVE_GOOGLE_ACCOUNT_UNAVAILABLE');
  return accounts[0];
}
function eligible(record, activeEmail) {
  return !!(record && typeof record.uid === 'string' && record.uid.length > 0 &&
    typeof record.email === 'string' &&
    record.email.toLowerCase() === activeEmail.toLowerCase() &&
    record.disabled === false && record.emailVerified === true &&
    Array.isArray(record.providerData) &&
    record.providerData.some(p => p && p.providerId === 'google.com'));
}
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    const result = {};
    for (const k of Object.keys(value).sort()) result[k] = stable(value[k]);
    return result;
  }
  return value;
}
function snapshotMatches(first, next, activeEmail) {
  if (!eligible(first, activeEmail) || !eligible(next, activeEmail)) return false;
  if (first.uid !== next.uid || first.email !== next.email ||
      first.disabled !== next.disabled || first.emailVerified !== next.emailVerified) return false;
  const providers = r => (r.providerData || []).map(p => p && p.providerId).sort();
  return JSON.stringify(providers(first)) === JSON.stringify(providers(next)) &&
    JSON.stringify(stable(first.customClaims || {})) ===
    JSON.stringify(stable(next.customClaims || {}));
}
function preserveClaims(oldClaims) {
  const claims = (oldClaims && typeof oldClaims === 'object' &&
    !Array.isArray(oldClaims)) ? oldClaims : {};
  return Object.assign({}, claims, {admin:true});
}
function savePrivateBackup(record) {
  const name = '.sanastoyhteiso-prod-admin-claims-before-' + Date.now() + '-' +
    crypto.randomBytes(8).toString('hex') + '.json';
  const body = JSON.stringify({
    projectId:PROJECT, uid:record.uid, customClaims:record.customClaims || {},
    savedAt:new Date().toISOString()
  }, null, 2) + '\n';
  fs.writeFileSync(path.join(os.homedir(), name), body,
    {encoding:'utf8', flag:'wx', mode:0o600});
}
function promptConfirm() {
  const rl = readline.createInterface({input:process.stdin, output:process.stdout});
  return new Promise(resolve => {
    rl.question('To change ONLY your PROD admin claim, type GRANT PROD ADMIN: ',
      answer => {rl.close(); resolve(answer.trim() === 'GRANT PROD ADMIN');});
  });
}
async function main() {
  let attempt = false, app;
  try {
    const runMode = mode(process.argv.slice(2));
    if (runMode === 'apply' && !process.stdin.isTTY) throw Error('INTERACTIVE_SHELL_REQUIRED');
    const active = identity();
    console.log('PROJECT_CHECK=PASS');
    console.log('MODE=' + runMode.toUpperCase().replace('-', '_'));
    const {initializeApp, applicationDefault} = require('firebase-admin/app');
    const {getAuth} = require('firebase-admin/auth');
    app = initializeApp({credential:applicationDefault(), projectId:PROJECT});
    const auth = getAuth(app);
    const record = await auth.getUserByEmail(active);
    if (!eligible(record, active)) throw Error('OWN_GOOGLE_USER_NOT_ELIGIBLE');
    console.log('OWNER_AUTH_CHECK=PASS');
    console.log('ADMIN_CLAIM_TRUE=' +
      (record.customClaims && record.customClaims.admin === true ? 'YES' : 'NO'));
    if (runMode === 'dry-run') {
      console.log('DRY_RUN_COMPLETE=NO_CHANGES');
      return;
    }
    if (record.customClaims && record.customClaims.admin === true) {
      console.log('ALREADY_ADMIN=YES; NO_CHANGES');
      return;
    }
    if (!(await promptConfirm())) throw Error('OWNER_DECLINED');
    // Firebase Auth does not expose compare-and-swap for custom claims.
    // Re-read immediately before writing and refuse if any identity or claim changed.
    const fresh = await auth.getUserByEmail(active);
    if (!snapshotMatches(record, fresh, active)) throw Error('ACCOUNT_OR_CLAIMS_CHANGED');
    savePrivateBackup(fresh);
    console.log('PREVIOUS_CLAIMS_LOCAL_BACKUP=CREATED_PRIVATE_0600');
    attempt = true;
    await auth.setCustomUserClaims(fresh.uid, preserveClaims(fresh.customClaims));
    const updated = await auth.getUser(fresh.uid);
    if (!eligible(updated, active) || updated.uid !== fresh.uid ||
        !updated.customClaims || updated.customClaims.admin !== true)
      throw Error('POST_WRITE_READBACK_MISMATCH');
    const old = fresh.customClaims || {};
    for (const key of Object.keys(old)) {
      if (key === 'admin') continue;
      if (JSON.stringify(stable(updated.customClaims[key])) !==
          JSON.stringify(stable(old[key])))
        throw Error('OTHER_CLAIM_CHANGED');
    }
    console.log('ADMIN_CLAIM_TRUE=YES');
    console.log('OTHER_CLAIMS=VERIFIED_PRESERVED');
    console.log('APPLY_COMPLETE=SUCCESS');
    console.log('SIGN_OUT_AND_SIGN_IN_AGAIN=REQUIRED_FOR_NEW_TOKEN');
  } catch (e) {
    // Never print raw upstream errors; they can contain private account details.
    const code = e && typeof e.message === 'string' &&
      /^(?:PROJECT_MISMATCH|PROJECT_ENV_MISMATCH|ACTIVE_GOOGLE_ACCOUNT_UNAVAILABLE|INTERACTIVE_SHELL_REQUIRED|OWN_GOOGLE_USER_NOT_ELIGIBLE|OWNER_DECLINED|ACCOUNT_OR_CLAIMS_CHANGED|POST_WRITE_READBACK_MISMATCH|OTHER_CLAIM_CHANGED|MODE: use --dry-run or --apply)$/.test(e.message)
      ? e.message : 'ACCESS_OR_SDK_UNAVAILABLE';
    console.error('STOP=' + code);
    console.error(attempt ? 'WRITE_MAY_HAVE_OCCURRED=CHECK_BEFORE_RETRY' :
      'NO_AUTH_WRITE_ATTEMPTED=YES');
    process.exitCode = 1;
  } finally {
    if (app) await app.delete();
  }
}
if (require.main === module) main();
module.exports={PROJECT,mode,eligible,snapshotMatches,preserveClaims};
