const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const path = require('path')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const session = require('express-session')
const cors = require('cors');

const { setTransfersCrone } = require('./crones/setTransfers.js')
const { setUsersStatsCrone } = require('./crones/setUsersStats.js')
const { updateTransfersCrone } = require('./crones/updateUsersTransfers.js')
const { setBonusesDataCron } = require('./crones/setBonuses.js')

const usersRoute = require('./routes/usersRoute.js')
const leadsRoute = require('./routes/leadsRoute.js')
const usersStatsRoute = require('./routes/usersStatsRoute.js')
const transfersRoute = require('./routes/transfersRoute.js')
const residenceRoute = require('./routes/residenceRoute.js')
const skorozvonRoute = require('./routes/skorozvonRoute.js')
const bonusesRoute = require('./routes/bonusesRoute.js')

setBonusesDataCron()
setTransfersCrone()
setUsersStatsCrone()
// updateTransfersCrone()

dotenv.config()

const app = express()
const PORT = 3000

const MONGO_URL = process.env.DATABASE_URL
const MONGO_USER = process.env.DATABASE_USERNAME
const MONGO_PASS = process.env.DATABASE_PASSWORD
const MONGO_PORT = process.env.DATABASE_PORT
const DATABASE_NAME = process.env.DATABASE_NAME

app.use(cors({ origin: '*' }))
app.use(express.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/public', express.static('public'))

app.use(
    session({
        secret: 'qwertyuiop123A',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 60 * 60 * 1000 }
    })
);

app.use(cookieParser());

// Обслуживание статических файлов из client/dist
app.use(express.static(path.join(__dirname, '../client/dist')));

// Middleware этот будет для прода чтобы отдавать статику если нет такого
app.use((req, res, next) => {

    const reqQuery = req.path

    if (reqQuery.includes('/api/')) {
        console.log('Request path:', reqQuery);
        next()
    } else {
        res.sendFile(path.join(__dirname, '../client/dist/index.html'))
        console.log('client interfface path: ', reqQuery)
    }

});


app.use(usersRoute)
app.use(leadsRoute)
app.use(usersStatsRoute)
app.use(transfersRoute)
app.use(residenceRoute)
app.use(skorozvonRoute)
app.use(bonusesRoute)


async function startConnectToDB() {
    try {
        const uri = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_URL}:${MONGO_PORT}/${DATABASE_NAME}?authSource=admin`;
        await mongoose.connect(uri);
    } catch (err) {
        console.log(err);
    }
}

app.listen(PORT, () => {
    startConnectToDB()
    console.log(`Server listening at http://localhost:${PORT}`);
});