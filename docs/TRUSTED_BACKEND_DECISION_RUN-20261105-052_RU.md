# RUN-20261105-052 — Доверенный backend для Sanastoyhteisö 3.0 без неожиданной оплаты

**Дата:** 2026-11-05. **Статус:** анализ вариантов по официальным документациям, **НЕ** выбран окончательно и **НЕ** создан ни один облачный ресурс.

**Основной принцип:** сохранить действующий Firebase Spark и рабочий GitHub Pages. Никаких платных тарифов, сервисных ключей и подмены настроек до отдельного разрешения владельца. Подготовленные RUN-048–051 тесты и admin UI — **ещё не живой сервер**.

## Что реально требуется от доверенного сервера

1. **Приём диагностики:** из браузера — только десять строго проверяемых полей RUN-048, никогда UID/email/URL/raw stack/ответы учеников/пациенты. Пользовательское уведомление о диагностике, правовое основание и проверенные сроки хранения — до включения.
2. **Проверка авторизации:** backend должен криптографически проверить подпись Firebase ID token (`RS256`), `kid`, `exp/iat`, `aud=санкционированный TEST project`, `iss`, `sub` и `auth_time`, не доверять `serverIdentityVerified`/UID/email из body. Публичные ключи Google обновлять по Cache-Control. Роль admin — через проверенную server claim + право на конкретную операцию, не только клиентское отображение кнопки.
3. **ACK и дедупликация:** успех только после атомарной сохранённой записи с durable receipt, retry не должен создавать второе событие. In-memory `simulatedAckSeqs` RUN-050 никогда не подтверждает доставку и не удаляет настоящую очередь.
4. **Защита от злоупотребления:** серверный per-account/per-session/IP ограниченный budget с минимизацией персональных данных; максимальный размер HTTP body, квоты Firestore и hard stop при ошибке/лимите. Клиентские ограничения не считаются защитой. Обязателен fail-closed, если проверка токена, quota или IAM не работает.
5. **Агрегаты, не личные журналы:** административная панель читает только небольшие серверные `admin_metrics/current`, без raw `telemetry_reports`. Статус `OK` возможен только с независимыми ingestion/aggregation heartbeat, coverage proof и подтверждённой свежестью; иначе `NO DATA` или `PROBLEM`.
6. **Разделение полномочий:** backend диагностики и backend обновления ZIP нельзя объединять в один широко привилегированный токен. GitHub App для ZIP только на TEST PR с защитой baseCommit/SHA/review; отдельный релиз production после письменного GO. IAM/секреты/Logs/retention — минимальные.
7. **Доказательство:** полная синтетическая сквозная проверка TEST с одним учётным лицом и другим обычным пользователем, запретом чужих прав, сетевыми ошибками, повтором и восстановлением. Все попытки и финальные статусы в GitHub без приватных идентификаторов.

## Сравнение вариантов (по состоянию на 05.11.2026)

| Вариант | Что можно использовать | Ограничения/риски | Текущий вердикт |
| --- | --- | --- | --- |
| Cloudflare Workers **Free** | Тонкий HTTPS edge endpoint для минимальной Auth/telemetry при будущем owner-approved проекте. Поддерживает зашифрованные secrets и WebCrypto. | Официальный лимит **100 000 запросов/сутки**, **10 мс CPU** на запрос Free, **50 subrequests**. При превышении лимита возможен HTTP 1027; для защищённого endpoint нужен fail-closed. 10 мс может не вместить полный JWT/IAM/db путь; надо проверить в реальном синтетическом нагрузочном пилоте. Нужен отдельный privacy/DPA/региональный review, durable storage и строгий IAM. | **Условный кандидат №1** на небольшой TEST ingest; НЕ включать до проверки прав/бюджета и согласия на сторонний сервис. |
| Google Apps Script владельца | Отдельный TEST-only scheduled backup Google Sheets, разрабатываемый в RUN-040–046. REST от имени владельца по явным OAuth scope. | Для обычной учётной записи ограничения: **6 минут/запуск**, **90 минут суммарной работы триггеров/день**, **20 000 URL Fetch/день** (квоты могут меняться). Публичный web app с секретной ролью владельца — неподходящий основной высоконагруженный ingestor без отдельной проверяемой Auth + abuse protection. | **Кандидат для планового резервирования одного TEST UID**, не выбирать сейчас публичным backend диагностики. |
| Firebase Cloud Functions | Самый близкий к Firebase Admin SDK серверный вариант. | **Cloud Functions недоступны на Spark**; потребуется Blaze/billing. Даже если начальные квоты бесплатны, это не гарантия отсутствия расходов. | **Не использовать** без отдельного разрешения владельца на платный тариф и лимиты. |
| GitHub Actions | CI, правила в эмуляторе, выпуск тестового PR, периодическая проверка публичного состояния. | Не HTTP API пользователя и не защищённый онлайн-приём ошибок; не хранить Firebase/Admin credentials в публичных файлах. Запуск по расписанию не заменяет real-time диагностику или гарантированное резервирование. | Оставить для тестов/review и релизного контроля, **не** использовать как telemetry ingress. |
| Только GitHub Pages + клиентский Firebase SDK | Уже есть и бесплатно работает для учебных функций. | Не может хранить серверные секреты и безопасно принимать ZIP; Firestore direct telemetry create из браузера без серверного abuse control опасен по квотам/данным. | **NO-GO** для admin ZIP и сырого telemetry ingress. |

### Официальные первоисточники (проверено 05.11.2026)

- Cloudflare Workers ограничения: https://developers.cloudflare.com/workers/platform/limits/ (на момент проверки документ обновлён 29.10.2026).
- Cloudflare Workers secrets: https://developers.cloudflare.com/workers/configuration/secrets/
- Cloudflare Workers Web Crypto: https://developers.cloudflare.com/workers/runtime-apis/web-crypto/
- Firebase ID token verification + требования RS256/aud/iss: https://firebase.google.com/docs/auth/admin/verify-id-tokens
- Firebase pricing Spark/Blaze: https://firebase.google.com/pricing и https://firebase.google.com/docs/projects/billing/firebase-pricing-plans
- Google Apps Script official quotas: https://developers.google.com/apps-script/guides/services/quotas
- Firebase Firestore rules/серверный IAM boundary: https://firebase.google.com/docs/firestore/security/rules-conditions

## Рекомендация по очередности работ

**P0 — без владельца:** сохранить этот документ и принять основную архитектурную границу «клиент пишет учебные события только в owner paths; сырая диагностика закрыта, пока нет trusted backend». Проверить, что DRAFT UI не выдаёт `OK` без действующей серверной телеметрии. Не тратить ещё циклы на фиктивную реализацию `simulatedAckSeqs`.

**P1 — одно короткое участие владельца позже:** авторизованный **read-only** Cloud Shell/Work просмотр фактических TEST Firestore Rules, SHA, version, timestamp, allow/deny `admin_metrics/current` и обычного ученика. Сначала inspect; ничего не publish и не изменять. RUN-038 helper в DRAFT TEST PR #3 уже подготовлен, владелец не должен вручную переписывать правила в чат.

**P2 — решение владельца:** согласовать сторонний бесплатный TEST-only Worker (или отказаться и выбрать иной backend), Privacy/DPA, обработку минимальных кодов, лимиты нагрузки и допустимость будущих IAM credentials. Это **не** согласие на смену тарифа, создание сервиса сейчас или работу с чужими данными. Всё должно иметь бесплатную безопасную остановку при исчерпании квоты.

**P3 — сначала синтетический тест и наблюдаемые доказательства:** реальный verify token, durable server-side receipts/ACK, quota, per-user test, permission deny, lawful privacy notice, backup readback + independent restore, два устройства и iOS12. Только после этого TEST deploy, принятие A–I, отдельный production GO.

## Не сделано

- Никакие Cloudflare Worker, Google Apps Script, Firebase Functions, Firestore Rules, GitHub App/ZIP backend, сервисные аккаунты или billing account не создавались и не менялись.
- Нет проверенного cloud Auth/Rules, live telemetry и приватного восстановленного Google Sheets/Firestore backup. В реальном Firefox/Safari/iOS12 тесты не выполнялись. Этапы D/E/F/H/I, NEW-001/007/008 и все A–K остаются **OPEN / NO-GO**.
