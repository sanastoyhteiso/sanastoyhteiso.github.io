# Sanastoyhteisö V3 — RUN-077 + RUN-078: вход Google и сохранение My Finds в релизе

**Дата:** 06.11.2026 Europe/Helsinki. **Статус:** RELEASE DRAFT CODE/CI VERIFIED; production NO-GO из-за отдельной NEW-009.

## RUN-077 — настоящее family.js покрыто синтетическими тестами входа

- Впервые добавлен независимый [тест реального release family.js](../release-checks/v3-login-availability.test.cjs), 9 сценариев: кнопка активна, Google popup, единственный popup при двойном нажатии, blocked popup + повторная попытка, офлайн, отсутствие SDK, ошибка запуска Firebase, таймаут 25 секунд без удаления старого прогресса, восстановление ранее открытой Google-сессии и неготовая конфигурация.
- Исходный `family.js`/старый сайт не меняли. Тест работает через synthetic Firebase/auth/DOM в Node VM, нет реального Google входа.
- Commit теста `b5a2fdd5cba184105f9d740fbba943eeb6f8f90c`, workflow `def2a737ea625fd0c20374742493362a375a8a91`.
- [Actions #42197137216](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42197137216): release-preflight **SUCCESS**, реальный script login mock **SUCCESS**, Firestore emulator **SUCCESS**, NEW-009 mandatory sync gate **FAIL**.

## RUN-078 — найден и исправлен NEW-012 (shadow отвергал M/P/H finds)

- **До исправления:** релизный `v3-sync-shadow.js` blob `93cd74ccc958127d607af6fba970832116d67b17` принимал только `T[0-9]{5,7}`/private W в `finds`. При попытке сохранения M/P/H он генерировал `Invalid personal find; abort shadow transaction`. Это независимо от Cloud Rules NEW-006 и cloud refresh NEW-009.
- **Базовый отрицательный тест до исправления:** [Actions #42197744909](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42197744909) — новый [release-checks/v3-shadow-finds-id-contract.test.cjs](../release-checks/v3-shadow-finds-id-contract.test.cjs) **FAILED** на старом release shadow. Остальной release remained NO-GO.
- **Точное изменение:** только один regex в `v3-sync-shadow.js` — `/^(T[0-9]{5,7}|W_[a-f0-9]{32})$/` заменён `/^([TMPH][0-9]{5,7}|W_[a-f0-9]{32})$/`. Новый blob `7a355237700ed2c0db1356805f8ff4a40a60721f` **точно совпадает с уже имеющимся TEST PR #3 shadow blob**. Commit `cbddba82b2cc5ad9f3716eeb92ad2fc571253b6c`. Не изменяет правила чужих UID, транзакции или учётную запись.
- Обновлены только RELEASE DRAFT `index.html` / `sw.js` ссылки на `v3-sync-shadow.js?v=release-preview-3`, SW cache name `riveria-sanasto-community-v3.0.0-rc3`, preflight-static обязательные проверки версий. Commit HEAD `c3014432175c36e218b1615d65d1e3bbde51d731`.
- [Exact HEAD Actions #42197858213](https://github.com/sanastoyhteiso/sanastoyhteiso.github.io/actions/runs/42197858213): `release-preflight` **SUCCESS**, новый M/P/H regression **SUCCESS**, Login regression **SUCCESS**; `firestore-v3-rules-emulator` **SUCCESS**; `sync-failclosed-release-gate` **FAILED как ранее из-за NEW-009**. Общий релиз по-прежнему **NO-GO**.

## Границы проведённой работы

- `main` повторно сравнен с production baseline `d29813cf409af9dc60804105ca3141f98ec12fcd` — **identical**, ahead 0; старый неработающий вход (сообщение владельца) не ремонтировался.
- TEST PR #3 DRAFT остался на `5e179d2f688f2fceb4a0a87cc0307b680df199ad`; RELEASE PR #9 остаётся DRAFT/unmerged. Никакой деплой, LIVE/TEST Firebase/Auth/Rules, private Sheets, существующие UID или учебные данные, тариф не изменялись.
- Настоящие Safari iOS12, 2 устройства и live Firebase permissions по этим Node тестам не доказаны. SW версии проверены статически, не на физическом устройстве.
- Отдельное защищённое редактирование `v3-sync-release.js` для NEW-009 не предпринималось и ранее установленное ограничение не обходилось.
- ZIP Stage F отложен **до ПОСЛЕ первого учебного релиза**, согласно RUN-065/RUN-076.

## Следующий приоритет

1. NEW-009 permitted source editor → реальный mandatory gate **3/3 PASS**, exact SHA full CI.
2. Подтвердить deployed TEST NEW-006 rules + actual permission cases M/P/H, реальный Google вход, два устройства/пользователя, offline-queue без потерь.
3. Провести независимый backup→readback→restore и проверить минимально достаточные администрационные диагностики. После owner GO опубликовать V3 и исправлять последующие ошибки через issue→PR→CI→проверенное обновление.
