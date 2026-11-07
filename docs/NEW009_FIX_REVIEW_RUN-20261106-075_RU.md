# Sanastoyhteisö V3 — RUN-075: NEW-009, проверенное предложение исправления (НЕ опубликовано)

Дата: **06.11.2026 Europe/Helsinki**. Статус: **CANDIDATE ONLY / SOURCE WRITE BLOCKED / RELEASE NO-GO**.

## Точные источники
- TEST PR #3 (DRAFT): `v3-unified-preview/v3-sync-release.js`, blob `39ef392d1c45f2c36a9ec2a9528fd34affdb5b9a`.
- RELEASE PR #9 (DRAFT): `v3-sync-release.js`, blob `f897a82a8e6bc87e329db317d7265526a13d4a4d`.
- Три обязательных release-проверки: `release-checks/v3-refresh-failclosed.test.cjs`. TEST-acceptance: `admin/tests/v3-sync-refresh-failclosed-gate.test.cjs` (запускается только при `V3_SYNC_ASSERT_FIXED=1`).
- В обоих исходниках `function refresh()` содержит **ровно одно точное совпадение** старого 15-строчного блока; source не изменён.

## Причина: 3 взаимосвязанных сбоя
1. `engine.upload().catch(function(){return null;})` глотает ошибку записи и всё равно продолжает чтение.
2. `refresh()` не проверяет, что `r.pending.length === 0`, но утверждает, что данные сверены с облаком.
3. `orderly()` уменьшает `queued` в последующей микрозадаче; исходная внешняя `.then()` отрабатывает раньше, `apply(r)` пропускается без ошибки и выдаёт ложный успех.

## Предлагаемая минимальная замена ТОЛЬКО `refresh()`
Заменить одинаковый блок в TEST и RELEASE при **разрешённом source editor** и после независимой проверки SHA. Это предложение не является изменением в GitHub source:

```js
 function refresh(){
   if(!active())return Promise.resolve(false);
   var owner=uid,token=epoch;
   var job=orderly(function(){
     // A failed upload must never be reinterpreted as cloud success.
     return engine.upload().then(function(){
       return engine.refresh();
     }).then(function(r){
       if(!r||!r.state||!Array.isArray(r.pending))
         throw Error('Invalid V3 refresh result');
       if(r.pending.length)
         throw Error('Unsent V3 changes remain in IndexedDB');
       return r;
     });
   });
   // Wait for THIS operation's queue cleanup before applying cloud data.
   // If a new write appears meanwhile, do not overwrite the newer local UI.
   var settled=queue;
   return job.then(function(r){
     return settled.then(function(){
       if(token!==epoch||uid!==owner||!active())
         throw Error('V3 account changed during refresh');
       if(queued!==0)throw Error('New changes queued during refresh');
       if(!apply(r))throw Error('V3 cloud state not applied locally');
       text('Данные V3 сверены с облаком.',false);
       return true;
     });
   }).catch(function(e){
     text('Сверка V3 не выполнена: '+String(e.message||e),true);
     return false;
   });
 }
```

## Локальная независимая проверка предложения (не GitHub Actions)
На **синтетической модели** с теми же очередью/счётчиком/записью в локальный UI воспроизведены **все три известные ошибки старой версии**. Затем Node.js v22 `node --test` дал **8/8 PASS**:
- отказ `upload` → нет cloud OK и нет записи UI;
- непустая очередь `pending` → нет cloud OK;
- полная синхронизация → `apply` после завершения `orderly`;
- отказ локальной записи → FAIL-CLOSED;
- повреждённый remote snapshot → FAIL-CLOSED;
- смена пользователя во время чтения → без записи чужой сессии;
- новое локальное событие во время чтения → не перезаписываем устаревшим cloud;
- старая функция воспроизводит 3 дефекта.

**Ограничение проверки:** это модель отдельной функции, а НЕ полный запуск реального `v3-sync-release.js` из GitHub, НЕ одобренный кодовый коммит, НЕ emulator/device/Firebase CI. Статус 3 обязательных source-тестов **по-прежнему RED**. Патч нельзя считать выпущенным.

## Следующие обязательные действия через разрешённый source editor
1. Проверить source SHA/дифф, минимально заменить `refresh()` в TEST PR #3. Нельзя обходить прежний отказ safety/editor через другой путь записи.
2. Включить `V3_SYNC_ASSERT_FIXED=1` для теста TEST и проверить 3/3; расширить тестами account switch, concurrent events, corrupt storage, pending >12, refresh network error. Запустить все TEST CI, rules emulator, offline-shell и ES5-синтаксис.
3. Синхронно перенести проверенное исправление только в RELEASE DRAFT PR #9, сохранить mandatory `sync-failclosed-release-gate` и получить exact-HEAD 3/3 PASS + остальные CI PASS. При изменении JS обновить SW cache fingerprint/asset hashes и проверить offline.
4. Отдельно провести реальные TEST: 2 устройства/2 аккаунта/iOS12, Firebase permission, независимый Firestore→закрытый Sheets backup/readback/restore, admin monitor. Пока это не доказано — NO-GO.
5. Production main, TEST main/Pages, TEST/LIVE Firestore/Rules, авторизация, пользователи, данные, billing, ZIP здесь **НЕ менялись**.

## Передача состояния
Последний завершённый RUN-074; RUN-075 старт зафиксирован в append-only journal. Данный документ — безопасная техническая передача проверки и предложение корректировки. Нельзя записывать `NEW-009 FIXED` или `RELEASE PASS` до настоящего разрешённого изменения и независимого CI.
