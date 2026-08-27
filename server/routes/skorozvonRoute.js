const dayjs = require('dayjs')
const axios = require('axios')
const mongoose = require('mongoose')
const crone = require('node-cron')
const dotenv = require('dotenv')
const { Router } = require('express');
const https = require('https')

dotenv.config()

const { skorozvonAPI, skorozvonUSER, skorozvonID, skorozvonSecret } = process.env
const { getSkorozvonToken, getLeadsToOneDay, getLeadTimeline, getLeadAudioUrls } = require('../services/skorozvonService.js')
const { findAllCallsInResidence, getResidenceLeads } = require('../services/residenceService.js')
const { getUISCalls } = require('../services/uisService.js')



const router = Router()

router.get('/api/skorozvon/allTransfers', async (req, res) => {
    try {
        const { gte, lte } = req.query
        const data = await getLeadsToOneDay(gte, lte)

        let transfersTableData = []

        // let dataCalls = await findAllCallsInResidence(gte, lte)
        let residenceLeads = await getResidenceLeads(gte, lte)
        let uisCalls = await getUISCalls(gte, lte)

        for (let lead of data) {

            let transferArray = await getLeadTimeline(lead, onlyTransfers = true)

            transferArray.forEach((item) => {
                item.phone = lead.number.slice(1)
                transfersTableData.push(item)

                let brokerFromResidence = residenceLeads.data.find((call) => {
                    return call.phone === item.phone
                })

                let brokersByPhone = uisCalls.find((call) => {
                    return call.phone === item.phone
                })

                if (brokerFromResidence) {
                    item.broker = brokerFromResidence?.userId?.name ?? null
                } else {
                    if (brokersByPhone) {
                        item.broker = brokersByPhone.broker
                    }
                }
            })
        }

        // console.log(transfersTableData, '!!!!!')

        // TODO если что раскоментить для фильтрации от неудачны пеерводов
        transfersTableData = transfersTableData.filter((item) => {
            return item.isAttemptTransfer === 't'
        })

        res.status(200).json({ data: transfersTableData })

    } catch (e) {
        console.log(e.message)
        res.status(500).json({ err: e.message })
    }
})


module.exports = router