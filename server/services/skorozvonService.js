const dayjs = require('dayjs')
const axios = require('axios')
const mongoose = require('mongoose')
const crone = require('node-cron')
const dotenv = require('dotenv')


dotenv.config()

const { skorozvonAPI, skorozvonUSER, skorozvonID, skorozvonSecret } = process.env


async function getSkorozvonToken() {
    try {
        const response = await axios.post('https://api.skorozvon.ru/oauth/token', {
            grant_type: 'password',
            username: skorozvonUSER,
            api_key: skorozvonAPI,
            client_id: skorozvonID,
            client_secret: skorozvonSecret,
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Ошибка авторизации Skorozvon:', error);
    }
}

async function getDifferenceByCalls(gte, lte, user) {

    // получить данные о звонках от имени админа
    let dataCallsByAdmin = await getSkorozvonCallsByUser(gte, lte, user, user.countCalls)

    // получить масив с данными из кобинета ЛД
    let dataCallsByUser = await getSkorozvonCallsFromProfileArray(gte, lte, user)

    const adminDatesSet = new Set(dataCallsByAdmin.map(call => call.date));

    const uniquePhones = dataCallsByUser.filter(userCall => !adminDatesSet.has(userCall.date));

    return {
        userName: user.name,
        uniquePhones: uniquePhones
    }

}

async function getSkorozvonCallsFromProfileArray(gte, lte, user) {

    try {

        let userCallsPages = Math.ceil(user.countCalls / 100)
        let userCallsArray = []

        const response = await axios.post('https://app.skorozvon.ru/supreme/users/login?locale=ru', {
            "user" : {
                // "email":"achkasovarkady97@yandex.ru",
                "email": user.email,
                // "password": user.password,
                "password": 'qwertyuiop123A',
                "ip_address":"e401fd27-748f-4b33-b03c-460454b1e702.local",
                "tz_offset":-180,
                "continue_token":""
            }
        });

        let userToken = response.data.callback_data.headers.authorization

        for (let i = 1; i <= userCallsPages; i++) {

            let result = await axios.get('https://pod5-shard2-lb1.skorozvon.ru/calls', {
                headers: { Authorization: userToken },
                params: {
                    limit: 100,
                    'date[from]': dayjs(gte).format('YYYY-MM-DD'),
                    'date[to]': dayjs(lte).format('YYYY-MM-DD'),
                    'duration[from]': 1,
                    type: 'all',
                    current_type: 'all',
                    direction: 1,
                    column: 'start',
                    page: i,
                    offset: i * 100,
                    // блять ебучий скорозвон назуя вам нужон offset
                    // когда и так уже есть limit и page ????
                    // хватит курить план когда пилите свою апи хуету
                    // я пока увидел что там в offset еще нужно делать запросы прошло много часов (и нервов)
                }
            })

            let data = result.data.data.calls

            data.forEach((call) => {
                // userCallsArray.push(call.number.slice(1))
                userCallsArray.push({
                    phone: call.number.slice(1),
                    date: call.date
                })
            })
        }
    
        return userCallsArray

    } catch (e) {
        console.log(e.message)
    }

}

async function getSkorozvonCallsFromProfile(gte, lte, user) {

    try {

        if (user.email) {

            const response = await axios.post('https://app.skorozvon.ru/supreme/users/login?locale=ru', {
                "user" : {
                    // "email":"achkasovarkady97@yandex.ru",
                    "email": user.email,
                    // "password": user.password,
                    "password": 'qwertyuiop123A',
                    "ip_address":"e401fd27-748f-4b33-b03c-460454b1e702.local",
                    "tz_offset":-180,
                    "continue_token":""
                }
            });

            let userToken = response.data.callback_data.headers.authorization

            let result = await axios.get('https://pod5-shard2-lb1.skorozvon.ru/calls', {
                headers: { Authorization: userToken },
                params: {
                    limit: 100,
                    'date[from]': dayjs(gte).format('YYYY-MM-DD'),
                    'date[to]': dayjs(lte).format('YYYY-MM-DD'),
                    'duration[from]': 1,
                    type: 'all',
                    current_type: 'all',
                    direction: 1,
                    column: 'start',
                    page: 1,
                    offset: 0,
                }
            })
            let responseDataByCalls = result.data.data.total

            return responseDataByCalls
        }

    } catch (e) {
        console.log(e.message)
    }

}


async function getSkorozvonCallsByUser(gte, lte, user, countCalls) {

    try {

        let countPages = Math.ceil(countCalls / 100)
        let callsArray = []

        const token = await getSkorozvonToken()

        const usersList = await axios.get('https://pod5-shard2-lb1.skorozvon.ru/settings/team.json', {
            headers: { 
                Authorization: `Bearer ${token}` 
            }
        }).then( res => res.data.data.team )

        let userObject = usersList.find((item) => {
            return item.email === user.email
        })


        for (let i = 1; i <= countPages; i++) {

            const responseCalls = await axios.get('https://pod5-shard2-lb1.skorozvon.ru/calls', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    limit: 100,
                    'date[from]': dayjs(gte).format('YYYY-MM-DD'),
                    'date[to]': dayjs(lte).format('YYYY-MM-DD'),
                    'duration[from]': 1,
                    type: 'all',
                    offset: i * 100,
                    users: userObject.id,
                    _page: i
                }
            })

            let callsData = responseCalls.data.data.calls

            callsData.forEach((call) => {
                // callsArray.push(call.number.slice(1))
                callsArray.push({
                    phone: call.number.slice(1),
                    date: call.date
                })
            })

        }

        return callsArray
    
    } catch (e) {
        console.log(e.message)
        return []
    }
}

async function getSkorozvonCalls(gte, lte) {

    try {
        const params = {
            limit: 100,
            'date[from]': dayjs(gte).format('YYYY-MM-DD'),
            'date[to]': dayjs(lte).format('YYYY-MM-DD'),
            'duration[from]': 1,
            type: 'all',
            page: 1,
            offset: 0,
        };

        const token = await getSkorozvonToken()

        let usersCallsArray = []

        const usersList = await axios.get('https://pod5-shard2-lb1.skorozvon.ru/settings/team.json', {
            headers: { 
                Authorization: `Bearer ${token}` 
            }
        }).then( res => res.data.data.team )


        for (let user of usersList) {
            const userParams = { ...params, users: user.id };
            const responseCalls = await axios.get('https://pod5-shard2-lb1.skorozvon.ru/calls', {
                headers: { Authorization: `Bearer ${token}` },
                params: userParams,
            });

            usersCallsArray.push({
                email: user.email,
                name: user.name,
                countCalls: responseCalls.data.data.total
            })
        }
        
        return usersCallsArray
    
    } catch (e) {
        console.log(e.message)
        return []
    }
}


async function getLeadsToOneDay(gte, lte) {

    try {
        const url = 'https://pod5-shard2-lb1.skorozvon.ru/calls';
        const token = await getSkorozvonToken()

        const params = {
            limit: 100,
            'date[from]': dayjs(gte).format('YYYY-MM-DD'),
            'date[to]': dayjs(lte).format('YYYY-MM-DD'),
            'duration[from]': '',
            'duration[to]': '',
            type: 'transfered',
            direction: 1,
            column: 'start',
            page: 1,
            offset: 0,
        };

        const trasnfersList = await axios.get(url, {
            params: params,
            headers: { Authorization: `Bearer ${token}`}
        }).then((resp) => {
            return resp.data.data.calls;
        });

        return trasnfersList
    } catch (e) {
        console.log(e.message)
    }

}

async function getLeadAudioUrls(transfer) {

    let audioUrls = []

    try {

        const token = await getSkorozvonToken()
        const leadURL = `https://pod5-shard2-lb1.skorozvon.ru/${transfer.lead_url}/history`;

        const response = await axios.get(leadURL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const leads = response.data.data;

        for (let lead of leads.data) {
            const audioUrl = `https://pod5-shard2-lb1.skorozvon.ru/call_records/${lead.attachment_id}`

            const responseUrl = await axios.get(audioUrl, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // audioUrls.push({
            //     url: responseUrl.data.data.url,
            //     manager: responseUrl.data.data.track_manager
            // })

            audioUrls.push(responseUrl.data.data.url)
        }
        return audioUrls
    } catch (e) {
        // console.log(e.message)
        return audioUrls
    }
}

async function getLeadTimeline(transfer, onlyTransfers = false) {
    try {
        const token = await getSkorozvonToken();
        const leadURL = `https://pod5-shard2-lb1.skorozvon.ru/${transfer.lead_url}/history`;

        let userName = "";

        const response = await axios.get(leadURL, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const leads = response.data.data;

        let leadPhoneInfo = []

        for (let lead of leads.data) {
            let user = lead.called_user || lead.manager;

            if (user) {
                userName = user;
                break;
            }
        }

        var currentUser = null

        leads.data.forEach((lead) => {
            let user = lead.called_user || lead.manager;

            if (user) {
                currentUser = user
            }
        })

        leads.data.forEach((lead) => {
            let isAttemptTransfer = lead.transfered
            let transferId = lead.id
            let seconds = lead.seconds
            
            // TODO те которые не сегодняшней даты их не пушить в масив 

            leadPhoneInfo.push({
                isAttemptTransfer: isAttemptTransfer,
                transferId: transferId,
                seconds: seconds,
                isSuccessTransfer: isAttemptTransfer === 't' && seconds !== '0' ? true : false,
                time: lead.time,
                date: lead.date,
                user: currentUser
            })
        })

        if (onlyTransfers === true) {
            return leadPhoneInfo
        } else {
            return { userName, leadPhoneInfo }
        }

    } catch (e) {
        console.log(e.message);
        return null;
    }
}

module.exports = { getSkorozvonToken, getSkorozvonCalls, getLeadsToOneDay, getLeadTimeline, getLeadAudioUrls, getSkorozvonCallsFromProfile, getDifferenceByCalls }