//app.js
// promisify all wx's api
import { promisifyAll, promisify } from 'miniprogram-api-promise'
import { app } from './config/config'
const wxp = {}
promisifyAll(wx, wxp)

App({
  onLaunch: async function () {
    let login = async _openid => {
      await wxp.request({
        url: 'https://drwu.top/api/v1/accounts/login',
        data: { _openid }
      }).then(r => {
        if (r.data.statusCode != 200) wx.redirectTo({
          url: '../login/login',
        })
        else {
          r = r.data
          r.data.info.avatar = r.data.info.avatar.replace('https://6472-dr-wu-dev-5gqygxzde55c9ac4-1304946955.tcb.qcloud.la', 'cloud://dr-wu-dev-5gqygxzde55c9ac4.6472-dr-wu-dev-5gqygxzde55c9ac4-1304946955')
          this.globalData.info = r.data.info
          this.globalData.header = { 'authorization': r.data.token }
          if (this.globalData.headerReadyCallback) {
            this.globalData.headerReadyCallback({ 'authorization': r.data.token })
          }
        }
      })
    }

    this.globalData = {
      wxp,
      _openid,
      login
    }

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }

    let _openid = (await wx.cloud.callFunction({ name: 'getOpenid' })).result
    this.globalData._openid = _openid
    login(_openid)
  }
})
