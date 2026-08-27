// это модель лидов но созданых вручную лидорубами
// пока скорее всего будет только для просомтра быть


const { Schema, model } = require('mongoose');

const transfersModel = new Schema({
    date: String,
    userName: String,
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'usersModel'
    },
    phone: String,
    client: String,
    description: String,
    // дальше идут свойства которые будут записываться скриптом
    statusOKK: Boolean,
    residenceStatus: String,
    broker: String,
    price: Number,
    countHold: Number,
    selfTransfer: Boolean,
})

module.exports = model('transfersModel', transfersModel);