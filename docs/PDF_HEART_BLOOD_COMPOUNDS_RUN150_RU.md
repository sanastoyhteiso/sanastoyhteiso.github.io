# RUN-20261108-150 / НАЧАЛ — сложносоставные термины «Sydän, veri ja verenkierto»

Дата: 08.11.2026 Europe/Helsinki.
**Основание:** пользователь приложил учебную презентацию `Sydän, veri ja verenkierto.pdf` (19 слайдов) и поручил сразу добавить недостающие сложносоставные термины и их FI/RU объяснения в **рабочий сайт** Sanastoyhteisö, в существующий выбор 10 экзаменационных тем (без новой вкладки).

**Исключения:** у владельца по плану Riveria экзамена `EI: Veriryhmät`; поэтому слайды 18–19 (ABO, Rh, reesustekijät) НЕ импортировать в экзаменационный словарь, хотя они присутствуют в PDF. Слайды 16–17 (haiman hormonit) отнести к EXAM09, слайд 12 sympaattinen/parasympaattinen к EXAM10; остальные к EXAM04/EXAM05 по смыслу. Номера страниц в пользовательском раскрывающемся меню относятся к `Päästä varpaisiin (2014)` и остаются неизменными; номера слайдов этого PDF хранить только в исходном перечне для контроля происхождения.

**До изменений:** `main` SHA `84d01f0f2c4794bea288a3846a5c774cea6fdb3b`, создан `backup/pre-heart-blood-pdf-terms-20261108`, отдельная ветка `feat/heart-blood-pdf-compounds-20261108`. `data.js` 1296 базовых слов неизменен. Ранее 307 записей в `riveria-anatomy-exam.js`, включая 13 новых слов PR22; все объяснения FI/RU восстановлены RUN149.

**План:** внимательно сверить составные названия и диаграммы PDF со всеми `RS_DATA.terms` и экзаменационными карточками, не добавлять дубликаты, сохранять существующие ID/learned. Для новых FI создать отдельные стабильные ID начиная с `T90213` после проверки отсутствия коллизий; FI и RU объяснения простые, латинские слова только когда термин уместен, не выдумывать Latin для функционального процесса. Не переписывать существующие 307 определений. Присваивать только существующие темы EXAM04/EXAM05/EXAM09/EXAM10. Записать FI, RU, EN, Latin, FI explanation, RU explanation, topic ID и PDF slide number в отдельный read-only перечень + GitHub журнал.

**Цель проверки:** Node CI удостоверяет отсутствие дублей FI и ID, сохранность 289 ранее добавленных карт, полноту FI/RU объяснений, соответствие слайдам, EI exclusion, отсутствие изменений Auth/Firestore/Rules/уже записанного прогресса и корректный показ Latin→FI→RU после открытия. Дать версионированный JS и офлайн cache для старого Safari iOS12. После 3/3 CI и безопасного SHA-merge — Pages deploy. До подтверждения CI публикации не производить.

**НЕ ИЗМЕНЯТЬ:** Firebase, Firestore/Auth/Rules, Google Sheets/Drive, личные словари, счётчики изученного, тариф, другие ветки Work, рабочую базу `data.js`.


## RUN-20261108-150 / ЗАВЕРШИЛ — production опубликован
Дата 08.11.2026 Europe/Helsinki.

**Результат:** исследована предоставленная владельцем презентация `Sydän, veri ja verenkierto.pdf` (19 слайдов). Из слайдов 2–17 отобраны 65 новых сложных учебных терминов, ранее отсутствовавших в `data.js` и `riveria-anatomy-exam.js`. Добавлено 65 карточек FI/RU/EN с пояснением FI+RU (65/65), латинской подсказкой по смыслу у 49 (49/65), 16 без натянутой латинской замены. Новые публичные ID `T90213..T90277`, не конфликтуют с пользовательскими результатами. Источник + привязка к слайду: `content-imports/heart-blood-pdf/SYDAN_VERI_VERENKIERTO_TERMS_20261108.json`.

**Темы:** 17 новых терминов EXAM04 `Veri ja puolustusjärjestelmä`; 36 EXAM05 `Verenkierto`; 10 EXAM09 `Hormonaalinen säätely`; 2 EXAM10 `Hermosto ja aistit`. У 10 существующих экзаменационных тем/учебных страниц `Päästä varpaisiin (2014)` ничего не менялось. Номера слайдов прикреплённого PDF сохранены только как метаданные `examPdfSlide`, не подменяют номера страниц учебника. **EI Veriryhmät**: слайды 18–19 об ABO/Rh не добавлялись по прежнему явному исключению владельца. Если владелец отдельно изменит границы EI, это отдельная задача.

**Сохранность:** 307 старых экзаменационных записей с FI/RU определениями оставлены неизменными; в публичном exam JS теперь 372 записи с FI/RU объяснениями. `data.js` прежние 1296 исходных слов SHA `fa65cf3ba0683309050a7dc729d6898699a63bbc` без перезаписи. Все ID и пользовательские данные, Auth/Firestore/Rules, Google Drive/Sheets и настройки других чатов untouched. Визуальный экзаменационный блок после RUN149 `Latina → FI → RU` сохранён. Отдельного dropdown/UI языка LA не создавалось. Браузерный cache `riveria-sanasto-community-v3.0.0-rc19`, новая версия `riveria-anatomy-exam.js?v=heart-blood-pdf-v4`.

**Проверки и публикация:**
- [PR №24](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/24) MERGED строго после защиты main/head SHA в коммит `f0d67b9bf37ac0587b451924d656e817a1746f1a`.
- [GitHub Actions CI №42471978737](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42471978737): **3/3 SUCCESS** (общие release preflight, failclosed sync, изолированный Firestore rules emulator), включая новые 5 тестов конкретно PDF 65 слов.
- [GitHub Pages №42472088005](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42472088005): **3/3 SUCCESS — build/report/deploy** именно на коммите `f0d67b9bf37ac0587b451924d656e817a1746f1a`.
- Резервная ветка перед изменением: `backup/pre-heart-blood-pdf-terms-20261108`, SHA `84d01f0f2c4794bea288a3846a5c774cea6fdb3b`.

**Практический пользовательский smoke-test:** на https://sanastoyhteiso.github.io/ открыть Карточки → `Verenkierto (s. 67–80)` → найти `keuhkoverenkierto`, `sydämen toimintakierto`; на обратной стороне ожидается `Latina`, `FI`, `RU`. В `Veri ja puolustusjärjestelmä (s. 53–66)` проверить `granulosyytti`. Если в Safari старые данные — перезагрузить страницу, НЕ очищать сохранённый прогресс или localStorage. Реальный iPhone визуальный тест ещё не подтверждён владельцем, и нельзя выдавать CI за физический E2E.
**Статус:** MERGED / CI_3_3_PASS / PAGES_3_3_SUCCESS / MANUAL_IPHONE_ACCEPTANCE_PENDING.
