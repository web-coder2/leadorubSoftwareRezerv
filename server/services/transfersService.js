const dayjs = require('dayjs')
const axios = require('axios')
const mongoose = require('mongoose')
const crone = require('node-cron')
const dotenv = require('dotenv')

const leadsModel = require('../models/leadsModel.js')
const transfersModel = require('../models/transfersModel.js')

async function mergeTransferToOKK(gte, lte, phone) {

    let leadInfo = await leadsModel.find({
        date: {
            $gte: dayjs(gte).format('YYYY-MM-DD'),
            $lte: dayjs(lte).format('YYYY-MM-DD')
        },
        phone: phone
    })

    let statusOKK = false

    if (leadInfo) {
        statusOKK = leadInfo[0]?.statusOKK
    } else {
        statusOKK = false
    }

    return statusOKK
}


async function updateTransferToDB(transferObject) {
    try {
        const result = await transfersModel.findOneAndUpdate(
            {
                date: transferObject.date,
                phone: transferObject.phone
            },
            {
                $set: {
                    residenceStatus: transferObject.residenceStatus,
                    broker: transferObject.broker,
                    countHold: transferObject.countHold,
                    selfTransfer: transferObject.selfTransfer,
                    statusOKK: transferObject.statusOKK,
                    price: transferObject.price,
                }
            },
            { upsert: true, new: true }
        )
        return result
    } catch (error) {
        console.error('Ошибка при обновлении/добавлении записи:', error)
        throw error
    }
}

module.exports = { mergeTransferToOKK, updateTransferToDB }