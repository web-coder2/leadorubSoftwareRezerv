const dayjs = require('dayjs')
const axios = require('axios')
const mongoose = require('mongoose')
const crone = require('node-cron')
const dotenv = require('dotenv')
const { Router } = require('express');

const transfersModel = require('../models/transfersModel.js')

const { getUserIdByName } = require('../services/usersService.js')

const router = Router()

router.post('/api/transfers/create', async (req, res) => {
    try {
        const { transferObject } = req.body;
  
        const userId = await getUserIdByName(transferObject.userName);
      
        if (!userId || !userId._id) {
            return res.status(400).json({ msg: 'User not found' });
        }
  
        const newTransferObject = new transfersModel({
            date: transferObject.date,
            userName: transferObject.userName,
            userId: userId._id,
            phone: transferObject.phone.replace(/\D/g, ''),
            client: transferObject.client,
            description: transferObject.description
        });
  
        await newTransferObject.save();
  
        res.status(200).json({
            msg: 'transfer created successfully'
        });
    } catch (e) {
        res.status(500).json({
            msg: e.message
        });
    }
});

router.get('/api/transfers/get', async (req, res) => {

    try {

        const { gte, lte } = req.query

        const transfersByDate = await transfersModel.find({
            date: {
                $gte: gte,
                $lte: lte
            }
        })

        res.status(200).json({
            transfers: transfersByDate
        })

    } catch (e) {
        res.status(500).json({
            msg: e.message
        })
    }

})

module.exports = router