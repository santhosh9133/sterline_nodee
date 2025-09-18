let mongoose = require('mongoose')
let Schema = mongoose.Schema;

let orderSchema = new Schema({
    fooditem: { type: String },
    amount: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'user' }
})

orderSchema.pre('save', function(next) {
    next();
});
module.exports = mongoose.model('order', orderSchema)