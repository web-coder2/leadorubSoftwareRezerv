const { Schema, model } = require('mongoose');

const usersModel = new Schema({
    email: String,
    name: String,
    skorozvonId: Number,
    password: String,
    rankName: String,
    token: String,
    avatar: {
        type: String,
        required: false
    }
})

module.exports = model('usersModel', usersModel);