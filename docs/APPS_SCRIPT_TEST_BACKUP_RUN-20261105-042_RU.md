# RUN-042 — TEST-only Google Apps Script backend: автономная проверка без облачных изменений

**Дата:** 2026-11-05. **Статус:** готов кандидат Apps Script + manifest, 10/10 unit/mock tests и emulator CI PASS. **Не** создано ни одной реальной копии, не настроены OAuth или ежедневный trigger.

## Что сохранено в черновом PR #9

- `backup-v3/apps-script/Backup.gs` — фиксированный TEST проект `sanastoyhteiso-v3-development`, отдельно выбранный UID только из приватных Script Properties, Firestore REST GET на baseline/events/words с общим readTime, создание только новой закрытой Sheet, Drive owner-only permissions GET, запись строк Sheets `RAW`, чтение обратно, проверка SHA-256, manifest с `restoreTested=false`. Firestore write/Delete отсутствуют. Установку триггера может отдельно вызвать только владелец через `installDailyTestBackup`, она выключена по умолчанию.
- `backup-v3/apps-script/appsscript.json` — V8 runtime, Europe/Helsinki, явные OAuth scopes: `script.external_request`, `script.scriptapp`, `datastore`, `spreadsheets`, `drive.file`. **Это разрешения, которые Apps Script запросит у владельца при будущем реальном запуске, не разрешения, уже выданные приложению.** Не использовать чужой или production OAuth.
- `backup-v3/firestore-source-codec.cjs` (RUN-040) и `backup-v3/private-sheets-flow.cjs` (RUN-041) — исходные проверенные модули, встроены как статический bundle в Apps Script без runtime import/eval/скачивания с GitHub.
- `release-checks/v3-apps-script-test-backup.test.cjs` и workflow `.github/workflows/release-v3-preflight.yml`: автономная V8/Google REST имитация без OAuth и без сетевых вызовов; тесты проверяют побайтовое совпадение bundle с исходными модулями, запрет выполнения без разрешения, отсутствие данных UID, правильную работу lock, невозможность неявного создания ежедневного trigger, owner-only permissions, ошибки 403, повреждение Sheet readback, успешную пустую базу и синтетический сценарий 4 документов с двумя страницами событий и Unicode.

## Подтверждение CI на одном HEAD

- Backend candidate: [commit 66b9a09](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/66b9a0908b25dbe4f950955fee9db6ecfd30c4f0).
- Lock duration fix: [commit 8213ce6](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/8213ce6aa1a75e05977d4fd38a14f559686e2785).
- Explicit scopes: [commit a7355c8](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/a7355c8ad55ee0b6fa4f56a841b651f592ab3bf4).
- Runtime simulator: [commit 060314c](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/060314c4ee47e0cdd5e544e447c59ee0d530b7fe).
- CI hook: [commit 42fd6a3](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/42fd6a3649adaa20951cc6132a0b6a8891c06eb1).
- Paged event+word+baseline synthetic integration: [commit 6056d1b](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/6056d1b12c23522adc2c92108302f492cab55fd7).
- [GitHub Actions #42013400518](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42013400518) **SUCCESS на exact HEAD `6056d1b12c23522adc2c92108302f492cab55fd7`**: release-preflight и local Firestore emulator SUCCESS, Apps Script simulator `10 tests, 10 pass, 0 fail`.

## Обязательные границы и ещё не доказанные свойства

1. **Текущий RUN не трогал реальную TEST Firebase и Google Sheets.** Адаптер работает в simulated environment; это не настоящая копия и не проверенный restore. Основной сайт, Firebase LIVE `riveria-sanasto-community-test`, другие пользователи и тариф не менялись.
2. Apps Script V8 поддерживает Promise microtasks, но реальный запуск Google API и возврат результата из trigger не проверены. В перспективе проверить таймаут, распространение ошибок и логирование **только** в отдельном тестовом проекте, без пользовательских данных. Официальная документация: https://developers.google.com/apps-script/guides/v8-runtime и https://developers.google.com/apps-script/reference/script/script-app.
3. При первом реальном запуске нужно проверить, что OAuth пользователя имеет **достаточный, но минимальный** доступ к TEST Firestore и созданным файлам, что `Drive permissions.list` действительно может подтвердить owner-only и что запрос с `readTime` работает. При 403/404/квотах STOP, не менять Rules/тариф.
4. В Apps Script нет Node и WebCrypto; SHA256 реализован через `Utilities.computeDigest`. Тестовый shim воспроизводит эти байты, но это ещё не реальное execution proof.
5. Для будущего schedule потребуется политика отказов, независимый private backup index, проверка срока хранения, quota/timeout, оповещения при сбое. Нельзя считать создание ежедневного trigger или один успешный backup подтверждённым восстановлением.
6. Перед копированием **реальных данных какого-либо ученика** необходимо отдельно проверить право, цель, минимизацию и приватность. Согласие владельца на TEST admin claim не распространяется на экспорт данных всех учащихся. Не копировать UID, email, тексты/ключи или content Sheets в публичный GitHub/чат.
7. Следующая безопасная независимая дорожка RUN-043: дать Apps Script ограниченный аудит квот/ошибок/сроков, сделать отказ при слишком большом наборе данных до создания Sheet и диагностировать offline; затем подготовить один owner-only TEST cloud gate для проверки на строго синтетическом тестовом UID. Запросить действие владельца только после зелёных CI и security review.

**Общая стадия:** RUN-042 DONE MOCK + CI, NEW-001 LIVE BACKUP/RESTORE OPEN, A–K NO-GO.
