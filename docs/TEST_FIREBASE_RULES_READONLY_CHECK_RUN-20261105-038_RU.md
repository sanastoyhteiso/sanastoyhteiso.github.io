# RUN-038 — безопасная проверка опубликованных TEST Firebase Rules без записи

**Дата:** 05.11.2026. Только готовый код и офлайн-тесты; Cloud Shell владельца и настоящий Firebase **не вызывались** этим ChatGPT.

## Новый инструмент

TEST PR #3: `admin/ops/inspect-test-rules-readonly.cjs`; тест `admin/ops/inspect-test-rules-readonly.test.cjs`; включены в `.github/workflows/admin-regression.yml`.

Проверка предназначена для **одного будущего запуска владельцем** в уже авторизованном приватном Google Cloud Shell:
1. Сначала считывает `gcloud config get-value project`; при любом отличии от `sanastoyhteiso-v3-development` прекращает работу **до получения токена и вызова API**.
2. Получает локальный OAuth access token внутри процесса `gcloud auth print-access-token` (не печатает его и не сохраняет); далее использует только Firebase Rules REST **GET** `projects.releases.get` и `projects.rulesets.get` для default Firestore database.
3. Требует, чтобы `rulesetName` принадлежал тому же **точному** тестовому проекту. Возвращает только имя release/ruleset, UTC метки времени (если API их предоставил), SHA-256 от упорядоченных текстов исходников, число файлов, наличие текстового маркера `admin_metrics/current`, статус старого T/W и нового T/M/P/H/W allowlist.
4. **Не выводит полный исходный текст правил, токены, email, UID или личные данные**, не создаёт файлы с секретами и не делает **POST/PUT/PATCH/DELETE**. Любая ошибка остановки выводится обезличенно.
5. Текстовый маркер разрешения **не заменяет** настоящий серверный emulator/browser authorization тест; HASH не является сертификатом прав, а только контрольной суммой полученного текста.

Документация API: https://firebase.google.com/docs/reference/rules/rest/v1/projects.releases/get и https://firebase.google.com/docs/reference/rules/rest/v1/projects.rulesets/get .

## Проверенные результаты GitHub

- TEST [PR #3](https://github.com/velardream-ctrl/riveria-sanasto-community-test/pull/3), exact HEAD `f22b0c5c5ba56dc35929523e5ae07b2e516834ca`, draft/unmerged.
- [Client/admin regression #42006488921](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42006488921) **SUCCESS: 57/57** (включая новые offline security assertions), plus syntax/manifest.
- [TEST Firestore emulator #42006488970](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42006488970) **SUCCESS: 90/90** на том же HEAD.
- [Read-only helper commit 27e311d](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/27e311d1ae8032b8a400bf104b25eba6b49ef14a), [tests fb44fbf](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/fb44fbfcf14d1e378cc04b4f7f33a3a62e078297), [workflow f22b0c5](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/f22b0c5c5ba56dc35929523e5ae07b2e516834ca).

## Что требуется дальше (минимум времени владельца)

**Сейчас никаких действий владельца не нужно.** В следующий доступный разрешённый облачный сеанс с участием владельца запустить только read-only инспектор и получить обезличенный итог. Не просить владельца прислать токены/исходники Rules. Нельзя выполнять команду, скачанную из GitHub, пока не сверены PR HEAD и содержание тестов.

Если используется PRIVATE Cloud Shell и авторизованный доступ Git, пример *будущей* последовательности:

```bash
gcloud config get-value project
git clone --depth 1 --branch feat/admin-control-center-package-spec-20261104 https://github.com/velardream-ctrl/riveria-sanasto-community-test.git ~/sanastoyhteiso-v3-inspector
cd ~/sanastoyhteiso-v3-inspector
node admin/ops/inspect-test-rules-readonly.cjs --inspect
```

Эта последовательность **не запускалась** текущим ChatGPT. Точный проект проверяется скриптом повторно, он не использует service-account key и никаких изменений cloud не публикует.

Если результат исторический T/W — перед публикацией нового TEST Rules подготовить минимальный **TEST-only patch** на основе **считанного текущего правила**, сохранить предыдущий live ruleset/release ID, прогнать свежий локальный emulator с полным источником и только после отдельного owner GO менять TEST правила. Если API недоступен, статус BLOCKED/READ_ONLY_AUTH и продолжить независимые задачи. TEST default main, рабочая Firebase `riveria-sanasto-community-test`, production Pages и тариф не затрагивались.

**Текущий критерий:** RUN-038 DONE OFFLINE; Stage C/NEW-006 LIVE OPEN, все A–K NO-GO.
