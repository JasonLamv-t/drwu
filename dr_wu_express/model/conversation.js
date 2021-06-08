const mongoose = require('mongoose')

let ConversationSchema = mongoose.Schema({
    doctor: {
        _id: { type: String, require: true, index: true },
        name: String,
        avatar: String,
    },
    user: {
        _id: { type: String, require: true, index: true },
        name: String,
        avatar: String,
    },
    message: [{
        _id: false,
        type: { type: String, enum: ['image', 'text'] },
        from: { type: String, enum: ['doctor', 'user'] },
        content: String,
        isRead: { type: Boolean, default: false },
        sendTime: { type: Date, default: Date.now },
    }],
}, { timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' } })

let Conversation = mongoose.model('Conversation', ConversationSchema)
module.exports = Conversation