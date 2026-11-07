'use strict';
/*
 * Sanastoyhteiso V3 / RUN-118 / owner-operated, READ ONLY.
 * Safe presence check for the ONE fixed aggregate document.
 * Firebase Admin SDK bypasses Firestore client Security Rules: this script
 * CANNOT verify browser allow/deny or prove that monitoring works.
 * Never print document data, UID, email, credentials or customClaims.
 * Exact PROD project only. No writes or user enumeration.
 */
const {execFileSync} = require('node:child_process');
const PROJECT = 'riveria-sanasto-community-test';
const DOC = 'admin_metrics/current';
const ENV_KEYS = ['GOOGLE_CLOUD_PROJECT', 'GCLOUD_PROJECT', 'CLOUDSDK_CORE_PROJECT'];

function gcloud(args) {
  return execFileSync('gcloud', args, {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 20000
  }).trim();
}
function activeIdentity(read, env) {
  if (read(['config', 'get-value', 'project']) !== PROJECT) throw Error('PROJECT_MISMATCH');
  for (const key of ENV_KEYS) {
    if (env[key] && env[key] !== PROJECT) throw Error('PROJECT_ENV_MISMATCH');
  }
  if (env.GOOGLE_APPLICATION_CREDENTIALS) throw Error('KEY_FILE_NOT_ALLOWED');
  const accounts = read(['auth', 'list', '--filter=status:ACTIVE', '--format=value(account)'])
    .split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  if (accounts.length !== 1 || !/^[^@\s]+@[^@\s]+$/.test(accounts[0]))
    throw Error('ACTIVE_IDENTITY_UNAVAILABLE');
  return accounts[0];
}
function eligible(record, email) {
  return !!(record && typeof record.email === 'string' &&
    record.email.toLowerCase() === email.toLowerCase() &&
    record.disabled === false && record.emailVerified === true &&
    Array.isArray(record.providerData) &&
    record.providerData.some(p => p && p.providerId === 'google.com') &&
    record.customClaims && record.customClaims.admin === true);
}
async function probe(auth, db, email, emit) {
  const user = await auth.getUserByEmail(email);
  if (!eligible(user, email)) throw Error('OWNER_ADMIN_CLAIM_REQUIRED');
  emit('OWNER_VERIFIED_GOOGLE_ADMIN=YES');
  const snap = await db.doc(DOC).get();
  if (!snap || typeof snap.exists !== 'boolean') throw Error('DOC_READ_NOT_VERIFIED');
  emit('ADMIN_METRICS_DOC_PRESENT=' + (snap.exists ? 'YES' : 'NO'));
  emit('FIRESTORE_CLIENT_RULES=NOT_TESTED_ADMIN_SDK_BYPASS');
  emit('SERVER_TELEMETRY=NOT_TESTED');
  emit('READBACK_COMPLETE=NO_CHANGES');
  return snap.exists;
}
async function main() {
  let app;
  try {
    if (process.argv.length !== 2) throw Error('READ_ONLY_NO_ARGUMENTS');
    const email = activeIdentity(gcloud, process.env);
    console.log('PROJECT_CHECK=PASS');
    console.log('MODE=READ_ONLY');
    const {initializeApp, applicationDefault} = require('firebase-admin/app');
    const {getAuth} = require('firebase-admin/auth');
    const {getFirestore} = require('firebase-admin/firestore');
    app = initializeApp({credential:applicationDefault(), projectId:PROJECT});
    await probe(getAuth(app), getFirestore(app), email, message => console.log(message));
  } catch (e) {
    // Upstream Firebase error messages may include private identifiers: never show them.
    const allowed = new Set(['PROJECT_MISMATCH', 'PROJECT_ENV_MISMATCH',
      'KEY_FILE_NOT_ALLOWED', 'ACTIVE_IDENTITY_UNAVAILABLE', 'READ_ONLY_NO_ARGUMENTS',
      'OWNER_ADMIN_CLAIM_REQUIRED', 'DOC_READ_NOT_VERIFIED']);
    const code = e && allowed.has(e.message) ? e.message : 'READ_ACCESS_OR_SDK_UNAVAILABLE';
    console.error('STOP=' + code);
    console.error('NO_WRITES_ATTEMPTED=YES');
    process.exitCode = 1;
  } finally {
    if (app) await app.delete();
  }
}
if (require.main === module) main();
module.exports = {PROJECT, DOC, activeIdentity, eligible, probe};
