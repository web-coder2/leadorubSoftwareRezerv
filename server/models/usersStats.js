const { Schema, model } = require('mongoose');

const usersStats = new Schema({
    email: String,
    name: String,
    date: String,
    countCalls: Number,
    countCallsWithProfile: Number,
    countLeads: Number,
    countTargets: Number,
    countHolds: Number,
    sumHold: Number,
    salary: Number,
    bonus: Number,
    scriptBonus: Number,
    clear: Number,
    brokerSalary: Number,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'usersModel',
        required: false
    },
    salaryToLeads: Number
})

module.exports = model('usersStats', usersStats);