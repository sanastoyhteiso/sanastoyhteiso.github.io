# Sanastoyhteisö V3 — RUN-070 / NEW-009: обязательная релизная защита от ложного успеха синхронизации

**Дата:** 05.11.2026 (Europe/Helsinki). **Статус:** TEST-ONLY RELEASE GATE IMPLEMENTED; **NO-GO, EXPECTED RED 3/3**, пока не исправлен исходный код. Не изменены production main, TEST main/Pages, Firebase, пользовательские аккаунты/прогресс, тариф и ZIP.

## Зачем

В реальном релизном черновике `v3-sync-release.js` исходный метод `refresh()` содержит `engine.upload().catch(function(){return null;})`, а затем может показывать `Данные V3 сверены с облаком.` даже после неудачной отправки локальных событий. Дополнительно `queued` может удерживать применяемый cloud snapshot. Это уже зарегистрировано как **NEW-009 / 3/3 KNOWN RED**. Если обычный release preflight остаётся зелёным, пользователь может ошибочно считать синхронизацию безопасной.

**Источники:** [relеase PR #9](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/9) DRAFT, прежний source `v3-sync-release.js` blob `f897a82a8e6bc87e329db317d7265526a13d4a4d` (не менялся); образец runtime fixture TEST [admin/tests/v3-sync-refresh-failclosed-gate.test.cjs](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/tests/v3-sync-refresh-failclosed-gate.test.cjs).

## Что добавлено только в DRAFT release PR #9

- `release-checks/v3-refresh-failclosed.test.cjs`: три **всегда включённых** Node memory-VM теста реального `v3-sync-release.js`; никаких live Firebase, IndexedDB, сетевых запросов или пользовательских учётных данных. Гипотетический объект двигателя имитирует ошибку upload, оставшуюся очередь и успешный refresh без потерь.
- `.github/workflows/release-v3-preflight.yml`: независимая обязательная задача `sync-failclosed-release-gate`. Она проверяет `node --check`, затем `node --test release-checks/v3-refresh-failclosed.test.cjs`. Остальные работы `release-preflight` и `firestore-v3-rules-emulator` **продолжают исполняться независимо**, даже если новый gate красный.
- Никакого принудительного `exit 0`, `test.skip`, заглушки, обхода заблокированного редактирования источника или смягчения требований. Новый gate запрещает выдавать ошибочное состояние за готовый релиз. Формальная защита самого merge также зависит от настроек GitHub Branch Protection: наличие красного CI **не** означает, что GitHub технически запретит ручной merge без обязательного статуса.

## Проверенные факты GitHub CI

- Новый test file commit `19b7882be137f8fd300c8ecf9e1faedc170894d5` и workflow commit `2eb9ad4f708e0150b454ac63ecb0e9b88fb44f26`.
- **Промежуточный ошибочный прогон** [#42113198694](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42113198694) поймал только неверный путь к исходнику в новом тесте (`../../v3-sync-release.js`), а не функциональную ошибку. Исправлено строго в тесте, source не тронут, commit `70222cec3ec7053e66fed004b8e22af744194355`.
- **После исправления**, [Actions #42113363021](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42113363021), exact release-head `70222cec3ec7053e66fed004b8e22af744194355`: новый `sync-failclosed-release-gate` **FAILED exactly 3/3 expected**:
  1. При отказе загрузки нельзя подтверждать cloud success — `not ok 1`.
  2. Локальная pending IndexedDB очередь не должна сопровождаться подтверждением cloud-saved — `not ok 2`.
  3. После успешной очистки очереди должен быть применён новый snapshot — `not ok 3`.
- Соседний `release-preflight` **SUCCESS**. Результат отдельного `firestore-v3-rules-emulator` фиксируется по окончании этого же GitHub Actions прогона, не придумывать PASS, если job ещё выполняется.

## Приёмка и следующий шаг

Этот RUN **не исправил** NEW-009 и намеренно не делает общий release CI зелёным. Запрет на редактирование `v3-sync-release.js` через ранее отклонённый инструмент соблюдён; не обходить его альтернативным клиентом/путём.

Только после отдельно разрешённого source patch, проверенного в TEST и release PR, новые три теста должны стать **3/3 PASS**, а затем необходимо дождаться остальных обязательных tests, браузерных проверок iOS12/двух устройств, реальных Firestore Rules, backup→restore, admin/consent/rollout GO. Нельзя выключать эти проверки ради формального merge.

**Разделение стадий:** F/ZIP отложен после безопасного образовательного запуска. NEW-006 TEST Rules T-only → TMPH pending owner approval (отдельный шаг). NEW-001 независимое V3 Firestore backup/restore ещё не проверено.
