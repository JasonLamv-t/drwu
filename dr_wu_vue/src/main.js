import Vue from 'vue'
import App from './App.vue'
import router from './plugin/router'
import store from './plugin/store'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './plugin/axios'
import './plugin/api'

Vue.config.productionTip = false

Vue.use(ElementUI);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
