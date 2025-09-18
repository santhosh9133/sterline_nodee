let OrderModel = require('../models/order.model');
module.exports = {
    addorder,
    getorders,
    getorder,
    getAllorders
}

function addorder(req, res) {
    let reqobj = req.body;

    let obj = {
        fooditem: reqobj.fooditem,
        amount: reqobj.amount,
        userId: reqobj.userId
    };
    OrderModel.create(obj, function(error, data) {
        if (error) {
            console.log(error)
        } else {
            res.send({ data: data })
        }
    })
}

function getorders(req, res) {
    let userId = req.params.userId
    OrderModel.find({ userId: userId }).populate('userId').exec(function(error, data) {
        if (error) {
            console.log(error)
        } else {
            res.send({ data: data })
        }
    })
}

function getorder(req, res) {
    let reqobj = req.body;
    let fooditem = reqobj.fooditem
    OrderModel.findOne({ fooditem: fooditem }, function(error, data) {
        if (error) {
            console.log(error)
        } else {
            res.send({ data: data })
        }
    })
}

function getAllorders(req, res) {
    OrderModel.find({}, function(error, data) {
        if (error) {
            console.log(error)
        } else {
            res.send({ data: data })
        }
    })
}