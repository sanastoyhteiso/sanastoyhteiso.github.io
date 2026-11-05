# RUN-037 — изолированный TEST Firebase Rules кандидат для «Моих находок»

**Дата:** 2026-11-05. **Результат:** тестовый код/эмулятор PASS; настоящая Firebase остаётся без изменений. TEST PR #3 открыт как draft, рабочий сайт/production не затронуты.

## Исходная проблема и сохранение истории

В прежнем TEST Rules-кандидате `collection_set` допускал только публичные термины `T[0-9]{5,7}` и личные `W_[a-f0-9]{32}`; пользователю нужны также категории `M/P/H` из общего словаря.

Первая правка попала прямо в исторический файл `admin/security-tests/candidates/FIRESTORE_V3_DEVELOPMENT_FULL_FOR_MANUAL_REVIEW.rules`. Прежний тест сохранности исходных правил правильно остановил такое изменение: 88/89 проверок прошли, одна отказала с сообщением `Original student rules changed`.

Исправление: **исторический кандидат восстановлен дословно** из Git blob `a903ec37fb2c80e65bac71bd24ca15b11b782bc2`; новая версия не заменяет его, а хранится в **новом отдельном файле**:

`admin/security-tests/candidates/FIRESTORE_V3_DEVELOPMENT_NEW006_FINDS_TMPH_REVIEW_ONLY.rules`

Он отличается от исторического варианта ровно одной строгой заменой:

- Было: `(request.resource.data.target.matches('^T[0-9]{5,7}$') ||`
- Стало: `(request.resource.data.target.matches('^[TMPH][0-9]{5,7}$') ||`

Никакие другие условия для `admin_metrics`, `users`, `settings`, `libraries_v3`, `sync_v3`, `sync_demo_v3` и catch-all deny не менялись. Тест проверяет точное посимвольное равенство полной новой версии старой плюс эта одна замена.

## Проверено

- [TEST PR #3](https://github.com/velardream-ctrl/riveria-sanasto-community-test/pull/3), HEAD `18f45b0e3fc399b21c388fe26acbc80ee69a9e87`, draft, unmerged.
- [GitHub Actions — isolated rules #42005468758](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42005468758): **SUCCESS**; 90/90 synthetic emulator tests, 0 failed. Проверены исторический запрет M, новый owner-only ALLOW M/P/H, DENY неизвестному классу, DENY записи другого UID, read-only admin metrics и доступ к личным данным.
- [GitHub Actions — admin regression #42005468747](https://github.com/velardream-ctrl/riveria-sanasto-community-test/actions/runs/42005468747): **SUCCESS** на том же HEAD.
- История коммитов: [новый независимый кандидат ca33fe9](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/ca33fe9f76cc2a579b6f487ce3bc05a32854336c), [восстановление исходного 5c3f95e](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/5c3f95edc14a3b2ad92aea6aff2a28269dbdb13e), [набор тестов 8b22184](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/8b22184d59a0681a7fd4b6b2bfba30d10f3c7b62), [исправление безопасного сравнения 18f45b0](https://github.com/velardream-ctrl/riveria-sanasto-community-test/commit/18f45b0e3fc399b21c388fe26acbc80ee69a9e87).
- Важный урок: строковый `replace(old,new)` интерпретирует `$'` как специальную последовательность (остаток исходной строки), а Firebase-regex `$'` в правиле — буквально символы. Для замены в коде использовать callback `replace(old,()=>new)`. Именно это выявилось в CI и исправлено.

## Что НЕ проверено и следующее решение

- Не читалась текущая **опубликованная** версия Firestore Rules тестового `sanastoyhteiso-v3-development`, не проверялся её фактический SHA/revision/time, настоящий Firebase ID token, реальный доступ к `admin_metrics/current`, cloud ALLOW/DENY или M/P/H write.
- Ни одна Firebase Rule не публиковалась; настоящий TEST-проект, LIVE Firebase `riveria-sanasto-community-test`, Github Pages main и тариф не изменены.
- **Не копировать новый файл в Firebase автоматически.** Сначала read-only экспорт полного текущего TEST ruleset и сравнение условий, включая ранее вручную опубликованные изменения. Затем составить минимальный безопасный TEST-only diff с сохранением остальных ученических ACL; до cloud-write нужен отдельный явный gate владельца и план восстановления прежней версии.
- TEST PR #3 не следует сливать в default main до отдельного browser acceptance и проверки реальных разрешений. Наличие зелёного эмулятора не означает полноценный опубликованный админ-интерфейс.
- NEW-006, этап C/G/H, A–K по-прежнему OPEN для облачной приёмки. Независимая работа без владельца: подготовить read-only сверку env и тестовую acceptance-матрицу; либо перейти к другой не заблокированной offline задаче.

**Неприкосновенность:** пользовательские UID, email, токены и ключи нигде в публичных отчётах не сохранены.
