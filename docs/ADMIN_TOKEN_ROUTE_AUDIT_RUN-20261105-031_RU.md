# RUN-031 — аудит TEST admin auth/route/token без доступа к приватным данным

**Дата:** 05.11.2026 · **Режим:** только GitHub read-only audit и документация. **Источник:** [TEST PR #3](https://github.com/velardream-ctrl/riveria-sanasto-community-test/pull/3), HEAD `d5ede8385945f7ca1175d234ae87e282758e41b5` (draft/open/not merged).

## Установленные факты

| Компонент | Доказано / не доказано |
| --- | --- |
| TEST Firebase роль | RUN-029: владелец показал `SUCCESS: admin=true assigned to exactly this TEST UID` после доверенного server read-back. Владелец сообщил, что вышел/повторно вошёл в TEST; новый ID token из браузера независимо не прочитан |
| Админ-клиент | `v3-unified-preview/admin/admin-page.js` читает `admin_metrics/current` с `{source:'server'}` только после verified claim `admin === true`, смотрит строго TEST config, очищает DOM/отчёт при смене токена и учётной записи, не пишет Firestore |
| Ссылка кабинета | `v3-unified-preview/admin-entry.js` скрывает ссылку при отсутствии claim или несовпадении TEST config. Используется `onIdTokenChanged`, первая проверка пользователя `getIdTokenResult(true)`, последующие `false` |
| Реальная TEST Pages публикация | В существующем TEST default `main` найден `v3-unified-preview/index.html`, **но запрос `v3-unified-preview/admin/index.html` на default `main` возвращает GitHub 404**. В feature PR #3 admin page существует; просто дать пользователю ссылку для browser acceptance пока нельзя |
| Взаимосвязь документов | Путь `admin_metrics/current` в клиенте строго фиксирован; опубликованные TEST Rules были вручную изменены владельцем RUN-019, но current deployed revision и реальные allow/deny независимо не проверены; сам документ метрик не создан или не подтверждён |
| Тесты | На точном HEAD `d5ede838...` GitHub Actions [admin regression 41970990829](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41970990829) SUCCESS и [Firestore emulator 41970990821](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41970990821) SUCCESS. Это изолированные CI/mock/emulator, **не** реальное облако |

## Конкретная клиентская недоработка для следующего TEST regression

В `admin-page.js` функция `health()` корректно возвращает `Нет данных`, если timestamp просрочен или `monitoringActive !== true`, но `render()` в том же случае **всё ещё показывает количественные показатели** `errors24h`, `active7d`, `releaseVersion` из старого отчёта. Это не подтверждённая ошибка настоящих данных (пока их нет), но вводит в заблуждение при возможном запуске телеметрии. Следующая изолированная задача: не показывать такие числа/версию до свежей подтверждённой сводки, добавить mock tests для stale/inactive/future/report fresh, прогнать CI; без claims, Firebase или deploy.

## Блокеры

- Прямой результат `getIdTokenResult` после re-login не получен: не просить пользователя вставлять JWT / token в чат.
- `admin_metrics/current` — отсутствие документа (not-found) и отказ по Rules (permission-denied) надо различать в безопасной read-only диагностике без выдачи данных.
- Для реального browser-check нужен отдельный **тестовый** путь публикации админ-страницы без merge в основной production; тестовый PR #3 пока draft.
- Предрелизное acceptance двух разных аккаунтов/браузеров/физического iPad iOS12 и snapshot backup restore не выполнено.

**Итог:** stage B/C/E/H остаются OPEN. Основной сайт, рабочая Firebase, любые Rules и чужие данные не менялись.
