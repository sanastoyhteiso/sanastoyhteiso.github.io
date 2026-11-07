# RUN-041 — доверенный алгоритм копирования Firestore → новая закрытая Google Таблица

Дата: 05.11.2026. TEST-only code в DRAFT PR #9. **Эмуляция API, не настоящая работа Google/Firebase.**

## Готовый код

В `backup-v3/private-sheets-flow.cjs` реализован orchestration-процесс поверх `backup-v3/firestore-source-codec.cjs` из RUN-040:

1. До любого обращения к API — проверка project `sanastoyhteiso-v3-development`, UID, snapshotId, UTC readTime и отдельного owner approval gate `CREATE PRIVATE TEST BACKUP`. Не допускается «любая база» или существующая произвольная Google Таблица.
2. Чтение Firestore через узкий injected **read-only** контракт `listDocuments` (`events`, `words`) с одинаковым `readTime` и пагинацией, плюс `getBaseline`. Запрещены повторяющиеся page cursors, пропущенная страница, чужой UID/project/document path, неверная структура, бесконечное чтение. Только `NOT_FOUND` для baseline может означать отсутствие; 403/транспортные ошибки должны вызывать прекращение, не возвращать пустую копию.
3. До создания файла — полный `codec.pack` + `codec.verify` на исходных raw документах.
4. Создаётся **новая закрытая Google Таблица** только через injected `createNewPrivate`; отсутствие `createdNew=true` или `private=true` блокирует дальнейшие вызовы. Нельзя задавать ID старой Таблицы и перезаписывать чужие backups.
5. Запись идёт кусками по 20 строк, исключительно через `writeRowsRaw`, с подтверждением `valueInputOption=RAW`. Никакой интерпретации пользовательского текста как формулы.
6. **Обязательное чтение обратно** данных через `readRows` от реального провайдера; проверяются uid/project/readTime, порядок, количество частей и SHA-256. До этого никакой `complete=true`.
7. Лишь после успешной проверки допускается запись и независимое повторное чтение приватного манифеста с `complete=true`, `liveSheetsVerified=true`, но **`restoreTested=false`** — реального восстановления в Firestore не было.
8. При ошибках файл не удаляется автоматически, но остаётся незавершённым. Ни один метод Firestore WRITE/RESTORE не предусмотрен.

## Проверки и статус

- [Pipeline code c6eedf3](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/c6eedf3080564f9bcd08fb3894ad0af016f23df1)
- [Injected API test cases 1ab5969](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/1ab5969d06f294a3a4ea3463a65d5b55c1896897): успешная проверка, повторная страница, неправильная база, чужие UID, отказ Firestore 403/Sheets 403, попытка перезаписать существующую/публичную таблицу, ошибки RAW, неполный readback, подмена JSON, ошибочный manifest.
- [CI hook 16f5263](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/16f526396e8eb8d4278427d34e571ce071d1ebec)
- [Release GitHub Actions #42009918338](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42009918338) **SUCCESS**, release-preflight + Firestore emulator at exact code HEAD `16f526396e8eb8d4278427d34e571ce071d1ebec`. Log: `PASS RUN-041...via fake adapters; NO live cloud`.

## Ограничения и путь к настоящей автоматизации

**Не подключены реальные Google API/OAuth/Sheets, не создан ни один файл и не выполнялся никакой Firestore GET.** Поэтому `liveSheetsVerified=true` существует только как результат алгоритма *после успешного injected provider readback*, но пока никакой actual provider это не подтвердил.

Для работы без постоянного участия владельца следующий этап — однажды настроить доверенного исполнителя с разрешёнными OAuth scopes и правами доступа; затем безопасное расписание, приватная таблица, alert при пропущенной копии, retention, повторные проверки восстановления. Вариант бесплатного исполнителя — Google Apps Script time trigger от имени владельца (официально документирован, но требуются согласие на scopes/скрипт и учёт квот 6 минут/запуск и 90 минут/сутки для обычного аккаунта). До OAuth/IAM review нельзя автоматически запускать экспорт персональных данных всех учеников или выдавать кому-либо новый доступ; начать с синтетического TEST UID в отдельно разрешённом namespace.

**Сейчас NEW-001 / live restore / A–K OPEN.** Production Firebase `riveria-sanasto-community-test`, основной сайт, тариф и другие учётные записи не менялись.
