// miniprogram/pages/appointment/appointment.js
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
    appointments: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    let getAppointment = async header => {
      wxp.request({
        url: api.app,
        header
      }).then(r => {
        // console.log(r)
        let appointments = r.data.data
        appointments.forEach(app => {
          app.date = time.getYMD(new Date(app.endTime))
          app.statu = app.status == 'confirming' ? '确认中' : app.status == 'refused' ? '已拒绝' : app.status == 'confirmed' ? '已确认' : '已结束'
        })
        this.setData({ appointments })
      }).catch(e => {
        console.error(e)
        wx.showToast({ title: '加载失败', icon: 'none' })
      })
    }
    getAppointment(gb.header)
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