const time = require("../../utils/time")

// miniprogram/pages/login/login.js
const app = getApp()
const wxp = app.globalData.wxp
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: '',
    password: '',
    repassword: '',
    phone: '',
    isRegister: false,

    error: ''
  },

  // 注册
  register: function () {
    let data = this.data
    if (!!!data.username) this.setData({ error: '用户名不能为空' })
    if (!!!data.password) this.setData({ error: '密码不能为空' })
    if (data.password != data.repassword) this.setData({ error: '两次输入的密码不一致' })
    if (!!!data.phone) this.setData({ error: '手机号不能为空' })

    wxp.cloud.callFunction({
      name: 'getOpenid'
    }).then(r => {
      let header = {}
      header['content-type'] = 'application/json'
      return wxp.request({
        url: 'https://drwu.top/api/v1/accounts/register',
        method: 'POST',
        data: {
          username: data.username,
          password: data.password,
          phone: data.phone,
          _openid: r.result,
        }
      })
    }).then(r => {
      r = r.data
      console.log(r)
      if (r.statusCode == 200) {
        app.globalData.info = r.data.info
        app.globalData.header = { 'authorization': r.data.token }
        wx.showToast({ title: '注册成功,正在跳转' })
        setTimeout(() => {
          wx.switchTab({ url: '../index/index' })
        }, 1000)
      } else if (r.statusCode == 400) this.setData({ error: '用户名已被注册' })
      else if (r.statusCode == 500) {
        let e = r.error.errors
        let error = ''
        Object.keys(e).forEach(key => {
          error += e[key].message + '，'
        })
        this.setData({ error: error.slice(0, -1) })
      }
      else this.setData({ error: '未知错误' })
    }).catch(e => {
      console.error(e)
      this.setData({ error: '请求错误' })
    })
  },

  // 登陆
  login: function () {
    wxp.cloud.callFunction({
      name: 'getOpenid'
    }).then(r => {
      return wxp.request({
        url: 'https://drwu.top/api/v1/accounts/login',
        data: {
          username: this.data.username,
          password: this.data.password,
          _openid: r.result
        }
      })
    }).then(r => {
      r = r.data
      console.log(r)
      if (r.statusCode == 200) {
        app.globalData.info = r.data.info
        app.globalData.header = { 'authorization': r.data.token }
        wx.switchTab({ url: '../index/index' })
      } else if (r.statusCode == 400) this.setData({ error: '用户名或密码错误' })
      else if (r.statusCode == 500) this.setData({ error: '服务器错误' })
      else this.setData({ error: '未知错误' })
    }).catch(e => {
      console.error(e)
      this.setData({ error: '请求错误' })
    })
  },

  // 切换表单
  setRegister: function (e) {
    this.setData({
      isRegister: !this.data.isRegister
    })
  },

  // 监听输入并更新数据
  typing: function (e) {
    // console.log(e)
    this.setData({ [e.target.dataset.id]: e.detail.value })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideHomeButton({})
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