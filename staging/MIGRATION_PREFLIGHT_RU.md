# Sanastoyhteisö V3 — локальная сверка персональных JSON

Инструмент — staging/migration-preflight.html. Только FileReader (без сети, Firestore, Google Drive, cookies и localStorage).
Файлы: rs-personal-backup-audit.js, rs-migration-preflight.js, migration-preflight-page.js. ES5 для Safari iOS 12.
Выбираются более ранняя и новая копии, скачанные с действующего сайта через Данные → Скачать JSON.
Проверяются даты, результаты, личные слова, избранное, favoriteMeta, deletedWords. Наружу выходят только агрегаты и общие предупреждения.
При любом результате readyForMigration=false. Это НЕ импорт, НЕ восстановление и НЕ разрешение на перенос.
После зелёного CI размещать только в отдельном test repo velardream-ctrl/riveria-sanasto-community-test/migration-preflight/.
Нельзя менять production main, текущий Firebase и реальные учебные данные.
