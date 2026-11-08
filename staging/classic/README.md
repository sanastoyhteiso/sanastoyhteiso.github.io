# Sanastoyhteisö 3.0 Classic — STAGING ONLY

This is a test-only copy of the existing familiar site layout. Production main, user accounts and data must remain untouched. Do not merge PR #8.

## Contents
- Existing UI preserved: app.js, index.html, style.css, mobile-nav.js, i18n.js.
- data-public.js is a copy of the public 1296-term FI/RU/EN catalog and 183 Mediatri sample notes.
- rs-mediatri-guide.js adds the first Kirjaamisopas tab with shift selector, real Mediatri heading selector, grouped sample phrases and a reference for the headings photographed by the user (Hoidon toteutus, Yöhoito, Vuorohoito, Lisäotsikot and Mittarit). Editorial mapping is educational, not clinical authorization.
- rs-admin-preview.js displays only mock admin metrics in the existing Data section. No real custom claims are enabled.
- rs-demo-offline.js sets a synthetic login-free account and isolated demo storage key prefix. No real Auth, Firestore, Google Drive or user records.
- Language: browser language on first visit, then FI, EN and RU buttons in the header, 44px+ tap target; no visible Automatic choice.
- Mobile fix: the bottom nav is explicitly position:fixed with bottom:0 up to 900px, with safe-area padding inside the bar and content reserved beneath it. Long Finnish terms can wrap.

## Validation
- GitHub Actions runs staging/tests/classic-v3-ui.test.cjs and other staging regressions plus Firestore emulators.
- JSDOM and syntax checks are NOT physical Safari/iOS 12 checks. Reproduce the original user screenshots on a real iPhone and old iPad before considering navigation clipping fixed.
- The staging build is copied without modifying the root of the old test repo to v3/classic/ and the redundant v3-classic/ test alias. Both copies are isolated from the production host.
- Primary expected preview: https://velardream-ctrl.github.io/riveria-sanasto-community-test/v3/classic/
- External GitHub Pages page loading could not be verified by the current web tool. Do not assert confirmed live browser availability.
- Test scores are synthetic and will NOT transfer to the user's real account; no personal JSON uploads or patient information.

## Next
Verify on iPhone (including long terms such as munuaiskeränen / glomerulus and aikuisissa), iPad Safari 12 and desktop, confirm Mediatori heading semantics against unit policy, then plan fresh verified backups and an explicitly approved real-data pilot. Do not alter the live site, Firebase rules or Google Drive sync before approval.
