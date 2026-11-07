'use strict';
/*
 * Sanastoyhteiso V3 / RUN-114
 * READ ONLY. Google Cloud Shell owner check for the existing PROD Firebase Auth user.
 * Does not list users, change claims, write Firestore, use service account keys,
 * or output email, UID, token, customClaims map or other private account data.
 *
 * This script is for project riveria-sanasto-community-test ONLY.
 * Never run TEST-only assign-test-admin.cjs against this PROD project.
 */
const {execFileSync} = require('node:child_process');

const PROJECT = 'riveria-sanasto-community-test';
const ENV_KEYS = ['GOOGLE_CLOUD_PROJECT', 'GCLOUD_PROJECT', 'CLOUDSDK_CORE_PROJECT'];

function readGcloud(args) {
  return execFileSync('gcloud', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 20000
  }).trim();
}

async function main() {
  const actual = readGcloud(['config', 'get-value', 'project']);
  if (actual !== PROJECT) {
    console.error('STOP: unexpected active gcloud project; no Firebase request made.');
    process.exitCode = 2;
    return;
  }
  for (const key of ENV_KEYS) {
    if (process.env[key] && process.env[key] !== PROJECT) {
      console.error('STOP: project environment mismatch; no Firebase request made.');
      process.exitCode = 2;
      return;
    }
  }

  const accounts = readGcloud(['auth', 'list', '--filter=status:ACTIVE', '--format=value(account)'])
    .split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  if (accounts.length !== 1 || !/^[^@\s]+@[^@\s]+$/.test(accounts[0])) {
    console.error('STOP: exactly one active gcloud identity is required; no Firebase request made.');
    process.exitCode = 2;
    return;
  }
  console.log('PROJECT_CHECK=PASS');
  console.log('CHECK_MODE=READ_ONLY');
  console.log('FIREBASE_USER=ACTIVE_GCLOUD_ACCOUNT');

  const {initializeApp, applicationDefault} = require('firebase-admin/app');
  const {getAuth} = require('firebase-admin/auth');
  const app = initializeApp({credential: applicationDefault(), projectId: PROJECT});
  try {
    const record = await getAuth(app).getUserByEmail(accounts[0]);
    const googleProvider = Array.isArray(record.providerData) &&
      record.providerData.some(p => p && p.providerId === 'google.com');
    console.log('AUTH_ACCOUNT_FOUND=YES');
    console.log('ACCOUNT_ENABLED=' + (record.disabled === false ? 'YES' : 'NO'));
    console.log('EMAIL_VERIFIED=' + (record.emailVerified === true ? 'YES' : 'NO'));
    console.log('GOOGLE_PROVIDER=' + (googleProvider ? 'YES' : 'NO'));
    console.log('ADMIN_CLAIM_TRUE=' +
      (record.customClaims && record.customClaims.admin === true ? 'YES' : 'NO'));
    console.log('CHECK_COMPLETE=NO_CHANGES');
  } catch (e) {
    // Never emit exception messages: upstream text can contain identifiers.
    const code = e && typeof e.code === 'string' && /^auth\/[a-z-]+$/.test(e.code)
      ? e.code : 'AUTH_READ_UNAVAILABLE';
    console.log('AUTH_READ_STATUS=FAILED:' + code);
    console.log('CHECK_COMPLETE=NO_CHANGES');
    process.exitCode = 1;
  } finally {
    await app.delete();
  }
}
main().catch(() => {
  console.error('STOP: Cloud Shell credentials, gcloud, or SDK unavailable. NO CHANGES.');
  process.exitCode = 1;
});
