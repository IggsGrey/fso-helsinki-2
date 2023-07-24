const mongoose = require('mongoose')

const connection_string = process.env.MONGODB_URI

mongoose.connect(connection_string)


module.exports = mongoose
