import Vue from 'vue'
import VueRouter from 'vue-router'

const base = {
  Foot: () => import('../views/base/Foot'),
  Login: () => import('../views/base/Login'),
  Regist: () => import('../views/base/Regist'),
}

const work = {
  Work: () => import('../views/work/Work'),
  Organ: () => import('../views/work/Organ'),
  Manage: () => import('../views/work/Manage'),
  Appoint: () => import('../views/work/Appoint'),
  Online: () => import('../views/work/Online'),
  Commun: () => import('../views/work/Commun'),
}

const other = {
  Article: () => import('../views/other/Article'),
}

Vue.use(VueRouter)

const routes = [
  // 登录
  {
    path: '/',
    components: {
      main: base.Login,
      foot: base.Foot
    }
  },
  // 注册
  {
    path: '/regist',
    components: {
      main: base.Regist,
      foot: base.Foot
    }
  },
  // 控制台
  {
    path: '/console',
    components: {
      main: work.Work,
    },
    children: [
      // 机构信息
      {
        path: '/organ',
        component: work.Organ
      },
      // 医生管理
      {
        path: '/manage',
        component: work.Manage
      },
      // 预约管理
      {
        path: '/appoint',
        component: work.Appoint
      },
      // 在线答复
      {
        path: '/online',
        component: work.Online
      },
      // 社区管理
      {
        path: '/commun',
        component: work.Commun
      },
    ]
  },
  // 文章
  {
    path: '/article/:article_id?',
    props: {
      main: true,
    },
    components: {
      main: other.Article,
    }
  },
]

const router = new VueRouter({
  routes
})

export default router