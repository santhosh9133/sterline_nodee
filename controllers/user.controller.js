let UserModel = require('../models/user.model');
module.exports = {
    adduser
}

function adduser(req, res) {

    let reqobj = req.body;

    let obj = {
        userName: reqobj.userName,
        email: reqobj.email,
        password: reqobj.password
    };
    UserModel.create(obj, function(error, data) {
        if (error) {
            res.send({ error: error })
        } else {
            res.send({ data: data })
        }
    })
}