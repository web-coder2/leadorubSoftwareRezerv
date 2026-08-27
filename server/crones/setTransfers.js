const dayjs = require('dayjs')
const axios = require('axios')
const mongoose = require('mongoose')
const crone = require('node-cron')
const dotenv = require('dotenv')

const leadsModel = require('../models/leadsModel.js')
const usersModel = require('../models/usersModel.js')

const { getSkorozvonToken, getLeadsToOneDay, getLeadTimeline, getLeadAudioUrls } = require('../services/skorozvonService.js')
const { getResidenceLeads, getLeadsOnePhone, defaineSelfLead, findAllCallsInResidence } = require('../services/residenceService.js')
const { getAllUsers, getUserIdByName } = require('../services/usersService.js')
const { upsertNewLeadsData, getInfoLeadIsUnique, getDistintBetweenUnUniqueLeads } = require('../services/leadsService.js')
const { getUISCalls } = require('../services/uisService.js')

function foundCallByLeadPhone(phone, callsArr) {
  const callObjectsArr = callsArr.filter((item) => item.phone === phone.slice(1))

  let broker = null

  if (callObjectsArr.length > 0) {

    for (const call of callObjectsArr) {
      if (call.broker !== null) {
        broker = call.broker
        break
      }
    }
  }

  return broker
}

async function setTransfersToDB(gte, lte) {
    try {
      const leadsToDate = await getLeadsToOneDay(gte, lte);

      console.log('started transfers cron')
  
      if (!Array.isArray(leadsToDate)) {
        console.error('leadsToDate не является массивом:', leadsToDate);
        return;
      }

      const allResidenceCalls = await findAllCallsInResidence(gte, lte)
      // const uisCallsData = await getUISCalls(gte, lte)

      for (let lead of leadsToDate) {

        // получение даных о лиде
        let leadUserInfo = await getLeadTimeline(lead);

        let leadUser = leadUserInfo.userName
        let leadInfoPoints = leadUserInfo.leadPhoneInfo

        // TODO дальеш что нужно сделать
        // из несколько одинаковых лидов (пока трансферов)
        // определить какой и них успешный
        // трнасфер это когда trasnfered: 't' была попытака если transfered: 'f' не было попытки к каждому их них есть id
        // по нему этому id можно делать сопоставления если несколько разных трансферов за сегодня с одинаковым phone
        // и после этого еще оталкиватсья от seconds

        let leadResidence = await getLeadsOnePhone(gte, lte, lead.number.slice(1));
        let leadAudioArray = await getLeadAudioUrls(lead);
        let userIdObject = await getUserIdByName(leadUser);
        let isSelfLead = await defaineSelfLead(gte, lte, lead.number.slice(1));
        let infoByUniqueLead = await getInfoLeadIsUnique(lead.number.slice(1), gte, lte, leadUser)
        // TODO: на будущее есть эта функция будет слишком мног овремнеи жрать то попробовтаь сделать 1 зарпос к БД
        // получить все лиды по всем нмоерам телефонов и дальше через .filter искать уникальные и повторящии пока ждому лиду его номер телефону
        // сделать масив всех нмоеров телефонов по лидам котоыре получены этим кроном из сокрозвона

        if (infoByUniqueLead) {
          lead.isUniquePhone = infoByUniqueLead.isUniquePhone
          lead.lastPhoneCalled = infoByUniqueLead.lastPhoneCalled
        } else {
          lead.isUniquePhone = true
          lead.lastPhoneCalled = 'first'
        }
        
        if (!leadResidence.broker) {
          var brokerInCalls = foundCallByLeadPhone(lead.number, allResidenceCalls)
        }

        let leadInfo = {
          date: dayjs(gte).format('YYYY-MM-DD'),
          broker: leadResidence.broker || brokerInCalls,
          price: leadResidence.price,
          phone: lead.number.slice(1),
          isSuccessTransfer: leadInfoPoints.isSuccessTransfer,
          audioArray: leadAudioArray,
          residenceStatus: leadResidence.status,
          statusOKK: false,
          selfLead: isSelfLead,
          selfLeadName: isSelfLead ? 'Сам' : 'На брокера',
          user: userIdObject?._id ?? undefined,
          userName: leadUser,
          countHold: leadResidence.countHold,
          isEdited: false,
          commentOKK: "",
          offersList: leadResidence.offersList,
          isUniquePhone: lead.isUniquePhone,
          lastPhoneCalled: lead.lastPhoneCalled,
          isBreakedStatus: false
        };
  
        const result = await upsertNewLeadsData(leadInfo);
      }
  
      console.log('Обновление в базу за ', dayjs(gte).format('YYYY-MM-DD'), 'закончилось');
    } catch (error) {
      console.error('Ошибка в setTransfersToDB:', error.message);
    }
}

async function setLeadsInfoManyDays() {
  const startDate = '2026-06-08'
  const endDate = '2026-06-14'

  const totalDays = dayjs(endDate).diff(dayjs(startDate), 'day') + 1

  const promises = [];
  for (let i = 0; i < totalDays; i++) {
      const currentDate = dayjs(startDate).add(i, 'day').format('YYYY-MM-DD')
      promises.push(setTransfersToDB(currentDate, currentDate))
  }

  await Promise.all(promises)
  console.log('Все обновления завершены по лидам обновление')
}

function setTransfersCrone() {
  const cronHour = '0,30 * * * *'
  const cronMinute = '*/15 * * * *'
  const cronExpression = '*/5 * * * *'

  setTransfersToDB(new Date(), new Date())
  // setLeadsInfoManyDays()
  
  crone.schedule(cronHour, () => {
    setTransfersToDB(new Date(), new Date())
  })
}

module.exports = { setTransfersCrone, setTransfersToDB }