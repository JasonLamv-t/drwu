// miniprogram/pages/doctor/doctor.js
const api = require('../../config/config')
const gb = getApp().globalData
const { wxp } = gb

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
    wx.setNavigationBarTitle({ title: '咨询师详情' })
    let { _id } = options
    wx.showLoading({ title: '加载中' })
    wxp.request({
      url: api.acc + _id,
      header: gb.header
    }).then(r => {
      if (r.data.statusCode == 200) {
        this.setData({
          doctor: r.data.data.info,
          isFollowed: r.data.data.info.info.followers.includes(gb.info._id)
        })
        return wxp.request({
          url: api.org + this.data.doctor.organization._id,
          header: gb.header
        })
      }
    }).then(r => {
      if (r.data.statusCode == 200) {
        this.setData({ org: r.data.data })
      }
      return wxp.request({
        url: `${api.app}comments/${_id}`,
        header: gb.header
      })
    }).then(r => {
      if (r.statusCode == 200) this.setData({
        comments: r.data.data.filter(com => com.comment.stars >= 0).map(com=>{return com.comment})
      })
      wx.hideLoading()
    }).catch(e => {
      console.error(e)
      wx.hideLoading()
    })
  },

  // 发起咨询
  consult: function () {
    wxp.showActionSheet({ itemList: ['在线咨询', '预约线下咨询'], }).then(async r => {
      if (r.tapIndex) return {
        url: `../appointment/detail?doctor_id=${this.data.doctor._id}`
      }
      else {
        let header = gb.header
        let doctor = this.data.doctor
        console.log(doctor)
        header['content-type'] = 'application/json'
        return wxp.request({
          url: api.msg,
          method: 'POST',
          header,
          data: {
            doctor: {
              _id: doctor._id,
              name: doctor.realName || doctor.nickname || doctor.username,
              avatar: doctor.avatar
            }
          }
        })
      }
    }).then(r => {
      if (r.url) wx.navigateTo({ url: r.url, })
      else if (r.statusCode == 200) wx.navigateTo({
        url: `../chat/chat?chat_id=${r.data.data._id}`,
      })
      else wx.showToast({
        title: '请求失败',
        icon: 'none'
      })
    })
  },

  /**
   * 关注医生
   */
  follow: function () {
    let isFollowed = this.data.isFollowed
    this.setData({ isFollowed: !this.data.isFollowed })
    wxp.request({
      url: `${api.acc}follower?doctor_id=${this.data.doctor._id}`,
      header: gb.header,
      method: 'PUT'
    }).then(r => {
      if (r.data.statusCode != 200) {
        this.setData({
          isFollowed: !this.data.isFollowed,
          error: '服务器错误'
        })
      } else {
        let followers = this.data.doctor.info.followers
        if (isFollowed) followers = followers.filter(i => i != gb.info._id)
        else followers.push(gb.info._id)
        this.setData({ ['doctor.info.followers']: followers })
      }
    }).catch(e => {
      console.error(e)
      this.setData({
        isFollowed: !this.data.isFollowed,
        error: '网络错误'
      })
    })
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