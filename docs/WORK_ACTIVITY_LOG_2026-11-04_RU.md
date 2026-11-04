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
