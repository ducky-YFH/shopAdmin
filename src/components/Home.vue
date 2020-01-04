<template>
  <!-- 大容器 -->
  <el-container class="wrapper">
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="../assets/logo.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button @click="handleQuit">退出</el-button>
    </el-header>
    <!-- 主体 -->
    <el-container class="container">
      <!-- 侧边 -->
      <el-aside :width="collapse ? '60px' : '200px'" class="aside">
        <div class="iconfont icon-Menu" @click="collapse = !collapse"></div>
        <el-menu
          :default-active="asideActive"
          class="el-menu-vertical-demo"
          background-color="#282c34"
          text-color="#fff"
          active-text-color="#3b99fe"
          unique-opened
          :collapse="collapse"
          :collapse-transition="false"
          router
          @select="handleActive"
        >
          <el-submenu :index="index + ''" v-for="(item,index) in menuList" :key="item.id">
            <template slot="title">
              <i :class="icons[index]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item-group v-for="item2 in item.children" :key="item2.id">
              <el-menu-item :index="item2.path">{{item2.authName}}</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主要 -->
      <el-main class="main">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'home',
  data(){
    return {
      menuList: [],
      icons: [
        'iconfont icon-yonghu',
        'iconfont icon-quanxianguanli',
        'iconfont icon-shangpin',
        'iconfont icon-dingdanguanli',
        'iconfont icon-shuju'
      ],
      // 侧边栏是否折叠
      collapse: false,
      // 侧边高亮的路径
      asideActive: ''
    }
  },
  methods:{
    // 退出登录
    handleQuit(){
      sessionStorage.clear()
      this.$message({
        message: '退出成功!',
        type: 'success' 
      })
      this.$router.push('/login')
    },
    // 获取菜单栏数据
    async getMenuList(){
      const res = await this.$axios.get('menus')
      const { data } = res.data
      this.menuList = data
    },
    // 解决侧边高亮的问题
    handleActive(routerPath){
      // 更新当前的
      this.asideActive = routerPath
      // 将获取到的路由地址存到sessionStorage
      sessionStorage.setItem('routerPath', routerPath)
    },
    // 凡是已进入或者刷新就获取sessionStorage的路由地址
    getActiveRouter(){
      let routerPath = window.sessionStorage.getItem("routerPath")
      this.asideActive = routerPath
    }
  },
  created(){
    this.getMenuList()
    this.getActiveRouter()
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  height: 100%;
  .el-header {
    color: #fff;
    display: flex;
    justify-content: space-between;
    background: #282c34;
    align-items: center;
    > div {
      display: flex;
      align-items: center;
      img {
        border-radius: 50%;
        width: 50px;
        height: 50px;
      }
      span {
        margin-left: 20px;
        font-size: 25px;
      }
    }
    .el-button {
    }
  }

  .container {
    .el-aside {
      background: #282c34;
      -moz-user-select: none;
      -khtml-user-select: none;
      user-select: none;
      .icon-Menu {
        color: #fff;
        padding: 20px;
        cursor: pointer;
      }
      .icon-Menu:hover {
        background: #21242b;
      }
      .el-menu {
        border: none;
        .iconfont {
          margin-right: 10px;
          color: #fff;
        }
      }
    }

    .el-main {
      background: #fff;
    }
  }
}
</style>