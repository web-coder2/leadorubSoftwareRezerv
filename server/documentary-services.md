# ДОКУМЕНТАЦИЯ ПО СЕРВИСАМ (УТИЛИТАМ) ЛИДОРУБСКОЙ


# leadsService.js

[getLeadsToDate] = получить все лиды из БД за диапазон
[removeDublicates] = функция для удаления дубликатов лидов если они есть в БД изза глюка
[upsertNewLeadsData] = функия для сохранения или обновления обхекта лида в БД
[getLeadsByUser] = функция для получения лидов за диапзаон времени определеного юзера
[calculateClearByUser] = расчитать чистутую юзера за этот день
[getDistintBetweenUnUniqueLeads] = определить повторный или уникальный лид и разницу между лидами если повторный
[aggregateUsersLeads] = сагрегировать все переданые лиды по юзерам
[getInfoLeadIsUnique] = определить был ли такой лид с таким телефоном раньше и узнать повтор или уникальный


# residenceService.js

[getResidenceLeads] = взять все лиды из RESIDENCE за диапазон времени
[getBrokers] = получить масив всех бркоеров в RESIDENCE
[findAllCallsInResidence] = взять звонки из RESIDENCE зарпалтная=>звонки
[defaineSelfLead] = определить переводил этот лид бркоер (false) или холдоруб (true) по имени брокера
[getLeadsOnePhone] = получить лиды резиденции по одному телефону


# salaryService.js

[calculateSalaryLeadorub] = расчитать зарпалтну Лидоруба за этот день
[calculateBonusToTargetsLeadorub] = расчитать бонус для ЛД за кол-во целевых лидов
[calculateBonusToClearPrice] = расчитать бонус для ЛД за чистую > 0
[getFullMonthClear] = получить масив {ЛД, totalClear} сумированиый clear за весь месяц
[calculateSalaryHoldorub] = расчитать зарплату для холдоруба за этот день


# skorozvonService.js

[getSkorozvonToken] = получить токен для работы с API SKOROZVON
[getDifferenceByCalls] = получить телефоны которых нет от админа но есть от акаунта ЛД в SKOROZVON
[getSkorozvonCallsFromProfileArray] = получить масив звонков от акаунта ЛД
[getSkorozvonCallsFromProfile] = получить кол-во звонков от акаунта ЛД
[getSkorozvonCallsByUser] = получить список звонков юзера в SKOROZVON
[getSkorozvonCalls] = получить масив {email, ЛД, countCalls} из SKOROZVON
[getLeadsToOneDay] = получить лиды из SKOROZVON за этот день
[getLeadAudioUrls] = получить сылки на аудио записи определного лида в этот день из SKOROZVON
[getLeadTimeline] = получить доп инфу по лиду из SKOROZVON


# transfersService.js  [НЕ_ИСПОЛЬЗУЮТСЯ]

[mergeTransferToOKK] = получить статус ОКК этого трансфера
[updateTransferToDB] = создание/обновление записи по трансферам за этот день


# uisService.js

[getUISCalls] = получить список звонков из UIS сервиса


# usersService.js

[getAllUsers] = получить список всех юзеров
[upserUsersStatsToDB] = обновить даные по статистики запралтной юзеров за этот день
[getUserIdByName] = получить весь обхект юзера по его именеи