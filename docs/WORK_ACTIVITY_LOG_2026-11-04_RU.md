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


### RUN-20261105-042 / ЗАВЕРШИЛ / DONE TEST-ONLY APPS SCRIPT MOCK + CI — REAL BACKUP NOT YET DONE
- После прерванного UI-сеанса восстановлен контекст из GitHub без повторной работы: существующий TEST runner `backup-v3/apps-script/Backup.gs` и явные scopes в `appsscript.json`; добавлена точная проверка bundled RUN-040 codec + RUN-041 flow, simulated Google API, owner approval/off-by-default, отсутствие автоматического trigger, private owner-only Drive permissions, Sheets RAW/readback/manifest, lock release даже при HTTP403/битом Sheet. Добавлен полный синтетический сценарий 2-пагинационных Firestore событий + baseline + word с FI/RU.
- Commits [060314c](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/060314c4ee47e0cdd5e544e447c59ee0d530b7fe), [42fd6a3](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/42fd6a3649adaa20951cc6132a0b6a8891c06eb1), [6056d1b](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/6056d1b12c23522adc2c92108302f492cab55fd7). [GitHub Actions #42013400518](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42013400518) **SUCCESS exact tested HEAD 6056d1b**, Apps Script 10/10 + release preflight + emulator both green.
- GitHub readback: [report ef6f62a](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/ef6f62ad4a96597e17249894b01a16b56f2da20e), [MASTER TASK-20261105-031 fb39073](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/fb390731032bf318045d0bc49d44ce4b562f3851), [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10). Никакие фактические OAuth/Firestore/Sheets/API/trigger или пользовательские данные не изменены.
- Ограничения: это mock API simulation, не real Google runtime/service, private Sheet, scheduled backup или independent restore. Предыдущая роль TEST admin не означает разрешение на экспорт данных учащихся. NEW-001, Stage A–K OPEN/NO-GO. NEXT RUN-043: resources/limits/failure gating перед отдельным TEST-only owner pilot с синтетическим UID.


### RUN-20261105-043 / НАЧАЛ / IN_PROGRESS (TEST-only Apps Script execution-size/time fail-closed gates)
- Дата: 2026-11-05, Europe/Helsinki. Stage A/G/H/I, NEW-001, после RUN-042 10/10 simulated end-to-end + full CI success.
- Цель: защитить Google Apps Script TEST runner от превышения времени исполнения и квот: **до создания Sheet** ограничить число полностью прочитанных документов и число строк, проверять elapsed clock после потенциально медленного Firestore GET, перед каждым Sheets write/read; при превышении STOP с обезличенным сообщением и гарантией отсутствия verified manifest, а когда возможно — вообще без создания Sheet. Все ограничения hardcoded/test-only, не динамические Script Properties.
- Выполнить только в DRAFT PR #9, при сохранении bundled RUN-040/041 modules неизменными (их SHA сравниваются CI). Расширить offline simulated Google API tests на >lim документов, >lim строк и elapsed deadline. Проверить exact HEAD CI (preflight + local Firestore emulator), append-only task/Issue/readback и END. Нет live Google API вызовов, пользовательских UID/секретов, новых триггеров или production/LIVE Firebase/тарифа.
- Ограничение: это fail-closed pilot для **одного TEST UID**, не полноценная автоматизация всех пользователей. При живом тесте обязательно отдельное разрешение владельца, право на обработку данных и реальное восстановление/оповещения.


### RUN-20261105-043 / ЗАВЕРШИЛ / DONE TEST-ONLY RESOURCE GATES CI — LIVE BACKUP NOT ENABLED
- В DRAFT PR #9 `backup-v3/apps-script/Backup.gs` дополнен fail-closed лимитами тестового единичного UID: максимум 300 Firestore docs, 1200 Google Sheets rows, 210s runtime; до POST создания Sheet проверяется квота по данным, время проверяется после чтений и до Sheets PUT/GET/manifest. При отказе — private copy не получает confirmed manifest; lock released.
- [Runner 23157c2](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/23157c2a837f6c4a03de2374b4d230d13d572d12), [offline tests 193b85d](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/193b85d75e75050a3dc77ebb5394cd62c4b1272f). [GitHub Actions #42014737596](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42014737596) **SUCCESS exact HEAD 193b85d**, Apps Script simulated 13/13, release preflight и local Firestore emulator SUCCESS.
- Прочитаны обратно [технический отчёт 3306162](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/330616250fc40d16ac6170aa7a4b2f95a17580be), [MASTER TASK-20261105-032 commit 994a6a7](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/994a6a7f844bdbb9adbffcbfbf9a67549d3b098a) и [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10). Триггеры не создавались, OAuth не запрашивался, реальный Firebase/Sheets/Drive не вызывался; production, тариф и учащиеся не тронуты.
- Осталось: paid-free quota reality check, TEST owner synthetic pilot with explicit permission, current TEST Rules readback, независимый restore, мониторинг ошибок/retention, expand beyond one UID only under separate consent. NEW-001 and A–K NO-GO.
- NEXT RUN-044: автономный офлайн contract private backup health/failure alerts; реальных Sheets/Auth/email actions только после отдельного owner gate. Действия владельца пока не нужны.

### RUN-20261105-044 / НАЧАЛ / IN_PROGRESS (TEST-only backup health + failure detection offline contract)
- Дата: 2026-11-05, Europe/Helsinki. RUN-043 закрыт и проверен: resource gates 13/13 PASS, без настоящего Google API. Этапы A/G/H/I, NEW-001.
- Цель: создать чистый offline TEST-only контракт оценивания health резервных копий по доверенным внешним метаданным: NO_DATA до доказанного провайдером read-back; PROBLEM при неудачной/незавершённой/просроченной попытке, повреждённом manifest или неправильном проекте; OK только для свежего private manifest с complete + provider readback. Независимое restore отдельно отображать NO_DATA, пока не проверено.
- Scope: DRAFT release PR #9, новый standalone `backup-v3/backup-health-contract.cjs`, synthetic tests и GitHub Actions. Не открывать, не копировать и не писать реальные персональные данные, UID, содержимое Sheets, Gmail, Google APIs, Firebase Auth/Rules или production; без триггеров и платных сервисов. Модуль не должен передавать свободный текст/идентификаторы в результаты, только фиксированные коды статусов.
- План: check actual current HEAD; write deterministic fail-closed health evaluator and regression (fresh/stale/missing/wrong project/failed/unchecked restore/PII non-disclosure), connect CI, дождаться PASS exact HEAD; затем append-only technical report, MASTER TASK-20261105-033, Issue #10 checkpoint, read-back и terminal RUN-044 ЗАВЕРШИЛ либо ОШИБКА. Не считать offline contract live monitoring/alerts или гарантированной реставрацией; запуск TEST cloud потребует отдельный owner gate.

### RUN-20261105-044 / ЗАВЕРШИЛ / PARTIAL DOCS — CODE+CI DONE, MASTER WRITE BLOCKED
- Дата: 2026-11-05, Europe/Helsinki. В DRAFT release PR #9 сохранены `backup-v3/backup-health-contract.cjs`, 15 synthetic tests и CI hook: [3e1e726](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/3e1e72658664c581244558db32530d6e22215006), [ea6c056](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/ea6c05611f631fa49314745f04f1c362162db229), [db5c187](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/db5c187feb7ad4c88655421db83968eff8fa5743). [GitHub Actions #42015726491](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42015726491) **SUCCESS** exact code HEAD db5c187, new health 15/15, Apps Script 13/13, preflight and Firestore emulator PASS.
- [Полный технический отчёт](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/BACKUP_HEALTH_RUN-20261105-044_RU.md), [Issue #10 checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10#issuecomment-6656395933). Одна попытка append-only обновления большого MASTER ROADMAP отклонена защитой инструмента: **MASTER TASK-033 в исходном мастер-документе НЕ сохранён**; вместо этого [отдельный checkpoint TASK-033](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/TASK-20261105-033_RUN-044_CHECKPOINT_RU.md) [commit a78ea89](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/a78ea8962f2b7b061aeb1509d19b95542216d730). Не скрывать этот документационный блокер.
- Реальных Google/Firebase API, расписания, Sheets writes, мониторинга или restore не было. LIVE/prod/main/other users/tariff untouched. NEW-001 и все A–K OPEN/NO-GO. NEXT: восстановить MASTER из отдельного checkpoint безопасным инструментом, затем только offline RUN-045 trusted evidence + dedup alerts. Владелец сейчас не нужен.


### RUN-20261105-045 / НАЧАЛ / IN_PROGRESS — read-only проверка опубликованных TEST Firebase Rules
- Дата: 2026-11-05, Europe/Helsinki. Владелец явно разрешил только чтение в авторизованном облачном браузере Work; целевой Firebase проект строго `sanastoyhteiso-v3-development`.
- Цель: получить настоящую опубликованную версию/дату Firestore Rules, проверить `admin_metrics/current`, серверный `admin=true`, ограничения учеников и My Finds T/M/P/H/W; сравнить с NEW-003/NEW-006 TEST draft PR #3 (прочитанный HEAD `f22b0c5c5ba56dc35929523e5ae07b2e516834ca`). При остатке времени — read-only TEST /admin/.
- Запрещено: Firebase Rules/roles/data/tariff writes, экспорт ученических данных, Sheets, merge/deploy, рабочий сайт и Firebase `riveria-sanasto-community-test`. Не публиковать UID/email/tokens/secrets. RUN-044 ведёт другой ChatGPT: его код и статус не изменять.
- Ожидаемый результат: доказуемый cloud read-only отчёт либо честный BLOCKED при недоступном входе, затем append-only END/MASTER/Issue #10. При sign-in — одна передача управления владельцу без запроса пароля/кода в чате.

### RUN-20261105-046 / НАЧАЛ / IN_PROGRESS (MASTER TASK-033 recovery + independent offline trusted-backup evidence gates)
- Дата: 2026-11-05, Europe/Helsinki. RUN-044 завершён как CODE+CI PASS/PARTIAL DOCS, MASTER TASK-033 остался в отдельном checkpoint. В журнале параллельно обнаружен RUN-045 / НАЧАЛ (только cloud TEST Rules read-only), его не повторять и не закрывать за другого исполнителя.
- Цель №1: безопасно перенести TASK-20261105-033 из отдельно сохранённого checkpoint в большой MASTER ROADMAP append-only; при ограничении инструментов не рисковать перезаписью чужих изменений и явно сохранить blocker.
- Цель №2: независимый, **offline-only** TEST-контракт проверки provider-derived evidence для закрытой Sheets резервной копии: проверка идентичности проекта/snapshot/UID, owner-only доступа, полной таблицы и SHA-256 через существующий source codec, отказ при 403/partial/tampering; отдельный механизм дедупликации кодов предупреждений без отправки писем и персональных данных. Добавить синтетические тесты и CI только в DRAFT release PR #9.
- Ограничения: не читать живые данные других людей, не работать с Firebase Auth/Rules/Live/Sheets/Gmail, не писать/публиковать production, тариф, service keys, триггеры, не объединять PR. Если обнаружена конкурентная работа по тем же файлам — STOP/проверка HEAD. Перед каждым техническим шагом сохранено это намерение, после тестов — отдельные END/Issue/Master ссылки. Следующий шаг не считается действительным backup/restore, это только offline evidence gate.

### RUN-20261105-046 / ЗАВЕРШИЛ / DONE OFFLINE CI + MASTER RECOVERY — CLOUD NOT VERIFIED
- Дата: 2026-11-05, Europe/Helsinki. TASK-033 RUN-044 восстановлен append-only непосредственно в MASTER ROADMAP: [commit c459382](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/c45938246b809802a033f34411cd3bd48eb41036), checkpoint не удалён. Незакрытый RUN-045 ведёт отдельный исполнитель; фактов облачной проверки до его END нет.
- Созданы независимые TEST-only Node offline modules [evidence gate fdc5a3d](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/fdc5a3d2087dce572f35562dd8d94e17f61b307d) и [deduplicated alert planner 49ae85c](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/49ae85c6a76b87dd2fde5a545895a04c4adc5cce); [tests dfe2b43](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/dfe2b4356214e28de0e334402e7f8d0d3ddedc75), [CI hook 53d597b](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/53d597beea3543220a74cebf4a9bfc8126963862).
- [GitHub Actions #42017682085](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42017682085) **SUCCESS** exact CODE HEAD 53d597b: new synthetic TEST 20/20, health 15/15, Apps Script mock 13/13, release-preflight SUCCESS and Firestore emulator SUCCESS. Scope: private provider permissions/manifest/readback-SHA/attempt proof + alert ACK/dedup/no-data/recovery; no network.
- Read-back: [технический отчёт RUN-046](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/BACKUP_EVIDENCE_ALERTS_RUN-20261105-046_RU.md) ([commit 87dc90c](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/87dc90c688237d05230fd9d3c71f9ea55f96a952)), [MASTER TASK-034 commit 3d01dcd](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/3d01dcd08d7915dec3c3ed839f3a404fa59e36fe), [Issue #10 checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10#issuecomment-6656661196).
- **НЕ live:** все ответы provider искусственные; нет Google Auth/OAuth/Roles readback, настоящей private Sheet, scheduled backup, mail delivery, independent restore. Возвращаемое `verified:true` в mock не является облачной проверкой. NEW-001 и A–K OPEN/NO-GO. Main/LIVE Firebase/TEST default main/данные учеников/тариф не менялись, PR #9 draft/unmerged.
- NEXT: независимый разбор RUN-045 cloud Rules result (после END или статус BLOCKED). Затем подготовить один строго synthetic TEST пилот только после отдельного GO владельца. Без промоушена в production.

### RUN-20261105-045 / ЗАБЛОКИРОВАНО / PARTIAL — NO AUTHORIZED CLOUD READ RESULT
- Дата: 2026-11-05, Europe/Helsinki. После сверки журнала и GitHub владелец отдельно пояснил: сеанс Work завершился до доступа к Firebase, исполнитель лишь прочитал журнал. Проверяемого вывода live Firebase Rules, версии ruleset, server ID token или admin_metrics/current **нет**. Не считать cloud read PASS и не выдумывать результаты.
- Подтверждено только GitHub read-only начальное состояние и существование RUN-045 / НАЧАЛ; никаких новых доказательств реальных TEST Firebase/Auth/Firestore/Rules обращений нет. Не повторять cloud операцию без авторизованного Work/Cloud Shell. Отсутствие результата не означает, что правила неправильны или правильны.
- RUN-045 закрыт именно BLOCKED (не DONE), Stage C/G/H и NEW-003/NEW-006 OPEN. NEW-001 backup также не связан с этим read-only запросом. LIVE `riveria-sanasto-community-test`, TEST `sanastoyhteiso-v3-development`, production сайт, данные и тариф инструментами этого чата не менялись.
- NEXT: продолжать независимую GitHub-only разработку; позже владелец может открыть авторизованную TEST Firebase консоль в Work. До этого использовать offline подготовленный inspector из RUN-038, но не называть его результатом настоящего облачного чтения.

### RUN-20261105-047 / НАЧАЛ / IN_PROGRESS (TEST admin dashboard: fail-closed telemetry proof and private backup state)
- Дата: 2026-11-05, Europe/Helsinki, Stage D/E/H and NEW-007. After RUN-046 offline CI PASS and RUN-045 BLOCKED due to Work session ending before authorized Firebase read.
- Discovered TEST PR #3 admin dashboard accepts `monitoringActive:true` + recent aggregate `updatedAt` as sufficient for site status `OK`, without *independently refreshed ingestion and aggregation heartbeats/coverage proof*. Backup tab also prints raw `verifiedBackupAt` for stale/unverified reports. This could falsely imply healthy monitoring/backups after the collector stops. All data remains server read only, but display contract is too weak.
- Plan: in TEST DRAFT PR #3 only, require explicit server-produced fresh ingestion + aggregator heartbeat and `monitoringCoverageVerified===true` for monitoring-based OK/counts; backup last-verified date only with protected server readback/manifest flags and bounded valid time. Keep denied/anonymous behavior and student UI unchanged; ES5 iOS12 syntax. Add synthetic regression cases for stale/offline/missing and verified statuses, bump admin script cache URL if needed, wait exact HEAD two CI checks; append-only MASTER/Issue and END.
- NO production, LIVE/TEST Firebase rules/data, site deployment, billing, user IDs or real diagnostics collected. Client-only fields are NOT proof until trusted backend exists; A–K/NEW-001/NEW-007 remain open until live provider/real accounts acceptance.

### RUN-20261105-047 / ЗАВЕРШИЛ / DONE TEST-ONLY ADMIN UI CI — CLOUD RULES/TELEMETRY NOT VERIFIED
- Дата: 2026-11-05, Europe/Helsinki. Выявлен NEW-007: админ-центр TEST PR #3 мог показать неверный `OK` без heartbeat реального сборщика/агрегатора; вкладка Backups могла отображать дату без trusted provider readback. Исправлена только DRAFT ветка: [JS 76633ae](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/76633ae2f53cfe0ce4bec69029b9336c8f442cd1), [regression a6e53bb](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/a6e53bb6dfaeff3bca201cbc20eb7325068084e2), [HTML 283a59f](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/283a59f7dbeb3ab7a2a88779ee82340ec971bf95), [cache SW 388e0c2](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/388e0c2a69f842642d3c7dc0f269a52f0a804b77), [TEST HEAD 39b217d](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/39b217db74db17a1afcf3fbcc2278837381dcc85).
- [TEST admin regression #42018755573](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42018755573) SUCCESS exact HEAD 39b217d, **61/61** tests. [TEST Firestore emulator #42018755619](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42018755619) SUCCESS exact HEAD 39b217d, **90/90** tests. No Firebase cloud writes, no real telemetry or backups. Новая панель показывает `NO DATA` без свежих server ingestion/aggregation heartbeat + coverage, и дату backup только при проверенных readback/sha флагах + свежем времени.
- Read-back: [RUN-047 технический отчёт commit 69a343f](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/69a343f73fbb66788ea87e9f59a315c6c059f4af), [MASTER NEW-007/TASK-035 commit a3325bb](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/a3325bbab5a9f9fa94656d3bd4e88f7a740f7779), [Issue #10 checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10#issuecomment-6656809528).
- **Не закрывать D/E/H/NEW-007:** server metrics/heartbeat и private readback ещё не существуют как проверенный live контракт, TEST PR #3 draft/unmerged; TEST cloud rules/real token/older iPad и два аккаунта OPEN. RUN-045 честно BLOCKED. Main, LIVE/TEST Firebase/Auth/Firestore/учащиеся, тариф, production сайт не изменялись.
- NEXT: согласовать серверную telemetry schema минимальных кодов без персональных данных и внедрить в TEST only после privacy/security gates; отдельно в авторизованной сессии проверить published TEST Firebase Rules (RUN-045 retry under new ID). Пока можно продолжать самостоятельные offline работы, но не заявлять полноценный monitoring или GO к публикации.

### RUN-20261105-048 / НАЧАЛ / IN_PROGRESS (TEST-only GDPR-minimal telemetry schema and read-only aggregation offline)
- Дата: 2026-11-05, Europe/Helsinki. Последние завершённые RUN-046/047; RUN-045 BLOCKED (Cloud Rules не прочитаны). Актуальные DRAFT PR #3 head `39b217d`, release PR #9 head `4b1038e`; никаких live изменений.
- Цель: только DRAFT TEST PR #3 подготовить и проверить независимый серверный контракт диагностики: строго enumerated error code/module/severity/browser family+major/OS family/build version/event time/network status, жёсткая схема reject extra keys и free text/URL/email/UID/ответов/слов/пациентов; безопасный bounded агрегатор без вывода user-level записей, без мнимого server heartbeat и без ложного OK. Без сетевых обращений, user identifiers, service credentials, функций записи Firestore или отправки уведомлений.
- План: создать `admin/telemetry/telemetry-contract.cjs` и `admin/telemetry/aggregate-contract.cjs`, Node synthetic tests `admin/tests/telemetry-contract.test.cjs`, подключить к TEST admin-regression CI, проверить exact HEAD + Firestore emulator, прочитать отчёты, затем полный START→END/Master TASK-036/Issue #10. Сначала тесты негативных сценариев (PII, wrong project, unknown code, untrusted future time, quotas, raw details), затем positive aggregate WITHOUT monitored OK.
- Область безопасности: не менять TEST default main, LIVE Firebase `riveria-sanasto-community-test`, TEST Firebase `sanastoyhteiso-v3-development`, реальные Rules/Auth, production Pages, тариф или чужие результаты. Этот контракт НЕ является реально подключённым сбором ошибок, безопасной telemetry storage/permission/rate-limit backend, GDPR-compliant production implementation или проверкой Cloud Rules; этапы D/E/H и NEW-007 остаются OPEN.

### RUN-20261105-048 / ЗАВЕРШИЛ / DONE TEST OFFLINE TELEMETRY CI — REAL INGEST NOT CONNECTED
- Дата: 2026-11-05, Europe/Helsinki. DRAFT TEST PR #3: строгий input allowlist [code 6e60c5c](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/6e60c5c6d0b757cb1513872b4e8c9f2b60e24fce) и агрегатор-кандидат [2dbc381](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/2dbc38142490b2118e2e66414ed10654543635ce); [21/21 tests 8eefdd5](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/8eefdd54aa815a613b74ed3c721dfaec9017114e), [CI hook 27bdaff](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/27bdaff974d5d7d99d2309a118036ad9ad1baee2). Strict TEST only, rejects extra PII/error text, bounded TTL/build IDs, groups >=5 events, no client telemetry network or raw records; never produces fake green heartbeat/status.
- [TEST Actions #42021310403](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42021310403) **SUCCESS exact code HEAD 27bdaff**: 21/21 new privacy tests, 61/61 previous admin regression. Firestore Security Rules emulator for this code HEAD was NOT evidenced by this run; older emulator PASS does not equal new cloud deploy/pass.
- Read-back GitHub: [full technical report](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/TELEMETRY_MINIMAL_CONTRACT_RUN-20261105-048_RU.md) ([commit 32bf7a2](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/32bf7a2428bb54b23a2db35edfcb3f3e40d2c343)), [MASTER TASK-036 commit fa61678](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/fa61678ad6456e45b0671101ee41cac64d9ee931), [Issue #10 checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10#issuecomment-6657168493).
- НЕ готово: настоящий прием diagnostic events, protected Firestore create-only Rules, server rate limiting/aggregation/audit/retention, consent/GDPR, browser client offline queue, live admin metrics и real TEST Rules readback отсутствуют. Stage D/E/H, NEW-007 и A–K OPEN/NO-GO, RUN-045 Cloud Rules blocked. Не было real Firebase/Drive/Sheets, production/TEST main, тариф/ученики/UID изменений.
- NEXT: RUN-049 isolated Safari12-compatible diagnostic code queue + offline retry mock, no API writes, then only authorized TEST owner Cloud Rules acceptance. Никакого GO на выпуск.

### RUN-20261105-049 / НАЧАЛ / IN_PROGRESS (isolated iOS12-friendly diagnostics memory queue with privacy/auth fencing)
- Дата: 2026-11-05, Europe/Helsinki. После RUN-048 DONE offline telemetry contract, test PR #3 DRAFT HEAD 27bdaff, release PR #9 DRAFT. Этапы D/H, NEW-007.
- Только в DRAFT TEST PR #3 подготовить `admin/telemetry/browser-queue.es5.js` (не импортировать в сайт): опциональное включение только явным тестовым флагом; очередь только разрешённых кодов, без UID, текстов, URL или личного контента; ограничение числа событий/повторных ошибок, 7-дневный TTL, очистка при смене авторизованной сессии; запрет отправки сети по умолчанию; read-only peek, удаление только после подтверждения доверенного отправителя. Не использовать localStorage или IndexedDB до обсуждения GDPR/consent и безопасности дискового хранения.
- Добавить synthetic Node tests с фактическим выполнением ES5-кода в VM и проверкой точного соответствия code policy серверному RUN-048; проверить отключение/смену пользователя, flood, expiration, no network/no persistent storage. Подключить к admin-regression CI, убедиться в PASS exact HEAD. Не считать это реальным client collector/offline sync без backend/consent. Записать результат в MASTER TASK-037, Issue #10, журнал ЗАВЕРШИЛ либо ОШИБКА.
- Без изменений TEST default main, real Firebase Rules/Auth/Firestore, live/prod сайта, тарифа и учеников. Не печатать личные identifiers/keys, не использовать OAuth. Сохранить RUN-045 как BLOCKED.

### RUN-20261105-049 / ЗАВЕРШИЛ / DONE OFFLINE QUEUE CI — LIVE TRANSPORT NOT ENABLED
- Дата: 2026-11-05, Europe/Helsinki. DRAFT TEST PR #3: [ES5-only browser memory queue commit 20124fb](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/20124fb95bf8dd40ef5d6afa6722f6259305681f), [22 synthetic tests 3e1b5f2](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/3e1b5f2ed9fbbecf32fdd3f980cb929861cbcab1), [CI hook 590803f](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/590803f626fa0acd91939c4a1d825b99b175b705), [test realm fix c8e5b8f](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/c8e5b8f58e450f709278207b66f8bd29130c2584). Первоначальный CI fail из-за некорректной изоляции JS контекста в тесте; рабочая фильтрация не ослаблялась.
- [Admin CI #42022491067](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42022491067) **SUCCESS exact HEAD c8e5b8f**: 22/22 queue tests + 21/21 telemetry contract + 61/61 admin regression. [Isolated Firestore emulator #42022491335](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42022491335) **SUCCESS exact HEAD c8e5b8f, 90/90**; это НЕ published Firebase Rules/Cloud PASS.
- Read-back GitHub: [full technical report RUN-049 commit 4cf9dab](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/4cf9dab362d76d801c65f5d61abff47e560be971), [MASTER TASK-037 commit cc4c534](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/cc4c534de87867d5b64ee47c0d101d5de1cc7b0f), [Issue #10 checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10#issuecomment-6657344773).
- Queue never imported into student/admin Pages; no network, no actual IndexedDB/persisted offline progress, no Firestore/Auth/Rules/Cloud changes, no actual secure transport/delivery ACK, no authenticated device testing. Browser module only offline/synthetic. Client boolean `transportConfirmed` not real server confirmation. Physical iOS12, consent/GDPR, server rate limits & aggregation NOT DONE. A–K/NEW-007 OPEN/NO-GO.
- NEXT: TEST-only synthetic server adapter for replay/idempotency/audit without user IDs or backend writes, and only then separately authorized TEST Firebase pilot. No main/TEST default main merge, no LIVE Firebase, billing, student data or production changes.

### RUN-20261105-050 / НАЧАЛ / IN_PROGRESS (isolated server-side telemetry replay/idempotency and quota mock)
- Дата: 2026-11-05, Europe/Helsinki. RUN-049 DONE with queue 22/22 + exact SHA Firestore emulator 90/90. TEST PR #3 HEAD c8e5b8f DRAFT; all A–K OPEN, RUN-045 Cloud Rules BLOCKED.
- Scope: только TEST DRAFT PR #3. Разработать чистую server-side state-machine под будущий trusted telemetry ingestion: отбрасывание непроверенной авторизации/чужого проекта, strict RUN-048 event schema, ограниченный batch, idempotent replay по ephemeral server-issued session handle + auth epoch + sequence, точный ACK только для принятых/ранее принятых записей, per-session rate limit и отказ при invalid payload без частичной записи. Без хранения UID/email/слов/адресов, no network/Firestore writes. Это SYNTHETIC contract, не реальный backend.
- Тесты: тотальная атомарность при одном плохом событии, duplicate replay после ACK, cross-session isolation, late/stale auth rejection, throttling, oversize, auth-required, secret-safe outputs, no fake server heartbeat. Подключить Node tests к TEST admin CI, дождаться exact-head PASS и isolated emulator. Затем отчёт, MASTER TASK-038, Issue #10, terminal journal END. No cloud writes, changes to TEST default main, live main/firebase/tariff/users. Никакой реальный мониторинг не объявлять выполненным.

### RUN-20261105-050 / ЗАВЕРШИЛ / DONE OFFLINE TEST INGESTION CI — NO REAL TRANSPORT
- Дата: 2026-11-05, Europe/Helsinki. Только DRAFT TEST PR #3: [server ingest mock 0799578](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/07995788e05cac7bb8c12d86d5ea3d451d8193e8), [23 synthetic tests 18121d5](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/18121d58fb41e1bd3761c999810bc37e80d73860), [CI hook 71f4688](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/71f4688360161558ce7e4011817f7fa1303282ed). Атомарный отказ malformed event, защита от seq collision, дедуп replay, лимиты на пакет/сессию и закрытый sandbox actor context. Не публикует личные идентификаторы и не хранит raw reports; нет сетевых операций.
- [TEST Admin Actions #42023626443](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42023626443) **SUCCESS exact HEAD 71f4688**, ingress 23/23, ES5 queue 22/22, telemetry contract 21/21, previous admin 61/61. [Firestore emulator #42023626452](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42023626452) **SUCCESS exact same HEAD 90/90**, not deployed Firebase rules.
- Read-back GitHub: [full technical report commit 095eeca](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/095eecaff0cea60cc3437789494f9c826ed63c97), [MASTER TASK-038 commit a90f2de](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/a90f2de69f603709cb70314a8f53be1a7b4399b0), [Issue #10 checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10#issuecomment-6657510090).
- **CRITICAL**: serverIdentityVerified flag supplied in mock can be spoofed by a client, so no real Auth middleware check; in-memory receipts vanish on process restart; `simulatedAckSeqs` must NOT cause live queue removal. Every success explicitly `safeForClientAck:false`, `durableCommitVerified:false`; real ingest/transport/Firestore/consent/retention/rate limit/monitoring not enabled. Production main, TEST main, actual TEST/LIVE Firebase/Rules/Auth/user data/tariff unchanged. D/E/H/NEW-007 and A–K OPEN/NO-GO.
- NEXT: focus on real critical path: owner-authorized read-only deployed TEST Firestore Rules review and trustworthy GDPR/rate-limited server choices, then one synthetic gated TEST pilot. Do not merge/deploy automatically. RUN-045 remains BLOCKED, not cloud PASS.


### RUN-20261105-051 / НАЧАЛ / IN_PROGRESS (TEST-only private telemetry collection Rules: server-only)
- Дата: 2026-11-05, Europe/Helsinki. Предыдущее завершённое действие RUN-050: mock telemetry ingestion 23/23 PASS; RUN-045 read-only cloud rules BLOCKED. D/E/H, NEW-007 и A–K не закрыты.
- Цель: в DRAFT TEST PR #3 подготовить отдельный кандидат Security Rules, в котором `telemetry_reports/{reportId}` недоступен для GET/LIST/CREATE/UPDATE/DELETE вообще всем браузерным Firebase SDK-клиентам, включая администратора; raw errors не размещать в публичных или admin метриках. Подготовить isolаted Firestore emulator regressions для обычного/админского/гостевого клиента, проверить, что существующие студенческие owner ACL и закрытый admin_metrics/current не изменились. Сравнивать candidate побайтно с исходным NEW-006 кроме одной добавленной секции, исторические fixture не менять.
- Причина: реальный доверенный backend с Firebase Admin SDK/IAM, серверной валидацией, rate-limit, retention, аудитом и GDPR согласием пока отсутствует. Публичную create-only telemetry collection на Spark без подтверждённого abuse protection открывать нельзя. Кандидат only-for-review, НЕ опубликовывать в Firebase.
- Scope: файлы только test DRAFT branch `feat/admin-control-center-package-spec-20261104`, GitHub Actions, затем MASTER TASK-039/Issue #10 и терминальный END. Без TEST default main, LIVE main/Firebase `riveria-sanasto-community-test`, TEST `sanastoyhteiso-v3-development` writes, публичного сайта, сторонних UID/секретов, тарифа.


### RUN-20261105-051 / ЗАВЕРШИЛ / DONE ISOLATED RULES CANDIDATE CI — LIVE CLOUD READ/WRITES NOT PERFORMED
- Дата: 2026-11-05 Europe/Helsinki. В TEST DRAFT PR #3 создан отдельный НЕ ДЕПЛОИМЫЙ NEW-008 candidate для `telemetry_reports/{reportId}` — deny all browser get/list/create/update/delete, including admin; original NEW-006 historical candidate preserved. [Rules candidate commit d3ea901](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/d3ea901d406eab062d064db98f30943c6d52ca60), [16 emulator tests c44218a](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/c44218a2c87ff1ffee3c4567e8aecd1f1d4d93ae), [CI hook cb34400](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/cb34400fd2ce5bdb96a3f58c2110f235a7326934), [README 165c580](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/165c580379029f0c81d981226d5d5616ee5d7696).
- [Emulator Actions #42040317116](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42040317116) **SUCCESS exact code HEAD cb34400, 106/106**; после README [#42040478373](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42040478373) **SUCCESS exact docs HEAD 165c580**. Проверены клиентские allow/deny, неизменность ACL учебных profiles/sync_v3/admin_metrics/current, byte-identity исходных правил кроме одной новой deny секции. Это локальный Firestore Emulator, не доказательство published Firebase ACL.
- Read-back: [технический отчёт RUN-051](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/TELEMETRY_SERVER_ONLY_RULES_RUN-20261105-051_RU.md) ([commit 7115437](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/7115437a236c5419d9ac75bba627b7c15af04fd5)), [MASTER NEW-008/TASK-039 commit 3ba6809](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/3ba6809d6467558ecfee0f8d4723b382fb62ca51), [Issue #10 checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10#issuecomment-6659888893).
- CRITICAL: Rules `allow` across overlapping paths combine by OR. A negative `allow false` cannot override any other positive allow. Current TEST deployed Rules/claims not retrieved; Admin SDK IAM/verified real user backend, consent, GDPR, quotas and privacy remain unverified. RUN-045 cloud read BLOCKED; NEW-007/008 and A–K NO-GO. LIVE/TEST Firebase, production/main, TEST default main, тариф, users/UID/words and real telemetry untouched.
- NEXT: do not stack more fake tests indefinitely; critical path is actual owner-authorized read-only TEST Firebase Rules + trusted backend selection/privacy gates before a one-account synthetic pilot. Current ChatGPT cannot execute Cloud Shell with existing GitHub connection, no live claims asserted.


### RUN-20261105-052 / НАЧАЛ / IN_PROGRESS (trusted backend architecture and free-plan cost/privacy decision gate)
- Дата: 2026-11-05, Europe/Helsinki. Previous RUN-051 DONE isolated TEST Rules 106/106, no live cloud; RUN-045 published TEST Rules read BLOCKED. Stage D/E/F/I, NEW-007/008.
- Цель: в DRAFT release docs подготовить проверенную по официальным условиям архитектурную развилку для настоящего telemetry ingress, Auth verify, IAM, aggregate and ZIP admin backend при условии бесплатного Firebase Spark и запрета незапрошенного повышения тарифа. Сравнить варианты: Cloudflare Workers Free, Google Apps Script, Firebase Cloud Functions (Spark limitation), GitHub Actions (offline CI/scheduler only). Показать лимиты и риски, не рекламировать заведомо небезопасный публичный endpoint.
- Зафиксировать минимальный доверенный протокол и acceptance gates (Firebase RS256 ID token verification, token issuer/audience/expiry, ephemeral server ACK not mocked, rate limiter and durable anti-abuse, GDPR notice/retention, owner-only backend IAM, no personal text, no separate user records in public admin, fail closed on quota and NO DATA).
- Только read-only public research и GitHub документация/Issue; НЕ создавать внешний аккаунт, secrets, Worker, app, Firebase/Google/Cloud resources, никакого billing/Rules/site/deploy/user data changes. Не объявлять backend выбранным или работающим. END после read-back MASTER TASK-040 и Issue #10.


### RUN-20261105-052 / ЗАВЕРШИЛ / DONE ARCHITECTURE RESEARCH — NO AUTHORIZED CLOUD EXECUTION
- Дата: 2026-11-05 Europe/Helsinki. Выполнена read-only проверка актуальных official docs Cloudflare Worker Free, Firebase ID token verification, Apps Script daily/per-execution limits и Firebase Spark/Blaze constraints. **Без регистрации новых сервисов, соединений, IAM, secrets или изменения тарифа.**
- [RUN-052 architecture/cost/privacy decision memo](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/TRUSTED_BACKEND_DECISION_RUN-20261105-052_RU.md) ([commit fc5a21e](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/fc5a21e5342e854c68931f16974df44583626a1d)). Conditional TEST-only candidate: Cloudflare Workers Free (100k requests/day, 10ms CPU/request, 50 subrequests), requires real load/Token Crypto/IAM/DPA/quotas test before owner decision. Apps Script limited to owner TEST backup, Firebase Functions require Blaze, GitHub Actions not telemetry ingress. None selected/deployed.
- GitHub read-back: [MASTER TASK-040 commit c1d8d8b](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/c1d8d8b99bb0e1a8e1901fdbd5c3f8a84bedb037), [Issue #10 checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10#issuecomment-6659991322). Все исходные материалы и ссылки на официальные правила сохранены, история append-only.
- BOUNDARY: no real Web Worker, no GitHub App, no Firebase admin API/token validation, no live Cloud Rules, personal backup/restore, user diagnostic ingress, or ZIP protected service. TEST and LIVE Firebase, production GitHub main, TEST default main, billing and other users untouched. A–K, NEW-001/007/008 OPEN/NO-GO.
- NEXT: stop accumulating mock-only “green” statuses; request one owner-authorized Work/Cloud Shell **read-only** actual TEST Firestore Rules + ID token/allow-deny verification when available, then separate explicit service/privacy/budget approval for synthetic TEST pilot. RUN-045 previous attempt remains BLOCKED; cloud state unknown.

### RUN-20261105-053 / НАЧАЛ / IN_PROGRESS (real private Drive backup inventory + Stage A gaps)
- Дата: 2026-11-05, Europe/Helsinki. Previous RUN-052 DONE research, RUN-045 BLOCKED cloud Rules. No TEST/LIVE Firebase access. Прежде чем начать этот RUN, выполнен предварительный read-only поиск по подключённому Google Drive и выборочные metadata-only проверки: найдены исторические Sanastoyhteisö/Riveria Google Sheets и приватный каталог `Sanastoyhteisö — varmuuskopiot`, первичные ответы Google указывали `shared:false` и owner-only permissions. Эти предварительные операции не были записаны до выполнения — не выдавать их за журналированные действия.
- Цель этого RUN: выполнить независимую повторную проверку metadata-only для конкретного приватного каталога и исторических копий, проверить дату/тип/список ACL без чтения содержимого учебных слов или пользовательских результатов; составить доказуемую Stage A инвентаризацию и исключить путаницу исторических Google Sheets с ещё не существующим TEST Firestore V3 backup.
- Ограничения: только доступные Google Drive file metadata/search, никаких permissions edits, content reads, file moves, exports, Firebase/Gmail/Apps Script/triggers, публикации UID/email/Drive file IDs в публичном GitHub, без регистрации сервисов/изменения тарифов.
- Затем: закрыть RUN-053 END с агрегированными обезличенными выводами, MASTER TASK-041, Issue #10; все A–K/NEW-001 OPEN до реального независимого backup/readback/restore. Параллельные cloud проверки не повторять.

### RUN-20261105-053 / ЗАВЕРШИЛ / DONE REAL DRIVE METADATA-ONLY AUDIT — V3 BACKUP/RESTORE NOT VERIFIED
- Дата: 2026-11-05 Europe/Helsinki. Проверка подключённого Google Drive metadata подтверждает 6 относящихся к проекту исторических Sheets (01–02 ноября), `shared=false`, возвращённые `permissions` — одна роль `owner` на каждую; отдельный приватный каталог имеет две таблицы (pre-migration и personal progress). Содержимое личных данных, файлов и слов не читалось, Google Drive IDs/emails не опубликованы и не отправлены в GitHub.
- Readback: [обезличенный технический отчёт RUN-053](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/DRIVE_BACKUP_METADATA_INVENTORY_RUN-20261105-053_RU.md) ([commit feb7bcf](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/feb7bcf1b8493e53bfa09b416f4c9eef2002f498)); [MASTER TASK-041 commit 2a48264](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/2a48264b50d2c0594125c1736e562519cd4a10ae); [Issue #10 checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10#issuecomment-6663155646).
- **Никакого live Firestore V3 backup, complete manifest SHA, private new Sheet readback, restore drill или daily schedule** этот metadata аудит не подтверждает. Это не exhaustive listing Drive и не постоянная ACL guarantee. TEST published Firestore Rules, real server Auth and admin role также не прочитаны (RUN-045 BLOCKED). Stage A/NEW-001/A–K NO-GO.
- NEXT: по пользовательскому приоритету — единственная отдельная авторизованная read-only проверка TEST published Firestore Rules при доступном подключении; затем один synthetic owner-only TEST backup → verified restoration с явным разрешением до облачных операций. Пока продолжать только GitHub review, без новых mock для имитации live progress.
- Без изменений в Google Drive files/permissions, Firestore TEST/LIVE, GitHub main, студентских данных, тарифе или триггерах.

### RUN-20261105-054 / НАЧАЛ / IN_PROGRESS (historical private backup SHEET STRUCTURE metadata only)
- Дата: 2026-11-05 Europe/Helsinki, после завершённого RUN-053 real owner-only Google Drive metadata. Цель Stage A/NEW-001: посмотреть исключительно структуру двух исторических таблиц из приватного резервного каталога (количество вкладок, размеры сеток, типы вкладок), чтобы оценить, есть ли признаки поддерживаемого V3 snapshot или только старых словарных/личных копий.
- Не читать ячейки, формулы, тексты, email, UID, учебные слова, пациентские данные; не публиковать названия частных вкладок, file IDs или owner identity в GitHub. Google Sheets connector только `get_spreadsheet_metadata`, без экспортов, правок, восстановления.
- После проверки: обезличенный technical report, MASTER TASK-042, Issue #10 и журнал END. No TEST/LIVE Firebase access, main/TEST main merge, Drive file changes, billing or triggers. На основании одной структуры нельзя утверждать успешное восстановление или полноценный Firestore V3 backup.

### RUN-20261105-054 / ЗАВЕРШИЛ / REAL HISTORIC SHEET STRUCTURE METADATA VERIFIED — V3 RESTORE STILL OPEN
- Дата: 2026-11-05 Europe/Helsinki. Повторное реальное Google Sheets read-only `get_spreadsheet_metadata(charts_only=true)` для 2 исторических таблиц в приватном каталоге резервов: pre-migration master **13 GRID tabs** (выделенные 40–1297 строк, 4–26 столбцов), personal progress **2 GRID tabs** (выделенные 3267×6, 15×3). Размеры выделенных сеток не равны числу заполненных данных, V3 backup или proof recovery.
- Readback [обезличенный отчёт RUN-054](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/DRIVE_BACKUP_STRUCTURE_METADATA_RUN-20261105-054_RU.md) ([commit f3629a0](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/f3629a016f31c3fe79438368418a39bd5bf71279)), [MASTER TASK-042 commit 7f7cbca](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/7f7cbcabc22e80403248e69b5b858a66e55e2764), [Issue #10 checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10#issuecomment-6663222785).
- Никаких spreadsheet cell values, formulas, personal tab names, IDs, учебных слов/профилей, UID/email не читали/публиковали; никакой Drive write, Firebase cloud, Sheets edit, trigger, GitHub main merge или тарифа. RUN-045 cloud TEST Rules read BLOCKED, NEW-001/Stage A и все A–K OPEN.
- NEXT: до следующего реального продвижения нужен один авторизованный безопасный read-only TEST Firebase Rules и самостоятельное разрешение владельца на synthetic owner-only TEST backup/restore. Не копить offline PASS как замену реальному verification.


### RUN-20261105-055 / НАЧАЛ / IN_PROGRESS — защита от устаревших TEST admin claims перед присвоением роли
- Дата: 2026-11-05 Europe/Helsinki. Последнее завершённое RUN-054 — только metadata исторических приватных Google Sheets; реального TEST Firebase Rules/API readback нет (RUN-045 BLOCKED). PR #3 DRAFT, PR #9 DRAFT. Никакой Cloud write без разрешения владельца.
- Обнаружено при ревью `admin/ops/assign-test-admin.cjs`: Firebase Admin SDK `setCustomUserClaims` заменяет весь map claims; текущий скрипт читает их до длительного интерактивного подтверждения и может сохранить устаревшую копию, если параллельный администратор изменил роли. Это риск потенциальной потери других custom claims, НЕ свидетельство реального инцидента.
- Цель: перед разрешённым владельцем `--apply` повторно прочитать того же TEST пользователя, сверить UID/email/верификацию/Google-provider/disabled/состав custom claims, отказаться от записи при изменениях, использовать именно повторно подтверждённый map для локальной 0600 резервной копии и присвоения `admin:true`. Режим по умолчанию `--dry-run` не должен меняться. Изолированные Node tests без Firebase API, secrets, email/UID или реального назначения роли.
- Область: только TEST DRAFT PR #3 + GitHub CI, append-only журнал, MASTER TASK-043 и Issue #10. Не запускать скрипт, не читать live Auth, не менять Firebase Rules/roles, TEST/main, рабочий Pages, тариф или пользовательские данные. Ограничение: Admin SDK не предоставляет атомарный compare-and-swap для custom claims; повторная проверка уменьшает окно риска, но не делает изменения транзакцией. Перезапуск и применение только после отдельного GO владельца.


### RUN-20261105-055 / ЗАВЕРШИЛ / DONE TEST ADMIN CLAIMS SAFETY GUARD — NO LIVE ROLE UPDATE
- Дата: 2026-11-05 Europe/Helsinki. После предыдущих RUN-051..054 выполнен независимый аудит подготовленного owner-operated TEST `admin/ops/assign-test-admin.cjs`. Выявлена stale claims проблема: `setCustomUserClaims` заменяет всю карту, а интерактивное подтверждение даёт время на параллельную смену чужих ролей.
- Только TEST DRAFT PR #3: [revalidation code a9b6d3b](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/a9b6d3b4f8856840bfa12d4f8b61193840472cfd), [9 new synthetic tests 2a64f21](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/2a64f21822b881582c7cd43b6b17eafc5e41c401), [owner guide db2b64a](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/db2b64a2441216f314784b0b0ec1fb13c248027c). После подтверждения `--apply` выполняется повторный `getUser` + полная сверка акаунта и claims; при изменениях STOP до 0600 backup и write. Поведение `--dry-run` сохранено.
- [TEST Admin regression #42090989816](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42090989816) **SUCCESS exact code HEAD db2b64a**, admin 70/70, telemetry 21/21, in-memory browser queue 22/22, ingest mock 23/23. [RUN-055 report commit 56f11b9](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/56f11b9094096aade09ca8a0316e203a523350ac), [MASTER TASK-043 commit c8b153e](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/c8b153ef8af2a5f4ed4f3a5b499cfd170ff72a1a), [Issue #10 checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10#issuecomment-6666819273) сохранены, оригинальные записи append-only.
- **Граница:** повторное чтение не превращает Firebase Admin SDK в atomic compare-and-swap; гонка между чтением и записью остаётся. Никакого `--apply`, реального Firebase Auth/Rules/API, пользователя/UID, Live main/TEST default main, тарифа, data/permissions изменений. Предложено подключение Firebase к ChatGPT для будущей отдельной owner-authorized проверки, подключение НЕ подтверждено; не считать живой TEST Rules readback выполненным. RUN-045 BLOCKED, A–K/NEW-001/007/008 OPEN/NO-GO.
- NEXT: только при подтверждении отдельного Firebase доступа выполнить read-only TEST `sanastoyhteiso-v3-development` published Rules revision/time/allow-deny, без исправления Rules, затем согласовать отдельный synthetic TEST owner pilot. Не копить mock-результаты как замену реальной проверке.


### RUN-20261105-056 / НАЧАЛ / IN_PROGRESS — offline fail-closed ZIP release manifest approval gate
- Дата: 2026-11-05, Europe/Helsinki. На момент старта последним завершён RUN-055; TEST PR #3 DRAFT HEAD db2b64a; production/main и Firebase не затрагивать.
- Найдено при статическом аудите `admin/rs-release-manifest.js`: валидатор может вернуть `valid:true`, когда параметр `expectedBase` отсутствует. Отсутствие достоверного текущего commit означает, что нельзя проверить конкурирующие изменения и безопасно принять даже ZIP-кандидат. Это риск будущей интеграции, не доказательство существующей неисправности публикации (backend пока отсутствует).
- Цель: только в DRAFT TEST PR #3 потребовать точный trusted `expectedBase` для `valid:true`, отвергать прототипно изменённые значения/нецелые или небезопасные byte sizes; расширить synthetic regression на отсутствие base/неправильный SHA/unsupported counts, оставив `readyToPublish:false` и всё без доступа к ZIP/сети. Проверить exact-head TEST CI, отчёт, MASTER TASK-044/Issue #10, END.
- Запрет: не создавать GitHub App/сервис/облако, не загружать ZIP и не принимать его к релизу, не делать merge/deploy, не менять LIVE/TEST Firebase, работающий сайт, цены и данные пользователей. Проверка manifest не является реальной проверкой ZIP байтов; будущий backend обязан повторно сверить SHA/paths/current HEAD, IAM, PR и rollback.


### RUN-20261105-056 / ЗАВЕРШИЛ / ZIP MANIFEST PREVIEW FIX CI SUCCESS — REAL RELEASE BACKEND UNAVAILABLE
- Дата: 2026-11-05, Europe/Helsinki. В DRAFT TEST PR #3 `admin/rs-release-manifest.js` исправлен fail-open случай missing expectedBase: без подтверждённого current GitHub SHA теперь `valid:false`, строковые/нецелые/NaN/Infinity/выходящие за лимит file.bytes отклоняются. [Code commit f1b646e](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/f1b646e1e69c6f700b777aa12b04dd639efa5fb6), [test commit 1a5f2b0](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/1a5f2b0b8cfdd729e03716deb574f98e9a3020a2).
- [Admin GitHub Actions #42094779778](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42094779778) **SUCCESS exact code HEAD 1a5f2b0**: new manifest checks PASS, admin 70/70, telemetry 21/21, queue 22/22, ingest 23/23 PASS; emulator не менялся. Read-back: [RUN-056 report commit 84670be](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/84670bef29a0af31cd97e53bc9f98fd81d3e6950), [MASTER TASK-044 commit d7f71d3](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/d7f71d3a8290611bb063d839b543cff08aa5d7d4), [Issue #10 checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10#issuecomment-6667334712).
- Граница: синтетический manifest не является реальной загрузкой ZIP, сверкой raw SHA256, доверенным GitHub HEAD из backend или развёрнутым защитным сервисом. `readyToPublish:false` обязательно. PR #3/#9 остаются draft, опубликованные TEST Rules/Auth неизвестны (RUN-045 BLOCKED), все A–K OPEN/NO-GO. Firebase TEST/LIVE, main, личные данные, тариф и Github Pages не менялись.
- NEXT: прежде очередных MOCK задач нужен авторизованный read-only TEST Firebase Cloud rules/version + один отдельно разрешённый synthetic backup/restore TEST pilot и review budget/privacy. Никакой публикации в production.


### RUN-20261105-057 / НАЧАЛ / IN_PROGRESS — зафиксировать невозможность установки Firebase приложения на устройства владельца
- Дата: 2026-11-05, Europe/Helsinki. Пользователь отдельно уточнил, что предложенное приложение/плагин Firebase установить и использовать на его телефоне нельзя, а компьютер из-за устаревшей версии macOS не поддерживает его установку. Эти ограничения приняты как предоставленный владельцем факт, не требующий повторной проверки или повторного предложения установки в следующих чатах.
- Требуемое правило передачи: НЕ предлагать владельцу повторно установить Firebase plugin, Codex/desktop tooling или обновлять устройство как обязательный шаг Sanastoyhteisö 3.0. Не путать отсутствие приложения с недоступностью Firebase как облачного сервиса. Для прямой проверки Firebase при наличии возможностей использовать только авторизованный ChatGPT Work / его облачный браузер или Cloud Shell через веб-браузер с разрешением владельца; если доступа нет — фиксировать BLOCKED, продолжать безопасные задачи GitHub, не объявлять cloud Rules проверенными.
- Действие: append-only заметка в непрерывном журнале, MASTER ROADMAP и первой инструкции HANDOFF для следующего ChatGPT/Work, а также Issue #10. Никакого кода, Firebase, аккаунтов, роли, сайта или тарифа не менять. Итоговая фиксация ЗАВЕРШИЛ после независимого read-back.


### RUN-20261105-057 / ЗАВЕРШИЛ / DEVICE-INCOMPATIBILITY OWNER CONSTRAINT DOCUMENTED
- Дата: 2026-11-05, Europe/Helsinki. По прямому указанию владельца зафиксировано: предложенное Firebase приложение/плагин не подходит для его телефона; на имеющемся старом Mac с устаревшей macOS установка невозможна. Не просить владельца повторять попытки, устанавливать локальный Firebase/Codex/CLI или заново объяснять несовместимость. **Дальнейшие проверки TEST Firebase Cloud — через авторизованный ChatGPT Work/облачный браузер либо браузерный Google Cloud Shell только если доступ реально доступен; иначе BLOCKED.** GitHub можно продолжать без установки.
- Read-back контент сохранён: [MASTER TASK-045 commit 598e984](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/598e984e20a2ec1b4a8d9f2dba24d7a236158901), [HANDOFF top-section commit 9ac0606](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/9ac060668beddff5f8a6c04ec1ce1c8303e41cc8), [Issue #10 checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10#issuecomment-6667402858). Перед изменениями сохранён [RUN-057 START commit 884d733](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/884d7335a4332b504f683209dea1b3a46a718b42).
- Только документация и GitHub, не затронуты Firebase TEST/LIVE, права/аккаунты, сайт/main, тариф/данные. RUN-045 live TEST published Rules остаётся BLOCKED; никаких утверждений о live проверке. Следующему чату начать с MASTER/HANDOFF и **НЕ предлагать установку**.

### RUN-20261105-058 / НАЧАЛ / IN_PROGRESS — FI/EN UI leakage fixes, real V3 preview localization
- Дата: 2026-11-05, Europe/Helsinki; последнее RUN-057 ЗАВЕРШИЛ, Stage E/J: FI/RU/EN интерфейс и совместимость старых мобильных браузеров. Предварительный read-only анализ DRAFT TEST PR #3 `v3-unified-preview/i18n.js` выявил 4 конкретные трёхъязычные записи с кириллицей в финском/английском поле: 2 поля-примера поиска, учебный пример записи ухода, финский термин «имukykyiset». Это реальные ошибки текстов интерфейса, а не пользовательские данные или результаты.
- Цель: ТОЛЬКО в DRAFT TEST PR #3 исправить переводы 4 троек, сохранить RU как исходную строку для текущего UI lookup, добавить офлайн Node regression для всех UI троек — отсутствие кириллической подстановки в FI/EN, nonempty language fields, уникальность RU keys, ES5 syntax и явная проверка исправленных текстов. Подключить CI с минимальным охватом, не исполнять приложение с авторизованными пользователями. Не менять логику Firebase/Auth/sync/Firestore, пользовательские слова, реальные данные, TEST default main или production.
- После: проверить точный HEAD CI, сохранить отчет RUN-058, MASTER TASK-046, Issue #10, терминальный RUN-058 ЗАВЕРШИЛ/ОШИБКА. Не утверждать, что физический iOS12/телефон или опубликованный preview проверены CI; A–K все еще OPEN/NO-GO. Без Firebase cloud, ZIP, тарифов, Work/browser installs.


### RUN-20261105-058 / ЗАВЕРШИЛ / DONE FI/EN V3 DRAFT UI CORRECTIONS — DEVICE/BROWSER ACCEPTANCE OPEN
- Дата: 2026-11-05 Europe/Helsinki. В DRAFT TEST PR #3 исправлены четыре фактические строки UI с русскими вставками в FI/EN: две подсказки Mediatri/поиска, иллюстративная запись ухода и опечатка `имukykyiset alushousut`. [Source fix 6947c66](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/6947c66f4ad4a23ca6eb4140ec221ef19650bea5); 228 triples checked, Russian source keys unchanged, personal words/answers unchanged.
- [i18n unit cases 89027a9](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/89027a9e3021fd32a8f4f80fe484e13f45a23c5d), [TEST HTML f9a0eca](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/f9a0ecaa8277526a3675dc544e708f42ec6478a6), [SW cache v8 8ecc9a2](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/8ecc9a273e9914c70cbb88576ad35a81d368eb63), [CI hook 479b6a2](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/479b6a20a4e28c5da1ee84f5945f67ae5f2d979f).
- [GitHub Actions #42096305884](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42096305884) **SUCCESS exact code HEAD 479b6a20a4e28c5da1ee84f5945f67ae5f2d979f**: FI/EN UI tests 6/6, admin 70/70, telemetry 21/21, ES5 queue 22/22, ingest 23/23 and release manifest PASS. [RUN-058 report commit 3533373](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/3533373bbcf54273c574e9413ce2bb66b0d1011e); [MASTER TASK-046 f23c828](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/f23c828aba30e99bfd82f39c5197af7395a9807b); [Issue #10 checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10#issuecomment-6667557473). Historical records preserved append-only.
- Ограничения: тесты не подтверждают визуальный рендер на настоящем iOS12/телефоне, учебный login в двух аккаунтах или доступность изменений на существующем TEST default main. Draft PR #3 unmerged; no Firebase TEST/LIVE/Auth/Rules/claims, no GitHub production or default TEST main writes, billing/Sheets/users untouched. RUN-045 cloud Rules BLOCKED. A–K OPEN/NO-GO. Не предлагать установку приложения Firebase на телефон/старый Mac владельца (RUN-057).
- NEXT: focus on visible TEST UI acceptance + live TEST Rules gate through authorized Work/browser when possible; do not replace Cloud acceptance with mocks.


### RUN-20261105-059 / НАЧАЛ / IN_PROGRESS — My Finds M/P/H cross-module ID validation mismatch (offline V3 draft)
- Дата: 2026-11-05 Europe/Helsinki. Последний подтверждённый RUN-058 UI 6/6 DONE. DRAFT TEST PR #3, Stage E/G (личные «Мои находки», сохранение/синхронизация без потери данных). При read-only source inspection установлено: `v3-sync-release.js` / study engine уже принимают `[TMPH][0-9]{5,7}`, NEW-006 TEST Rules candidate разрешает эти IDs, а `v3-sync-core.js` проверяет `collection_set` только для `T[0-9]{5,7}` или `W_...`, и `v3-sync-shadow.js` отклоняет `finds` с M/P/H при проверке снимка. Это конкретная несовместимость TEST кода, способная блокировать допустимые M/P/H finds; утверждение о сбоях настоящих учеников не делается.
- Цель: в DRAFT TEST PR #3 привести оба валидатора к согласованному строго ограниченному формату `[TMPH][0-9]{5,7}` или `W_[a-f0-9]{32}`, не расширять права на чужие/неправильные IDs; оставить остальные ACL и события без изменений. Проверить core `valid/event/fold` и shadow `snapshot` на T/M/P/H/W, tombstones и неверные ids, плюс отрицательные сценарии; отдельный Node offline тест, подключение CI, cache-bust только затронутых asset references в preview HTML/SW.
- Запрет: никаких реальных Firestore/Google Sheets/IDB/account writes или данных пользователей, Cloud Rules, merge/deploy, тарифов, рабочего сайта/TEST default main. Сохранить журнал и MASTER TASK-047, Issue #10, exact HEAD CI и END. TEST Firebase published Rules все еще неизвестны (RUN-045 BLOCKED). Это реальное исправление исходника, но не гарантия облачной синхронизации или работы на физическом iOS12.


### RUN-20261105-059 / ЗАВЕРШИЛ / DONE M/P/H MY FINDS FORMAT FIX — EXACT HEAD CI PASS, CLOUD OPEN
- Дата: 2026-11-05 Europe/Helsinki, Stage E/G. Источник дефекта: TEST V3 `v3-sync-core.js` `collection_set` и `v3-sync-shadow.js` `finds` принимали T/W, но release/engine и candidate Rules NEW-006 уже разрешали T/M/P/H/W. На DRAFT PR #3 согласованы строго только безопасные `[TMPH][0-9]{5,7}` или личные `W_[a-f0-9]{32}`; нет потерь/изменений настоящих данных и никаких cloud writes. [Core fix 0275343](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/02753437a3b384216ab3107c6a38379b0c96eefc), [shadow fix 87358ca](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/87358cab21cd177b467a15aefe281aab7d8ad350).
- [8 My Finds tests 2e97601](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/2e97601ef97fa306f10e2b31a27e4dc8dbd856c7) + fixture safety [b615b4d](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/b615b4de7d58371c5bc8f2dfcd70129e383e54c2), [TEST HTML/asset version 700ab55](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/700ab553e6353c4b638c741969aa3817c885bf37), [SW v9 07c0f07](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/07c0f0737540117e04c8ec3b1d0d9e2d5b07fbed), [CI hook ff26489](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/ff264896b082fea9ac47a9e29a6286ed5ef88aa5). Промежуточные CI FAIL из-за i18n cache hardcoded v8, исправлены только cache version tests, финальный [HEAD 12b5c63](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/12b5c6326864230e41605475f00284c61d969982).
- [GitHub Actions #42097351596](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42097351596) **SUCCESS exact HEAD 12b5c632**: My Finds 8/8, i18n 6/6, admin 70/70, telemetry 21/21, queue 22/22, ingest 23/23, manifest PASS. [Firestore Emulator #42097351722](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42097351722) **SUCCESS same HEAD 106/106**. This is not deployed Firebase and not two-device acceptance.
- Read-back docs: [RUN-059 report 5a3f039](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/5a3f03950a301392fd78d0ee5dc3e64ff950ce72), [MASTER TASK-047 6199fb8](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/6199fb8c559dd5321d4e4bc9e163ced12a6870bd), [Issue #10 checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10#issuecomment-6667709533). Старые записи сохранены, RUN-059 закрыт.
- PR #3 draft/unmerged; no TEST default main/production, Firebase TEST/LIVE, IAM/Rules/Auth, Google Sheets, devices/accounts, billing, personal data changes. RUN-045 Cloud Rules BLOCKED. **NEXT:** реальный owner-authorized TEST published rules read-only, затем synthetic owner-only pilot/backup and cross-device tests с отдельными safety gates. A–K OPEN/NO-GO, не требовать установку Firebase приложения на устройства владельца (RUN-057).


### RUN-20261105-060 / НАЧАЛ / IN_PROGRESS — V3 «Мои находки» и панель синхронизации: реальная FI/EN локализация
- Дата: 2026-11-05 Europe/Helsinki, Stage E/J. Предыдущее RUN-059 завершено, PR #3 DRAFT. Аудит реального `v3-unified-preview/v3-sync-release.js` + `i18n.js` подтвердил: текст `Мои находки · V3`, кнопки добавления/удаления и панель подключения/сверки V3 имеют русские литералы, отсутствующие в 228 тройках локализации. MutationObserver не может перевести отсутствующие ключи; FI/EN пользователи видят смесь языков.
- План: добавить строгие FI/RU/EN переводы пользовательских статических сообщений V3 в `i18n.js`, а для числового счётчика очереди — отдельную безопасную локализацию без чтения личных результатов. Подключить/расширить offline i18n tests на необходимые строки, отсутствие дублирующихся RU keys и compatibility cache-bust. Сохранить русские UI source keys, без изменения логики учебных событий, облака или персональных данных.
- Scope: только DRAFT TEST PR #3, синтаксически ES5; CI exact HEAD, отчёт, MASTER TASK-048 и Issue #10, затем терминальный END. Не менять TEST default main, production, Firebase/Rules/Auth, тариф, других учеников. Offline Node CI не равен реальному browser/iOS12 acceptance и не означает A–K GO.


### RUN-20261105-060 / ЗАВЕРШИЛ / DRAFT FI/EN V3 MY FINDS + SYNC UI VERIFIED OFFLINE, CLOUD OPEN
- Дата: 2026-11-05, Europe/Helsinki. Исправлен подтверждённый разнобой в тестовой V3 локализации: статусы синхронизации, «Мои находки», ручные кнопки и предупреждение первого V3 подключения не имели FI/EN UI rows. В DRAFT PR #3 добавлены 28 полных FI/RU/EN троек (228→256), 9 префиксов, динамические переводы очереди и кнопок без изменения private text. `v3-sync-release.js` использует translator для confirm и отдельный переводимый узел темы без изменения пользовательских слов/заметки. [i18n 113778e](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/113778e0814367fb9d7e49e99b4556bd2eeda059), [dynamic 86bbe17](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/86bbe17327f25c6b0c63fa883b2d8d9d95a80bfc), [V3 UI b23e8f0](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/b23e8f0f629a693781970689e42ff571a58db5af).
- Cache change `i18n.js?v=v3-approved-ui-3`, `v3-sync-release.js?v=v3-myfinds-i18n-1`, SW v10; [8 synthetic runtime ES5 VM tests 92fa46d](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/92fa46d9a6fe9712e67256989be6f497d872fd2c), [CI exact code HEAD 768d4ec](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/768d4ec6026b1288d1a2a8c3d59b8211b8620171). [Admin CI #42098557619](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42098557619) **SUCCESS** 8/8 new + 6/6 prior i18n, My Finds 8/8, admin 70/70, telemetry 21/21, queue 22/22, ingest 23/23. [Emulator CI #42098566085](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42098566085) **SUCCESS** exact same HEAD. Это не live Firebase acceptance.
- Documentation read-back: [RUN-060 report commit 2f4bacb](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/2f4bacb8d8a2eedff00f3a77fef7d2d86ea3eed8), [MASTER TASK-048 commit 12f5c91](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/12f5c9152ae883cdd27b77590ddd7052edd6f4e0), [Issue #10 checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10#issuecomment-6667864136). START/END в журнале сохранены.
- TEST PR #3 DRAFT/unmerged. Нет реального физического iOS12, FI/EN/RU браузерного acceptance, published TEST Firebase Rules/Auth/backup, двух аккаунтов, ZIP/production release. Main, TEST default main, Firebase TEST/LIVE, студенты, тариф не менялись. A–K OPEN/NO-GO, RUN-045 CLOUD BLOCKED, RUN-057 no-install constraint preserved. NEXT: prioritize real authorized TEST cloud read-only + owner-approved synthetic pilot, device UI check before release; avoid claiming mock/VM tests as public release proof.


### RUN-20261105-061 / НАЧАЛ / IN_PROGRESS — исправить крайний пробел в RU-ключе заголовка V3 синхронизации
- Дата: 2026-11-05, Europe/Helsinki, Stage E/J. После RUN-060 точная проверка `i18n.js` обнаружила один новый RU key с конечным пробелом `Синхронизация между устройствами: `. Функция `asText` разделяет prefix/core/suffix и делает core без крайних пробелов, так что словарь по этому единственному ключу не находился; заголовок мог остаться русским при FI/EN. Это отдельный подтверждённый дефект нового DRAFT UI, не ошибочная cloud синхронизация.
- Цель: заменить только RU исходный ключ на вариант без конечного пробела (исходный DOM-текст со своим пробелом не менять), добавить тест вызова `RS_I18N.translate('Синхронизация между устройствами: ')` во всех трёх языках, в существующий isolated runtime suite. Больше никаких данных/сайтов не изменять, проверить exact HEAD CI, append-only report, MASTER TASK-049, Issue #10 и END.
- Ограничения прежние: только DRAFT TEST PR #3, никакого production/default TEST main merge/deploy, никаких Firebase/Auth/Rules/Google Sheets/billing/user data, не просить установить Firebase plugin на старый Mac/телефон, actual Cloud Rules check BLOCKED.


### RUN-20261105-061 / ЗАВЕРШИЛ / FIXED V3 SYNC HEADING WHITESPACE i18n — EXACT CI PASS, CLOUD OPEN
- Дата: 2026-11-05 Europe/Helsinki, Stage E/J. В DRAFT TEST PR #3 исправлен точный RU source key заголовка `Синхронизация между устройствами: `: trailing whitespace не учитывался `i18n.js` `dict[core]` после trim, поэтому FI/EN заголовок мог остаться русским. Исправлен только RU ключ (DOM trailing space сохранился), cache-bust `i18n.js?v=v3-approved-ui-4`, SW cache v11. [Fix dbacba1](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/dbacba124e4002ef775796d7073692e95c07e195), [runtime test and exact code HEAD f3a99c6](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/f3a99c62d2b6d5f9f7475fcee2400953749ea0f5).
- [GitHub Actions #42099155329](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42099155329) **SUCCESS exact HEAD f3a99c6**: 9/9 V3 FI/EN/RU runtime tests, 6/6 dictionary UI, 8/8 My Finds, 70/70 admin, 21/21 telemetry, 22/22 browser queue, 23/23 ingress; no real Firebase calls, user data or production deploy.
- Read-back: [RUN-061 technical report commit 3213934](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/32139342d26b14822826a300d401206a23f5e7c5), [MASTER TASK-049 commit 8aebdc8](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/8aebdc86439a601a13a9b2c553ac93f4436e13e1), [Issue #10 checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10#issuecomment-6667936540). История append-only.
- PR #3 DRAFT, PR #9 DRAFT, никаких merge/deploy TEST default main / production, Firebase TEST/LIVE, student data, Google Sheets or billing changes. A–K OPEN/NO-GO; published TEST Cloud Rules read-only still BLOCKED (RUN-045), real iPhone/iOS12 UI acceptance pending. Не предлагать несовместимую установку Firebase plugin владельцу (RUN-057). NEXT: при доступном авторизованном Work сделать read-only TEST Rules; затем отдельный owner-approved synthetic pilot и real device acceptance. Облачных результатов не выдумывать.


### RUN-20261105-062 / НАЧАЛ / IN_PROGRESS — TEST V3 refresh cannot report cloud sync success after failed upload
- Дата: 2026-11-05 Europe/Helsinki; RUN-060 and RUN-061 now DONE in another GitHub session, source already localized. DRAFT TEST PR #3 head f3a99c62. Stage G/H; owner requests continue development, no production release.
- Source finding: `v3-unified-preview/v3-sync-release.js` `refresh()` calls `engine.upload().catch(function(){return null;})`, then `engine.refresh()` and unconditionally `text('Данные V3 сверены с облаком.',false);return true`. A failed upload is swallowed; user can see false successful synchronization. Also `orderly(fn)` resolves its returned job before its queued-counter cleanup, so `if(queued===0)apply(r)` in refresh's immediate .then can fail to apply a new shadow snapshot even after verified readback.
- Scope: fix only DRAFT TEST PR #3, ES5-compatible. Make verification status fail closed on failed outgoing upload or remaining pending events, preserve local IndexedDB queue, allow read-only refresh but never claim cloud saved. Wait for serialized `queue` cleanup before UI apply, guard uid/epoch. New isolated runtime regression tests with synthetic account/mocked engine, no Firebase/IDB/real user/cloud. CI exact HEAD, cache-bust touched preview script and SW if needed, report, MASTER TASK-050, Issue #10 and END.
- No cloud rules/Auth/claims, TEST default main, production, billing, real words/users, ZIP or deployed site changes. A–K remain OPEN/NO-GO. Do not request incompatible Firebase desktop/mobile app install (RUN-057).


### RUN-20261105-062 / ЗАБЛОКИРОВАНО / BUG VERIFIED, CODE PATCH WRITE BLOCKED — NOT DONE
- Дата: 2026-11-05 Europe/Helsinki, Stage G/H. В DRAFT TEST PR #3 установлен реальный дефект сообщения `refresh()`: ошибку `engine.upload()` подавляют, при завершении `engine.refresh()` метод без проверки pending выдаёт `Данные V3 сверены с облаком` и `true`. Это не свидетельствует о фактически отправленных локальных ответах, хотя shadow сохраняет их локально. `orderly()` также может разрешиться до `queued--`, поэтому `if(queued===0)apply(r)` не гарантирует отображение облачного обновления. До исправления в PR #3 HEAD `f3a99c62d2b6d5f9f7475fcee2400953749ea0f5`, file SHA `39ef392d1c45f2c36a9ec2a9528fd34affdb5b9a`.
- **CODE NOT CHANGED:** предложена точечная ES5 замена с учётом upload failure/pending, ожиданием serial queue cleanup и проверкой UID/epoch перед UI apply; `GitHub update_file` заблокирован системой безопасности инструмента. Read-back проверка подтвердила отсутствие изменения файла и PR. Не обходить техническую блокировку и не выдавать исправление за применённое. Новых тестов/CI для этого фикса нет.
- Сохранены [развёрнутый технический отчёт RUN-062](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/V3_SYNC_REFRESH_FALSE_OK_RUN-20261105-062_RU.md) ([commit 563b362](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/563b362fb71ed0a8b8269237fdf7a2e0868adba0)), [MASTER NEW-009/TASK-050 commit 2782553](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/278255361864e390adeca4e506f7c0cd6b55ba77), [Issue #10 checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10#issuecomment-6668263254). Все предыдущие RUN append-only.
- NEXT: применить фикc в доступной разрешённой среде редактирования TEST DRAFT PR #3, добавить mock-runtime тесты success/offline denied/pending/switch-account/queue, exact SHA CI и только после него отметить code pass. Действующие TEST Firebase Rules/live двух устройств остаются непроверенными (RUN-045 BLOCKED). Production, TEST default main, Firebase Auth/Rules/данные/тариф/пользователи не менялись; A–K OPEN/NO-GO. Не предлагать несовместимое приложение на телефон/старый Mac владельца (RUN-057).


### RUN-20261105-063 / НАЧАЛ / IN_PROGRESS — независимый воспроизводимый TEST для дефекта NEW-009 без обхода блокировки исходника
- Время (Europe/Helsinki): 2026-11-05 22:25:14.
- Этапы: G/H; NEW-009, TASK-20261105-051 (регрессионная подготовка; НЕ исправление исходного дефекта).
- Фактическое состояние: RUN-061 последний DONE; RUN-062 закрыт статусом BLOCKED; TEST DRAFT PR #3 open HEAD f3a99c62d2b6d5f9f7475fcee2400953749ea0f5, v3-sync-release.js SHA 39ef392d1c45f2c36a9ec2a9528fd34affdb5b9a, текущий refresh продолжает скрывать upload failure. Рабочий main и TEST default main не менять.
- План: построить независимый offline Node vm/regression для реального TEST script v3-unified-preview/v3-sync-release.js, воспроизводящий ошибочное success при неудачной загрузке и отсутствие UI apply до очистки очереди. Разрешено записать только новый безопасный тестовый файл в DRAFT TEST PR #3, если GitHub это допускает; не переписывать заблокированный RUN-062 исходник и не обходить прежнюю техническую блокировку. Если runtime fixture нежизнеспособен, сохранить только точный тестовый план и BLOCKED, не фиктивный PASS.
- Ожидаемый результат: GitHub commit с изолированным регрессионным тестом/воспроизведением, чётким статусом KNOWN FAIL (не CI PASS исправления); отчёт и обновление MASTER TASK-051/Issue #10. Тест не должен выполнять Firebase/Google API, использовать реальные UID/email, личные данные, сеть, IndexedDB или авторизацию.
- Запрет: не добавлять неустранённый дефект в зелёный обязательный CI; не объявлять NEW-009 исправленным. Никаких TEST/live Firebase, Cloud Rules/Auth, Google Sheets, ZIP/backend, платёжного плана, работы с аккаунтами или production/site.


### RUN-20261105-063.1 / НАЧАЛ / IN_PROGRESS — CI воспроизведение KNOWN RED без изменения заблокированного V3 кода
- Время (Europe/Helsinki): 2026-11-05 22:27:28.
- После START RUN-063 создан только новый изолированный opt-in тест на DRAFT TEST PR #3 commit e5e0974bc75716eb1efef4c0924c503e971bb1ef, проверен read-back. Исходник v3-sync-release.js не менялся.
- План: в TEST branch обновить только .github/workflows/admin-regression.yml отдельным явно маркированным не блокирующим диагностическим шагом: запуск V3_SYNC_ASSERT_FIXED=1 node --test admin/tests/v3-sync-refresh-failclosed-gate.test.cjs с проверкой реального exit status, выводом теста и статусом KNOWN RED. Это не PASS дефекта, а доказательство воспроизводимости; остальные обязательные тесты продолжают работать.
- Ожидается GitHub Actions run на exact HEAD с тремя явными FAIL до фикса, при этом общий release остаётся NO-GO. Никакой Cloud Firebase/API/deploy/TEST default main/production/секретов/данных пользователей.


### RUN-20261105-063.1 / ЗАВЕРШИЛ / DONE — воспроизведены 3 KNOWN RED сценария, FIX ещё не сделан
- Время (Europe/Helsinki): 2026-11-05 22:28:37.
- В DRAFT TEST PR #3 добавлен не блокирующий диагностический шаг (CI commit 839d6de6d47b24250d28828e8f790187ccf9db37); точный HEAD 839d6de, GitHub Actions admin regression #42103610894 и #42103620692 SUCCESS. Эта зелёная сводка относится к существующим тестам и диагностической ОБРАБОТКЕ известного красного результата, **НЕ** означает успешной проверки NEW-009.
- Подтверждение по логам #42103610894 job 127512544400: тест с реальным V3 исходником показал 3/3 ожидаемых FAIL: (1) upload rejected, refresh вернул true вместо false; (2) pending events, refresh вернул true вместо false; (3) применений snapshot 0 вместо ожидаемого 1. Лог содержит предупреждение NEW-009 KNOWN RED; реальных Firebase API/IDB/учеников/сети нет.
- Файл нового теста: commit e5e0974bc75716eb1efef4c0924c503e971bb1ef, admin/tests/v3-sync-refresh-failclosed-gate.test.cjs. Без V3_SYNC_ASSERT_FIXED=1 assertions SKIPPED; явный опциональный запуск с флагом специально должен быть красным до исправления, не используется как release pass.
- Исходник v3-unified-preview/v3-sync-release.js и блокировка RUN-062 остаются без изменений, NEW-009 OPEN. NEXT: оформить RUN-063 отчёт/MASTER TASK-051/Issue #10; затем новый исполнитель с разрешённым редактором исправляет исходник и переводит тесты в обязательный зелёный CI. Продакшн/облачные данные не затронуты.


### RUN-20261105-063 / ЗАВЕРШИЛ / DONE TEST HARNESS — DEFECT NEW-009 OPEN/BLOCKED
- Время (Europe/Helsinki): 2026-11-05 22:30:12. Этап G/H, TEST DRAFT PR #3; действие закрыто в части воспроизведения, но сам дефект синхронизации НЕ исправлен и релиз запрещён.
- GitHub TEST code: [new isolated regression e5e0974](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/e5e0974bc75716eb1efef4c0924c503e971bb1ef) + [non-gating diagnostic workflow 839d6de](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/839d6de6d47b24250d28828e8f790187ccf9db37); exact TEST PR #3 HEAD 839d6de6d47b24250d28828e8f790187ccf9db37, DRAFT/open.
- Verified [admin Actions #42103610894](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42103610894) и [#42103620692](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42103620692) SUCCESS exact HEAD, а также [isolated Firestore emulator #42103620834](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42103620834) SUCCESS exact HEAD. **Отдельный NEW-009 regression = 3/3 KNOWN RED** по job log: upload rejected true вместо false, pending true вместо false, snapshot UI apply 0 вместо 1. Workflow SUCCESS **не** означает, что дефект исправлен.
- Read-back подтверждён: v3-unified-preview/v3-sync-release.js blob SHA 39ef392d1c45f2c36a9ec2a9528fd34affdb5b9a НЕ изменён и содержит старую подавляющую ошибку строку. Блокировка RUN-062 уважена; edit исходника не повторяли и другим способом не обходили. Production main HEAD d29813cf409af9dc60804105ca3141f98ec12fcd НЕ изменён.
- [Full RUN-063 report](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/TEST_V3_REFRESH_FAILCLOSED_KNOWN_RED_RUN-20261105-063_RU.md) commit af2bf8165afe802f23f18db1a851454d6773a3ad; [MASTER TASK-051](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/d09af20cee1af13d1746de735733d41d6f3ba660); [Issue #10 checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10#issuecomment-6668522618). START/END RUN-063.1 также сохранены. История append-only.
- NEXT: отдельный новый RUN только при разрешённом редакторе DRAFT TEST PR #3 — исправить fail-closed source, дождаться cleanup queue, guard UID/epoch, добиться 3/3 PASS и включить обязательный CI. Не переименовывать KNOWN RED в DONE и не делать deployment. RUN-045 published TEST Firebase Rules read-only BLOCKED без авторизованного Work/браузера; реальный backup→restore, admin backend, ZIP release gates OPEN. Все A–K OPEN/NO-GO. Firebase TEST/LIVE, тариф, аккаунты/UID, приватные Google Sheets, рабочий сайт и TEST main не менялись; не предлагать Firebase app/CLI установку владельцу (RUN-057).


### RUN-20261105-064 / НАЧАЛ / IN_PROGRESS — устранить пропуск NEW-009 в теле главной GitHub-доски Issue #10
- Время (Europe/Helsinki): 2026-11-05 22:30:53; этап G/H, documentation-only. RUN-063 полностью закрыт.
- Read-only проверка обнаружила: NEW-009 уже упоминается в комментариях Issue #10 и MASTER ROADMAP, но **не присутствует в основной body списка задач Issue #10** (48218 символов). Это дефект документации и угрозa передачи контекста.
- План: только в теле существующего Issue #10 добавить NEW-009 в раздел «Дополнительные обнаруженные задачи», со статусом OPEN/BLOCKED, свидетельством 3 RED, шагом исправления и прямыми ссылками на PR/CI; сохранить остальной Issue без изменений. Сверить read-back; append MASTER TASK-052 и терминальный END.
- Ожидаемый результат: задача видна при открытии главной доски, даже без чтения комментариев. Никаких TEST/production code, Firebase, Google Drive, тарифов, данных пользователей.


### RUN-20261105-064 / ЗАВЕРШИЛ / DONE ISSUE #10 BODY REGISTRATION — SOURCE BUG STILL OPEN
- Время (Europe/Helsinki): 2026-11-05 22:31:40. В главном [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10) раздел «Дополнительные обнаруженные задачи» дополнен явной записью `### NEW-009` HIGH / OPEN / SOURCE WRITE BLOCKED, 3/3 KNOWN RED и ссылкой на TEST PR/CI; прежние пункты и чекбоксы сохранены.
- Read-back Issue #10 body подтвердил прямую запись NEW-009 (не только комментарий). [MASTER TASK-052 commit 6fd9992](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/6fd999211f2fb8454b6c95d239a2ab4db023baa2) сохраняет отдельный checkpoint; предшествующие RUN-063/063.1 START/END и TASK-051 сохранены.
- Это только закрытие документального пробела. Actual NEW-009 code fix всё ещё BLOCKED (RUN-062), V3 sync readback и real Cloud Rules/backup/ZIP release всё ещё NO-GO; следующим действием остаётся разрешённый TEST source patch и 3/3 PASS. Production/main, TEST main, Firebase TEST/LIVE, Cloud roles, Sheets, students, pricing не менялись.


### RUN-20261105-065 / НАЧАЛ / IN_PROGRESS — владелец переносит ZIP-обновления на ПОСЛЕ запуска учебного сайта
- Время (Europe/Helsinki): 2026-11-05 22:35:30.
- Решение владельца в этом чате: приоритет — скорее начать учить слова на корректно работающем на всех устройствах V3; сложную автоматическую загрузку/установку сайта одним ZIP не удалять, а заморозить до ПОСЛЕ запуска. Временный способ обновления — помощь ChatGPT через ручной GitHub PR/CI/проверяемый rollback.
- Проверено перед началом: последний RUN-064 DONE, журнал содержит закрытый RUN-063, PR #3 DRAFT/open HEAD 839d6de, PR #9 DRAFT/open. NEW-009 остаётся BLOCKED, TEST published Rules/auth и реальное восстановление резервной копии не подтверждены.
- План документационного изменения (никакого деплоя): зафиксировать owner-authorized scope change, Stage F статус DEFERRED/PAUSED NOT DONE, сохранить все ZIP источники/тесты/PR; снять зависимость от F и настоящего ZIP-теста для допуска к первоначальному учебному запуску, заменив безопасным ручным GitHub PR + CI + QA + rollback.
- Критически важно НЕ ослабить условия безопасности: offline/pending cloud sync fail-closed, 2 пользователя/2 устройства, iOS12, реальные Security Rules, сохранность старых UID и иных учеников, закрытый восстановимый backup, права и админ-доступ и явный owner GO остаются барьерами перед production. Не считать этапы A–E/G–I выполненными без доказательств. Админский ZIP контрол пока должен показываться как неактивный/отложенный, без фиктивных готовых релизов.
- Объекты: главный MASTER ROADMAP, Issue #10 body, TEST admin handoff; append-only журнал. Мастер-план A–K и история сохраняются; при коллизии на файл — повторно прочитать HEAD, не перетирать изменения.
- Следующее действие: изменить только документы в подготовительных ветках и Issue #10, проверить GitHub readback, записать результаты RUN-065 / ЗАВЕРШИЛ или BLOCKED. Никаких изменений main/site/Firebase/Tariff/учеников/секретов.


### RUN-20261105-065.1 / НАЧАЛ / IN_PROGRESS — изменить мастер-план для отложенного этапа F
- Время Europe/Helsinki: 2026-11-05 22:36:43.
- Файл: docs/MASTER_ROADMAP_V3_ADMIN_RELEASE_2026-11-04_RU.md (только release draft branch).
- Действие: сохранить полный перечень ZIP задач в F, пометить F DEFERRED, перенести зависимость H/J/K и жёсткие release gates на проверенный ручной PR/CI/rollback; отдельно добавить owner-scope note и TASK-053. Все требования безопасности/backup/V3 остаются.
- Ожидается точный readback; действующий main/Firebase не трогать.


### RUN-20261105-065.1 / ЗАВЕРШИЛ / DONE — MASTER roadmap Stage F
- Время Europe/Helsinki: 2026-11-05 22:36:52.
- Изменён и повторно прочитан MASTER ROADMAP в release DRAFT branch; Stage F сохранён со статусом PAUSED/DEFERRED, ZIP removed from prelaunch hard gates, manual GitHub PR/CI/rollback remain mandatory, TASK-053 appended. Commit https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/cf97c963eaf69ed5cdd6b2bb321c4be63a4ffa1e.
- NEXT: проверить изменение основного Issue #10; не трогать production.


### RUN-20261105-065.2 / НАЧАЛ / IN_PROGRESS — актуализировать обязательные release gates Issue #10
- Время Europe/Helsinki: 2026-11-05 22:37:28.
- Предшествующий мастер-план обновлён commit cf97c963eaf69ed5cdd6b2bb321c4be63a4ffa1e; до этого Issue #10 всё ещё содержит ZIP как обязательный gate.
- Действие: изменить ТОЛЬКО основную Issue #10 и заголовок с уведомлением owner RUN-065: F PAUSED AFTER LAUNCH; H проверяет manual PR+rollback (не ZIP), J теперь не зависит от F, K manual PR; сохранить старые ZIP задачи в отдельном разделе и все старые чекбоксы A–E/G–I.
- Ожидаемый результат: readback Issue #10 и отсутствие противоречивого «все A–I», никакого кода/production/Firebase.


### RUN-20261105-065.2 / ЗАВЕРШИЛ / DONE — Issue #10 release gate priority
- Время Europe/Helsinki: 2026-11-05 22:37:37.
- Updated Issue #10 with 7 strict replacements and owner note; title changed. https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10. Readback confirmed.
- Содержание: Stage F PAUSED; all critical safety and first-release manual PR checks retained; next substep TEST handoff. Не объявлять F DONE и не публиковать production.


### RUN-20261105-065.3 / НАЧАЛ / IN_PROGRESS — передать отмену ZIP prelaunch gate в TEST handoff
- Время Europe/Helsinki: 2026-11-05 22:38:33.
- Scope: test draft PR #3 docs admin/WORK_HANDOFF_START_HERE_RU.md; no app source or deploy.
- Обновить верхнюю передачу: owner RUN-065 F ZIP PAUSED, правильный порядок A–E→G→H→I→J, после релиза F, затем K; ручные PR/CI/rollback до F; сохранить ограничения безопасности и запрет установки несовместимого приложения.
- Ожидается readback TEST DRAFT branch, production/main/Firebase не менять.


### RUN-20261105-065.3 / ЗАВЕРШИЛ / DONE — TEST handoff owner priority
- Время Europe/Helsinki: 2026-11-05 22:38:40.
- Handoff top and instructions updated/readback verified, TEST DRAFT PR #3; commit https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/413d2f6c301541c019b12b6e6a43f8a5f4d33045. No client code changed.
- NEXT: final project-wide readback / Issue #10 checkpoint, then close RUN-065. No production/Firebase changes.


### RUN-20261105-065.4 / НАЧАЛ / IN_PROGRESS — итоговый checkpoint Issue #10 и проверка безопасных границ
- Время Europe/Helsinki: 2026-11-05 22:39:13.
- План: read-only сверить master, Issue body и TEST handoff: Stage F PAUSED, mandatory A–E/G–I, нет разрешения публиковать. Сверить production main и PR states. Зафиксировать владельческий decision в комментарии к Issue #10 (без секретов). Затем END RUN-065.4 и RUN-065.
- Этап F не помечать DONE; запрет production до GO сохраняется.


### RUN-20261105-065.4 / ЗАВЕРШИЛ / DONE — owner ZIP freeze checkpoint
- Время Europe/Helsinki: 2026-11-05 22:39:25.
- All gates re-checked, both PR draft and main untouched; {"masterPaused":true,"masterRelease":true,"issuePaused":true,"issueManual":true,"handoffPaused":true,"productionUnchanged":true,"p9StillDraft":true,"p3StillDraft":true}. Issue #10 checkpoint posted https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10#issuecomment-6668752656
- Next RUN-065 closure; F remains PAUSED not DONE; no cloud release.


### RUN-20261105-065 / ЗАВЕРШИЛ / DONE — ZIP Stage F PAUSED, учебный V3 остаётся целевым первым выпуском
- Время Europe/Helsinki: 2026-11-05 22:39:46. Владелец изменил объём первого релиза: серверная автоматическая ZIP-публикация НЕ критична, временно заменена проверяемым ручным workflow GitHub PR/CI/QA/owner GO/rollback. Это **не** разрешение на production release и **не** признание ZIP реализованным.
- ЗАВЕРШЕНЫ ТОЛЬКО документационные изменения: MASTER ROADMAP [commit cf97c963](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/cf97c963eaf69ed5cdd6b2bb321c4be63a4ffa1e), новый TASK-053 с точным scope; главный [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10) изменил заголовок/чеклист и снял ZIP blocker с H/J, сохранив F PAUSED; TEST [HANDOFF commit 413d2f6](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/413d2f6c301541c019b12b6e6a43f8a5f4d33045); [Issue checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10#issuecomment-6668752656). RUN-065.1/.2/.3/.4 имеют свои START/END. Все старые записи, ZIP разработка и PR сохранены.
- Проверено реальным GitHub readback: MASTER Stage F DEFERRED, mandatory A–E/G–I и manual release gate, Issue #10 and TEST handoff в той же версии. Production main SHA d29813cf409af9dc60804105ca3141f98ec12fcd неизменён, PR #3/#9 по-прежнему DRAFT/open; исходный TEST код V3/ZIP не менялся, CI после документационного изменения не доказывает новых функций.
- Открытые барьеры: NEW-009 3/3 KNOWN RED, RUN-045 опубликованные TEST Firestore Rules не подтверждены, NEW-001 реальное приватное независимое backup→restore ещё не доказано, 2 устройства/2 аккаунта и iOS12 acceptance не закрыты, admin/monitoring не считать готовыми по mock тестам. Другие обязательные этапы не закрыты, F нельзя отмечать DONE.
- NEXT: отдельный RUN для исправления NEW-009 в разрешённой тестовой среде и 3/3 PASS, затем real TEST Cloud Rules/backup/двухустройственное QA без ZIP. Stage F возобновить отдельно после стабильного учебного запуска по согласованию владельца. Нет изменений Firebase TEST/LIVE, main/sandbox website, личных данных, приватных Sheets или тарифа.


### RUN-20261105-066 / НАЧАЛ / IN_PROGRESS — регрессии доступности учебных страниц на старом iOS Safari (без ZIP)
- Время Europe/Helsinki: 2026-11-05 22:44:40.
- Предшествующий RUN-065 закрыт DONE; TEST PR #3 DRAFT HEAD 413d2f6c301541c019b12b6e6a43f8a5f4d33045; release PR #9 DRAFT; main не менялся. NEW-009 sync source fix заблокирован ранее RUN-062 и не будет обходиться альтернативными правками.
- Новый приоритет владельца — максимально быстрый безопасный учебный запуск на телефоне, старом iPad и компьютере, без F/ZIP.
- План: read-only аудит фактического V3 loader/index/critical iOS12 JS/CSS and tests на TEST DRAFT, выявить подтверждённый по коду независимый compatibility blocker, внести отдельный минимальный TEST-only исправляющий патч (либо только новый изолированный regression guard), проверить exact-head GitHub CI и сообщить уровень доказательства. **Никаких правок заблокированного v3-sync-release.js, обходных патчей или вмешательства в sync fail-closed**. Если нет достоверного дефекта — не выдумывать исправление; зафиксировать аудиторские выводы и следующий шаг.
- Scope: только TEST DRAFT код, тесты и CI при разрешённых средствах, затем master TASK-054 / Issue #10 и END; production main, TEST default main, Firebase TEST/LIVE, реальные пользователи/UID/Rules, приватные backup, тариф, ZIP backend не менять.
- Важное ограничение: mock/emulator CI не заменяет ручного испытания на iPad iOS12 / 2 devices и реальной Firebase. Релиз остаётся NO-GO.


### RUN-20261105-066.1 / НАЧАЛ / IN_PROGRESS — code-hash offline shell version guard iOS12
- Время Europe/Helsinki: 2026-11-05 22:48:40.
- Подтверждено read-only: TEST `sw.js` содержит cache-first для локальных JS/CSS и CACHE_NAME `...-20261105-v11`; при изменении учебного asset без изменения самого SW старые браузеры могут пользоваться прежним кодом; только ручное переименование cache без валидатора эту ошибку не предотвращает. Список из 31 различных физ. файлов в FILES согласован с корневым индексом, 20 внутренних JS.
- Задача: в **TEST DRAFT PR #3** повысить CACHE_NAME до content-addressed fingerprint FNV64 от сортированного каталога Git blob hashes всех 31 precache файлов; добавить Node-only тест, автоматически проверяющий fingerprint, существование assets, все локальные JS/CSS из HTML и совместимость оболочки с ES5. FNV64 — только ключ обновления кэша, НЕ криптографическое удостоверение пакета/не ZIP-проверка.
- Ожидается: если разработчик меняет учебный JS/HTML/CSS, забыв обновить CACHE_NAME, обязательный TEST CI должен загореться красным; при изменении имени в SW новый worker создаст новый cache и старый удалит при activate. Test без Firebase/сети/учётных записей. Данный шаг не исправляет NEW-009.
- Включить тест в текущий TEST-only `admin-regression.yml`, проверить exact-head GitHub Actions. Production, TEST default main, Firebase и живые данные не менять.


### RUN-20261105-066.1 / ЗАВЕРШИЛ / DONE — 6/6 offline cache CI PASS на TEST DRAFT
- Время Europe/Helsinki: 2026-11-05 22:54:24. Выполнена конкретная TEST DRAFT code/CI работа, не только документация.
- TEST `v3-unified-preview/sw.js`: CACHE_NAME заменён на `sanastoyhteiso-v3-unified-preview-assets-2cbae3e600bd68d3`, где отпечаток FNV64 вычислен по именам + Git blob SHA 31 precached assets (включая JS/HTML/CSS/иконки). Новый уникальный namespace заставит обновлённый SW создать новый чистый offline shell и удалить прежние cache names при activate. Это НЕ ZIP release/криптографическая подпись и не решает сохранение пользовательских событий/NEW-009. [SW commit](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/0dedb8741054267b9f0621a6f015c7b542ab744f).
- Новый обязательный gate: `admin/tests/study-offline-cache-version.test.cjs`, шесть тестов: точное наличие 31 файлов; оба HTML → локальные версии JS/CSS; контроль FNV64 fingerprint; ES5 SW + отсутствие CDN/PII в FILES; синтетические install/activate; offline homepage fallback. `admin-regression.yml` запускает Node check/test, [CI workflow commit](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/c62e6f04fa432909f6f1b471bdd45110d14f5d74).
- Ранее существовавшие i18n/My Finds тесты были привязаны к строке старого cache version и не проверяли байтовое соответствие; переведены на новую schema name, дополнительный gate проверяет полную точность. Синтетический тест URL query скорректирован под допустимые `?v=`. Промежуточные CI #42107107884 и #42107399873 FAILED из-за старых regex, #42107261732 FAILED из-за второго legacy assertion; ошибки диагностированы и устранены, не скрыты.
- FINAL exact-HEAD PR #3 TEST DRAFT commit `2fb8873430d383c25a313fe2d5b6111eae1c87a7`, [GitHub Actions #42107509030](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42107509030) job 127526107808 SUCCESS; новый offline gate **6/6 PASS** и существующие admin/i18n/My Finds tests successful. NEW-009 остаётся отдельным **3/3 KNOWN RED** диагностическим тестом, общий зелёный CI не означает sync source fix.
- TEST default main, production site/main, Firebase, UID, приватные данные, тариф, ZIP и Cloud Rules не трогали. Реальный iPad iOS12/беспроводное обновление на устройстве пока НЕ протестированы. F ZIP PAUSED.
- NEXT: RUN-066.2 написать технический отчёт, зарегистрировать NEW-010 только как TEST-only READY/PENDING LIVE ACCEPTANCE, обновить Master TASK-054 и Issue #10; затем RUN-066 END.


### RUN-20261105-066.2 / НАЧАЛ / IN_PROGRESS — закрепить cache safety in master/Issue NEW-010
- Время Europe/Helsinki: 2026-11-05 22:54:40. RUN-066.1 DONE — TEST DRAFT exact SHA 2fb8873430d383c25a313fe2d5b6111eae1c87a7; offline Node tests 6/6 + Actions run #42107509030 successful.
- Документальное действие: короткий readback-отчёт с доказательством изменений и границами тестирования; append NEW-010 в мастер реестр и Issue #10 body, TASK-20261105-054, прямая ссылка на code/tests/CI. OPEN for real iOS12 acceptance and TEST branch merge; DO NOT mark live complete.
- Нельзя менять production и аккаунты/сервисы. История append-only; F ZIP остаётся PAUSED, NEW-009 sync остаётся OPEN/BLOCKED.


### RUN-20261105-066.2 / ЗАВЕРШИЛ / DONE — report, TASK-054, NEW-010 и Issue #10 обновлены
- Время Europe/Helsinki: 2026-11-05 22:56:40. Завершена документальная передача уже протестированного TEST DRAFT кода.
- [RUN-066 detailed report](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/STUDY_OFFLINE_CACHE_GUARD_RUN-20261105-066_RU.md) создан commit `de81a723b162ba830b3c0de33be52699250d1fd8`, readback подтверждён.
- MASTER [TASK-20261105-054](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/18fb66b50381b2f8f852eb86857e358a4cb6a950) + row NEW-010 сохранены и readback проверен.
- [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10) body updated; прямое `### NEW-010` содержит кодовый TEST PASS 6/6, LIVE device acceptance OPEN, и явно сохраняет NEW-009 3/3 RED. Readback Issue confirmed.
- Что НЕ сделано: физический iOS12/двухустройственный TEST, исправление NEW-009, Cloud Rules, реальное backup→restore и production release. Этапы G/H остаются OPEN.
- NEXT: завершить RUN-066 контрольной сверкой HEAD + production main и начать отдельный безопасный следующий RUN, не обходя blocked source.


### RUN-20261105-066 / ЗАВЕРШИЛ / DONE TEST OFFLINE CACHE GUARD — LIVE QA REMAINS OPEN
- Время Europe/Helsinki: 2026-11-05 22:57:20. Основная задача — улучшить безопасную готовность V3 к iOS12/offline без ZIP — завершена В ЧАСТИ КОДА/TEST-ONLY РЕГРЕССИЙ; приёмка на реальном устройстве не заявляется.
- TEST PR #3 code HEAD `2fb8873430d383c25a313fe2d5b6111eae1c87a7`, DRAFT/open unmerged; `v3-unified-preview/sw.js` content-addressed namespace `...assets-2cbae3e600bd68d3` на основании Git blob SHA 31 cached assets. Новый обязательный [test](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/tests/study-offline-cache-version.test.cjs) и workflow guard предотвращают незаметную публикацию изменённого HTML/JS/CSS/иконок с прежней версией service worker.
- Final [GitHub Actions #42107509030](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42107509030) `SUCCESS` на **точном HEAD** PR #3, 6/6 новых тестов PASS; предыдущие проверки i18n/My Finds не выключены, совместимы с контентным cache. Промежуточные failed CI объяснены и исправлены, фактический terminal green verified.
- [Отчёт](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/STUDY_OFFLINE_CACHE_GUARD_RUN-20261105-066_RU.md), MASTER TASK-054, реестр NEW-010 и основной Issue #10 body обновлены, readback успешен. Subtasks RUN-066.1/066.2 have both START+DONE.
- Final safety read: production main SHA `d29813cf409af9dc60804105ca3141f98ec12fcd` unchanged; release PR #9 and TEST PR #3 both DRAFT/unmerged. **Живой published TEST site не обновлён**, offline/cache functionality не tested physically, Firebase TEST/LIVE, users/UID, Rules, Drive, billing, ZIP untouched.
- Open blockers: NEW-009 sync refresh 3/3 known-red/source write blocked (не обходить), RUN-045 TEST Cloud Rules readback unavailable, NEW-001 independent backup restore not proven, two devices/two users/iOS12 acceptance, admin backend/monitoring not live. A–E/G–I OPEN; F ZIP PAUSED until after educational launch; no production GO.
- NEXT run: при наличии разрешённого средства целевой TEST source patch NEW-009 с 3/3 PASS и exact-head CI; иначе новый read-only actionable Cloud Rules verification through authenticated Work and actual two-device pilot; не запускать release/merge без GO. Не просить владельца устанавливать несовместимый Firebase/CLI на iPhone/старый Mac.


### RUN-20261105-067 / НАЧАЛ / IN_PROGRESS — подготовка безопасной проверки опубликованных TEST Firestore Rules при минимальном участии владельца
- Время Europe/Helsinki: 2026-11-05 22:59:55.
- Last DONE RUN-066; TEST PR #3 DRAFT HEAD 2fb8873430d383c25a313fe2d5b6111eae1c87a7, release PR #9 draft; owner Stage F ZIP PAUSED.
- Главный релизный blocker RUN-045: в GitHub есть исторические/предлагаемые Firestore Rules, но НЕТ подтверждения опубликованных правил TEST Firebase `sanastoyhteiso-v3-development` из консоли. GitHub emulators и rules-примеры не подтверждают live permissions.
- План: прочитать подготовленные инспектор/спецификации (не вмешиваться в заблокированный source NEW-009); собрать надёжную карту TEST/LIVE и точный одношаговый read-only запрос для владельца. Не просить установить Firebase plugin/CLI или Work на устройства. По возможности создать реиспользуемый безопасный чеклист для следующих чатов, чтобы пользователь прислал только опубликованные правила; с ними провести read-only сравнение (без публикации, токенов и PII).
- Запрет: никакие Firebase Console writes/deploy/admin claims/billing, никаких данных учеников, production MAIN и TEST main/Pages не меняем. Не считать cloud LIVE PASS по локальной информации. Не просить пользователя присылать credentials. Итог RUN-067 закрыть как `PREPARED/WAITING_OWNER`, а не `LIVE VERIFIED`.


### RUN-20261105-067 / ЖДЁМ ВЛАДЕЛЬЦА / WAITING_OWNER — готова проверка опубликованных TEST Rules, cloud не подтверждён
- Время Europe/Helsinki: 2026-11-05 23:04:14. RUN-067 оформлен с терминальным статусом WAITING_OWNER, а не незакрытым START. Значимый read-only GitHub аудит завершён; Firebase Console live rules не доступны из этого обычного чата.
- Фактический read-only diff: исторический owner-supplied TEST Rules blob `86ba7d0b` = T/W only, нет admin_metrics/current; NEW-003 candidate blob `a903ec37` = лишь additive admin_metrics/current, без M/P/H; NEW-006 candidate blob `d2294825` = additive admin_metrics + target `^[TMPH]`. Никакая версия не может называться deployed без Cloud readback.
- Готовый [owner handoff report](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/OWNER_TEST_FIRESTORE_RULES_READONLY_HANDOFF_RUN-20261105-067_RU.md) commit dfce63b03aa30bf05a68a35acd08f112cdd45720, file readback OK. [MASTER TASK-055](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/9d99352ed9d2c18e5b6956efa8cf437f26f0298c) appended/readback; [Issue #10 checkpoint](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10#issuecomment-6669469930) posted.
- Пользователю предложено единственное безопасное действие: в браузере Firebase Console открыть TEST `sanastoyhteiso-v3-development` → Firestore → Rules и прислать скриншот с project ID / вкладкой. Не нажимать Publish. Позже по возможности полный текст опубликованных Rules и release timestamp, без UID/email/tokens. Если пришёл только фрагмент — записывать PARTIAL VISUAL CHECK.
- **Не выполнено/не заявлять:** действующий Rules release id/SHA/timestamp, live allow/deny, два устройства, admin custom claim, real Firestore permissions, backup/restore и исправление NEW-009. RUN-045 BLOCKED. Stage F ZIP PAUSED. Production/main, TEST main, Firebase TEST/LIVE, реальные данные/тариф/аккаунты не менялись.
- **NEXT, когда владелец ответит:** новый RUN-068 с read-only сравнением присланной версии и реальных условиями доступа; не deploy / не назначать admin автоматически. Если возможности прочитать правила нет — продолжить другие TEST-only корректировки, не возвращаться к ZIP.


### RUN-20261105-068 / НАЧАЛ / IN_PROGRESS — архивировать владелец-присланный TEST Firestore Rules snapshot и подключить emulator
- Время Europe/Helsinki: 2026-11-05 23:07:15. Владелец предоставил ТЕКСТ полного Firestore Rules, 3 скриншота Firebase Console с именем Sanastoyhteiso V3 Development / default database / Rules, где в UI выбрана верхняя запись истории «Today · 3:03 AM» (часовой пояс/точный server release revision/API ruleset ID не подтверждены).
- По чтению текста из текущего сообщения: правила содержат `match /admin_metrics/{metricId}` (get current только verified, boolean admin, Google provider) и `collection_set` с T[digits]/W_... без M/P/H. Совпадают по структуре/ключевым блокам с FULL_FOR_MANUAL_REVIEW.rules TEST candidate blob a903ec37fb2c80e65bac71bd24ca15b11b782bc2; не утверждать побайтовую сверку с облачным API.
- Требование владельца: СОХРАНИТЬ полученную редакцию, чтобы в следующих чатах её можно было тестировать без повторного входа на Firebase site. Приоритет: отдельный snapshot политики и изолированный emulator на synthetic users, коммит + точный CI/дата/URL, журнал и TASK/Issue.
- ПЛАН: новая защищённая документацией snapshot .rules копия на TEST PR #3 DRAFT, только из прочитанного GitHub candidate соответствующего присланному коду, с прозрачной provenance owner-supplied/not independent API, не переписывая старые fixtures/candidates; тесты на owner-only/admin, T allowed vs M/P/H denied; CI exact-HEAD, отчёт, MASTER TASK-056/Issue #10 и терминальное RUN-068 END. Не менять live Firebase TEST/LIVE, Rules deploy, admin claim, users, PROD main/TEST main, ZIP.
- Соответствие текста snapshot опубликованному облачному ресурсу подтверждается владельцем+визуальным контекстом; API release name/timestamp, аппаратные tests и runtime allow/deny по-прежнему не доказаны. Не выдавать emulated green за live cloud PASS.


### RUN-20261105-068.1 / НАЧАЛ / IN_PROGRESS — подключить заархивированные OWNER TEST Rules к emulator
- Время Europe/Helsinki: 2026-11-05 23:08:06.
- TEST PR #3 snapshot `admin/security-tests/snapshots/owner-console-rules-20261105.rules` записан, проверено: blob SHA a903ec37fb2c80e65bac71bd24ca15b11b782bc2 совпадает с existing FULL_FOR_MANUAL_REVIEW candidate, 284 строки и тот же текст.
- План: заменить emulator `afterEnv` источник с кандидата на сохранённый snapshot (без его изменения), добавить byte-identical assertion к candidate и отдельные разрешения T/запрет M,P,H в synthetic emulator; Actions на точном HEAD. Это не реальный live request и не deploy; production/Firebase не менять.


### RUN-20261105-068.1 / ЗАВЕРШИЛ / DONE — сохранённые TEST Rules проверены эмулятором 108/108
- Время Europe/Helsinki: 2026-11-05 23:13:03. **TEST PR #3 DRAFT only; не deployed.**
- Сохранён TEST snapshot `admin/security-tests/snapshots/owner-console-rules-20261105.rules` напрямую из ранее проверенного owner-text matching candidate, [commit e54efd8](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/e54efd86adfdb19c7d3f34c9462d6f993b643476). Readback blob `a903ec37fb2c80e65bac71bd24ca15b11b782bc2` IDENTICAL source candidate blob. Заархивирован source-policy-only (никаких изображений с UID, логинов или личных данных), [provenance README commit 0e1c0c5](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/0e1c0c568bf640f46aeb11d9da9049b82dd2ebc6).
- Emulator suite `admin/security-tests/security.user-supplied.test.cjs` теперь считывает архив вместо передвижного candidate и требует точного совпадения; новые проверки проверяют T allowed, M/P/H denied, cross-UID denied, старые admin permit/deny. Тестовый файл [fixed commit d82a457](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/d82a457d49f2d47583956452b730f4f41064c248).
- ПРОМЕЖУТОЧНЫЙ CI #42109909237 FAILED из-за ошибочного внедрения `$'` replacement expansion в JS test fixture (не Firebase policy). Тест восстановлен из предыдущего чистого Git blob и заменён callback вместо строковой вставки. После исправления предварительная V8 syntax check и GitHub readback OK. Не скрывать промежуточный failed CI.
- FINAL exact TEST PR #3 HEAD `d82a457d49f2d47583956452b730f4f41064c248`: [Rules emulator Actions #42110368136](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42110368136) **SUCCESS 108/108 PASS, 0 FAIL**, specific archive tests #106/#107 PASS. [Admin regression Actions #42110368137](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42110368137) **SUCCESS**. Archive non-deployable; no external Firestore/Google requests.
- Доказательство from owner: 3 screenshots correct TEST project, Firestore Rules tab, highlighted top version `Today · 3:03 AM`; owner supplied full code in chat. **НЕ API cloud GET**: не известны точный ruleset ID/server UTC metadata; после изменения live rules snapshot требует обновления. Текст содержит T/W-only (NEW-006 TMPH update STILL NOT deployed/confirmed), admin_metrics/current only get with verified admin==true Google (real admin claim NOT verified).
- No Firebase changes (TEST/LIVE), no TEST main/Pages, no production, accounts/UID, private Sheets, billing or ZIP. BUG NEW-009 3/3 known red remains separate and unresolved. Следующий subtask RUN-068.2: MASTER TASK-056 / Issue #10 / short report, затем RUN-068 END.


### RUN-20261105-068.2 / НАЧАЛ / IN_PROGRESS — итоговый отчёт OWNER TEST Rules snapshot, TASK-056 и Issue #10
- Время Europe/Helsinki: 2026-11-05 23:13:20. Archive source verified blob a903ec37..., 108/108 TEST emulator PASS exact PR #3 HEAD d82a457d..., 0 FAIL; admin regression workflow successful. 3 owner screenshots + full pasted rules compared with existing candidate and preserved as stable snapshot.
- План только документации в release DRAFT + issue #10: создать технический отчёт, добавить TASK-20261105-056 и update checkpoint, не закрывать Cloud live allow/deny, NEW-006, NEW-009 or G/H/I. User has requested future autonomous testing without Firebase Console; return durable snapshot link. No production/TEST site deploy, roles, database, UID/Sheets/billing modifications.


### RUN-20261105-068.2 / ЗАВЕРШИЛ / DONE — report, TASK-056, Issue #10 recorded
- Время Europe/Helsinki: 2026-11-05 23:15:56. [Технический отчёт RUN-068](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/OWNER_TEST_FIRESTORE_RULES_SNAPSHOT_RUN-20261105-068_RU.md) commit `8f2ae81c71d4ff0c8b9e4b2c7c87089545ba9cdf`, readback OK.
- MASTER TASK-20261105-056 append-only updated commit `447adaa9a7738ee2d5304c2d9a3a173083913367`, readback OK; [Issue #10 comment](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10#issuecomment-6669748838) saved. All links to TEST archived policy / 108/108 PASS / exact HEAD there.
- Cloud-test limits explicit: owner-supplied selected Rules text and screenshots, not independent Google Rules release API read; 108 PASS only isolated emulator; admin claim and live two-user allow/deny remain unverified. NEW-006 M/P/H not enabled by this current T/W-only snapshot; NEW-009 sync 3/3 known red; F ZIP paused.
- NEXT: final safety read PR/main, END RUN-068 with no dangling START.


### RUN-20261105-068.2 / ЗАВЕРШИЛ / DONE — owner snapshot report, TASK-056, Issue #10
- Время: 2026-11-05 23:17:05. Создан подробный [`docs/OWNER_TEST_FIRESTORE_RULES_SNAPSHOT_RUN-20261105-068_RU.md`](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/OWNER_TEST_FIRESTORE_RULES_SNAPSHOT_RUN-20261105-068_RU.md), commit `8f2ae81c71d4ff0c8b9e4b2c7c87089545ba9cdf`, readback checked.
- MASTER TASK-20261105-056 обновлён [commit 447adaa](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/447adaa9a7738ee2d5304c2d9a3a173083913367), readback успешен.
- Issue #10 body appended RUN-068 with evidence URL, immutable snapshot, exact CI 108/108, outstanding NEW-006 and NEW-009; readback verified.
- Не созданы новые Cloud Rules/role changes; продолжение переносится в новый RUN. A–E/G–I OPEN, F ZIP PAUSED, no production GO.


### RUN-20261105-068 / ЗАВЕРШИЛ / DONE — сохранённый Rules snapshot + 108/108 emulator PASS, cloud pilot OPEN
- Время: 2026-11-05 23:17:27. Owner-provided TEST Firebase current rules text with 3 project/context screenshots archived as isolated policy snapshot `admin/security-tests/snapshots/owner-console-rules-20261105.rules` TEST PR #3; blob SHA a903ec37fb2c80e65bac71bd24ca15b11b782bc2 exactly matches reviewed TEST candidate, no PII/screenshots committed. Provenance README available.
- Emulator code now loads saved archive and tests current T-only vs pending M/P/H and admin/owner isolation. TEST PR #3 exact CI HEAD `d82a457d49f2d47583956452b730f4f41064c248` [rules 108/108 PASS](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42110368136), [admin PASS](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42110368137). First failed CI from JS generated source corrected; source snapshot untouched.
- MAIN reporting: [RUN-068 report](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/OWNER_TEST_FIRESTORE_RULES_SNAPSHOT_RUN-20261105-068_RU.md), MASTER TASK-056, Issue #10 all updated/readback. Status of project only OFFLINE CODE+EMULATOR PASS; owner screenshot not full independent Cloud API proof, exact publication metadata and runtime allow/deny not verified. NEW-006, NEW-009, backup/restore, two devices OPEN. Stage F ZIP PAUSED.
- No production/main, TEST main, Firebase live/test, account, UID, Sheets or billing changes. Project has safe repeatable emulator snapshot without requiring further Console access unless Rules change. NEXT RUN: productive TEST-only prelaunch task, avoid source-write tool block and any unsupported live claims.


### RUN-20261105-069 / НАЧАЛ / IN_PROGRESS — независимый аудит учебного recovery и синхронизации после архива Rules
- Время Europe/Helsinki: 2026-11-05 23:18:28. RUN-068 DONE: saved TEST owner Rules 284 lines/108 emulator PASS, no live mutations. TEST PR #3 DRAFT head d82a457d49f2d47583956452b730f4f41064c248 (verify concurrent before writes).
- Приоритет: безопасный учебный сайт, офлайн-сохранение и автоматическая синхронизация Firestore на старом Safari. ZIP Stage F PAUSED. Известный NEW-009 `v3-sync-release.js` остаётся security/tool write BLOCKED, **не редактировать его или обойти другим инструментом**.
- План: read-only осмотреть `home-refresh.js`, `family.js`, V3 sync adapter/queue, CI и demo tests на независимые реальные defects; при подтверждении предложить минимальный TEST DRAFT патч только в НЕ-заблокированном/НЕ-equivalent модуле, если он не обходит проблему NEW-009 и не меняет доступ/пользовательские данные. Если потенциально затронет `refresh`/safety — ограничиться отдельным диагностическим regression, не менять live behavior; подтверждать exact-head CI, затем MASTER TASK-057/Issue10 и закрыть RUN.
- Запрет: Firebase/Auth/Cloud Rules/backup live/admin role/UID, production or TEST default main merge/deploy, private contents and ZIP workflows. No live SUCCESS claims from mock tests.


### RUN-20261105-069.1 / НАЧАЛ / IN_PROGRESS — handoff TEST-only NEW-006 exact single-expression change, резервные Sheets metadata
- Время Europe/Helsinki: 2026-11-05 23:23:41. Audit read-only: source `home-refresh.js` invokes RS_COMM.sync(), which in `community.js` delegates early to `RS_V3_RELEASE.refresh()` when V3 active; no independent Drive-overwrite bug proved. Поэтому НЕ менять эти исходники.
- Read-only Google Drive search identified four historical native Sheets: 01.11.2026 pre-Community backup, 02.11.2026 pre-migration MASTER, Riveria Sanasto original, Private v2. No cell values/UID read or copied. 13 tabs incl RS_Progress, RS_UserWords, RS_Favorites, Mediatori in first three; Private v2 has Events/About. This establishes old backups only; V3 Firestore independent Sheets readback/restore remains NEW-001 OPEN.
- Owner-supplied saved TEST Rules blob a903ec37 and tested NEW-006 draft candidate d2294825 differ byte-for-byte by **exactly ONE** replacement `^T[0-9]{5,7}$` → `^[TMPH][0-9]{5,7}$` for `collection_set`. isAdmin, other ACL, default deny unchanged; new candidate existing TEST PR #3 DRAFT, not deployed. 108/108 CI includes synthetic before/after tests.
- Subtask: create durable proposal/read-only preflight/manual TEST-only publish+rollback guidance for OWNER DECISION, no owner action until explicit approval. Report MASTER TASK-057 and Issue #10, then END. No Firebase mutation, user data, ZIP, or blocked NEW-009 source modification.


### RUN-20261105-069.1 / ЗАВЕРШИЛ / DONE — single-expression TEST Rules preflight + backup metadata read-only
- Время Europe/Helsinki: 2026-11-05 23:26:15. Создан owner-ready [TEST NEW006 preflight/rollback report](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/TEST_NEW006_RULES_OWNER_GO_ROLLBACK_RUN-20261105-069_RU.md), commit `4726e0a38605a423c52d4e37a55dda30aa29378b`; GitHub readback validated.
- MASTER TASK-20261105-057 [commit 3323b3e](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/3323b3e4937fbd9acc66d8f095c168c8fa2f7e69) and Issue #10 checkpoint updated/readback. Exact 1-expression diff from owner snapshot to NEW-006 candidate verified via authenticated GitHub connector.
- Read-only Drive metadata for 4 historic Sheets confirms preexisting library/progress structure; not V3 auto-backup. No student cell values, UID, cloud code mutations or owner action yet.
- No production/TEST main merge/deploy, no Firebase Rules publish, no admin grants. NEW-006 needs explicit owner GO and actual Cloud QA; NEW-009 source still blocked/known RED. Next close RUN-069 MAIN or continue safe independent development as new RUN.


### RUN-20261105-069 / ЗАВЕРШИЛ / DONE READ-ONLY — TEST NEW-006 one-line owner preflight and backup evidence
- Время Europe/Helsinki: 2026-11-05 23:27:15. Не найдено нового независимого Drive-overwrite бага: `RS_COMM.sync` делегирует V3. Никаких неоснованных исходных правок. Не обходили заблокированный `v3-sync-release.js` / NEW-009.
- Connected Drive read-only metadata: 4 historical own Sheets with old dictionaries/progress, not verified independent V3 Firestore backup; no content, UID, personal data or file writes. NEW-001 OPEN.
- Current owner-provided TEST Rules archived blob a903ec3 vs NEW-006 candidate d2294825 differ in exactly one expression T→TMPH, all other rules unchanged. Existing TEST emulator 108/108 PASS on exact SHA d82a457d; candidate **NOT deployed**. Prepared [manual preflight+rollback](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/TEST_NEW006_RULES_OWNER_GO_ROLLBACK_RUN-20261105-069_RU.md), MASTER TASK-057, Issue #10. All readback verified.
- Remaining owner hinge: require explicit authorization to publish test-only NEW-006 Rules (no live changes) and check currently published rules against archive again immediately before publish. Ideally via authorized Work browser or careful browser editor; current chat cannot itself access authenticated cloud console. Do NOT ask to install Firebase CLI/app on iPhone/Mac.
- No production GO; TEST PR #3 DRAFT, LIVE Firebase/UID/TEST users/tariff/backup unchanged, ZIP Stage F PAUSED. NEW-009 fail-closed source fix / real two-device pilot / backup→restore remain blockers. NEXT RUN select another independent TEST-only release gate or owner-authorized isolated Cloud pilot.


### RUN-20261105-070 / НАЧАЛ / IN_PROGRESS — обязательный релизный fail-closed gate NEW-009 в DRAFT PR #9
- Время Europe/Helsinki: 2026-11-05 23:29:07. Сверены release PR #9 `.github/workflows/release-v3-preflight.yml` и `v3-sync-release.js` в DRAFT branch. Последний содержит BUG NEW-009: `engine.upload().catch(function(){return null;})`, `queued` непрозрачно подавляет применённый snapshot и затем выводится ложное «Данные V3 сверены с облаком». TEST PR #3 содержит isolated runtime regression 3/3 KNOWN RED (source edit был заблокирован, нельзя обходить).
- План (TEST/DRAFT release branch only): импортировать/адаптировать в `release-checks/` изолированные synthetic acceptance assertions из TEST known-red harness, без реальной Firebase и без исправления `v3-sync-release.js`. Добавить НОВОЕ отдельное CI job `sync-failclosed-release-gate` в existing release preflight workflow, чтобы **релизное CI было красным пока NEW-009 RED**, а остальные проверки запускались параллельно. Не заявлять RED как случайный регресс, не обманывать статус PASS.
- Для валидированного результата: exact-head GitHub Actions run; тесты должны FAIL воспроизведением именно 3 инвариантов, job failure ожидаем, в журнале явно `EXPECTED NO-GO` и только после допуска source fix/correctness может быть зелёным. Если unexpected failure — отметить отдельно.
- Запрет: source `v3-sync-release.js` не редактировать/обходить, никакой prod/TEST main, Cloud Firebase, real data, app deployment, ZIP stage F. После тестов master TASK-058, Issue10, RUN START→END.


### RUN-20261105-070 / ЗАВЕРШИЛ / DONE RELEASE GUARD — NEW-009 EXPECTED RED 3/3, NO-GO
- Время Europe/Helsinki: 2026-11-05 23:34:22. Created `release-checks/v3-refresh-failclosed.test.cjs` in release DRAFT PR #9 and added separate mandatory `sync-failclosed-release-gate` job to `.github/workflows/release-v3-preflight.yml`. **Source `v3-sync-release.js` not edited**; source blob f897a82a8e6bc87e329db317d7265526a13d4a4d remains buggy/blocked.
- First [CI #42113198694](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42113198694) had test-only ENOENT relative path, fixed in test commit 70222cec3ec7053e66fed004b8e22af744194355. Final [CI #42113363021](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42113363021) exact tested code HEAD 70222cec **EXPECTED overall FAILURE**: new gate 3/3 KNOWN RED; independent `release-preflight` SUCCESS; independent `firestore-v3-rules-emulator` SUCCESS. No surprise failure; no misreported green.
- CI gate validates failed outgoing upload must not claim cloud saved; pending IndexedDB queue cannot claim saved; successful refresh must apply new state. All three FAIL as expected on current unmodified bug; must become 3/3 PASS **after permitted fix**. Gate is meaningful but branch-protection required status not independently verified, manual merge owner GO still mandatory.
- [Report](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/NEW009_FAILCLOSED_RELEASE_GATE_RUN-20261105-070_RU.md), MASTER TASK-058, Issue #10 checkpoint saved/readback. Report commit 92b2cc3b3d8bd3689f00aa8f4d098856b364dd29; master commit 2751fb0237de376d5fb854c9f92c57db4fbfd37d.
- DRAFT release PR #9, no merge; prod main, TEST main/Pages, Firebase TEST/LIVE, user UID, independent backup/Sheets, billing, ZIP untouched. NEW-009 source still BLOCKED; NEW-006 TEST Rules require owner GO; NEW-001 real backup/restore/2 devices/iOS12 unverified; first-release NO-GO. No background or asynchronous work promised.


### RUN-20261106-071 / НАЧАЛ / IN_PROGRESS — owner GO TEST Rules NEW-006; handoff to authorized browser
- Время: 2026-11-06 Europe/Helsinki (локально около 05:15). Владелец ответил «Разрешаю» на точный вопрос публикации NEW-006 **только TEST Firebase** `sanastoyhteiso-v3-development`. Данное одобрение НЕ распространяется на production Firebase `riveria-sanasto-community-test`, Production/GitHub merge, выдачу admin claims, тариф, миграцию или чтение ученических данных.
- Read-only GH preflight 2026-11-06: owner-provided archived full Rules blob a903ec37fb2c80e65bac71bd24ca15b11b782bc2; proposed TEST NEW-006 blob d2294825680bf0fce0f391456d475040c69732d9 — **единственная** замена target pattern T → TMPH, все прочие ACL unchanged. TEST PR #3 DRAFT head d82a457d49f2d47583956452b730f4f41064c248, release PR #9 DRAFT head de949bddc7f4ea7792d9678356174cbf7d84afd4; PROD main d29813cf409af9dc60804105ca3141f98ec12fcd untouched.
- Cloud limitations: this chat has GitHub/Google Drive connectors, but NO authenticated Firebase cloud browser/action; Firebase plugin uninstalled, already repeatedly suggested recently and dismissed, do not resuggest or request installation on old Mac/iPhone. **Cannot execute real Firebase Rules publish here.** Must not claim live modified. Prepare concise authorized Work browser runbook, preflight, rollback and success criteria for owner; if Work unavailable, give minimal direct Firebase UI steps. Avoid unauthorized alternative GitHub Actions auto-deploy or credentials.
- Before publishing, authorized cloud operator must compare FULL currently published Cloud Rules source with saved snapshot and verify exact TEST project. On mismatch STOP before publication, preserve new state. Once verified, perform exact ONE expression change, Publish on TEST, reload and readback, collect release/version/time, synthetic account-safe checks only if possible. Close RUN with truthful WAITING_OWNER_ACTION status, retain blockers NEW-009/NEW-001/two-device/iOS12 and NO PRODUCTION GO.


### RUN-20261106-071 / ЗАВЕРШИЛ / WAITING_AUTHORIZED_BROWSER — owner TEST GO, Firebase not published
- Date Europe/Helsinki 2026-11-06. User explicitly approved only TEST `sanastoyhteiso-v3-development` NEW-006 `collection_set` expansion T→TMPH. No second approval necessary for that exact change; no implied PROD/Auth/admin/tariff rights.
- Preflight source verified exact: archived user-provided Rules blob a903ec37fb2c80e65bac71bd24ca15b11b782bc2 vs ready candidate blob d2294825680bf0fce0f391456d475040c69732d9 differ at exactly one expression, preserving `own(uid)`, `isAdmin()`, unknown-path deny. TEST PR #3 DRAFT head d82a457..., release PR #9 DRAFT head de949bdd..., production main same `d29813cf...`. Existing TEST emulator 108/108 PASS for candidates but NOT cloud write/readback.
- **Actual Cloud execution unavailable here:** no authenticated Firebase console/cloud browser or deployed action; official Firebase plugin absent/not installed and already dismissed recently, no repeated install suggestion. Firebase Cloud Rules **NOT changed or published**, no false success claim.
- Created [WORK RUN-071 owner-approved browser runbook](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/WORK_RUN_071_TEST_RULES_NEW006_OWNER_APPROVED_RU.md) commit 84c7a01403e2520836cae0115122ac94226b3302, readback verified. Authorised Work browser should verify TEST project and FULL current rules match archived snapshot, only then publish exact candidate, capture published version/time/readback, otherwise STOP safely. No CLI on user's Mac/iPhone. Alternatives: user can manually apply one expression via TEST browser if Work inaccessible, with before/after screenshot and careful readback.
- MASTER TASK-20261106-059 updated commit ecbb0ed03e9e2f49f6e17064041e86085204f3d9; Issue #10 body appended and readback verified. This run has START + terminal WAITING_AUTHORIZED_BROWSER, not dangling IN_PROGRESS.
- Still BLOCKED / NO GO for launch: NEW-009 failclosed release gate 3/3 RED, NEW-001 real backup→restore, physical devices/2 users/iOS12 and live permissions. No production/test main/Pages, Firebase TEST/LIVE, UID or billing changes, ZIP F PAUSED.


### RUN-20261106-071-CLOUD / НАЧАЛ / IN_PROGRESS — авторизованный Work: TEST Rules NEW-006
- Время Europe/Helsinki: 2026-11-06 05:22:14. Получено явное задание владельца на один TEST-only publish; ранее данное разрешение «Разрешаю» подтверждено. Повторное согласование того же scope не требуется.
- Прочитан RUN-071 runbook. Через GitHub сверены архивный snapshot blob `a903ec37fb2c80e65bac71bd24ca15b11b782bc2` и candidate blob `d2294825680bf0fce0f391456d475040c69732d9`: точное единственное изменение `^T[0-9]{5,7}$` → `^[TMPH][0-9]{5,7}$` в collection_set.
- Далее: только авторизованный облачный браузер → `sanastoyhteiso-v3-development`, Firestore `(default)`, Rules; full published source compare. При любом расхождении с snapshot STOP без публикации. После точного preflight — одна публикация candidate и независимый readback/time, по возможности synthetic Rules Playground.
- Рабочий Firebase `riveria-sanasto-community-test`, production/main, данные, Authentication/roles, тариф и NEW-009 source вне scope. Пользовательские UID/email/token в журнал не сохранять.


### RUN-20261106-071-CLOUD / ЗАБЛОКИРОВАНО / BLOCKED_BROWSER_AUTO_REVIEW — preflight PASS, TEST publish не выполнен
- Время Europe/Helsinki: 2026-11-06 05:30:42. **Публикация НЕТ**; кнопка Publish не нажималась.
- Авторизация Google успешно завершена владельцем через защищённую форму Work. Console показала проект **sanastoyhteiso-v3-development**, Firestore **(default)**, Rules. Ссылка: https://console.firebase.google.com/project/sanastoyhteiso-v3-development/firestore/databases/-default-/security/rules . Рабочий проект не открывался для изменений.
- Активная опубликованная редакция помечена звездой: **Yesterday • 3:03 AM** (на странице 06.11.2026); уникальный release/ruleset ID интерфейсом не получен. Полный исходник скопирован из редактора через Select All/Copy: **12918 символов, 283 строки**, без конечного LF. Git blob полученной строки `14294de390ae282f07bdd70852c1db8783b32cea`; после добавления только финального LF — `a903ec37fb2c80e65bac71bd24ca15b11b782bc2`, точное совпадение с архивом. Других расхождений нет.
- Ровно одно вхождение `^T[0-9]{5,7}$`. Локально подготовленная замена на `^[TMPH][0-9]{5,7}$` с конечным LF даёт Git blob `d2294825680bf0fce0f391456d475040c69732d9`, точно совпадающий с согласованным candidate.
- **BLOCKED_BROWSER_AUTO_REVIEW:** попытка вставить проверенный candidate в существующий редактор отвергнута автоматической проверкой Work до Publish. Причина проверки: повторный доступ к уже открытой Firebase Console может нарушить несохранённое состояние редактора Rules. Это отказ автоматической проверки, НЕ отказ владельца и НЕ ошибка пароля/Firebase. Последующая read-only проверка состояния также отклонена origin gate; наличие/отсутствие draft после отказа независимо не подтверждено. Обходы не предпринимались.
- Cloud after-publish readback/version и Rules Playground **не выполнены**. Не ставить TEST PUBLISHED, NEW-006 CLOSED или two-account PASS. Пользователь 06.11 попросил дать управление браузером; готовится ручная передача существующей страницы. Следующее продолжение: проверить состояние редактора, снять/разрешить блокировку доступа Work; затем повторить read-only preflight и одну согласованную публикацию с readback.
- Данные, UID, Authentication/admin roles, тариф, production/main, сайты и NEW-009 source не изменялись; исходный archive сохранён. NEW-009/backup→restore/real two-device/iOS12 остаются отдельными открытыми задачами.


### RUN-20261106-071-CLOUD.2 / НАЧАЛ / IN_PROGRESS — продолжение в открытом редакторе после подтверждения владельца
- Время Europe/Helsinki: 2026-11-06 05:37:05. Владелец явно разрешил: «Разрешаю продолжить в открытом редакторе», затем «Разрешаю, продолжай». Доступ Work к существующей вкладке восстановлен; вкладка/проект не менялись.
- Повторно прочитаны snapshot blob `a903ec37fb2c80e65bac71bd24ca15b11b782bc2` и согласованный candidate blob `d2294825680bf0fce0f391456d475040c69732d9`. Повторный full source preflight перед единственной разрешённой TEST-only заменой T→TMPH обязателен.
- В Console подтверждены `sanastoyhteiso-v3-development`, Firestore `(default)`, Rules, активная редакция `Yesterday • 3:03 AM`; несохранённый draft интерфейс не показывает. Далее точное сравнение содержимого, вставка одного согласованного candidate, Publish, полный readback и по возможности synthetic Rules Playground. Production/данные/Auth/роли/тариф/NEW-009 вне scope.


### RUN-20261106-071-CLOUD.2 / ПРЕРВАНО / REPORTED_PUBLISHED_AWAITING_READBACK — Work лимит исчерпан, owner screenshot
- Контекст: 2026-11-06, пользователь прислал скриншот Work около 05:50 Europe/Helsinki: Work написал «Публикация уже подтверждена; осталось закончить проверки разрешения и отказа в симуляторе и закрыть запись в журнале», далее «Проверки прошли: собственные находки T, M, P и H разрешены, запрос от другого вымышленного пользователя отклонён. Сохраняю результаты и закрываю RUN-071 в журнале, мастер-плане и Issue №10». Скриншот показывает сообщение Work, но не отдельную опубликованную версию/полный ruleset/readback.
- После этого владелец сообщил, что лимит Work закончился, и попросил продолжить в обычном чате. Проверка GitHub через подключение: перед этим добавлен только START `RUN-20261106-071-CLOUD.2` в журнал; END/проверка после публикации в GitHub ещё НЕ записаны, MASTER/Issue также содержат лишь предыдущий BLOCKED_BROWSER_AUTO_REVIEW.
- Статус: **OWNER SCREENSHOT: WORK REPORTS PUBLISHED + SIMULATOR PERMISSION/REJECTION PASSED; INDEPENDENT POST-PUBLISH CONSOLE READBACK NOT AVAILABLE**. НЕЛЬЗЯ делать повторный Publish или считать release id/version и полный Cloud rules source верифицированными. Не помечать NEW-006 как independently VERIFIED, не утверждать live двухпользовательскую проверку: Work описал симуляцию с вымышленными пользователями. На момент последнего GitHub-снимка direct Cloud evidence отсутствует.
- Полная архивная базовая TEST политика: `admin/security-tests/snapshots/owner-console-rules-20261105.rules` Git blob a903ec37fb2c80e65bac71bd24ca15b11b782bc2; согласованный NEW-006 candidate: `admin/security-tests/candidates/FIRESTORE_V3_DEVELOPMENT_NEW006_FINDS_TMPH_REVIEW_ONLY.rules` Git blob d2294825680bf0fce0f391456d475040c69732d9; ровно одна замена `^T[0-9]{5,7}$` → `^[TMPH][0-9]{5,7}$` для collection_set, все другие ACL сохраняются.
- Пользователю требуется только READ-ONLY подтверждение из Safari на телефоне, после открытия `https://console.firebase.google.com/project/sanastoyhteiso-v3-development/firestore/databases/-default-/security/rules`: выбрать активную отмеченную звездой последнюю редакцию, убедиться, что в ней есть `^[TMPH][0-9]{5,7}$`, и прислать скрин с номером/временем публикации и соответствующей строкой кода. Никаких кнопок `Publish`, `Save`, повторного копирования полного кода или переключений на LIVE. Если опубликованного TMPH нет — **STOP**, не пытаться публиковать повторно без сверки текущего состояния.
- Остальное без изменений: production Firebase riveria-sanasto-community-test, production main, TEST repo main/Pages, user records/claims/billing, F ZIP PAUSED. NEW-009 known-red release NO-GO; NEW-001 real independent backup→restore and physical 2-devices/iOS12 acceptance remain OPEN.
- С этой записью Work START закрыт как **INTERRUPTED/NEEDS_EVIDENCE**, а не фиктивный DONE. Следующий RUN с доказательством опубликованной версии/real Cloud checks должен отдельно обновить MASTER Issue #10 и не повторять действие Publish вслепую.


### RUN-20261106-071-CLOUD.2 / ДОПОЛНЕНИЕ К СВИДЕТЕЛЬСТВАМ — пять скриншотов Work, readback still pending
- Владелец предоставил дополнительные **5 последовательных скриншотов интерфейса ChatGPT Work** с отметками около 05:49–05:50 Europe/Helsinki. Не размещать исходные изображения в GitHub: на кадрах облачной консоли может присутствовать внутренняя информация.
- Скриншоты показывают в Work сообщения о продолжении проверки после объявленной публикации, отдельно «проверяю разрешение собственной находки M», «проверяю находки P и H отдельными симуляциями», «проверяю отказ при доступе чужого пользователя». На встроенном снимке консоли в правой части видна в тексте правил строка с шаблоном `^[TMPH]` (разрешающее условие); однако сама иллюстрация не показывает в читаемом масштабе release ID и timestamp активной опубликованной версии.
- Итоговое сообщение Work на скриншоте: «Проверки прошли: собственные находки T, M, P и H разрешены, запрос от другого вымышленного пользователя отклонён. Сохраняю результаты и закрываю RUN-071...». Это **отчёт Work о Rules Playground / synthetic authorization**, не реальные два клиентских аккаунта и не независимый readback cloud release.
- Status unchanged: **WORK REPORTED PUBLISHED + SIMULATOR PASSED; INDEPENDENT ACTIVE RULESET READBACK STILL PENDING**. Не нажимать Publish повторно. Для завершения достаточно свежего READ-ONLY скриншота вкладки Firestore Rules правильного TEST проекта, где видны активная starred revision/time и строка `^[TMPH][0-9]{5,7}$`. Production не затронут; NEW-009 остаётся отдельным блокером.
