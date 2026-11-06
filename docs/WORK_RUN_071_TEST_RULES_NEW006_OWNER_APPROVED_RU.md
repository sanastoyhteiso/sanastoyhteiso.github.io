# Sanastoyhteisö 3.0 / WORK RUN-071 — разрешённая публикация только TEST Rules NEW-006

**Одобрено владельцем 06.11.2026:** «Разрешаю» в ответ на вопрос об обновлении только Firebase TEST `sanastoyhteiso-v3-development`, чтобы сохранять `M/P/H` находки. Это разрешение на один строго определённый TEST-only policy change **при прохождении обязательного preflight**. Не распространяется на LIVE Firebase, основной сайт, тариф, аккаунты/claims, удаление, запись в данные или deploy приложения. Никаких дополнительных привилегий.

**Этот документ — передача ChatGPT Work с авторизованным cloud browser. Не выполнять публикацию через обычный чат, GitHub Actions CI, Firebase CLI на телефоне/старом Mac. Публикация в момент подготовки этого файла НЕ ПРОИЗОШЛА.**

## ЗАДАНИЕ ДЛЯ CHATGPT WORK

Продолжить проект, **не создавать новый**. Открыть в авторизованном облачном браузере https://console.firebase.google.com/ и найти только проект `sanastoyhteiso-v3-development` → Cloud Firestore → Database `(default)` → `Rules`. Предыдущее разрешение владельца на изменение **только TEST Firestore Rules для NEW-006 T→TMPH** уже получено (RUN-071); не требовать повторного согласия, но STOP при несоответствии preflight.

1. **Read-only preflight:** убедиться, что заголовок консоли именно `sanastoyhteiso-v3-development`, а НЕ `riveria-sanasto-community-test`. Прочитать полностью ACTUAL published source редактора (не только историю, не draft), если доступно — release/version, timestamp, не раскрывая UID/tokens/email. Сравнить целиком с сохранённым [owner snapshot 05.11.2026](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/security-tests/snapshots/owner-console-rules-20261105.rules), blob `a903ec37fb2c80e65bac71bd24ca15b11b782bc2`. **Если есть любое непонятное отличие, STOP без изменений** и сохранить разницу в журнале/Issue. Не перезаписывать чужие правки.
2. **Один разрешённый патч:** изменить ТОЛЬКО выражение внутри `kind == 'collection_set'`:

```diff
- request.resource.data.target.matches('^T[0-9]{5,7}$')
+ request.resource.data.target.matches('^[TMPH][0-9]{5,7}$')
```

Больше ничего. Не менять `W_[a-f0-9]{32}`, ни один `allow`, admin_metrics, verification/owner UID, catch-all `deny`, `sync_v3`, другие коллекции или imports. **Новый полный TEST candidate** (он отличается от сохранённого только этим выражением): [NEW006_FINDS_TMPH_REVIEW_ONLY.rules](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/security-tests/candidates/FIRESTORE_V3_DEVELOPMENT_NEW006_FINDS_TMPH_REVIEW_ONLY.rules), Git blob `d2294825680bf0fce0f391456d475040c69732d9`.
3. Сверить весь результат с полным `NEW006` кандидатом. **Только при точном равенстве** и правильном TEST project ID нажать `Publish` один раз. При ошибке авторизации, неясной версии или Firebase validation — STOP, не угадывать и не пробовать другие проекты.
4. **Readback после публикации:** перезагрузить TEST Rules вкладку, получить активный полный текст и актуальные version/time если есть, доказать, что опубликован кандидат без других изменений. Проверить, что редактор больше не показывает несохранённые изменения. Не менять данные пользователей; если допустимо, запускать Rules Playground *только в режиме эмуляции*, чтобы `T/M/P/H` для verified owner разрешались, чужой uid — нет. Не заявлять runtime Firestore PASS без реального разрешённого теста.
5. **Журнал:** append-only `НАЧАЛ→ЗАВЕРШИЛ` новый cloud RUN-ID с доказательствами project ID, matched-before snapshot, exact-after hash/line change, publication timestamp/version/status, test method/limitations, без UID/email/token. Обновить [MASTER ROADMAP](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/release/v3-safe-integration-20261104/docs/MASTER_ROADMAP_V3_ADMIN_RELEASE_2026-11-04_RU.md), [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10) и отметить NEW-006: `TEST CLOUD RULES PUBLISHED` только при полученной проверке, но не `two-account fully verified` автоматически.
6. **Rollback:** сохранить неизменяемый снимок прежнего источника; при регрессии STOP и восстановление прежних TEST Rules только после проверки, что между публикациями никто не изменил источник. Для отката использовать полный архив `owner-console-rules-20261105.rules`, повторно проверить проект и результат. Не трогать LIVE.

## Что остаётся после публикации

Проблема NEW-009 в `v3-sync-release.js` остаётся 3/3 KNOWN RED, обязательный release CI всё ещё NO-GO. Backup→restore и реальные два пользователя на двух устройствах (включая старый iPad) не подтверждены; одна лишь публикация Rules не разрешает перевод на production. ZIP Stage F PAUSED.

## Если доступ к Firebase Console не предоставлен

Зафиксировать `BLOCKED_NO_AUTHORIZED_BROWSER` без каких-либо облачных действий. Не просить пользователя устанавливать приложение/CLI, не публиковать GitHub Actions с credentials. В обычном чате достаточно попросить владельца открыть **этот документ в Work**; без авторизованного браузера настоящий Cloud publish невозможен.
