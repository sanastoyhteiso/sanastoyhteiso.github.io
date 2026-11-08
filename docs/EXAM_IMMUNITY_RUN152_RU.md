# RUN-20261108-152 / НАЧАЛ — учебные скриншоты и два приложенных файла

Дата: 08.11.2026, Europe/Helsinki. Владелец попросил сверить снимки двух Moodle-заданий и материалы «Perus_VERENKIERTO (circulatio)_181111.pdf» (16 страниц), «Puolustusjärjestelmä.pptx» (24 слайда); добавить только новые термины в рабочий словарь с объяснениями и журналом. Ранее прямо разрешал пополнение рабочего словаря.

**До изменений:** main `ef32a6e12164bde0d92dbc257e5e3e3eeca79ebf`, экзаменационный файл 378 записей, `data.js` 1296 исходных, 1425 уникальных в памяти; последние ID T90283. Резерв `backup/pre-immune-terms-run152-20261108`, рабочая ветка `feat/immune-terms-run152-20261108`.

**Проверка снимков:** первая задача: trombosyytti→veren hyytyminen, lymfosyytti→vasta-aineet (упрощение для B-клеток), erytrosyytti→hapen kuljetus, granulosyytti→tulehdussolu; все четыре клетки уже присутствуют с FI/RU-пояснениями. Вторая задача: верный ответ на формулировку про низкую глюкозу после длительного интервала — glukagoni, ошибочно выбран glykogeeni. Insuliini, glukagoni и glykogeeni уже существуют; дубли не делать. В анатомическом задании все восемь сосудов покрыты карточками RUN150/151; различие между taaempi säärivaltimo и pohjevaltimo отмечено.

**План:** найти дополнительные недостающие иммуно-гематологические понятия именно по загруженным материалам, не импортировать группы крови ABO/Rh (EI Veriryhmät). Новые записи в существующие темы EXAM04/EXAM05, с RU/EN и полноценными FI/RU-объяснениями, латинскими названиями лишь при корректном варианте. Проверить дубликаты FI/ID, сохранность старых 378 экзаменационных записей и `data.js`, синхронизацию версии JS+sw cache, ES5/iOS12, CI и Pages. Публикацию — только после успешного CI.

Не затрагивать Firebase/Firestore/Auth/Rules, Sheets, пользовательские данные и прогресс, чужие ветки/PR. Для PPTX отделять буквальное содержание лекции от кратких пояснений, исправленных в соответствии с современной анатомической терминологией (например, plasma ≠ plasmasolu). Завершить ЗАВЕРШИЛ или BLOCKED с ссылками.

## ЗАВЕРШИЛ — 08.11.2026 (Europe/Helsinki)

**Итог:** PUBLISHED / CI_3_3_SUCCESS / PAGES_3_3_SUCCESS / DEVICE_QA_PENDING.

**Проверено по двум скриншотам:** 4 слова trombosyytti, lymfosyytti, erytrosyytti, granulosyytti уже присутствовали и содержали FI/RU пояснения; правильные связи: свёртывание, иммунный ответ/антитела, перенос кислорода, участие в воспалении. На втором скриншоте неверный ответ glykogeeni при низком сахаре, **правильный — glukagoni**. Оба слова, а также insuliini уже имелись с объяснениями и не дублировались. Все термины артерий RUN150/151 сохранены. Снимки использованы как учебный список, ответы владельца в Moodle не изменяли.

**Источники:** прикреплённый `Perus_VERENKIERTO (circulatio)_181111.pdf` (16 страниц, темы кровообращение, клетки крови, гормоны) и `Puolustusjärjestelmä.pptx` (24 слайда: барьерная защита, innate/adaptive immunity, фагоциты, антигены, T/B-клетки, интерфероны и словарь). Термины проверены на отсутствие дубликатов в `data.js` и `riveria-anatomy-exam.js`. Оригинальные краткие пояснения FI/RU — не дословные цитаты источников. Отделены несовпадающие понятия `plasmasolu` и `plasma`, не повторено ошибочное определение из слайдов. Исключены ABO/Rh из экзаменационного словаря согласно EI Veriryhmät.

**Добавлено 21 новое слово** T90284–T90304: fagosyytti, interferoni, antigeeni, tulehdusreaktio, plasmasolu, seerumi, fibrinogeeni, synnynnäinen immuniteetti, hankittu immuniteetti, normaalifloora, makrofagi, T-muistisolu, T-tappajasolu, B-imusolu, immunologinen muisti, C-reaktiivinen proteiini, histamiini, plasma, fagosytoosi, hapen kuljetus, värekarvat. 20 — EXAM04 Veri ja puolustusjärjestelmä; värekarvat — EXAM06 Hengitys. Каждая с FI/RU/EN, FI/RU пояснениями; латинское название — только где уместно, не отдельный язык интерфейса.

**Сохранность:** 378 предыдущих экзаменационных записей и 10 тем прежние, теперь **399 экзаменационных записей** и **1446 уникальных карточек при совместной загрузке** с неизменным `data.js` (1296 исходных). Нет изменения личных результатов, Firestore/Auth/Rules, Google Sheets, тарифов, чужих веток или ключей. Обновлены `riveria-anatomy-exam.js`, версии подключений в `index.html`/`sw.js` (`immune-run152-v1`, offline cache `rc21`), совместимые тесты с новыми точными количествами и обязательный новый тест `release-checks/exam-immune-run152.test.cjs`.

- Backup до начала: `backup/pre-immune-terms-run152-20261108` от SHA `ef32a6e12164bde0d92dbc257e5e3e3eeca79ebf`.
- [PR №26 MERGED](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/26), merge SHA `36dccc4ea7b24dac71c8045dfa04067bb48b3a2d`, exact code head `d832f52bfa57363d933618c782cba2573302cc17`.
- [CI №42475012728](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42475012728): exact-head **3/3 SUCCESS** — release preflight with RUN152 regression, failclosed sync and isolated Firestore rules emulator.
- [GitHub Pages №42475096466](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42475096466): **3/3 SUCCESS** — build, report-build-status, deploy for exact merge SHA.

**Следующее действие:** на личном устройстве владельца открыть «Veri ja puolustusjärjestelmä» и проверить `antigeeni`, `plasmasolu`, `plasma` с блоком Latina → FI → RU; `värekarvat` искать в Hengitys. Не очищать localStorage; реальный Safari/iOS12 E2E не объявлен PASS. Нерешённые общепроектные A–K остаются независимо от этого словарного обновления.
