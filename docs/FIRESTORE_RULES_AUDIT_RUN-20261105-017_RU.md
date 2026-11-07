# Sanastoyhteisö 3.0 — RUN-20261105-017: read-only аудит Firestore Rules (этап C, NEW-003)

Дата: **2026-11-05**, Europe/Helsinki.  
Статус: **PARTIAL / BLOCKED_READ_ONLY** — исторический GitHub-контракт проверен; полный текущий **опубликованный** ruleset не прочитан.  
Область: **только** TEST-проект Firebase `sanastoyhteiso-v3-development`; не путать с `riveria-sanasto-community-test`.  
Изменения: **только документация GitHub**. Firebase Console / Authentication / Firestore / Rules / user data / tariffs / production / PR merge — **не изменены**.

## 1. Честная граница доступа

В этой обычной сессии ChatGPT нет управления ранее открытой и авторизованной вкладкой облачного браузера **ChatGPT Work**. Установленный доступ к GitHub позволил прочитать исходники и тесты; доступа к ресурсам Firebase для получения опубликованных Rules через подключённый read-only инструмент нет. Доступный официальный Firebase plugin в этот момент не подключён, и это не эквивалент уже авторизованной вкладке Work.

- Полный текст **действующих опубликованных** Firestore Security Rules: **NOT_OBTAINED**.
- Firebase Console project / database / ruleset resource name / release revision: **NOT_READ_VERIFIED**.
- Дата и время публикации действующих правил: **UNKNOWN**.
- Историческое `rules_version = '2'` в файле — **версия синтаксиса языка правил**, НЕ идентификатор опубликованного ruleset.
- Нельзя утверждать, что действующие TEST Rules совпадают с исходниками PR #8, TEST fixture или правилами другого Firebase-проекта.
- Нельзя утверждать, что запрос admin сейчас разрешён/запрещён реальными deployed Rules; не выполнялись запросы к настоящим пользовательским документам.

## 2. Проверенные источники и версии GitHub

1. [Master Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10), [журнал RUN START/END](./WORK_ACTIVITY_LOG_2026-11-04_RU.md), [MASTER ROADMAP](./MASTER_ROADMAP_V3_ADMIN_RELEASE_2026-11-04_RU.md).
2. [Исторический PR #8](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/8): DRAFT/open/not merged; HEAD `828d702430037aeca271786bbcf067e202f10c0c`. Полный исторический подготовительный файл [`staging/backend/firestore.v3-development.rules`](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/828d702430037aeca271786bbcf067e202f10c0c/staging/backend/firestore.v3-development.rules): blob `8f5da135e34de7e03437b85ce54e1e1aac1d7563`, 234 строки с завершающим переносом; **НЕ подтверждён как deployed**.
3. [TEST PR #3](https://github.com/velardream-ctrl/riveria-sanasto-community-test/pull/3): DRAFT/open/not merged; HEAD `e35329534c8d8e7a6300a026bb1a827f98de88b2`. [Полный historical + additive emulator fixture](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/e35329534c8d8e7a6300a026bb1a827f98de88b2/admin/security-tests/fixtures/firestore.v3-development-plus-admin-metrics.rules): blob `1372d3013a06ba50deb73af181ada8fb303b231d`; **NOT DEPLOYABLE**. [Интеграционные тесты](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/e35329534c8d8e7a6300a026bb1a827f98de88b2/admin/security-tests/security.integrated.test.cjs), [README](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/e35329534c8d8e7a6300a026bb1a827f98de88b2/admin/security-tests/README_INTEGRATION_RU.md).
4. [TEST admin UI](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/e35329534c8d8e7a6300a026bb1a827f98de88b2/v3-unified-preview/admin/admin-page.js) читает `db.collection('admin_metrics').doc('current').get({source:'server'})` — отдельный серверный read-only путь; скрытие ссылки на admin UI само по себе не обеспечивает защиту.
5. На финальном TEST HEAD `e353295` ранее зафиксирован [emulator CI #41920432803](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41920432803): **46/46 PASS**, а [client mock CI #41920432780](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41920432780): **success**. Эти результаты задокументированы RUN-016; в RUN-017 новых Firebase CI или живых сетевых тестов не выполнялось.

## 3. Доказанное сравнение исторического PR #8 и NEW-003

Проведён построчный LCS-diff исходного исторического `staging/backend/firestore.v3-development.rules` и полного TEST fixture. Результат: **233 исходные строки без удалений**, добавлено **11 строк**: 2 вводные предупредительные комментария и 9 строк перед fallback deny (включая пустые строки/комментарии и новый match). Другие существующие строки не отредактированы.

| Путь | Исторические правила PR #8 | TEST NEW-003 fixture | Значение |
| --- | --- | --- | --- |
| `/site_admin/{docId}` | `get: if isAdmin()`; list/write запрещены | Без изменений | Сохранение исторического пути |
| `/admin_metrics/{metricId}` | Отдельного разрешения нет; общий deny | Только `get` документа `current`, verified admin с `admin == true` и Google sign-in provider; list/write false | Устранение исторического несовпадения с admin UI |
| `/users/{uid}` и `/settings/{uid}` | Владелец с verified email, ограничения изменений | Без изменений | Проверка не должна закрывать доступ учеников |
| `/sync_v3/{uid}/events/{eventId}` | Свои события: get/list/create с проверками, без update/delete | Без изменений | Сохранён исторический контракт синхронизации |
| `/libraries_v3`, `/library_subscriptions_v3` | Ограниченный доступ проверенным пользователям, private/public политики | Без изменений | Сохранена историческая учебная модель |
| `/{document=**}` | `allow read, write: if false` | Без изменений | Незапланированные пути запрещены в данной исторической модели |

**Аддитивный блок только в offline-fixture (НЕ инструкция немедленно публиковать):**

```firestore
match /admin_metrics/{metricId} {
  allow get: if metricId == 'current' && isAdmin() &&
    request.auth.token.firebase.sign_in_provider == 'google.com';
  allow list, create, update, delete: if false;
}
```

`isAdmin()` в исторической модели требует и `request.auth.token.email_verified == true`, и строгое `request.auth.token.admin == true`; отсутствие роли, строка `'true'` и неподтверждённая почта не дают доступа. В новой TEST модели дополнительно требуется Google sign-in provider — сознательное ограничение пилота, которое следует отдельно проверить на реальном выбранном способе входа.

**Важный риск:** Firestore объединяет применимые `allow` по логическому **OR**. Поэтому `allow false` в новом узком match не отменит уже существующее более широкое разрешение другого match. До оценки текущих deployed Rules невозможно подтвердить отсутствие перекрывающих разрешений, полный deny обычным ученикам или реальную безопасность.

## 4. Проверенное и непроверенное поведение

По предыдущему RUN-016 реальный **локальный** Firestore Emulator с синтетическими данными прошёл 46/46 тестов: разрешён get `admin_metrics/current` verified admin с нужным mock claim; отклонены anonymous, ordinary student, unverified, `admin:'true'`, missing/custom/password providers, другие admin документы, list, client create/update/delete. Отдельные тесты выборочно проверяли доступ ученика к своим `users/settings/sync_v3`, запрет чужих данных и чтение public/private libraries; старый `site_admin` остался доступен историческому админу.

**Это не проверка:** текущей опубликованной версии Rules, наличия реального server-issued custom claim, прямого разрешения/запрета в облачной Firestore, существования документа `admin_metrics/current`, всех сценариев ученика, реальных Auth providers, browser/iOS12 или работы мониторинга. SDK Admin на доверенном backend обходит Rules; клиентские записи по модели запрещены.

## 5. Вывод и запреты

**NEW-003: PARTIAL / BLOCKED_READ_ONLY. Stage C/E/H: OPEN, NO-GO.** Подготовлена ограниченная модель безопасного чтения единственного агрегата; для исторической версии сохранены проверенные учебные ACL. Но утверждать, что доступ безопасно реализован **в действующей TEST Firebase**, пока нельзя.

Категорически нельзя публиковать `admin/security-tests/firestore.contract.rules` (его остальные пути deny-all) или historical fixture в облако целиком. Нельзя менять `riveria-sanasto-community-test`, основной сайт, prod Firebase, Auth/Firestore/Rules, тарифы или объединять PR. Новые изменения допустимы только после отдельного разрешения владельца.

## 6. Точные следующие действия для ChatGPT Work или обычного чата

1. Открыть **Work mode** с имеющейся авторизованной Firebase Console; строго read-only выбрать проект **`sanastoyhteiso-v3-development`** → **Firestore Database → Rules** (нужная база, обычно `(default)`). Скопировать **полный текст текущих опубликованных правил**; в **Rules history / releases** установить точное имя/ID версии и опубликованные timestamp, если консоль их показывает. Без Publish, Edit, Simulator с данными, изменения ролей и секретов.
2. Сохранить безопасную копию полного текста (без токенов/данных пользователей) для анализа, со ссылкой на origin, project ID, database ID, version и временем извлечения. При невозможности получить — отметить `BLOCKED_READ_ONLY`, ничего не угадывать.
3. Построчно сравнить **текущий deployed** набор с историческим PR #8 и NEW-003. Отдельно проверить все `match` для `admin_metrics/current`, широкие/вложенные `match`, OR-overlap, `site_admin`, student `users/settings/sync_v3/libraries_v3`, provider/verified/admin predicates и другие реально существующие пути.
4. Составить **отдельный полный emulator fixture на базе именно deployed snapshot**, никак не deploy; протестировать get/list/create/update/delete, anon/student/admin и regression существующего учебного доступа. Отдельно проверить реальную роль/два тестовых аккаунта **только после согласования** возможных облачных изменений.
5. Продолжить с новым RUN START→END; обновить master TASK / NEW-003 / Issue #10; не закрывать C/E/H или PR до доказательств. Для обычного ChatGPT GitHub уже доступен, но он не наследует вкладку Firebase Work.

## Handoff

- Canonical docs branch: `sanastoyhteiso/sanastoyhteiso.github.io@release/v3-safe-integration-20261104`.
- TEST: `velardream-ctrl/riveria-sanasto-community-test@feat/admin-control-center-package-spec-20261104`, [PR #3](https://github.com/velardream-ctrl/riveria-sanasto-community-test/pull/3) HEAD `e35329534c8d8e7a6300a026bb1a827f98de88b2`.
- Historical: [PR #8](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/8) HEAD `828d702430037aeca271786bbcf067e202f10c0c`.
- Last verified emulator CI (RUN-016): [#41920432803](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41920432803), **46/46 PASS** — NOT CLOUD.
- NEXT: **READ FULL DEPLOYED RULESET + VERSION/TIME in Work read-only**, then full diff/emulator. No production or cloud writes.
