# Sanastoyhteisö / Riveria Sanasto — исторический и технический паспорт

**Дата составления:** 4 ноября 2026, Europe/Helsinki.  
**Назначение:** единая карта происхождения проекта, ключевых решений, кодовой базы, текущей архитектуры и истории исправлений — для будущих ChatGPT/Work, которые не должны повторно разыскивать её по чатам.

**Статус:** справочник / инвентаризация, **НЕ** подтверждение готовности V3 к публичному выпуску. Рабочий сайт и реальные данные не изменяются.

**Открывать перед началом разработки вместе с:**
1. [MASTER ROADMAP A–K](./MASTER_ROADMAP_V3_ADMIN_RELEASE_2026-11-04_RU.md) — обязательный план и журнал после КАЖДОЙ задачи.
2. [GitHub Issue #10 — текущая очередь задач](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10).
3. [Подготовка production release PR #9](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/9).
4. [Admin / telemetry / ZIP PR #3](https://github.com/velardream-ctrl/riveria-sanasto-community-test/pull/3) — **DRAFT**, ещё не в test main.
5. [Синхронизация staging PR #8](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/8) — **DRAFT**, не production.

## 1. Что это за проект, для чего он создавался

Sanastoyhteisö («сообщество словарей») — учебное веб-приложение / PWA для освоения финского профессионального языка в Riveria (hoiva-avustaja, дальнейшая подготовка lähihoitaja) и Savonia. Источники учебных материалов — тематический словарь, слова анатомии/болезней/питания и готовые безопасные **учебные** образцы документации Mediatri. Разработан под телефон, компьютер и старый iPad mini 3 (Safari iOS 12.5.x).

**Главные функциональные требования пользователя:**
- FI / EN / RU: определить исходный язык по браузеру, но оставить в шапке три видимых переключателя **FI | EN | RU** и вручную изменяемые направления обучения.
- Карточки, тесты, словарь, избранное, категории/темы, особое повторение «выученных», личные слова, Mediatri (заголовок → ситуация → учебные фразы), справочник, личные/общие библиотеки и обмен.
- У каждого Google-аккаунта собственная статистика; одинаковые данные должны появляться после входа на разных устройствах, в том числе при работе без интернета и последующей отправке очереди.
- Firestore — основная синхронизируемая база; Google Sheets/Drive — источник истории/резервные копии, а не ежедневная принудительная кнопка подключения.
- UI должен быть привычным, понятным, без объявлений о внутренних версиях Firebase и не нужных ученикам технических настроек.
- Администратор получает **отдельный** закрытый `/admin/`, мониторинг неисправностей по версиям браузеров/устройств, «ОК / Проблема / Нет данных» и безопасное обновление одним ZIP-пакетом — до запуска основного выпуска.
- В публичном учебном словаре нет реальных данных пациентов; их запрещено сохранять в тестовом приложении или отправлять в диагностику.

**Важно:** Sanastoyhteisö — это **не** VELAR Music Manager (отдельный музыкальный проект на Google Apps Script). Совпадение владельца/старого пространства `velardream-ctrl` не делает проекты одним продуктом, не переносить их исходники и учётные данные между ними.

## 2. Календарь происхождения: подтверждённое GitHub

| Время (в GitHub UTC, даты указаны без интерпретации часов) | Что произошло | Доказательство |
| --- | --- | --- |
| **01.11.2026 11:31 UTC** | Создан ранний репозиторий `velardream-ctrl/riveria-sanasto`, первая самостоятельная PWA. | [Repository](https://github.com/velardream-ctrl/riveria-sanasto), [история коммитов](https://github.com/velardream-ctrl/riveria-sanasto/commits/main/) |
| **01.11.2026** | v1.0 основана на снимке Google-таблицы от 1 ноября: **1038 терминов, 84 фразы, 183 образца Mediatri, 212 ключевых слов, 40 ситуаций и 21 заголовок**. Карточки/тесты/поиск/локальные слова/JSON/TSV; **нет автоматической облачной синхронизации**. | [INSTALL_RU.md первоисточник](https://github.com/velardream-ctrl/riveria-sanasto/blob/main/INSTALL_RU.md), [начальные файлы](https://github.com/velardream-ctrl/riveria-sanasto/tree/main) |
| **01.11.2026 15:36 UTC** | Создан отдельный `velardream-ctrl/riveria-sanasto-community-test` для Community 2.x и будущих изолированных испытаний. | [Test repository](https://github.com/velardream-ctrl/riveria-sanasto-community-test) |
| **01.11.2026 20:24 UTC** | Создан постоянный репозиторий `sanastoyhteiso/sanastoyhteiso.github.io`; официальный адрес `https://sanastoyhteiso.github.io/`. | [Production repo](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io), [history](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commits/main/) |
| **02.11.2026 11:45 UTC** | В prod main объединено расширение учебного словаря **1053 → 1296 терминов** (PR #1). | [PR #1](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/1), [commit c8d7ed0](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commit/c8d7ed079) |
| **02.11.2026** | Уточнены темы Savonia, повторяющиеся названия Mediatri (PR #2/#3), переключатель интерфейса FI/EN/RU и автоязык (PR #4), динамическое число слов (PR #5), направления FI ↔ EN и трёхъязычные слова (PR #6). | [PR #2](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/2), [#3](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/3), [#4](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/4), [#5](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/5), [#6](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/6) |
| **02.11.2026 18:12 UTC** | Создан PR #7: проект offline-first Firestore + Google Sheets backup + защищённая админ-панель. **DRAFT**. | [Design PR #7](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/7) |
| **02.11.2026 19:25 UTC** | Создан PR #8, ветка `staging/rs-offline-sync-admin-backup-20261102`: journal, синхронизация, Firestore Rules/tests, диагностика, миграция, резервные копии, admin-preview. **Не заменяет корневой prod index**. | [Staging PR #8](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/8), [подробная передача](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/staging/rs-offline-sync-admin-backup-20261102/staging/WORK_HANDOFF_2026-11-03_RU.md) |
| **03.11.2026** | Отдельные V3-classic UI demos и auth/firestore pilots, физический старый iPad рассматривается как обязательная проверка; отдельная DEV Firebase `sanastoyhteiso-v3-development` вместо рабочей. Исправлялись Firebase login/CSP/authorized domains и независимость тестовой среды. | [Тестовые коммиты](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commits/main/), [документ границы DEV/LIVE](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/staging/rs-offline-sync-admin-backup-20261102/staging/backend/TWO_SITES_AND_SAFE_FIREBASE_RU.md) |
| **04.11.2026** | Созданы резервная ветка `backup/production-before-v3-20261104` (защищает код) и release DRAFT PR #9. Начата интеграция полного привычного UI с V3 sync в `v3-unified-preview/`; исправлена потеря P-series phrase IDs (например `P00055`) в экспериментальном sync path. | [PR #9](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/9), [release gate](./RELEASE_V3_CUTOVER_2026-11-04_RU.md), [test commit 19abfeae](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/19abfeae2c77a87eaebfa41840e69227dacede20) |
| **04.11.2026 19:06–19:49 UTC** | В TEST main объединены PR #1 (FI/EN/RU в шапке, скрытие техбаннеров, раздел «Данные» для sync) и PR #2 (изначальный тестовый admin-preview в «Данные», local errors). Последняя публикация TEST Pages **SUCCESS** на commit `49695b560e8ab77d04f508c9d95b5195d2b3fd9e`. | [test PR #1](https://github.com/velardream-ctrl/riveria-sanasto-community-test/pull/1), [test PR #2](https://github.com/velardream-ctrl/riveria-sanasto-community-test/pull/2), [Pages 41900610897](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/41900610897) |
| **04.11.2026 позднее** | Владелец потребовал **убрать** админ-подобный просмотр из личного «Данные» и создать отдельный **настоящий** `/admin/`. Создан тестовый **DRAFT PR #3** с отдельным кабинетом, заготовкой role-gated access и ZIP manifest validator. Это пока не развернуто и не мониторит другие браузеры. | [test DRAFT PR #3](https://github.com/velardream-ctrl/riveria-sanasto-community-test/pull/3), [admin-spec](https://github.com/velardream-ctrl/riveria-sanasto-community-test/blob/feat/admin-control-center-package-spec-20261104/admin/ADMIN_RELEASE_DESIGN_2026-11-04_RU.md) |
| **04.11.2026** | Создан единый маршрут A–K, GitHub issue #10, журнал после каждой задачи и межчатовая передача. Основной адрес **не переключать** до готовой админки, end-to-end диагностики и проверенного обновления одним файлом. | [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10), [MASTER ROADMAP](./MASTER_ROADMAP_V3_ADMIN_RELEASE_2026-11-04_RU.md) |

**Граница достоверности:** полная история первоначального наполнения Google-таблицы до 01.11.2026 и все прежние тексты чатов не хранятся автоматически в GitHub. Из первоисточников доказано, что 1 ноября уже существовал снимок словаря; не придумывать более ранние даты. Решения из чатов фиксировать как требования владельца, **отделяя от фактически проверенного кода и deployment**.

## 3. Карта репозиториев и кто за что отвечает

### Архивный предшественник — v1.0
- Repo: https://github.com/velardream-ctrl/riveria-sanasto
- Важно для раскопок: `INSTALL_RU.md`, `index.html`, `app.js`, `data.js`, `sync.js`, `sw.js`; [все коммиты](https://github.com/velardream-ctrl/riveria-sanasto/commits/main/).
- Локальный прогресс, офлайн PWA; **не переключать** сюда постоянный URL и не использовать старый `sync.js` без аудита.

### Основной рабочий — не трогать main
- Repo: https://github.com/sanastoyhteiso/sanastoyhteiso.github.io
- Сайт: https://sanastoyhteiso.github.io/
- `main` SHA **`d29813cf409af9dc60804105ca3141f98ec12fcd`** (проверено 04.11.2026; проверить заново в начале новой сессии).
- Архивная ветка исходного кода: `backup/production-before-v3-20261104` на том же SHA. **Это НЕ архив Firestore/Drive/IndexedDB.**
- `release/v3-safe-integration-20261104` — документы и подготовка PR #9; **не релиз**.
- `staging/rs-offline-sync-admin-backup-20261102` — PR #8, черновой движок и tests. `plan/offline-sync-backup-admin-20261102` — PR #7.
- Публичные `index.html`, `app.js`, `family.js`, `community.js`, `i18n.js`, `data.js`, `sw.js`, `config.js`; список [на main](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/tree/main/).
- Реальная Firebase `riveria-sanasto-community-test`, реальные UID, ранее сохранённый прогресс. В `config.js` публичные identifiers; **не** копировать dev config и правила поверх prod.

### Отдельный тестовый (Velar Dream / V3 pilot)
- Repo: https://github.com/velardream-ctrl/riveria-sanasto-community-test
- Test URL с полной UI V3: https://velardream-ctrl.github.io/riveria-sanasto-community-test/v3-unified-preview/
- `main` SHA **`49695b560e8ab77d04f508c9d95b5195d2b3fd9e`** на момент проверки. Этот main содержит предыдущий пробный admin-preview в «Данные».
- **Новая правильная отдельная админ-панель** находится только в DRAFT `feat/admin-control-center-package-spec-20261104` / [PR #3](https://github.com/velardream-ctrl/riveria-sanasto-community-test/pull/3). В ней прежний admin-preview убран из «Данные» и добавлен `v3-unified-preview/admin/`. До merge и успешного deploy **нельзя считать страницу доступной в браузере**.
- Отдельная TEST Firebase `sanastoyhteiso-v3-development`, чужие production UID и данные не переносятся автоматически. В тестовом `v3-unified-preview/config.js` другое projectId.
- Другие исторические подкаталоги: `v3-classic/` (изолированный UI/demo) и `v3/` (ранний pilot). Не принимать их за основную текущую интеграцию.

## 4. Эволюция архитектуры: почему так устроено

| Поколение | Интерфейс и данные | Синхронизация и учётная запись | Ограничения / причина перехода |
| --- | --- | --- | --- |
| **v1.0, 1 ноября** | Встроенный учебный `data.js`, карточки и Mediatri, личные слова/счётчики в `localStorage`; PWA `sw.js` | Своей автоматической облачной синхронизации нет; ручные JSON/TSV | Прогресс разный на телефоне/iPad/ПК, риск потери при очистке браузера |
| **Community 2.x** | Полный знакомый учебный UI, личные аккаунты и библиотеки | Google/Firebase Authentication; `family.js` сохраняет per-UID локальные данные, `community.js` подключает Google Drive/Sheets | Нужен один прогресс на всех устройствах без ручного присоединения базы и устойчивый офлайн-режим |
| **V3 staging / separate pilot** | Исходный UI и отдельные эксперименты по full catalog, «Мои находки», Mediatri, фразам | Event journal + IndexedDB shadow / immutable Firestore `sync_v3`, offline queue, проверка конфликтов и многостраничная загрузка | Разные Firebase UID и недостаточные реальныe тесты миграции: прямой перенос опасен; sandbox не равен production |
| **Целевая V3** | Утверждённый FI/EN/RU интерфейс + полный учебный функционал | Firestore primary, Google Sheets backup, старые production аккаунты сохраняются, offline-first | Безопасная миграция/авторизация/rules/квоты/backup/test 2 devices ещё не закрыты |
| **Целевая V3 + admin** | Отдельный `/admin/`, статусы OK/Проблема/Нет данных, браузерная диагностика | Защищённые агрегаты/role claims/минимальная телеметрия; ZIP → review/CI/staging → release/rollback | Нынешняя `admin-page.js` в PR #3 — только каркас: нет end-to-end сбора, backend и сервера для ZIP |

### Что является источником истинных данных
- **Словарные учебные данные**: текущий `data.js` (публичный список); новые слова и библиотеки через будущий Firestore. Не считать количество слов из ранних снимков всегда актуальным.
- **Личный прогресс старых учеников**: per-UID browser storage и существующие Drive/Sheets/Firestore компоненты, возможно разные по полноте. Ни одной полной автоматической копии в публичной GitHub истории нет.
- **Новый прогресс V3**: тестовые события/локальная очередь в dev Firebase и IndexedDB, не production, пока идёт пилот.
- **История решений и разработки**: Git commits/PR/issues/проверки + этот паспорт + master roadmap; чаты — дополнительный контекст, не единственный источник правды.

## 5. Где искать первопричину, если что-то сломалось (без поисков по всему интернету)

1. **Старые слова и учебные карточки** → [legacy `data.js`](https://github.com/velardream-ctrl/riveria-sanasto/blob/main/data.js), [production `data.js`](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/blob/main/data.js), [PR #1/#6 production](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/6). Разделять категорию, ID и язык перевода; не затирать пользовательскую историю при изменении учебной карточки.
2. **Смена UI/языков / направление теста** → `index.html`, `i18n.js`, `app.js`; [production PR #4](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/4) и [#6](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/6); [test PR #1](https://github.com/velardream-ctrl/riveria-sanasto-community-test/pull/1).
3. **Фразы Mediatri** → production `data.js`/`app.js`, [PR #3](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/3); экспериментальные `v3-mediatri-guide.js` в тестовом preview; проблема `P00055` → [test commit 19abfeae](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/19abfeae2c77a87eaebfa41840e69227dacede20).
4. **Google login / разные пользователи** → `family.js`, `config.js`, `account-settings.js`, `community.js` на production; [staging auth pilot](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/tree/staging/rs-offline-sync-admin-backup-20261102/staging/auth-pilot) для разных UID. Не менять Firebase projectId ради «быстрого ремонта».
5. **Синхронизация/офлайн/конфликты** → [PR #8 staging](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/8), `staging/rs-sync-*.js`, `staging/rs-firestore-transport.js`, `staging/tests/`, [release gate](./RELEASE_V3_CUTOVER_2026-11-04_RU.md); отдельный `v3-unified-preview/v3-sync-*.js` для фактического тестового UI.
6. **Safari iOS12 / старая версия из cache** → `sw.js` и cache version, `ipad-selects.js`, `ipad-selects.css` в test, [история тестовых коммитов](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commits/main/); не очищать всё browser storage без JSON backup.
7. **Доступ/метрики администратора** → [test PR #3](https://github.com/velardream-ctrl/riveria-sanasto-community-test/pull/3): `v3-unified-preview/admin/`, `admin-entry.js`, `admin/ADMIN_RELEASE_DESIGN_2026-11-04_RU.md`. Старый `rs-admin-preview.js` в test main — только прототип без server-wide мониторинга.
8. **Обновление одним ZIP** → `admin/rs-release-manifest.js` в draft PR #3 и [master roadmap, этап F](./MASTER_ROADMAP_V3_ADMIN_RELEASE_2026-11-04_RU.md). Это контракт, **не работающая кнопка загрузки**; без доверенного backend секреты GitHub нельзя безопасно использовать на GitHub Pages.
9. **Почему production всё ещё старый** → [PR #9](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/pull/9), [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10), [release doc](./RELEASE_V3_CUTOVER_2026-11-04_RU.md).
10. **История версий целиком** → [legacy commits](https://github.com/velardream-ctrl/riveria-sanasto/commits/main/), [production commits](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/commits/main/), [test commits](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commits/main/). Для конкретной функции ищи по названию файла/PR/commit, а не пересказывай приблизительно.

## 6. Текущее техническое состояние на 04.11.2026 — проверено по GitHub (не по устройствам)

| Узел | Что проверено на GitHub | Что НЕ проверено / неизвестно |
| --- | --- | --- |
| Production code | `main d29813cf...`; index загружает `data.js`, `config.js`, Firebase SDK v8 Auth, `family.js`, `app.js`, `community.js`, `i18n.js`, `sw.js`. `config.js` указывает `riveria-sanasto-community-test`; cache `riveria-sanasto-community-v2.2.2`. | Реальная Firebase доступность, целостность данных конкретных учётных записей, физический браузерный smoke и актуальность разрешений; не выдавать прочитанный HTML за прохождение e2e. |
| Production repo | `main` не изменялся после 2 ноября; есть backup-ветка к этому SHA; PR #7/#8/#9 open draft. | Экспорт/restore Firestore и пользовательских JSON не подтверждены одним Git backup. |
| Test Pages | Последняя известная зелёная публикация 04.11: workflow 41900610897 на `49695b560e...`; isolated `/v3-unified-preview/`. | Новые изменения отдельного admin PR #3 **не опубликованы**; реальные admin role / серверные счётчики отсутствуют. |
| TEST V3 | V3 bridge/отдельная dev Firebase, часть synthetic/rules/CI тестов зелёные; новые файлы скриптов для фраз, offline queue и unified UI. | Полная end-to-end миграция старых UID, непрерывная синхронизация всех устройств и библиотек, нагрузка, quota, безопасность production rules. |
| Администрирование | Черновик отдельного `/admin/` в test PR #3, клиентская проверка custom claim и попытка read-only `admin_metrics/current`; заглушка «Нет данных». | **Не** выдавалась проверенная admin role владельцу, защищённый серверный сбор ошибок не подключён, backend для ZIP не существует. |
| Документация | [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10) + [MASTER ROADMAP](./MASTER_ROADMAP_V3_ADMIN_RELEASE_2026-11-04_RU.md) ведут этапы A–K и обязательный append-only журнал. | Все этапы A–K остаются в работе. Не закрывать A до инвентаризации данных/backup/отката. |

## 7. Непреложные решения владельца, которые менять нельзя без нового согласия
1. Постоянный адрес **`https://sanastoyhteiso.github.io/`**; Velar Dream — тестовая среда.
2. Пока полноценно не работают отдельный админ-центр, приём/обработка ошибок по браузерам, обновления пакетом, защита входа и старых данных, **никакого переноса на production main**.
3. Фиксированный одобренный внешний дизайн: FI / EN / RU прямо в шапке, автоязык, привычное меню (на телефоне снизу). Технические V3/dev предупреждения не для учеников.
4. В личном разделе «Данные» **нет админской диагностики**. Админ-центр отдельный и доступен только через серверно подтверждённую роль.
5. Сохранить аккаунты и историю **других** учеников; разрешение владельца начать личный прогресс с нуля не распространяется на остальных.
6. Иметь настоящий журнал ошибок с кодом/версией/браузером и проверкой живости мониторинга; отсутствие сообщения не означает «ОК».
7. После **каждой** отдельной задачи новый или прежний чат/Work обязан обновлять GitHub journal: сделано, проверено, осталось, блокеры, новые задачи, следующий шаг, SHA/PR/CI. Никаких «забытых» задач в единственном чате.
8. Пока не включать платную инфраструктуру, не менять Firebase Spark и не переносить секреты GitHub/Firebase в публичную страницу.

## 8. Неполные места и как их восстановить честно
- **До 01.11.2026:** в GitHub нет более старого подтверждённого кодового предка; в v1 README/INSTALL указана исходная Google-таблица, но не её полная история изменений. При необходимости запросить историю таблицы в Google Drive, не выставлять её данные публично.
- **Старые чаты:** доступны частично в истории разговоров/контексте, но их тексты не являются полным version-controlled архивом. Восстанавливать только конкретную недостающую гипотезу, связывая её с коммитом или пользовательским подтверждением.
- **Личные учебные данные и старый Google Drive:** не доступны для полной верификации из публичного кода; нужен отдельный закрытый audit перед миграцией и реальной сменой источника сохранения.
- **Firebase live rules/admin claim/metrics:** нельзя считать опубликованными только на основании файла `firestore.rules.*` в черновой ветке; проверить фактическое состояние при авторизации в консоли.
- **Статус оборудования:** зелёный CI и GitHub Pages не доказывают работы на реальном Safari 12, iPhone, Android. Требуется тестовый протокол.
- **Новые записи:** если здесь обнаружен пробел, создать ID `NEW-NNN` в master roadmap и Issue #10, не переписывать прошлое задним числом.

## 9. Процедура для следующего исполнителя (5 минут без поисков)
1. Прочитать этот паспорт и master roadmap + Issue #10.  
2. Получить **текущий** SHA main в трёх repo, проверить PR #3/#8/#9 и последний workflow, сверить с состоянием в разделе 6.  
3. Определить первый открытый пункт этапа A — **частичная инвентаризация создана**, но backup данных/живые браузеры не проверены.  
4. Работать в тестовых или release branches, не затрагивать live main.  
5. После каждого изменения записать `TASK-YYYYMMDD-NNN` в master roadmap, новые зависимости `NEW-NNN` — в реестр и Issue #10. Указать точные SHA/проверки, чтобы следующий чат мог продолжить.  
6. Не объявлять выпущенным ни один DRAFT PR. При обнаруженном несоответствии паспорта фактическому GitHub добавить датированную поправку.

**Точка продолжения:** [Issue #10](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/issues/10) → этап A (закончить аудит данных/backup, проверить UI и выпуск), затем B/C (админ-архитектура/роль). Документация сама по себе не закрывает этап A.
