# RUN-20261105-063 — подтверждённый красный регрессионный тест NEW-009 без изменения исходного V3 кода

**Дата:** 2026-11-05 (Europe/Helsinki). **Итог:** TEST HARNESS SAVED / 3 EXPECTED FAIL REPRODUCED / SOURCE BUG STILL OPEN / NO LIVE PASS.

## Фактическое состояние
- Предыдущее RUN-061 завершило локализацию. RUN-062 документировало реальный дефект и закрылось BLOCKED: инструмент запретил запись исправления в v3-sync-release.js.
- Действующий TEST DRAFT PR #3 сохраняет исходный дефект: engine.upload() failure подавляется; сообщение про успешную сверку появляется независимо от исходящих pending; callback orderly() может проверять queued до cleanup.
- Этот RUN **не** обходит блокировку: исходный v3-unified-preview/v3-sync-release.js не менялся. Изменены только новый offline test и TEST-only GitHub Actions диагностика.

## Коммиты
- [Тестовый файл e5e0974](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/e5e0974bc75716eb1efef4c0924c503e971bb1ef): admin/tests/v3-sync-refresh-failclosed-gate.test.cjs; Node VM, только синтетический owner, никакого реального Firebase, IndexedDB, Google Sheets, сети или приватных данных.
- [CI diagnostic 839d6de](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/839d6de6d47b24250d28828e8f790187ccf9db37): не блокирующий diagnostic step; запускает assertions с V3_SYNC_ASSERT_FIXED=1 и проверяет ожидаемые три FAIL; сам тест по умолчанию SKIP и не выдаётся за зелёный release gate.

## Фактические результаты GitHub Actions exact HEAD 839d6de
- [Admin regression run #42103610894](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42103610894): SUCCESS для обязательных существующих тестов и корректной обработки известного FAIL.
- В job 127512544400 есть три отдельных AssertionError с фактическими наблюдениями:
  1. Отказ upload: `refresh()` возвращает `true`, требуемое значение `false`.
  2. События `pending` остаются: `refresh()` возвращает `true`, требуемое `false`.
  3. Нормальный refresh: `RS_FAMILY.putState()` вызван **0** раз вместо ожидаемого **1** после cleanup очереди.
- [Повторный admin regression #42103620692](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42103620692) также завершён SUCCESS на том же HEAD. Важное различие: тест известного дефекта **3/3 RED**, но общий workflow зелёный из-за намеренного non-gating статуса. Это НЕ исправленный дефект.

## Критерии закрытия NEW-009
1. В разрешённой среде редактирования поправить source ТОЛЬКО в TEST DRAFT PR #3: fail-closed status на upload reject и ненулевой pending, ожидание cleanup, UID/epoch guard перед UI apply.
2. Не терять IndexedDB pending, не автоматически overwriting local storage при ошибке. Личные данные не использовать.
3. Запустить `V3_SYNC_ASSERT_FIXED=1 node --test admin/tests/v3-sync-refresh-failclosed-gate.test.cjs` и получить 3/3 PASS (в идеале расширить account-switch/deferred promises проверками).
4. Сделать эти регрессии обязательной частью CI, убрать non-gating известный RED и повторно проверить exact HEAD.
5. До тестов реальной опубликованной TEST Firebase, двух аккаунтов и устройств не объявлять синхронизацию готовой к релизу.

## Запреты и следующая операция
RUN-045 реальный Firebase TEST published Rules read-only — BLOCKED без авторизованного облачного доступа; Cloud-role/Sheets/ZIP backend отсутствуют. Production main, TEST default main, Firebase TEST/LIVE, пользователи/UID, тариф и рабочий сайт не изменены. RUN-057: не предлагать несовместимое Firebase приложение на телефон или старый Mac.

**NEXT:** получить авторизованный способ правки TEST DRAFT source без обхода блокировки; затем устранить NEW-009 и сделать регрессионный тест обязательным. Альтернативно — read-only TEST Rules verification только через реально доступную сессию Work/браузера владельца.
