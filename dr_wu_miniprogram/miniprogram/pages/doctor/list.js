// miniprogram/pages/doctor/list.js
const app = getApp()
const gb = app.globalData
const { wxp } = gb
const api = require('../../config/config')

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
    this.setData({ options })
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
    let options = this.data.options
    wx.showLoading({ title: '加载中' })
    wxp.request({
      url: api.acc + 'query/[0-9a-zA-Z]',
      data: { isAssociated: 'true' },
      header: gb.header
    }).then(r => {
      let doctors = r.data.data
      if (options.type && options.type == 'collection') {
        doctors = doctors.filter(dr => dr.info.followers.includes(gb.info._id))
        wx.setNavigationBarTitle({ title: '我的关注' })
      } else {
        wx.setNavigationBarTitle({ title: '全部医生' })
      }
      this.setData({ doctors })
      wx.hideLoading()
    })
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