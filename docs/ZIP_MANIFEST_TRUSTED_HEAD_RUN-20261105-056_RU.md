# RUN-20261105-056 — Требование подтверждённого GitHub HEAD для ZIP-обновлений (offline)

**Дата:** 2026-11-05 (Europe/Helsinki). **Область:** Stage F/I, DRAFT TEST PR №3. **Статус:** исправление кода и CI подтверждены; реальный ZIP-публикационный сервис не создан и не запускался.

## Что было обнаружено

В `admin/rs-release-manifest.js` проверка `baseCommit` выполнялась только при переданном параметре `expectedBase`. Если параметр не был задан, синтаксически допустимый manifest мог получить `valid:true`, хотя текущая версия репозитория не подтверждалась. При будущей интеграции это могло привести к принятию пакета на устаревшей базе.

Кроме того, прежняя проверка `file.bytes` имела сложную ветку для чисел и типов. Замена на явные проверки finite integer, диапазона от 1 до 1 048 576 байт и суммарного лимита пакета уменьшает риск неоднозначного преобразования типов.

## Изменения

**Только** ветка `feat/admin-control-center-package-spec-20261104` в `velardream-ctrl/riveria-sanasto-community-test`:

- `admin/rs-release-manifest.js` — отсутствие или некорректный `expectedBase` всегда ошибка. Совпадение manifest `baseCommit` и trusted expected SHA обязательно для `valid:true`. Проверка размера исключает строки, `NaN`, `Infinity`, дроби, отрицательные значения и объекты. [Commit f1b646e](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/f1b646e1e69c6f700b777aa12b04dd639efa5fb6).
- `admin/tests/release-manifest.test.cjs` — отдельные отрицательные синтетические сценарии отсутствующего HEAD и повреждённых чисел, сохранены успешный контрольный manifest и `readyToPublish:false`. [Commit 1a5f2b0](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/1a5f2b0b8cfdd729e03716deb574f98e9a3020a2).
- [GitHub Actions #42094779778](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42094779778) **SUCCESS exact code HEAD `1a5f2b0b8cfdd729e03716deb574f98e9a3020a2`**. В логах подтверждено сообщение `PASS RUN-056: manifest requires trusted current HEAD, strict byte sizes, never publishes.` Также проходят 70/70 admin, 21/21 telemetry schema, 22/22 ES5 queue, 23/23 ingest simulator. Локальный Firestore emulator этим RUN не менялся и его отдельный новый прогон не требуется для заявлений о manifest.

## Границы результата

- Валидатор не загружает и не открывает реальные ZIP, не сравнивает их фактические SHA-256, не подтверждает полномочия администратора и не обновляет GitHub. `expectedBase` — аргумент API: настоящий сервер должен самостоятельно получить HEAD GitHub через доверенное подключение в момент публикации, а не принимать его из браузера.
- `valid:true` означает только допустимость декларации **при переданном** HEAD; `readyToPublish` остаётся **false**, `needsBackendValidation` — **true**. Никакого защищённого GitHub App/backend, доставки, PR или отката здесь нет.
- Никаких changes в TEST default main, LIVE site, TEST/LIVE Firebase, Google Sheets, claims, тариф и персональные данные.
- Этапы A–K остаются OPEN/NO-GO, Stage F/I ещё не приняты.

## Следующее

Возврат к критическому облачному барьеру: отдельная авторизованная read-only проверка действующих TEST Firestore Rules `sanastoyhteiso-v3-development`, затем согласование backend/GDPR/лимитов и только синтетический TEST пилот с отдельным разрешением владельца. До этого не продолжать накапливать имитационные зелёные статусы вместо проверяемого облачного результата.
