const express = require('express')
const router = express.Router()
const Appointment = require('../model/appointment')
const { msg } = require('../config/response')
const jwt = require('../utils/jwt')

/**
 * 创建预约
 */
router.post('/', async (req, res) => {
  let appointment = req.body
  appointment = new Appointment(appointment)

  appointment.save().then(r => {
    res.send(msg('预约成功', 200, r))
  }).catch(e => {
    console.error(e)
    res.send(msg('预约失败', 500, null, e))
  })
})

/**
 * 获取对应预约的信息
 */
router.get('/:appointment_id', async (req, res) => {
  let { appointment_id } = req.params
  let appointment = Appointment.findById(appointment_id).then(r => {
    res.send(msg('查询成功', 200, r))
  }).catch(e => {
    console.error(e)
    res.send(msg('查询失败', 500, null, e))
  })
})

/**
 * 获取对应用户的预约信息
 */
router.get('/', async (req, res) => {
  let { _id } = req.data
  console.log(_id)
  Appointment.find({ 'client.account_id': _id }).then(r => {
    res.send(msg('查询成功', 200, r))
  }).catch(e => {
    console.error(e)
    res.send(msg('查询失败', 500, null, e))
  })
})

/**
 * 修改预约状态
 */
router.put('/:appointment_id', async (req, res) => {
  let { status } = req.body
  let { appointment_id } = req.params
  console.log(appointment_id)
  Appointment.findByIdAndUpdate(appointment_id, {
    status: status
  }, { new: true }).then(r => {
    res.send(msg('修改成功', 200, r))
  }).catch(e => {
    console.error(e)
    res.send(msg('修改失败', 500, null, e))
  })
})

/**
 * 获取对应医生的预约信息
 */
router.get('/doctor/:doctor_id', async (req, res) => {
  let { doctor_id } = req.params
  Appointment.find({ 'doctor.account_id': doctor_id }).then(r => {
    res.send(msg('查询成功', 200, r))
  }).catch(e => {
    console.error(e)
    res.send(msg('查询失败', 500, null, e))
  })
})

/**
 * 获取对应医生的全部评价
 */
router.get('/comments/:doctor_id', async (req, res) => {
  let { doctor_id } = req.params
  Appointment.find({ 'doctor.account_id': doctor_id }, { comment: true }).then(r => {
    res.send(msg('查询成功', 200, r))
  }).catch(e => {
    console.error(e)
    res.send(msg('查询失败', 500, null, e))
  })
})

/**
 *  对预约进行评价
 */
router.post('/comments/:appointment_id', async (req, res) => {
  let { appointment_id } = req.params
  let comment = req.body
  Appointment.findByIdAndUpdate(appointment_id, {
    comment
  }, { new: true }).then(r => {
    res.send(msg('评论成功', 200, r))
  }).catch(e => {
    console.error(e)
    res.send(msg('评论失败', 500, null, e))
  })
})
module.exports = router