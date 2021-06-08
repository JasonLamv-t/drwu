import Vue from 'vue'
import axios from 'axios'
import jwt from 'jsonwebtoken';


const tokenU = {
  isInvalid: false,
  onRefresh: false,
  without: [
    '/api/v1/accounts/login',
    '/api/v1/accounts/register',
    '/api/v1/accounts/sms',
  ],
  refresh() {
    tokenU.onRefresh = true;
    setTimeout(() => {
      tokenU.onRefresh = false;
    }, 5000)
    Vue.prototype.apiAcc.refresh().then(res => {
      if (res.data) {
        localStorage.setItem('token', res.data.token);
      }
    })
  },
  goLogin() {
    setTimeout(() => {
      tokenU.isInvalid = false;
    }, 5000)
    alert('当前登录已失效，点击确定前往登录');
    window.location.hash = '#/';
  }
}

//添加请求拦截器
axios.interceptors.request.use(
  config => {
    // 获取token
    let token = localStorage.getItem('token');
    if (!token) {
      if (!tokenU.without.includes(config.url)) {
        if (!tokenU.isInvalid) tokenU.goLogin();
      }
      return config;
    }

    // token即将过期且未刷新时，刷新token
    const exp = jwt.decode(token).exp;
    const diff = exp * 1000 - Date.now();
    if (diff < 20 * 60 * 1000 && diff > 0) {
      if (config.url != '/api/v1/accounts/refresh') {
        if (!tokenU.onRefresh) tokenU.refresh();
      }
    }
    // token已过期时，前往登录
    if (diff <= 0) {
      if (!tokenU.without.includes(config.url)) {
        if (!tokenU.isInvalid) tokenU.goLogin();
      }
    }
    // 携带token
    config.headers['authorization'] = token;
    return config;
  },
  error => {
    return Promise.reject(error);
  });

//添加响应拦截器
axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.info(error.response)
    return Promise.reject(error) // 返回接口的错误信息
  });

const api = {
  get(url, params) {
    return new Promise((resolve) => {
      axios.get(url, {
        params: params
      }).then(res => {
        resolve(res.data)
      })
    })
  },
  post(url, data, params) {
    return new Promise((resolve) => {
      axios.post(url, data, {
        params: params
      }).then(res => {
        resolve(res.data)
      })
    })
  },
  put(url, data, params) {
    return new Promise((resolve) => {
      axios.put(url, data, {
        params: params
      }).then(res => {
        resolve(res.data)
      })
    })
  },
  del(url, params) {
    return new Promise((resolve) => {
      axios.delete(url, {
        params: params
      }).then(res => {
        resolve(res.data)
      })
    })
  }
}

Vue.prototype.axios = axios
Vue.prototype.get = api.get
Vue.prototype.post = api.post
Vue.prototype.put = api.put
Vue.prototype.del = api.del

export default api