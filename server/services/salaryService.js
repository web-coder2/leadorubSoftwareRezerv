const dayjs = require('dayjs')
const axios = require('axios')
const mongoose = require('mongoose')
const crone = require('node-cron')
const dotenv = require('dotenv')


const { getLeadsByUser } = require('../services/leadsService.js')

const usersStatsModel = require('../models/usersStats.js')

function calculateSalaryLeadorub(userObject) {

    const salaryToCalls = userObject.countCalls * 1
    const salaryToTargets = userObject.countTargets * 250
    const salaryToHolds = userObject.countHolds * 0 // для новой мотивации добавить зп за холды (0 или 250)
    const salaryToTargetAndUniqueLeads = userObject.leadSalaryPrice // зп ЛД за каждый лид в суме всех его лидов за день

    // TODO для новой мотивации потом как зп за целевые исопльзовать ту пременую summSalaryToTargets !!!!

    // const leadorubSalary = salaryToCalls + salaryToTargets + salaryToHolds // старая мотивация
    const leadorubSalaryByNew = salaryToCalls + salaryToTargetAndUniqueLeads // новая мотивация
    
    // return leadorubSalary
    return leadorubSalaryByNew
}

function calculateBonusToTargetsLeadorub(userObject) {

    let bonusToTargets = 0

    if (userObject.countTargets >= 3 && userObject.countTargets < 6) {
        bonusToTargets = 200
    } else if (userObject.countTargets >= 6) {
        bonusToTargets = 470
    }

    return bonusToTargets
}

function calculateBonusToClearPrice(userObject) {

    let bonusToClear

    if (userObject.clear > 0) {
        // bonusToClear = Math.floor(userObject.clear * 0.1)
        // TODO тоже меняется в тесте мотивации 20% от чистой бонус (0.2 или 0.1)
        bonusToClear = Math.floor(userObject.clear * 0.1)
    } else {
        bonusToClear = 0
    }

    return bonusToClear
}

/**
 * 
 * @param {*} gte первое дата
 * @param {*} lte второй дата
 * @param {*} dateType тип пириуда (месяц или неделя month week)
 * @returns 
 */
async function getFullMonthClear(gte, lte, dateType) {
    try {

        let startDate = dayjs(gte).startOf(dateType).format('YYYY-MM-DD')
        let endDate = dayjs(lte).endOf(dateType).format('YYYY-MM-DD')

        const result = await usersStatsModel.aggregate([
            {
                $match: {
                    date: { 
                        $gte: startDate, 
                        $lte: endDate
                    } // фильтр по дате за указанный месяц
                }
            },
            {
                $group: {
                    _id: "$email", // группировка по имени пользователя
                    totalClear: { $sum: "$clear" } // сумма поля clear для каждого пользователя
                }
            }
        ]);

        return result

    } catch (e) {
        console.log(e.message)
        return null
    }
}

async function calculateSalaryHoldorub(gte, lte, userObject) {

    try {

        const salaryToCalls = userObject.countCalls * 1

        const leadsOfUsers = await getLeadsByUser(gte, lte, userObject.userName)
        const allowedHolds = ['hold', 'confirmed', 'refused']
        let salaryToHold = 0

        const onlyHoldsArray = leadsOfUsers.filter((lead) => {
            return allowedHolds.includes(lead.residenceStatus)
        })

        onlyHoldsArray.forEach((hold) => {

            if (hold.selfLead === false) {
                salaryToHold += 250
            } else if (hold.selfLead === true) {
                salaryToHold += hold.price * 15 / 100
            }

        })

        const holdorubSalary = salaryToCalls + salaryToHold

        return holdorubSalary
    
    } catch (e) {
        console.log(e.message)
        return 0
    }
}

module.exports = { calculateSalaryLeadorub, calculateSalaryHoldorub, calculateBonusToTargetsLeadorub, calculateBonusToClearPrice, getFullMonthClear }