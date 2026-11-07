# Sanastoyhteisö 3.0 — RUN-068: сохранена редакция TEST Cloud Firestore Security Rules владельца

**Дата и контекст:** 05.11.2026 (Europe/Helsinki). **Статус:** сохранён неизменяемый логический snapshot и проведены офлайн emulator тесты; **никаких Firebase writes и production release**.

## Что дал владелец

В этом чате владелец прислал полный текст Firestore Rules и 3 скриншота из веб-консоли. На первом видно имя **Sanastoyhteiso V3 Development**, `Cloud Firestore → Database (default)`. На втором открыта вкладка `Rules` и показана история публикаций, выделена верхняя версия `Today · 3:03 AM`, далее `Yesterday · 2:59 PM`. На третьем — начало исходника с `Exact Firebase project: sanastoyhteiso-v3-development` и явным запретом изменять рабочую Firebase `riveria-sanasto-community-test`. В скриншотах есть идентификатор документа в разделе Data; **изображения и этот идентификатор не копировались в публичные репозитории**.

Имеется owner-presented evidence актуальной выбранной версии в консоли; но **серверный release resource ID/UTC timestamp и самостоятельная Firebase REST readback не получены**. Нельзя заявлять, что локальная копия обновляется при будущем изменении Rules в облаке.

## Где сохранено (стабильно для следующих ChatGPT/Work)

- **Исходный код 284 строк:** [TEST `admin/security-tests/snapshots/owner-console-rules-20261105.rules`](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/security-tests/snapshots/owner-console-rules-20261105.rules). Commit [`e54efd86adfdb19c7d3f34c9462d6f993b643476`](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/e54efd86adfdb19c7d3f34c9462d6f993b643476). Git blob SHA `a903ec37fb2c80e65bac71bd24ca15b11b782bc2`, 12919 символов. Сохранённый источник byte-identical уже подготовленному полному кандидату NEW-003, содержащему те же правила/блоки, что прислал владелец.
- [README происхождения и безопасного повторного тестирования](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/security-tests/snapshots/README_OWNER_TEST_RULES_20261105_RU.md), commit `0e1c0c568bf640f46aeb11d9da9049b82dd2ebc6`.
- **Источник для emulator:** `admin/security-tests/security.user-supplied.test.cjs` теперь загружает именно `snapshots/owner-console-rules-20261105.rules` вместо кандидата, проверяет, что архив не расходится с ранее рассмотренным текстом; никаких сетевых обращений к реальной Firebase. Code HEAD [d82a457d](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/d82a457d49f2d47583956452b730f4f41064c248).

## Что установлено о правах именно в сохранённой версии

1. `users/{uid}`, `settings/{uid}`, `sync_v3/{uid}/events/{eventId}` требуют verified и own UID. Events имеют только create (без update/delete).
2. `collection_set` разрешает **Txxxxx** и персональные **W_** ID; **M/P/H пока отклоняются**, включая `P00055`. Это отдельный открытый блокер NEW-006 для работы всех «Моих находок». Более новый кандидат `FIRESTORE_V3_DEVELOPMENT_NEW006_FINDS_TMPH_REVIEW_ONLY.rules` сохраняется отдельно, **НЕ является присланным live-снимком и НЕ публиковался**.
3. `admin_metrics/current`: только `get` при verified, строгом boolean custom claim `admin == true`, аутентификации через Google; запрет `list` и всех клиентских записей. Это не означает, что владелец уже имеет custom claim и что метрика реально существует.
4. `site_admin` read только админу; библиотечные права разграничены по видимости и owner; финальный catch-all deny защищает неизвестные пути (общее поведение прав по Firestore не заменяет проверку реальных запросов).

## Реальное тестирование

- [TEST PR #3](https://github.com/velardream-ctrl/riveria-sanasto-community-test/pull/3), DRAFT/unmerged, HEAD `d82a457d49f2d47583956452b730f4f41064c248`.
- [GitHub Actions isolated Firestore emulator #42110368136](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42110368136): **SUCCESS, 108/108 PASS, 0 FAIL**. Специальные snapshot тесты #106/#107 проверяют byte equality, T allow, M/P/H deny, чужой UID deny. Существенные прежние emulator tests на student/admin доступы остались включены.
- [GitHub Actions admin regression #42110368137](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42110368137): **SUCCESS** на том же HEAD. Все вызовы emulator `demo-...`, без live Rules deploy и пользовательских данных.
- **Прозрачная ошибка первого теста:** [ранний CI #42109909237](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42109909237) FAIL из-за специальной `$'` последовательности при генерации JavaScript замены теста (не ошибка Firestore Rules). Восстановлен предыдущий тестовый файл из чистого Git blob, повторно вставлен callback с синтаксической проверкой, финальный CI SUCCESS. Снимок правил **не повреждался и не перезаписывался**.

## Ограничения и следующее действие

**Полученную редакцию больше не требуется копировать из консоли для повторных offline-тестов.** При настоящем изменении опубликованных Rules надо получить новое подтверждение/новый версионированный snapshot, не перезаписывать старый. Ни эмулятор, ни screenshot не подтверждают server-side custom claim, реальную доступность `admin_metrics/current`, успешную облачную синхронизацию двух устройств или безопасность фактически выполненных user API запросов.

NEW-009 по-прежнему **3/3 KNOWN RED** (ложный success cloud refresh); NEW-006 M/P/H несовместимость published-копии OPEN; independent backup/restore и iOS12 browser acceptance OPEN. Этап F ZIP PAUSED до после учебного запуска. Production/main, TEST main/Pages, Firebase TEST/LIVE, аккаунты, бюджет и частные данные не изменялись.

**Next RUN:** разрешённый NEW-009 source fix + 3/3 PASS, затем отдельный owner-reviewed TEST-only additive patch к **уже заархивированным правилам** для NEW-006 и админский реальный allow/deny pilot. **Не публиковать** никакой Rules без отдельного согласования, read-back/rollback и разрешённого способа работы.
