# Sanastoyhteisö 3.0 — RUN-067
## Одно небольшое действие владельца для безопасной сверки опубликованных Firestore Rules (TEST only)

**Дата:** 05.11.2026. **Статус:** подготовлена read-only инструкция; **живые правила ещё НЕ прочитаны** через авторизованную Firebase Console. Никакой публикации или изменения Firebase не выполнялось. Этап F/ZIP до после учебного запуска (RUN-065).

### Зачем нужна эта проверка

В тестовом проекте **`sanastoyhteiso-v3-development`** правила определяют, сможет ли новый ученический сайт безопасно сохранять события синхронизации и «Мои находки» с публичными типами `T/M/P/H`; и сможет ли будущий администратор читать только агрегат `admin_metrics/current`. Репозиторий и emulator показывают **кандидатов**, а не фактический опубликованный документ.

**НЕЛЬЗЯ ПЕРЕПУТАТЬ:** рабочая Firebase — `riveria-sanasto-community-test`, её НЕ ОТКРЫВАТЬ для этого действия, НЕ РЕДАКТИРОВАТЬ.

### Что попросить владельца (телефон/браузер, без установки приложений)

1. Открыть [Firebase Console](https://console.firebase.google.com/) под своим Google-аккаунтом и выбрать **только** проект `sanastoyhteiso-v3-development`.
2. Перейти **Firestore Database / Cloud Firestore → Rules / Правила** для `(default)` базы. Проверить, что шапка консоли всё ещё показывает правильный TEST project ID.
3. **Не нажимая Publish/«Опубликовать», Clone, Deploy или сохранение**, прислать сначала один скриншот с ID проекта и открытой вкладкой Rules. Это подтверждает, что открыта нужная область, а не рабочая Firebase.
4. Далее по возможности скопировать **полный текст действующих правил** из редактора в чат (это policy-код, не токены). Если с телефона неудобно, прислать несколько последовательных скриншотов *самих правил*, включая участок `match /sync_v3`, `target.matches`, `match /admin_metrics` и финальный `match /{document=**}`. Скрывать или не присылать личные UID/email, токены, API credentials, данные пользователей/пациентов.
5. Если доступна история Rules, прислать видимую **дату/версию публикации** (без секретов). Не пытаться менять rules, роли, индексы или тариф. При ошибке доступа — остановиться и показать только текст ошибки без токенов.

**Подтверждение только по скриншоту заголовка** — это проверка проекта/вкладки, но **НЕ** проверка полного ruleset. Полный текст или read-only API hash нужен для анализа условий `allow`.

### Исходники для сравнения (GitHub, НЕ считать опубликованными)

| Вариант | Файл и blob SHA | Ключевые отличия |
| --- | --- | --- |
| **HISTORIC OWNER-SUPPLIED** | [PR #8, git blob `86ba7d0b4e4720762babdcd1d6580f644319e08a`](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/828d702430037aeca271786bbcf067e202f10c0c/staging/backend/firestore.v3-development-with-finds.rules) | `collection_set` target `^T[0-9]{5,7}$` / W_; нет `admin_metrics/current` |
| **NEW-003 admin-only candidate** | [FULL_FOR_MANUAL_REVIEW, blob `a903ec37fb2c80e65bac71bd24ca15b11b782bc2`](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/security-tests/candidates/FIRESTORE_V3_DEVELOPMENT_FULL_FOR_MANUAL_REVIEW.rules) | Ровно один доп. блок `admin_metrics`; T/W по-прежнему прежний |
| **NEW-006 combined candidate** | [NEW006_FINDS_TMPH_REVIEW_ONLY, blob `d2294825680bf0fce0f391456d475040c69732d9`](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/security-tests/candidates/FIRESTORE_V3_DEVELOPMENT_NEW006_FINDS_TMPH_REVIEW_ONLY.rules) | `admin_metrics/current` + `collection_set` target `^[TMPH][0-9]{5,7}$` / W_ |

Прямой read-only diff исторического текста и NEW-003 кандидата на 05.11.2026 показывает **только** добавление `match /admin_metrics/{metricId}`:
```rules
match /admin_metrics/{metricId} {
  allow get: if metricId == 'current' && isAdmin() &&
    request.auth.token.firebase.sign_in_provider == 'google.com';
  allow list, create, update, delete: if false;
}
```
**Условие `isAdmin()` требует email verified + custom `admin == true`**, которого Google sign-in сам по себе не выдаёт. Наличие такой строки в Rules или её успешный emulator test ещё **не означает**, что роль реально назначена.

NEW-006 отличается от NEW-003 расширением регулярного выражения для `T/M/P/H` на отдельном TEST кандидате. Сам факт существования обоих файлов **не** доказывает, какой из них опубликован. Обязательно сравнивать **весь ruleset**, не заменяя рабочую конфигурацию без отдельного owner GO.

### Как интерпретировать полученный от владельца текст

- **Project ID отличается**: немедленно остановить проверку, ничего не менять. Не копировать rules из другого проекта.
- **Опубликовано только HISTORIC**: `admin_metrics` отсутствует; M/P/H не допускаются. C/G/H и NEW-006 остаются OPEN.
- **Опубликован NEW-003 без NEW-006**: админское `get` предусмотрено текстово, но M/P/H не допускаются. Надо отдельно подтвердить реальный custom claim, без автоматического grant.
- **Опубликован NEW-006**: есть текстовые условия M/P/H и admin read; перед запуском всё равно необходимы реальный Firebase allow/deny для разных UID и тест двух устройств. Это ещё не cloud PASS.
- **Опубликовано иное/частичное**: сохранить только обезличенный отчёт отличий; не исправлять вслепую и не публиковать новый файл.
- **Если только скриншот фрагмента**: записать `PARTIAL VISUAL CHECK` с точным перечнем просмотренных строк, а не `FULL RULESET VERIFIED`.

### Дальнейшая работа ChatGPT / Work

После получения **текста** из консоли выполнить read-only diff с тремя эталонами, проверить условия `own(uid)`, `verified()`, `isAdmin()`, `sync_v3`, `libraries_v3`, `sync_demo_v3`, `admin_metrics`, catch-all deny; доказать, что неизвестные коллекции не открыты случайно. Записать итог в RUN-068, MASTER/Issue #10. При реальном авторизованном Cloud Shell можно вместо копирования применить уже подготовленный строго GET-only [inspect-test-rules-readonly.cjs](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/ops/inspect-test-rules-readonly.cjs), выдающий только hashes/metadata/classification; **не просить владельца устанавливать CLI или Firebase приложение на старый Mac/iPhone**.

**Что остаётся отдельно:** NEW-009 sync refresh 3/3 known-red; исправление источника RUN-062 заблокировано и не должно обходиться. NEW-001 backup/restore, физический iOS12/два аккаунта/два устройства, admin role и серверный monitoring — без live acceptance. Production/main/TEST main и Firebase не изменялись.

Официальная справка: https://firebase.google.com/docs/rules/get-started — Firebase Console показывает наиболее недавно опубликованные Security Rules, в отличие от непубликованных локальных копий.
