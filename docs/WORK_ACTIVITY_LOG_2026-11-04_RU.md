# Sanastoyhteisö — НЕПРЕРЫВНЫЙ ЖУРНАЛ РАБОТЫ (START / END)

**Начат:** 2026-11-04. **Источник правды:** [Master Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10), [план A–K](./MASTER_ROADMAP_V3_ADMIN_RELEASE_2026-11-04_RU.md), [история проекта](./PROJECT_HISTORY_ARCHITECTURE_2026-11-04_RU.md).

## ОБЯЗАТЕЛЬНЫЙ ПРОТОКОЛ ДЛЯ КАЖДОГО ChatGPT / Work

1. **НАЧАЛ** — до любого фактического шага по изменению проекта, создать в этом файле новую датированную запись с **уникальным ID** `RUN-YYYYMMDD-NNN`, статусом `НАЧАЛ / IN_PROGRESS`, точной задачей, репозиторием/веткой, текущим SHA, ожидаемым результатом, действием, которое собирается выполнить. Сначала сохранить эту запись в GitHub, **только потом выполнять действие**. Для очередного независимого действия — отдельная запись или подшаг `RUN-ID.1`.
2. **ЗАВЕРШИЛ** — сразу после конкретного действия **добавить** к тому же RUN ID датированную запись `ЗАВЕРШИЛ / DONE` с точным результатом, commit SHA/PR/CI/URL, что проверено, что осталось и следующим шагом. Если задача на несколько шагов, каждое действие фиксировать как `начал → завершил`, **не откладывать лог до конца большой сессии**.
3. **Если не получилось** — дописать `ЗАБЛОКИРОВАНО / BLOCKED` или `ОШИБКА / FAILED` с причиной, уже выполненными попытками и безопасным следующим шагом. **Не писать DONE, если выполнена только часть или синтаксическая проверка.** Для ожидания человека: `НУЖНО ДЕЙСТВИЕ ВЛАДЕЛЬЦА / WAITING_OWNER`.
4. **Оборвалась сессия:** запись `НАЧАЛ` без `ЗАВЕРШИЛ / ЗАБЛОКИРОВАНО / ОШИБКА` считается **НЕЗАВЕРШЁННОЙ И НЕПРОВЕРЕННОЙ**. Следующий чат/Work сначала сверяет действительное состояние GitHub, CI, рабочего/тестового сайта; не повторяет вслепую запись/публикацию/миграцию, которые могли частично выполниться; затем оформляет `ВОССТАНОВЛЕНО / RECOVERED` с доказательствами и новым безопасным действием.
5. **Новая задача/дефект:** добавлять `NEW-NNN` в [реестр мастер-плана](./MASTER_ROADMAP_V3_ADMIN_RELEASE_2026-11-04_RU.md) и в Issue #10 (или отдельный связанный Issue), с причиной, приоритетом, блокерами и первым шагом. Нельзя оставлять задачу только в этом файле или в чате.
6. **Синхронизация журналов:** этот файл — **пооперационная хронология**, мастер-план — **результат каждого TASK и очередь новых задач**, Issue #10 — галочки этапов A–K и текущий список. После завершения TASK обновлять и мастер-план. Статусы DONE в журнале не закрывают автоматически целый этап.
7. **Прозрачность:** если невозможно сохранить запись в GitHub (нет доступа, ошибка, конфликт записи), **не утверждать**, что запись сделана. До важных изменений остановиться и предоставить пользователю текст для ручного переноса; возобновлять после проверки. Не включать в публичный лог пароли, токены, Firebase secrets, личные данные учеников/пациентов, приватные ссылки на таблицы.
8. **Не запускать независимые ChatGPT/Work параллельно над одной веткой без координации.** При конфликте GitHub обновить ref и осторожно добавить запись; существующие записи не стирать.
9. **Запрет релиза:** главный сайт `https://sanastoyhteiso.github.io/` и production Firebase не менять без закрытых release gates A–I и явного разрешения владельца.

**ВАЖНО ПОСЛЕ ПРЕРЫВАНИЯ WORK:** как только создан файл с тестами или исправлен код и получен проверенный локальный результат, **немедленно сохранить код и тесты в GitHub TEST branch отдельным небольшим commit**. Не оставлять все исправления в локальной временной папке до конца большой сессии. Если код локально проверен, но не сохранён удалённо, указывать `ЧАСТИЧНО / NOT_PUSHED` и не заявлять, что исправление доступно следующему чату. Проверить SHA удалённой ветки после коммита. Ни один локальный PASS без сохранённого кода не закрывает дефект или этап.

## Шаблон: начало

```markdown
### RUN-YYYYMMDD-NNN / НАЧАЛ / IN_PROGRESS
- Время (Europe/Helsinki):
- TASK / NEW ID и этап A–K:
- Планирую действие:
- Цель / ожидаемый результат:
- Repo / branch / HEAD до действия:
- Ссылки на Issue/PR:
```

## Шаблон: результат

```markdown
### RUN-YYYYMMDD-NNN / ЗАВЕРШИЛ / DONE (или BLOCKED / FAILED / WAITING_OWNER)
- Время (Europe/Helsinki):
- Реально сделано:
- Проверено (тесты / браузер / CI / URL):
- Commit SHA / PR / состояние ветки:
- Что осталось / риски:
- Новые задачи (NEW-NNN):
- Следующее точное действие:
```

## Журнал действий — только добавлять новые записи

### RUN-20261104-001 / НАЧАЛ / IN_PROGRESS
- **Дата:** 2026-11-04, Europe/Helsinki.
- **TASK:** уточнение регламента ведения журнала при смене ChatGPT/Work; этап управление проектом.
- **Планируемое действие:** создать документ с протоколом START/END; связать с мастер-планом, Issue #10 и handoff TEST PR #3; подготовить владельцу переносимую фразу.
- **Repo / branch:** `sanastoyhteiso/sanastoyhteiso.github.io` / `release/v3-safe-integration-20261104`; production main остаётся `d29813cf409af9dc60804105ca3141f98ec12fcd`.
- **Статус:** выполнено лишь начало; ожидается подтверждённое обновление смежных инструкций.

### RUN-20261104-001 / ЗАВЕРШИЛ / DONE
- Дата: 2026-11-04, Europe/Helsinki.
- Сделано: создан пооперационный журнал; правила START/END включены в MASTER ROADMAP, GitHub Issue #10 и TEST handoff.
- Проверено: GitHub commits 3b8ae3853b4656371a969280a3136ce3955081de, b9e60bab24133c32b98f826bae89477907bcd626 и 7b4f851389673050444073763d9cedd03661b189.
- Не сделано: инженерные этапы A–K, задача NEW-001. Реальный production и Firebase не менялись.
- Следующий шаг: проверить последние записи RUN и закрыть начальную инвентаризацию этапа A.

### RUN-20261104-002 / НАЧАЛ / IN_PROGRESS
- Время (Europe/Helsinki): 2026-11-04 23:02:52.
- TASK-20261104-005; этапы B/C/E: технический аудит отдельной admin-панели по текущему заданию владельца.
- Планирую действие: read-only проверка файлов и CI TEST PR #3: SDK/config, RS_FIREBASE_CONFIG, custom claim, скрытие ссылки ученикам, ошибки запуска; получить локальную копию исходников для дальнейших проверок.
- Repo / branch / HEAD: `velardream-ctrl/riveria-sanasto-community-test` / `feat/admin-control-center-package-spec-20261104` / `7b4f851389673050444073763d9cedd03661b189`.
- Журнал: `sanastoyhteiso/sanastoyhteiso.github.io` / `release/v3-safe-integration-20261104`, исходный HEAD `d83195d58ff6dedce96d6ba97ab58c7b1917a407`.
- Перед стартом прочитаны Issue #10, журнал (RUN-001 закрыт), master roadmap и handoff. Открытых RUN не найдено. PR #3 open/draft, не merged.
- Ожидаемый результат: перечень подтверждённых дефектов и доступных тестов; реальные Auth/Firestore, production, тарифы и merge не изменять.
- Ссылки: [TEST PR #3](https://github.com/velardream-ctrl/riveria-sanasto-community-test/pull/3), [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10).

### RUN-20261104-002 / ЗАВЕРШИЛ / DONE
- Время (Europe/Helsinki): 2026-11-04 23:03:53.
- Завершён именно read-only аудит, не приёмка работающей панели. Исходники получены на SHA [7b4f851](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/7b4f851389673050444073763d9cedd03661b189); незавершённых предыдущих RUN нет.
- SDK: admin/index.html подключает config.js, затем одинаковую Firebase v8.10.1 app/auth/firestore, затем admin-page.js. RS_FIREBASE_CONFIG указывает на sanastoyhteiso-v3-development. Относительные пути согласованы с /v3-unified-preview/admin/. В обычном index.html ссылка hidden по умолчанию; прежние admin-live/admin-preview не подключены.
- Дефекты NEW-002: панель не сбрасывает разрешение/DOM сразу при смене аккаунта; ответы старых claim/Firestore запросов могут изменить состояние новой сессии; onAuthStateChanged не отслеживает обновление claims в ID token; существующее default Firebase app не сверяется с TEST config. Нужны воспроизводящие тесты и исправления fail-closed.
- GitHub check-runs на исходном SHA: 0. В дереве нет workflow/Rules тестов. Есть release-manifest.test.cjs. Локально доступны Node и Playwright package, но браузерные binaries отсутствуют. Тесты ещё не запускались.
- Настоящие вход администратора/защищённое чтение/Rules/iOS12 не проверены. Firebase, main, тарифы и merge не менялись.
- Следующий шаг: зарегистрировать NEW-002 в master и Issue #10, затем воспроизвести ошибки локальными тестами без сетевого Firebase.

### RUN-20261104-003 / НАЧАЛ / IN_PROGRESS
- Время (Europe/Helsinki): 2026-11-04 23:03:53.
- TASK-20261104-005 / NEW-002; этапы B/C/E.
- Действие: добавить результаты аудита и NEW-002 в реестр/журнал master roadmap и Issue #10. Это только документация, галочки A–K не закрывать.
- Repo / branch / HEAD: TEST PR #3 `feat/admin-control-center-package-spec-20261104` = `7b4f851389673050444073763d9cedd03661b189`; документация `release/v3-safe-integration-20261104` = `d271b86e6a7c24fa964db7b8e816a3af980e85d1`.

### RUN-20261104-003 / ЗАВЕРШИЛ / DONE
- Время (Europe/Helsinki): 2026-11-04 23:04:36.
- NEW-002 и TASK-20261104-005 добавлены в мастер-план: [abd30f0](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/abd30f04fd4035bd40ab3365b815052e283f59f2); Issue #10 обновлён с тем же NEW-002. Галочки A–K не изменены.
- Следующий шаг: добавить локальные детерминированные тесты без реальной Firebase.

### RUN-20261104-004 / НАЧАЛ / IN_PROGRESS
- Время (Europe/Helsinki): 2026-11-04 23:04:36.
- TASK-20261104-005 / NEW-002.
- Планирую действие: добавить в локальную копию TEST ветки Node regression tests, исполняющие реальные admin-page.js/admin-entry.js с контролируемыми DOM/Firebase-заглушками. Проверить загрузку/config, обычных и анонимных пользователей, строгий claim, смену аккаунта/токена, запоздалые запросы, отсутствие Firebase writes.
- Repo / branch / HEAD: TEST `feat/admin-control-center-package-spec-20261104` / `7b4f851389673050444073763d9cedd03661b189`. Пока без commit в GitHub; запуск тестов будет отдельным RUN.

### RUN-20261104-004 / ЗАВЕРШИЛ / DONE
- Время (Europe/Helsinki): 2026-11-04 23:06:00.
- Добавлен локальный `admin/tests/admin-access.test.cjs`: реальные скрипты страницы и ссылки исполняются в Node VM с управляемыми асинхронными ответами Auth/Firestore и минимальным DOM. Проверяются HTML/SDK/cache, claim, проект, смена сессий, отказ чтения, stale metrics. Настоящая сеть Firebase не используется.
- Пока файл не закоммичен и тесты не запускались; код панели остаётся на [7b4f851](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/7b4f851389673050444073763d9cedd03661b189). Публикация проверенного набора файлов будет отдельным RUN.
- Следующий шаг: baseline-запуск и подтверждение воспроизводимости NEW-002.

### RUN-20261104-005 / НАЧАЛ / IN_PROGRESS
- Время (Europe/Helsinki): 2026-11-04 23:06:00.
- TASK-20261104-005 / NEW-002; TEST ветка `feat/admin-control-center-package-spec-20261104`, исходный SHA `7b4f851389673050444073763d9cedd03661b189`.
- Действие: запустить `node --test admin/tests/admin-access.test.cjs` на неизменённых исходных admin скриптах. Ожидаются отказы воспроизводящих тестов; сохранить точное число и причины, затем исправлять.

### RUN-20261104-005 / ЗАВЕРШИЛ / DONE (воспроизведение дефектов)
- Время (Europe/Helsinki): 2026-11-04 23:06:24.
- Baseline действительно запущен: `node --test admin/tests/admin-access.test.cjs` на исходном admin-коде [7b4f851](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/7b4f851389673050444073763d9cedd03661b189).
- Результат: 58 тестов, 31 PASS, 27 FAIL, exit 1. Это ожидаемое подтверждение дефектов NEW-002, НЕ зелёная проверка панели.
- Подтверждено: несверенный default app, гонки claim/read/смены сессии, отсутствие реакции на token refresh, сохранение старого DOM, необработанные синхронные отказы SDK. Также добавлена защитная проверка анонимного аккаунта с искусственно заданным claim (моделируемый крайний случай).
- Следующий шаг: исправить эти переходы только в TEST admin скриптах и обновить cache URLs.

### RUN-20261104-006 / НАЧАЛ / IN_PROGRESS
- Время (Europe/Helsinki): 2026-11-04 23:06:24.
- TASK-20261104-005 / NEW-002; TEST `feat/admin-control-center-package-spec-20261104`, исходный HEAD `7b4f851389673050444073763d9cedd03661b189`.
- Действие: локально исправить admin-page.js/admin-entry.js: сверка default app с TEST config, onIdTokenChanged с ограниченным force refresh, немедленное скрытие/очистка, поколение сессии для async callbacks, безопасная обработка отказов; обновить HTML/SW версии скриптов. Никаких Firebase writes, Rules, deploy или merge.
- Проверка после редактирования — отдельный RUN; затем атомарный commit в ту же тестовую ветку.

### RUN-20261104-006 / ЗАВЕРШИЛ / DONE (редактирование)
- Время (Europe/Helsinki): 2026-11-04 23:07:18.
- В локальной копии изменены admin-page.js/admin-entry.js: fail-closed TEST app/config, onIdTokenChanged, строгий boolean claim и проверенный неанонимный аккаунт, generation+user guards для async, очистка report/DOM при смене состояния, обработка ошибок SDK.
- Версии обоих admin скриптов в HTML и SW согласованы как `admin-auth-2`, cache bump `20261104-v6`. Сам config.js не менялся.
- Изменения ещё не закоммичены; исходная ветка остаётся [7b4f851](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/7b4f851389673050444073763d9cedd03661b189). Готовность не объявляется до проверок.
- Следующий шаг: regression + существующий manifest test + syntax check.

### RUN-20261104-007 / НАЧАЛ / IN_PROGRESS
- Время (Europe/Helsinki): 2026-11-04 23:07:18.
- TASK-20261104-005 / NEW-002; TEST branch `feat/admin-control-center-package-spec-20261104`, remote HEAD `7b4f851389673050444073763d9cedd03661b189` + локальное исправление.
- Действие: `node --test --test-reporter=tap admin/tests/admin-access.test.cjs`, `node admin/tests/release-manifest.test.cjs`, `node --check` для изменённых JS и извлечённых inline scripts. Все проверки без real Auth/Firestore; проверить отсутствие секретов/посторонних изменений.

### RUN-20261104-007 / ЗАВЕРШИЛ / DONE (локальные проверки)
- Время (Europe/Helsinki): 2026-11-04 23:08:45.
- `node --test --test-reporter=tap admin/tests/admin-access.test.cjs`: **58/58 PASS, 0 FAIL**, exit 0.
- `node admin/tests/release-manifest.test.cjs`: PASS (существующий набор проверок манифеста).
- `node --check`: PASS для admin-page.js, admin-entry.js, sw.js, admin-access.test.cjs; PASS для единственного inline script учебного index.html. В admin/index.html inline JS отсутствует.
- Diff просмотрен: только два admin-скрипта и их HTML/SW версии + новый тест. config.js не изменён; приватные данные/секреты не добавлены. Запрос метрик только read-only `admin_metrics/current`, `source:server`.
- Это Node VM/DOM/SDK doubles, НЕ реальный Firebase, не Firestore emulator и не браузер/iOS12. CI не запускался. Remote TEST HEAD по-прежнему 7b4f851 до отдельного commit.
- Следующий шаг: сохранить отчёт и конкретный handoff перед commit.

### RUN-20261104-008 / НАЧАЛ / IN_PROGRESS
- Время (Europe/Helsinki): 2026-11-04 23:08:45.
- TASK-20261104-005 / NEW-002; TEST branch `feat/admin-control-center-package-spec-20261104`, исходный remote HEAD `7b4f851389673050444073763d9cedd03661b189`.
- Действие: подготовить `admin/ADMIN_TECHNICAL_AUDIT_2026-11-04_RU.md` и append-only дополнение handoff с результатами пяти проверок, командами, ограничениями и следующим шагом. Код больше не менять.

### RUN-20261104-009 / НАЧАЛ / IN_PROGRESS
- Дата: 2026-11-04, Europe/Helsinki.
- Задача: аудит состояния после прерванной работы Work, TASK-20261104-005 / NEW-002.
- Действие: сверить незакрытый RUN-008, GitHub TEST PR #3, наличие admin regression test/audit report, исходный TEST HEAD, сохранность production; подготовить передачу следующему чату без повторения неизвестных операций.
- Repo/branch: журнал в release/v3-safe-integration-20261104; тестовая ветка feat/admin-control-center-package-spec-20261104.
- Ограничение: проверка без изменения тестового кода, Firestore, Auth или production main.

### RUN-20261104-009 / ЗАВЕРШИЛ / DONE (проверка прерванного Work)
- Дата: 2026-11-04, Europe/Helsinki.
- Факт: RUN-20261104-002…007 имеют НАЧАЛ и ЗАВЕРШИЛ; RUN-20261104-008 имеет только НАЧАЛ (подготовка admin audit/handoff). Это незакрытая операция предыдущего Work.
- TEST PR #3 всё ещё DRAFT/open, remote head 7b4f851389673050444073763d9cedd03661b189. В ветке отсутствуют admin/tests/admin-access.test.cjs и admin/ADMIN_TECHNICAL_AUDIT_2026-11-04_RU.md; последние изменения admin-page.js/admin-entry.js описаны как локальные и НЕ закоммиченные. Удалённый тестовый код не получил fail-closed исправления.
- Из предыдущего RUN-007 следует 58/58 PASS на локальных mocks и PASS существующего manifest check. Это НЕ GitHub CI и НЕ доказательство реального Firebase/браузера. Локальные файлы Work из другого чата здесь не подтверждены доступными.
- Issue #10 получил NEW-002, мастер-план TASK-20261104-005 имеет статус ЧАСТИЧНО; production main остаётся d29813cf409af9dc60804105ca3141f98ec12fcd. TEST main остаётся 49695b560e8ab77d04f508c9d95b5195d2b3fd9e.
- Итог: механизм записи НАЧАЛ→ЗАВЕРШИЛ реально помог определить точную остановку, но Work не успел сохранить исправленный код и локальные тесты в GitHub. Действие RUN-008 остаётся открытым в исторической записи; это не подтверждение завершения.
- Следующий безопасный шаг: в TEST PR #3 сперва проверить/подготовить admin/tests/admin-access.test.cjs, исправить fail-closed NEW-002 (app config/смена пользователей/token refresh/async stale), прогнать node tests, затем commit файлов и отчёта по шагам START/END. Не выполнять merge и не трогать production Firebase. Для восстановления не предполагать, что несохранённая локальная папка Work доступна.

### RUN-20261104-010 / НАЧАЛ / IN_PROGRESS
- Дата: 2026-11-04, Europe/Helsinki.
- Задача: усиление протокола после выявления потери неподтверждённых локальных правок Work (TASK-20261104-006).
- Действие: добавить правило раннего commit/checkpoint в GitHub, чтобы локально завершённые тесты не оставались вне удалённой ветки до прерывания сессии.
- Где: пооперационный журнал и master roadmap, только документация release ветки.

### RUN-20261104-010 / ЗАВЕРШИЛ / DONE
- Дата: 2026-11-04, Europe/Helsinki.
- Сделано: новое правило раннего сохранения кода и локальных regression tests через небольшой GitHub commit после зелёной проверки внесено в этот журнал и MASTER ROADMAP.
- GitHub commits: dc842722afc57cdcfe04be09770c34f639c63740 (этот журнал), ca0ef1cb603052a3cdfe241397539ba6fc539993 (master plan).
- Проверено: оба файла обновлены через GitHub; рабочий production main и тестовый PR #3 не изменялись.
- Осталось: NEW-002 не закрыт; исправление и тестовые исходники Work пока НЕ сохранены в TEST PR #3.
- Следующий шаг: следующему чату продолжить RUN-008 после проверки remote HEAD; написать тест/исправление и незамедлительно commit в PR #3.

### RUN-20261104-008 / ВОССТАНОВЛЕНО / RECOVERED_NOT_PUSHED (НЕ DONE)
- Дата: 2026-11-04, Europe/Helsinki. Повторная проверка отдельным чатом.
- Исторический RUN-008 был начат ради локального audit/handoff, но подтверждения окончания и commit не было. PR #3 на 7b4f851389673050444073763d9cedd03661b189, DRAFT/open; в GitHub нет admin/tests/admin-access.test.cjs и admin/ADMIN_TECHNICAL_AUDIT_2026-11-04_RU.md.
- Заявленные 58/58 PASS относятся только к прошлой локальной сессии; исходники не сохранены. RUN-008 НЕ считать завершённым; статус RECOVERED_NOT_PUSHED, задача перенесена в новый RUN-011.

### RUN-20261104-011 / НАЧАЛ / IN_PROGRESS
- Время: 2026-11-04, Europe/Helsinki.
- TASK-20261104-005 / NEW-002, этапы B/C/E; восстановление после RUN-008.
- Действие: пересоздать детерминированные admin regression tests и исправить fail-closed обработку конфигурации, Auth/token/смены пользователей/stale запросов исключительно в TEST PR #3; обновить кеш-версии, провести доступные проверки, немедленно сохранить отдельными commit и проверить удалённый HEAD. Затем отчёт/передача и закрытие RUN.
- Исходный TEST HEAD: 7b4f851389673050444073763d9cedd03661b189; TEST branch feat/admin-control-center-package-spec-20261104; PR #3 draft/open.
- Нельзя: production/main, Firebase Auth/Firestore/Rules, данные, тарифы, merge; реальный admin login остаётся неподтверждённым.

### RUN-20261104-011 / ЗАВЕРШИЛ / DONE (код и тесты сохранены в TEST, НЕ приёмка admin)
- Дата: 2026-11-04, Europe/Helsinki.
- Восстановлены NEW-002 fail-closed JS, версии HTML/SW и новый admin/tests/admin-access.test.cjs (29 детерминированных кейсов).
- Проверка: 29/29 PASS в изолированном V8, выполняющем тот же Node-test source с имитациями node:test/assert/fs/vm; JS parsing PASS, Firebase network/writes отсутствуют. Это НЕ нативный node --test, НЕ GitHub CI, НЕ реальный Firebase/Rules/iOS12.
- TEST commit: [91fa4f7](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/91fa4f79ff2b8564c1a3671153e55ab0057e346d), шесть файлов; remote PR #3 DRAFT/open, HEAD=91fa4f79ff2b8564c1a3671153e55ab0057e346d; файл тестов и код прочитаны обратно из удалённой ветки.
- Остаётся: нативное выполнение тестов/CI, независимый audit/handoff, настоящая auth-role/Firestore Rules/browser проверка, пересмотр master TASK-005 и Issue #10. NEW-002 частично исправлен в TEST; этапы A–K не закрывать.

### RUN-20261104-012 / НАЧАЛ / IN_PROGRESS
- Дата: 2026-11-04, Europe/Helsinki.
- TASK-20261104-005 / NEW-002; TEST branch feat/admin-control-center-package-spec-20261104, remote HEAD 91fa4f79ff2b8564c1a3671153e55ab0057e346d.
- Действие: выполнить доступную независимую проверку сохранённого тестового набора (native Node/CI по возможности), записать ограничения, создать audit/handoff исключительно в TEST, обновить мастер-план и Issue #10 и оставить точный следующий шаг.
- Запреты: не изменять production/Firebase/данные/тарифы; PR не объединять.

### RUN-20261104-012.1 / ЗАВЕРШИЛ / DONE (TEST GitHub Actions CI)
- Дата: 2026-11-04, Europe/Helsinki.
- Коммит CI-файла только в TEST: [5f4ae30](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/5f4ae30af80736f582c7c6eb01b4c731a609ea63).
- GitHub Actions [run #41915536733](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41915536733), HEAD 5f4ae30, conclusion=success, job admin-access success. Логи: нативный Node 20 `node --test admin/tests/admin-access.test.cjs`: 29 tests, 29 PASS, 0 FAIL; четыре node --check PASS; release-manifest.test.cjs PASS. Нет deploy/секретов/записи Firebase.
- Это подтверждает только deterministic fake-Firebase client regression, не серверные Security Rules, не реальную роль admin, не браузер/iOS12 и не рабочий мониторинг. NEW-002 тестовое исправление опубликовано, stage C/E в целом остаются открытыми.

### RUN-20261104-012.2 / НАЧАЛ / IN_PROGRESS
- Дата: 2026-11-04, Europe/Helsinki.
- План: сохранить подтверждённый technical audit и handoff в TEST, обновить в master roadmap TASK-005 и Issue #10 статус NEW-002 с коммитами/CI, затем закрыть RUN-012 с указанием следующего шага. PRODUCTION и Firebase не трогать.
- Исходный TEST HEAD: 5f4ae30af80736f582c7c6eb01b4c731a609ea63.

### RUN-20261104-012.2 / ЗАВЕРШИЛ / DONE (TEST audit/handoff)
- Дата: 2026-11-04, Europe/Helsinki.
- В TEST branch опубликованы `admin/ADMIN_TECHNICAL_AUDIT_2026-11-04_RU.md` и append-only дополнение `admin/WORK_HANDOFF_START_HERE_RU.md`.
- Commit [49971ca](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/49971ca0dc24ecf400960a9a3e5505145401a879). Повторно прочитаны оба удалённых файла; PR #3 draft/open, merged=false, remote HEAD 49971ca0dc24ecf400960a9a3e5505145401a879.
- В audit отражён независимый CI 29/29 PASS, границы проверок, исходный RUN-008 и необходимые C/E/H проверки. Ни одной правки production/Firebase.

### RUN-20261104-012.3 / НАЧАЛ / IN_PROGRESS
- Дата: 2026-11-04, Europe/Helsinki.
- План: append-only обновить TASK-20261104-005 / NEW-002 в MASTER ROADMAP и Issue #10 с проверенными TEST commits 91fa4f7, 5f4ae30, 49971ca и Actions run 41915536733. Сохранить все галочки A–K незакрытыми, а real Admin/Security Rules — как blocker.
- Repo / branch docs: sanastoyhteiso/sanastoyhteiso.github.io / release/v3-safe-integration-20261104. TEST remote HEAD 49971ca0dc24ecf400960a9a3e5505145401a879.

### RUN-20261104-012.3 / ЗАВЕРШИЛ / DONE (master TASK-005 + Issue #10)
- Дата: 2026-11-04, Europe/Helsinki.
- [MASTER ROADMAP](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/MASTER_ROADMAP_V3_ADMIN_RELEASE_2026-11-04_RU.md) обновлён append-only записью TASK-20261104-005: [commit ab08e5e](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/ab08e5e5901bdbf2d44e06ec5f7e455ea57a3dd6).
- [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10) обновлён NEW-002 CHECKPOINT; read-back подтвердил запись, issue open. Этапы A–K не отмечены как выполненные.
- TEST PR #3 remote head [49971ca](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/49971ca0dc24ecf400960a9a3e5505145401a879), draft/open, merged=false. Повторный Actions [run 41915839350](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41915839350) на **точном HEAD 49971ca**: success, syntax checks, native fake-Firebase admin regression и release manifest все success.

### RUN-20261104-012 / ЗАВЕРШИЛ / DONE (локальный NEW-002 исправлен и опубликован; admin не готов)
- Дата: 2026-11-04, Europe/Helsinki.
- По RUN-011/012 зафиксированы проверенные TEST code 91fa4f7, CI 5f4ae30, audit/handoff 49971ca; `admin/tests/admin-access.test.cjs` доступен в GitHub; native Node CI 29/29 PASS на TEST, включая финальный HEAD. Предыдущий RUN-008 остаётся RECOVERED_NOT_PUSHED, НЕ DONE.
- **Открыто:** серверный custom claim и Firestore Security Rules, прямые permission deny/permit, реальные Auth/Firestore, iOS12 и современные браузеры, серверные агрегаты/мониторинг, backup+restore и ZIP rollout. Это блокеры этапов C/E/H/I; A–K остаются НЕ ЗАКРЫТЫ.
- **Следующий чат:** начать с [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10) и [TEST admin audit](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/ADMIN_TECHNICAL_AUDIT_2026-11-04_RU.md); проверить PR #3 HEAD=49971ca и CI; добавить новый RUN START; read-only аудит Security Rules/test admin claim, затем отдельные emulator и browser тесты по согласованным безопасным шагам. Запрет на merge, production, Firebase writes и платные тарифы сохраняется.

### RUN-20261104-013 / НАЧАЛ / IN_PROGRESS
- Дата: 2026-11-04, Europe/Helsinki.
- TASK-20261104-005 / NEW-002, следующий этап C (серверная безопасность) и H (тесты).
- Действие: безопасно изучить состояние security rules, конфигурации Firebase и подтверждения тестового admin custom claim в репозиториях/TEST PR #3; проверить существующие emulator tests и создать план проверок. Только read-only GitHub, без раскрытия секретов и запросов к реальной базе.
- Исходный TEST PR #3 HEAD=49971ca0dc24ecf400960a9a3e5505145401a879, DRAFT/open/not merged. Основная documentation ветка release/v3-safe-integration-20261104.
- Ожидаемый результат: подтверждённая инвентаризация, безопасный следующий шаг, конкретные отсутствующие тесты. Запрещено менять production/Firebase/Rules в облаке/тарифы/данные, нельзя merge.

### RUN-20261104-013 / ЗАВЕРШИЛ / DONE (только read-only аудит; серверный этап C не закрыт)
- Дата: 2026-11-04, Europe/Helsinki.
- Сверены TEST PR #3, Git tree HEAD 49971ca0dc24ecf400960a9a3e5505145401a879, master и TEST handoff, TEST config. В TEST дереве нет `firestore.rules`, `firebase.json`, Rules emulator test/CI, а значит отсутствует воспроизводимая проверка server authorization. Production и TEST main деревья также не содержат таких файлов; это **не** доказывает, что облачные правила отсутствуют, только что они не сохранены в проверенных Git refs.
- TEST config указывает на `sanastoyhteiso-v3-development`, но фактически опубликованные Rules и наличие тестового server-issued admin claim из GitHub не установлены. Не запрашивали реальные данные и не меняли Firebase.
- Подтверждены требования Firebase: правила используют `request.auth.token.admin == true` и `email_verified`; локальный `firebase emulators:exec` + rules-unit-testing может проверить изолированную модель, без облачного deploy.
- Следующий шаг: новый RUN-014 — исключительно **изоляционный контракт** Firestore Rules, не production rules и не полная замена текущего deployed rules; Node emulator тесты на deny/allow/get/list/write и отдельная TEST-only CI. Любая интеграция с реальными правилами требует read-only сверки полного deployed ruleset, исключающей переписывание существующего учебного доступа.

### RUN-20261104-014 / НАЧАЛ / IN_PROGRESS
- Дата: 2026-11-04, Europe/Helsinki.
- TASK-20261104-005 / NEW-002; этап C/H, тестовый изолированный контракт доступа к `admin_metrics/current`.
- План: добавить в TEST PR #3 `admin/security-tests/` с автономными правилами для безопасного emulator fixture и тестами: admin read только точного документа, отказ обычным/анонимным/неподтверждённым, запрещены любые client writes и list, запрет других путей; GitHub Actions workflow запускает emulator без Firebase token. Проверить на сервере CI; не переносить fixture в deployed rules.
- TEST branch исходный HEAD 49971ca0dc24ecf400960a9a3e5505145401a879; PR Draft/open. Не изменять Firebase cloud, production/main, данные, тарифы или merge.

### RUN-20261104-014.1 / ОШИБКА / FAILED (первый CI: разрешение зависимостей)
- Дата: 2026-11-04, Europe/Helsinki.
- Сохранён TEST commit [6a3599e](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/6a3599e1ba9d92e899ec039666c09cf38d58110d) с изолированными `admin/security-tests` и CI workflow. GitHub Actions [#41918184887](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41918184887) завершился **failure** до запуска emulator tests.
- Причина из логов: `ERESOLVE` — `@firebase/rules-unit-testing@6.0.0` требует peer `firebase@^13.0.0`, но указан `firebase@12.5.0`. **Никакие Firestore rules тесты не были запущены, PASS не заявляется.**
- Ограничения: не изменялись production, реальный Firebase, Rules/данные/тарифы.

### RUN-20261104-014.2 / НАЧАЛ / IN_PROGRESS
- Дата: 2026-11-04, Europe/Helsinki.
- Задача: устранить точный conflict в isolated test-only `package.json` (Firebase JS SDK 13.x в паре с rules-unit-testing 6), не использовать `--force`/`--legacy-peer-deps`. Повторно проверить GitHub Actions, затем при необходимости исправить обнаруженные реальные emulator failures и задокументировать результат.
- TEST branch исходный HEAD=6a3599e1ba9d92e899ec039666c09cf38d58110d. Никаких Firebase cloud изменений.

### RUN-20261104-014.2 / ЗАВЕРШИЛ / DONE (dependency fix + real Firestore emulator PASS)
- Дата: 2026-11-04, Europe/Helsinki.
- TEST commit [3d15e33](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/3d15e3321914ae2f0cc403502c70ff656c463656) поменял только `admin/security-tests/package.json` на `firebase@13.0.0`, соответствующий peer `@firebase/rules-unit-testing@6.0.0`; без `--force` или игнорирования зависимостей.
- [GitHub Actions #41918317702](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41918317702) conclusion SUCCESS. Реальный Firestore emulator, JS SDK 13.0.0, native Node tests **15/15 PASS, 0 FAIL**, включая ожидаемые `PERMISSION_DENIED` и разрешение для verified admin. Local demo project, без сетевой Firebase.
- На точном TEST HEAD 3d15e33: push и PR Actions для client admin regression **success**, push и PR Actions для isolated Firestore contract **success**. PR #3 DRAFT/open/not merged.
- Ограничение: это **только изолированный fixture**, не deployed rules или реальная выдача custom claim. Stage C/E/H не закрыты; production/main/Firebase cloud/данные/тарифы не менялись.

### RUN-20261104-014.3 / НАЧАЛ / IN_PROGRESS
- Дата: 2026-11-04, Europe/Helsinki.
- Задача: закрепить результат 15/15 в TEST technical audit / handoff, добавить точный read-only план проверки реального Rules/claim без секретов; обновить MASTER TASK-005 и Issue #10, сохранить финальные ссылки на CI; завершить RUN-014. Изолированный fixture не интегрировать в live rules.
- Исходный TEST HEAD=3d15e3321914ae2f0cc403502c70ff656c463656. Production и Firebase не трогать.

### RUN-20261104-014.3 / ЗАВЕРШИЛ / DONE (audit + master + Issue синхронизированы)
- Дата: 2026-11-04, Europe/Helsinki.
- TEST [audit/handoff commit b6d844c](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/b6d844cee16eaf63e85c8719055b8c14db469806), файлы прочитаны обратно. TEST PR #3 DRAFT/open/not merged, HEAD b6d844cee16eaf63e85c8719055b8c14db469806.
- MASTER ROADMAP дополнен TASK-20261104-007 в [commit c4ad5d5](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/c4ad5d55da746f99d69263065de9b3a3228af71f); Issue #10 дополнен checkpoint RUN-013/014. Read-back подтверждает обе записи и открытый Issue.
- На точном TEST HEAD b6d844c: [GitHub Actions #41918720460](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41918720460) SUCCESS для emulator contract, [#41918720247](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41918720247) SUCCESS для client regression.
- Это не реальная серверная проверка TEST Firebase. Изолированный deny-all fixture не deploy. A–K не закрывать.

### RUN-20261104-014 / ЗАВЕРШИЛ / DONE (только TEST fixture, Stage C остаётся частично)
- Дата: 2026-11-04, Europe/Helsinki.
- Сохранены TEST contracts, 15/15 native emulator PASS; client regression 29/29 PASS, журнал, report, мастер-документ и Issue #10 обновлены. Никакие production/Firebase cloud/данные/тарифы/merge не затронуты.
- **Остаётся:** получить полный read-only актуальный deployed ruleset `sanastoyhteiso-v3-development`, совместить с исходными student правилами, протестировать полный набор, подтвердить тестовый server-issued claim и два аккаунта; Stage C/E/H остаются OPEN.
- Следующий безопасный шаг: RUN-015 — проверка возможности read-only получить TEST deployed rules, без паролей/токенов и без изменения Firebase; если недоступно — отметить BLOCKED, затем продолжить независимыми тестами браузерного интерфейса на TEST.

### RUN-20261104-015 / НАЧАЛ / IN_PROGRESS
- Дата: 2026-11-04, Europe/Helsinki.
- Этап C: read-only поиск актуального полного TEST Firestore ruleset и server-issued role без секрета. Проверить доступные разрешённые источники (GitHub и прежние проектные материалы); установить, может ли имеющийся доступ подтвердить deployed ruleset или нужен Firebase connector.
- Исходный TEST PR #3 HEAD b6d844cee16eaf63e85c8719055b8c14db469806. Изменения cloud запрещены, PR остаётся Draft.
- Результат ожидается честный: READ_VERIFIED или BLOCKED_READ_ONLY с доказательствами. Нельзя выдавать ранее вставленный черновик Rules за текущую опубликованную версию.

### RUN-20261104-015 / ЗАВЕРШИЛ / DONE (read-only поиск, deployed ruleset остаётся недоступен)
- Дата: 2026-11-04, Europe/Helsinki.
- В историческом [PR #8](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/8), HEAD 828d702430037aeca271786bbcf067e202f10c0c, обнаружены полные **подготовительные**, не обязательно deployed, Rules для изолированного TEST проекта `sanastoyhteiso-v3-development`: `staging/backend/firestore.v3-development.rules` (234 строки, SHA blob 8f5da135e34de7e03437b85ce54e1e1aac1d7563) и сценарии эмулятора. В них `match /site_admin/{docId}` для claim admin, но **нет `match /admin_metrics/{metricId}`**; admin page PR #3 читает `admin_metrics/current`. Это конфигурационное расхождение исторической модели и нынешнего клиента.
- Найдены также separate historic combined Rules для `riveria-sanasto-community-test` (совсем другого Firebase проекта). Вопросы действительного deployment не разрешены: user прошлых чатов сообщал о Publish, но независимого read-only извлечения опубликованных Rules сейчас нет. Не переносить правила между проектами.
- Firebase connector (возможный доступ через отдельное подключение) сейчас не установлен; другой способ через доступные GitHub инструменты читать **живой deployed ruleset** не подтверждён. Никакие облачные правила, claims, данные не менялись.
- Выявлен **NEW-003 / HIGH:** mismatch `site_admin` vs `admin_metrics/current`, потенциальный blocker E/C при интеграции. Не утверждать, что облачные Rules обязательно такие же; статус `HISTORICAL_CONTRACT_MISMATCH`.
- Следующий шаг: записать NEW-003 в master+Issue, затем offline integration regression на полном историческом TEST ruleset плюс аддитивный match `admin_metrics/current`, запрет клиентских записей и сохранение student paths. Это тестовый проект-файл, **не deployed rules**.

### RUN-20261104-016 / НАЧАЛ / IN_PROGRESS
- Дата: 2026-11-04, Europe/Helsinki.
- TASK-20261104-008 / NEW-003, этапы C/E/H.
- План: зарегистрировать NEW-003 в MASTER ROADMAP/Issue #10, создать в TEST PR #3 изолированный regression suite на полном историческом TEST ruleset PR #8 (точный source commit 828d702), проверить правомерность и безвредность аддитивного `admin_metrics/current` вместе с существующими `users/settings/sync_v3/libraries_v3` правилами, получить нативный GitHub Actions результат; ни одного cloud deploy.
- Исходный TEST PR #3 HEAD=b6d844cee16eaf63e85c8719055b8c14db469806, DRAFT/open/not merged. Документация release ветка. Firebase cloud/production/тарифы/данные не менять.

### RUN-20261104-016.1 / ЗАВЕРШИЛ / DONE (NEW-003 зарегистрирован)
- Дата: 2026-11-04, Europe/Helsinki.
- NEW-003 / HIGH `site_admin` vs `admin_metrics/current` записан в [MASTER ROADMAP commit 0fa7dca](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/0fa7dca5442951fb86db2e1c2e90b40001ffd692) и [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10); исходный snapshot правил [PR #8 commit 828d702](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/828d702430037aeca271786bbcf067e202f10c0c) найден, текущий deployed Rules не установлен.
- Никаких изменений TEST кода, Firebase cloud, production или данных.

### RUN-20261104-016.2 / НАЧАЛ / IN_PROGRESS
- Дата: 2026-11-04, Europe/Helsinki.
- Действие: создать в TEST PR #3 сохранённую копию исторического V3 ruleset из PR #8 (точная SHA и пометка NOT DEPLOYABLE), добавить минимальное `admin_metrics/current` правило без изменения других путей, Node emulator integration tests для admin и student `users/settings/sync_v3/libraries_v3`; запустить CI и проверить удалённый commit.
- Исходный TEST HEAD b6d844cee16eaf63e85c8719055b8c14db469806. Не deploy; всё только offline.

### RUN-20261104-016.2 / ОШИБКА / FAILED (неполная строгость провайдера в новом тестовом правиле)
- Дата: 2026-11-04, Europe/Helsinki.
- TEST commit [2e9a5ac](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/2e9a5accde7334cef2f95feb41e66511e346ac68), 28 новых full historical-rules integration tests + прежние 15 standalone.
- Native [GitHub Actions #41919685700](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41919685700) завершился FAILURE: **43 tests, 42 PASS, 1 FAIL**, `admin_metrics rejects missing provider details`. В Firebase emulator `authenticatedContext` без explicit firebase provider получает `sign_in_provider=custom`; выражение `!= 'anonymous'` допускало такой вход, хотя для текущего админ-пилота ожидается только Google. Это **ошибка контракта**, не повод ослабить тест.
- Ни один реальный deployed ruleset не менялся; исходный PR #8 untouched. В остальных кейсах student paths остались зелёными.

### RUN-20261104-016.3 / НАЧАЛ / IN_PROGRESS
- Дата: 2026-11-04, Europe/Helsinki.
- Задача: заменить проверку provider `!= anonymous` на строго `== 'google.com'` только в isolated fixture и интеграционном admin_metrics match; обновить README и повторить обе группы тестов на GitHub CI. Это TEST пилот с Google Authentication; другие провайдеры нельзя молча разрешать.
- Исходный TEST HEAD=2e9a5accde7334cef2f95feb41e66511e346ac68, PR #3 draft/open. Не облачный deploy, не production, не secrets.

### RUN-20261104-016.3 / ЗАВЕРШИЛ / DONE (TEST полный исторический ruleset + новый admin path)
- Дата: 2026-11-04, Europe/Helsinki.
- TEST commit [fd6d94d](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/fd6d94d0da7bda24ec4dc3359f346d27a790d1ad) сохраняет строгое `sign_in_provider == 'google.com'` в обоих изолированных fixtures, дополнительные отрицательные tests и README. Ранее commit [2e9a5ac](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/2e9a5accde7334cef2f95feb41e66511e346ac68) внёс snapshot полного исторического V3 ruleset от PR #8, аддитивный match `admin_metrics/current` и integration tests для `users/settings/sync_v3/libraries_v3`.
- Native [GitHub Actions #41920093362](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41920093362) `success`; 46 tests, **46 PASS, 0 FAIL**, настоящий локальный Firestore Emulator, exit 0. Предыдущий [FAIL #41919685700](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41919685700) (42/43) оставлен в истории как диагностический промежуточный результат.
- Прямая read-back check итоговых файлов и статус PR ещё выполнить; это не deployed Rules. `firebase deploy` не вызывался. Client/production/Firebase cloud/пользовательские данные и тарифы не менялись.

### RUN-20261104-016.4 / НАЧАЛ / IN_PROGRESS
- Дата: 2026-11-04, Europe/Helsinki.
- Действие: сохранить TEST audit/handoff checkpoint NEW-003 с CI 46/46; повторно прочитать TEST файлы и PR/CI; синхронизировать NEW-003/TASK-008 в master и Issue #10; закрыть RUN-016 с точным remaining blocker. Не утверждать реальную авторизацию или полную совместимость без текущих deployed Rules.
- TEST HEAD fd6d94d0da7bda24ec4dc3359f346d27a790d1ad.

### RUN-20261104-016.4 / ЗАВЕРШИЛ / DONE (NEW-003 checkpoint синхронизирован)
- Дата: 2026-11-04, Europe/Helsinki.
- TEST [audit/handoff commit e353295](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/e35329534c8d8e7a6300a026bb1a827f98de88b2). Повторный read-back показал `admin/security-tests/security.integrated.test.cjs` с 29 кейсами, технический audit с RUN-015/016, TEST PR #3 DRAFT/open/not merged, HEAD e35329534c8d8e7a6300a026bb1a827f98de88b2.
- На **точном финальном HEAD**: [Actions #41920432803](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41920432803) SUCCESS, нативный локальный Firestore emulator **46/46 PASS, 0 FAIL**, [client admin regression #41920432780](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41920432780) SUCCESS.
- MASTER TASK-20261104-008 обновлён в [commit 23323c6](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/23323c6a396603e9b4835c64f2b3e6a0a63add6f); Issue #10 дополнен NEW-003 checkpoint, оба read-back подтверждены, Issue остаётся open. Ни одна галочка A–K не закрыта.
- Весь набор правил — только историческая offline-копия и synthetic emulator data, НЕ действующие TEST Firebase Rules.

### RUN-20261104-016 / ЗАВЕРШИЛ / DONE (offline исправление NEW-003; cloud gate BLOCKED)
- Дата: 2026-11-04, Europe/Helsinki.
- Сделано: зафиксирована несогласованность пути `site_admin` vs `admin_metrics/current`; создан изолированный полный исторический TEST ruleset snapshot из PR #8 с additive admin_metrics и сохранением student access. В GitHub commit 2e9a5ac были 42/43 PASS (1 FAIL), ошибка про слишком широкий provider не скрывалась; исправлено в fd6d94d и независимо подтверждено нативными **46/46 PASS** на точном HEAD e353295. PR не merged.
- **Открытые условия:** отсутствует независимый доступ к актуальной опубликованной конфигурации Rules тестового облачного Firebase `sanastoyhteiso-v3-development`; нет подтверждения server-issued claim, реального admin/user deny/allow и испытаний Safari/iOS12; слепой deploy исторического fixture недопустим. NEW-003 остаётся ЧАСТИЧНО, Stage C/E/H OPEN.
- **Следующему чату:** сначала проверить журнал, TEST PR #3 HEAD=e353295 и Actions 41920432803. Создать RUN START, read-only получить полный текущий deployed TEST ruleset (через безопасный разрешённый доступ к Firebase), сравнить с PR #8 и TEST fixture; до этого НЕ выполнять Firebase deploy/claims/merge/production. Другой Firebase проект `riveria-sanasto-community-test` не трогать. При отсутствии read-only доступа честно указать BLOCKED и продолжать лишь независимые браузерные/статические тесты на TEST.


### RUN-20261105-017 / НАЧАЛ / IN_PROGRESS (READ-ONLY Firebase rules audit; GitHub documentation only)
- Дата: 2026-11-05, Europe/Helsinki. Продолжение после RUN-20261104-016, NEW-003 / Stage C/E/H.
- Источник: historical PR #8 HEAD 828d702430037aeca271786bbcf067e202f10c0c; TEST PR #3 HEAD e35329534c8d8e7a6300a026bb1a827f98de88b2 (DRAFT/open/not merged); последний зафиксированный emulator CI 41920432803 (46/46 PASS).
- Задача: получить full current published TEST Firestore Rules именно `sanastoyhteiso-v3-development` с version/published timestamp, сравнить с PR #8 и NEW-003 test fixtures, оценить admin_metrics/current и сохранность student ACL. Только чтение конфигурации, никаких Firebase changes.
- Разрешённые изменения: исключительно GitHub документация — technical audit, append-only журнал, master task, Issue #10. Код/Rules/Firestore/Auth/user data/тарифы/production/merge не трогать.
- Ограничение интерфейса: этот обычный чат не наследует открытую авторизованную вкладку Firebase Console из Work; сначала проверить доступные разрешённые способы read-only чтения. Если current deployed rules недоступны, отметить BLOCKED_READ_ONLY, не подменять их историческим fixture.


### RUN-20261105-017 / ЗАВЕРШИЛ / PARTIAL — BLOCKED_READ_ONLY (Firebase cloud untouched)
- Дата: 2026-11-05, Europe/Helsinki. Исходный `НАЧАЛ` сохранён в [commit 9f69a29](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/9f69a29ec9d68d4d4193fc85b82919c6e671ce21).
- GitHub read-only: восстановлен RUN-016, сверены historical PR #8 (HEAD 828d702, rules blob 8f5da135), TEST PR #3 (DRAFT/open/not merged, HEAD e353295), admin-page path `admin_metrics/current`, NEW-003 emulator fixture (blob 1372d301) и тесты. Точный LCS: исходных 233 строки сохранены, удалений 0; 11 строк добавлено (2 защитных комментария + match admin_metrics и пояснения). Остальные student/site_admin правила исторической модели не затронуты.
- Исторический TEST fixture проверяет get только `admin_metrics/current` для verified boolean admin с Google provider, deny list/writes и student deny. Последний ранее подтверждённый на точном TEST HEAD [Actions #41920432803](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41920432803) 46/46 PASS; новых emulator/cloud тестов в RUN-017 **НЕ** выполнялось.
- **НЕ ПОЛУЧЕНО:** актуальный published ruleset `sanastoyhteiso-v3-development`, его version/release ID/date, реальные Firestore allow/deny и server-issued admin claim. В этой обычной сессии не доступна ранее открытая авторизованная вкладка Firebase Console Work; не выдаём исторический PR #8 за live. `rules_version = '2'` — только синтаксис. Статус Stage C/E/H и NEW-003 **OPEN / BLOCKED_READ_ONLY**.
- [Полный отчёт](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/FIRESTORE_RULES_AUDIT_RUN-20261105-017_RU.md) создан в [commit 4e73e354](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/4e73e354b2974b77b73e35aef5b96854585d898d). MASTER [TASK-20261105-009 commit f98cf251](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/f98cf2513624d3980e0a424e5b6325c285509ef9), [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10) обновлены. Все галочки A–K остаются открытыми.
- **NEXT:** из Work с авторизованной Firebase Console **READ-ONLY** скопировать полный current TEST Rules + version + published timestamp именно `sanastoyhteiso-v3-development`. Сверить с PR #8/NEW-003, существующими student путями и OR-overlap; затем isolated full snapshot emulator. До этого не изменять Firebase/Auth/Firestore/Rules/пользовательские данные/тариф, не объединять PR и не трогать production. Последующий обычный чат должен начать с RUN-20261105-018 / НАЧАЛ и прочитать отчёт RUN-017.

### RUN-20261105-018 / НАЧАЛ / IN_PROGRESS (полный пользовательский текст TEST Firestore Rules)
- Дата: 2026-11-05, Europe/Helsinki; после RUN-017 / BLOCKED_READ_ONLY.
- Источник: владелец скопировал и вставил в текущий чат полный текст Firestore Security Rules для `sanastoyhteiso-v3-development`, без версии публикации/даты. Этот текст является **предоставленной владельцем копией**, не независимым экспортом Firebase Rules API; verified revision/date пока UNKNOWN. Секретов или личных данных в тексте не обнаружено.
- Предварительное наблюдение: конфигурация содержит `collection_set` для `sync_v3` и `sync_demo_v3`, также `site_admin/{docId}`, но **не содержит** `match /admin_metrics/{metricId}`; TEST admin JS читает `admin_metrics/current`. Это подтверждает NEW-003 **для присланной конфигурации**. `rules_version='2'` — версия синтаксиса, не версия публикации.
- План: сопоставить по содержимому с зафиксированным историческим `staging/backend/firestore.v3-development-with-finds.rules` из PR #8; создать отдельные локальные эмуляторные fixtures из *переданного* варианта (original baseline + additive NEW-003) в TEST PR #3, не подменяя существующие fixtures; добавить регрессионные тесты студентов, `collection_set`, `sync_demo_v3`, admin deny/permit; запустить GitHub CI. Затем обновить technical audit, MASTER, Issue #10, журнал START→END и handoff.
- TEST PR #3 исходный HEAD=e35329534c8d8e7a6300a026bb1a827f98de88b2, Draft/open/not merged. Рабочая Firebase, Auth, пользователи, тарифы, production и merge НЕ МЕНЯЮТСЯ. Никаких Firebase deploy / publish.

### RUN-20261105-018.2 / НАЧАЛ
- Пользователь запросил полный текст правил с минимальным доступом администратора для самостоятельной вставки в тестовую Firebase.
- План: сохранить полный кандидат в TEST PR №3, проверить на эмуляторе и дать ссылку для копирования. Не публиковать и не менять Firebase автоматически.

### RUN-20261105-018.1 / ЗАВЕРШИЛ / DONE (тестирование копии правил владельца)
- Владелец предоставил текст правил TEST Firebase `sanastoyhteiso-v3-development` из Console. Он соответствует исторической редакции с `collection_set` и `sync_demo_v3` (PR #8 blob `86ba7d0b`) по содержимому; cloud revision/date всё ещё неизвестны. Подтверждено отсутствие `admin_metrics/current`.
- TEST commit [f8a60b6](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/f8a60b65fd3e0940052c5df3a40d039d72d06623): отдельные baseline/additive fixtures, 39 новых cases; [Actions #41944285697](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41944285697) SUCCESS **85/85 PASS** в локальном Firestore Emulator. Пользовательские правила не менялись.

### RUN-20261105-018.2 / ЗАВЕРШИЛ / DONE (полный готовый файл правил TEST с админ-доступом; Firebase не менялась)
- [TEST commit bb3b39d](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/bb3b39dea3cfc5cf5a8c0eca1ad95510ad9f98b3) создал [полный кандидат из 284 строк](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/bb3b39dea3cfc5cf5a8c0eca1ad95510ad9f98b3/admin/security-tests/candidates/FIRESTORE_V3_DEVELOPMENT_FULL_FOR_MANUAL_REVIEW.rules). Сохранены **все** исторические student rules и новые `collection_set`/`sync_demo_v3`; вставлен один узкий `match /admin_metrics/{metricId}`: get `current` только verified boolean admin + Google provider, client list/write запрещены.
- `security.user-supplied.test.cjs` теперь проверяет **именно готовый файл**, в том числе identity-invariant: исходный полный текст неизменён после удаления единственного добавленного блока. [GitHub Actions #41944955117](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41944955117) SUCCESS **86/86 PASS, 0 FAIL** в локальном Firestore Emulator (Node 22 / Firebase SDK 13); client CI на новом HEAD проверить отдельно.
- Владелец получил ссылку на полный код, чтобы самостоятельно скопировать через GitHub Raw. **Это не cloud Publish.** Сначала резерв текущих Rules, сверка TEST project/base, затем только сознательное ручное изменение в TEST. Важное ограничение: Firebase Rules не назначает custom admin claim и не создаёт/обновляет `admin_metrics/current`; для реального доступа потребуется доверенный Admin SDK и агрегация. Production/другой Firebase project/тарифы/данные/merge не менялись.
- RUN-018 документация/master/Issue/handoff ещё синхронизируются отдельным закрывающим подэтапом.

### RUN-20261105-018.3 / НАЧАЛ / IN_PROGRESS
- Проверить TEST PR #3 exact HEAD/client CI и read-back готового файла, обновить TEST audit/handoff, MASTER и Issue #10, затем закрыть RUN-018 без заявления о real Firebase admin access.

### RUN-20261105-018.3 / ЗАВЕРШИЛ / DONE
- TEST PR #3 HEAD 94d37e5d71d8355845f7a82abd5b91df86d388e7, DRAFT/open/not merged. TEST audit/handoff [commit 94d37e5](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/94d37e5d71d8355845f7a82abd5b91df86d388e7).
- На ТОЧНОМ финальном HEAD: [Firestore Emulator Actions #41945223658](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41945223658) **86/86 PASS, 0 FAIL**, [client admin regression #41945223759](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41945223759) SUCCESS.
- MASTER TASK-20261105-010 обновлён в commit 064765690677fee96f63106c059f3cf7f182b94e, Issue #10 дополнен RUN-018, остаётся OPEN. Полный `*.rules` файл для ручного копирования в TEST сохранён в TEST ветке.
- Cloud Firebase/данные/права пользователей/тарифы/production/merge НЕ менялись.

### RUN-20261105-018 / ЗАВЕРШИЛ / PARTIAL — полный кандидат готов, живая авторизация ещё не работает
- Сделано: изучены полные правила, присланные владельцем, обнаружено отсутствие `admin_metrics/current`, создан отдельный полный файл правил и 86 проходящих регрессионных проверок в изолированном Firestore Emulator; запись результата в audit, master и Issue #10.
- Не завершено: НЕ было Firebase Publish, подтверждения release ID/timestamp, назначения server-issued custom admin claim, создания server-generated `admin_metrics/current`, прямого allow/deny двух реальных пользователей или браузерного теста. **Следовательно, нельзя считать, что админка сейчас открывается или отображает метрики.**
- NEXT: владелец может скопировать полный файл только в TEST Firebase, предварительно сохранив актуальные опубликованные Rules. Затем отдельно проверить серверную роль/доступ и безопасный backend-агрегат с согласованием. Production, другой проект и merge исключены.

### RUN-20261105-019 / НАЧАЛ / IN_PROGRESS (владелец опубликовал TEST Rules; read-only аудит административного доступа)
- Дата: 2026-11-05, Europe/Helsinki. Владелец сообщил: новый полный TEST ruleset вручную опубликован в Firebase Console после RUN-018. Это свидетельство владельца, а не независимый Firebase API read-back; published release ID/time пока неизвестны.
- Цель: определить следующий безопасный этап действительного доступа админа без изменений Firebase. Проверить TEST PR #3 client auth/claims, публичность тестовой админ-страницы, подтверждение правил offline CI, существование серверного механизма выдачи роли/метрик; зафиксировать инструкцию без пересылки токенов, ключей, UID в открытый GitHub.
- Исходный TEST HEAD=94d37e5d71d8355845f7a82abd5b91df86d388e7 (PR #3 DRAFT/open, не merged), RUN-018 emulator 86/86 PASS. Запрещены cloud Firebase Auth/Firestore/Rules writes, production, тарифы, PR merge; этот RUN только документация и проверка доступных публичных фактов.

### RUN-20261105-019 / ЗАВЕРШИЛ / PARTIAL — OWNER_REPORTED_PUBLISHED; admin claim/metrics still open
- Владелец сообщил, что вручную нажал Publish для нового полного TEST Firestore ruleset в `sanastoyhteiso-v3-development`. Записано как OWNER_REPORTED_PUBLISHED; Firebase release ID/date/cloud read-back и live permission tests не проводились. Слова владельца не подменяются независимым API аудитом.
- READ-ONLY audit: TEST PR #3 HEAD=94d37e5d71d8355845f7a82abd5b91df86d388e7, Draft/open/unmerged; `v3-unified-preview/admin/admin-page.js` проверяет emailVerified и строгий `getIdTokenResult(...).claims.admin===true`, затем читает единственный `admin_metrics/current`; `admin-entry.js` скрывает ссылку без claim. В TEST default `main` отсутствует `v3-unified-preview/admin/index.html`: по GitHub file API admin route не опубликован в стандартной ветке; HTTP доступность Pages независимо не подтверждена (web open не удалось).
- TEST feature tree (175 entries) не содержит проверенного backend/Admin SDK для присвоения custom claim либо генерации admin_metrics. Публикация Firestore Rules лишь разрешает проверку server-issued роли, но не создаёт роль или документ. Документация Firebase подтверждает роль доверенного Admin SDK и необходимость refresh ID token.
- Сохранён отдельный [технический handoff RUN-019](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/ADMIN_ACCESS_AFTER_RULES_PUBLISH_RUN-20261105-019_RU.md) в commit 5d5b6897a22a58381eaf8df649c5185612de066a; MASTER TASK-20261105-011 commit 34be4ce2704348baab5ac749091a1536076242d0, Issue #10 обновлён и остаётся open.
- **Не делалось:** Firebase Auth claim, Firestore documents, Rules, cloud backend, код TEST PR, production, тарифы, merge. Следующие шаги: владелец локально подтверждает собственный verified Google user в Authentication → Users тестового проекта; выбирается доверенная однократная процедура назначения `admin=true` с сохранением прежних claims, затем подтверждается test admin page staging deployment и data feed. Реальные admin/student allow/deny + iOS12 позже. Статусы B/C/E/H остаются OPEN.

### RUN-20261105-020 / НАЧАЛ / IN_PROGRESS (Google-вход владельца подтверждён; безопасная разовая выдача TEST admin claim)
- Дата: 2026-11-05, Europe/Helsinki. Владелец сообщил, что в TEST Firebase Authentication → Users присутствует его личная учётная запись, вход через Google. Факт основан на сообщении владельца; verified email, UID/claims и IAM разрешения независимо не прочитаны.
- Задача: без изменения Firebase разработать проверяемый одноразовый скрипт для TEST проекта `sanastoyhteiso-v3-development`, который сначала подтверждает правильный project/user/provider/emailVerified, сохраняет существующие custom claims и требует отдельного локального подтверждения оператора; подготовить инструкции для Cloud Shell без сервисных ключей в чате. По умолчанию сухая проверка (dry-run); никаких CI операций над реальными пользователями.
- Строго запрещено назначать админа со стороны ассистента, изменять Firebase/Auth/Firestore/production, включать платный тариф или объединять PR #3. Код и synthetic CI только в TEST feature branch; journal/master/Issue только в release docs.
- Исходный TEST PR #3 HEAD=94d37e5d71d8355845f7a82abd5b91df86d388e7, DRAFT/open/unmerged; Firestore Rules owner-reported published (RUN-019), emulator 86/86 PASS (RUN-018).

### RUN-20261105-020 / ЗАВЕРШИЛ / PARTIAL — инструмент TEST admin role подготовлен, real claim не выдавался
- Основание: владелец подтвердил наличие собственной Google-auth записи в TEST Firebase `sanastoyhteiso-v3-development`. Прямой read-back Firebase Auth, verified-почты, UID или claims нет.
- TEST [script+tests commit 8004a75](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/8004a750546d1ebf6c7b7edf72525cc7523c2f10) создал `admin/ops/assign-test-admin.cjs` с `dry-run` по умолчанию, строгим ограничением на TEST проект, проверкой активного подтверждённого Google-пользователя, сохранением прошлых custom claims и отдельным повторным подтверждением для `--apply`. Локальная 0600 backup до возможного изменения, read-back после; никакого облачного запуска скрипта со стороны ChatGPT. [Инструкция](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/ops/README_TEST_ADMIN_CLAIM_RU.md).
- На TEST коде [policy/client GitHub Actions #41970990829](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41970990829) SUCCESS; [native isolated Rules Emulator Actions #41970990821](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41970990821) **86/86 PASS, 0 FAIL** на точном TEST PR #3 HEAD d5ede8385945f7ca1175d234ae87e282758e41b5, Draft/open/unmerged. Пакет policy+client также подтверждён [Actions #41970849164](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41970849164) **45/45 PASS**; на следующем финальном HEAD повторный regression workflow SUCCESS.
- TEST audit/handoff checkpoint [commit d5ede83](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/d5ede8385945f7ca1175d234ae87e282758e41b5). MASTER TASK-20261105-012 [commit e522059](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/e522059d0c71c605e0644a6af4ef3125e58aacd8), Issue #10 дополнены.
- НИКАКИХ реальных Firebase/Auth/Firestore/Rules/user data/cloud/тариф/production/merge изменений ChatGPT не делал. Текущий status B/C/E/H OPEN: admin claim не назначен, публичный TEST admin UI и реальные server aggregates ещё не действуют. Следующий шаг для владельца: в личном Google Cloud Shell проверить TEST проект и **только dry-run**; при ошибке IAM/ADC STOP, не публиковать service-account key/UID.

### RUN-20261105-021 / НАЧАЛ → ЗАВЕРШИЛ / BLOCKED_NO_FIREBASE_ACCESS
- Владелец прямо разрешил самостоятельно назначить роль администратора своего Google Auth аккаунта в TEST `sanastoyhteiso-v3-development`.
- Проверен текущий набор подключённых инструментов: имеется доступ к GitHub/документации, но нет инструмента Firebase Authentication/Google Cloud Shell/браузерной сессии Work, способного выдать `customClaims.admin=true`. Firebase plugin найден в каталоге, но не установлен; ранее предлагался и повторно не предлагается.
- Назначение роли НЕ выполнялось. Не предпринимались обходные GitHub Actions операции с секретами или с подменой credentials, чтобы не затронуть реальные аккаунты. Скрипт RUN-020 остаётся готовым с dry-run и подтверждением для явного запуска владельцем в доверенном Cloud Shell.
- NEXT: открыть Work с авторизованным Google Cloud Console и выполнить owner-approved one-time safe workflow, либо отдельным явным действием подключить инструмент с разрешённым Firebase Auth admin API; после операции проверить серверную роль и освежить ID token. TEST PR #3 остаётся Draft, основной сайт не трогать.

### RUN-20261105-022 / НАЧАЛ / IN_PROGRESS (Cloud Shell dry-run; назначение только после отдельного подтверждения)
- Время (Europe/Helsinki): 2026-11-05 07:06:05.
- TASK-20261105-012 / этап C. Продолжение RUN-020; RUN-021 прочитан, завершён BLOCKED_NO_FIREBASE_ACCESS, реальная роль тогда не назначалась.
- Текущее разрешение владельца: использовать облачный браузер и Google Cloud Shell, выполнить dry-run только для существующего собственного Google Auth аккаунта в `sanastoyhteiso-v3-development`; перед `admin=true` обязательно запросить отдельное подтверждение после успешных проверок. Старые ограничения RUN-020 относятся к тому запуску; текущий scope явно задан владельцем.
- Repo / branch / HEAD до действия: docs `sanastoyhteiso/sanastoyhteiso.github.io` / `release/v3-safe-integration-20261104` / `6fc7ebad2b7a8842af41cd365f67a7405af48117`; TEST PR #3 `feat/admin-control-center-package-spec-20261104` / `d5ede8385945f7ca1175d234ae87e282758e41b5`, DRAFT/open/unmerged.
- Прочитаны README и `admin/ops/assign-test-admin.cjs` (blob `e3eecb74c11596a9ff487a2b054317c39b78d5f5`): dry-run без writes; apply сохраняет прежние claims, local 0600 backup, точное подтверждение аккаунта и read-back.
- План: восстановить вход при необходимости; проверить TEST project, текущий Cloud Shell project, совпадение владельца и enabled/verified/Google Auth user; выполнить только dry-run. При отказе ADC/IAM остановиться. UID/email/токены/ключи не публиковать. Отдельный подшаг apply допустим только после подтверждения пользователя по итогам dry-run.
- Обнаружено при открытии Firebase Console: Google показывает экран выбора аккаунта с признаком завершённой сессии; доступа к Firebase/Cloud Shell пока нет. Следующий шаг — безопасный вход владельца.
- Не менять других пользователей, Firestore Rules/данные, production/рабочий сайт, Firebase тариф или PR merge. Все последующие результаты фиксировать без персональных идентификаторов.


### RUN-20261105-022 / ЗАВЕРШИЛ / PARTIAL — WAITING_OWNER_DRY_RUN (Cloud Shell восстановлен, права НЕ подтверждены)
- Дата: 2026-11-05, Europe/Helsinki. Продолжение из нового обычного чата по скриншоту владельца (Cloud Shell, Safari iPhone); запись START 07:06:05 выше сохраняется без изменения.
- Скриншот показывает активный Cloud Shell в проекте `sanastoyhteiso-v3-development`, присутствие `~/sanastoyhteiso-admin-once/assign-test-admin.cjs` размером **5216 байт**, текущий prompt в правильном каталоге. Сообщение `Terminal tabs have been recovered...` относится к восстановлению вкладок; состояние прежних процессов из него не следует.
- Read-only повторно прочитан GitHub исходник `admin/ops/assign-test-admin.cjs`, blob `e3eecb74c11596a9ff487a2b054317c39b78d5f5`, 5216 символов; совпадение размера со скриншотом **не равно** криптографической проверке локального файла. Источник TEST PR #3: HEAD `d5ede8385945f7ca1175d234ae87e282758e41b5`, draft/open. Проверены GitHub Actions [client #41970990829](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41970990829) SUCCESS и [emulator #41970990821](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41970990821) SUCCESS на этом HEAD. Production `main` сохранён на `d29813cf409af9dc60804105ca3141f98ec12fcd`.
- **Реальный dry-run в Cloud Shell не подтверждён:** у этого обычного чата отсутствует доступ к авторизованной интерактивной shell-сессии; фото `ls` — это только проверка наличия файла. Не считаться успешным dry-run, проверкой UID, emailVerified, IAM или текущих claims. Ни `--apply`, ни доступ к Auth API здесь не выполнялись; серверное назначение роли не подтверждено.
- **Следующее действие владельца в той же приватной Shell:** проверить `gcloud config get-value project`; затем `node assign-test-admin.cjs --dry-run`. UID вводить *только локально* по запросу скрипта; при IAM/ADC error остановиться, не загружать ключи. По результату сообщить только обезличенный статус и наличие/тип ошибки — без UID/email/tokens. **Отдельное подтверждение владельца обязательно до `--apply`.**
- Результат RUN-022: `PARTIAL / WAITING_OWNER_DRY_RUN`; Stage C и все A–K OPEN. Никаких Firebase/Firestore/Rules/user data/production/тарифов/PR merge действий этим чатом не сделано. После получения успешного dry-run начать новый RUN со сверкой аккаунта и отдельным согласием.


### RUN-20261105-023 / НАЧАЛ / IN_PROGRESS (GitHub checkpoint RUN-022 → MASTER + Issue #10)
- Дата: 2026-11-05, Europe/Helsinki. ТОЛЬКО документация GitHub после восстановления непрерывного журнала. RUN-022 закрыт как PARTIAL/WAITING_OWNER_DRY_RUN в [commit 4f122d6](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/4f122d65628754428105d6e24788e63e5b3cbf63).
- План: append-only добавить TASK-20261105-013 в `docs/MASTER_ROADMAP_V3_ADMIN_RELEASE_2026-11-04_RU.md`, отметить незавершённый dry-run на Issue #10, перепроверить, что A–K/NEW-003 и production GO не закрыты. После read-back закончить RUN-023 ссылками на GitHub.
- Scope: release/docs и Issue #10, без изменений TEST PR, Firebase/Auth/Firestore/Rules, сайта, данных, тарифов или публикации. Ожидаемое состояние: следующему исполнителю видна точка продолжения и запрет на `--apply` до отдельного подтверждения.


### RUN-20261105-023 / ЗАВЕРШИЛ / DONE (GitHub handoff синхронизирован; Firebase не менялась)
- Дата: 2026-11-05, Europe/Helsinki. Прочитаны назад обе удалённые записи: MASTER `TASK-20261105-013` есть в [commit 96b41a6](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/96b41a6a83bbae129f41209c2b9574611ade9420); checkpoint `RUN-022 / TASK-20261105-013` есть в [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10). История append-only.
- RUN-022 `PARTIAL / WAITING_OWNER_DRY_RUN`, не подменяется фиктивным DONE; исторические RUN-017–021 не изменены. TEST PR #3 draft/unmerged; A–K NO-GO. Не проверен private Auth account/UID, dry-run и `admin=true`; cloud shell не управляется текущим чатом. Ни одного Firebase/production write.
- NEXT: дождаться обезличенного результата локального `node assign-test-admin.cjs --dry-run` от владельца после проверки TEST project; затем новый RUN с read-only анализом и отдельным подтверждением перед единственной возможной командой `--apply`. При ошибке ADC/IAM — STOP, без секретов и обходов.

### RUN-20261105-024 / НАЧАЛ / IN_PROGRESS (скриншот Cloud Shell: dry-run ожидает UID)
- Дата: 2026-11-05, Europe/Helsinki; Stage C, продолжение RUN-022 / TASK-20261105-013.
- Владелец показал вывод активной приватной Google Cloud Shell после `gcloud config get-value project` и `node assign-test-admin.cjs --dry-run`. В терминале подтверждён TEST project `sanastoyhteiso-v3-development`, строка `Mode: dry-run` и приглашение `Paste YOUR OWN TEST UID...`. Ввод UID/чтение Firebase Auth ещё не выполнялись, `DRY RUN COMPLETE` не получено.
- План: дать безопасную инструкцию скопировать UID из Authentication → Users прямо в приватный терминал, не раскрывая UID/почту в чате или GitHub; явно отделить начало dry-run от его успешного завершения и запретить `--apply` до отдельного разрешения. Только GitHub-журнал, без изменений облака, TEST PR, main и пользовательских прав.

### RUN-20261105-024 / ЗАВЕРШИЛ / PARTIAL — WAITING_OWNER_UID (не dry-run PASS)
- Скриншот проверен: правильный TEST project, запущена безопасная интерактивная команда с `--dry-run`, ожидается приватный UID. Никаких Auth запросов и изменений роли до пользовательского ввода не подтверждено.
- Записана задача TASK-20261105-014 в [MASTER ROADMAP](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/MASTER_ROADMAP_V3_ADMIN_RELEASE_2026-11-04_RU.md) ([commit](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/24389d669e2115b1c480b9f513023e810559ea32)) и контрольная точка в [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10).
- Следующий шаг: дождаться безопасного ввода UID владельцем в собственном Cloud Shell и обезличенного сообщения о результате. При ошибке ADC/IAM остановиться, не публиковать ключи. `--apply` только после успешных проверок и отдельного подтверждения. Нет Firebase/prod/TEST PR writes. Этап C OPEN.


### RUN-20261105-025 / НАЧАЛ / IN_PROGRESS (успешный Cloud Shell dry-run; отдельное разрешение на apply)
- Дата: 2026-11-05, Europe/Helsinki (скриншот владельца 10:26). Этап C, продолжение RUN-024.
- Владелец показал результат в **приватном Cloud Shell** после ввода собственного UID: правильный TARGET TEST PROJECT `sanastoyhteiso-v3-development`, активная подтверждённая Google Auth учётная запись, сообщение `Current admin claim is not true. Other claims are preserved.`, а также `DRY RUN COMPLETE: no changes.`. Не публиковать видимые на исходном скриншоте UID или email; в GitHub хранить только обезличенные итоги.
- Задача только документационная: зафиксировать PASS dry-run в MASTER TASK и Issue #10, сохранить состояние TEST Stage C / WAITING_EXPLICIT_OWNER_APPROVAL; затем дописать END. До отдельного подтверждения **НЕ запускать `node assign-test-admin.cjs --apply`**. Никаких изменений Firebase/Auth/Rules/production/PR/тарифа.
- Ожидаемый результат: журнал, MASTER и issue сходятся, а следующий чат не ошибётся, будто роль уже назначена.


### RUN-20261105-025 / ЗАВЕРШИЛ / PARTIAL — VERIFIED_DRY_RUN_PASS, WAITING_EXPLICIT_OWNER_APPROVAL
- Прочитаны обратно и подтверждены сохранённые записи: [MASTER TASK-20261105-015, commit 4c9b1e0](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/4c9b1e025f86e13ef659ad329575f06916954e8c), [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10); пользовательские UID/email в GitHub не копировались.
- Доказано скриншотом владельца: правильный TEST project, активная verified Google-linked учётная запись, текущий admin claim not true, сообщение `DRY RUN COMPLETE: no changes.`. Никакого `--apply`/записи claims и изменения других аккаунтов не было; cloud/billing/prod/PR не тронуты.
- NEXT: **только после явного отдельного согласия владельца** предложить `node assign-test-admin.cjs --apply` в его приватном Cloud Shell; до выполнения — не считать роль выданной. Новый RUN должен задокументировать результат без идентификаторов и затем отдельно проверить токен/реальный доступ. Stage C и весь выпуск NO-GO.


### RUN-20261105-026 / НАЧАЛ / IN_PROGRESS (разрешение владельца на одноразовую выдачу TEST admin)
- Дата: 2026-11-05, Europe/Helsinki. Stage C; после успешного RUN-025 dry-run.
- Владелец явно подтвердил: «Да, разрешаю! Продолжай» в ответ на точный запрос разрешения выдать `admin=true` *только его ранее проверенной Google Auth учётной записи* в `sanastoyhteiso-v3-development` с сохранением других claims. Это разрешение **не распространяется** на чужих пользователей, LIVE Firebase `riveria-sanasto-community-test`, Rules, сайт или тариф.
- Цель: безопасно передать владельцу локальную команду `node assign-test-admin.cjs --apply` в существующем личном Google Cloud Shell; скрипт ещё раз проверит TEST project, enabled/verified Google user, потребует UID и собственноручное повторное подтверждение email + `GRANT TEST ADMIN`, сохранит локальный 0600 backup прежних claims и сверит результат. В этом чате нет подключённой авторизованной оболочки Cloud Shell; сам ChatGPT не выдаёт роль удалённо.
- Ожидается **только обезличенный** текст статуса / ошибки, без UID, email, backup claims, tokens или секретов. До подтверждённого вывода SUCCESS **не объявлять роль назначенной**. План документации: мастер-план и Issue #10, затем терминальный статус RUN-026 — WAITING_OWNER_EXECUTION.


### RUN-20261105-026 / ЗАВЕРШИЛ / PARTIAL — WAITING_OWNER_EXECUTION (consent recorded; admin assignment not verified)
- Зафиксировано отдельное согласие владельца на одноразовое `admin=true` только в TEST Firebase и передана инструкция `node assign-test-admin.cjs --apply` с повторной приватной идентификацией и подтверждением.
- Read-back GitHub подтверждает [MASTER TASK-20261105-016, commit d325110](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/d32511032d69afa4688407e6f37f1ff06562127e) и checkpoint [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10). Никакие UID/email/claims не были перенесены в публичные документы.
- **Статус только WAITING_OWNER_EXECUTION:** настоящий `--apply` в Cloud Shell и серверный результат не получены; привилегированные Auth writes не выполнялись инструментами ChatGPT. Не считать роль установленной. TEST PR #3 остаётся draft, production/Rules/tariff/пользователей не трогали.
- NEXT: обезличенный вывод владельца об успешном завершении либо ошибке `--apply`. Новый RUN для read-back TEST custom claim и ограниченного live allow/deny после обновления токена. Этап C и A–K не закрыты.


### RUN-20261105-027 / НАЧАЛ / IN_PROGRESS (владелец сообщил о выполнении TEST --apply; read-back ещё нужен)
- Дата: 2026-11-05, Europe/Helsinki. Этап C; продолжение RUN-026 после отдельного согласия.
- Владелец сообщил «Сделал» после инструкции выполнить `node assign-test-admin.cjs --apply` в приватной Cloud Shell. **Не получено терминальное сообщение SUCCESS или ошибки**, поэтому факт назначения claim и сохранение прочих claims независимо не подтверждены; не помечать DONE.
- Цель: сохранить обезличенный checkpoint GitHub, запросить только финальный статус `SUCCESS: admin=true assigned to exactly this TEST UID` или текст ошибки без UID/email, а затем отдельно подтвердить токен и доступ. Ограничения: никаких Cloud Firebase/Auth/Rules/production/billing/PR merge изменений инструментами ChatGPT, не публиковать личные идентификаторы.


### RUN-20261105-027 / ЗАВЕРШИЛ / PARTIAL — WAITING_OWNER_RESULT
- GitHub read-back подтверждает сохранение MASTER TASK-20261105-017 в [commit de55cf4](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/de55cf4fc31dc7b3b7c903d1c9b5acdaba7cb081) и checkpoint [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10); приватные UID/email не перенесены.
- Владелец сообщил о выполнении `--apply`, но не показал терминальный SUCCESS/error. Нельзя считать серверный `admin=true` выданным без результата. Никаких облачных изменений сам ChatGPT не выполнял.
- NEXT: запросить **только финальную строку об успехе или ошибке**, без личных данных. При SUCCESS — отдельная проверка ID token/живого Firebase allow/deny, без production. Статус Stage C OPEN.

### RUN-20261105-028 / НАЧАЛ → ЗАВЕРШИЛ / ЧАСТИЧНО — ожидание владельца
- Дата: 2026-11-05, тестовый этап C. На снимке локальная команда повторно запущена в правильном тестовом проекте, но у приглашения ввода идентификатора ошибочно вставлен текст самого приглашения. Подтверждения успеха нет.
- Даны инструкции очистить поле до ввода, затем продолжить локальную проверку. Личные идентификаторы в журнал не включались.
- Никаких изменений из ChatGPT в Firebase, основном сайте или правах других пользователей. Следующий шаг: обезличенный итог локального исполнения, без повтора операции при неизвестном результате.


### RUN-20261105-029 / НАЧАЛ / IN_PROGRESS (владелец выполнил TEST admin claim; проверка результата по скриншоту)
- Дата: 2026-11-05, Europe/Helsinki; скриншот Cloud Shell 10:45. Этап C, после RUN-028.
- Владелец показал финальный вывод доверенного one-time `assign-test-admin.cjs --apply`: `SUCCESS: admin=true assigned to exactly this TEST UID`, плюс локальное сохранение старых claims (0600) и требование refresh ID token. По ранее просмотренному скрипту SUCCESS выдаётся только после Auth getUser read-back и сравнения неизменных сторонних claims. Целевой проект `sanastoyhteiso-v3-development`.
- План: сохранить обезличенный факт успеха в MASTER и Issue #10, затем повторно прочитать записи и закрыть RUN как DONE для **операции выдачи TEST claim**, но НЕ закрывать весь Stage C: новые ID token и прямой live Firestore ACL allow/deny ещё не проверены. Не копировать из скриншота UID/email/имя private backup. Никаких изменений Auth/Rules/пользователей/production со стороны ChatGPT.
- NEXT: безопасный refresh входа владельцем только в TEST, проверка claims и реального admin/ordinary account permission, затем диагностика непубликованной админ-страницы PR #3.


### RUN-20261105-029 / ЗАВЕРШИЛ / DONE — TEST role assigned by owner; Stage C still open
- Источник: скриншот приватного Google Cloud Shell с итогом `SUCCESS: admin=true assigned to exactly this TEST UID`; сам скрипт подтвердил server read-back новой роли, сохранил прочие claims и private local backup. Публичные идентификаторы не перепечатывались.
- Проверены read-back GitHub: [MASTER TASK-20261105-018 commit 11d4a06](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/11d4a069c5921cd0376c864958688fbd69f95e98), [Issue #10 checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10). TEST PR #3 HEAD d5ede83 draft/open/not merged; A–K NO-GO. Данная запись закрывает **только** разовое назначение роли, не тестирование доступа и не реализацию админ-панели.
- NEXT: новый RUN — выйти/войти в TEST Auth для refresh ID token, проверить фактический claim в свежем токене и live deny/allow `admin_metrics/current`, не затрагивать production. Отсутствие файла метрик может означать `not-found` при разрешённом чтении, поэтому отдельно проверять authorization и наличие данных. Новые облачные изменения не предпринимались.


### RUN-20261105-030 / НАЧАЛ / IN_PROGRESS (новый режим: максимально автономная разработка без потери качества)
- Дата: 2026-11-05, Europe/Helsinki. Владелец просит ускорить достижение полной цели Sanastoyhteisö 3.0 и минимизировать его личную занятость; вовлекать только в невозможные без владельца действия. Это **не** разрешение менять production, тариф, другие аккаунты или проводить необратимые облачные операции.
- Проверено до действий: Issue #10 A–K NO-GO; TEST PR #3 HEAD d5ede8385945f7ca1175d234ae87e282758e41b5 draft, sync PR #8 HEAD 828d702430037aeca271786bbcf067e202f10c0c draft, release PR #9 HEAD f27804f93980d01c82986414c6b29ce38b134399 draft. Последняя подтверждённая server-issued TEST admin role — RUN-029; владелец сообщил о повторном входе в TEST, но прямые live ACL/role token tests ещё не проведены.
- Задача: подготовить независимый документ режима автономного выполнения (критический путь, параллельные независимые ветки, качество/CI, owner-only gates, безопасный ZIP путь без доп. тарифа, восстановление, приоритеты ближайших действий, политика минимальных запросов к владельцу), затем привязать его в MASTER и Issue #10. Все записи append-only и никаких персональных данных.
- Ожидаемый результат: чёткий исполнимый рабочий контракт для следующих ChatGPT/Work и объективные gates; сразу после сохранения проверить SHA/read-back, закончить RUN-030 с линками.
- Ограничения: текущим действием менять только документацию в release/staging ветке и Issue #10; не трогать LIVE Firebase `riveria-sanasto-community-test`, production main, данные и тариф, не merge/deploy. Без обещаний фоновой непрерывной работы.


### RUN-20261105-030 / ЗАВЕРШИЛ / DONE — owner-light протокол сохранён и синхронизирован
- Создан и прочитан обратно [AUTONOMOUS_DELIVERY_PROTOCOL_V3_2026-11-05_RU.md](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/AUTONOMOUS_DELIVERY_PROTOCOL_V3_2026-11-05_RU.md), [исходный commit 8462a86](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/8462a863d1c4abb4c3e7045be7a272bd9177b08d), [редакторский commit 48572e6](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/48572e68c4d901c0527361075ba69cb6e1f92f2d).
- Добавлены и повторно прочитаны [MASTER NEW-004 / TASK-20261105-019 commit 83d5b01](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/83d5b01543ff91f0c111d57146bd67e52ecb4dd3) и [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10). Эти документы являются действующим порядком для следующих ChatGPT/Work; стадия A–K по созданию плана НЕ закрывалась.
- NEXT: RUN-031 read-only аудит TEST PR #3 admin login/token/route/CI; далее независимый code+regression в TEST без владельца. Не обещать работу в фоне между активными сессиями; production/Firebase/тариф/данные без нового GO не трогать.


### RUN-20261105-031 / НАЧАЛ / IN_PROGRESS (автономный TEST admin auth/route/CI аудит, только read-only)
- Дата: 2026-11-05, Europe/Helsinki; NEW-004 ускоренный режим; Stage B/C/E/H. Владельцем подтверждён повторный вход после выдачи server-side TEST `admin=true` (RUN-029); это ещё не подтверждает новый ID token или реальный ACL.
- Repo/test head на старте: `velardream-ctrl/riveria-sanasto-community-test`, `feat/admin-control-center-package-spec-20261104`, PR #3 HEAD `d5ede8385945f7ca1175d234ae87e282758e41b5`, DRAFT/open/unmerged. Выпущенный TEST Pages `main` может не содержать `v3-unified-preview/admin/`.
- План: только прочесть `v3-unified-preview/admin/admin-page.js`, `admin-entry.js`, frontend `config`, тесты и workflow статусы на точном HEAD; установить возможные безопасные автономные проверки нового токена, read-only Firestore и непубликуемого admin route. Не брать UID/email/token и не обращаться к приватному Firebase через обманный доступ.
- Ожидаемое: точный технический реестр DONE/CI_ONLY/NOT_PUBLISHED/BLOCKED и первая независимо выполнимая TEST regression задача с GitHub ссылками; записать MASTER+Issue и RUN END. В этом RUN НЕТ Firebase Auth/Rules writes, мерджа и production изменений.


### RUN-20261105-031 / ЗАВЕРШИЛ / PARTIAL — read-only audit DONE, live access still not verified
- [Технический отчёт](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/ADMIN_TOKEN_ROUTE_AUDIT_RUN-20261105-031_RU.md), [commit 4d2dd5b](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/4d2dd5b50cf649b0b69c9951bfcf5f7bd93e6456). Тестовый default main не содержит нового admin/index.html, несмотря на TEST PR #3; client auth/mocks и emulator CI прошли, но live token + allow/deny ещё не испытаны.
- GitHub read-back подтверждает [MASTER TASK-20261105-020 commit 261f8b0](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/261f8b01135c33c0a3d7124c3ca99fb6276272ae) и [Issue #10 checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10). NEW-005: просроченные/неактивные данные показываются как счётчики рядом со статусом «Нет данных».
- NEXT: RUN-032 TEST PR #3 atomic regression — корректное скрытие stale counts, deterministic tests, CI. Аудит без Cloud changes; B/C/E/H OPEN.


### RUN-20261105-032 / НАЧАЛ / IN_PROGRESS (NEW-005: reject stale/inactive aggregate display)
- Дата: 2026-11-05, Europe/Helsinki. Scope TEST PR #3 `velardream-ctrl/riveria-sanasto-community-test`, branch `feat/admin-control-center-package-spec-20261104`, starting HEAD `d5ede8385945f7ca1175d234ae87e282758e41b5`, draft/unmerged.
- Цель: исправить показ устаревших `errors24h`, `active7d`, `releaseVersion`, `syncFailures24h`, `errorGroups` в `admin-page.js`, если отсутствует свежая активная сводка мониторинга. Сохранить отдельно последний event backup timestamp, который сам по себе исторический факт. Добавить deterministic mock regression tests stale/inactive/future/fresh; проверить node syntax/тестовый GitHub CI на точном HEAD и read-back файлов. Никакой новой телеметрии/сервера не утверждать.
- Разрешены только изменения TEST feature branch и тесты + GitHub documentation. LIVE Firebase/PROD TEST default `main`, текущие rules, Auth/user data, тариф и PR merge не трогать.
- Ожидаемый результат: status «Нет данных» согласуется с показателями, без ложного green; если CI красный, исправить только TEST код или зафиксировать BLOCKED с конкретным FAIL.


### RUN-20261105-032 / ЗАВЕРШИЛ / DONE CLIENT TEST — LIVE ACCEPTANCE STILL OPEN
- TEST PR #3 patch [6b9932b](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/6b9932be5238ae8f65bf34e2047b90806957f894) и tests [9b4204d](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/9b4204d9593227c651804cb634326dddff6b2df9) сохранены/прочитаны обратно. 33 mock admin cases в файле тестов; stale/inactive/future не показывают старые агрегаты, свежие активные показывают, всё read-only.
- На **точном HEAD 9b4204d** [GitHub Actions #41999768160](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41999768160) **SUCCESS**, job admin-access syntax + offline regression + manifest SUCCESS. TEST PR #3 остаётся draft/open/unmerged. Сохранены [MASTER TASK-20261105-021 commit e611f89](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/e611f89eae7d0f2c153d534d6a2364f893a1b618) и [Issue #10 checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10), read-back успешен.
- NEW-005 исправлен на уровне TEST-кода/CI, **не** настоящий telemetry backend. Реальные TEST auth token / Firestore ACL/Pages/iOS12 не проверены. PROD/LIVE/Firebase/tariff/user data не менялись. Stage D/E/H и A–K OPEN.
- NEXT: RUN-033 независимая оценка интеграции PR #8/#9 и тестовый integration seam, не ожидая владельца; при отсутствии нужного доступа перейти к отдельной offline дорожке NEW-001.


### RUN-20261105-033 / НАЧАЛ / IN_PROGRESS (read-only integration seam PR #8 ↔ PR #9)
- Дата: 2026-11-05, Europe/Helsinki. Stage G/H, автономное продолжение RUN-032, owner-light протокол NEW-004.
- Исходные: production repo `sanastoyhteiso/sanastoyhteiso.github.io`, PR #8 `staging/rs-offline-sync-admin-backup-20261102` HEAD `828d702430037aeca271786bbcf067e202f10c0c`, release PR #9 `release/v3-safe-integration-20261104` HEAD на последней сверке `26cd06116eea0669e3171a40d63330eecfae017e` (документационные коммиты), оба draft/open/unmerged.
- План: сравнить точные списки изменённых файлов PR #8/#9, API/сценарии синхронизации и подготовительные release документы; установить независимую точку подключения в TEST без слепого объединения PR и риска для старых UID/данных. Сохранить конкретный handoff и следующую инженерную задачу в GitHub.
- Не менять production main/LIVE Firebase `riveria-sanasto-community-test`/TEST cloud/тариф/пользовательские данные. Этот RUN только GitHub read-only + documentation.


### RUN-20261105-033 / ЗАВЕРШИЛ / DONE READ-ONLY — интеграционная карта сохранена
- [Сравнение PR #8 ↔ PR #9](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/INTEGRATION_SEAM_AUDIT_RUN-20261105-033_RU.md), [commit 417d0c8](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/417d0c806e0046182d66096fb956507bcd8d0743). В PR #8 чистые staging-only модули, в PR #9 подготовлен единый UI/opt-in bridge; sync-core совпадает после комментария, SHA helper identical, IndexedDB DB_NAME различен, два самостоятельных controller/transport подхода не стоит соединять одновременно.
- Read-back GitHub: [MASTER TASK-20261105-022 commit 288b533](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/288b5333f1017904ab5b1613bad4298b896d3a36) и [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10). Release offline CI [#42000162724](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42000162724) SUCCESS на HEAD 8992e8da. Это не live data/permission acceptance.
- Только документация, без Firebase/production/merge, Stage G/H OPEN. NEXT: RUN-034 TEST offline migration/backup contract regressions, без привлечения владельца.


### RUN-20261105-034 / НАЧАЛ / IN_PROGRESS (isolated V3 event contract + backup safety regression)
- Дата: 2026-11-05, Europe/Helsinki. Stage G/H и NEW-001; после RUN-033.
- Repo `sanastoyhteiso/sanastoyhteiso.github.io`, DRAFT PR #9 branch `release/v3-safe-integration-20261104`, starting current HEAD определяется перед тестовым commit. Production `main` остаётся неизменным.
- План: прочесть существующие `release-checks` тесты/код; добавить детерминированные OFFLINE assertions для V3 event idempotency/invalid payload/переключения владельца и сохранности локальной копии при ошибках, исключить cloud/Firebase calls; подключить к Release V3 preflight workflow и проверить exact HEAD GitHub Actions. Если существующие тесты уже покрывают сценарий — расширить реальный пробел, не плодить дубликаты.
- Это подготовка критериев приемки, **не доказательство реального Google Sheets backup/restore**. Никаких cloud data writes, Firebase Rule deploy, production merge, тарифов и пользовательских аккаунтов.


### RUN-20261105-034 / ЗАВЕРШИЛ / DONE OFFLINE CI — real Sheets/Firestore not tested
- Проверены фактические GitHub commits: [synthetic contract 355bccb](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/355bccb6cab7bd6aa6222f638a657202871e87f8), [My Finds guard a4a14d](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/a4a14d388351093087bd10e6a8c2e542c1aaf499), [workflow 182ce2c](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/182ce2ca47f41a6625c39a89cac06cb19df98b38). [GitHub Actions #42001218199](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42001218199) at exact HEAD 182ce2c: both preflight and Firestore emulator jobs SUCCESS, including standalone NEW offline test step, jsdom, old Auth+Drive preservation tests.
- Read-back GitHub: [MASTER TASK-20261105-023, commit a082a40](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/a082a4018ae9b7fcb011e841edcf3e51de60154d), [Issue #10 checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10). Данные живых пользователей, production, Firebase, тариф, TEST default main не менялись.
- Важно: тестируется только синтетический preview/дедупликация и соответствие подготовленным Rules; это **не** доказательство private Sheets backup + restore. Stage G/H, A–K и NEW-001 OPEN. My Finds M/P/H отдельно сверить с продуктовой семантикой до релиза; запрет клиентского события сейчас fail-closed.
- NEXT RUN-035: чистый offline контракт независимой копии/восстановления с hash и отказом при неверном UID / подмене / неполноте; без GDrive/Firebase writes.


### RUN-20261105-035 / НАЧАЛ / IN_PROGRESS (offline private Sheets snapshot integrity codec + restore verification)
- Дата: 2026-11-05, Europe/Helsinki; NEW-001/Stage G/H/I после RUN-034.
- Scope: только DRAFT release PR #9 branch `release/v3-safe-integration-20261104`. Убедиться, что исходный код/тесты не перезаписываются параллельно. Не менять TEST default main, production `main`, реальный Firebase, Drive/Sheets, правила, другие аккаунты или тариф.
- Цель: реализовать отдельный переиспользуемый ES5-модуль **offline codec** для `scores/words/favorites/finds` → append-only rows+manifest (owner identity, row count, section counts, SHA-256), проверка read-back на синтетических данных: Unicode, duplicate/missing/mutated rows, wrong UID/snapshot, unsupported keys, неверный хэш, без сетевых вызовов. Проверить digest через WebCrypto, не использовать слабый fallback, не показывать личные данные/содержимое в logs. Сверить с `staging/rs-backup-plan.js`; этот модуль не публиковать в учебный интерфейс до backend acceptance.
- Добавить standalone test в `.github/workflows/release-v3-preflight.yml`, проверить GitHub Actions exact HEAD. Отличать подготовленную технику от реального Google Sheets backup/restore — NEW-001 остаётся OPEN. Результат строго START→END плюс MASTER/Issue read-back.


### RUN-20261105-035 / ЗАВЕРШИЛ / DONE OFFLINE CI — live Sheets backup/restore NOT DONE
- В DRAFT release PR #9 (без merge) исходники сохранены: [`v3-backup-codec.js` commit 451c3f5](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/451c3f53316e1d3dce17add75afd736118be5184), [offline tests 4146366](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/41463666507de0341c6d3e4186a85e23bf1c669f), [CI hook 9398767](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/93987672a97c9b34cce16f1ecc88abfaf1754910), [документация e258f53](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/e258f5336a95042de258ec5cdd16a4697dd24ae7). [GitHub Actions #42002307847](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42002307847) SUCCESS exact code/CI HEAD 9398767, включая новый offline readback test и Firestore emulator. Код не исполняется на пользовательских Pages.
- Read-back GitHub подтвердил [MASTER TASK-20261105-024 commit 42cedde](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/42cedde41a675631401ce3ec1f649168aa263c5c) и [Issue #10 checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10). Сохранена последовательная история.
- **Никакой реальной закрытой Google Таблицы не создавали и не проверяли восстановление**; это offline format/checksum для shadow-state, а не полная копия Firestore/legacy. Без trusted scheduler, backup source, readback, RESTORE DRILL задачи NEW-001 и A/G/H/I OPEN. Никаких Firebase/cloud/production/billing/private user data writes.
- NEXT RUN-036: read-only audit и, если возможно, TEST-only автоматические проверки соответствия UI My Finds IDs с подготовленными Rules; ни облачных deploy, ни повторных запросов владельцу.


### RUN-20261105-036 / НАЧАЛ / IN_PROGRESS (My Finds T/M/P/H/W compatibility audit + TEST-only regression)
- Дата: 2026-11-05, Europe/Helsinki, Stage G/H. После RUN-034 обнаружено потенциальное расхождение: `v3-sync-finds.js` предлагает совпадения из всех публичных терминов `T/M/P/H`, но `v3-sync-engine.js` теперь fail-closed запрещает `collection_set` кроме T/W, поскольку подготовленные production additive Rules ожидают только T/W.
- До действия: сверить точные файлы в release PR #9 и TEST PR #3, emulator test, реальную семантику UI и сообщения об отказах. Не ослаблять cloud Rules, не запускать облачные операции, не менять production/live Firebase.
- Цель: принять безопасное решение на уровне подготовленного контракта: либо явно ограничить UI доступные находки до T/W, либо расширить **непубликуемую** подготовительную rules/test реализацию на M/P/H, если это согласуется с личными finds и не нарушает ACL. Проверить CI на PR head; оставить четкий TODO для сравнения с живым TEST ruleset и приватным data restore.
- Разрешены только изменения в DRAFT staging/release/test branches и документации. Нужно документировать любую оставшуюся разницу с live TEST rules. Владелец не требуется для офлайн-аудита.


### RUN-20261105-036 / ЗАВЕРШИЛ / DONE DRAFT CODE + CI, LIVE TEST RULES STILL OPEN
- Проблема NEW-006: клиент My Finds предлагал `T/M/P/H/W`, а старый prepared owner-only Rules разрешал `collection_set` только T/W. Исправлены **только DRAFT исходники** PR #9: `v3-sync-finds.js`, `v3-sync-engine.js`, `v3-sync-core.js`, prepared additive Rules fragment + local emulator, offline UI contract / emulator allow-deny tests. Подготовленные правила теперь согласованы на `T/M/P/H/W`. Actual deployed TEST/LIVE Firestore Rules **не тронуты**.
- CI поймал старую несовместимость core validator и временно искажённый prepared Rules fragment после текстовой замены. Оба дефекта исправлены из чистого Git original; добавлена static contract сверка двух Rules файлов в standalone offline test. [GitHub Actions #42004137949](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42004137949) **SUCCESS** exact tested HEAD `8a77b951914abc5890d97a1f0bee1bed1c3358d6`: release preflight and Firestore emulator.
- Прочитаны обратно [MASTER TASK-20261105-025 + NEW-006 commit a4c1362](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/a4c13628386437097f7719608bb14d0f315f89f3) и [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10). [Технический отчёт commit de80503](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/de80503509ab2a886cbeff0eb4ac9c035d587a0e). Всё append-only, UID и секретов в отчётах нет.
- Ограничения: не проверены Published TEST Rules `sanastoyhteiso-v3-development` и фактические M/P/H cloud writes; TEST PR #3 still draft, PROD main/LIVE Firebase/пользователей/тарифов не меняли. Следующий RUN-037 — независимый TEST-only кандидат Rules/эмулятор без deploy, затем отдельная облачная gate-проверка. A–K/NEW-001/NEW-006 OPEN.


### RUN-20261105-037 / НАЧАЛ / IN_PROGRESS (TEST-only candidate My Finds Rules + isolated emulator regression)
- Дата: 2026-11-05, Europe/Helsinki; Stage C/G/H, NEW-006. Продолжение RUN-036 после CI PASS.
- Сначала read-only сверить TEST PR #3 HEAD, существующую user-supplied historical Rules fixture и тесты. **Не переписывать** исторические пользовательские Rules-фикстуры как будто они опубликованы заново. Подготовить новый отдельный TEST-only candidate в `admin/security-tests/candidates/`, оставив старые версии для аудит-трейла.
- Проверить, что кандидат меняет только допустимые `collection_set` target T→[TMPH] при неизменном owner-only, emailVerified, immutable permissions и admin metrics. Дополнить отдельные локальные эмуляторные allow/deny assertions для owner, чужого UID и невалидных IDs. Внести малые коммиты в **TEST DRAFT PR #3**, ждать exact HEAD GitHub Actions и read-back.
- Запрет: никаких live Firebase Auth/Firestore/Rules, production main, TEST default main, оплаты, публикации UID/email/токенов или merge. В случае test FAIL исправить без owner; если нет доступа — документировать blocker.


### RUN-20261105-037 / ЗАВЕРШИЛ / DONE TEST CANDIDATE CI — published Firebase Rules NOT changed
- Отдельный TEST-only NEW-006 кандидат `admin/security-tests/candidates/FIRESTORE_V3_DEVELOPMENT_NEW006_FINDS_TMPH_REVIEW_ONLY.rules` создан в DRAFT PR #3, а исторический FULL_FOR_MANUAL_REVIEW.rules восстановлен **точно** в исходный blob `a903ec37...`. Единственное реальное отличие кандидатов — расширение публичных ID для `collection_set` T→[TMPH], без изменения user/admin ACL и без cloud writes.
- CI поймал промежуточную ошибку сохранности старого кандидата, затем ошибку JS replacement literal `$'`. Исправлено с сохранением истории коммитов; [изолированный TEST Firestore emulator #42005468758](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42005468758) **SUCCESS: 90/90**, [admin regression #42005468747](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42005468747) SUCCESS на exact HEAD `18f45b0e3fc399b21c388fe26acbc80ee69a9e87`. TEST PR #3 остаётся draft/unmerged.
- Повторно проверены [полный отчёт RUN-037 commit 7f3c6b2](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/7f3c6b2d1553fe8ff73136c376760b69302133bc), [MASTER TASK-20261105-026 commit b8acb13](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/b8acb131be0b12d0384dde3bc297d4e2928b413b), [Issue #10 checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10). Обезличенные записи, без UID/email/keys.
- **NO LIVE PASS:** текущая опубликованная версия TEST Firebase Rules не была считана и не обновлялась, реальные allow/deny M/P/H, admin_metrics/current и token/Pages не проверены. Не считать Stage C/G/H или NEW-006 готовыми. Main, LIVE Firebase, тариф и чужие данные не изменены.
- NEXT: RUN-038 — read-only TEST Rules/Pages acceptance gate и автономные независимые тесты; cloud change только с отдельным GO владельца и rollback.


### RUN-20261105-038 / НАЧАЛ / IN_PROGRESS (TEST Firebase deployed Rules read-only inspection utility, owner-light)
- Дата: 2026-11-05, Europe/Helsinki; Stage C/G/H и NEW-006. Предыдущий RUN-037 завершён TEST emulator 90/90 SUCCESS, но deployed TEST ruleset не прочитан; владелец просит минимум ручных действий.
- Цель: в TEST PR #3 создать строго read-only Cloud Shell helper, который проверит `gcloud config get-value project` == `sanastoyhteiso-v3-development` до получения OAuth token, вызовет только Firebase Rules REST GET `projects.releases.get` и `projects.rulesets.get`, без POST/PATCH/PUT/DELETE, проанализирует наличие NEW-006 allowlist T/M/P/H и NEW-003 marker; выведет обезличенную версию/хэш/статусы, никогда не печатает содержимое правил, UID/email/access-token. Никакого live вызова и никакой авторизации от этого чата.
- Проверить helper в Node только mock-fixtures (включая чужой проект, 401/403, неверное имя ruleset, неожиданный ответ, старый/new/mixed), подключить тест в GitHub Actions на DRAFT TEST branch, дождаться exact HEAD PASS. Зафиксировать вызов в безопасной инструкции на будущее; не просить владельца выполнять пока нет готового протестированного набора.
- API схема подтверждена официальной документацией Firebase Rules REST: `GET /v1/{name=projects/*/releases/**}` и `GET /v1/{name=projects/*/rulesets/*}`. Запрещены любые Firebase/Pages/Firestore cloud writes, TEST default main и LIVE production, изменения тарифа и секреты.


### RUN-20261105-038 / ЗАВЕРШИЛ / DONE OFFLINE TEST TOOL — DEPLOYED RULES READ PENDING
- Подготовлен [read-only Cloud Shell inspector 27e311d](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/27e311d1ae8032b8a400bf104b25eba6b49ef14a), [mock tests fb44fbf](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/fb44fbfcf14d1e378cc04b4f7f33a3a62e078297), [CI hook f22b0c5](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/f22b0c5c5ba56dc35929523e5ae07b2e516834ca). Точный проект проверяется до получения токена. Только REST GET release/ruleset с проверкой того же проекта, без публикации источника Rules/token/UID, выводится SHA и маркеры.
- [GitHub Actions admin #42006488921](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42006488921) SUCCESS 57/57 и [Firestore emulator #42006488970](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42006488970) SUCCESS 90/90 на TEST PR #3 HEAD `f22b0c5c5ba56dc35929523e5ae07b2e516834ca`. Это mock/local, **не реальный Google Firebase Rules API вызов**. TEST PR #3 draft/unmerged.
- Read-back подтверждает [технический handoff 3901e3a](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/3901e3ae5a11121a230e935ed8ee40d0a13bea7d), [MASTER TASK-20261105-027 commit 3cce68d](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/3cce68d0d942bb4e7ad28d9e63100eff22b9bbfc), [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10). Нет незакрытого START в RUN-038.
- NEXT: владелец не нужен сейчас. Оставлен инструмент для следующего read-only authorized Cloud Shell сеанса; deployed TEST Rules/ACL/Pages и private backup остаются OPEN. Продолжить RUN-039 на независимой offline iOS12/browser compatibility дорожке. Никаких живых Firebase/production/tariff/user data writes.


### RUN-20261105-039 / НАЧАЛ / IN_PROGRESS (iOS12 Safari syntax regression; no device)
- Дата: 2026-11-05, Europe/Helsinki; Stage G/H/I. У пользователя есть iPad mini 3 (iOS 12) и важно не добавлять неподдерживаемый JS. Текущие release preflight smoke/Node22 `vm.Script` не обнаруживают всех синтаксических конструкций, запрещённых в старом Safari.
- План: в DRAFT release PR #9 создать независимый offline syntax regression на ECMAScript 2018 parser для всех локальных JS-файлов, реально перечисленных в `index.html`, плюс inline script и `sw.js`; запретить ненамеренные optional chaining/nullish/новый синтаксис. Использовать установленный только в CI `acorn` с pinned version; не менять живой UI и API. Проверить CLI на точном GitHub Actions HEAD, понять и исправить красные тесты только в DRAFT до завершения RUN. Физический iPad acceptance отдельно остаётся OPEN.
- Scope: DRAFT release PR #9 и документация GitHub. Не обращаться в Firebase/Google Sheets, не менять основной сайт, TEST default main, тарифы, чужие данные или cloud rules. Старые браузеры проверяются только статически, не заявлять реальный iOS12 PASS.


### RUN-20261105-039 / ЗАВЕРШИЛ / DONE STATIC iOS12 SYNTAX CI — physical iPad still OPEN
- В DRAFT release PR #9 создан [`release-checks/ios12-syntax.test.cjs`, commit 76c2141](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/76c21418ab13a9bbe80ba12a611f0beb2369ae50), включён pinned Acorn ES2018 parser в [CI commit c556b4a](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/c556b4a17ac520673f19c0fa7df6784e870e796c). Static Gate охватывает 20 локальных JS, 1 inline и SW, selftest отвергает современный синтаксис. Не было изменений пользовательского UI кода, рабочей Firebase, аккаунтов или тарифа.
- [GitHub Actions #42007290541](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42007290541) **SUCCESS** exact code HEAD c556b4a: release-preflight and firestore-v3-rules-emulator SUCCESS; ES2018 syntax PASS. Внешние 4 CDN скрипта и реальная совместимость WebCrypto/IndexedDB/Google Sign-in/iOS12 остаются вне scope. **Не заявлять physical iPad PASS.**
- GitHub read-back: [технический отчёт commit e6a9a16](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/e6a9a162329cd048dfd33d7048f4f50c9f95e4ac), [MASTER TASK-20261105-028 commit cd4fff2](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/cd4fff213e7cf0aa60c8ffc2ac6d3b33037d3f85), [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10). Все изменения DRAFT/open, NO RELEASE.
- NEXT: продолжить автономно NEW-001 private Sheets backup/restore trusted backend или isolated cross-user/browser integration; только для live cloud/rules, тарифов и финального GO понадобится владелец. A–K OPEN/NO-GO.


### RUN-20261105-040 / НАЧАЛ / IN_PROGRESS (full V3 Firestore event-source backup codec and integrity gate)
- Дата: 2026-11-05, Europe/Helsinki; Stage A/G/H/I и NEW-001, после RUN-039. Пользователь явно просит продолжить реальную автоматизацию резервирования с минимальным привлечением владельца.
- Проверено: прежний `v3-backup-codec.js` охватывает лишь 4 раздела browser shadow-state и **не** Firestore immutable `sync_v3/{uid}/events` + `state/baseline` + `words`. Для доверенного private Sheets archive требуется отдельный event-source export с consistent snapshot / read-back и изолированным restore drill.
- Цель текущего RUN: создать Node-only offline codec `backup-v3/firestore-source-codec.cjs`, с жёсткой привязкой к одному TEST проекту `sanastoyhteiso-v3-development`, одному UID, снимку readTime; включить полные Firestore serialized documents (raw fields, create/update timestamps), event/baseline/word paths, hash SHA256, документ и chunk counts, явную сигнализацию incomplete и отказ от неверных/дублированных/изменённых строк. Модуль не обращается к Google APIs и не восстанавливает данные в облаке.
- Добавить synthetic-only tests (Unicode, formula-like strings, chunking, wrong UID/project, duplicates, missing rows, malformed Firestore paths, tampering). Подключить к DRAFT release PR #9 CI, проверить run exact HEAD и результаты Firestore emulator. Сохранить START→END, MASTER + Issue #10 без UID/email/реальных личных данных.
- Не пытаться считать офлайн-контракт реальной Google Sheets копией или восстановлением. Следующий отдельный RUN — доверенный Firestore READ → NEW private Sheets RAW writer → Sheets READBACK + checksum, без публикации в production. Запуск реального доступа и создание таблицы только после безопасного права владельца / отдельного gate. LIVE `riveria-sanasto-community-test`, main, тариф и другие пользователи не изменяются.


### RUN-20261105-040 / ЗАВЕРШИЛ / DONE OFFLINE CODEC + CI — live Firestore and Sheets untouched
- DRAFT PR #9: `backup-v3/firestore-source-codec.cjs` [commit 38b69f8](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/38b69f800d627a334fac95011b2facc05e0416ba); synthetic full-source backup tests [48a8eba](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/48a8ebadcaadb6f87583a270b5975a04822e5da7); CI hook [4ba7163](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/4ba716344661bf72aaf641481a95cca37c22caf6). [GitHub Actions #42009004216](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42009004216) **SUCCESS** exact head 4ba7163, both preflight and emulator; log `PASS RUN-040`.
- Новый формат охватывает raw `sync_v3/{uid}/events`, `state/baseline`, `words` c SHA256, UTF-16 safe chunking, strict path+UID/project/time and missing/duplicate/tamper verification. Это dry-run memory restore, не реальная Google Sheet или Firestore restore. Весь cloud read/write и аккаунты не затронуты.
- Readback: [report 98e07f5](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/98e07f5e01c799a1d2e84d9e2065d9b9907c2b1b), [MASTER TASK-20261105-029 d9035fa](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/d9035fa22625a636814e52bdc36f39f8a6af04bd), [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10). No personal data, secrets or cloud changes.
- NEXT RUN-041 trusted (injectable offline-tested) Firestore list/get paging and new private Sheets RAW/readback writer with explicit approval gate; NEW-001 and A–K OPEN. Не обещать готовый автоматический backup до реального owner-authorized deployment + independent restore drill.


### RUN-20261105-041 / НАЧАЛ / IN_PROGRESS (trusted TEST Firestore read → NEW private Sheets RAW → API readback)
- Дата: 2026-11-05, Europe/Helsinki; NEW-001 Stage A/G/H/I после PASS RUN-040.
- В DRAFT PR #9 подготовить `backup-v3/private-sheets-flow.cjs` для реальной *архитектуры* доверенного backup pipeline с инъецированными адаптерами и строгими автоматическими gates: fixed TEST project, one explicitly selected UID, identical readTime across paginated event and word reads, baseline get, limit pages, reject cursor loop. Полный source codec RUN-040 + consistency hash.
- Writer only `createNewPrivate` (никаких старых sheet IDs/overwrite), Google Sheets RAW row writes, реальный readback целиком → codec.verify SHA → private manifest commit `complete=true, sheetsReadBackVerified=true, restoreTested=false` → manifest readback. При ошибке сохранить неполную новую private копию и статус FAILED без удаления исходных данных; никаких Firestore writes/restore. Доступ к облаку в этом RUN заменяется только synthetic injected test doubles.
- Добавить CI tests: wrong project, missing page, cursor loop, wrong UID, 403, formula-like content, partial Sheets readback, SHA mismatch, incomplete manifest; verify no calls to cloud before valid precheck. No secret or personal data in GitHub. Не считать mock pipeline фактической копией/автоматическим расписанием.
- Scope: только DRAFT release branch and GitHub CI, без live Firebase/Sheets API calls; production `riveria-sanasto-community-test`, main, рабочий сайт, тариф и данные других пользователей нельзя менять.


### RUN-20261105-041 / ЗАВЕРШИЛ / DONE MOCK BACKEND PIPELINE + CI — NO LIVE SHEETS
- В DRAFT PR #9 [`backup-v3/private-sheets-flow.cjs` commit c6eedf3](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/c6eedf3080564f9bcd08fb3894ad0af016f23df1), [fake adapter tests 1ab5969](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/1ab5969d06f294a3a4ea3463a65d5b55c1896897), [CI 16f5263](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/16f526396e8eb8d4278427d34e571ce071d1ebec). Strict TEST/UID/readTime, Firestore paged READ, new private Sheet only, confirmed RAW, provider readback checksum, manifest commit/readback, no Firestore writes. Deny bad project/cursor/permission, incomplete/corrupted rows, wrong destination.
- [Actions #42009918338](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42009918338) SUCCESS exact head `16f526396e8eb8d4278427d34e571ce071d1ebec`, both release-preflight and Firestore emulator; log `PASS RUN-041`. Все API adapters fake; реальные Firestore/Sheets/Auth не вызывались и private backup отсутствует.
- GitHub readback: [report commit c9c9aff](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/c9c9aff146328bfac9c4fff8e3475e357127bbb7), [MASTER TASK-030 commit fa95e36](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/fa95e369b04e42fe836bdc5f4d898ab35c80b965), [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10). Без персональных сведений и секретов.
- NEXT RUN-042: TEST-only actual Google API adapter + scheduler design with safe-scoped auth and offline regression. Любой реальный export, создание закрытой Sheet, установка триггера — только после отдельного owner gate; stage A–K/NEW-001 OPEN. LIVE/prod/main/tariff untouched.


### RUN-20261105-042 / НАЧАЛ / IN_PROGRESS (Apps Script trusted TEST Firestore→private Sheets daily backup candidate)
- Дата: 2026-11-05, Europe/Helsinki; NEW-001. Предыдущий RUN-041 прошёл fake adapter CI, но настоящих Google APIs/schedule нет.
- Подтверждено по официальным Google Docs: Apps Script от имени владельца через `ScriptApp.getOAuthToken` может запрашивать OAuth APIs с явно объявленными scope; installable time trigger работает с разрешением пользователя; стандартное ограничение около 6 минут за запуск, а Sheets `RAW` не выполняет формулы. Это бесплатный **кандидат**, а не обещание доступных квот/прав именно в аккаунте.
- Цель: создать отдельный TEST-only Apps Script runner + manifest: Firestore readTime-consistent paginated REST GET для строго `sanastoyhteiso-v3-development` и указанного одного владельцем synthetic/TEST UID; Sheets create NEW/private, Google Drive permissions verify, Sheets values PUT RAW, GET read-back, SHA и финальный manifest. Ресурсно ограничен, без чтения других пользователей, без Firestore writes, с fail-closed и без печати credentials/UID/contents.
- Использовать audited source codec and flow from RUN-040/041 with bundled offline-generated code; никаких remote code eval/load из GitHub в Apps Script. Предусмотреть ручной `inspectTestBackupConfig`, отдельный owner-only `installDailyTestBackup` с выключенной по умолчанию script property; никаких триггеров из ChatGPT.
- Добавить локальный Node mock тест в DRAFT release PR #9, CI exact HEAD. Владелец не требуется до теста. Настоящее OAuth разрешение/создание Sheet/установка trigger и расширение до других пользователей — отдельный explicit gate. Production/LIVE Firebase/main/тариф не менять.
