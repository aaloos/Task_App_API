const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    title:{
        type: String,
        required: true,
        trim: true,
    },
    completed:{
        type: Boolean,
        default: false
    },
    description:{
        type: String,
        required: true,
        trim: true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId
    }
},{
    timestamps: true,
});



const task = mongoose.model('task', taskSchema);

module.exports = task;