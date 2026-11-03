# Sanastoyhteisö v3 sync — staging release gate

**Not deployed.** These scripts are isolated under `staging/`. The production `index.html` loads none of them. PR #8 remains draft until the project owner authorizes and tests live Firestore rules, the migration baseline and application cutover.

## Components

| File | Function |
| --- | --- |
| `rs-sync-core.js` | Immutable event shapes, aggregate scoring with deduplicated IDs, legacy baseline |
| `rs-event-ids.js` | Web Crypto 128-bit unpredictable event and device IDs |
| `rs-sync-journal.js` | One-key atomic local checkpoint and pending queue; refuses counter rollback |
| `rs-firestore-transport.js` | Firebase Auth ID token, owner-scoped Firestore REST events and immutable imported baseline |
| `rs-sync-http.js` | Safe XHR calls without storing/printing tokens; supports old Safari |
| `rs-sync-controller.js` | Online/visibility/datachange triggers; bounded batching and exponential backoff |
| `rs-sha256.js` | Canonical JSON and Web Crypto SHA-256 snapshot digest |
| `rs-legacy-audit.js` | Read-only Google Sheets `Events` reconciliation (no IDs or private data in repo) |
| `rs-backup-plan.js` | Dated private Sheets snapshot planning and dry-run restore |
| `rs-catalog-release.js` | FI/RU/EN validation and conservative version checks |
| `rs-admin-preview.js` | Read-only sanitized admin preview; requires server-issued claim |

Run offline tests (no credentials): `node staging/tests/smoke.test.js` and `node staging/tests/sync-integration.test.js`. The PR's workflow runs these commands automatically.

## Important existing-data boundaries

- The existing family login in `family.js` and Google Drive sync in `community.js` MUST NOT be replaced or disabled until after a real successful verified migration.
- Old **personal JSON** contains local status flags, favorites and words which may not be fully represented in the Google Sheets `Events` log. Reconcile *both* sources. Missing or mismatched totals block activation.
- The Drive event log uses max-merged counters; a two-device same-term race may already have lost historical increments. This cannot always be reconstructed. Explicitly report discrepancies.
- New v3 events represent **incremental answers**, while the migration baseline represents **past aggregated state**. Never replay past answers as new v3 events.
- A cutover must coordinate all of a user's active devices. New journal capture is disabled unless the old Drive progress sync is switched off for that account.
- If capture encounters decreased counts, a storage exception, a mismatched user identity or changed baseline, it fails closed without overwriting the journal.
- Local device storage may be wiped by the OS. It is a resilience layer, not the only backup. Maintain dated Sheets copies; retain old personal Drive sheets unmodified through rollback verification.
- Never store private progress or admin Firebase credentials in GitHub Pages, public admin metrics or an open Google Sheet.

## Emulator security verification (2026-11-02)

The GitHub Actions workflow **Staging offline sync tests** completed successfully for the staging-only merged rule file. It runs two local JavaScript suites and **38 Firestore Security Rules emulator cases** using a `demo-` project ID. No real Firestore API calls, billing changes or changes to authentication users occurred.

- **Existing behavior retained:** profile owners read/write as allowed; opt-in public profiles, private profiles, owner-only settings, approved public/private libraries, denial for guests.
- **New paths:** authenticated owner can create and read well-formed immutable events, cannot overwrite or delete events; other users and guests cannot read or write another owner's event log.
- **Migration baseline:** owner may create it once and read it; even owner cannot update/delete it; invalid hashes rejected.
- **Admin metrics:** only a server-issued `admin` claim allows reading preseeded aggregate metrics, never writes from a browser.
- **Unknown collections:** denied.
- These tests establish only simulator behavior, not live production deployment or full browser/mobile integration.

Test file: `staging/tests/firestore-rules.test.cjs`. Source: `staging/firestore.rules.combined.test`. CLI configuration: `staging/firebase-emulator.json`.

**Do not paste `staging/firestore.rules.template` directly over live rules**. The combined fixture is based on the owner's November 2 pasted rules and must be compared with the actual current Firebase Rules tab before deploying anything.

## Confirmed read-only Firebase audit

- Project `riveria-sanasto-community-test` on Spark; current default database contains existing `settings` and `users` collections.
- The existing rules were copied from the owner's console for review, but **staging/firestore.rules.template is NOT the full production ruleset** and must never be pasted as a replacement.
- Three console simulator GET tests for `settings/<owner>` confirmed guest denied, owner allowed and another UID denied.
- Rules for `sync_v3` have NOT yet been deployed or emulator-tested, and no live v3 event or baseline has been written.
- The template reserves `sync_v3/{uid}/state/baseline` for one-time owner-authorized create and `sync_v3/{uid}/events/{eventId}` for immutable event writes.
- Exact Firestore billing, rules and SDK version behavior must be revalidated before enabling live operations.

## Publishing prerequisites

1. Merge and emulator-test v3-specific rules into a verified copy of the **existing** rules without replacing existing behavior.
2. Confirm owner/admin role through trusted server-side Firebase Admin SDK; do not infer it from a public email/UID string.
3. Reconcile current JSON, private Drive Events and current Firestore profile, including flags/word IDs, **without overwriting either**.
4. Verify one-time baseline document (checksum, event-count audit, private readback) using the owner's Firebase Auth token.
5. Activate v3 journal only after the Drive sync has been disabled for that account and pending old events have been migrated.
6. Test partial write acknowledgment, concurrent devices, offline/restart, failed token refresh, quota 429 and rollback.
7. Implement final app UI, explicit consent for persistent offline cache, and multilingual sync status. Implement backend-admin metrics only after role security tests.
8. Stage rollout to the owner's account; then test on a second isolated account. Keep feature flag default OFF for other users.
9. Create an independent dated private Sheets snapshot and verify restore before rollout; a mirror alone is not a backup.

**No service account secret, OAuth refresh token, Firebase Admin SDK privilege or payment data should ever be added to this repository.**

## Update 2026-11-03 — guarded cloud preview and local app adapter (staging only)

- New rs-sync-local-adapter.js reads the existing per-UID rs_family_v1 keys (rs_scores_v1, rs_user_words_v1, rs_favorites_v1) without writing; it verifies account identity and detects corrupt or concurrently changed data.
- rs-sync-journal.js exposes a defensive read-only inspect() of the atomic checkpoint + queue; capture rejects duplicate IDs already pending.
- rs-sync-controller.js optionally accepts cloudReader and normalizeSnapshot. Its checkRemote() produces a READ-ONLY preview, which it discards after local changes, acknowledgement, logout, offline, or stop. It never applies any remote data to the app.
- autoCheckRemote is false by default; optional previews on focus/online/start are throttled to at least 60 seconds between attempts, without polling.
- rs-sync-cloud-read.js rejects inconsistent score totals and conflicting cross-device edits to the same personal word.
- CI adds sync-controller-cloud.test.cjs and sync-local-adapter.test.cjs plus new cloud-read regressions.

Not implemented: UI adoption, atomic local progress replacement, browser tests on a real account or approved real Firestore writes. The live application, legacy Google Drive sync, main and real Firestore data are not modified.

## 3 November — isolated transactional shadow store

A separate STAGING-only native IndexedDB module, `rs-sync-shadow-idb.js`, stores one versioned record per UID with the complete scores, personal words, favorites and unsent events. Operations run inside a native `readwrite` IndexedDB transaction with expected-revision checks; two tabs cannot silently commit the same stale revision. There is no fallback to several localStorage writes.

`rs-sync-shadow-reconcile.js` takes a verified read-only result from `rs-sync-cloud-read.js` and explicitly stages it in this shadow record, only after confirming the same UID, a verified disabled-legacy gate, included pending IDs, expected revision and nondecreasing answer counters. It refuses loss of personal words, double-processing of pending events and account changes. It does not clear pending events and does not acknowledge writes to Firestore.

The shadow database is named `sanastoyhteiso_staging_shadow_v3`; creation and writes require explicit staging enablement and approval. Neither module is included by the production site. **This does not migrate the existing legacy app.** Production still reads three separate localStorage keys. Linking its UI to a transactional state will require a new, carefully tested bootstrap/adapter and old iOS Safari compatibility checks, plus a verified real backup and owner approval.

Tests with pinned fake-indexeddb exercise concurrent tab writes, version conflicts, 236 scores, 150 personal words, missing pending event IDs, old-state preservation, two devices, repeated cloud fetch, logout and interrupted network. The simulation is not proof of actual Safari, Firebase or physical-device behavior.

Additional staging hardening:
- The IndexedDB shadow store's acknowledge(uid, ids, expectedRevision, approval) removes only server-confirmed IDs, in one serialized transaction. It never decreases counters and refuses foreign, duplicate or stale acknowledgments.
- rs-sync-core now rejects dangerous object-property IDs and conflicting custom-word IDs. New safe word-upsert folds assign the event target as the stable word ID. A word-delete event requires deleted=true.
- New regression tests run in staging CI; any failure must block further rollout.

No real Firestore document was created or deleted in this update. The shadow datastore is not yet an app-visible source of truth.

## 2026-11-03 — module stability, Safari syntax and recovery audit

The owner's priority is **live site reliability** rather than exact learned-card count. Existing learners continue answering cards on the published site. Therefore:
- `tests/safari12-syntax.test.cjs` uses a pinned Acorn parser to reject ES2019+ syntax in production scripts/inline bootstrap and enforce ES5 source syntax in isolated staging runtime modules. **Parser compatibility does not prove actual Safari iOS 12 support.**
- `tests/production-dom-smoke.test.cjs` runs **the unchanged real `data.js` and `app.js`** in JSDOM with synthetic accounts and in-memory/local test storage. It checks cards, answers, quizzes, dictionary, Mediatri phrases and headings, personal words, Data, users, library and account isolation. It performs **no network requests and no production writes**. It is a simulated DOM, not a Safari device/browser.
- `rs-sync-recovery-audit.js` reads isolated shadow IndexedDB revision history and unacknowledged-event counts, validates it and reports only numeric summaries. It cannot restore data, overwrite history or replace independent dated backups. `tests/sync-recovery-audit.test.cjs` intentionally corrupts synthetic history and verifies failure-closed behavior.

Keep all staged modules detached from `index.html`. Before a future owner-approved pilot: take a **fresh** personal JSON/Sheets backup (older Nov 2 snapshots cannot capture answers earned since), test browser workflows on iOS 12 and modern devices, and maintain rollback and existing Google Drive sync until verified migration.

## 2026-11-03 — standalone trilingual v3 demo

A new opt-in, staging-only synthetic UI is stored at `staging/site-v3-demo.html` and `staging/rs-v3-demo.js`, **not loaded by the live website**. It is a real interactive prototype of the future application shell, not a deployment.

The page combines five sections in Finnish/Russian/English: cards, personal vocabulary, mock device reconciliation, read-only history audit and a synthetic read-only admin dashboard. It uses existing `rs-sync-core.js`, `rs-sync-shadow-idb.js`, `rs-sync-shadow-reconcile.js`, `rs-sync-recovery-audit.js` and `rs-admin-preview.js`. Cards, favorites and personal words are saved transactionally to a dedicated shadow IndexedDB under the constant synthetic UID `demo-v3-synthetic-only`. A hard-coded *synthetic event* represents a second device. No real Firebase credential, user UID, Firestore request, Google Drive connection or live vocab is used. The mock admin claim and all metrics are intentionally fabricated and do NOT grant real admin rights.

The standalone page has a restrictive CSP (`connect-src 'none'`), no public discovery/indexing, no external scripts, no localStorage writes and no destructive user controls. Staging `site-v3-demo.html` has NOT been deployed or linked from `index.html`, and its GitHub file view is not itself an interactive browser deployment.

New `tests/site-v3-demo.test.cjs` executes the demo modules in synthetic JSDOM + fake-indexeddb, tests trilingual navigation, cards, favorites, custom word, mock two-device merge without double counting, read-only history, mock admin, and reopening the demo with preserved synthetic data. Run through staging-only GitHub Actions; tests are not a substitute for testing an actual old Safari browser or authorized site origin.

**Next owner-approved steps:** a genuine isolated hosted preview (without reusing the production origin and before touching any production script); a complete old-Safari compatibility check; true browser tests of real existing learning modules; design a staging-only bootstrap bridging public catalog and shadow store; secure admin metrics source and custom claim; and a fresh owner-reviewed backup immediately before any real data migration. Do not deploy/migrate without explicit permission.

## Isolated /v3 preview — 2026-11-03

The full PUBLIC training catalog was copied byte-for-byte from production `main/data.js` to `staging/data-public.js` (1,296 terms, 84 phrases, 183 Mediatri notes, 212 keyterms, 40 scenarios, 21 headings). `rs-v3-public-catalog.js` validates identifiers and FI/RU/EN terms and provides bounded search; it never reads private progress. The STAGING UI now has cards, a real-public-vocabulary practice quiz, bounded dictionary search, Mediatri scenarios/phrases/headings, mock two-device sync, local recovery audit and a synthetic administrator preview.

New tests `staging/tests/v3-public-catalog.test.cjs` and expanded `site-v3-demo.test.cjs` pass on the reviewed v3 source commit `32fdf6877b0a48de7a281217139803eaf163138f`, alongside emulator CI. This is a public dictionary SNAPSHOT; if the real site's data.js later changes, the next update must recompare and revalidate before redeploy.

A copy of the 8 exact tested scripts plus demo HTML was created at **`v3/` only** in the separate existing test repository:
https://github.com/velardream-ctrl/riveria-sanasto-community-test/tree/main/v3

The existing TEST repo root index.html was independently checked and remains blob SHA `09e7b24556da193d013256bf271cd0bfd3eafe60`. Main Sanastoyhteiso production `main` is untouched, PR #8 remains DRAFT. No real accounts, Firebase, Firestore, Google Drive, personal words or scores were copied. The preview's synthetic answers live in an independent browser IndexedDB under a fixed fictional UID.

EXPECTED GitHub Pages location if Pages publishes from test repo main:
https://velardream-ctrl.github.io/riveria-sanasto-community-test/v3/
This URL was **not verified as served** from the available environment (network/DNS access unavailable); never claim browser/public deployment success without opening it. User should check the link on a physical device; CI is JSDOM and Firestore Emulator, not real Safari.

Do not replace the old test repo root, its service worker, or any production HTML, do not link this v3 sandbox into production, and do not turn synthetic auth/metrics into real claims without a server-side admin role. Next: browser verification and targeted fixes, then only separately approved real Firebase pilot with fresh independent JSON + Sheets backup.
