# Sanastoyhteisö 3.0 — RUN-019: после ручной публикации TEST Firestore Rules

**Дата:** 05.11.2026, Europe/Helsinki. **Статус:** PARTIAL / OWNER_REPORTED_PUBLISHED; cloud read-back, роли и админ-страница ещё не проверены.

## Что сообщил владелец
После RUN-018 владелец сказал: «Новый код опубликовал». Это означает **публикацию со слов владельца** для тестового проекта `sanastoyhteiso-v3-development`, а НЕ независимое API-подтверждение номера release/времени или прямого live-permission. Ни один GitHub инструмент не менял Firebase в RUN-019.

## Исходная доказательная база
- [Полный подготовленный TEST ruleset](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/bb3b39dea3cfc5cf5a8c0eca1ad95510ad9f98b3/admin/security-tests/candidates/FIRESTORE_V3_DEVELOPMENT_FULL_FOR_MANUAL_REVIEW.rules): все права ученика сохранены, добавлен только allow get `admin_metrics/current` для verified `admin == true` и `firebase.sign_in_provider == 'google.com'`; любые browser writes/list запрещены.
- [Native Firestore Emulator на окончательном TEST HEAD](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41945223658) 86/86 PASS; это подтверждает offline fixture, а не опубликованные серверные настройки.
- [TEST PR #3](https://github.com/velardream-ctrl/riveria-sanasto-community-test/pull/3), HEAD 94d37e5d71d8355845f7a82abd5b91df86d388e7 при начале RUN: draft, open, не merged. `v3-unified-preview/admin/index.html`, `admin-page.js`, `admin-entry.js` есть только в TEST feature branch, но **`v3-unified-preview/admin/index.html` отсутствует на TEST `main`**, поэтому появление admin UI на публичном GitHub Pages ещё не подтверждено. Прямое открытие страницы через web-tool не удалось; не утверждать независимый HTTP status.
- В TEST feature branch `admin-page.js` слушает `auth.onIdTokenChanged`, требует `user.emailVerified === true` и `getIdTokenResult(...).claims.admin === true`, затем выполняет только `db.collection('admin_metrics').doc('current').get({source:'server'})`. Это read-only UI; у него нет механизма выдачи роли или генерации метрик.
- Рекурсивная проверка полного TEST feature tree (175 entries) не выявила доверенного Firebase Admin SDK backend/Cloud Function или скрипта назначения admin custom claim. Это поиск **в этой ветке**, не утверждение об отсутствии инфраструктуры вне GitHub.
- Официальная документация Firebase: https://firebase.google.com/docs/auth/admin/custom-claims. Custom claim `admin=true` назначается **на доверенном сервере** Firebase Admin SDK, распространяется при получении нового ID token; `setCustomUserClaims` перезаписывает существующие custom claims (если не сохранить их предварительно).

## Следующая безопасная последовательность — без действий над реальными пользователями
1. В TEST Firebase Console → Firestore Database → Rules → History проверить последнюю опубликованную версию и время. Сверить проект `sanastoyhteiso-v3-development`, базу `(default)`. Не копировать в GitHub email, UID, приватные документы, секретные токены.
2. TEST Firebase Console → Authentication → Users: владелец локально проверяет, что его собственная учётная запись действительно есть в **этом** проекте, Email verified, вход через Google. **Не** передавать UID или email в публичные Issue/документы.
3. Согласовать разовый защищённый способ назначения `admin:true` **только одному точно идентифицированному TEST UID** через Firebase Admin SDK в доверенном окружении; сохранив все существующие custom claims, имея журнал и процедуру отката. Ни GitHub Pages, ни Firestore Rules не способны выдать custom claim.
4. До публикации TEST admin UI провести code review и изолированную проверку URL; нынешний PR #3 draft/unmerged. Не объединять PR и не менять test `main` без отдельного согласования.
5. Создавать `admin_metrics/current` только доверенным backend с агрегированной/обезличенной информацией, без личных учебных данных; на Spark может потребоваться отдельное бюджетное решение (НЕ активировать тариф без согласования).
6. Выполнить реальные allow/deny тесты **двух** TEST аккаунтов после авторизованного setup, затем UI/мобильный Safari и отдельно определить GO. Не объявлять этапы B/C/E/H готовыми по одной публикации Rules.

## Принцип безопасности
Не размещать service account JSON, доступы/refresh token, Firebase ID token, пароль, UID и адрес email в общедоступном GitHub или чате. **Production** (`sanastoyhteiso.github.io`, Firebase `riveria-sanasto-community-test`) не трогать, PR не merge и не предпринимать Firebase/Auth/Firestore cloud actions в этом аудите.
