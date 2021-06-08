const mongoose = require('mongoose')

let ReplySchema = mongoose.Schema({
    from: {
        name: String,
        account_id: String,
        avatar: String,
    },
    to: {
        name: String,
        account_id: String,
    },
    content: String,
    like_account_id_list: { type: Array, default: [] },
    sendTime: { type: Date, default: Date.now },
})

let CommentSchema = mongoose.Schema({
    from: {
        name: String,
        account_id: String,
        avatar: String,
    },
    content: String,
    like_account_id_list: { type: Array, default: [] },
    sendTime: { type: Date, default: Date.now },
    reply: [ReplySchema],
})

let ArticleSchema = mongoose.Schema({
    author_id: { type: String, require: true },
    author_name: { type: String, require: true },
    title: { type: String, require: true },
    tag: { type: Array, default: [] },
    content: { type: String, default: '' },
    cover: { type: String, default: '' },
    status: { type: String, enum: ['audit', 'release', 'banned'], default: 'release' },
    comment: [CommentSchema],
    readCount: { type: Number, default: 0 },
    like_account_id_list: { type: Array, default: [] },
}, { timestamps: true })

let Reply = mongoose.model('Reply', ReplySchema)
let Comment = mongoose.model('Comment', CommentSchema)
let Article = mongoose.model('Article', ArticleSchema)
module.exports = {
    Article, Comment, Reply,
}