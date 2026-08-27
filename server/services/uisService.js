const dayjs = require('dayjs')
const axios = require('axios')
const mongoose = require('mongoose')
const crone = require('node-cron')
const dotenv = require('dotenv')
const https = require('https')

const { getBrokers } = require('./residenceService')

dotenv.config()

const { UIS_TOKEN } = process.env

async function getUISCalls(gte, lte) {
    try {

        let uisCalls = []
        let brokers = await getBrokers()

        const response = await axios.get('https://uis.hbnetwork.ru/api/legs', {
            params: {
                _createdAt: [dayjs(gte).format('YYYY-MM-DD'), dayjs(lte).format('YYYY-MM-DD')],
                _limit: 0,
            },
            headers: { Authorization: `Bearer ${UIS_TOKEN}` },
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
        })

        response.data.data.forEach((call) => {

            let userKey = brokers.find((item) => {
                return item.employeeId.toString() === call.employeeId
            })

            let broker = null

            if (userKey) {
                broker = userKey.user
            }

            uisCalls.push({
                phone: call.contactPhone,
                employeeId : call.employeeId,
                broker: broker
            })
        })

        return uisCalls

    } catch (e) {
        console.log('ошибка получения даных с uis', e.message)
        return []
    }
}

module.exports = { getUISCalls }