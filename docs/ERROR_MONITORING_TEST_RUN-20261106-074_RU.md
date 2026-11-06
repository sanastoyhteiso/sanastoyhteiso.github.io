# Sanastoyhteisö 3.0 — RUN-074: ошибки в админ-меню и путь к журналу, доступному ChatGPT

**Дата:** 06.11.2026, Europe/Helsinki. **Статус:** TEST DRAFT code + local offline CI verified. **Централизованная передача и рабочий сайт ещё НЕ подключены**. Не объявлять автоматическое наблюдение и исправление в production.

## Новое требование владельца

«Пусть сайт записывает ошибки в журнал ошибок и ты чтобы имел доступ его просматривать анализировать и исправлять ошибки выявленные в рабочей среде». Это меняет приоритет с бесконечного расширения безопасности на стабилизацию учебных функций и доказательную диагностику в админ-панели. Но журнал **не заменяет** обязательный fail-closed при ошибках синхронизации: NEW-009 остаётся 3/3 known red и release NO-GO.

## Что уже сделано, без доступа к реальным данным

- Добавлен **TEST-only** ES5 / Safari iOS12 script [study-diagnostics.js](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/v3-unified-preview/study-diagnostics.js), загружается на странице обучения и на странице админа. Автоматически отмечает необработанные ошибки браузерного JavaScript и отклонённые Promises **только техническим кодом** `APP_RENDER_FAILED`, не читая текст исключения, стек, URL, UID/email, ответы, личные/медицинские записи или токены.
- Дополнительно публичный API `RS_V3_LOCAL_DIAGNOSTICS.record('SYNC_QUEUE_STUCK')` принимает только фиксированный allowlist технических кодов для будущих безопасных интеграций. Не изменено поведение заблокированного `v3-sync-release.js` NEW-009. Ложное подтверждение синхронизации из NEW-009 **пока этим журналом автоматически не обнаруживается**.
- Данные ограничены **30 записями за максимум 24 часа**, timestamp округлён до минуты, повторяющиеся подряд коды отфильтровываются. Хранятся только в `sessionStorage` вкладки; нет сетевого запроса, Firestore create, cookies или стороннего SDK. Переход из главной страницы в админку в той же вкладке позволяет увидеть локальные коды.
- Административная вкладка **«Ошибки»** теперь показывает отдельный раздел **«Ошибки этой вкладки»** на FI/RU/EN и объяснение «общий серверный журнал пока не подключён». Существующая защита admin-claims `admin===true`, email verification и адрес TEST Firebase не ослаблены; обычные пользователи не видят админку. Отсутствие записей **не** объявляется «сайт исправен». Общие агрегаты `admin_metrics/current` продолжают требовать защищённого сервера и два heartbeat.
- Обновлены зависимости обоих HTML и service worker. 32 файла precache, cache fingerprint `sanastoyhteiso-v3-unified-preview-assets-02d5052a9f17bb25` — это защищает от старого JS на iPad после обновления. Никакого DEPLOY на TEST/main/PROD.

## Проверки exact source HEAD

- TEST PR #3 DRAFT exact HEAD: `5e179d2f688f2fceb4a0a87cc0307b680df199ad`.
- [Admin regression Actions #42163744023](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42163744023) **SUCCESS**. Новые [шесть тестов](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/tests/study-local-diagnostics.test.cjs) 6/6 PASS: удаление raw PII, отсутствие сети, reject unlisted code/project, cap/TTL/corrupt storage, ES5; admin test проверяет запрет для ученика и разрешённый локальный просмотр только для администратора. Offline content-hash shell tests 6/6 PASS.
- [Isolated TEST Firestore rules Actions #42163743069](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42163743069) **SUCCESS**, ничего не деплоится.
- Первый синтетический прогон [#42163643691](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42163643691) FAILED из-за двух ошибок тестового набора: ожидание старого `admin-health-3` после обновления JS и обращение к еще не отрисованным вкладкам до разрешения mock Promise. Исправлен **только тестовый код**, последний точный CI green. Не выдавать первоначальные ошибки за сбой Firebase или runtime.

## Критический пробел до полноценного общего журнала

**Сейчас ChatGPT НЕ имеет прямого доступа к `sessionStorage` чужого iPhone/iPad/ПК.** Он может видеть GitHub CI и доступные подключённые ресурсы, но не локальные ошибки посетителей. На данный момент отсутствует реальный сертифицированный сборщик, серверный ingress/durable ACK, защищённая агрегация, сроки хранения и управляемая передача данных. Нельзя утверждать, что общий журнал «включён» или что он является полноценной диагностикой Firebase. Обычный пользовательский браузер **не должен** напрямую создавать `admin_metrics` или сырые `telemetry_reports` в Firestore; действующие правила остаются строгими.

## Рекомендуемая архитектура общего журнала с доступом ChatGPT

1. Владелец создаёт/подключает отдельный наблюдаемый проект **PostHog** и подключает PostHog к ChatGPT (интеграция поддерживает чтение errors/logs). Можно рассмотреть и закрытую Google Sheets отчётность, но прямой анонимный публичный Google Apps Script endpoint или публичные GitHub Issues с raw exceptions **не использовать**.
2. Выбрать подходящий европейский регион хранения и настроить правовое основание/уведомление и управление согласием. Отдельно проверить цены/лимиты; автоматически не менять тариф Firebase или другого сервиса. Включить сбор **только** сообщений из разрешённого набора `code`, сборка приложения, агрегированный тип браузера и укрупнённое время; минимизировать идентификаторы и запретить session replay/автоснимки ввода/URL/query/referrer/errors-with-stack. PostHog JavaScript SDK по умолчанию может автоматически собирать нажатия, формы и страницы; если использовать SDK, все такие опции **отключить**, провести тест реальной отправляемой нагрузки и проверить отсутствие персональных данных.
3. Внедрить **защищённую** точку приёма/relay с настоящей проверкой Firebase ID token, ограничением доступа и quota/rate, минимальной схемой RUN-048, anti-abuse, сроком хранения/очисткой и подтверждением надёжной записи. Existing [telemetry-contract.cjs](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/telemetry/telemetry-contract.cjs), [browser-queue.es5.js](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/telemetry/browser-queue.es5.js), [ingest-pilot.cjs](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/telemetry/ingest-pilot.cjs) and aggregate mocks are **tested contracts, NOT real servers**. Firebase Spark/no billing change must be respected; plan suitable backend after explicit review.
4. Проверить end-to-end на TEST: один синтетический код `APP_RENDER_FAILED` → transport → durable server ack/readback → аналитика PostHog → ChatGPT plugin read **без** raw exception; затем сбой сети/повтор/чужой аккаунт/offline; убедиться, что ошибка видна администратору и отсутствует утечка PII. Только после такого тестирования и owner GO делать отдельный production release.
5. После подтверждённого источника можно настроить регулярную проверку ChatGPT (автоматизацию) и GitHub issue triage с категорией/частотой/воспроизведением, PR исправлением, exact-SHA CI и ручным GO. ChatGPT не выполняет произвольную обработку/«самоисправление» сайта в фоне без настроенной автоматизации и прав.

## Примечания по PostHog

Документы провайдера: https://posthog.com/docs/product-analytics/autocapture ; https://posthog.com/docs/libraries/js ; https://posthog.com/docs/product-analytics/capture-events . В default JavaScript autocapture может включать pageview, clicks/forms, session recording и exceptions; не переносить реальные события без проверки настроек и редактирования соглашения.

## Точная точка продолжения

- TEST PR #3 DRAFT есть и CI PASS; service worker + admin UI готовы к браузерному TEST smoke, но **не опубликованы** и не проверены на физическом iOS12.
- Требуется от владельца только *подключить PostHog к ChatGPT и дать название отдельного проекта/его EU ingest host и ограниченный project API key*, если он согласен на эту схему; **не передавать API секреты/ключи доступа администратора в чат**, используйте защищённые настройки. Пока подключения нет, не обещать, что ChatGPT уже видит рабочие ошибки.
- NEW-009 остаётся критической ошибкой ложного успешного cloud sync (3/3 KNOWN RED). Админ журнал поможет обнаруживать будущие сбои, но не позволяет безопасно «опубликовать с ошибками» без явного backup/restore и честных offline/online статусов. Stage F ZIP PAUSED.
