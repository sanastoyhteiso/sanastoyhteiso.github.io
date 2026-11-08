# Firebase access handoff — Sanastoyhteisö (RU)

**Status: pre-deployment preparation.** This file documents exactly what can happen after the project owner connects Firebase. Nothing in `staging/` is loaded by the production website.

## What is ready

- `staging/rs-sync-core.js`: pure offline ES5-compatible event schema, score aggregation, migration baseline, unique-event deduplication, retry queue filtering and dry-run restore preview.
- `staging/rs-backup-plan.js`: dated snapshot rows for Google Sheets, checksum-ready manifest, read-back verification, partitioning (no Google API requests).
- `staging/rs-admin-preview.js`: role-gated read-only admin tiles; no real users, emails or tokens loaded.
- `staging/rs-catalog-release.js`: validates stable term IDs and FI/RU/EN entries; detects changed/deleted terms; hourly-or-slower checks.
- `staging/firestore.rules.template`: RESTRICTIVE STARTING POINT, **must not replace the existing rules**.
- `staging/tests/smoke.test.js`: offline test suite. Run in a local repository clone with Node: `node staging/tests/smoke.test.js`.

## Read-only Firebase audit — 2026-11-02

Verified with the project owner using Firebase/Google Cloud Console screenshots and the **deployed** Firestore rules:

- Project and database: `riveria-sanasto-community-test`, `(default)`, Spark free tier.
- Existing collection names visible: `users` and `settings`; no `sync_v3` collection yet.
- Existing `settings/{uid}` fields: `scope`, `subscriptions`, `updatedAt`. Existing `users/{uid}` fields: `alias`, `learned`, `publicStats`, `updatedAt`.
- Firestore operation usage over one 24-hour view: 181 document reads, 45 writes; 283 permitted rules evaluations. These are historical observations, not current quotas.
- Monitoring `Data and Index Storage Size` showed ~2.93 KiB for that database on 2026-11-02.
- Security rules simulator `Get settings/<owner UID>`: unauthenticated => **DENIED**; authenticated with matching owner UID => **ALLOWED**; authenticated with different synthetic UID => **DENIED**.
- These are simulated GET checks only. They do **not** establish write-rule correctness, safe migration behavior or any permissions for future paths.
- Owner created two downloaded JSON progress snapshots and a separate private copy of the personal Google Sheets event log. Original Drive sheet remained intact.

**Release gate:** no Firebase rules were published or changed during this audit. Before deployment, independently test new collection rules for create, update, delete, cross-user reads, malformed payloads and idempotent retry using the Rules Emulator against the actual combined ruleset.

## What the owner must authorize (one time)

1. Access to the existing Firebase project in the supported Firebase/Codex environment. Do not paste Firebase admin service-account JSON, tokens, passwords, or private keys into ChatGPT.
2. Permission to inspect **current Firestore Security Rules**, the Spark/Blaze plan, quota, collections and Firebase Authentication settings in **read-only mode first**.
3. Explicit consent to grant the `admin` custom claim to the correct Firebase Auth UID from a privileged Admin SDK session. Do not infer this from the published username or email string.
4. Agreement on whether private per-user progress can be mirrored to a centrally managed backup. An existing user's personal Drive spreadsheet is not automatically accessible to the site owner.
5. If backups are automated from Apps Script, owner-authorized OAuth/trigger setup, under an account they control. Some backend automation patterns may require a billable environment; validate before enabling.

## Stage 1 — do not shortcut

1. Read the existing Firestore rules, quotas and current collection names. Back them up.
2. Validate security rules in an emulator; add only the new `sync_v3` paths with least privilege.
3. Inventory one user's old `Events` history and reconcile learned, favorite, added-word records **without any live write**.
4. Create a NEW dated Google Sheet snapshot in a restricted location; verify read-back and preserve the original private sheet.
5. Test migration to a **new, user-owned** Firestore path with a disabled-by-default feature flag, then test offline/online/reload/concurrent devices.
6. Run independent consistency checks (term IDs, count of answered questions, no cross-user data leakage).
7. Gradual activation only after verified restore and rollback.

## Stage 2 — admin

1. Set administrator privilege server-side; confirm Firebase custom claim is present in a refreshed ID token.
2. Backend rule must enforce admin for every admin-only metric; hidden navigation is *not* access control.
3. Implement aggregate registered/active/user-sync statistics from a privileged API, not from client-side enumeration of Authentication users.
4. No email address inventory, IP logging, patient data, progress content or admin account impersonation by default.
5. The admin screen is read-only at launch; log aggregation is constrained by privacy notices and retention limits.

## Stage 3 — catalog publishing

1. Master FI/RU/EN Google Sheet remains the editing interface and one source of truth for published vocabulary.
2. Make a dated immutable snapshot of the master sheet before each release.
3. Validate new terms; preserve existing IDs; require review before changing existing translations or deleting entries.
4. Export to versioned static data and calculate a **cryptographic SHA-256** of published bytes. The staging manifest deliberately contains no fake checksum.
5. Publish a small manifest (e.g., version/count/hash), let active clients poll hourly at most, load the full catalog only when a new release exists.
6. Keep previous cached version until new bytes verify. Show a manual refresh option and never clear personal study state.

## Deployment gates

- [ ] Firebase rules obtained, backed up, emulator tests passed
- [ ] Real admin claim assigned via authorized server tooling
- [ ] Backup legality / access scope established for personal data
- [ ] Migration dry-run count-by-count approved and reversible
- [ ] Apps Script/Cloud automation permissions and exact free-tier limits reviewed
- [ ] iOS 12 Safari offline and reload tests passed
- [ ] 2-device concurrent answer test passed (no double or missing counts)
- [ ] 429/quota/network faults tested with bounded retry
- [ ] Draft code reviewed in GitHub PR
- [ ] Staged rollout, not instant bulk cutover

## Safety note

The existing app uses Firebase Authentication **8.10.1**, but does not load the Firestore JS SDK on its home page. Before deploying Firestore offline mode, explicitly include a version-compatible SDK in a feature-gated release and ask the user if this device is trusted (persistent browser cache may retain personal data). Cloud persistence isn't guaranteed on every browser, so the local event queue must remain a fallback.

The current owner-visible Google Sheets master has 1296 distinct medical terms; preserving that table does not automatically back up the private history of all other Firebase accounts.
