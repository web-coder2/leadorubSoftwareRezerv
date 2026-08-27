const dayjs = require('dayjs')
const axios = require('axios')
const mongoose = require('mongoose')
const crone = require('node-cron')
const dotenv = require('dotenv')

const leadsModel = require('../models/leadsModel.js')
const usersModel = require('../models/usersModel.js')

const { getSkorozvonCalls, getSkorozvonCallsFromProfile, getDifferenceByCalls } = require('../services/skorozvonService.js')
const { getLeadsToDate, aggregateUsersLeads, calculateClearByUser } = require('../services/leadsService.js')
const { calculateSalaryLeadorub, calculateSalaryHoldorub, calculateBonusToTargetsLeadorub, calculateBonusToClearPrice } = require('../services/salaryService.js')
const { getAllUsers, getUserIdByName, upserUsersStatsToDB } = require('../services/usersService.js')

async function setUsersStatsToDB(gte, lte) {
    
    const usersCalls = await getSkorozvonCalls(gte, lte)
    
    const usersCallsWithoutZeroCalls = usersCalls.filter((callUser) => {
        return callUser.countCalls > 0
    })

    const usersLeads = await getLeadsToDate(gte, lte)

    const aggregatedUsersLeads = await aggregateUsersLeads(usersLeads)

    // console.log(aggregatedUsersLeads, '!!!!!!!')

    // for (let user of aggregatedUsersLeads) {

    //     let usersCallsObject = usersCalls.find((item) => {
    //         return item.name === user.userName
    //     })

    let allUsersInModel = await usersModel.find()

    for (let user of usersCallsWithoutZeroCalls) {

        let usersCallsObject = aggregatedUsersLeads.find((item) => {
            return item.userName === user.name
        })

        let userObjectWithModel = allUsersInModel.find((user2) => {
            return user2.email === user.email
        })

        if (userObjectWithModel) {
            user.password = userObjectWithModel.password
        }

        if (usersCallsObject) {
            user.userName = usersCallsObject.userName
            user.countLeads = usersCallsObject.countLeads || 0
            user.countHolds = usersCallsObject.countHolds || 0
            user.sumHold = usersCallsObject.sumHold || 0
            user.countTargets = usersCallsObject.countTargets || 0
            user.leadSalaryPrice = usersCallsObject.leadSalaryPrice || 0
        } else {
            user.userName = user.name
            user.countLeads = 0
            user.countHolds = 0
            user.sumHold = 0
            user.countTargets = 0
            user.leadSalaryPrice = 0
        }

        // let userCallsInfoFromProfile = await getSkorozvonCallsFromProfile(gte, lte, user)

        // TODO: если что убираю функцию для получения звонков из личного кобинета

        // user.countCallsWithProfile = userCallsInfoFromProfile
        user.countCallsWithProfile = 0

        let fullUserObject = await getUserIdByName(user.userName)

        if (fullUserObject) {
            user.rankName = fullUserObject.rankName
            user._id = fullUserObject._id
        }

        if (user.rankName === "leadorub") {
            user.salary = calculateSalaryLeadorub(user)
        } else if (user.rankName === "holdorub") {
            user.salary = await calculateSalaryHoldorub(gte, lte, user)
        }

        let clearData = await calculateClearByUser(user, usersCallsWithoutZeroCalls.length)

        user.clear = clearData.clear
        user.brokerSalary = clearData.brokerSalary

        let scriptBonus = 0

        // для новой мотивации бонус по кол-ву целевых убрать TODO если что потом раскоментить
        // scriptBonus += await calculateBonusToTargetsLeadorub(user)
        // scriptBonus += await calculateBonusToClearPrice(user)

        user.scriptBonus = scriptBonus
        user.date = dayjs(gte).format('YYYY-MM-DD')

        const result = await upserUsersStatsToDB(user)
    }

    console.log(`Обновление статисткиа юзеров завершилось в БД в ${dayjs(gte).format('YYYY-MM-DD')}`)

    return true
}


async function setUsersStatsByManyDays() {
    const startDate = '2026-06-08'
    const endDate = '2026-06-14'

    const totalDays = dayjs(endDate).diff(dayjs(startDate), 'day') + 1

    const promises = [];
    for (let i = 0; i < totalDays; i++) {
        const currentDate = dayjs(startDate).add(i, 'day').format('YYYY-MM-DD')
        promises.push(setUsersStatsToDB(currentDate, currentDate))
    }

    await Promise.all(promises)
    console.log('Все обновления завершены по скорозвон статистикс')
}


function setUsersStatsCrone() {
    const cronHour = '0,30 * * * *'
    const cronMinute = '*/15 * * * *'
    const cronExpression = '*/5 * * * *'

    setUsersStatsToDB(new Date(), new Date())
    // setUsersStatsByManyDays()
  
    crone.schedule(cronHour, () => {
        setUsersStatsToDB(new Date(), new Date())
    })
}

module.exports = { setUsersStatsCrone, setUsersStatsToDB }