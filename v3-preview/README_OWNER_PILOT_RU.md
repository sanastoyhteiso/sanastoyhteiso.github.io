# Sanastoyhteisö 3.0 — OWNER PILOT (draft, do not deploy yet)

This directory is an **isolated copy of release V3 assets** inside a branch based on the original production main. The root website files remain identical to main.

## Owner gate and limitations

- `/v3-preview/` checks the exact PROD project and domain, requires an enabled verified Google provider and a **fresh Firebase ID token** with strict `admin === true`; app code is not loaded before the owner explicitly ticks acknowledgement and presses launch.
- Static client gating is **not a security boundary for Firebase data**. Real authorization is governed by server-side Firestore Rules, which still require live allow/deny tests with a normal account and owner account.
- The directory is under the **same origin** as the existing site, so localStorage, IndexedDB and old root service worker can interact with the pilot. Only the owner's account should use this route. No student should receive the link. Do not use it to perform live learning writes until a recoverable private backup has been verified.
- The copied `sw.js` uses its own cache prefix and never deletes legacy root caches. The existing main `sw.js` may still intercept the pilot's **initial** navigation and offline fallback before the pilot worker takes control; therefore require a live browser reload and verify offline routing before declaring supported.
- The candidate app uses `riveria-sanasto-community-test` and **real owner data**, including opt-in sync controls. Do not enable opt-in sync before backup/restore acceptance.
- `admin_metrics/current` is absent in the last owner Cloud readback. Its presence in published Rules **does not** create server monitoring or prove client permissions. Do not show 0 errors as healthy.
- ZIP updating postponed until AFTER first launch.

## Required before any merge to main

1. Confirm unchanged main root files, source SHA and rollback `backup/production-before-v3-20261104`.
2. CI green on this PR **AND** manual inspection that pilot assets resolve without touching root, including the old root SW/Cache Storage.
3. Real Firebase Auth owner browser sign-in, non-owner denied; evaluate backend security via separate read-only client allow/deny.
4. Export/verify private backups, prove isolated restore before any V3 write; test modern phone/desktop and old iOS12.
5. Explicit owner review and GO for merging this **pilot-only** PR. Never merge full release PR #9 as a shortcut.

This branch is a preparation artifact. Existence in GitHub does **not** mean the URL is live on GitHub Pages.
