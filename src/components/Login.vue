<template>
  <div class="login">
    <div class="login-box">
      <!-- 头像区域  -->
      <div class="login-avatar">
        <img src="../assets/logo.png" alt />
      </div>
      <!-- 表单区域 -->
      <div class="login-form">
        <el-form class="login-elform" :model="loginForm" status-icon :rules="rules" ref="loginForm">
          <el-form-item prop="username">
            <el-input
              prefix-icon="iconfont icon-custom-user"
              v-model="loginForm.username"
              placeholder="账号"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              prefix-icon="iconfont icon-password"
              type="password"
              v-model="loginForm.password"
              placeholder="密码"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm()">登录</el-button>
            <el-button type="info" @click="resetForm()">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'login',
  data(){
    // 用户名自定义规则
    let validatorUserName = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('账号不能为空'));
        }
        callback()
      };
    // 密码自定义规则
    let validatorPwd = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'));
      }
      callback()
    };
    return {
      loginForm:{
        username: '',
        password: '',
      },
      rules:{
        username: [
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' },
          {validator: validatorUserName, trigger: 'blur'},
        ],
        password: [
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' },
          {validator: validatorPwd, trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    // 登录预验证
    submitForm() {
      this.$refs.loginForm.validate( async (valid) => {
        if(valid){
          let res = await this.$axios.post('login', {username: this.loginForm.username, password : this.loginForm.password})
          let {status} = res.data.meta 
          let {data} = res.data
          if(status == 200){
            this.$message({
              message: '登录成功！',
              type: 'success'
            });
            // 将返回的token保存到sessionStorage
            sessionStorage.setItem('token', data.token)
            this.$router.push('/home')
          }else{
            let { msg } = res.data.meta 
            window.console.log(res)
            this.$message({
              message: msg,
              type: 'error'
            })
          }
          // window.console.log(data);
        }
      });
    },
    // 重置表单
    resetForm() {
      this.$refs.loginForm.resetFields();
    }
  }
}
</script>

<style lang="scss" scoped>
// 整个区域
.login {
  width: 100%;
  height: 100%;
  background: #274a6c;
}
.login-box {
  width: 500px;
  height: 300px;
  background: #fff;
  position: relative;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 10px;
  // 头像区域
  .login-avatar {
    width: 100px;
    height: 100px;
    position: absolute;
    left: 50%;
    top: -50px;
    transform: translateX(-50%);
    border-radius: 50%;
    border: 10px solid #fff;
    overflow: hidden;
    box-shadow: 0px 0px 5px #ddd;
    img {
      background-color: #edeeec;
      width: 100%;
      height: 100%;
    }
  }
  // 表单区域
  .login-form {
    width: 100%;
    position: absolute;
    bottom: 5%;
    .login-elform {
      padding: 0 30px;
    }
  }
}
</style>