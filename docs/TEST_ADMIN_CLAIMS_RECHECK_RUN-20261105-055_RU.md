# RUN-20261105-055 — повторная проверка TEST Firebase Admin claims перед назначением

**Дата:** 2026-11-05, Europe/Helsinki. **Состояние:** TEST DRAFT PR #3 code+offline CI успешно, реальный Firebase Auth/API и роль администратора НЕ менялись.

## Найденный риск

Owner-operated `admin/ops/assign-test-admin.cjs` ранее получал `getUser(uid)`, показывал пользователю UID/email/claims, затем принимал вручную email и подтверждение, сохранял старый claims map и вызывал `setCustomUserClaims(uid, ...)`. При изменении других custom claims другим администратором во время ввода подтверждения скрипт мог перезаписать эти новые роли. Согласно [официальной документации Firebase](https://firebase.google.com/docs/auth/admin/custom-claims), `setCustomUserClaims` заменяет весь existing claims map; серверные ограничения требуется защищать отдельно.

## Изменения (только DRAFT TEST PR #3)

- [Code commit a9b6d3b](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/a9b6d3b4f8856840bfa12d4f8b61193840472cfd): после второго текстового подтверждения всегда повторный `auth.getUser(uid)`. Запись запрещена, если UID/email/активность/emailVerified/Google-провайдер или любое ранее прочитанное custom claim отличаются. Только после повторного чтения и успешной сверки формируется локальная backup file с режимом 0600 и запускается `setCustomUserClaims(uid, mergeClaims(freshClaims))`.
- [Regression commit 2a64f21](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/2a64f21822b881582c7cd43b6b17eafc5e41c401): 9 новых Node тестов совпадения/изменения nested claims, удаления/добавления прав, смены admin, UID/email, disabled/verified/provider, порядка ключей; статическая проверка последовательности fresh read → compare → local backup → write.
- [Owner guide commit db2b64a](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/db2b64a2441216f314784b0b0ec1fb13c248027c): безопасный Cloud Shell процесс и остаточная race-window записаны в `admin/ops/README_TEST_ADMIN_CLAIM_RU.md`.

## Проверка

[GitHub Actions TEST admin regression #42090989816](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42090989816) — **SUCCESS exact HEAD `db2b64a2441216f314784b0b0ec1fb13c248027c`**. Admin regression 70/70, telemetry schema 21/21, ES5 queue 22/22, ingestion mock 23/23. Все без Firebase cloud credentials/записей.

## Границы / NO-GO

Проверка перед записью уменьшает риск, но **не является атомарной**: Firebase Admin SDK не предоставляет этому скрипту транзакционную операцию compare-and-swap. Краткая гонка между последним чтением и `setCustomUserClaims` остаётся. Ролевые изменения выполнять только владельцем в закрытом отдельном сеансе без параллельной работы над claims и с явным подтверждением, сначала `--dry-run`. Ни один `--apply`, live `getUser`, реальная Firebase Rules проверка, тариф/сайт/UID/личные данные не затронуты.

TEST default main, LIVE Firebase `riveria-sanasto-community-test`, production `main` и Release PR #9 не изменялись. DRAFT PR #3 остаётся черновиком. Все этапы A–K, NEW-001/007/008 и RUN-045 Cloud Rules readback блокер открыты.

## Следующий шаг

Для реального продвижения требуется авторизованный **read-only** доступ к опубликованным правилам `sanastoyhteiso-v3-development` (отдельный TEST-only Firebase Plugin/Work scope). Только после сверки действующего ruleset можно обсуждать отдельное owner-approved назначение admin и synthetic TEST pilot. Не заменять облачные доказательства офлайн-тестами.
