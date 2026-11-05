# RUN-040 — полная персональная история V3: формат резервной копии Firestore

Дата: 05.11.2026. Только безопасный *офлайн-формат* в draft PR #9. Ни один реальный документ Firestore/Sheets не читался, не создавался и не менялся.

## Зачем отдельный формат

Ранее `v3-backup-codec.js` сохранял browser shadow-state `scores/words/favorites/finds`. Этот снимок полезен для проверки состояния, но недостаточен для восстановления первичного журнала обучения. Новый серверный Node-модуль `backup-v3/firestore-source-codec.cjs` сохраняет неизменённые REST-документы Firestore одного пользователя из:

- `sync_v3/{uid}/events/E_<32 hex>` — неизменяемые события обучения;
- `sync_v3/{uid}/state/baseline` — исходная точка (или явно `null` для пустого аккаунта);
- `sync_v3/{uid}/words/W_<32 hex>` — личные слова, если они существуют.

Сохраняются оригинальные `fields`, `createTime` и `updateTime`, когда Firestore их отдаёт; данные никогда не преобразуются в новую учебную схему в процессе создания копии. Это важно для совместимости с будущими изменениями модели.

## Формат и проверки

- Строгая привязка к TEST `sanastoyhteiso-v3-development`, одному UID и ISO UTC `readTime`. Пути других пользователей/коллекций недопустимы.
- Канонический JSON с упорядоченными свойствами, защита от `__proto__`, лимиты глубины/числа документов, отказ при дубликатах.
- Строки для будущего Google Sheets API `RAW`: `snapshot_id,kind,document_name,chunk_index,chunk_count,json_chunk`. Длинный документ разбивается на фрагменты без разрыва суррогатной Unicode-пары, затем при чтении собирается обратно.
- Manifest включает scope, TEST project, UID, snapshotId, readTime, числа документов/частей и SHA-256 полного упорядоченного содержимого. Он **намеренно** выдаёт `complete:false`, `liveSheetsVerified:false`, `restoreTested:false`; проверка локальных строк этих флагов не меняет.
- `verify()` отвергает чужой проект/UID, незнакомые пути/типы, пропущенные/переставленные/дублированные части, подмену содержимого и несовпадающую контрольную сумму. Возвращает восстановленные raw documents **только в памяти**, без обращения к Firebase или восстановления в живую базу.
- SHA-256 — проверка целостности относительно манифеста, **не** подлинности. Для доверенной защиты нужен отдельный приватный контроль доступа/история и полный read-back из нового закрытого Sheet.
- Пока scope **личные Firestore sync_v3 документы**, не полный экспорт пользователей Authentication, других Firestore коллекций, старого Google Drive, конфигурации, общих библиотек и словаря; это отдельные будущие backup streams.

## Подтверждение CI

- [Module commit 38b69f8](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/38b69f800d627a334fac95011b2facc05e0416ba).
- [Synthetic tests commit 48a8eba](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/48a8ebadcaadb6f87583a270b5975a04822e5da7): Unicode FI/RU/EN, строка-псевдоформула, огромный документ, копия/порядок, wrong UID/project/snapshot, missing/duplicate/chunk corruption, forbidden paths, malformed JSON key.
- [CI hook commit 4ba7163](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/4ba716344661bf72aaf641481a95cca37c22caf6).
- [GitHub Actions #42009004216](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42009004216) **SUCCESS exact code HEAD `4ba716344661bf72aaf641481a95cca37c22caf6`**: release preflight, new RUN-040 tests и local Firestore emulator. Лог `PASS RUN-040`.

## Самый следующий шаг (RUN-041)

Подключить **инъецируемый доверенный backend**, который может без доступа учащихся и без секрета в браузере: прочитать персональные Firestore документы с единым `readTime` и пагинацией, создать **новую приватную** Google Таблицу (не трогать старые), записать строки **RAW**, прочитать строки именно из этой таблицы и вызвать `verify()`, зарегистрировать хэш/результат, не совершая никаких Firestore writes. Сначала mock API + CI. Для реального запуска нужны отдельная проверка OAuth/IAM, доступ владельца и согласие на фактический перенос защищённых данных в private Sheets. Для будущей автоматизации — доверенный таймер/планировщик и уведомления о провалах; не добавлять платные сервисы без сравнения.

**Статус:** offline codec готов; NEW-001, Stage A/G/H/I, LIVE BACKUP/RESTORE — OPEN.
