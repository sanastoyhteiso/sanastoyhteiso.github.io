# Sanastoyhteisö 3.0 — WORK RUN-079: довести первый учебный выпуск до проверенного GO

**06.11.2026 Europe/Helsinki. Режим:** существующий проект; не начинать сначала. **Публикация сейчас запрещена (NO-GO):** NEW-009 3/3 FAILED. ZIP отложен до после первого релиза согласно RUN-065/076. Владелец не просил ремонтировать старый production login.

## Текущая точка (проверено по GitHub)

- Основной сайт https://sanastoyhteiso.github.io/ и main commit `d29813cf409af9dc60804105ca3141f98ec12fcd` неизменны. Не делать аварийный hotfix старой страницы и не очищать данные пользователей.
- TEST черновик: https://github.com/velardream-ctrl/riveria-sanasto-community-test/pull/3, branch `feat/admin-control-center-package-spec-20261104`, проверенный HEAD `5e179d2f688f2fceb4a0a87cc0307b680df199ad` (recheck).
- RELEASE черновик: https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/9, branch `release/v3-safe-integration-20261104`. Последний проверенный **code head** `c3014432175c36e218b1615d65d1e3bbde51d731`; позже добавлены документы и журнал; recheck actual HEAD.
- [RUN-077/078 отчёт](./V3_LOGIN_AND_SHADOW_RUN-20261106-077-078_RU.md): 9 синтетических login tests, NEW-012 shadow M/P/H исправлен, RELEASE CI [#42197858213](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42197858213) два jobs SUCCESS, `sync-failclosed-release-gate` FAILED 3/3 из-за старой ошибки.
- [RUN-075 кандидат минимальной исправляющей функции](./NEW009_FIX_REVIEW_RUN-20261106-075_RU.md), синтетическая модель повторно проверена **8/8**, но source JS не менялся; реальные CI 3/3 всё ещё RED.
- TEST Firestore `sanastoyhteiso-v3-development`, production Firebase `riveria-sanasto-community-test`. **Никогда не перепутать.** TEST Rules NEW-006 owner-approved TMPH проверены по присланному исходнику RUN-072, однако действующий ruleset version/publish readback и allow/deny live tests не подтверждены.
- Независимый Firestore → private Sheets backup/readback/restore и два физических устройства (iOS12) ещё не доказаны.

## Порядок выполнения автономным ChatGPT Work с авторизованным облачным браузером

**A. NEW-009 — заблокированный source file**

1. Перед действием в append-only журнале [WORK_ACTIVITY_LOG](./WORK_ACTIVITY_LOG_2026-11-04_RU.md) записать `НАЧАЛ` с собственным новым RUN-ID (например, RUN-080; номер подтвердить по актуальному журналу), branch, SHA и expected diff.
2. Использовать **только разрешённый редактор** оригинального PR №3. В прошлых сеансах автоматическая проверка заблокировала изменение `v3-unified-preview/v3-sync-release.js`: **не обходить** отказ через альтернативный клиент/путь/branch/PR/action. Если снова отказано — записать BLOCKED_SOURCE_EDITOR и STOP исходный write, но выполнять независимые read-only и тестовые задачи.
3. При разрешённом редактировании перед записью сверить Git blob source `39ef392d1c45f2c36a9ec2a9528fd34affdb5b9a` и найти ровно одну старую `function refresh()`. Если текущее содержание изменилось — НЕ перезаписывать, а сравнить и перепроверить.
4. Применить только проверенную логическую замену из RUN-075: не подавлять `engine.upload()` отказ, запретить cloud OK при `pending`, дождаться cleanup своей `orderly` очереди до `apply()`, проверять `apply` результат и прежнего UID/epoch; не затирать конкурентные локальные изменения. Никаких изменений Firebase, cloud data и других users.
5. Запустить `V3_SYNC_ASSERT_FIXED=1 node --test admin/tests/v3-sync-refresh-failclosed-gate.test.cjs` в отдельном разрешённом executor для TEST и все существующие TEST smoke, offline cache, emulator. Включить fail-closed тест в обязательный TEST CI после подтверждённого исправления — не считать skip зелёным. Обновить fingerprint SW и query после разрешённого изменённого файла. Дождаться точного HEAD GitHub Actions PASS.
6. Только после TEST прохода аналогично исправить RELEASE `v3-sync-release.js` в PR №9 при отдельном разрешённом editor, начиная с сверки blob `f897a82a8e6bc87e329db317d7265526a13d4a4d`. Выполнить `node --test release-checks/v3-refresh-failclosed.test.cjs` **3/3 PASS** + все release preflight/rules emulator jobs PASS exact HEAD. Не удалять, не скипать и не превращать gate в always-success.

**B. Подтверждение живого TEST**

7. Авторизованный браузер: проверить Cloud Firestore Rules в project `sanastoyhteiso-v3-development`: published full source/version/timestamp, M/P/H собственных коллекций и отказ чужого UID. Не публиковать новых правил без отдельного точного сравнения и разрешения; старый owner-approved single-expression NEW-006 описан [WORK RUN-071](./WORK_RUN_071_TEST_RULES_NEW006_OWNER_APPROVED_RU.md). Не менять production Firebase.
8. TEST preview в реальном браузере/на двух устройствах: `https://velardream-ctrl.github.io/riveria-sanasto-community-test/v3-unified-preview/`. Проверить вход Google (включая отказ/повтор), разные аккаунты, личные слова T/M/P/H, карточки/тесты/Mediatri, online→offline→online, очередь >12 событий, сохранение после reload, cross-device convergence, без смешения UID. Изолированные DRAFT изменения в PR #3 надо сначала безопасно развернуть в TEST preview по проверенному test CI и без записи в LIVE; не выдавать неразвёрнутый PR за работающий TEST.
9. Для независимого TEST резервирования: создать новую **закрытую** Google Таблицу только через доверенный authorized runner, прочитать Firestore с подтверждённым владельцем, reread rows/manifest, восстановить в отдельную пустую TEST-only среду и проверить hashes/counts/UID. Существующий `backup-v3/` в RELEASE DRAFT — **контракты и Apps Script draft**, не доказательство реального recovery. Не давать публичных ссылок на private Sheets/UID/tokens.
10. Проверить минимально достаточный admin diagnostics: реальные code-only ошибки, не содержат PII, не отображаются чужому ученику; отсутствие server-side агрегатора отмечать `NO DATA`, не обещать мониторинг, пока он не развёрнут и не подтверждён.

**C. Первый выпуск и эксплуатация**

11. Только когда критические gates пройдены и есть **отдельное явное GO владельца на production**, выполнить безопасный release merge/rollout PR №9 и проверенный production-only Rules plan с backup/rollback. Не переносить DEV Firebase config вместо существующих production UID, не удалять старые облачные документы и Google Drive-резервы.
12. Проверить live: Google-вход, первые карточки/тесты, M/P/H находки, Mediatri, повторный вход, историю другого аккаунта, offline и синхронизацию со второго устройства. В случае подтверждённого дефекта — остановить rollout и откатить код/SW по документированной точке восстановления, не трогая чужие данные.
13. После запуска — приоритизировать фактические ошибки → журнал/Issue → короткий PR → CI → тест → проверенное обновление. **ZIP Stage F вернуть только после публикации**, не как условие первого GO.

## Отчётность и ограничения

Каждое действие сопровождается `НАЧАЛ → ЗАВЕРШИЛ / ОШИБКА / ЗАБЛОКИРОВАНО` в [журнале](./WORK_ACTIVITY_LOG_2026-11-04_RU.md) и checkpoint [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10). Статус CHANGE/DEPLOY не ставить по одному успешному mock. Секреты, UID, OAuth, raw error, медицинские или личные учебные записи не попадут в GitHub.

**Недоступность авторизованного браузера и source editor — реальный блокер, не повод утверждать «починил».** Если нет прав — оставлять точную техническую передачу, что уже доказано, и не пытаться публиковать main принудительно.
