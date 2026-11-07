# RUN-20261107-136 — Архитектурная проверка старых событий \`score\` и \`scope\` (ТОЛЬКО ИСХОДНЫЙ КОД)

**Дата:** 07.11.2026 (Europe/Helsinki)  
**Статус:** SOURCE SEMANTICS ESTABLISHED / REAL SHEETS RECORDS NOT VERIFIED / NO MIGRATION APPROVAL  
**Источник данных для этого отчёта:** только исходные файлы GitHub; реальные строки/JSON Google Sheets не читались.

## Проверенные первоисточники

1. [Рабочая классическая версия — \`main:community.js\`](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/main/community.js), blob \`481fde084fa2dd7c12ba3d30930f05a2b389c0a6\`. Историческая загрузка файла: [commit f8a687b от 01.11.2026](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/f8a687bb3af3322c3bc2660841884936e134ebc2).
2. [DRAFT RELEASE версия — \`community.js\`](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/community.js), blob \`bf4aec171acbbe0a079db2c24bdb91730acd8fc9\`. Внесён дополнительный V3 guard, но существенная семантика legacy \`capture\` / \`materialize\` совпадает с main.
3. [Новая модель событий — \`v3-sync-core.js\`](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/v3-sync-core.js), blob \`a324e1b8325ac9aa31e09aef7e79679c41fae296\`.
4. [Правила положительных разниц и недопустимых удалений — \`v3-sync-diff.js\`](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/v3-sync-diff.js), blob \`7cad0e21b2bafa0b8b8b18557244998aa34865f7\`.
5. [Только агрегаты частного legacy Events — RUN134](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10#issuecomment-6706678792): в первых 200 строках \`score=191\`, \`scope=9\`. **Не доказано**, что более поздние строки того же вида или что все записи исправны.

## Подтверждённая семантика по коду (не по содержимому резервной копии)

### \`score\` — абсолютное состояние накопленных счётчиков, НЕ отдельный ответ

В старом \`community.js\` функция \`snapshot()\` читает \`rs_scores_v1\`; \`capture(force)\` вызывает \`diff('score',cur.scores,prev.scores)\`, то есть записывает **новое значение состояния по изменившемуся идентификатору термина**, а не независимое событие нажатия «правильно/неправильно».

В \`materialize(events)\` значение \`score\` восстанавливается **покомпонентным максимумом** полей \`correct\`, \`wrong\`, \`seen\`, \`last\` (при одинаковом \`target\`). Следовательно, простое преобразование каждого старого \`score\` в V3 \`answer\` потенциально многократно увеличит баллы и испортит историю.

### \`scope\` — настройка режима видимости словаря, НЕ факт изучения

\`capture\` отдельно записывает \`kind:'scope'\`, \`target:'scope'\`, \`data:cur.scope\` при изменении \`rs_family_scope_v1\`. \`materialize\` применяет последнее значение по временной метке. Это настройка «Мой / Мой + Riveria», а не учебная активность.

**Нельзя** превращать \`scope\` в \`answer\`, \`learned_set\` или иной учебный V3 event. Восстановление пользовательской настройки следует обсуждать отдельно, с учётом новой схемы прав и персонального пространства.

### V3 поддерживает baseline из агрегированных значений, но это ещё не авторизация импорта

Функция \`legacyBaseline(scores,words,favorites)\` в \`v3-sync-core.js\` формирует начальное состояние с \`correct/wrong/seen/last\` и отдельно вычисляет \`learned\` (если достоверного булева значения нет — из \`correct>0\`). В \`v3-sync-diff.js\` декомпозиция **положительных дельт** в answer events разрешается лишь после сравнения с существующим подтверждённым состоянием и при условии \`delta(correct)+delta(wrong) = delta(seen)\`; неизвестные и отрицательные дельты считаются unsafe.

Это даёт безопасный **направляющий принцип**: исторические \`score\` сначала рассматриваются только как возможные данные для одноразового baseline, **не** как V3 события. Даже baseline не создаётся, пока не доказаны точный формат, принадлежность владельцу, целостность, идентификаторы, отсутствие конфликтов и восстановление в отдельном TEST без воздействия на других пользователей.

## Что остаётся неизвестным

- Реальная форма/типы JSON полей в приватных \`Events!F\` и содержимое более 200 строк.
- Соответствие бэкапа от 02.11.2026 конкретному выпущенному бинарному/JS варианту и полнота фиксированных данных.
- Правильность набора счётчиков по каждому термину и временные конфликты нескольких устройств.
- Наличие других \`word/fav/delete/subscribe\` типов за пределами выборки; корректность их UID.
- Возможность гарантировать SHA/manifest/readback у старого формата и реальный restore в **отдельную** Firestore TEST.
- Нужна ли миграция исторических метрик вообще: пользователь ранее допускал потерю собственного учебного прогресса, но это не разрешение стирать чужой прогресс или менять источники.

## Строго безопасный следующий шаг

1. В DRAFT ветке сделать **только синтетический** baseline classifier для формата \`score\` с \`correct/wrong/seen/last\`. Он обязан возвращать fail-closed при отрицательных, неконечном числе, непоследовательных, несовпадающих или дублирующихся данных, оставлять все legacy event kinds в quarantine и не обращаться к облаку.
2. Отдельно запланировать защищённый bounded **key-name + type-only** check уже реальных JSON, но **не выполнять без явного privacy gate/разрешения**; значения, ответы, UID, email, ID, raw JSON не выводить.
3. После верификации формата и provenance — исключительно owner-approved isolated TEST restore с SHA, readback, negative access tests, rollback. Main и чужие аккаунты не трогать.

**Текущее решение:** \`LEGACY_SCORE_IS_SNAPSHOT=SOURCE_CONFIRMED\`, \`LEGACY_SCOPE_IS_PREFERENCE=SOURCE_CONFIRMED\`, \`REAL_BACKUP_CONTENT_VERIFIED=NO\`, \`AUTO_V3_EVENT_MAPPING=DENIED\`, \`PRODUCTION_READY=NO\`. Stage F/ZIP остаётся PAUSED до после учебного запуска.
