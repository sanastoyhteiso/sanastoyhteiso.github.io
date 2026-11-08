# RUN-20261108-151 — дополнительные артерии, рабочий экзаменационный словарь

## НАЧАЛ — 08.11.2026 (Europe/Helsinki)

Владелец прямо разрешил добавить недостающие слова в рабочий сайт https://sanastoyhteiso.github.io/ и зафиксировать изменения в GitHub.

**Базовая проверка:** на main commit `e744d940e526a3d4ada44d47c4f14cb3db4e18a8`, файл `riveria-anatomy-exam.js` содержит три требуемых слова: kaulavaltimo (T90224), olkavaltimo (T90225), lonkkavaltimo (T90227), все с латинским названием и FI/RU пояснением. Не добавлять вторые экземпляры.

**План:** добавить только отсутствующие анатомические записи kyynärvaltimo, värttinävaltimo, polvitaivevaltimo, jalanselänvaltimo, taaempi säärivaltimo; сохранить исходную пользовательскую формулировку «eli pohjevaltimo» в пояснении, указав, что pohjevaltimo (arteria fibularis) является самостоятельным сосудом, и добавить его отдельной карточкой. Всего 6 новых записей вместо ошибочной синонимии. EXAM05 Verenkierto, новые стабильные ID T90278–T90283, FI/RU/EN и латинские подписи с FI/RU объяснениями.

**Изменяемые файлы:** `riveria-anatomy-exam.js`, `index.html`, `sw.js`, этот журнал. При необходимости отдельный проверочный тест. Не изменять `data.js`, Auth/Firestore/Rules, пользовательский прогресс, аккаунты, Sheets и настройки Firebase. Старые карточки/ID и 10 тем с номерами страниц сохраняются.

**Резервная ветка до изменений:** `backup/pre-arteries-exam-run151-20261108` на точном исходном commit. Рабочая ветка: `feat/exam-arteries-run151-20261108`.

**Ожидаемые проверки:** отсутствие коллизий и дублей, неизменность ранее добавленных 372 экзаменационных записей, работа ES5/iOS12, обе версии FI/RU пояснения и Latin, синхронное обновление офлайн-кэша, CI и Pages deploy. Сначала PR/CI; merge в main только при подтверждённой безопасности. Итог сохранить как ЗАВЕРШИЛ или ОШИБКА/ЗАБЛОКИРОВАНО с доказательствами.

## ЗАВЕРШИЛ — 08.11.2026 (Europe/Helsinki)

**Статус: PUBLISHED / CI_3_3_SUCCESS / PAGES_3_3_SUCCESS / MANUAL_DEVICE_QA_PENDING.**

- Добавлены **6 новых отдельных записей** в существующую тему EXAM05 «Verenkierto» (страницы 67–80): `T90278 kyynärvaltimo / arteria ulnaris`; `T90279 värttinävaltimo / arteria radialis`; `T90280 polvitaivevaltimo / arteria poplitea`; `T90281 jalanselänvaltimo / arteria dorsalis pedis`; `T90282 taaempi säärivaltimo / arteria tibialis posterior`; `T90283 pohjevaltimo / arteria fibularis`. Все шесть имеют FI, RU, EN, латинское название, объяснения FI/RU. Исходная ошибочная пара «taaempi säärivaltimo eli pohjevaltimo» представлена как **два разных сосуда**, в обеих карточках объяснено различие.
- 3 ранее существовавшие записи `kaulavaltimo` T90224, `olkavaltimo` T90225, `lonkkavaltimo` T90227 не дублировались и не переписывались. Ранее 372 экзаменационных дополнения, включая 65 записей RUN150, сохранены; теперь **378 экзаменационных записей**, а при загрузке вместе с 1296 исходными словами — 1425 уникальных карточек в памяти (часть экзаменационных записей привязана к существующим ID). `data.js` с 1296 словами не изменён.
- Обновлены версия экзаменационного JS в `index.html` и `sw.js` на `arteries-run151-v1` и cache `rc20` для старого Safari. Старые тесты адаптированы к новому точному количеству, добавлен `release-checks/exam-arteries-run151.test.cjs` и обязательный CI шаг. У 10 существующих тем не менялись страницы и структура меню. Права, данные, Firestore/Auth/Rules, Google Sheets, пользовательский прогресс, тариф и другие ветки не менялись.
- Резервная ветка: `backup/pre-arteries-exam-run151-20261108` от main SHA `e744d940e526a3d4ada44d47c4f14cb3db4e18a8`.
- [PR №25 MERGED](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/25), production merge SHA `cc89e89ace0b8609b3d8edd1e1444281daec2e78`; точный исходный head SHA `3687300a0682404d027c188ee36a195b62843bee`.
- [Release preflight CI №42473371939](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42473371939) **3/3 SUCCESS**: release-preflight, sync failclosed, изолированный Firestore emulator. Ранние RUN151 промежуточные CI были RED по устаревшим ожидаемым размерам и cache; ошибки исправлены и полностью перепроверены на exact head. Это синтетические проверки; реальную Firebase не изменяли.
- [Pages deploy №42473652971](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42473652971) **3/3 SUCCESS**: build/report-build-status/deploy для точного production merge SHA; файлы прочитаны в main.

**Осталось:** ручной браузерный smoke test на устройстве владельца (Карточки/Тесты/Словарь → Verenkierto → найти `värttinävaltimo`, `pohjevaltimo`; увидеть Latina → FI → RU) и проверка офлайн на старом Safari. GitHub Actions/Pages не доказывают фактическую работоспособность конкретного устройства. Не очищать localStorage/прогресс при обновлении браузера.

**Следующее действие:** после подтверждения пользователя отметить ручной QA; отдельно продолжить открытые задачи A–K по реальному sync/backup/monitoring, не считать их автоматически закрытыми этим словарным обновлением.
