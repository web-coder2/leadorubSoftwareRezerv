const dayjs = require('dayjs')
const axios = require('axios')
const mongoose = require('mongoose')
const crone = require('node-cron')
const dotenv = require('dotenv')
const { Router } = require('express');

const leadsModel = require('../models/leadsModel')
const usersStats = require('../models/usersStats.js')

const { getInfoLeadIsUnique, getLeadsByUser, getDistintBetweenUnUniqueLeads } = require('../services/leadsService.js')
const { getDifferenceByCalls } = require('../services/skorozvonService.js')
const { getUserIdByName } = require('../services/usersService')
const { setUsersStatsToDB } = require('../crones/setUsersStats.js')


const router = Router()

router.get('/api/leads/get', async (req, res) => {
    try {
        const { gte, lte, statusOKK, isUnique } = req.query

        const statuses = req.query['statuses[]'];
        const users = req.query['users[]']
        
        console.log(statuses, users)

        const filter = {
            date: {
                $gte: gte,
                $lte: lte
            }
        }

        // TODO: потом подумать как и переделать логику фильтра

        if (statusOKK) {
            // тогда либо true или false
            filter.statusOKK = statusOKK 
        }

        if (isUnique) {
            // тогда либо true или false
            filter.isUniquePhone = isUnique
        }
  
        if (users) {
            const usersFilter = Array.isArray(users) ? users : [users];
            filter.userName = { $in: usersFilter };
        }
  
        if (statuses) {
            const statusesFilter = Array.isArray(statuses) ? statuses : [statuses];
            filter.residenceStatus = { $in: statusesFilter };
        }

        console.log(filter, 'filter filter')
  
        const leadsData = await leadsModel.find(filter);
  
        res.status(200).json({
            leads: leadsData
        });
    } catch (e) {
        res.status(500).json({
            msg: e.message
        });
    }
});


router.post('/api/leads/upsert', async (req, res) => {
    try {
        const { leadsData, date } = req.body

        console.log(leadsData, 'leadsData leadsData leadsData')

        for (let lead of leadsData) {
            
            const updateData = { ...lead };
            delete updateData._id;

            const result = await leadsModel.findOneAndUpdate(
                { phone: lead.phone, date: lead.date },
                { $set: updateData },
                { upsert: true, returnDocument: 'after' }
            );
        }

        let formatDate = dayjs(date).format('YYYY-MM-DD')
        let formatNowDate = dayjs(new Date).format('YYYY-MM-DD')

        if (formatDate < formatNowDate) {
            console.log('не сегодняшняя дата', formatNowDate, '!!!!!!')

            let updateStatsSalary = await setUsersStatsToDB(formatDate, formatDate)
        } else {
            console.log('запрос измеения маисва лидов сегодня !!!!!!!')
        }

        res.status(200).json({
            msg: 'leads updated successfuly'
        })

    } catch (e) {
        res.status(500).json({
            msg: e.message
        })
    }

})

router.post('/api/leads/offers/edit', async (req, res) => {
    try {

        let { leadObject } = req.body

        const updatedLead = { ...leadObject }
        delete updatedLead._id

        let newLeadPrice = 0
        let newLeadHoldCount = 0

        let editedLeadDate = dayjs(updatedLead.date).format('YYYY-MM-DD')

        updatedLead.offersList.forEach((offer) => {
            if (['hold', 'confirmed', 'refused'].includes(offer.status)) {
                const price = Number(offer.price) || 0
                newLeadPrice += price
                newLeadHoldCount += 1
            }
        })

        const resultByUpdateLeadOffers = await leadsModel.findOneAndUpdate(
            { phone: updatedLead.phone, date: updatedLead.date },
            { 
                $set: {
                    price: newLeadPrice,
                    offersList: updatedLead.offersList,
                    countHold: newLeadHoldCount
                } 
            }
        )

        let updateStatsSalary = await setUsersStatsToDB(editedLeadDate, editedLeadDate)

        res.status(200).json({
            result: resultByUpdateLeadOffers 
        })

    } catch (e) {
        console.log(e.message)
        res.status(500).json({
            msg: e.message
        })
    }
})

router.post('/api/leads/edit', async (req, res) => {
    try {

        let { editedLead } = req.body

        const updateData = { ...editedLead }
        delete updateData._id;

        const result = await leadsModel.findOneAndUpdate(
            { phone: editedLead.phone, date: editedLead.date },
            { $set: updateData },
            { upsert: true, returnDocument: 'after' }
        );

        res.status(200).json({
            msg: 'Лид успешно редактированый'
        })

    } catch (e) {
        console.log(e.message)
        res.status(500).json({
            msg: e.message
        })
    }
})

router.post('/api/leads/delete', async (req, res) => {
    try {

        let { leadId } = req.body

        const result = await leadsModel.findOneAndDelete({
            _id: leadId
        })

        res.status(200).json({
            msg: 'Лид успешно удален'
        })

    } catch (e) {
        console.log(e.message)
        res.status(500).json({
            msg: e.message
        })
    }
})

// сдесь будут добавляся лиды системеные но созданые админом если вдруг не получилось спарсить с скорозвона ебучего
router.post('/api/leads/create', async (req, res) => {

    try {

        const { leadObject } = req.body

        const userId = await getUserIdByName(leadObject.userName)

        const infoByUniqueLead = await getInfoLeadIsUnique(leadObject.phone, leadObject.date, leadObject.date)

        if (infoByUniqueLead) {
            leadObject.isUniquePhone = infoByUniqueLead.isUniquePhone
            leadObject.lastPhoneCalled = infoByUniqueLead.lastPhoneCalled
        } else {
            leadObject.isUniquePhone = true
            leadObject.lastPhoneCalled = 'first'
        }

        let isUniqueOtherInfo = getDistintBetweenUnUniqueLeads(leadObject)

        if (isUniqueOtherInfo) {
            leadObject.uniqueState = isUniqueOtherInfo.dateState
            leadObject.leadSalaryPrice = isUniqueOtherInfo.realSalaryToLead
        }

        let selfLeadValue = false

        if (leadObject.selfLead === 'Сам') {
            selfLeadValue = true
        } else if (leadObject.selfLead === 'На брокера') {
            selfLeadValue = false
        } else if (leadObject.selfLead === 'Ручной') {
            selfLeadValue = false
        }

        const newLeadObject = leadsModel({
            date: leadObject.date,
            broker: leadObject.broker,
            price: leadObject.price,
            phone: leadObject.phone.replace(/\D/g, ''),
            audioArray: leadObject.audioArray,
            residenceStatus: leadObject.residenceStatus,
            statusOKK: leadObject.statusOKK,
            // selfLead: leadObject.selfLead.value,
            selfLead: selfLeadValue,
            selfLeadName: leadObject.selfLead,
            user: userId?._id ?? null,
            userName: leadObject.userName,
            countHold: leadObject.countHold,
            isEdited: true,
            isUniquePhone: leadObject.isUniquePhone,
            lastPhoneCalled: leadObject.lastPhoneCalled,
            uniqueState: leadObject.uniqueState,
            leadSalaryPrice: leadObject.leadSalaryPrice,
        })

        console.log(newLeadObject, 'newLeadObject !!!!!')

        const result = await newLeadObject.save()

        res.status(200).json({
            msg: 'lead created successfuly'
        })

    } catch (e) {
        res.status(500).json({
            msg: e.message
        })
    }

})


router.get('/api/leads/intensity', async (req, res) => {
    try {

        const { gte, userName } = req.query

        const lte = dayjs(gte).endOf('week').format('YYYY-MM-DD')

        let leads = await getLeadsByUser(gte, lte, userName)

        let intensity = {}

        leads.forEach((lead) => {
            if (!intensity[lead.date]) {
                intensity[lead.date] = [lead]
            } else {
                intensity[lead.date].push(lead)
            }
        })

        res.status(200).json({
            intensity
        })

    } catch (e) {
        res.status(500).json({
            msg: e.message
        })
    }
})

router.get('/api/test/diffinity', async (req, res) => {

    try {

        let { gte, lte } = req.query

        let difinityObjectsArray = []

        let usersStatsArrayOfUsers = await usersStats.find({
            date: {
                $gte: gte,
                $lte: lte
            }
        })

        for (let user of usersStatsArrayOfUsers) {
            let data = await getDifferenceByCalls(gte, lte, user)

            difinityObjectsArray.push(data)

        }

        res.status(200).json({
            data: difinityObjectsArray
        })

    } catch (e) {
        res.status(500).json({
            msg: e.message
        })
        console.log(e.message)
    }


})

module.exports = router