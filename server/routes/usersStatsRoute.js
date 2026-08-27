const dayjs = require('dayjs')
const isoWeek = require('dayjs/plugin/isoWeek')
const axios = require('axios')
const mongoose = require('mongoose')
const crone = require('node-cron')
const dotenv = require('dotenv')
const { Router } = require('express')

const usersStatsModel = require('../models/usersStats.js')
const bonusesModel = require('../models/bonusesModel.js')

const { setUsersStatsToDB } = require('../crones/setUsersStats.js')
const { getFullMonthClear } = require('../services/salaryService.js')
const { setTransfersToDB } = require('../crones/setTransfers.js')

const router = Router()


dayjs.extend(isoWeek)

router.get('/api/salary/updateInfo', async (req, res) => {

    try {

        const { gte, mode } = req.query

        if (mode === 'updateLeads') {
            let resultByUpdateStats = await setTransfersToDB(gte, gte)
        } else if (mode === 'updateSalary') {
            let resultByUpdateStats = await setUsersStatsToDB(gte, gte)
        }


        res.status(200).json({
            msg: `${mode} успешно обновлена за ${dayjs(gte).format('YYYY-MM-DD')}`
        })

    } catch (e) {
        console.log(e.message)
        res.status(500).json({
            msg: e.message
        })
    }

})

router.get('/api/salary/bestLidorub', async (req, res) => {
    try {

        const { date } = req.query

        const startMonth = dayjs(date).startOf('month').format('YYYY-MM-DD')
        const endMonth = dayjs(date).endOf('month').format('YYYY-MM-DD')

        const monthlySalaryData = await usersStatsModel.find({
            date: {
                $gte: startMonth,
                $lte: endMonth
            }
        })

        let aggregatedMonthlyData = {}

        monthlySalaryData.forEach((date) => {
            if (aggregatedMonthlyData[date.name]) {
                aggregatedMonthlyData[date.name].clear += date.clear
            } else {
                aggregatedMonthlyData[date.name] = {
                    name: date.name,
                    clear: date.clear
                }
            }
        })

        aggregatedMonthlyData = Object.values(aggregatedMonthlyData)

        aggregatedMonthlyData.sort((a, b) => {
            return b.clear - a.clear
        })

        const leadorubsTop = aggregatedMonthlyData.slice(0, 2)
        
        res.status(200).json({
            data: leadorubsTop,
            monthToBest: date
        })

    } catch (e) {
        console.log(e.message)
        res.status(500).json({
            msg: e.message
        })
    }
})

router.get('/api/salary/get', async (req, res) => {

    try {

        const { gte, lte } = req.query

        const usersStatsArray = []

        /**
         * херня
         */
        const dateType = 'isoWeek' // может быть month или isoWeek или дргой

        const usersStatsData = await usersStatsModel.find({
            date: {
                $gte: gte,
                $lte: lte
            }
        })


        const bonusesData = await bonusesModel.find({
            bonusDate: {
                $gte: dayjs(gte).format('YYYY-MM-DD'),
                $lte: dayjs(lte).format('YYYY-MM-DD'),
            }
        })

        let aggregatedBonusesObject = {}

        bonusesData.forEach((bonus) => {
            if (aggregatedBonusesObject[bonus.bonusUserName]) {
                aggregatedBonusesObject[bonus.bonusUserName].sumBonus += bonus.bonusValue
            } else {
                aggregatedBonusesObject[bonus.bonusUserName] = {
                    userName: bonus.bonusUserName,
                    sumBonus: bonus.bonusValue,
                    email: bonus.userEmail
                }
            }
        })

        let aggregatedBonusesArray = Object.values(aggregatedBonusesObject)

        console.log(aggregatedBonusesArray, 'aggregatedBonusesArray aggregatedBonusesArray aggregatedBonusesArray')


        const todayStr = dayjs().format('YYYY-MM-DD')

        const totalSummedClearData = await getFullMonthClear(gte, lte, dateType)
    
        // console.log(totalSummedClearData, 'totalSummedClearData !!!@#@!#!@')
        // TODO потом прикриптиь к этому бонус 10% от этих чистых

        const result = usersStatsData.map((item) => {
            let newItem = { ...item.toObject() };
            return newItem;
          });

        let resultObject = {}

        function getBonusByDate(item) {
            let bonus = 0;
        
            if (dayjs(item.date).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')) {
                if (dayjs().hour() > 21) { // прошло больше 21 часов дня
                    bonus = item.scriptBonus;
                } else {
                    bonus = 0;
                }
            } else {
                bonus = item.scriptBonus
            }
        
            return bonus;
        }

        result.forEach((item) => {

            let bonusByDate = getBonusByDate(item)
            let userIdString = item.user.toString()
            let userName = item.name

            let countTargetsAndUnique = 0
            let countTargetsAndUnUnique = 0

            // if (resultObject[item.name]) {
            if (resultObject[userIdString]) {
                // resultObject[userIdString].countCallsWithProfile += item.countCallsWithProfile
                resultObject[userIdString].countCalls += item.countCalls || 0
                resultObject[userIdString].countCallsWithProfile += 0
                resultObject[userIdString].countLeads += item.countLeads
                resultObject[userIdString].countTargets += item.countTargets
                resultObject[userIdString].countHolds += item.countHolds
                resultObject[userIdString].sumHold += item.sumHold
                resultObject[userIdString].salary += Math.round(item.salary)
                // resultObject[userIdString].scriptBonus += bonusByDate
                resultObject[userIdString].clear += item.clear
                resultObject[userIdString].brokerSalary += item.brokerSalary
                resultObject[userIdString].salaryToLeads += item.salaryToLeads
            } else {
                // resultObject[item.name] = {
                resultObject[userIdString] = {
                    // countCallsWithProfile: item.countCallsWithProfile,
                    name: item.name,
                    email: item.email,
                    countCalls: item.countCalls || 0,
                    countCallsWithProfile: 0,
                    countLeads: item.countLeads,
                    countTargets: item.countTargets,
                    countHolds: item.countHolds,
                    sumHold: item.sumHold,
                    salary: Math.round(item.salary),
                    // scriptBonus: bonusByDate,
                    clear: item.clear,
                    brokerSalary: item.brokerSalary,
                    salaryToLeads: item.salaryToLeads
                }
            }
        })

        resultObject = Object.values(resultObject)

        const total = {
            name: 'Итого',
            email: 'total@total.com',
            countCalls: 0,
            countLeads: 0,
            countTargets: 0,
            countHolds: 0,
            sumHold: 0,
            salary: 0,
            scriptBonus: 0,
            clear: 0,
            brokerSalary: 0,
            countCallsWithProfile: 0,
            targetLeadsArray: [],
            salaryToLeads: 0
        };

        resultObject.forEach(item => {
            total.countCalls += item.countCalls || 0;
            total.countCallsWithProfile += item.countCallsWithProfile || 0
            total.countLeads += item.countLeads || 0;
            total.countTargets += item.countTargets || 0;
            total.countHolds += item.countHolds || 0;
            total.sumHold += item.sumHold || 0;
            total.salary += item.salary || 0;
            // total.scriptBonus += item.scriptBonus || 0;
            total.clear += item.clear || 0;
            total.brokerSalary += item.brokerSalary || 0;
            total.salaryToLeads += item.salaryToLeads || 0

            // let lidorubObjectKey = totalSummedClearData.find((user) => {
            //     return item.email === user._id
            // })

            // if (lidorubObjectKey) {
            //     item.totalMonthClear = lidorubObjectKey.totalClear
            //     if (dayjs(lte).format('YYYY-MM-DD') === dayjs(gte).endOf(dateType).format('YYYY-MM-DD')) {
            //         item.scriptBonus = lidorubObjectKey.totalClear > 0 ? Math.round(lidorubObjectKey.totalClear * 0.2) : 0
            //     } else {
            //         item.scriptBonus = 0
            //     }
            //     total.scriptBonus += item.scriptBonus
            // }

            let lidorubObjectKey = aggregatedBonusesArray.find((user) => {
                return user.email === item.email
            })

            if (lidorubObjectKey) {
                item.scriptBonus = lidorubObjectKey.sumBonus
            } else {
                item.scriptBonus = 0
            }

        });

        resultObject = resultObject.sort((a, b) => {
            return b.clear - a.clear
        })

        resultObject.push(total)

        res.status(200).json({
            data: resultObject
        })

    } catch (e) {
        res.status(500).json({
            msg: e.message
        })
    }

})

module.exports = router