# RUN-20261105-048 — закрытый TEST контракт минимальной диагностики (только offline)

**Дата:** 2026-11-05 (Europe/Helsinki). **Этапы:** D/E/H, NEW-007. **Статус:** код и CI успешно проверены; сбор/хранение/публикация реальных ошибок НЕ включены.

## Новая конструкция в DRAFT TEST PR #3

- [`admin/telemetry/telemetry-contract.cjs`](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/telemetry/telemetry-contract.cjs): строго заданная схема `schemaVersion/code/module/severity/browser/browserMajor/os/build/network/occurredAt`, 15 разрешённых кодов ошибок, связь code→module/severity, серверный список разрешённых сборок, жёсткая привязка к TEST project `sanastoyhteiso-v3-development`. Допуск события в течение 7 дней после возникновения (ограниченная офлайн-очередь), максимум +5 минут часового расхождения. Любые неизвестные поля (включая UID, email, stack, URL/query, userAgent, ответы, личные слова и данные пациентов) приводят к отказу *всего* события; raw payload не отражается в результате/ошибке. Код **не подключён** к странице/Firestore и не отправляет запросы.
- [`admin/telemetry/aggregate-contract.cjs`](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/telemetry/aggregate-contract.cjs): ограниченный до 2000 синтетических событий кандидат для 24-часовых агрегатов; повторно проверяет каждое событие по строгой схеме, отклоняет весь пакет при любом нарушении. Только группировка по отдельным категориям (код *или* семейство браузера), без cross-product, устройство/UID/user-level истории. Порог раскрытия любой группы — минимум 5 событий. Не выводятся индивидуальные записи, доля затронутых пользователей и мнимое число активных аккаунтов.
- **Критически:** этот агрегатор всегда ставит `monitoringActive:false`, `monitoringCoverageVerified:false`, `ingestionHeartbeatAt:null`, `aggregationHeartbeatAt:null`, `siteStatus:'unknown'`, `updatedAt:null`, `canPublishAdminMetrics:false`. От него нельзя получить серверное «ОК», даже если синтетическая выборка не содержит ошибок. Положительные признаки требуют независимого доверенного ingress/aggregation proof, которого сейчас нет.
- [`admin/tests/telemetry-contract.test.cjs`](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/tests/telemetry-contract.test.cjs): 21/21 негативных и позитивных тестов, включая PII/data leaks, чужой проект, неизвестные сборки и коды, поддельную severity, превышение TTL, будущие события, отказ на один повреждённый элемент, порог групп, ограничение пакета и принцип «без ложного OK».

## Доказательства CI

- [Контракт, commit 6e60c5c](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/6e60c5c6d0b757cb1513872b4e8c9f2b60e24fce).
- [Агрегатор, commit 2dbc381](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/2dbc38142490b2118e2e66414ed10654543635ce).
- [21 тест, commit 8eefdd5](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/8eefdd54aa815a613b74ed3c721dfaec9017114e).
- [CI hook, commit 27bdaff](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/27bdaff974d5d7d99d2309a118036ad9ad1baee2).
- [GitHub Actions #42021310403](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42021310403) **SUCCESS exact HEAD 27bdaff**: 21/21 новых privacy tests, 61/61 предыдущих admin regression, no Firebase/deploy. Это **не** подтверждение успешной облачной Firebase Rules проверки для текущего HEAD, если отдельный emulator CI не запущен на том же SHA.

## Не сделано и обязательные ограничения

- В коде пока нет клиентского error collector, сетевого транспортного адаптера, offline retry, доказанной rate/abuse protection на сервере, защищённых create-only Firestore Rules, consent/transparency & GDPR retention, изолированного сервиса агрегации, настоящих heartbeats или записи `admin_metrics/current`.
- `schemaVersion` и whitelist уменьшают риск утечек, но **не являются самостоятельной достаточной защитой** от злоумышленного клиента, спама, повторов, обхода квот и GDPR-рисков. Малые группы скрыты, однако 5 событий не доказывают 5 уникальных пользователей. Нельзя использовать такие числа для утверждений о доле активных учеников.
- Агрегатор не считает «0 ошибок» здоровьем системы. Записи Firestore/права других пользователей, TEST default main, LIVE Firebase, production Pages и тариф не затронуты. PR #3 остаётся DRAFT.
- RUN-045 cloud Rules read-only честно BLOCKED после прерывания Work; его нельзя считать PASS или восстанавливать по исторической фикстуре.

## Следующий автономный шаг

RUN-049: отдельно подготовить минимальный безопасный браузерный offline diagnostic queue с запретом произвольных строк, лимитами и полной остановкой при invalid/changed auth, **без отправки в облако**, и независимые mock-tests для старого Safari 12. После этого нужен owner-approved облачный TEST rules/ingress pilot до любых real events. Срок хранения/согласие/законное основание и ограничение агрегации должны быть документированы до живого включения.
