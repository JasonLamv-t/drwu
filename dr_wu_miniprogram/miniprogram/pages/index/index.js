// miniprogram/pages/index/index.js
const app = getApp()
const { wxp } = app.globalData
const api = require('../../config/config')
const time = require('../../utils/time')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    swipers: [
      'cloud://dr-wu-dev-5gqygxzde55c9ac4.6472-dr-wu-dev-5gqygxzde55c9ac4-1304946955/index-top/18021619168466_.pic_hd.jpg',
      'cloud://dr-wu-dev-5gqygxzde55c9ac4.6472-dr-wu-dev-5gqygxzde55c9ac4-1304946955/index-top/18011619168461_.pic_hd.jpg'
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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

    let getDoctors = async header => {
      wxp.request({
        url: api.acc + 'query/[0-9a-zA-Z]',
        data: { isAssociated: 'true' },
        header
      }).then(r => {
        this.setData({ doctors: r.data.data })
      })
    }

    if (app.globalData.header) {
      getArticles(app.globalData.header)
      getDoctors(app.globalData.header)
    } else {
      app.globalData.headerReadyCallback = header => {
        getArticles(header)
        getDoctors(header)
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