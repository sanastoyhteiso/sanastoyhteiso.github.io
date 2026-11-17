# ЖУРНАЛ ВОССТАНОВИТЕЛЬНЫХ КОПИЙ — Sanastoyhteisö 3.0
## 2026-11-17 — НАЧАЛ/ЗАВЕРШИЛ: независимая кодовая резервная копия
- Ветка: feature/full-recovery-backup-20261117 (из main; production не изменён).
- Добавлены tools/create_code_snapshot.py, GitHub Actions workflow и автономное START_HERE_DISASTER_RECOVERY_RU.md.
- Выгружен подтверждённый GitHub Actions artifact на Google Drive Velar → WEBSITE_BACKUPS → Backup.
- ZIP содержит файлы, отслеживаемые git, checksum SHA-256 и инструкция; проверены CRC ZIP и SHA-256 каждого архивированного файла.
- СТАТУС: CODE_ONLY, не FULL. Не включены Firestore, Firebase Auth, media вне Git, Google Drive/Sheets, Cloudflare D1, secrets и браузерное локальное состояние.
- Основной recovery каталог: https://drive.google.com/drive/folders/12aYWa9lxD9YM7S6Ooaz276DWIqHv4ewg
- Новый важный контракт: после каждого существенного изменения/PR/релиза обновлять журнал, архитектурную карту, инструкции и свежий backup. См. BACKUP_RELEASE_POLICY_RU.md.
- НЕ ЗАВЕРШЕНО: серверный экспорт, кнопки админа, automation Drive, тест полной автономной установки.
## Запись новых RUN
Дата/время UTC | НАЧАЛ | SHA/ветка/PR | Что изменено | Какие новые данные/сервисы | Экспорт/место | Тест/счётчики | ЗАВЕРШИЛ / НЕ ЗАВЕРШЕНО
