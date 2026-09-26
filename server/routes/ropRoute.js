const dayjs = require('dayjs')
const axios = require('axios')
const mongoose = require('mongoose')
const crone = require('node-cron')
const dotenv = require('dotenv')
const { Router } = require('express');
const router = Router()

const usersStatsModel = require('../models/usersStats.js')
const leadsModel = require('../models/leadsModel.js')

const { getCardDataToSumAggr, getCardDataFromLeadsSumAggr, getLidorubsDataAggregated, getPercentByCardStats, getConversionValues, getBrokersAggregatedData } = require('../services/ropService.js')


router.get('/api/rop/analytics', async (req, res) => {
    try {

        const { gte, lte } = req.query

        const startDate = dayjs(gte)
        const endDate = dayjs(lte)
        const diffDays = endDate.diff(startDate, 'day') + 1

        const currentStatsData = await usersStatsModel.find({
            date: {
                $gte: startDate.format('YYYY-MM-DD'),
                $lte: endDate.format('YYYY-MM-DD')
            }
        })

        const currentLeadsData = await leadsModel.find({
            date: {
                $gte: startDate.format('YYYY-MM-DD'),
                $lte: endDate.format('YYYY-MM-DD')
            }
        })

        const prevEndDate = startDate.subtract(1, 'day')
        const prevStartDate = prevEndDate.subtract(diffDays - 1, 'day')

        const previousStatsData = await usersStatsModel.find({
            date: {
                $gte: prevStartDate.format('YYYY-MM-DD'),
                $lte: prevEndDate.format('YYYY-MM-DD')
            }
        })

        const previousLeadsData = await leadsModel.find({
            date: {
                $gte: prevStartDate.format('YYYY-MM-DD'),
                $lte: prevEndDate.format('YYYY-MM-DD')
            }
        })

        let currentCardDataObject = getCardDataToSumAggr(currentStatsData)
        let previousCardDataObject = getCardDataToSumAggr(previousStatsData)

        let currentCardLeadDataObject = getCardDataFromLeadsSumAggr(currentLeadsData)
        let previousCardLeadDataObject = getCardDataFromLeadsSumAggr(previousLeadsData)

        let currentMergeCardData = { ...currentCardDataObject, ...currentCardLeadDataObject }
        let previousMergeCardData = { ...previousCardDataObject, ...previousCardLeadDataObject }

        let percentValuesForCurrentObject = getPercentByCardStats(currentMergeCardData, previousMergeCardData)

        currentMergeCardData.percent = { ...percentValuesForCurrentObject }
        currentMergeCardData.conversion = { ...getConversionValues(currentMergeCardData) }

        console.log('CURRENT', currentMergeCardData)


        let lidorubsData = getLidorubsDataAggregated(currentLeadsData, currentStatsData)
        let brokersData = getBrokersAggregatedData(currentLeadsData)

        console.log(lidorubsData, 'lidorubsData lidorubsData')

        res.status(200).json({
            data: {
                cardsData: currentMergeCardData,
                lidorubsData,
                brokersData
            }
        })

    } catch (e) {
        console.log(e.message)
        res.status(500).json({
            err: e.message
        })
    }
})


module.exports = router
