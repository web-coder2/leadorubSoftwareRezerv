const dayjs = require('dayjs')
const axios = require('axios')
const mongoose = require('mongoose')
const crone = require('node-cron')
const dotenv = require('dotenv')

const leadsModel = require('../models/leadsModel.js')
const usersModel = require('../models/usersModel.js')
const transfersModel = require('../models/transfersModel.js')


const { getResidenceLeads, getLeadsOnePhone, defaineSelfLead } = require('../services/residenceService.js')
const { mergeTransferToOKK, updateTransferToDB } = require('../services/transfersService.js')


async function updateUsersTransfers(gte, lte) {

    const transfersData = await transfersModel.find({
        date: {
            $gte: dayjs(gte).format('YYYY-MM-DD'),
            $lte: dayjs(lte).format('YYYY-MM-DD')
        }
    })

    for (let lead of transfersData) {

        let leadInResidence = await getLeadsOnePhone(gte, lte, lead.phone)
        let isSelfLead = await defaineSelfLead(gte, lte, lead.phone)
        let isLeadOfOKK = await mergeTransferToOKK(gte, lte, lead.phone)

        lead.residenceStatus = leadInResidence.status
        lead.broker = leadInResidence.broker
        lead.countHold = leadInResidence.countHold
        lead.selfTransfer = isSelfLead
        lead.statusOKK = isLeadOfOKK
        lead.price = leadInResidence.price

        let resultToUpdateDB = await updateTransferToDB(lead)

    }

}

function updateTransfersCrone() {
    const croneHour = '0 * * * *'

    updateUsersTransfers(new Date(), new Date())
  
    // crone.schedule(croneHour, () => {
    //     updateUsersTransfers(new Date(), new Date())
    // })
  }


module.exports = { updateTransfersCrone }