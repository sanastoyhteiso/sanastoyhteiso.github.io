# RUN-20261105-059 — V3 «Мои находки»: исправлен разнобой M/P/H в локальном событии и снимке

**Дата:** 2026-11-05, Europe/Helsinki. **Этап:** E/G (личный словарь, события, сохранение и синхронизация). **Результат:** код и offline CI проверены; облачная TEST Firebase и опубликованный сайт не изменялись.

## Подтверждённый дефект исходника

В DRAFT TEST PR #3:
- `v3-sync-release.js` и `v3-sync-engine.js` уже допускают публичные идентификаторы `[TMPH][0-9]{5,7}` и личные `W_[a-f0-9]{32}`.
- Правила NEW-006 (только candidate, не published!) также допускают M/P/H для `collection_set`.
- Но `v3-sync-core.js` для `collection_set` и `v3-sync-shadow.js` для `snapshot.finds` имели устаревший regex `^T[0-9]{5,7}$` либо `W_...`. Поэтому допустимая карточка M/P/H могла не пройти локальное сохранение или реконструкцию; потеря реальных учебных результатов **не подтверждена**, баг установлен на исходном коде.

## Исправлено (только TEST DRAFT PR #3)

- `v3-unified-preview/v3-sync-core.js`: проверка `collection_set` принимает точные `T/M/P/H` 5–7 цифр либо личный `W_...`. [Commit 0275343](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/02753437a3b384216ab3107c6a38379b0c96eefc).
- `v3-unified-preview/v3-sync-shadow.js`: `snapshot.finds` принимает тот же строгий формат, без расширения прав по UID. [Commit 87358ca](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/87358cab21cd177b467a15aefe281aab7d8ad350).
- `admin/tests/study-finds-id-contract.test.cjs`: 8 offline regression на valid/event/fold/тombstones/snapshot, отказ от опасных/некорректных ID, отрицательные поля данных и согласованность NEW-006 Rules candidate; [test commit 2e97601](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/2e97601ef97fa306f10e2b31a27e4dc8dbd856c7), [test fixture correction b615b4d](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/b615b4de7d58371c5bc8f2dfcd70129e383e54c2).
- HTML/SW загрузка нужных модулей с `?v=v3-finds-tmph-2`, TEST cache v9, без публикации: [HTML commit 700ab55](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/700ab553e6353c4b638c741969aa3817c885bf37), [SW 07c0f07](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/07c0f0737540117e04c8ec3b1d0d9e2d5b07fbed).
- CI hook [ff26489](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/ff264896b082fea9ac47a9e29a6286ed5ef88aa5). Промежуточные CI падения от жёсткого утверждения прежнего `v8` кэша в RUN-058, не от новой логики, исправлены версиями [f853edc](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/f853edc9fd2fc8388d55c6274a9eb6a446c4f4eb) и [12b5c63](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/12b5c6326864230e41605475f00284c61d969982): тесты теперь требуют неубывающую версию кэша, а не конкретный номер.

## Проверки на точном конечном HEAD

[Admin regression #42097351596](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42097351596) **SUCCESS exact HEAD `12b5c6326864230e41605475f00284c61d969982`**:
- My Finds **8/8**, FI/EN UI **6/6**.
- Admin **70/70**, telemetry **21/21**, ES5 queue **22/22**, ingest mock **23/23**, release manifest PASS.
- [Isolated Firestore Emulator #42097351722](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42097351722) **SUCCESS exact same HEAD**, **106/106**, no Firebase cloud deploy.

## Область, не охваченная этими проверками

Код всё ещё DRAFT TEST PR #3. Настоящая синхронизация разных устройств/аккаунтов, опубликованные TEST Firestore Rules, Android/iOS12 Safari, потери связи, приватная база и резервное восстановление НЕ проверены этим RUN. Ни один личный UID, слово, событие, Google Sheet или Firestore в реальном облаке не читали/меняли. TEST default main и production `https://sanastoyhteiso.github.io/` не изменены, PR не merged, тариф и старые пользователи не тронуты. Stage E/G и A–K остаются OPEN/NO-GO.

**Следующая точка:** authorized Work/browser read-only deployed TEST Rules и затем согласованный одноаккаунтный TEST пилот sync + backup/restore; не путать локальные 106/106 с живыми разрешениями. Не предлагать установку Firebase приложения владельцу (RUN-057).
