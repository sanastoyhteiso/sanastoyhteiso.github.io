# RUN-20261105-059 — «Мои находки»: исправлена несовместимость допустимых ID

Дата: 2026-11-05, Europe/Helsinki. Этапы E/G. **Только DRAFT TEST PR #3, исходник и эмуляторные тесты.** Cloud/Firebase/production не изменялись.

## Обнаружено

В учебном движке V3 и подготовленных правилах TEST допустимы публичные ID категорий `T/M/P/H` длиной 5–7 цифр плюс личные `W_[a-f0-9]{32}`. Однако `v3-sync-core.js` отклонял `collection_set` для M/P/H, а `v3-sync-shadow.js` отклонял снимки `finds` с ними. В результате некоторые учебные «находки» могли не проходить сохранение или восстановление из локального shadow. Обнаружение относится к **черновому коду**, не является заявлением о реальном сбое или потере результатов учащихся.

## Выполнено в DRAFT TEST PR №3

- Исправлена одна проверка формата в [v3-sync-core.js](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/02753437a3b384216ab3107c6a38379b0c96eefc) и одна в [v3-sync-shadow.js](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/87358cab21cd177b467a15aefe281aab7d8ad350): коллекции могут использовать `[TMPH][0-9]{5,7}` и `W_[a-f0-9]{32}`; неверные ID по-прежнему отклоняются.
- Добавлены [регрессионные тесты](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/tests/study-finds-id-contract.test.cjs): T/M/P/H/W, folding, tombstones, shadow snapshot, invalid paths/IDs, валидация payload, согласование с NEW-006 Rules candidate и cache version.
- Версии двух скриптов обновлены в TEST `index.html` и `sw.js`, cache namespace v9. CI-hook подключён к TEST admin-regression. Последний исправляющий [commit 12b5c632](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/12b5c6326864230e41605475f00284c61d969982) скорректировал проверку cache на непрерывное увеличение версии.
- [GitHub Actions TEST admin #42097351596](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42097351596) — **SUCCESS на точном HEAD `12b5c6326864230e41605475f00284c61d969982`**: новых My Finds тестов **8/8**, i18n 6/6, admin 70/70, telemetry 21/21, browser queue 22/22, ingest mock 23/23; manifest проходит.
- [GitHub Actions TEST emulator #42097351722](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42097351722) — **SUCCESS на том же HEAD, 106/106**.
- Промежуточные CI запуски во время изменения файлов имели ошибки (в частности прежняя i18n проверка требовала строго cache v8 после перехода на v9); проблема теста исправлена, окончательные оба результата зелёные. Не выдавать промежуточный провал за ошибку пользовательских данных.

## Что не подтверждено

Опубликованные TEST Firestore Security Rules, реальная синхронизация нескольких аккаунтов/устройств, физический iOS12, независимый cloud backup и сохранность учебных результатов в production здесь **не проверялись**. PR #3 остаётся DRAFT, не merge/deploy, TEST default main и основной сайт не затронуты. A–K остаются OPEN/NO-GO. Установка Firebase на устройства владельца невозможна (RUN-057) и больше не должна запрашиваться.

**Следующее:** отдельная read-only сверка опубликованных TEST Rules с владельческой Work веб-сессией, затем owner-authorized синтетический пилот и проверка действительного roundtrip при соблюдении backup/monitoring gates. Допустима независимая GitHub-only работа, но она не заменяет эти проверки.
