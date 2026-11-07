# RUN-20261105-060 — полноценнее FI/EN интерфейс «Мои находки» и синхронизации V3

Дата: 2026-11-05, Europe/Helsinki. Stage E/J. **Только DRAFT TEST PR №3; реальная опубликованная версия сайта и Firebase не менялись.**

## Подтверждённая проблема

В `v3-unified-preview/v3-sync-release.js` сообщения подключения, «Мои находки», кнопки и тема личной находки содержали русские строки. В `i18n.js` отсутствовали соответствующие RU→FI/EN ключи; MutationObserver не мог перевести текст, которого нет в словаре. Заголовок и подтверждение подключения V3, счётчик очереди, кнопки добавления/удаления и тексты ошибок могли оставаться по-русски при выборе финского или английского интерфейса. Это **доказанный дефект исходного DRAFT UI**, не заявление о выпущенном сайте.

## Выполнено в TEST PR №3

- `v3-unified-preview/i18n.js`: добавлены 28 полных FI/RU/EN троек (всего 256) для V3; 9 безопасных префиксов ошибок; числовой `включена · N в очереди` и суффикс ` · В мои находки` переводятся по шаблону с сохранением чисел и личных терминов. [Коммит 113778e](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/113778e0814367fb9d7e49e99b4556bd2eeda059), [динамические строки 86bbe17](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/86bbe17327f25c6b0c63fa883b2d8d9d95a80bfc).
- `v3-unified-preview/v3-sync-release.js`: первый запрос на включение V3 проходит через имеющуюся `RS_I18N.translate`, а название `practice/study/other` в «Моих находках» помещается в отдельный текстовый `span`; пользовательское слово и свободная заметка остаются буквальными текстовыми узлами, без перевода. [Коммит b23e8f0](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/b23e8f0f629a693781970689e42ff571a58db5af).
- TEST `index.html` / service worker: `i18n.js?v=v3-approved-ui-3` и `v3-sync-release.js?v=v3-myfinds-i18n-1`; isolated cache namespace `v10`. [HTML 1679b9c](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/1679b9c2bfce82b1a87de8f023e1444db1d437f8), [SW 03533db](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/03533db321311e56ca7312f0a5288d9ff8991fdd).
- `admin/tests/v3-sync-i18n-runtime.test.cjs`: реально исполняет существующий ES5 i18n скрипт в изолированном Node VM без браузера, Firebase, сетевых запросов и пользовательских данных; проверяет FI/EN подписи, динамическую очередь, суффикс карточки с сохранением персонального текста, префиксы ошибок, перевод диалога первого подключения, отдельную тему от private note и версию кэша. `admin/tests/i18n-ui-quality.test.cjs` и CI hook обновлены. [Тесты 92fa46d](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/92fa46d9a6fe9712e67256989be6f497d872fd2c), [CI hook 768d4ec](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/768d4ec6026b1288d1a2a8c3d59b8211b8620171).
- [Admin GitHub Actions #42098557619](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42098557619): **SUCCESS на exact code HEAD `768d4ec6026b1288d1a2a8c3d59b8211b8620171`** — новые runtime i18n 8/8, прежние i18n 6/6, My Finds 8/8, admin 70/70, telemetry 21/21, browser queue 22/22, ingest mock 23/23, manifest PASS.

## Честные границы

- Код остаётся в DRAFT TEST PR №3: **нет merge/deploy** в TEST default main или production. Реальный визуальный осмотр Safari12/iPhone, сценарий двух Google-аккаунтов и опубликованные TEST Firebase Rules до сих пор не подтверждены. Автоматические Node VM проверки не эквивалентны физическому браузерному тестированию.
- Не менялись Firebase TEST/LIVE, права, тариф, приватные слова/результаты, существующие рабочие сайты или Google Sheets. Релиз A–K OPEN/NO-GO. Не просить владельца установить Firebase на старый Mac/телефон (RUN-057).

**Далее:** получить авторизованный read-only TEST Firestore Cloud Rules/version (RUN-045 BLOCKED), затем отдельно разрешённый synthetic owner-only pilot/restore и визуальный тест реальных FI/EN/RU экранов. При дальнейшей работе в GitHub сохранять журнал и проверять exact HEAD.
