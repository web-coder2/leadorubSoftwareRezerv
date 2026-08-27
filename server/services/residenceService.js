const dayjs = require('dayjs')
const axios = require('axios')
const mongoose = require('mongoose')
const crone = require('node-cron')
const dotenv = require('dotenv')
const https = require('https')

dotenv.config()

const { residenceBaseUrl, residenceToken } = process.env

async function getResidenceLeads(gte, lte) {
    try {
        const responseLeads = await axios.get(`${residenceBaseUrl}leads`, {
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            headers: { Authorization: `Bearer ${residenceToken}` },
            params: {
                startedAt: ['gte:' + dayjs(gte).format('YYYY-MM-DD'), 'lte:' + dayjs(lte).format('YYYY-MM-DD')],
                _populate: 'userId offerId',
                _select: 'status phone startedAt price',
                _limit: 0,
            },
        })

        return responseLeads.data

    } catch (e) {
        console.log(e.message)
    }
}

async function getBrokers() {
    try {
        let brokers = []
        const response = await axios.get(`${residenceBaseUrl}users/`, {
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            headers: { Authorization: `Bearer ${residenceToken}` },
            params: { 
                _page: 1, 
                _limit: 500,
                _populate: 'rankId'
            }
        })

        let users = response.data.data
        const notAllowedRanks = ['Админ', 'Уволен', 'Стажер']

        users = users.filter((user) => {
            return !notAllowedRanks.includes(user.rankId.name)
        })

        users.forEach((user) => {
            brokers.push({
                user: user?.name ?? null,
                employeeId: user?.integrations?.uis?.employeeId ?? null
            })
        })

        brokers = brokers.filter((broker) => {
            return broker.employeeId !== null
        })

        return brokers
    } catch (e) {
        console.log('ошбика получения бркоеров из резиденции', e.message)
    }
}

async function findAllCallsInResidence(gte, lte) {
    try {
        const response = await axios.get(`${residenceBaseUrl}calls`, {
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            headers: { Authorization: `Bearer ${residenceToken}` },
            params: {
                startedAt: ['gte:' + dayjs(gte).format('YYYY-MM-DD'), 'lte:' + dayjs(lte).format('YYYY-MM-DD')],
                state: ['transfer', 'call', 'break'],
                _populate: 'userId',
                _limit: 0
            }
        })

        const residenceCalls = response.data.data

        // console.log(residenceCalls, '********* RESIDENCE CALLS ***********', residenceCalls.length)

        let miniResidenceCalls = []

        residenceCalls.forEach((call) => {
            miniResidenceCalls.push({
                state: call.state,
                phone: call.contactPhone,
                broker: call?.userId?.name ?? null
            })
        })

        return miniResidenceCalls
    } catch (e) {
        console.log(e.message)
        return []
    }
}

async function defaineSelfLead(gte, lte, phone) {

    try {
        const allowedUsers = ['Владимир Медоед', 'Наташа Юрист ']

        const allLeadsToDate = await getResidenceLeads(gte, lte)
        const allLeadsData = allLeadsToDate.data
        const leadsByPhone = allLeadsData.filter((item) => {
            return item.phone === phone
        })

        let selfLead = false

        if (leadsByPhone) {
            for (let lead of leadsByPhone) {
                if (allowedUsers.includes(lead.userId.name)) {
                    selfLead = true
                    break
                }
            }
        }
        return selfLead
    } catch (e) {
        console.log(e.message)
        return false
    }
}

// получить лиды резиденции по одному телефону
async function getLeadsOnePhone(gte, lte, phone) {
    try {
        const allLeadsInDate = await getResidenceLeads(gte, lte)
        const allLeadsData = allLeadsInDate.data
        const allowedHolds = ['hold', 'confirmed', 'refused']

        const leadsByPhone = allLeadsData.filter((item) => {
            return item.phone === phone
        })
        let residenceInfo = {
            price: 0,
            status: "created",
            broker: undefined,
            countHold: 0,
            offersList: []
        }

        let currentStatus = ""  // текущий статус во время итераций
        let holdStatus = null  // финалбьный статус если в какойто итеарции будет hold, confirmed или refused

        // Лидоруб сделал 1 трансфер и брокер с него сделал напрмиер 3 холда
        // тогда в price будет например 3000 + 4000 + 5000
        // status будет или hold или confirmed или refused
        // а countHold будет 1 + 1 + 1

        leadsByPhone.forEach((item) => {
            if (allowedHolds.includes(item.status)) {
                residenceInfo.price += item?.price?.offer
                residenceInfo.countHold += 1
                // финальный статус
                holdStatus = item.status ?? 'created'

                residenceInfo.offersList.push({
                    offerName: item?.offerId?.name ?? '',
                    broker: item?.userId?.name ?? '',
                    price: item?.price?.offer,
                    status: item?.status ?? 'created',
                })

            } else {
                // изменяем текущий статус
                currentStatus = item.status
                
                residenceInfo.offersList.push({
                    offerName: item?.offerId?.name ?? '',
                    broker: item?.userId?.name ?? '',
                    price: allowedHolds.includes(item.status) ? item?.price?.offer : 0,
                    status: item?.status ?? 'created',
                })
            }

            residenceInfo.broker = item.userId.name
            residenceInfo.status = holdStatus !== null ? holdStatus : currentStatus

        })

        return residenceInfo
    } catch (e) {
        console.log(e.message)
    }
}


module.exports = { getResidenceLeads, getLeadsOnePhone, defaineSelfLead, findAllCallsInResidence, getBrokers }