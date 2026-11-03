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


## Отдельный старый iPad (Safari iOS 12)

- Обнаружено на реальном iPad: `profile.html` с Firebase JS 12.19.0 показывала «Google-вход: Заблокировано» до попытки входа, но на iPhone работала. Точная причина до диагностики неизвестна (возможна несовместимость SDK).
- Изолированная резервная страница `profile-legacy.html` использует официальные *namespaced* Firebase JS 8.10.1 (firebase-app.js, firebase-auth.js, firebase-firestore.js), которые совместимы по API с нашим проверенным adapter/store. Она не меняет исходную современную страницу `profile.html`.
- Скрипт `profile-legacy-pilot.js` копирует проверенную логику с отдельным строгим URL и безопасным кодом этапа запуска. Никаких Firebase Admin прав или секретов.
- Старый SDK — только временная совместимость на изолированном development Firebase. Перед долгосрочным использованием нужно оценить поддержку/безопасность и протестировать браузер, а затем применить современный поддерживаемый подход там, где возможно.
- Вторая страница не импортирует словари или личную историю; создание профиля требует доказанного `permission-denied` для фиктивного UID и *отдельного нажатия владельца*.
- На iPad сначала нажать вход, потом «Проверить отказ чужому UID», потом «Прочитать профиль» (не нажимать «Создать», если профиль с iPhone уже существует). Ожидается Velar, 0, Закрыта. Если виден код этапа, сохранить только скриншот без UID.
- До фактического теста нельзя заявлять, что iPad теперь работает.
