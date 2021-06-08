const mongoose = require('mongoose')

let validatePhone = phone => {
    let phonePattern = /^((13[0-9])|(14[5|7])|(15([0-3]|[5-9]))|(18[0,5-9]))\d{8}$/
    return phonePattern.test(phone)
}

let validateUsername = username => {
    let usernamePattern = /^[a-zA-Z0-9_-]{6,16}$/
    return usernamePattern.test(username)
}

let validatePassword = password => {
    let passwordPattern = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,20}$/
    return passwordPattern.test(password)
}

let AccountSchema = mongoose.Schema({
    _openid: { type: String, index: true, default: '' },
    username: {
        type: String, require: true, unique: true,
        validate: [validateUsername, '用户名不符合规范'],
    },
    password: {
        type: String, require: true,
        validate: [validatePassword, '密码不符合规范'],
    },
    nickname: { type: String, default: '' },
    realName: { type: String, default: '' },
    phone: {
        type: String, require: true,
        validate: [validatePhone, '输入的手机号不符合规范'],
    },
    sex: { type: String, enum: ['male', 'female'], default: 'male' },
    type: { type: String, enum: ['doctor', 'user'], default: 'user' },
    organization: {
        _id: { type: String, default: '' },
        role: { type: String, enum: ['owner', 'admin', 'member', ''], default: '' },
    },
    avatar: {
        type: String,
        default: 'https://6472-dr-wu-dev-5gqygxzde55c9ac4-1304946955.tcb.qcloud.la/default-avatar.png',
    },
    status: { type: String, default: 'normal' },
    info: {
        brief: { type: String, default: '暂无简介' },
        followers: { type: Array, default: [] },
        consultation_count: { type: Number, default: 0 },
        price: { type: Number, default: 0 },
    },
}, { timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' } })

let Account = mongoose.model('Account', AccountSchema)

module.exports = Account