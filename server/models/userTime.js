const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const userTimeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    times: {
        type: String,
        required: true
    },
})

const Todo = mongoose.model('UserTime', userTimeSchema)

module.exports = Todo;