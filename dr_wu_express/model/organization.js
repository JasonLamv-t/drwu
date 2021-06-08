const mongoose = require('mongoose')

let validatePhone = phone => {
    let phonePattern = /^((13[0-9])|(14[5|7])|(15([0-3]|[5-9]))|(18[0,5-9]))\d{8}$/
    return phonePattern.test(phone)
}

let OrganizationShcema = mongoose.Schema({
    name: { type: String, require: true, unique: true },
    introduce: { type: String, default: '' },
    phone: {
        type: String, require: true,
        validate: [validatePhone, '输入的手机号不符合规范'],
    },
    address: { type: String, require: true },
    image_list: { type: Array, default: [] },
    serviceTime: {
        start: String,
        end: String,
    },
    associated_account_list: [{
        _id: false,
        account_id: String,
        role: { type: String, enum: ['owner', 'admin', 'member', ''], default: '' },
    }],
}, { timestamps: { createdAt: 'createTime', updatedAt: 'updateTime' } })

let Organization = mongoose.model('Organization', OrganizationShcema)

module.exports = Organization