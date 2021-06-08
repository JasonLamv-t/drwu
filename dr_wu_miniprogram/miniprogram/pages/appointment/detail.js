// miniprogram/pages/appointment/detail.js
const app = getApp()
const gb = app.globalData
const { wxp } = gb
const api = require('../../config/config')
const time = require('../../utils/time')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: 'form',
    doctor: '',
    date: '',
    today: '',
    startTime: '08:00',
    endTime: '09:00',
    phone: '',
    comment: '',
    canComment: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.doctor_id) {
      wxp.request({
        url: api.acc + `/${options.doctor_id}`,
        header: gb.header
      }).then(r => {
        let doctor = r.data.data.info
        this.setData({ doctor })
      }).catch(e => {
        console.error(e)
      })
      let today = time.getYMD(new Date())
      this.setData({
        type: 'form',
        today,
        date: today,
        phone: gb.info.phone
      })
    } else {
      let { appointment_id } = options
      wxp.request({
        url: api.app + `/${appointment_id}`,
        header: gb.header
      }).then(r => {
        if (r.data.statusCode == 200) {
          r = r.data.data
          console.log(r)
          this.setData({
            appointment_id,
            type: 'detail',
            doctor: r.doctor,
            phone: r.phone,
            date: time.getYMD(new Date(r.endTime)),
            startTime: time.getHM(new Date(r.startTime)),
            endTime: time.getHM(new Date(r.endTime)),
            status: r.status,
            comment: r.comment,
            canComment: r.comment.stars == -1 && r.status == 'end'
          })
        }
      }).catch(e => {
        console.error(e)
      })
    }
  },

  // 设置星级
  setStar: function (e) {
    console.log(e)
    this.setData({ ['comment.stars']: e.currentTarget.dataset.star })
  },

  // 提交评价
  submitCom: function (e) {
    if (this.data.comment.stars <= 0) {
      this.setData({ error: '请对本次服务进行评分' })
      return
    }

    if (!this.data.comment.text) this.setData({ ['comment.text']: '该用户没有填写评价' })

    let header = gb.header
    header['content-type'] = 'application/json'
    wxp.request({
      url: `${api.app}comments/${this.data.appointment_id}`,
      method: 'POST',
      header,
      data: this.data.comment
    }).then(r => {
      console.log(r)
      if (r.data.statusCode == 200) {
        wx.showToast({ title: '评价成功' })
        let { appointment_id } = this.data
        setTimeout(()=>{
          this.onLoad({ appointment_id })
        }, 1200)
      }
    }).catch(e => {
      console.error(e)
      this.setData({ error: '评价失败，网络错误' })
    })
  },

  // 提交预约
  submitApp: function (e) {
    let start = new Date(`${this.data.date} ${this.data.startTime}`)
    let end = new Date(`${this.data.date} ${this.data.endTime}`)
    if (start - end >= 0) {
      this.setData({ error: '结束时间不能早于等于开始时间' })
      return
    }

    let info = gb.info
    let doctor = this.data.doctor

    wxp.request({
      url: api.app,
      method: 'POSt',
      header: gb.header,
      data: {
        client: {
          name: info.realName || info.nickname || info.username,
          account_id: info._id,
          avatar: info.avatar
        },
        doctor: {
          name: doctor.realName || doctor.nickname || doctor.username,
          account_id: doctor._id,
          avatar: doctor.avatar
        },
        phone: this.data.phone,
        startTime: start,
        endTime: end
      }
    }).then(r => {
      console.log(r)
      if (r.data.statusCode == 200) {
        wx.showToast({ title: '预约成功' })
        setTimeout(() => { wx.navigateBack() }, 1200)
      }
    }).catch(e => {
      console.error(e)
    })
  },

  // 更新输入信息
  typing: function (e) {
    this.setData({ [e.currentTarget.dataset.id]: e.detail.value })
  },

  // 更新选择信息
  pickerChange: function (e) {
    this.setData({ [e.currentTarget.dataset.id]: e.detail.value })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})