# RUN-144 — подключение Cloudflare Worker к Sanastoyhteisö 3.0

Дата: 7 ноября 2026, Europe/Helsinki. Продолжение ранее начатого RUN-144 после самостоятельного входа владельца в Cloudflare. Документ фиксирует проверенный прогресс и то, что ещё требуется подтвердить.

## Подтверждено владельцем в Cloudflare (скриншоты)

- Создана отдельная закрытая D1 `sanastoyhteiso-v3-telemetry` с указанной EU jurisdiction; это НЕ Firebase и НЕ учебная база.
- В D1 выполнен проектный `monitoring/worker/schema.sql`, SQL Console ответила успешным выполнением. Три таблицы: `telemetry_events`, `telemetry_quota`, `telemetry_heartbeat`.
- Создан Worker `sanastoyhteiso-v3-telemetry`, точный HTTPS origin `https://sanastoyhteiso-v3-telemetry.velardream.workers.dev`.
- Добавлено D1 binding `DB`, переменная `FIREBASE_PROJECT_ID=riveria-sanasto-community-test`, отдельный `HASH_KEY` типа **Secret** (значение нигде не записано и не запрашивалось).
- Владелец заменил Hello World кодом `monitoring/worker/index.mjs` из PR15. По скриншоту Worker активен, ответ `ORIGIN_DENIED` на встроенный запрос с чужим Origin соответствует ожиданию. Полный byte-for-byte deployed-source audit не проводился.
- Cron `*/5 * * * *` виден в Cloudflare, Observability зарегистрировала запуск. Главный D1 readback: `telemetry_heartbeat` содержит `name=cron,last_check_utc=2026-11-07 19:55:58`, что подтверждает server-side cron→D1 write/read.
- Эти факты НЕ подтверждают подпись реального JWT владельца, server-side admin claim, успешное принятие браузерного события или доступ админки.

## GitHub и выпуск в корневой сайт

- В PR15 `config.js` изменён с `enabled:false` на `enabled:true`, endpoint — только точный URL из скриншота владельца; пользователи **НЕ дают согласия автоматически**. `monitoring-client.js` проверяет opt-in отдельно на текущем устройстве и аккаунте.
- Корневая и административная страницы используют одну версию настроек `monitor-live-1`. Cache Worker обновлён до `riveria-sanasto-community-v3.0.0-rc13`.
- В preflight включён отдельный `v3-telemetry-production-config.test.cjs`: адрес, privacy, нераскрытие HASH_KEY, защита авторизации и принудительный cache-refresh.
- [GitHub Actions #42409353850](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42409353850) — exact HEAD `432f35adb7c546d54da1b1ed2ddc88354c674e5d`, completed **SUCCESS 3/3**, включая Node RS256 synthetic/D1/opt-in/security, offline release checks и emulator.
- Перед релизом текущий main `c338e2813c5ab649f4ee3eef5d9f143ffa9a6562` сохранён в `backup/production-before-monitoring-20261107`.
- [PR15](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/15) merged, production main commit `e6bcdf898ee0eac0fae1e37109df3f1f5272868e`.
- [GitHub Pages #42409499554](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42409499554): отслеживать конечный статус completed SUCCESS, а не только build.
- Схема D1 и Worker сохранены в GitHub, но **никаких Firebase Rules/Auth/Firestore billing или приватных пользовательских данных не изменялось**.

## Остающийся строгий критерий подключения NEW-021

1. После Pages SUCCESS открыть сайт и `/admin/` в обычном браузере под ранее авторизованным владельцем. Если данные устарели, перезагрузить страницу / обновить service worker.
2. При успешном Firebase ID Token и утверждённом `admin=true` админка должна получить с Worker подписанную сводку `backendConnected=true`, свежие `aggregationHeartbeatAt` и реальные нули/числа; **coverage remains false**, поэтому никаких ложных «ОК».
3. На сайте в `Данные` текущий владелец должен **добровольно включить** «Техническая диагностика». Отсутствие opt-in у других пользователей остаётся неизменным.
4. Отправить одно **контролируемое** тестовое техническое событие из собственного авторизованного браузера (не передавать Firebase JWT, HASH_KEY, UID или email в чат). Проверить actual `201`, затем D1 `telemetry_events` и admin errors count. Записать, что это был тест, а не реальная неисправность.
5. Обычный аккаунт без server `admin=true` не должен видеть `/v1/summary` (HTTP 403); без токена при правильном origin — 401. Внешний Origin блокируется. Тестировать без копирования JWT.
6. Только после независимого provider readback и подтверждения в админке закрыть NEW-021 как CONNECTED, не путать отсутствие событий со здоровьем всех устройств.
7. Если реальный Worker не подтверждает JWT/доступ, отключить `RS_TELEMETRY_CONFIG.enabled` коротким hotfix PR (без удаления Worker/D1/аккаунтов).

## Границы

- EU D1 location не распространяется автоматически на передачу и обработку Firebase/Google/Cloudflare вне D1; это не комплексная оценка GDPR.
- Cron heartbeat доказывает доступ к D1, а не доступность клиента или подлинность полученных ошибок.
- При первом входе новый пользователь ещё не согласился на передачу диагностики; отсутствие событий нормально.
- NEW-001 (реальный private Sheets backup/restore), NEW-018 (ручная learned при миграции) остаются отдельными ранее открытыми вопросами; не объявлять их выполненными вместе с мониторингом.
