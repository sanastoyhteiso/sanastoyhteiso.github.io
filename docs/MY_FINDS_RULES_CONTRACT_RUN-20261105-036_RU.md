# RUN-036 — «Мои находки»: единый клиентский контракт и правила Firestore

**Дата:** 05.11.2026 · **Режим:** только DRAFT release PR #9, без публикации Rules и без изменений основного сайта.

## Откуда возникла ошибка

Общий учебный каталог и модуль `v3-sync-finds.js` подбирают существующие термины классов `T/M/P/H` (плюс личные `W_<hash>`). В старом подготовленном фрагменте Firestore `collection_set` разрешал лишь `T/W`. Из-за этого интерфейс мог предлагать M/P/H с кнопкой «В мои находки», а облачное сохранение отказывало. Предыдущая временная клиентская защита RUN-034 отклоняла M/P/H, но это противоречило назначению раздела.

## Что исправлено в непубликуемом PR #9

- `v3-sync-finds.js`: список совпадений отбирает только допустимые ID `T/M/P/H` (5–7 цифр) и `W_<32 hex>`. Нестандартные ID не получают неисполнимой кнопки.
- `v3-sync-engine.js` и `v3-sync-core.js`: строгая проверка `collection_set` для всех четырёх классов публичных терминов и приватных W; unknown/path traversal запрещены; остаются server-owned UID, проверка событий и неизменяемость.
- **Только файлы-кандидаты, не опубликованные Rules**: `release-checks/firestore-v3-production-additive.rules.txt` и `release-checks/firestore-v3-prod-emulator.rules` согласованы на `[TMPH]`, при сохранении остальных проверок owner-only, verified email, строгих полей, запрета update/delete и записи других пользователей.
- `release-checks/v3-offline-recovery-contract.test.cjs`: тесты валидных и невалидных типов и совпадений, плюс статическая сверка подготовленного Rules с emulator fixture. `release-checks/firestore-prod-v3.test.cjs`: реальные локальные emulator assertions ALLOW T/M/P/H/W owner, DENY чужому UID и неизвестному L.

## Открыто за рамками этого исправления

Изолированные тесты показывают безопасность **подготовленного** фрагмента. Published TEST Rules в `sanastoyhteiso-v3-development` (по исторической user-supplied конфигурации PR #3) пока разрешали только T/W. Их точная текущая облачная версия **не прочитана и не изменена**. До live-теста и согласованного безопасного обновления только TEST Rules нельзя обещать, что кнопки M/P/H заработают в облаке; основной сайт не меняется.

## Тестирование и история правок

Промежуточные CI выявили две проблемы: `v3-sync-core.js` всё ещё не принимал M/P/H, а при автоматической текстовой замене кандидат Rules был временно повреждён интерполяцией спецпоследовательности `$'`. Обе ошибки исправлены в DRAFT через сохранённую чистую версию фрагмента, без затрагивания опубликованных правил. Добавлена проверка против подобного расхождения.

- [GitHub Actions #42004137949](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42004137949) **SUCCESS** на exact HEAD `8a77b951914abc5890d97a1f0bee1bed1c3358d6`: release-preflight и isolated Firestore emulator.
- [TEST changed head — PR #9](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/9) остаётся DRAFT/open/not merged.
- Отдельных личных данных, UID, ключей, Google Sheets/Firestore реальных событий не обрабатывали.

**Next gate:** сделать отдельный TEST-only candidate patch/contract проверки исторических опубликованных TEST Rules, затем доверенная read-only проверка и только отдельная безопасная публикация TEST (если потребуется), а не перенос production Rules. Этапы C/G/H и A–K остаются открыты.
