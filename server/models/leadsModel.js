const { Schema, model } = require('mongoose');

const leadsModel = new Schema({
    date: String,
    broker: String,
    price: Number,
    phone: String,
    audioArray: Array,
    residenceStatus: String,
    statusOKK: Boolean,
    selfLead: Boolean,  // как я понял 'Сам' ставит сдесь true а 'На брокера' и 'Ручной' false
    selfLeadName: {
        type: String,
        required: true,
        default: 'На брокера',
        enum: [
            'Сам',
            'На брокера',
            'Ручной'
        ]
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'usersModel',
        required: false // TODO: потом возможно поменять
    },
    userName: String,
    countHold: Number,
    isEdited: Boolean, // это фалжок лидии алексеевны (ОКК)
    commentOKK: {
        type: String,
        required: false,
        default: ""
    },
    offersList: {
        type: [{
            offerName: String,
            broker: String,
            price: Number,
            status: String,
        }],
        required: false,
        default: []
    },
    isUniquePhone: Boolean,
    lastPhoneCalled: String,
    // добавляю новые свойтса сюда лучше чем в зарплатной их держать
    uniqueState: String,
    leadSalaryPrice: Number,
    isBreakedStatus: Boolean, // если это был обрыв (true) то не считать в зарплатной и окк (PS позже дообсудить это)
})

module.exports = model('leadsModel', leadsModel);