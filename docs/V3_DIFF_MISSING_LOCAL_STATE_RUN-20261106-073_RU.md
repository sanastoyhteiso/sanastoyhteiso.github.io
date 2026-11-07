# Sanastoyhteisö 3.0 — RUN-073 / NEW-011: исчезновение локальных учебных записей без предупреждения

**Дата:** 06.11.2026. **Статус:** независимый дефект подтверждён, минимально исправлен в TEST DRAFT PR #3, проверен и перенесён в RELEASE DRAFT PR #9. **Рабочий сайт и Firebase не изменены.** Общий релиз по-прежнему **NO-GO** из-за NEW-009.

## Обнаружение

Чистая функция `v3-sync-diff.js` `changes(previous,current)` преобразует изменения локального состояния в V3 event intents. Прежняя версия проходила только по ключам `current.scores`, `current.words` и `current.favorites`. Если после сбоя localStorage, неполного восстановления или смены версии из локального объекта исчезало **уже существовавшее значение** (карточка, личное слово, избранное), функция возвращала `{events:[],unsafe:[]}`, молча принимая частичную потерю данных как отсутствие изменений.

Это независимый от NEW-009 дефект: NEW-009 — ложное сообщение успешного **cloud refresh** внутри `v3-sync-release.js`; здесь проверяется отдельный **pure diff** source. Заблокированный ранее исходник `v3-sync-release.js` **не менялся**.

## Исправление

В `changes()` до обработки новых данных добавлена проверка **всех прежних ключей** через `Object.prototype.hasOwnProperty.call`. Исчезновение ключа отмечается в `unsafe`:

- `missing-score:T00001` — исчезла карточка с прежним результатом;
- `missing-word:W_...` — исчезло или было неявно помечено удалённым личное слово;
- `missing-favorite:M00012` — прежняя избранная запись пропала из хранилища.

Прямое, явно представленное действие `favorite=false` **не блокируется**: генерируется `favorite_set(false)`. Новые ответы и пользовательские слова разрешены. `capture()` уже прекращает запись событий, если `unsafe` непустой, и показывает сообщение о несогласованности; эта функция не модифицировалась. Автоматическое удаление/возврат пользовательских данных не вводились.

## Хронология и фактические CI-доказательства

1. В TEST DRAFT созданы [четыре synthetic regressions](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/tests/v3-diff-missing-state-guard.test.cjs), commit `acfcd553722959c70301b2c2df0895379bb36f25`. На прежнем source [первоначальный CI #42161067697](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42161067697) воспроизвёл **3 failure / 1 pass**, соответственно silent loss score/word/favorite.
2. TEST-only pure source исправлен [commit 8fb4266](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/8fb42669ec6342cc1569da655d9b26ff6dfecb05). После изменения всех precached источников пересчитан offline fingerprint для старого iPad: namespace `sanastoyhteiso-v3-unified-preview-assets-93c930929b90fd60`, [commit 9e5ab85](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/9e5ab851a4383d2b1a1427de72ed28d3e6441c4f).
3. [TEST exact-head Actions #42161260890](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42161260890) **SUCCESS**, NEW-011 **4/4 PASS**, отдельный offline cache shell gate 6/6 PASS; [TEST Firestore emulator #42161261024](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42161261024) **SUCCESS**. Diagnostic NEW-009 продолжает 3/3 **KNOWN RED**, общий TEST CI не означает починку этого отдельного дефекта.
4. Сверен старый Git blob `v3-sync-diff.js` `7f89396850b90ec7ce61150a6daf21bd2330d774`; в RELEASE DRAFT PR #9 перенесён **точно такой же Git blob**, как в TEST, `7cad0e21b2bafa0b8b8b18557244998aa34865f7`, [commit f82579b](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/f82579bd5069a3d96108b75cf54a46db39b04259). Добавлены отдельные assert в [release-checks/v3-diff.test.cjs](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/release-checks/v3-diff.test.cjs) без изменения остальных интеграционных tests.
5. Для релизного черновика изменены **только** ссылки на `v3-sync-diff.js?v=release-preview-2` в `index.html` и `sw.js`; обновлён offline `CACHE_NAME=riveria-sanasto-community-v3.0.0-rc2`, а preflight проверяет согласованность. Никаких реальных Pages deploy или изменения production `main` не было.
6. [RELEASE DRAFT Actions #42161675003](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42161675003) на точном source head `9eefef73d852fc1d3dada41524ae7d6937c0ceb5`: независимые **`release-preflight` SUCCESS** и **`firestore-v3-rules-emulator` SUCCESS**, **`sync-failclosed-release-gate` EXPECTED FAILURE 3/3 NEW-009**. Общий статус **FAILURE/NO-GO правильно сохранён**; ни один тест не отключён ради зелёного CI.

## Границы результата и последующие действия

Эта защита предотвращает **молчаливое принятие исчезнувших локальных ключей в diff**; она не доказывает end-to-end сохранение после отказа сети, не подтверждает безопасность всех сценариев восстановления и не исправляет реальный NEW-009 `refresh()`. Код находится в DRAFT PR #3 и DRAFT PR #9; пользовательские данные, права и опубликованные страницы не тронуты. **iOS12/два устройства/два аккаунта** требуют реального acceptance test до выкладки. Прежние правила TEST Firebase NEW-006 были по словам Work опубликованы, владелец прислал TMPH source; независимый Cloud release ID/readback ещё не получен.

Продолжение: при появлении разрешённого средства исправить `v3-sync-release.js` NEW-009 (3/3 должны стать PASS), затем реальные два устройства и резервная копия→восстановление. Этап ZIP/F по решению владельца PAUSED до после учебного запуска. Не делать production merge без явного owner GO.
