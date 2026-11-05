# RUN-031 — автономный аудит границы TEST admin (без изменений Firebase)

**Дата:** 2026-11-05, Europe/Helsinki. **Статус:** read-only audit DONE; browser/live Firestore gate OPEN.
**TEST:** `sanastoyhteiso-v3-development`; source [TEST PR #3](https://github.com/velardream-ctrl/riveria-sanasto-community-test/pull/3) HEAD `d5ede8385945f7ca1175d234ae87e282758e41b5`, draft/open/not merged.
**Запрет:** не смешивать с LIVE `riveria-sanasto-community-test`; не публиковать PR #3/main в рамках этого аудита.

## Непосредственно установленные факты

| Проверка | Доказательство | Статус |
| --- | --- | --- |
| Owner server-issued TEST role | RUN-029: скриншот локального Cloud Shell `SUCCESS: admin=true assigned to exactly this TEST UID`, SDK прочитал обратно claims; UID/email/backup не публикуются | OWNER_EXECUTION_CONFIRMED |
| Новый ID token после назначения | Владелец сообщил, что вышел/вошёл на TEST через Google; фактическое содержимое нового токена не считано | OWNER_REPORTED_SIGNIN / TOKEN_UNVERIFIED |
| Клиентская проверка admin | `v3-unified-preview/admin/admin-page.js`: default-app options vs TEST config, verified Google user, strict boolean `claims.admin===true`, `onIdTokenChanged`, fail-closed session generation, server-only `admin_metrics/current` get | STATIC_VERIFIED |
| Безопасная ссылка | `v3-unified-preview/admin-entry.js`: hidden by default, TEST app config, strict claim, hide on token change; не даёт серверные права | STATIC_VERIFIED |
| Отсутствие ложных показателей | Отсутствие `admin_metrics/current` → «Нет данных», а не `ОК`; свежая сводка требует времени/monitoringActive; backend не создан | STATIC_VERIFIED / DATA_NOT_IMPLEMENTED |
| TEST CI at exact feature SHA | [admin regression #41970990829](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41970990829) SUCCESS; [Firestore rules emulator #41970990821](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41970990821) SUCCESS | CI_PASS (ISOLATED) |
| Публичная TEST admin page | Путь `v3-unified-preview/admin/index.html` есть в feature branch; в TEST `main` прямой GitHub file API отвечает **404**. Последний TEST main Pages [#41900610897](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41900610897) SUCCESS на `49695b560e8ab77d04f508c9d95b5195d2b3fd9e` — код PR #3 там отсутствует. HTTP-проверка сайта из браузера отдельно не делалась | NOT_PUBLISHED_IN_MAIN |
| Реальные deployed Firestore Rules release ID и allow/deny | Действующий cloud API release/ACL не прочитан; 86/86 — это локальный emulator, не live permission. `not-found` для отсутствующего `admin_metrics/current` может означать разрешённое чтение пустого документа, `permission-denied` — запрет; тестировать различие | UNVERIFIED |
| Ученик / анонимный | Клиентские mock tests отсекают неадмина, но реальное отсутствие доступа у другого TEST Auth пользователя не проверено | EMULATOR_ONLY |

## Ближайший автономный критический путь

1. TEST-only release gate для PR #3: сверить весь diff с TEST `main`, найти конфликты, проверить, что изменения не нарушат текущие карточки/словари/тесты/вход. Выделить безопасную ветку/PR для тестовой публикации **без production**, при необходимости — отдельный статический артефакт. Не путать publish TEST с финальным production GO.
2. Добавить регрессии на browser/admin navigation и iOS12, claim refresh и ложный статус `ОК` при пустых или устаревших metrics. Перепроверить native CI и exact HEAD. Это можно сделать без владельца.
3. Когда будет проверяемая TEST страница, выполнить authorized browser/token/read-only Firestore allow/deny. При отсутствии доступной авторизованной сессии не просить владельца сразу: сначала подготовить автоматизированный тестовый сценарий, чтобы его единичное участие дало максимум данных. Не передавать UID/email/tokens/ключи в чат/GitHub.
4. Параллельно независимый поток: backup/restore NEW-001 и integration seam PR #8/#9. Дефект на одной дорожке не блокирует другие.

**Вывод:** выдача роли завершена, но реальный админ-кабинет и серверные данные не работают как завершённый продукт. Этап C/E/H/все A–K остаются OPEN. Следующий исполнитель начинает с TEST source/release gate, не просит владельца повторить вход. Не выполнять production changes/Firestore writes/billing.
