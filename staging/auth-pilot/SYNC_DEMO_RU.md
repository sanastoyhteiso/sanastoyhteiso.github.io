# Synkronointi kahden laitteen välillä / тест синхронизации на двух устройствах

**Status: staged, NOT published to real Firestore.** This is an independent
synthetic-data pilot: it never reads the live site's scores, favorites or words.

## Architecture

- UI: staging/auth-pilot/sync-demo.html (same Firebase 8.10.1 compatible SDK as verified iOS12 profile pilot)
- Client: sync-demo.js, exact staging project guard + verified Google Auth from existing adapter/controller
- Pure engine: sync-demo-core.js, cryptographically randomized event IDs, strict validation,
  per-UID namespaced local DEMO queue (60 max), cloud/local merge by stable ID, no double-counting
- Server: proposed isolated rules in
  staging/backend/firestore.v3-development-with-sync-demo.rules,
  which are the previously tested development rules with a new *only*
  \`sync_demo_v3/{uid}/events/{eventId}\` subcollection. Real \`sync_v3\`
  (immutable study history) and baseline creation remain unchanged.
- Demo events contain only v, uid, id, device, kind, target (DEMO_CARD_A/B/C),
  time, correct, demo:true — NO personal vocabulary or private metrics.
- Server listens with .orderBy('time').limit(100).onSnapshot(); remote updates
  are automatically shown on the other device while the page is active.
- Answer clicks synchronously persist to the local demo queue then retry
  to Firestore. A remote document with same ID must match the payload.
  Cloud & pending entries are deduplicated by ID.
- The owner has an explicit cleanup action to delete these pilot documents.
  Deleting actual learning history remains FORBIDDEN.
- NOTE: localStorage is used only for synthetic demo queue and is not atomic
  across concurrent browser tabs. Run one tab per device. Production migration
  must use the previously prepared transactional IndexedDB shadow store.

## Manual release gates

1. Green emulator suite for original rules AND extended pilot rules.
2. Owner verifies new project ID exactly \`sanastoyhteiso-v3-development\`.
3. Owner copies **ENTIRE** new rules file to that project's Rules tab and
   publishes deliberately, ONLY after verifying the correct project.
4. Deploy sync-demo.html/js/core into isolated test repository only at
   \`velardream-ctrl/riveria-sanasto-community-test/v3-classic/auth-pilot/\`.
5. On iPhone + iPad open .../sync-demo.html, same verified Google test account.
   Answer DEMO A on iPhone; verify count appears on iPad automatically.
   Answer DEMO B on iPad; verify count on iPhone. Test offline, then online.
6. Delete synthetic answers with the provided button when done.

Never modify production main, Firebase, original Google Drive, or live user data.
This pilot is NOT a finished migration or proof of production offline safety.
