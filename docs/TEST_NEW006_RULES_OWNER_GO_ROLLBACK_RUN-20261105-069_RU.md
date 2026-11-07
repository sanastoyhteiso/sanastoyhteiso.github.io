# Sanastoyhteisö 3.0 — RUN-069: предрелизное решение владельца для NEW-006 TEST Rules (не опубликовано)

**Дата:** 05.11.2026, Europe/Helsinki. **Статус:** READ-ONLY SOURCE DIFF VERIFIED / EMULATOR PASS / OWNER APPROVAL AND CLOUD UPDATE PENDING. **NO DEPLOY.**

## Причина и факты

В текущей **присланной владельцем** TEST Firestore Rules редакции (снимок 05.11.2026) `collection_set` разрешает находки только `T12345` и `W_...`, но не `M00012`, `P00055`, `H00001`. Это блокирует некоторые публичные находки Mediatri/практики в V3. Остальные owner-only/event-immutable правила уже существуют. NEW-009 cloud-refresh failure reporting — другой нерешённый баг и **НЕ исправляется** этим патчем.

**Тестовый Firebase:** `sanastoyhteiso-v3-development` → Firestore Database `(default)` → Rules.
**Рабочий Firebase:** `riveria-sanasto-community-test` — НИКОГДА НЕ применять к нему этот патч.

## Сравнение точных файлов

- [Архив нынешних правил (не менять)](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/security-tests/snapshots/owner-console-rules-20261105.rules), Git blob SHA `a903ec37fb2c80e65bac71bd24ca15b11b782bc2`.
- [Подготовленный новый **полный** TEST candidate](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/security-tests/candidates/FIRESTORE_V3_DEVELOPMENT_NEW006_FINDS_TMPH_REVIEW_ONLY.rules), Git blob SHA `d2294825680bf0fce0f391456d475040c69732d9`.
- Кодовая независимая сверка в RUN-069: **новый файл байт-в-байт равен архиву, кроме одного выражения** внутри `(kind == 'collection_set' && ...)`: 

```diff
- (request.resource.data.target.matches('^T[0-9]{5,7}$') ||
+ (request.resource.data.target.matches('^[TMPH][0-9]{5,7}$') ||
```

Функции `verified()`, `own(uid)`, `isAdmin()`, проверки остальных типов событий, ограничение custom admin, запрет cross-UID / удаления и catch-all deny **остаются неизменными**. Это расширение **только** допустимых публичных кодов находок в своих `sync_v3` событиях, а не изменение прав другого пользователя.

## Доказательства безопасности только на emulator

В TEST PR #3 отдельные изолированные проверки выполняют: owner M/P/H = DENY на старой архивной редакции, owner M/P/H = ALLOW на новом TEST-кандидате, anonymous/wrong-UID/invalid category = DENY, admin signed-in/google verified Boolean + readonly, отсутствие других изменений ACL. [GitHub Actions #42110368136](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42110368136) **108/108 PASS** on exact tested HEAD `d82a457d49f2d47583956452b730f4f41064c248`. Это не означает, что новый файл уже применён в Firebase; настоящее Cloud allow/deny тестирование ещё потребуется.

## План минимального безопасного TEST обновления после отдельного GO владельца

1. **Сначала подтвердить разрешение** только на TEST `sanastoyhteiso-v3-development`. Без разрешения НЕ ПУБЛИКОВАТЬ. Записать RUN-ID START в журнал перед любым действием; не использовать аккаунт живой Firebase.
2. В TEST Console открыть Firestore `(default)` → Rules. Проверить project ID и сравнить **всю** нынешнюю редакцию с архивным snapshot. Если текст/версия на момент публикации уже изменились, **STOP**: прежняя проверка недействительна, подготовить новый diff. Сохранить видимый state/version; архив в GitHub остаётся rollback reference.
3. Владелец, либо авторизованный ChatGPT Work с явным разрешением, может заменить полный текст именно TEST rules подготовленным NEW006 `.rules` файлом. На телефоне не пытаться вводить/править сложный regex посимвольно. Проверить изменён ровно один target-валидатор, не произошла частичная вставка/удаление соседних правил.
4. Перед нажатием Publish сравнить начало (project) и конец (admin_metrics + catch-all deny), а также `collection_set` target и повторить проверку изменений. **Только после отдельного owner approval** Publish в TEST (НЕ LIVE), зафиксировать console confirmation/time/version и readback после перезагрузки.
5. Тестировать реальную allow/deny на **двух тестовых** аккаунтах: M/P/H создание только у владельца, чужой UID denied; существующие `T` события и `admin_metrics` права не должны регрессировать. Не трогать существующие документы/UID или пользовательские результаты ради демонстрации; тестовые записи с отдельными IDs и минимумом данных, если разрешено.
6. **Rollback (при регрессии)**: только после дополнительной проверки текущей версии/разрешения повторно установить известную исходную редакцию `owner-console-rules-20261105.rules`, затем подтвердить released rule version/readback; изменение live rules не трогать. Отмена ACL не восстанавливает данные автоматически; никаких user data operations.

**Важно:** user auth custom claim `admin=true`, сохранённый snapshot, наличие документа `admin_metrics/current` и cloud permission на настоящий запрос — это разные вещи. Проверка роли админа и NEW-009 fail-closed должна быть выполнена независимо до первого production GO.

## Дополнительное обследование RUN-069 (без данных учеников)

Исследован `home-refresh.js` → `RS_COMM.sync()` → `community.js`: при активном `RS_V3_RELEASE.isActive()` legacy community sync делегирует в V3 `refresh()` до проверки старого Google Drive токена. Ошибка старого маршрута без доказательства не заявляется, исходники не изменялись. *NEW-009* в `v3-sync-release.js` остаётся отдельной known-red задачей.

В подключённом Google Drive в metadata-only режиме обнаружены 4 старые собственные Sheets: pre-Community backup **01.11.2026** (13 вкладок), pre-migration MASTER **02.11.2026** (13), исходный FI–RU Sanasto (13) и Private v2 (Events/About). В первых трёх есть вкладки словаря, RS_Progress, RS_UserWords, RS_Favorites и Mediatri. Никакие содержимое/UID/табличные ячейки не читались, ссылки и IDs не переносились в публичный отчёт. **Реальный независимый бэкап новых данных Firestore 3.0 и restore в TEST не подтверждены** — NEW-001 OPEN. Не считать старые копии решением NEW-001.

## Следующий шаг

Когда владелец явно разрешит TEST-only publication NEW-006 — выполнить preflight/rollback и отдельный RUN, не объединяя с production release. До этого продолжать иные TEST-only non-destructive задачи, не обходя блокировку исправления `v3-sync-release.js`. ZIP Stage F PAUSED.
