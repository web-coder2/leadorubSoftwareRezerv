const dayjs = require('dayjs')
const axios = require('axios')
const mongoose = require('mongoose')
const crone = require('node-cron')
const dotenv = require('dotenv')

const leadsModel = require('../models/leadsModel.js')
const usersModel = require('../models/usersModel.js')
const usersStatsModel = require('../models/usersStats.js')
const bonusesModel = require('../models/bonusesModel.js')

async function upsertBonusDataByUsers(date) {
    try {

        let nowDate = dayjs(date).format('YYYY-MM-DD')

        let dayOfStartWeek = dayjs(date).startOf('week').format('YYYY-MM-DD')
        let dayOfEndWeek = dayjs(date).endOf('week').format('YYYY-MM-DD')

        console.log(dayOfStartWeek, 'START DATE', dayOfEndWeek, 'END DATE')


        // TODO тут добавить еще логику на то чтобы срвнивать что субота И время больше 9 вечера или 10 тут уже неважно

        if (nowDate === dayOfEndWeek) {
            // если этот сркипт включился в суботу

            // получить статистику за всю неделю юзеров зарплатной
            const usersStatsDataWeek = await usersStatsModel.find({
                date: {
                    $gte: dayOfStartWeek,
                    $lte: dayOfEndWeek
                }
            })



            let aggregatedUsersStatsObject = {}

            // перебор статистика и агрегация
            usersStatsDataWeek.forEach((user) => {
                if (aggregatedUsersStatsObject[user.email]) {
                    aggregatedUsersStatsObject[user.email].clear += user.clear
                } else {
                    aggregatedUsersStatsObject[user.email] = {
                        email: user.email,
                        clear: user.clear,
                        bonusUserId: user._id,
                        bonusUserName: user.name,
                        bonusDate: dayOfEndWeek
                    }
                }
            })

            
            let aggregatedUsersStatsArrat = Object.values(aggregatedUsersStatsObject)

            // формирование бонуса
            for (let user of aggregatedUsersStatsArrat) {

                if (user.clear > 0) {
                    user.bonusValue = Math.ceil(user.clear * 0.2)
                    user.bonusType = 'clearBonus'
                    user.bonusText = 'бонус за чистую'
                    // console.log(user, '!!!!*(@^#*^!@(*#^!')
                    // заливка бонусов в БД
                    const result = await bonusesModel.updateBonusData(user)
                } else {
                    // если условиее по чистой не совопадает (чистая меньше 0)
                    // console.log(user, '*!^@*(#^!@*(^#(* this user many clear !!!!!!')
                }
            }

        } else {
            console.log('bonuses cron script не запущен в суботу !!! о не забьет даные', nowDate, dayOfEndWeek)
        }

    } catch (e) {
        console.log(`ошибка в кроне для обновления бонусов ${e.message}`)
    }
}

function setBonusesDataCron() {
    const cronHour = '0,30 * * * *'
    const cronMinute = '*/15 * * * *'
    const cronExpression = '*/5 * * * *'

    upsertBonusDataByUsers(new Date('2026-07-11'))
  
    crone.schedule(cronHour, () => {
        upsertBonusDataByUsers(new Date())
    })
}

module.exports = { upsertBonusDataByUsers, setBonusesDataCron }