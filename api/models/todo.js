const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const TodoSchema = new Schema({
    completed: {
        type: Boolean,
        default: false
    },
    text: {
        type: String,
        required: true
    },
    timeStamp: {
        type: String,
        default: Date.now()
    }
})

const Todo = mongoose.model('Todo', TodoSchema)

module.exports = Todo;