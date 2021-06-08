// miniprogram/pages/user/user.js
const app = getApp()
const gb = app.globalData
const wxp = gb.wxp
const file = require('../../utils/file')
const api = require('../../config/config')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: ''
  },

  // 设置头像
  setAvatar: async function (e) {
    let r = await wxp.chooseImage({ count: 1 })
    if (r.tempFilePaths.length) {
      let filePath = r.tempFilePaths[0]
      let fileName = `${this.data.info._id}.${file.getExt(filePath)}`

      wxp.cloud.uploadFile({
        cloudPath: `user-avatar/${fileName}`,
        filePath
      }).then(r => {
        if (r && r.statusCode == 204) {
          let header = gb.header
          header['content-type'] = 'application/json'
          return wxp.request({
            url: api.acc + 'info',
            header,
            method: 'PUT',
            data: { avatar: 'https://6472-dr-wu-dev-5gqygxzde55c9ac4-1304946955.tcb.qcloud.la/user-avatar/' + fileName }
          })
        } else return false
      }).then(r => {
        if (r && r.data.statusCode == 200) {
          wx.showToast({ title: '修改成功' })
          gb.info.avatar = filePath
          this.setData({ ['info.avatar']: filePath })
        }
        else this.setData({ error: '修改失败' })
      }).catch(e => {
        this.setData({ error: '修改失败' })
      })
    } else this.setData({ error: '请选择一张图片' })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ info: gb.info })
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