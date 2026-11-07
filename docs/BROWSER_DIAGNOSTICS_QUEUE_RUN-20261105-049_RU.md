# RUN-20261105-049 — ES5 очередь диагностических кодов, тестирование без облака

**Дата:** 2026-11-05 (Europe/Helsinki). **Stage:** D/H, NEW-007. **Состояние:** standalone TEST-only script и CI завершены. Live collector/backend/отправка **не включены**.

## В DRAFT TEST PR #3

- [`admin/telemetry/browser-queue.es5.js`](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/telemetry/browser-queue.es5.js) — независимый ES5-style IIFE / CommonJS-compatible модуль, не импортируемый ни на учебный сайт, ни в админ-кабинет. По умолчанию отключён; принимает разрешённые RUN-048 коды и строго заданные агрегируемые признаки браузера/сети, автоматически выводит модуль и severity. В очереди нет UID/email, произвольных сообщений, URL, stack, слов, ответов, пациентских записей, cookies, токенов или service keys.
- Не обращается к `fetch`, XMLHttpRequest, Beacon, localStorage, IndexedDB, Google, Firebase и не запускает таймеров/фоновой синхронизации. До выбора lawful basis, privacy notice, минимального периода хранения и server policy буфер существует **только в памяти одного открытого JS контекста**.
- Ограничения: максимум 60 элементов, до 6 событий в минуту, дедуп одинакового кода в пределах 30 секунд, TTL 7 дней, максимум 20 элементов в синтетической выгрузке, полная очистка при logout/change session, отключении и существенном откате системных часов. Выгрузка read-only copy; `ack` требует совпадения поколения сессии и внешнего `transportConfirmed=true` (который этот тестовый модуль не может проверить самостоятельно). Отправителя/доказательств доставки здесь нет.

## GitHub CI и устранённый дефект теста

- [Код commit 20124fb](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/20124fb95bf8dd40ef5d6afa6722f6259305681f).
- [Первоначальные тесты 3e1b5f2](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/3e1b5f2ed9fbbecf32fdd3f980cb929861cbcab1).
- [CI hook 590803f](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/590803f626fa0acd91939c4a1d825b99b175b705).
- Первоначальный [regression run #42022346687](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42022346687) **FAIL 21/22**: тест ошибочно передал VM созданный объект из чужого JavaScript realm, который строгая plain-object защита корректно отвергла. Продуктовый код/валидация не ослаблялись.
- [Исправление только VM теста, commit c8e5b8f](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/c8e5b8f58e450f709278207b66f8bd29130c2584).
- [Admin regression #42022491067](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42022491067) **SUCCESS exact HEAD `c8e5b8f58e450f709278207b66f8bd29130c2584`**: Queue 22/22, telemetry privacy 21/21, existing admin 61/61; 0 FAIL.
- [Isolated Firestore emulator #42022491335](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42022491335) **SUCCESS exact same HEAD**, 90/90 simulated rule checks, без real Firebase.

## Что эти тесты НЕ доказывают

- Это не реальная совместимость устройства iPad mini 3 / Safari 12: ES5-style статический/Node VM контракт и простой source grep — не физический браузерный приёмочный тест.
- Очередь in-memory, поэтому **теряется при перезагрузке вкладки/браузера**; нет настоящей долговременной offline delivery/retry, consent, TTL server enforcement, защищённого Google/Firebase transport, роли сервера, rate limit, защиты от malicious clients или работающего мониторинга всех учеников.
- Клиентское подтверждение `transportConfirmed=true` — только интерфейс; злоумышленник может его подделать. Не считать такое ACK достоверным без сервера.
- SCRIPT не вставлен в HTML, не находится в SW cache и не публиковался. DRAFT TEST PR #3 остаётся unmerged, live project/main/тариф/ученики/Rules не изменены.

## Далее

Следующий автономный шаг — строго отдельные, offline TEST-only server-side adapter/state-machine mocks для доставки и idempotency с запретом экспорта UID/PII. Для реальных Firebase Rules/OAuth/consent/сервера и запуска пилота нужен отдельный owner-controlled gate. **Stage D/E/H и A–K: NO-GO.**
