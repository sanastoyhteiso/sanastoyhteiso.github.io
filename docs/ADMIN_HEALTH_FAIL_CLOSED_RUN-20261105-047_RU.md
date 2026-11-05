# RUN-20261105-047 — TEST админ-центр: отказ от ложного «ОК» при отсутствии мониторинга

**Дата:** 2026-11-05, Europe/Helsinki. **Этапы:** D/E/H, новая задача NEW-007. **Состояние:** код и изолированные CI выполнены, published TEST Cloud Rules и реальные heartbeat **не проверены**.

## Найденный дефект
До исправления в DRAFT TEST PR #3 статус `ОК` мог показываться на основании только `monitoringActive:true`, свежего `updatedAt`, `siteStatus:'ok'` и `criticalOpen:0`. При остановившемся сборщике ошибок или агрегаторе «ОК» был бы недостоверен. Вкладка «Резервные копии» также могла выводить дату `verifiedBackupAt`, даже если серверная сводка неактуальна или настоящего provider readback нет.

## Исправлено, только в DRAFT TEST PR #3
- [admin-page.js](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/v3-unified-preview/admin/admin-page.js): `usableReport()` теперь требует в дополнение к активному мониторингу `monitoringCoverageVerified===true`, свежие (<15 мин) `ingestionHeartbeatAt` и `aggregationHeartbeatAt`, плюс свежий `updatedAt`. Без этих признаков отображается «Нет данных», а не нулевые счётчики и ложный «ОК». Для даты backup требуется `backupProviderReadbackVerified===true`, `backupManifestChecksumVerified===true` и время последней копии до 30 часов; недостоверную или будущую дату не показываем.
- [admin-access.test.cjs](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/tests/admin-access.test.cjs): регрессии на отсутствующие/просроченные heartbeats и checksum/readback, возраст копии, будущую дату, честный положительный синтетический случай. Проверены сохранение доступа только для администратора и read-only.
- [admin/index.html](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/v3-unified-preview/admin/index.html) и [sw.js](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/v3-unified-preview/sw.js): cache-bust для admin-page.js v=admin-health-3 и отдельный TEST cache v7; старые скрипты не должны подменить исправление после будущего TEST release.

## Контрольные коммиты и CI
- [JS fix 76633ae](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/76633ae2f53cfe0ce4bec69029b9336c8f442cd1), [test a6e53bb](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/a6e53bb6dfaeff3bca201cbc20eb7325068084e2), [HTML 283a59f](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/283a59f7dbeb3ab7a2a88779ee82340ec971bf95), [SW 388e0c2](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/388e0c2a69f842642d3c7dc0f269a52f0a804b77), [test cache 39b217d](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/39b217db74db17a1afcf3fbcc2278837381dcc85).
- [TEST admin regression #42018755573](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42018755573) **SUCCESS exact HEAD 39b217db**: 61/61 TEST Node checks, no server writes.
- [TEST Firestore emulator #42018755619](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42018755619) **SUCCESS exact HEAD 39b217db**: 90/90 access rules cases, no live project access.

## Чёткие ограничения
- Эти heartbeat/coverage/proof поля пока лишь **контракт** будущего доверенного серверного агрегатора. В опубликованной TEST Firebase их наличие не доказано; поэтому реальная панель при отсутствии полей честно покажет NO DATA. Значения в локальном mock **не равны** настоящей работающей диагностике/Google Sheets backup.
- Никаких правил Firebase в облаке, новой роли, пользовательских слов/ответов, real telemetry, ZIP upload, production/TEST main, тарифа и живого сайта не изменялось. PR #3 остаётся DRAFT, серверный backend/авторизация и iOS12 физическое тестирование требуются.
- Владелец подтвердил, что RUN-045 Work закончился до чтения TEST Cloud Rules; RUN-045 закрыт как BLOCKED, не PASS.

**Далее:** независимое code review диагностики и серверной схемы агрегации с минимальным GDPR data, затем в авторизованном Work проверить published TEST rules и реальную ID-token/allow-deny без изменения облака. Публикация — только после всех A–I gates и отдельного GO владельца.
