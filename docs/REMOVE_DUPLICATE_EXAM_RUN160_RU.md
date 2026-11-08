# RUN-20261108-160 — убрать дублирующую кнопку «Экзамен» из «Тестов»

## НАЧАЛ — 08.11.2026 Europe/Helsinki

Владелец подтвердил работу сайта, но указал, что кнопка «🎓 Экзамен / Koe / Exam · 40 заданий» внутри раздела «Тесты» теперь лишняя: «Экзамен» уже присутствует как отдельный пункт сразу после «Тесты» в боковом меню и в нижнем/горизонтальном мобильном меню. Задача: убрать **только** дублирующую кнопку из `quizModeTabs()` в `app.js`.

Проверено в текущем production main `7dcdf9c4f38b85c62f5f3d1dc724848a4ba66aeb`: функция `quizModeTabs` действительно возвращает дополнительный `data-view="exam"` внутри панели «Тесты». В `index.html` уже имеются два отдельных навигационных пункта (desktop `#side-nav` и mobile `#mobile-nav-scroll`) сразу после «Тесты»; их НЕ удалять. Не менять тексты учебных вопросов, 40-страничный экзамен, его сохранение, прогресс, Firebase, учётные записи и языки.

Резерв `backup/pre-remove-duplicate-exam-run160-20261108`; рабочая ветка `fix/remove-duplicate-exam-run160-20261108`. Синхронно обновить версии `app.js` в `index.html` и `sw.js`, кэш `rc28`; пересмотреть регрессию RUN157, которая раньше ожидала дублирующую кнопку, и проверить теперь **отсутствие** внутренней кнопки при сохранении двух внешних меню. Только после CI 3/3 и совпадения main объединить PR и дождаться GitHub Pages.

## ЗАВЕРШИЛ — 08.11.2026 (Europe/Helsinki)

**PUBLISHED / CI_3_3_SUCCESS / PAGES_3_3_SUCCESS / DEVICE_QA_PENDING.**

Удалена только внутренняя кнопка `Экзамен / Koe / Exam · 40 заданий` из функции `quizModeTabs()`. Четыре режима «Тестов» сохранены. Пункты «Экзамен» в компьютерном `#side-nav` и мобильном `#mobile-nav-scroll` меню сохранены сразу после «Тестов»; всё содержимое экзамена и автосохранение не менялись.

- [PR №33 MERGED](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/33), head `21c6240acc047b7e5fe9d40212b01edc91d95f2e`, production merge `b6257de02a5c7b366c677ddabcc527eed7c1db63`.
- [CI №42487785464](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42487785464) **3/3 SUCCESS**, включая проверку отсутствия кнопки в «Тестах» и наличия двух пунктов меню.
- [GitHub Pages №42487885621](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42487885621) **3/3 SUCCESS**, build/report/deploy exact merge SHA.
- Production main проверен по `app.js`, `index.html`, `sw.js`: 4 режима и 2 навигационных меню, отсутствует `exam-nav-entry`, exam engine и `mockSaveDraft` сохранены, версия app `remove-duplicate-exam-run160-v1`, offline cache `rc28`.
- Backup: `backup/pre-remove-duplicate-exam-run160-20261108`. Firestore/Auth/Rules, пользовательские результаты, Google Sheets, Firebase тариф не менялись.

**Ручная проверка:** в «Тестах» остались 4 вида без кнопки «Экзамен»; переход к экзамену через отдельное меню. Не очищать данные сайта — незавершённая попытка хранится локально.

