const express = require('express')
const router = express.Router()
const Core = require('@alicloud/pop-core')
const Account = require('../model/account')
const { msg } = require('../config/response')
const jwt = require('../utils/jwt')

/**
 * 发送验证码并返回
 */
router.get('/sms', async (req, res) => {
    let { phone } = req.query
    let code = ''
    for (let i = 0; i < 6; i++) {
        code += Math.floor(Math.random() * 10)
    }
    let client = new Core({
        accessKeyId: 'LTAI4GE8Qo9hUR9BFFTQiB2y',
        accessKeySecret: 'gCdfA2yEsF4EPeeD74WX3czCRR18wY',
        endpoint: 'https://dysmsapi.aliyuncs.com',
        apiVersion: '2017-05-25',
    })
    let params = {
        'PhoneNumbers': phone,
        'SignName': 'DrWu',
        'TemplateCode': 'SMS_211495627',
        'TemplateParam': JSON.stringify({ code }),
    }
    let requestOption = {
        method: 'POST',
    }
    client.request('SendSms', params, requestOption).then((result) => {
        res.send(msg('发送成功', 200, { code, result }))
    }, (ex) => {
        res.send(msg('发送失败', 500, null, ex))
    })
})

/**
 * 注册用户并返回用户信息和token
 */
router.post('/register', async (req, res) => {
    let newAccount = new Account(req.body)
    newAccount.save((e, account) => {
        if (e && e.code === 11000) res.send(msg('该用户名已被注册', 400, null, e))
        else if (e) res.send(msg('注册失败', 500, null, e))
        else {
            account.password = null
            let token = jwt.encrypt(account)
            res.send(msg('注册成功', 200, { info: account, token }))
        }
    })
})

/**
 * 登陆并获取用户信息和token
 */
router.get('/login', async (req, res) => {
    let { username, password, _openid } = req.query
    // openid 直接登陆
    if (_openid && !username) {
        let r = await Account.findOne({ _openid }, { password: 0 })
        if (r) {
            let token = jwt.encrypt(r)
            res.send(msg('登陆成功', 200, { info: r, token }))
        } else res.send(msg('登陆失败', 400, null, r))
    } else {
        let r1 = await Account.findOne({ username, password }, { password: 0 })
        let r2 = await Account.findOne({ phone: username, password }, { password: 0 })
        let r = (r1 || r2)
        // 有openid 则校验更新
        if (r && r._openid === '' && _openid) {
            r._openid = _openid
            r.save((e, account) => {
                if (e) {
                    res.send(msg('登陆失败', 500, null, e))
                } else {
                    account.password = null
                    let token = jwt.encrypt(account)
                    res.send(msg('登陆成功', 200, { info: account, token }))
                }
            })
        } else if (r) {
            let token = jwt.encrypt(r)
            res.send(msg('登陆成功', 200, { info: r, token }))
        } else res.send(msg('登陆失败', 400, null, r))
    }
})

/**
 * 获取用户信息并刷新token
 */
router.get('/refresh', async (req, res) => {
    let { _id } = req.data
    Account.findById({ _id }, { password: 0 }).then(r => {
        let token = jwt.encrypt(r)
        res.send(msg('刷新成功', 200, { info: r, token }))
    })
})

/**
 * 获取指定用户的信息
 */
router.get('/:account_id', async (req, res) => {
    let { account_id } = req.params
    Account.findById(account_id, { password: 0 }).then(r => {
        res.send(msg('查询成功', 200, { info: r }))
    }).catch(e => {
        res.send(msg('查询失败', 500, null, e))
    })
})

/**
 * 修改自己的用户信息
 */
router.put('/info', async (req, res) => {
    let { _id } = req.data
    let updateData = req.body
    Account.findByIdAndUpdate(_id, updateData, { new: true }).then(r => {
        r.password = null
        let token = jwt.encrypt(r)
        res.send(msg('修改成功', 200, { info: r, token }))
    }).catch(e => {
        console.error(e)
        res.send(msg('服务器出错，修改失败', 500, null, e))
    })
})

/**
 * 修改密码
 */
router.put('/password', async (req, res) => {
    let { _id } = req.data
    let { oldPassword, newPassword } = req.query
    if (oldPassword === newPassword) res.send(msg('新密码与原密码一致！', 400))
    else {
        Account.findById(_id).then(theAccount => {
            theAccount.password = newPassword
            return theAccount.save()
        }).then(r => {
            res.send(msg('修改成功', 200, r))
        }).catch(e => {
            res.send(msg('修改失败', 400, null, e))
        })
    }
})

/**
 * 收藏/取消收藏医生
 */
router.put('/follower', async (req, res) => {
    let { doctor_id } = req.query
    let { _id } = req.data
    let doctor = await Account.findById(doctor_id)
    let followers = doctor.info.followers

    let type = followers.includes(_id)
    if (type) followers.pull(_id)
    else followers.push(_id)
    doctor.save().then(r => {
        res.send(msg(`${type ? '取消' : '收藏'}成功`, 200, r))
    }).catch(e => {
        console.error(e)
        res.send(msg(`${type ? '取消' : '收藏'}失败`, 500, null, e))
    })
})

/**
 * 根据条件和关键词查询医生
 */
router.get('/query/:keyword', async (req, res) => {
    let { keyword } = req.params
    let { isAssociated } = req.query

    keyword = { $regex: keyword }
    isAssociated = isAssociated === 'true' ? true : isAssociated === 'false' ? false : undefined

    if (isAssociated === undefined) {
        Account.find({
            $or: [{ username: keyword }, { realName: keyword }, { nickName: keyword }, { phone: keyword }],
            type: 'doctor',
        }, { password: 0 }).then(r => {
            res.send(msg('查询成功', 200, r))
        }).catch(e => {
            console.error(e)
            res.send(msg('查询失败，服务器错误', 500, null, e))
        })
    } else if (isAssociated) {
        Account.find({
            $or: [{ username: keyword }, { realName: keyword }, { nickName: keyword }, { phone: keyword }],
            'organization._id': { $ne: '' },
            type: 'doctor',
        }, { password: 0 }).then(r => {
            res.send(msg('查询成功', 200, r))
        }).catch(e => {
            console.error(e)
            res.send(msg('查询失败，服务器错误', 500, null, e))
        })
    } else {
        Account.find({
            $or: [{ username: keyword }, { realName: keyword }, { nickName: keyword }, { phone: keyword }],
            'organization._id': { $eq: '' },
            type: 'doctor',
        }, { password: 0 }).then(r => {
            res.send(msg('查询成功', 200, r))
        }).catch(e => {
            console.error(e)
            res.send(msg('查询失败，服务器错误', 500, null, e))
        })
    }
})

module.exports = router