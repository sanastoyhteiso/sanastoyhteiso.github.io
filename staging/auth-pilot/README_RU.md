# Sanastoyhteisö 3.0 — отдельная проверка Google-входа

## Подтверждённый новый Firebase Web App

Project ID: `sanastoyhteiso-v3-development`
Auth domain: `sanastoyhteiso-v3-development.firebaseapp.com`
Web App ID: `1:482528465775:web:0d6f9e35c379989206ce9a`

Конфигурация публичного Firebase Web SDK предоставлена владельцем 3 ноября 2026 года. Хранится **только** в `staging/auth-pilot/config.js`, НЕ в рабочем `main`. Приватные ключи Firebase Admin или секреты Google не используются. Analytics не загружается и не запускается.

Веб-пилот находится в `staging/auth-pilot/` и после подтверждения автоматических тестов копируется в отдельный репозиторий `velardream-ctrl/riveria-sanasto-community-test` исключительно в `v3-classic/auth-pilot/`.

## Назначение

- Проверять настоящий Google Auth **только в новом Firebase-проекте**; новый тестовый пользователь не совпадает по UID с рабочим Sanastoyhteisö.
- Привычная новая демонстрация `v3-classic/` остаётся без входа в Firebase и без сетевых запросов (`connect-src 'none'`). Экран Google-входа изолирован в собственной подпапке, в которой только новый конфиг и два скрипта Firebase Auth. Никаких запросов к Firestore, Storage, Google Sheets/Drive или учебным результатам.
- Информация о входе выводится только в самой проверочной вкладке; токены не отображаются и не записываются кодом пилота в HTML/консоль/локальное хранилище. Firebase SDK самостоятельно может сохранять служебную Auth-сессию для **этого нового проекта** — обычная работа Firebase Auth.
- Google popup вызывается только нажатием кнопки пользователем. Изменение языка FI/EN/RU выполняется в интерфейсе пилота и не изменяет общие настройки.
- `guard.js` проверяет точные `projectId`, `authDomain`, ожидаемый домен GitHub Pages. `pilot.js` дополнительно требует точный путь `/riveria-sanasto-community-test/v3-classic/auth-pilot/`. До любой инициализации Auth проверяется отсутствие конфигурации рабочего Firebase `riveria-sanasto-community-test`.
- Используется совместимая библиотека SDK из официального CDN: `firebase-app-compat.js` и `firebase-auth-compat.js`. Испытания Safari iOS 12 и реального OAuth popup по-прежнему обязательны; JSDOM-эмуляция не подтверждает их работоспособность.

## Что пользователь должен сделать в Firebase Console

1. Убедиться, что выбран проект **Sanastoyhteiso V3 Development**, ID `sanastoyhteiso-v3-development`.
2. Открыть **Security → Authentication** (или поиск Authentication), нажать **Get started**, затем **Sign-in method → Google → Enable**, выбрать запрашиваемый Google support email и **Save**.
3. Открыть **Authentication → Settings → Authorized domains**, добавить **`velardream-ctrl.github.io`** если его там нет. Вводить только имя домена, без `https://` и пути к репозиторию. Не добавлять `sanastoyhteiso.github.io` для этого пилота.
4. Перейти на отдельный тестовый адрес `https://velardream-ctrl.github.io/riveria-sanasto-community-test/v3-classic/auth-pilot/`, нажать «Войти через Google». Это создаёт **тестовый** Firebase Auth пользовательский аккаунт внутри отдельного проекта.
5. При ошибке `auth/unauthorized-domain` проверить Authorized domains, при `auth/operation-not-allowed` — Google provider. При заблокированном popup открыть обычный Safari/Chrome, разрешить окно. Вход на старом iPad не объявлять гарантированным.
6. Проверить **Authentication → Users** именно в новом проекте, что новая тестовая учётная запись появилась. Не приглашать реальных пользователей и не экспортировать их данные на пилот до следующей процедуры защиты.

После авторизации пользователя **не нужно** вручную создавать документы в Firestore. Для дальнейших этапов надо сначала создать отдельную базу Firestore и внедрить deny-by-default серверные Security Rules, пройти тесты владельца/чужого uid и только затем подключать хранилище профилей и словарей.

## Перенос в окончательную рабочую версию

Новый Firebase здесь служит только для тестов. В будущем код новой версии следует внедрить в существующий `sanastoyhteiso.github.io`, по возможности сохраняя нынешний рабочий Firebase Auth/UID, чтобы зарегистрированные пользователи не потеряли свои профили. Это не перенос выполняемый текущим пилотом. Рабочие `main`, Authentication, Firestore и Google Drive не менять.
