const dayjs = require('dayjs')
const axios = require('axios')
const mongoose = require('mongoose')
const crone = require('node-cron')
const dotenv = require('dotenv')

const leadsModel = require('../models/leadsModel.js')
const usersModel = require('../models/usersModel.js')

/**
 * получить лиды за определные времени
 * @param {*} gte 
 * @param {*} lte 
 * @returns
 */
async function getLeadsToDate(gte, lte) {

    try {

        const leadsToDate = await leadsModel.find({
            date: {
                $gte: dayjs(gte).format('YYYY-MM-DD'),
                $lte: dayjs(lte).format('YYYY-MM-DD')
            }
        })

        return leadsToDate

    } catch (e) {
        console.log(e.message)
    }

}


async function removeDublicates(gte, lte, phone) {
    try {
    
        let leadsToDateAndPhone = await leadsModel.find({
            date: {
                $gte: gte,
                $lte: lte
            },
            phone: phone,
        });
  
        if (leadsToDateAndPhone.length > 1) {

            console.log('Найден дубликат ')

            const editedLeads = leadsToDateAndPhone.filter((lead) => lead.isEdited === true);
    
            let leadToKeep;
    
            if (editedLeads.length > 0) {
                leadToKeep = editedLeads[0];
            } else {
                leadToKeep = leadsToDateAndPhone[0];
            }

            const idsToDelete = leadsToDateAndPhone
                .filter((lead) => lead._id.toString() !== leadToKeep._id.toString())
                .map((lead) => lead._id);
    
            if (idsToDelete.length > 0) {
                await leadsModel.deleteMany({ _id: { $in: idsToDelete } });
            }
        }

    } catch (e) {
        console.log(e.message)
    }
}

async function upsertNewLeadsData(lead) {

    try {
        const entryFromDB = await leadsModel.findOne({
            date: lead.date,
            phone: lead.phone,
        })

        if (entryFromDB) {
            
            let isUniqueOtherInfo = getDistintBetweenUnUniqueLeads(entryFromDB)

            // вызвать функцию которая удалит дублируюзие (если они есть)
            let resultByDeleteDubles = await removeDublicates(lead.date, lead.date, lead.phone)

            if (entryFromDB.isEdited === true) {
                await leadsModel.updateOne(
                    { _id: entryFromDB._id },
                    {
                        $set: {
                            broker: lead.broker,
                            price: lead.price,
                            audioArray: lead.audioArray,
                            residenceStatus: lead.residenceStatus,
                            // selfLead: lead.selfLead,
                            // selfLeadName: lead.selfLeadName,
                            countHold: lead.countHold,
                            offersList: lead.offersList,
                            isUniquePhone: lead.isUniquePhone,
                            lastPhoneCalled: lead.lastPhoneCalled,
                            uniqueState: isUniqueOtherInfo.dateState,
                            // leadSalaryPrice: isUniqueOtherInfo.realSalaryToLead,
                        }
                    }
                );
                return; 
            } else {
                const oldEntry = await leadsModel.findOneAndDelete({
                    date: lead.date,
                    phone: lead.phone,
                })
        
                const newEntry = new leadsModel({
                    date: lead.date,
                    phone: lead.phone,
                    userName: lead.userName,
                    broker: lead.broker,
                    price: lead.price,
                    audioArray: lead.audioArray,
                    residenceStatus: lead.residenceStatus,
                    statusOKK: lead.statusOKK,
                    // selfLead: lead.selfLead,
                    // selfLeadName: lead.selfLeadName,
                    user: lead.user,
                    countHold: lead.countHold,
                    isEdited: lead.isEdited,
                    offersList: lead.offersList,
                    isUniquePhone: lead.isUniquePhone,
                    lastPhoneCalled: lead.lastPhoneCalled,
                    uniqueState: isUniqueOtherInfo.dateState,
                    leadSalaryPrice: isUniqueOtherInfo.realSalaryToLead,
                    isBreakedStatus: lead.isBreakedStatus
                })
        
                await newEntry.save()
            }
        } else {

            let isUniqueOtherInfo = getDistintBetweenUnUniqueLeads(lead)

            const newEntry = new leadsModel({
                date: lead.date,
                phone: lead.phone,
                userName: lead.userName,
                broker: lead.broker,
                price: lead.price,
                audioArray: lead.audioArray,
                residenceStatus: lead.residenceStatus,
                statusOKK: lead.statusOKK,
                selfLead: lead.selfLead,
                selfLeadName: lead.selfLeadName,
                user: lead.user,
                countHold: lead.countHold,
                isEdited: lead.isEdited,
                offersList: lead.offersList,
                isUniquePhone: lead.isUniquePhone,
                lastPhoneCalled: lead.lastPhoneCalled,
                uniqueState: isUniqueOtherInfo.dateState,
                leadSalaryPrice: isUniqueOtherInfo.realSalaryToLead,
                isBreakedStatus: lead.isBreakedStatus
            })
    
            await newEntry.save()
        }

    } catch (e) {
        console.log(e.message, lead.phone)
    }

}

async function getLeadsByUser(gte, lte, name) {
    try {
        const usersLeadsToDate = await leadsModel.find({
            date: {
                $gte: dayjs(gte).format('YYYY-MM-DD'),
                $lte: dayjs(lte).format('YYYY-MM-DD')
            },
            userName: name
        })

        return usersLeadsToDate
    } catch (e) {
        console.log(e.message)
    }
}

function calculateClearByUser(userObject, countUsers) {

    const brokerSalary = Math.floor(userObject.sumHold * 0.6 * 0.15)
    const minusOfBase = Math.floor(5000 / countUsers)
    const allSumHold = userObject.sumHold * 0.6

    const clear = Math.floor(allSumHold - minusOfBase - brokerSalary - userObject.salary)

    return {
        clear: clear,
        brokerSalary: brokerSalary
    }
}

function getDistintBetweenUnUniqueLeads(lead) {
    const leadDate = dayjs(lead.lastPhoneCalled)
    const now = dayjs()

    const diffMonths = now.diff(leadDate, 'month')

    let dateState
    let salaryToLead

    // если что потом помеять если нужно кофициенты за цел лид salaryToLead
    
    if (diffMonths > 6) {
        dateState = 'Больше полугода'
        salaryToLead = lead.isUniquePhone === true ? 250 : 250
    } else if (diffMonths >= 2 && diffMonths <= 6) {
        dateState = 'Между 2 и 6 месяцами'
        salaryToLead = lead.isUniquePhone === true ? 250 : 100
    } else {
        dateState = lead.isUniquePhone === false ? 'Менее 2 месяцев' : 'первый лид в базе'
        salaryToLead = lead.isUniquePhone === true ? 250 : 0
    }

    // у лидов будет стоять зп за лид зависить только от его уникальности 
    // то что он целевой или не целевой это смотреть имено в кроне на зарплатную в кроне
    let realSalaryToLead = salaryToLead

    return {
        dateState,
        realSalaryToLead,
        phone: lead.phone,
        isUniquePhone: lead.isUniquePhone ? 'уникальный' : 'повтор',
        isTarget: lead.statusOKK
    }
}

async function aggregateUsersLeads(array) {

    let arrayObject = {}
    let allowedHolds = ['hold', 'confirmed', 'refused']

    array.forEach((item) => {

        let userIdString = item?.user?.toString() ?? null
        let userName = item?.userName ?? null

        // if (arrayObject[userIdString]) {
        //     arrayObject[userIdString].countLeads++
        //     arrayObject[userIdString].countHolds += item.countHold
        //     arrayObject[userIdString].sumHold += item.price
        //     arrayObject[userIdString].countTargets += item.statusOKK === true ? 1 : 0
        //     arrayObject[userIdString].leadSalaryPrice += item.leadSalaryPrice || 0
        // } else {
        //     arrayObject[userIdString] = {
        //         userIdString,
        //         countLeads: 1,
        //         countHolds: item.countHold,
        //         sumHold: item.price,
        //         countTargets: item.statusOKK === true ? 1 : 0,
        //         leadSalaryPrice: item.leadSalaryPrice
        //     }
        // }

        if (arrayObject[userName]) {
            arrayObject[userName].countLeads++
            arrayObject[userName].countHolds += item.countHold
            arrayObject[userName].sumHold += item.price
            arrayObject[userName].countTargets += item.statusOKK === true ? 1 : 0
            // arrayObject[userName].leadSalaryPrice += item.leadSalaryPrice || 0
            // тут добавляю проверку на то что он целевой
            arrayObject[userName].leadSalaryPrice += item.statusOKK === true ? item.leadSalaryPrice : 0
        } else {
            arrayObject[userName] = {
                userIdString,
                userName,
                countLeads: 1,
                countHolds: item.countHold,
                sumHold: item.price,
                countTargets: item.statusOKK === true ? 1 : 0,
                // leadSalaryPrice: item.leadSalaryPrice
                // тут добавляю проверку на то что он целевой
                leadSalaryPrice: item.statusOKK === true ? item.leadSalaryPrice : 0
            }
        }

    })

    let aggregatedArr = Object.values(arrayObject)

    for (let user of aggregatedArr) {
        let userObject = await usersModel.findById(user.userIdString)

        if (userObject) {
            user.userName = userObject.name
            user.userRank = userObject.rankName
        }
    }

    return aggregatedArr
}

async function getInfoLeadIsUnique(phone, gte, lte, userName) {
    try {
        const todayStart = dayjs(lte).startOf('day').format('YYYY-MM-DD')
        
        const allLeadsByPhone = await leadsModel.find({
            phone: phone,
            // исключаем лиды за сегодняшний и будущие дни
            date: {
                $lt: todayStart
            },
            userName: userName
        })

        let infoObject = {
            isUniquePhone: true,
            lastPhoneCalled: 'first'
        }

        if (allLeadsByPhone.length > 0) {
            infoObject.isUniquePhone = false
            // сортируем по дате, чтобы взять последнюю
            const sortedLeads = allLeadsByPhone.sort((a, b) => new Date(a.date) - new Date(b.date))
            infoObject.lastPhoneCalled = sortedLeads[sortedLeads.length - 1].date
        }

        return infoObject

    } catch (e) {
        console.log(e.message)
        return null
    }
}

module.exports = { upsertNewLeadsData, getLeadsToDate, getDistintBetweenUnUniqueLeads, aggregateUsersLeads, getLeadsByUser, calculateClearByUser, getInfoLeadIsUnique }