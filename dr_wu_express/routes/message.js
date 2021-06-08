const express = require('express')
const router = express.Router()
const Conversation = require('../model/conversation')
const Account = require('../model/account')
const { msg } = require('../config/response')

/**
 * 创建新会话
 */
router.post('/', async (req, res) => {
    let user = (({ _id, avatar }) => ({ _id, avatar }))(req.data)
    user.name = (req.data.nickname, req.data.realName)
    let { doctor, message } = req.body

    let conversation = await Conversation.findOne({
        'doctor._id': doctor._id, 'user._id': user._id,
    })

    if (conversation) {
        if (message) {
            conversation.message.push(message)
            conversation.save((e, r) => {
                if (e) {
                    console.error(e)
                    res.send(msg('发送失败', 500, null, e))
                } else res.send(msg('发送成功', 200, r))
            })
        } else {
            res.send(msg('对话已存在', 200, conversation))
        }
    } else {
        conversation = message ? new Conversation({
            user, doctor,
            message: [message],
        }) : new Conversation({
            user, doctor,
        })

        Account.findByIdAndUpdate(doctor._id, {
            $inc: { ['info.consultation_count']: 1 },
        }).then(r => {
            conversation.save((e, r) => {
                if (e) {
                    console.error(e)
                    res.send(msg('发送失败', 500, null, e))
                } else res.send(msg('发送成功', 200, r))
            })
        })
    }
})

/**
 * 查询用户的所有会话
 */
router.get('/', async (req, res) => {
    let { _id } = req.data
    Conversation.find({
        $or: [
            { 'doctor._id': { $eq: _id } },
            { 'user._id': { $eq: _id } },
        ],
    }).then(r => {
        res.send(msg('查询成功', 200, r))
    }).catch(e => {
        console.error(e)
        res.send(msg('服务器错误', 500, null, e))
    })
})

/**
 * 查询指定会话的全部消息
 */
router.get('/:conversation_id', async (req, res) => {
    let { _id } = req.data
    let { conversation_id } = req.params
    let conversation = await Conversation.findById(conversation_id)
    let me = conversation.user._id === _id ? 'user' : 'doctor'
    conversation.message.forEach(msg => {
        if (msg.from !== me) msg.isRead = true
    })

    conversation.save().then(r => {
        res.send(msg('查询成功', 200, r))
    }).catch(e => {
        console.error(e)
        res.send(msg('服务器错误', 500, null, e))
    })
})

/**
 * 向指定会话发送消息
 */
router.post('/:conversation_id', async (req, res) => {
    let { conversation_id } = req.params
    let message = req.body

    Conversation.findByIdAndUpdate(conversation_id, {
        $push: { message: message },
    }, { new: true }).then(r => {
        res.send(msg('发送成功', 200, r))
    }).catch(e => {
        console.error(e)
        res.send(msg('发送失败', 500, null, e))
    })
})

module.exports = router