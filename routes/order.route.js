let express = require('express')
let router = express.Router()

let ordercontroller = require('../controllers/order.controller')
router.post('/addorder', ordercontroller.addorder)
router.get('/getorders/:userId', ordercontroller.getorders)
router.get('/getorder', ordercontroller.getorder)
router.get('/getAllorders', ordercontroller.getAllorders)










module.exports = router