# RUN-20261105-044 — офлайн-контракт контроля резервных копий, ошибок и восстановления

Дата: 2026-11-05 (Europe/Helsinki). Stage A/G/H/I; NEW-001 **OPEN**.

## Изменено только в DRAFT PR #9

- `backup-v3/backup-health-contract.cjs` — чистый Node-only evaluator, не подключенный к пользователям и Google APIs.
- `release-checks/v3-backup-health.test.cjs` — **15/15** синтетических проверок, включая отсутствующую копию после срока, stale >30 ч, невалидный/private manifest, неверный Firebase project, неудачную последнюю попытку, реальную границу доказательств восстановления и непередачу UID/email/sheet ID/личных слов в диагностический JSON.
- `.github/workflows/release-v3-preflight.yml` — тест health-контракта до браузерных симуляций.

Новый контракт действует **строго** для `sanastoyhteiso-v3-development` и одного будущего TEST account. `backupStatus` принимает `OK / PROBLEM / NO_DATA`. Отдельный `restoreStatus` не может стать `OK` без принятого внешнего доказательства изолированной проверки восстановления, связанного с текущим manifest SHA. Если нет данных о запуске, результат `NO_DATA`, не ложный `OK`. Коды ошибок фиксированы, без произвольных текстов. При неуспешном последнем запуске либо просрочке флаг `alertRequired` становится `true`, но **отправка оповещений не реализована**.

## Независимое подтверждение CI

- [Модуль](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/backup-v3/backup-health-contract.cjs)
- [Тесты](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/release-checks/v3-backup-health.test.cjs)
- [GitHub Actions #42015726491](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42015726491): **SUCCESS на точном кодовом HEAD `db5c187feb7ad4c88655421db83968eff8fa5743`**; release-preflight PASS (**15/15** новых тестов, **13/13** Apps Script simulated tests); Firestore emulator PASS.

## Не выполнено и нельзя выдавать за live PASS

- Нет авторизованного TEST Google API backend, реального Firestore READ, частной Google Sheet/readback, постоянного cron/Apps Script trigger или реальных сообщений об ошибках.
- Нет проверенного independently restored TEST Firestore snapshot, снимка всех пользователей, retention/rotation/consent/GDPR gates или алертов владельцу.
- Boolean `liveSheetsVerified` в синтетическом *входном* объекте — тестовое утверждение. Чистый evaluator не проверяет Google APIs или подлинность внешнего сообщения; он возвращает `liveBackendVerifiedByThisModule:false` и `monitoringConnected:false` всегда.
- Нельзя публиковать на production или применять для реальных чужих пользовательских данных без отдельного разрешения. LIVE Firebase `riveria-sanasto-community-test`, рабочий Pages, тариф Spark и TEST default main не изменялись.

## Следующий автономный шаг RUN-045

Подготовить без облачных записей независимый consumer/mocks test для доказательств provider readback и failure status (без доверия к клиентским утверждениям) и безопасный минимальный contract уведомлений. Проверить отсутствие утечки private ids, дублирования тревог и ложного OK при сбое телеметрии. Затем один отдельный owner gate для TEST synthetic owner pilot; никакой массовый экспорт учеников.
