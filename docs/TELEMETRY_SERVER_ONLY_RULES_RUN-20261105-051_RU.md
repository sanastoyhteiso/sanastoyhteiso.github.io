# RUN-20261105-051 — TEST-only закрытый доступ к сырым диагностическим событиям

**Дата:** 2026-11-05, Europe/Helsinki. **Результат:** Security Rules candidate и локальные проверки сохранены. **Реальная Firebase не менялась.**

## Контекст и граница безопасности

У Sanastoyhteisö 3.0 уже есть отдельные черновые диагностические компоненты RUN-048/049/050: whitelist-only schema, ES5 in-memory очередь и серверная mock-обработка. Реального доверенного ingress с подтверждённой Firebase Authentication, IAM, антиспам-квотами, сроками хранения и пользовательским GDPR информированием ещё нет. Пока такой backend отсутствует, браузеру нельзя открывать прямую запись `telemetry_reports` в Firestore: это создало бы риски раскрытия и расходования квот.

**Официальные принципы Firebase:** Firestore Security Rules применяются к клиентским SDK, но серверный Admin SDK и серверные библиотеки работают через IAM и обходят клиентские Rules; `allow` в перекрывающихся match комбинируются по OR. Явное `false` не отменяет другого `true`.

## Реализовано без облачных операций

**Репозиторий:** `velardream-ctrl/riveria-sanasto-community-test`, ветка `feat/admin-control-center-package-spec-20261104`, **PR #3 DRAFT**.

- [NEW-008 Security Rules candidate](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/security-tests/candidates/FIRESTORE_V3_DEVELOPMENT_NEW008_TELEMETRY_SERVER_ONLY_REVIEW.rules) — **только для review/emulator**, производная NEW-006 с одной явной секцией `match /telemetry_reports/{reportId}`, отказывающей guest, ordinary и admin браузерным клиентам в `get/list/create/update/delete`. Historical NEW-006 candidate и user-supplied fixtures не изменены. [Коммит d3ea901](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/d3ea901d406eab062d064db98f30943c6d52ca60).
- [Emulator tests](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/security-tests/security.telemetry-server-only.test.cjs) — 16 новых проверок: отказ сырых диагностических GET/LIST/CREATE/UPDATE/DELETE всем клиентам, сохранение владельческого `users`, `sync_v3`, отдельного `admin_metrics/current`. Byte-for-byte сравнение кандидата и NEW-006 после удаления единственной новой секции. [Коммит c44218a](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/c44218a2c87ff1ffee3c4567e8aecd1f1d4d93ae).
- [Emulator CI hook](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/cb34400fd2ce5bdb96a3f58c2110f235a7326934): `npm run test:emulator` запускает новую группу. [GitHub Actions #42040317116](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42040317116): **SUCCESS exact code HEAD cb34400fd2ce5bdb96a3f58c2110f235a7326934**, все **106/106** Firestore Emulator тестов PASS; стандартные 90/90 сохранены. Отдельный admin regression CI также SUCCESS на code HEAD.
- [Инструкция ревью перед облачным TEST пилотом](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/security-tests/README_TELEMETRY_SERVER_ONLY_RUN-051_RU.md), [commit 165c580](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/165c580379029f0c81d981226d5d5616ee5d7696).

## Что ещё НЕ готово

Настоящие опубликованные TEST Firebase Rules `sanastoyhteiso-v3-development` и их revision неизвестны — RUN-045 BLOCKED, не SUCCESS. Эмуляторные проверки доказывают только поведение ревью-кандидата; нельзя просто заменить ими действующие правила. Нет настоящего backend, Firestore raw storage, настоящих Admin SDK/IAM операций, consent/retention, мониторинга all devices, trusted heartbeats, реальных двух аккаунтов/устройств и iOS12 acceptance.

В рабочую Firebase `riveria-sanasto-community-test`, рабочий сайт, production `main`, TEST default main, тариф и пользовательские данные не вносились изменения. PR #3 остаётся DRAFT, этапы D/E/H/NEW-007/NEW-008 и весь A–K остаются OPEN/NO-GO.

## Следующее безопасное действие

Получить read-only опубликованную TEST версию Rules и server rights через одну авторизованную сессию Work/Cloud Shell; сравнить с NEW-003/006/008 и зафиксировать known SHA/version, затем только после отдельного согласия на TEST cloud изменения определить обслуживаемый backend, IAM, consent, quotas и оплату. Не подключать реальный сбор без этих условий.
