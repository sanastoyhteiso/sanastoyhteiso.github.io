# Sanastoyhteisö 3.0 — RUN-066 / NEW-010
## Безопасность актуальности учебного кода в офлайн-кэше (TEST ONLY)

**Дата:** 05.11.2026. **Статус:** кодовый guard реализован и проверен в DRAFT TEST PR #3; фактический iPad/iPhone/два аккаунта и production NOT TESTED, NO-GO.

### Обнаруженный риск

До RUN-066 тестовый `v3-unified-preview/sw.js` использовал cache-first для локальных JS/CSS и постоянное `CACHE_NAME=sanastoyhteiso-v3-unified-preview-20261105-v11`. Если любой из скриптов меняется, а `sw.js` и имя кэша остаются прежними, уже открывавший сайт браузер может продолжать загружать старую учебную логику. Это особенно критично для пользователей старого iPad Safari и для отладки нескольких устройств. Риск обоснован чтением клиентского кода; **реальное проявление на устройстве не воспроизводилось**.

### Что изменено

1. В [TEST DRAFT PR #3](https://github.com/velardream-ctrl/riveria-sanasto-community-test/pull/3) `v3-unified-preview/sw.js` получил новое имя `sanastoyhteiso-v3-unified-preview-assets-2cbae3e600bd68d3`; оно зависит от сортированных путей и Git blob SHA **31 отдельных физических файлов** в precache. Это 64-битный FNV-1a для случайного рассогласования кэша, **не криптографическая подпись**. В `activate` старые cache namespaces удаляются согласно прежней логике. [SW commit](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/0dedb8741054267b9f0621a6f015c7b542ab744f).
2. Добавлен `admin/tests/study-offline-cache-version.test.cjs`: проверяет существование всех precache файлов (включая PNG), ссылки на локальные JS/CSS с точными query-версиями из обоих HTML, правильность content fingerprint, ES5 стиль SW, отсутствие precache приватных данных/сторонних Google scripts, синтетическую установку/активацию и офлайн-открытие основной страницы. [Тестовый файл](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/tests/study-offline-cache-version.test.cjs).
3. Новый обязательный этап в `.github/workflows/admin-regression.yml`; при изменении precache asset без обновления версии SW CI станет красным. Старые отдельные тесты i18n/My Finds, привязанные к строке версии `...-v11`, согласованы с content-addressed cache, не отключены.

### Результаты и ограничения

- **FINAL exact TEST DRAFT HEAD:** `2fb8873430d383c25a313fe2d5b6111eae1c87a7`.
- [GitHub Actions #42107509030](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42107509030), job `127526107808`, **SUCCESS**, новое тестирование **6 PASS / 0 FAIL**; прежние обязательные проверки также зелёные.
- Промежуточные прогоны не скрыты: предыдущие CI завершались FAILED из-за несовместимых со схемой тестовых утверждений и опечатки нового regex, устранены до финального exact-HEAD PASS. Никаких production/live data writes.
- **NEW-009 остаётся 3/3 KNOWN RED**: код обработки cloud refresh при неудачной загрузке по-прежнему ошибочен, никакой обход blocked RUN-062 не выполнялся.
- Не подтверждены физические Safari iOS12 / Android / двухустройственное/двухпользовательское обновление и поведение Firebase, опубликованные TEST Firestore Rules, restore приватной независимой резервной копии. TEST PR не слит; тестовая опубликованная страница **не содержит** эти изменения.
- Этап F/ZIP по решению владельца RUN-065 заморожен до после запуска. Этот gate — защита учебного кэша и **не** разработка ZIP-релизов.

### Что делать дальше

1. Не менять production; подготовить разрешённый TEST-only NEW-009 fix и добиться 3/3 PASS в обязательном CI без обхода инструментальной блокировки.
2. Проверить опубликованные TEST Firebase Rules авторизованным браузером/Work, затем отдельно реальные два устройства, iOS12, онлайн→офлайн→онлайн, смену пользователей и восстановление TEST backup.
3. При каждом будущем изменении учебных файлов явно обновлять `CACHE_NAME` до fingerprint, вычисленного `admin/tests/study-offline-cache-version.test.cjs`, и ждать зелёного exact-HEAD CI до слияния. Если тест красный — не публиковать.
