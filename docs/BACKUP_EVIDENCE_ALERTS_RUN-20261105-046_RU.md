# RUN-20261105-046 — защита доказательств TEST резервирования и предупреждений (только offline)

**Дата:** 2026-11-05 (Europe/Helsinki). **Статус:** код + локальные CI-тесты выполнены. Реальный cloud backup/restore/alerts **не проверен и не включён**.

## Восстановленная документация
Главный MASTER ROADMAP дополнен отсутствовавшей записью TASK-20261105-033 из RUN-044. [Коммит c459382](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/c45938246b809802a033f34411cd3bd48eb41036); запись RUN-044 и отдельный checkpoint оставлены append-only, история не переписана.

## Технические изменения (исключительно DRAFT release PR #9)

1. [`backup-v3/backup-evidence-gate.cjs`](../backup-v3/backup-evidence-gate.cjs) — Node-only TEST контракт. Принимает *проверенные будущим серверным адаптером* provider responses, фиксирует `sanastoyhteiso-v3-development`, одного владельца и snapshot, сравнивает ID/mime-type нового Sheet, консервативное owner-only разрешение, manifest, полные `RAW` строки через прежний Firestore source SHA-256 codec, а также доказательство завершения попытки. Отказ при чужом проекте/UID, дополнительных правах, неполном/изменённом readback и ошибках API. Лимит 300 документов/1200 строк соответствует изолированному RUN-043 pilot.

2. [`backup-v3/backup-alert-dedup.cjs`](../backup-v3/backup-alert-dedup.cjs) — *планировщик*, не отправитель уведомлений. Только заранее определённые коды проблем. Одинаковый инцидент не предлагается отправлять чаще чем раз в 24 часа **после подтверждения фактической доставки**. `NO_DATA` не является выздоровлением; подтверждённый `OK` позволяет отдельное сообщение о восстановлении. Нет e-mail, push, SMS, сетевых запросов и хранилища.

3. [`release-checks/v3-backup-evidence-alerts.test.cjs`](../release-checks/v3-backup-evidence-alerts.test.cjs) — 20/20 synthetic unit tests. Включают 403/500, spoofed Sheet metadata/permissions, partial rows, SHA tampering, wrong snapshot, устаревший backup, пропущенный attempt, отсутствие утечки UID/слов/Sheet ID/хэша, duplicate suppress, 24-hour reminder, ack и recovery gating.

4. CI `.github/workflows/release-v3-preflight.yml` включает новый тест. [GitHub Actions #42017682085](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42017682085) **SUCCESS exact code HEAD `53d597beea3543220a74cebf4a9bfc8126963862`**: release-preflight SUCCESS (20/20 новых unit, 15/15 health, 13/13 Apps Script mocks) и Firestore emulator SUCCESS.

## Ограничения, которые нельзя скрывать
- Все Google/Firestore/Drive/Sheets API responses **синтетические**. Пока не существует доверенного live provider adapter; его аутентификация, полнота permission listing, audit log и доступность ещё не проверены. Любой подложный provider mock может симулировать `verified:true`. Код сам возвращает `operationallyProven:false` и `liveCloudAccessPerformedByThisModule:false` даже для passed mock.
- Не существует работающей доставки/подтверждения уведомлений, расписания резервирования и независимого восстановления Firestore. Нет acceptance доказательств, что все ученики защищены.
- RUN-045 отдельно начат другим сеансом для cloud *read-only* TEST Rules: не считать его выполненным без завершающей записи. Его действия не дублировались.
- Рабочий сайт, LIVE Firebase `riveria-sanasto-community-test`, TEST default main, данные учеников, тариф и production PR **не изменялись**. NEW-001 и этапы A–K по-прежнему OPEN/NO-GO.

## Следующее
Продолжить автономное offline threat review; затем один owner-authorized синтетический TEST pilot с приватными provider readbacks и restore drill, после проверки TEST Security Rules. Не экспортировать чужие данные и не включать реальный график/alerts без отдельного разрешения.
