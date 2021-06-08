// miniprogram/pages/chat/chat.js
const app = getApp()
const api = require('../../config/config')
const gb = app.globalData
const { wxp } = gb
const time = require('../../utils/time')
const file = require('../../utils/file')
const shortid = require('js-shortid')

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // dev set
    this.data.chat_id = options.chat_id

    wxp.getSystemInfo().then(r => {
      console.log(r)
      let { height } = r.safeArea
      this.setData({ height: height - r.statusBarHeight - 52 + 'px' })
    })

    wx.showLoading({ title: '加载中' })

    wxp.request({
      url: api.msg + options.chat_id,
      header: gb.header
    }).then(r => {
      if (r.statusCode == 200) {
        r = r.data.data
        this.processMsg(r.message)
        let me = gb.info._id == r.doctor._id ? 'doctor' : 'user'
        let target = gb.info._id == r.doctor._id ? 'user' : 'doctor'
        let { doctor, user } = r
        this.setData({ me, target, info: { doctor, user } })
        wx.setNavigationBarTitle({ title: `${this.data.info[target].name}${me == 'user' ? '咨询师' : ''}` })
      }
      wx.hideLoading()
    }).catch(e => {
      console.error(e)
      this.setData({ error: '获取消息失败' })
    })

    // 轮询定时刷新消息
    this.data.refresh = setInterval(() => {
      wxp.request({
        url: api.msg + this.data.chat_id,
        header: gb.header
      }).then(r => {
        if (r.statusCode == 200) this.processMsg(r.data.data.message)
      }).catch(e => {
        console.error(e)
        this.setData({ error: '网络错误' })
      })
    }, 2500)
  },

  // 处理信息
  processMsg: function (message) {
    if (!this.data.message || message.length != this.data.message.length) {
      let images = message.filter(msg => msg.type == 'image').map(msg => msg.content)
      this.setData({ message, images, new: `msg-${message.length - 1}` })
    }
  },

  // 发送图片
  chooseImage: function (e) {
    wxp.chooseImage().then(r => {
      wx.showLoading({ title: '发送中' })
      let imgList = r.tempFilePaths
      return imgList.map(img => {
        return wxp.cloud.uploadFile({
          cloudPath: `chat-img/${this.data.chat_id}/${shortid.gen()}.${file.getExt(img)}`,
          filePath: img
        })
      })
    }).then(r => {
      let header = gb.header
      header['content-type'] = 'application/json'
      Promise.all(r).then(r => {
        let imgList = r.map(i => i.fileID.replace('cloud://dr-wu-dev-5gqygxzde55c9ac4.6472-dr-wu-dev-5gqygxzde55c9ac4-1304946955', 'https://6472-dr-wu-dev-5gqygxzde55c9ac4-1304946955.tcb.qcloud.la'))
        return Promise.all(imgList.map(img => {
          return wxp.request({
            url: api.msg + this.data.chat_id,
            method: 'POST',
            header,
            data: {
              type: 'image',
              from: this.data.me,
              content: img
            }
          })
        }))
      }).then(r => {
        r = r[r.length - 1]
        if (r.statusCode == 200) this.processMsg(r.data.data.message)
        wx.hideLoading()
      })
    })
  },

  // 预览图片
  preview: function (e) {
    let { src } = e.target.dataset
    wx.previewMedia({
      sources: this.data.images.map(img => { return { url: img } }),
      current: this.data.images.indexOf(src)
    })
  },

  // 发送文字消息
  sendMsg: function (e) {
    let header = gb.header
    header['content-type'] = 'application/json'
    wxp.request({
      url: api.msg + this.data.chat_id,
      header: header,
      method: 'POST',
      data: {
        type: 'text',
        from: this.data.me,
        content: this.data.content
      }
    }).then(r => {
      if (r.statusCode == 200) this.processMsg(r.data.data.message)
      this.setData({ content: '' })
    }).catch(e => {
      console.error(e)
    })
  },

  // 监听输入并保存到content
  typing: function (e) {
    this.setData({ content: e.detail.value })
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
    clearInterval(this.data.refresh)
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