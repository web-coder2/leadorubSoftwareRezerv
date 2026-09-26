export function getCardDataToSumAggr (usersStatsDataArray) {
    let totalObject = {
        countCalls: 0,
        countLeads: 0,
        countTargets: 0,
        clear: 0
    }

    usersStatsDataArray.forEach((row) => {
        totalObject.countCalls += row.countCalls
        totalObject.countLeads += row.countLeads
        totalObject.countTargets += row.countTargets
        totalObject.clear += row.clear
    })

    return totalObject
}

export function getCardDataFromLeadsSumAggr (leadsDataArray) {
    let totalObject = {
        countResidence: 0,
        countHold: 0,
        countInvalid: 0,
        countBreaked: 0,
        sumHold: 0
    }

    leadsDataArray.forEach((lead) => {
        totalObject.countResidence += lead.broker === null ? 0 : 1
        totalObject.countHold += lead.countHold
        totalObject.countInvalid += lead.residenceStatus === 'invalid' ? 1 : 0
        totalObject.countBreaked += lead.residenceStatus === 'breaked' ? 1 : 0
        totalObject.sumHold += lead.price
    })

    return totalObject
}

export function getLidorubsDataAggregated (leadsDataArray, usersStatsArr) {

    let aggregatedDataObject = {}

    usersStatsArr.forEach((row) => {
        if (aggregatedDataObject[row.name]) {
            aggregatedDataObject[row.name].countCalls += row.countCalls
            aggregatedDataObject[row.name].countLeads += row.countLeads
            aggregatedDataObject[row.name].countTargets += row.countTargets
            aggregatedDataObject[row.name].countHolds += row.countHolds
            aggregatedDataObject[row.name].sumHold += row.sumHold
        } else {
            aggregatedDataObject[row.name] = {
                name: row.name,
                countCalls: row.countCalls,
                countLeads: row.countLeads,
                countTargets: row.countTargets,
                countHolds: row.countHolds,
                sumHold: row.sumHold,
                salary: row.salary,
                clear: row.clear,
                countCreated: 0,
                countBreaked: 0,
                countInvalid: 0
            }
        }
    })

    let aggregatedDataArray = Object.values(aggregatedDataObject)

    let totalLidorubValue = {
        name: 'Итого',
        countCalls: 0,
        countLeads: 0,
        countTargets: 0,
        countHolds: 0,
        sumHold: 0,
        salary: 0,
        clear: 0,
        countCreated: 0,
        countBreaked: 0,
        countInvalid: 0,
    }

    aggregatedDataArray.forEach((user) => {
        user.conversion = {
            callLead: Math.round(user.countLeads / user.countCalls * 100),
            leadTarget: Math.round(user.countTargets / user.countLeads * 100),
            targetHold: Math.round(user.countHolds / user.countTargets * 100),
        }

        let leadsToThisLidorub = leadsDataArray.filter((lead) => {
            return lead.userName === user.name
        })

        leadsToThisLidorub.forEach((lead) => {
            user.countBreaked += lead.residenceStatus === 'breaked' ? 1 : 0
            user.countInvalid += lead.residenceStatus === 'invalid' ? 1 : 0
            user.countCreated += lead.residenceStatus === 'created' ? 1 : 0
        })

        totalLidorubValue.countCalls += user.countCalls
        totalLidorubValue.countLeads += user.countLeads
        totalLidorubValue.countTargets += user.countTargets
        totalLidorubValue.countHolds += user.countHolds
        totalLidorubValue.sumHold += user.sumHold
        totalLidorubValue.salary += user.salary
        totalLidorubValue.clear += user.clear
        totalLidorubValue.countCreated += user.countCreated
        totalLidorubValue.countBreaked += user.countBreaked
        totalLidorubValue.countInvalid += user.countInvalid
    })

    totalLidorubValue.conversion = {
        callLead: Math.round(totalLidorubValue.countLeads / totalLidorubValue.countCalls * 100),
        leadTarget: Math.round(totalLidorubValue.countTargets / totalLidorubValue.countLeads * 100),
        targetHold: Math.round(totalLidorubValue.countHolds / totalLidorubValue.countTargets * 100)
    }

    aggregatedDataArray.push(totalLidorubValue)

    return aggregatedDataArray
}


export function getBrokersAggregatedData (leadsArray) {
    console.log(leadsArray, '*^&%*&%*&%*&%')

    let brokerAggregatedObject = {}

    leadsArray.forEach((lead) => {
        if (brokerAggregatedObject[lead.broker]) {
            brokerAggregatedObject[lead.broker].countLeads += 1
            brokerAggregatedObject[lead.broker].countCreated += lead.residenceStatus === 'created' ? 1 : 0
            brokerAggregatedObject[lead.broker].countBreaked += lead.residenceStatus === 'breaked' ? 1 : 0
            brokerAggregatedObject[lead.broker].countInvalid += lead.residenceStatus === 'invalid' ? 1 : 0
            brokerAggregatedObject[lead.broker].countHold += lead.countHold
            brokerAggregatedObject[lead.broker].sumHold += lead.price
        } else {
            brokerAggregatedObject[lead.broker] = {
                broker: lead.broker,
                countLeads: 1,
                countCreated: lead.residenceStatus === 'created' ? 1 : 0,
                countBreaked: lead.residenceStatus === 'breaked' ? 1 : 0,
                countInvalid: lead.residenceStatus === 'invalid' ? 1 : 0,
                countHold: lead.countHold,
                sumHold: lead.price
            }
        }
    })

    let totalBrokerValue = {
        broker: 'Итого',
        countLeads: 0,
        countCreated: 0,
        countBreaked: 0,
        countInvalid: 0,
        countHold: 0,
        sumHold: 0
    }

    let brokerAggregatedArray = Object.values(brokerAggregatedObject)

    brokerAggregatedArray.forEach((broker) => {
        broker.conversion = {
            holdPercent: Math.floor(broker.countHold / broker.countLeads * 100),
            breakedPercent: Math.floor(broker.countBreaked / broker.countLeads * 100),
            invalidPercent: Math.floor(broker.countInvalid / broker.countLeads * 100),
            createdPercent: Math.floor(broker.countCreated / broker.countLeads * 100),
        }

        totalBrokerValue.countLeads += broker.countLeads
        totalBrokerValue.countCreated += broker.countCreated
        totalBrokerValue.countBreaked += broker.countBreaked
        totalBrokerValue.countInvalid += broker.countInvalid
        totalBrokerValue.countHold += broker.countHold
        totalBrokerValue.sumHold += broker.sumHold
    })

    totalBrokerValue.conversion = {
        holdPercent: Math.floor(totalBrokerValue.countHold / totalBrokerValue.countLeads * 100),
        breakedPercent: Math.floor(totalBrokerValue.countBreaked / totalBrokerValue.countLeads * 100),
        invalidPercent: Math.floor(totalBrokerValue.countInvalid / totalBrokerValue.countLeads * 100),
        createdPercent: Math.floor(totalBrokerValue.countCreated / totalBrokerValue.countLeads * 100),
    }

    brokerAggregatedArray.push(totalBrokerValue)

    return brokerAggregatedArray
}


export function getPercentByCardStats(currentObject, prevObject) {
    const percentData = {}

    for (const key in currentObject) {
        if (currentObject.hasOwnProperty(key) && prevObject.hasOwnProperty(key)) {
            const currentValue = currentObject[key]
            const prevValue = prevObject[key]

            if (prevValue !== 0) {
                percentData[`${key}Percent`] = Math.round(((currentValue - prevValue) / prevValue) * 100)
            } else {
                percentData[`${key}Percent`] = currentValue !== 0 ? 100 : 0
            }
        }
    }

    return percentData
}

export function getConversionValues(currentObject) {
    const conversionData = {
        callLead: Math.round(currentObject.countLeads / currentObject.countCalls * 100),
        leadTarget: Math.round(currentObject.countTargets / currentObject.countLeads * 100),
        targetResidence: Math.round(currentObject.countResidence / currentObject.countTargets * 100),
        targetHold: Math.round(currentObject.countHold / currentObject.countTargets * 100),
        breakedDevelop: Math.round((currentObject.countResidence - currentObject.countBreaked) / currentObject.countBreaked * 100),
        invalidDevelop: Math.round((currentObject.countResidence - currentObject.countBreaked) / currentObject.countInvalid * 100)
    }
    return conversionData
}