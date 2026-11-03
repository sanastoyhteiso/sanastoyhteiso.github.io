# V3 Firestore profile pilot — SAFE STAGING ONLY

This is a deliberately isolated test page for the new Firebase project \`sanastoyhteiso-v3-development\`.

- Source: \`staging/auth-pilot/profile.html\`, \`staging/auth-pilot/profile-pilot.js\`.
- Test site deployment target: \`velardream-ctrl/riveria-sanasto-community-test/v3-classic/auth-pilot/profile.html\`.
- Existing test site \`auth-pilot/{config,guard,adapter,controller}.js\` are reused unchanged.
- Copy \`staging/backend/rs-v3-profile-contract.js\` as \`profile-contract.js\`, and \`staging/backend/rs-v3-firestore-profile-store.js\` as \`profile-store.js\` into the *test repo only*.
- Test-only Firestore Security Rules must already be published by the owner.
- Read/profile lookup is initiated only by user clicks; profile creation is triggered only by the explicit **Create test profile** button.
- The Firestore test of cross-account access reads a fixed **synthetic, never-real UID** with \`source: server\`; success means \`permission-denied\`. It never displays returned document contents.
- Initial profile has \`learned=0\`, \`publicStats=false\` and no vocabulary, events, emails or passwords.
- No production site, \`main\`, existing Firebase, production UIDs, Google Drive, or personal study data may be touched.
- UI is currently Russian-language pilot; main FI/EN/RU app remains unchanged.
- Actual iPhone/Safari and real rules must be tested before asserting browser success.
- A green CI covers synthetic rules and static pilot tests, **not** successful real Firebase profile registration.
- Never create a production baseline or migrate live scores in this pilot.
