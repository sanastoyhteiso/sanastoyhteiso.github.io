# RUN-20261105-058 — FI / RU / EN: исправление реальных переводов интерфейса V3

Дата: 2026-11-05, Europe/Helsinki. Stage E/J (трёхъязычный UI и старые браузеры). **ОФЛАЙН ПРОВЕРЕНО; БРАУЗЕРНЫЙ ПИЛОТ НЕ ВЫПОЛНЕН.**

## Что обнаружено
При сверке реального исходника `v3-unified-preview/i18n.js` в DRAFT TEST PR №3 все **228** троек UI-переводов были прочитаны как JSON-массив, найдено **4 строки** с русским текстом внутри Finnish/English значений:
1. Подсказка поиска симптомов (turvotus, подгузник, одежда).
2. Подсказка поиска разделов (Lääkitys, состояние).
3. Пример учебной записи ухода — один русский текст использован во всех трёх языках.
4. Финский термин для впитывающего белья `имukykyiset alushousut` содержал русские буквы.

## Что исправлено
Только `velardream-ctrl/riveria-sanasto-community-test`, ветка `feat/admin-control-center-package-spec-20261104`, DRAFT PR №3:
- [i18n.js commit 6947c66](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/6947c66f4ad4a23ca6eb4140ec221ef19650bea5): переводы подсказок на корректный финский и английский, нейтральный учебный пример записи ухода и исправление `imukykyiset alushousut`. RU-ключи не изменены, чтобы не нарушать существующий `asText` lookup. Личные учебные данные не менялись.
- [6 offline regression tests commit 89027a9](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/89027a9e3021fd32a8f4f80fe484e13f45a23c5d): проверка 228 полных троек, уникальности ключей, отсутствия кириллицы в FI/EN UI и конкретных учебных подсказок. Это не проверка переводов пользовательских слов и не редакторская гарантия всех медицинских формулировок.
- [HTML cache-bust f9a0eca](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/f9a0ecaa8277526a3675dc544e708f42ec6478a6), [service worker TEST cache v8 8ecc9a2](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/8ecc9a273e9914c70cbb88576ad35a81d368eb63): `i18n.js?v=v3-approved-ui-2` и новый cache namespace для будущей тестовой публикации. **Не опубликовано сейчас на TEST default main или основном сайте**.
- [CI hook 479b6a2](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/479b6a20a4e28c5da1ee84f5945f67ae5f2d979f): `node --check` i18n и новые словарные тесты; [GitHub Actions #42096305884](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42096305884) **SUCCESS exact code HEAD 479b6a20a4e28c5da1ee84f5945f67ae5f2d979f**: UI 6/6, admin 70/70, telemetry 21/21, queue 22/22, ingest mock 23/23, release manifest PASS.

## Достоверные границы
- Улучшен **исходник UI в DRAFT**; CI не проверяет визуальный рендер на физическом iOS12/iPhone, iPad, другом аккаунте или в опубликованной TEST/production версии.
- Не менялись Firebase TEST/LIVE, опубликованные Security Rules, Auth, чужие слова/результаты, тариф, GitHub main, PR merge/deploy или Google Sheets. A–K/NEW-001/007/008 остаются OPEN/NO-GO.
- Уже задокументированное устройство владельца не поддерживает предложенное приложение Firebase: не просить установку; для cloud Rules нужен доступный авторизованный Work/browser.

**Следующий приоритет:** реальная авторизованная read-only сверка TEST Firestore Rules/version, затем защищённый TEST pilot по отдельному GO; параллельно можно провести ручной визуальный аудит локализованных экранов при доступном браузере, не трогая main.
