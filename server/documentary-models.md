# ДОКУМЕНТАЦИЯ ПО МОДЕЛЯМ (СУШНОСТЯМ) ЛИДОРУБСКОЙ

# usersModel.js (сущность для юзеров)

| свойство    | ТИП     | ОПИСАНИЕ |

[email]       | String  |  email ЛД который используется в SKOROZVON
[name]        | String  |  имя ЛД
[skorozvonId] | Number  |  его скорозвон айди  (опциональный параметр)
[password]    | String  |  пароль ЛД
[rankName]    | String  |  ранк (лидоруб | холдоруб | админ)



# leadsModel.js (сущность для лидов)

| свойство         | ТИП       | ОПИСАНИЕ |

[date]             | String    |  дата созданого лида
[broker]           | String    |  какой брокер довел этот лид дальше до застройщика
[price]            | Number    |  цена офера (sumHold)
[phone]            | String    |  номер телефона лида
[audioArray]       | Array     |  масив сылок с аудио запиясми лида из SKOROZVON
[residenceStatus]  | String    |  статус этого лида в RESIDENCE
[statusOKK]        | Boolean   |  Целевой (true) или Нецелевой (false)
[selfLead]         | Boolean   |  перевел до затсрйощика дальше сам холдоруб (да = true) или брокера (false)
[selfLeadName]     | ENUM      |  можешь быть либо ручной либо системный либо на брокера зависит от того как передан
[user]             | ObjectId  |  userId ЛД который создал этот лид
[userName]         | String    |  имя ЛД котоырй создал этот лид
[countHold]        | Number    |  Кол-во холдов в RESIDENCE от этого лида
[isEdited]         | Boolean   |  редактирован лидей алексеевной или нет
[commentOKK]       | String    |  коментарий лидии алексеевны
[offersList]       | Array     |  масив оферов из RESIDENCE дял этого лида (статус price.offer и брокер)
[isUniquePhone]    | Boolean   |  уникальный лид или был уже повтор этого телефона в БД
[lastPhoneCalled]  | String    |  когда был последний лид этого телефона
[uniqueState]      | String    |  состояние уникальности этого лида
[leadSalaryPrice]  | Number    |  зарпалат за этот лид ( 250 или 100 или 0 ) 
[isBreakedStatus]  | Boolean   |  был ли обрыв этого лида во время SKOROZVON передачи



# usersStats.js (сущность для зарпатной статистики)

| свойство               | ТИП       |  ОПИСАНИЕ  |

[email]                  | String    |  email ЛД для зарплатной (для агрегации) 
[name]                   | String    |  имя ЛД для зарпльной
[date]                   | String    |  дата записи статистики по зарпалты в этот день
[countCalls]             | Number    |  Кол-во звонков ЛД в SKOROZVON в этот день
[countCallsWithProfile]  | Number    |  кол-во звонокв ЛД в SKOROZVON через его ЛК в этот день
[countLeads]             | Number    |  кол-во лидов ЛД в SKOROZVON и ручных в этот день
[countTargets]           | Number    |  кол-во целевых лидов ЛД в этот день
[countHolds]             | Number    |  кол-во холдов ЛД в этот день 
[sumHold]                | Number    |  сума холдов (сума price.offer) от ЛД и его бркоеров в этот день
[salary]                 | Number    |  общая выщитаная зарплата за весь день для самого ЛД
[bonus]                  | Number    |  общий бонус который он получил в этот день
[scriptBonus]            | Number    |  системный бонус ЛД который расчитан кроном за чистую и тд
[clear]                  | Number    |  чистая (чистая прибыль дял компании) за этот день
[brokerSalary]           | Number    |  зп брокеров от ЛД за этот день
[user]                   | ObjectId  |  userId (objectId) в этой записи
[salaryToLeads]          | Number    |  зп за лиды (сума leadSalaryPrice всех его лидов за этот день)