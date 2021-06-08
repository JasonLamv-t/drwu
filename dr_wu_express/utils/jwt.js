const jwt = require('jsonwebtoken')
const { tokenSecret, expTime } = require('../config/config')
const Token = {
    encrypt: function (data, time = expTime) { //data加密数据，time过期时间
        return jwt.sign(data.toJSON(), tokenSecret, { algorithm: 'HS256', expiresIn: time })
    },
    decrypt: function (token) {
        try {
            let data = jwt.verify(token, tokenSecret, { algorithm: 'HS256' })
            return {
                e: null, data,
            }
        } catch (e) {
            return {
                e, data: null,
            }
        }
    },
}
module.exports = Token