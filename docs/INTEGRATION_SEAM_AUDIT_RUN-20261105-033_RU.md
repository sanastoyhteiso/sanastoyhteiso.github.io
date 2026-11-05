# RUN-033 — точка интеграции PR #8 ↔ PR #9 без слепого merge

**Дата:** 2026-11-05 · **Только GitHub read-only анализ и документация**. Не менялись Firebase, production, правила, пользовательские данные и тариф.

## Проверенные исходники

- [PR #8 — staging sync](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/8), `staging/rs-offline-sync-admin-backup-20261102`, HEAD `828d702430037aeca271786bbcf067e202f10c0c`, DRAFT.
- [PR #9 — integrated release candidate](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/9), `release/v3-safe-integration-20261104`, ранее проверенный HEAD `8992e8da8589c93b9e8148bc023d6a8d1a98f067`, DRAFT. Источник production `main` `d29813cf409af9dc60804105ca3141f98ec12fcd`.
- GitHub changed-files: PR #8 добавляет 135 файлов, преимущественно только `staging/` и staging CI. PR #9 имеет ~32 изменённых файла, в том числе корневые `index.html`, `app.js`, `family.js`, `community.js`, `sw.js`, `v3-sync-*.js` и `release-checks/`. Прямых конфликтов файлов по двум спискам нет, но **семантические зависимости и разные Firebase-проекты остаются**.

## Результат технического сравнения

| Объект | Изолированный PR #8 | PR #9 | Вывод |
| --- | --- | --- | --- |
| Pure sync event model | `staging/rs-sync-core.js`, blob `b86e2d41b5e281a2270457633acc889a43c08adc` | `v3-sync-core.js`, blob `f8041a5f6cb97a28209e8509f7855cb737abf9ff` | Код **побайтно эквивалентен после удаления вводного комментария**. Не переносить второй экземпляр в корень |
| SHA-256 helper | `staging/rs-sha256.js` | `v3-sync-sha256.js` | Идентичный Git blob `1540cac9198e40469eb48fb799200fd1040f23a6` |
| IndexedDB shadow | `staging/rs-sync-shadow-idb.js`, blob `b6f5d083...` | `v3-sync-shadow.js`, blob `93cd74cc...` | Структура в целом общая, но **DB_NAME разный** (`sanastoyhteiso_staging_shadow_v3` vs `sanastoyhteiso_production_unified_shadow_v3`). Не считать хранилища взаимозаменяемыми; требуются тесты изоляции/миграции |
| Управление синхронизацией | opt-in journal + `rs-sync-controller.js`, `rs-firestore-transport.js`, XHR | `v3-sync-engine.js`, `v3-sync-release.js`, отдельный per-UID IndexedDB + Firebase client | Это **два механизма оркестрации**, не два независимых слоя для одновременного включения. Выбирать один активный путь и проверять события/idempotency |
| Интерфейс | `staging/classic/` и `staging/auth-pilot/` — раздельные эмуляторы/пилоты | Полный root UI карточки/тесты/Mediatri/словарь/библиотеки + opt-in bridge | **Точка интеграции — TEST preview с UI и мостом от release-candidate PR #9**, а не копирование `staging/classic` или подмена production index |
| Backend | Подготовительные Rules и staging emulator | `release-checks/firestore-v3-production-additive.rules.txt` для `riveria-sanasto-community-test` | Никогда не публиковать этот файл как полный ruleset; он относится к LIVE проекту и требует separate GO и полного diff с deployed Rules |
| Backup | `staging/rs-backup-plan.js` — план приватной Sheets копии, без реальной автоматизации | Локальный backup при опциональном включении V3 в `v3-sync-release.js` | Ни один подход пока не даёт **проверенный независимый Sheets backup + реальное восстановление**; NEW-001 остаётся blocker |

## Что готово к инженерной работе без владельца

1. **Не объединять PR #8 и #9 автоматически.** PR #9 — кандидат на единый UI и opt-in V3; PR #8 — источник алгоритмических контрактов и регрессионных сценариев. Оба draft сохраняются.
2. На **изолированной TEST ветке** создать/расширить regression контракт на совпадение событий для T/M/P/H и W_..., личных находок, смену UID, неподтверждённого login, повторные/offline события, сбой local backup, IndexedDB quota, предотвращение duplicate event и старую Drive-синхронизацию. Отдельно тестировать изоляцию DB_NAME при переносе на реальный домен.
3. Перед релизом согласовать единственный storage authority: legacy Google Drive vs opt-in V3. Сейчас `v3-sync-release.js` должен сохранять старое состояние/делать добровольное включение; это не заменяет верифицируемое private Sheets restore.
4. Использовать [release CI](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42000162724), **SUCCESS** на HEAD `8992e8da...`: static preflight, event-diff regression, browser-stub и test Firestore emulator. Это не проверка настоящих пользователей/браузеров.
5. Следующая безопасная задача, не требующая владельца: **RUN-034** — воспроизводимый offline TEST contract на поведение sync/backup, затем следующий атомарный код/CI в изолированной ветке; ни одного облачного импорта и без тестовых секретов. Список конкретных тестов закрепить в коммите.

## Критические блокеры до главного сайта

- Реальный full LIVE ruleset, старые UID/Drive/Firestore snapshots и приемочный restore не верифицированы.
- Реальный TEST admin-route и разрешённые запросы не проверены после выдачи роли; админ-метрики и ZIP backend отсутствуют.
- Два пользователя/два устройства/iPad iOS12 физически не испытаны; emulator и jsdom не подменяют их.
- Публикация на `sanastoyhteiso.github.io` — только после A–I и отдельного письменного GO владельца.

**Статус RUN-033:** read-only technical map, без файлового merge, Firebase calls или production changes; A–K OPEN.
