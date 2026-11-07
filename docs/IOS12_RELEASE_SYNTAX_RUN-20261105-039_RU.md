# RUN-039 — базовая синтаксическая проверка Safari 12 / iPad mini 3

**Дата:** 05.11.2026. Исполнение только в GitHub Actions на черновом PR №9, без публикации и без физического iPad.

## Задача

До этого release preflight выполнял JavaScript через `vm.Script` Node 22, способный распознавать конструкции более новые, чем Safari 12. Это оставляло риск, что модернизированный код не запустится на старом iPad mini 3 (iOS 12).

## Сделано

1. Создан `release-checks/ios12-syntax.test.cjs` с консервативным парсером `acorn@8.14.0` и `ecmaVersion:2018`. Он сканирует локальные `<script src=...>` из `index.html`, встроенные JavaScript-секции, а также `sw.js`; проверяет пути и обязательное присутствие основных модулей `app/family/community/v3-sync`.
2. Отдельно проверено, что парсер отвергает синтаксис новых браузеров: optional chaining `?.`, nullish coalescing `??`, logical assignment `||=`, private class fields. Не допускает случайного появления недопустимой конструкции в локальном коде.
3. Workflow `.github/workflows/release-v3-preflight.yml` теперь устанавливает acorn для тестов и запускает проверку после установки изолированных браузерных зависимостей, до jsdom smoke.
4. Файлы реального сайта, Firebase, аккаунты, правила и тариф не менялись; тест и workflow находятся в DRAFT release PR #9.

## Фактическая проверка

- [Коммит теста 76c2141](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/76c21418ab13a9bbe80ba12a611f0beb2369ae50)
- [Коммит CI c556b4a](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/c556b4a17ac520673f19c0fa7df6784e870e796c)
- [Release Actions #42007290541](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42007290541), exact code+workflow HEAD `c556b4a17ac520673f19c0fa7df6784e870e796c`: release-preflight **SUCCESS**, лог — 20 локальных JS-файлов, 1 inline script; 4 внешних скрипта не проверяются данным тестом. Firestore-emulator — смотреть итог того же workflow перед закрытием RUN.

## Границы результата

- **Это только синтаксическая совместимость до уровня ES2018, не реальный Safari 12 PASS.** Возможны неподдерживаемые runtime APIs, проблемы CSS, IndexedDB, WebCrypto, service worker, память, CORS/auth pop-up, Google SDK и кеш на устройстве.
- Четыре внешних CDN-скрипта не анализируются данным тестом и требуют отдельной проверки библиотек и загрузки на Safari.
- Для полноценного iPad acceptance нужен короткий реальный сценарий: холодный старт, выбор FI/RU/EN, Google login, карточки/тест, Mediatori, offline перезапуск, два аккаунта, sync conflict/backup, нижняя навигация, переключение вкладок и чистое восстановление без потери данных.
- Новый тест не требует участия владельца; **одна** физическая проверка понадобится после выпуска готового TEST preview.

**Статус:** static syntax CI PASS, DEVICE/LIVE OPEN. Новая проверка будет автоматически работать при следующих изменениях release ветки, пока preflight подключён.
