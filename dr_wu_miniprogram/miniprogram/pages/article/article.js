// pages/article/article.js
const app = getApp()
const gb = app.globalData
const wxp = gb.wxp
const api = require('../../config/config')
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
    wx.setna
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
    let getArticles = async header => {
      wxp.request({
        url: api.art,
        data: { keyword: '^(.*)$' },
        header
      }).then(r => {
        let articles = r.data.data
        articles.forEach(art => {
          art.time = time.getYMD(art.updatedAt)
        })
        this.setData({ articles })
      })
    }
    getArticles(gb.header)
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