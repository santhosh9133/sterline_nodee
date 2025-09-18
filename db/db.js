let mongoose = require('mongoose')

mongoose.set('strictQuery', true)
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.connection.once('open', function() {
    console.log('database connected')
}).on('error', function(error) {
    console.log(error);
})
module.exports = mongoose