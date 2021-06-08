const mongoose = require('mongoose')
mongoose.connect('mongodb://drwu:biyesheji@drwu.top:7017/drwu?authSource=admin')

let db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
    console.log('we are connected')
})

module.exports = db