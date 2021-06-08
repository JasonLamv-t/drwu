// pages/user/info.js
const app = getApp()
const gb = app.globalData
const wxp = gb.wxp
const api = require('../../config/config')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAlter: false,
    nickname: '',
    realName: '',
    sex: '',
    phone: ''
  },

  saveAlter: function (e) {
    let header = gb.header
    let { nickname, realName, sex, phone } = this.data
    header['content-type'] = 'application/json'
    wxp.request({
      url: api.acc + 'info',
      header,
      method: 'PUT',
      data: {
        nickname, realName, sex, phone
      }
    }).then(r => {
      if (r.data.statusCode) {
        gb.header.authorization = r.data.data.token
        gb.info = r.data.data.info
        wx.showToast({ title: '修改成功' })
        setTimeout(() => {
          wx.navigateBack()
        }, 1000)
      } else this.setData({ error: '修改失败' })
    }).catch(e => {
      console.error(e)
      this.setData({ error: '修改失败' })
    })
  },

  setAlter: function (e) {
    if (this.data.isAlter) wx.navigateBack()
    this.setData({ isAlter: !this.data.isAlter })
  },

  pickerChange: function (e) {
    this.setData({ sex: parseInt(e.detail.value) ? 'female' : 'male' })
  },

  typing: function (e) {
    this.setData({ [e.currentTarget.dataset.id]: e.detail.value })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(gb.info)
    let { nickname, realName, sex, phone } = gb.info
    this.setData({ nickname, realName, sex, phone })
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