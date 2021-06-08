// pages/article/detail.js
const app = getApp()
const gb = app.globalData
const wxp = gb.wxp
const { art } = require('../../config/config')
const api = require('../../config/config')
const time = require('../../utils/time')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    send: {
      type: 'comment',
    },
    focus: '',
    content: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wxp.request({
      url: `${api.art}${options._id}`,
      header: gb.header
    }).then(r => {
      if (r.data.statusCode == 200) this.processArticle(r.data.data)
      else this.setData({ error: '加载错误' })
    }).catch(e => {
      console.error(e)
      this.setData({ error: '网络错误' })
    })
  },

  // 发送
  send: function (e) {
    let header = gb.header
    header['content-type'] = 'application/json'
    let from = {
      name: gb.info.nickname || gb.info.username,
      account_id: gb.info._id,
      avatar: gb.info.avatar
    }
    let content = this.data.content
    let type = this.data.send.type
    wxp.request({
      url: `${api.art}${type}?article_id=${this.data.article._id}${type == 'reply' ? '&&comment_id=' + this.data.send._id : ''}`,
      method: 'POST',
      data: { from, content, to: this.data.send.to },
      header
    }).then(r => {
      if (r.data.statusCode == 200) {
        this.processArticle(r.data.data)
        wx.showToast({ title: `${type == 'comment' ? '评论' : '回复'}成功`, icon: 'success' })
        this.setData({ content: '' })
      }
    }).catch(e => {
      console.error(e)
    })
  },

  // 设置评论或回复
  setSend: function (e) {
    e = e.currentTarget.dataset
    console.log(e)
    if (e.type == 'comment') {
      this.setData({ send: { type: 'comment' } })
      let query = wx.createSelectorQuery()  //创建节点查询器
      query.select('#comment-target').boundingClientRect() //选择id为comment的节点并查询的它布局位置
      query.exec(function (res) {//执行请求
        wx.pageScrollTo({
          scrollTop: res[0].top,//滚动到页面节点的上边界坐标
          duration: 300   // 滚动动画的时长
        })
      })
    } else {
      this.setData({ send: { type: e.type, _id: e.id, to: { name: e.name, account_id: e.account } } })
    }
  },

  // 处理文章
  processArticle: function (article) {
    article.time = time.getYMD(article.updatedAt)
    article.content = article.content.replace(/\<img/gi, '<img class="rich-img"')
    article.CPcount = 0
    article.comment.forEach(com => {
      article.CPcount++
      com.sendTime = time.getMD(com.sendTime) + ' ' + time.getHMS(com.sendTime)
      com.isLike = com.like_account_id_list.includes(gb.info._id)
      com.reply.forEach(rep => {
        article.CPcount++
        rep.show = rep.to.name.includes('@')
      })
    })
    this.setData({
      article,
      isLike: article.like_account_id_list.includes(gb.info._id)
    })
  },

  // 监听输入并保存到content
  typing: function (e) {
    this.setData({ content: e.detail.value })
  },

  // 点赞
  like: function (e) {
    e = e.currentTarget.dataset
    console.log(e)
    if (e.type == 'article') {
      this.setData({ isLike: !this.data.isLike })
      wxp.request({
        url: `${api.art}like/${this.data.article._id}`,
        method: 'PUT',
        header: gb.header
      }).then(r => {
        if (r.data.statusCode == 200) this.processArticle(r.data.data)
      }).catch(e => {
        console.error(e)
        this.setData({ isLike: !this.data.isLike, error: '服务器错误' })
      })
    } else {
      wxp.request({
        url: `${api.art}comment?article_id=${this.data.article._id}&&comment_id=${e.id}`,
        method: 'PUT',
        header: gb.header
      }).then(r => {
        console.log(r)
        if (r.data.statusCode == 200) this.processArticle(r.data.data)
      }).catch(e => {
        console.error(e)
        this.setData({ isLike: !this.data.isLike, error: '服务器错误' })
      })
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