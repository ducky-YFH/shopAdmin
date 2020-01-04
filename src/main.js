import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'
import './assets/global.css'
import 'element-ui/lib/theme-chalk/index.css';
import './plugins/element.js'

Vue.config.productionTip = false
// ----------------专门配置axios----------------
import axios from 'axios'
// 配置api地址
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 路由拦截
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$axios = axios
// -------------------------------------------

// ------------使用第三方table-tree------------
import tableTree from 'vue-table-with-tree-grid';
Vue.use(tableTree)
Vue.component('table-tree',tableTree)
// -------------------------------------------

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
