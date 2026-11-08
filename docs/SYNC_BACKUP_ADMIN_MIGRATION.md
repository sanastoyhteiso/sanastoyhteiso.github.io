# Sanastoyhteisö: Safe migration plan — offline progress, Google Sheets backups, admin tools

Status: DESIGN ONLY. No live migration, Firestore rules deployment, OAuth changes or admin access changes. 
Project: `sanastoyhteiso/sanastoyhteiso.github.io`.
As of 2026-11-02 the published catalog has 1,296 stable term IDs, plus 84 common phrases, 183 Mediatri phrases, 212 key terms, 40 scenarios and 21 headings.

## Verified current architecture

- GitHub Pages is a static origin; the published multilingual catalog loads from `data.js` and is cached by `sw.js`.
- `family.js` uses Firebase Authentication with `LOCAL` persistence, and on-device per-user localStorage keys.
- `community.js` stores private progress events in **each user's own Google Drive** `Riveria Sanasto Private v2` spreadsheet, using `drive.file` and a Google Identity Services access token **held only in memory**.
- That token expires and must be requested again; `home-refresh.js` cannot sync the Drive sheet without a valid token. Connecting Drive again is therefore expected, not caused by offline caching.
- `account-settings.js` already writes selected profile/settings metadata to Firestore.
- Current progress event merging uses `Math.max` for counters; two devices answering independently can lose additive counts. Don't port this assumption into the new merge algorithm.
- Firebase Security Rules and administrative role assignments are **not present in this GitHub repository**. Read live rules before any database write or role change.
- This repo has no privileged server process; a static GitHub Pages JS file must never contain a service-account key, OAuth client secret, Firebase Admin SDK credentials, or privileged backup token.

## Architecture decision

| Data | Operational source | Offline | Independent backup |
| --- | --- | --- | --- |
| Public FI/RU/EN vocabulary | Versioned static GitHub Pages catalog, edited in master Google Sheet | Versioned service-worker cache | Source Google Sheet + dated snapshot sheets/versions |
| Personal vocabulary | Per-UID Firestore documents after verified migration | Local IndexedDB and an append-only pending-event queue | Restricted Google Sheets archive, scheduled and versioned |
| Scores, learned status, favorites | Per-UID Firestore records/events | Local IndexedDB queue | Restricted Google Sheets archive, scheduled and versioned |
| User settings/subscriptions | Firestore | Local cache | Restricted Google Sheets archive |
| Admin telemetry | Aggregated opt-in/minimal diagnostic documents | None needed | Redacted periodic archive if needed |

The **master dictionary sheet remains directly editable** and reviewable; a controlled export publishes validated releases of `data.js`. Do not create 3 copies of each term (FI, RU, EN are fields on one stable ID).

Keep old personal Google Sheets in place **read-only after cutover**; do not delete or revoke them until restoration tests succeed. Since they belong to individual users, they cannot all be silently harvested by the site administrator: each user/owner authorization or a lawful separate server-side backup process is required.

## Phase 1 — protected progress sync, separate from Drive

### Prerequisites (must be verified live via Firebase administrative access)

- Project ID, the actual database type/region/plan, Firestore Security Rules, indexes, authorized Firebase Auth providers, and the current number of users.
- Full inventory of existing `users`, `settings`, `libraries` document schema and whether each user's Drive event sheet is reachable by that user.
- Verify UID-specific permissions before publishing any client that writes Firestore.
- Confirm the new backup destination is access-restricted and users have an understandable privacy notice.

### Proposed per-user data model

- `users/{uid}/state/progress`: schemaVersion, revision, updatedAt, learned state, aggregate counters; access only by UID or authorized admin.
- `users/{uid}/events/{eventId}`: idempotent immutable event (deviceId, termId, action, timestamp, revision). Use UUID/crypto randomness in supported browsers; preserve compatibility for old Safari.
- `users/{uid}/words/{wordId}`: custom FI/RU/EN word, topic, timestamps and tombstone for deletion.
- `users/{uid}/settings/main`: direction, selected libraries, profile preferences.
- `system/catalog`: dictionary version, URL, checksum, release notes.
- `system/health`: aggregated metrics only, no patient or lesson content.

Exact collections are provisional until live rules and existing docs have been inspected. Do not overwrite any existing Firestore `users/{uid}` profile fields.

### Data safety

1. Make a snapshot of current master dictionary and as much *authorized* per-user event data as is available.
2. Add new Firestore sync behind a default-OFF feature flag, preserving old Drive path as fallback.
3. Locally save each new answer first; enqueue unique `eventId`, not just increment `correct`.
4. Upload in limited batches only when active, connected, authenticated, and changed.
5. Wait for server acknowledgment before marking local events as synced; retries with exponential backoff and jitter; no silent loss.
6. Reopen/focus/online events trigger bounded sync when active, no 24/7 background polling.
7. Test: offline 50 answers; device close/reopen; phone + browser concurrent activity; token expiry; no double counting; partial writes; user switch; restore from backup.
8. Compare per-UID counts and term IDs across local state, old Google Sheets and Firestore. Only then gradually enable for a small group, with one-click rollback flag.
9. **Never merge by additive max-of-device-count**. Per-event deduplication or server transactions are needed. Test conflicts before production.

The Firebase Web SDK can store Firestore data offline, but persistence is not guaranteed on every old browser and can retain personal data on a shared device. The existing local cache remains a fallback; obtain any required user consent for persistent local caching.

## Phase 2 — admin panel secured on server

- Visible as `Настройки сайта` under `Данные` **only** if signed-in user has a valid server-issued `admin` claim.
- Firestore Security Rules **must independently enforce** admin read access; hiding a menu is not a security boundary.
- Set the claim only from Firebase Admin SDK / privileged access; never make a public 'make me admin' endpoint or trust email/client flags.
- Read-only overview first: count of registered users (only if securely exposed from admin service), 7d/30d active count based on a privacy-respecting opt-in/minimal activity record, sync failures by category, last successful backups, catalog version, approximate Firestore operations/quota alerts and published libraries.
- Logs must redact secrets, emails by default, patient information, tokens, quiz answers, and personal vocabulary. Retain for a fixed short period and provide a user-data deletion policy.
- A browser-only static GitHub Pages app **cannot securely list all Firebase Authentication accounts**: use a privileged service via approved plugin/Admin SDK or report a server-maintained aggregate with server rules.
- Do not add administrative delete, account impersonation, reset, or bulk-change controls at launch.
- Distinguish registered users, signed-in users, active learners, and anonymous page visitors; these are not the same count.
- Avoid a fresh Firestore database query on every dashboard render; aggregate and refresh on demand with a minimum interval.

## Phase 3 — catalog updates & backups

### Public catalog

- Master Google Sheets: FI, RU, EN, review status, topic, stable ID.
- Publication is **one-way only**: validated master sheet -> versioned JSON/data.js -> published GitHub Pages.
- Release manifest `catalog-version.json`: version, timestamp, term count, checksum and cache filename.
- Active web app checks the tiny manifest on first visible-online load and periodically (suggest hourly, conditional HTTP requests); no request per card.
- Download and verify new catalog in a separate cache first; keep previous version until successful; don't clear user scores or replay stale content.
- Manual `Обновить словарь` remains as fallback. Online indicator and `Каталог обновлён` are separate statuses.
- The master dictionary Google Sheet also receives immutable dated snapshots. An accidental deletion from the live master must not overwrite every snapshot.

### Per-user backups

- **Do not confuse a mirror with a historical backup**: keep at least multiple dated versions and a testable restore path.
- Use a separate restricted administrator-controlled backup spreadsheet/archive with least privilege and pseudonymous UIDs; do not make private user records available to other learners.
- Prefer batched, incremental exports only after verifying secured access to Firestore. Scheduling (e.g., Apps Script triggers) requires one-time OAuth authorization by the script owner and appropriate Google Cloud permissions. Verify free account quotas and GDPR notice before activation.
- Suggested backup manifest fields: snapshotId, ownerUid, timestamp, schemaVersion, sourceRevision, rowCount, checksum, success, restoreTested.
- Write backup to new snapshot/staging, validate counts and checksum, **then** mark the snapshot successful. Never replace the last good snapshot.
- Restore is admin-supervised and *read/compare/dry-run first*; test reconstruction on an isolated staging environment; never bulk-overwrite live data silently.

## Free-tier boundaries

- The free Firestore quota is **not** a free managed backup service: backup/PITR/restore/clone and managed export/import generally need billing/Blaze. Use independent Sheets snapshots in Spark, acknowledging these are custom exports, not Firestore's native point-in-time backup.
- Prevent endless reads: no per-card server reads; batching, debounce, active-only sync; exponential backoff and quarantine of malformed events.
- Apps Script free accounts have daily runtimes and per-execution caps. Backups may need to be split into paginated chunks as the user base grows.
- GitHub Pages has no private privileged server; any admin user list, private backup job or mutation of server roles must run in an authenticated privileged environment outside public JS.

## Deployment safety gate — do not release until ALL are met

- [ ] Firebase management connection authorized by project owner (no secrets or keys pasted into chat)
- [ ] Actual live Firestore rules reviewed and backed up; proposed rule tests pass
- [ ] Owner/admin account UID confirmed in secure console and administrator grant authorized
- [ ] Existing users and old per-user Drive state inventoried; successful old-state backup
- [ ] Firestore schema and migration tested using sample users with different devices
- [ ] Backup schedule tested and snapshot restoration independently verified
- [ ] Privacy notice updated and access scope approved
- [ ] Quota projected for expected active users, alert/monitoring configured
- [ ] Rollback mechanism validated; new sync behind feature flag
- [ ] No regression on production GitHub Pages, old Safari/iPad and offline use
- [ ] Post-deployment verification on the actual published site

## Minimum actions required from project owner

1. Connect the Firebase project management integration or grant equivalent access via trusted authenticated Firebase console (not by sending credentials).
2. Approve the exact administrator account and any scope change for centralized backups of learners' private data.
3. Grant one-time OAuth consent for an owner-run scheduled Google Apps Script backup if that architecture is selected.
4. Review the privacy notice changes before collecting new activity metrics.

Everything else—implementation, dry-run migration, test code, GitHub PRs, release notes and validation—can be done with enabled and appropriately authorized tooling.
