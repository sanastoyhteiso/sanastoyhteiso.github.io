# RUN-20261105-050 — TEST-only серверная имитация приёма и дедупликации диагностики

**Дата:** 2026-11-05, Europe/Helsinki. **Этапы:** D/E/H, NEW-007. **Состояние:** offline CI успешно; настоящий приём пользовательских ошибок/серверная телеметрия не включены.

## Реализовано исключительно в DRAFT TEST PR #3

- [`admin/telemetry/ingest-pilot.cjs`](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/telemetry/ingest-pilot.cjs): чистый in-memory TEST state-machine для повторного приёма диагностических событий. Только `sanastoyhteiso-v3-development`, строгие server-side context flags (`serverIdentityVerified`, `emailVerified`, session handle и auth epoch), фиксированный `TEST_TELEMETRY_PILOT` scope.
- Требует точного `RUN-048` whitelist/schema для всех событий. Один поддельный/неполный event или повтор sequence с другим содержимым отклоняет **весь** пакет до мутаций. При идентичном повторе учитывает его как duplicate и не увеличивает число новых событий. Сессии изолированы по временным server-issued handles, авторизация/epoch строго сверяются, предусмотрено явное invalidation.
- Ограничения макета: максимум 20 событий в пакете, максимум 10 новых событий в минуту/сессию, максимум 200 событий/сессию, максимум 100 сессий в памяти. Только SHA-256 событий/seq и время хранятся в приватном процессе макета. Ни UID, ни email, ни raw error/answers, ни токены/сервисные ключи не попадают в возвращаемые значения.
- **Важнейшее условие:** флаги в `context` должен сформировать только будущий доверенный backend после проверки реального Firebase ID token; на клиенте их можно подделать. Код не проверяет токен и не делает Auth/Firestore/API запросов.
- Каждый результат явно `safeForClientAck:false`, `durableCommitVerified:false`, `backendConnected:false`, `productionReady:false`, даже при успешной **имитации** приёма. Нельзя считать in-memory success реальным server delivery ACK или основанием для удаления офлайн-очереди из живого клиента.

## Коммиты и проверки

- [Макет ingestion, commit 0799578](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/07995788e05cac7bb8c12d86d5ea3d451d8193e8).
- [23 независимых regression tests, commit 18121d5](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/18121d58fb41e1bd3761c999810bc37e80d73860).
- [CI hook, commit 71f4688](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/71f4688360161558ce7e4011817f7fa1303282ed).
- [GitHub Actions admin #42023626443](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42023626443) **SUCCESS exact HEAD `71f4688360161558ce7e4011817f7fa1303282ed`**: ingestion **23/23**, browser queue **22/22**, privacy telemetry **21/21**, прежние admin regression **61/61**, все без настоящей сети и Firebase.
- [GitHub Actions Firestore emulator #42023626452](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42023626452) **SUCCESS exact same HEAD**, **90/90** локальных тестов ACL. Не deployed rules или cloud verification.

## Оставшиеся ограничения

1. В памяти процесса не сохраняются устойчивые dedup receipt и события при перезапуске: нет настоящей durable idempotency, атомарной записи Firestore, серверного подтверждения доставки или очереди реального пользователя.
2. В коде нет защищённого сервера, реальной проверки ID token, безопасности API, мониторинга всех устройств, согласия/правового основания GDPR, retention/consent UI, серверного антиспама по IP/пользователю или надёжного аудита.
3. Модуль не импортирован ни в основной, ни в TEST работающий сайт; PR #3 DRAFT/unmerged. Весь live `riveria-sanasto-community-test`, TEST Firebase `sanastoyhteiso-v3-development`, пользовательские данные/UID, расходы/тариф и Pages не затронуты.
4. Этапы D/E/H, NEW-007 и общий A–K — **NO-GO**. Техническое расширение offline contract не равно состоявшемуся выпуску.

## Следующий шаг
Критический путь теперь требует *реального* TEST Cloud Rules read-only анализа и выбора доверенного, совместимого с бюджетом backend, его политики конфиденциальности/ограничений, а затем одного синтетического pilot с отдельным разрешением владельца. До этого можно проверять backend mock threat-model и исправлять обнаруженные несовместимости в DRAFT, но **не** менять production и не создавать реальные записи учеников.
