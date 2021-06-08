// miniprogram/pages/chat/chatList.js
const app = getApp()
const api = require('../../config/config')
const gb = app.globalData
const { wxp } = gb
const time = require('../../utils/time')

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
    wx.showLoading({ title: '加载中' })

    let getChatList = header => {
      wxp.request({
        url: api.msg,
        header
      }).then(r => {
        if (r.statusCode == 200) {
          let chatList = r.data.data
          chatList.forEach(chat => {
            chat.target = chat.doctor._id == gb.info._id ? 'user' : 'doctor'
            let last = chat.message.length - 1
            chat.preview = chat.message.length ? chat.message[last].type == 'text' ? chat.message[last].content.length > 15 ? chat.message[last].content.slice(0, 15) + '...' : chat.message[last].content : '图片' : ''
            chat.time = time.isToday(chat.updateTime) ? time.getHM(chat.updateTime) : time.getymd(chat.updateTime)
            chat.unRead = chat.message.filter(msg => msg.from == chat.target && !msg.isRead).length
          })
          this.setData({ chatList })
        }
        wx.hideLoading()
      }).catch(e => {
        console.error(e)
        wx.showToast({ title: '加载失败', icon: 'none' })
      })
    }

    if (app.globalData.header) {
      getChatList(gb.header)
    } else {
      app.globalData.headerReadyCallback = header => {
        getChatList(header)
      }
    }
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
    this.onLoad()
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