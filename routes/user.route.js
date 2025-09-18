let express = require('express')
let router = express.Router()

let usercontroller = require('../controllers/user.controller')
router.post('/adduser', usercontroller.adduser)







module.exports = router