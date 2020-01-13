import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  // {
  //   path: '*',
  //   redirect: '/login'
  // },
  {
    path: '/login',
    component: () => import('../components/Login')
  },
  {
    path: '/home',
    redirect: '/welcome',
    component: () => import('../components/Home'),
    children:[
      {
        path: '/welcome',
        component: () => import('../components/Welcome')
      },
      {
        path: '/users',
        component: () => import('../components/user/User')
      },
      {
        path: '/rights',
        component: () => import('../components/power/Rights')
      },
      {
        path: '/roles',
        component: () => import('../components/power/Roles')
      },
      {
        path: '/categories',
        component: () => import('../components/goods/Cate')
      },
      {
        path: '/params',
        component: () => import('../components/goods/Params')
      },
    ]
  }
]


const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
})

// 路由守卫，防止没登陆就进入其他页面了
router.beforeEach((to, from, next) => {
  // 隐式转换布尔类型
  let isLogin = !!sessionStorage.token
  if(to.path == '/login'){
    next()
  }else{
    isLogin ? next() : next('/login')
  }
})

export default router
