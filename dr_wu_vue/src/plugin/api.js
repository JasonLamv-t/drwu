import Vue from 'vue'

const get = Vue.prototype.get;
const post = Vue.prototype.post;
const put = Vue.prototype.put;
const del = Vue.prototype.del;

const apiPath = {
  accPath: '/api/v1/accounts',
  orgPath: '/api/v1/organizations',
  artPath: '/api/v1/articles',
  appoPath: '/api/v1/appointments',
}

const apiAcc = {
  // 登录
  login: (params) => get(`${apiPath.accPath}/login`, params),
  // 注册
  regist: (data) => post(`${apiPath.accPath}/register`, data),
  // 验证码
  code: (params) => get(`${apiPath.accPath}/sms`, params),
  // 刷新token
  refresh: (params) => get(`${apiPath.accPath}/refresh`, params),
  // 查询医生
  query: (path, params) => get(`${apiPath.accPath}/query/${path.keyword}`, params),
  // 获取用户信息
  getInfo: (path) => get(`${apiPath.accPath}/${path.account_id}`),
  // 修改个人信息
  putInfo: (data) => put(`${apiPath.accPath}/info`, data),
  // 修改密码
  putPwd: (data) => put(`${apiPath.accPath}/password`, data),
}

const apiOrg = {
  // 获取用户机构信息
  getOrg: (params) => get(`${apiPath.orgPath}/`, params),
  // 添加用户机构信息
  postOrg: (data) => post(`${apiPath.orgPath}/`, data),
  // 修改用户机构信息
  putOrg: (data) => put(`${apiPath.orgPath}/`, data),
  // 获取同机构医生
  getOrgMem: () => get(`${apiPath.orgPath}/members`),
  // 添加机构成员
  postOrgMem: (params) => post(`${apiPath.orgPath}/members`, null, params),
  // 更改机构成员权限
  putOrgMemRole: (params) => put(`${apiPath.orgPath}/members`, null, params),
  // 移出机构成员
  delOrgMem: (params) => del(`${apiPath.orgPath}/members`, params),
}

const apiArt = {
  // 查询文章列表，不含正文
  getArt: (params) => get(`${apiPath.artPath}/`, params),
  // 发表新文章
  postArt: (data) => post(`${apiPath.artPath}/`, data),
  // 修改文章
  putArt: (path, data) => put(`${apiPath.artPath}/${path.article_id}`, data),
  // 删除文章
  delArt: (path) => del(`${apiPath.artPath}/${path.article_id}`),
  // 根据文章id查询，增加一个阅读量
  getArtDet: (path) => get(`${apiPath.artPath}/${path.article_id}`),
  // 根据文章id刷新文章，不增加阅读量
  refArtDet: (params) => get(`${apiPath.artPath}/refresh`, params),
  // 发表文章评论
  postArtCom: (data, params) => post(`${apiPath.artPath}/comment`, data, params),
  // 点赞/取消点赞文章评论
  putArtCom: (params) => put(`${apiPath.artPath}/comment`, null, params),
  // 删除文章评论
  delArtCom: (params) => del(`${apiPath.artPath}/comment`, params),
  // 回复评论
  postComRep: (data, params) => post(`${apiPath.artPath}/reply`, data, params),
  // 点赞/取消点赞回复
  putComRep: (params) => put(`${apiPath.artPath}/reply`, null, params),
  // 删除回复
  delComRep: (params) => del(`${apiPath.artPath}/reply`, params),

}

const apiAppo = {
  // 获取医生预约列表
  getDoctAppo: (path) => get(`${apiPath.appoPath}/doctor/${path.doctor_id}`),
  // 更改预约状态
  putAppoSta: (path, data) => put(`${apiPath.appoPath}/${path.appoint_id}`, data),
}

const apiMsg = {}

Vue.prototype.apiAcc = apiAcc
Vue.prototype.apiOrg = apiOrg
Vue.prototype.apiMsg = apiMsg
Vue.prototype.apiArt = apiArt
Vue.prototype.apiAppo = apiAppo