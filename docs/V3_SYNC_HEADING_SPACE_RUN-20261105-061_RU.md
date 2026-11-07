# RUN-20261105-061 — исправлена крайняя пробельная ошибка перевода заголовка синхронизации V3

Дата: 2026-11-05 Europe/Helsinki. Stage E/J, только DRAFT TEST PR №3, **без облачных или production изменений**.

## Причина
После RUN-060 ручная проверка `v3-unified-preview/i18n.js` установила, что единственный исходный RU-ключ имел конечный пробел: `"Синхронизация между устройствами: "`. Функция `asText` разделяет строки на начальные/крайние пробелы и `core` без них. Поэтому строгий lookup `dict[core]` не находил перевода заголовка. Код заголовка в V3 `status()` продолжает выводить тот же пробел для отступа — менять текст DOM не требуется.

## Изменения
- DRAFT `v3-unified-preview/i18n.js`: у единственного RU-ключа удалён конечный пробел. FI `Synkronointi laitteiden välillä:`, EN `Sync across devices:`; исходная строка в DOM по-прежнему с пробелом. [Commit dbacba1](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/dbacba124e4002ef775796d7073692e95c07e195).
- TEST `index.html` и `sw.js`: `i18n.js?v=v3-approved-ui-4`, cache namespace v11 для будущей тестовой публикации. [HTML 0906094](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/09060943ffbdf3531ac272fb2dc28a04cfc66b24); [SW 63cb932](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/63cb9329868978d9a94df17534adb9723f86a7f2).
- [Actual V3 runtime test f3a99c6](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/f3a99c62d2b6d5f9f7475fcee2400953749ea0f5): добавлен проверяемый FI/EN/RU перевод заголовка с сохранением крайнего пробела; обновлены тесты версии ассетов. 256 локализованных строк и остальные 8 предыдущих runtime сценариев не изменены.
- [GitHub Actions #42099155329](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42099155329): **SUCCESS на точном HEAD `f3a99c62d2b6d5f9f7475fcee2400953749ea0f5`**: V3 runtime 9/9, i18n dictionary 6/6, My Finds 8/8, admin 70/70, telemetry 21/21, browser queue 22/22, ingress 23/23, ZIP manifest PASS. Промежуточные CI FAIL от старых версий кэша перед обновлением тестов не являются финальным результатом.

## Ограничения
Код находится в DRAFT TEST PR №3, не опубликован и не проверен на настоящем iOS12 или с Firebase Cloud. Основной сайт, TEST default main, реальные ученики, Firestore Rules, Auth, Google Sheets и тариф не затронуты. A–K остаются OPEN/NO-GO; RUN-045 Cloud Rules BLOCKED; физический browser acceptance потребуется позднее. Владелец не может установить предложенное Firebase приложение на телефон/старый Mac — см. RUN-057, повторно не просить.
