<template>
  <div class="user">
    <!-- 显示当前路径：面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索：用的是el-card -->
    <el-card shadow="always">
      <el-row :gutter="20" type="flex">
        <el-col :span="5">
          <el-input placeholder="请输入用户名称" v-model="params.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
    </el-card>
    <!-- 用户展示表格 -->
    <el-table :data="userData" style="width: 100%" border>
      <el-table-column type="index" label="#" width="180"></el-table-column>
      <el-table-column prop="username" label="姓名" width="180"></el-table-column>
      <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
      <el-table-column prop="mobile" label="电话"></el-table-column>
      <el-table-column prop="role_name" label="角色"></el-table-column>
      <el-table-column label="状态">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.mg_state"
            active-color="#13ce66"
            inactive-color="#ff4949"
            @change="handlePower(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-tooltip class="item" effect="dark" content="编辑" placement="top" :enterable="false">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editDialogShow(scope.row)"
            ></el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUser(scope.row.id)"
            ></el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
            <el-button
              type="warning"
              icon="el-icon-lollipop"
              size="mini"
              @click="alotRoles(scope.row)"
            ></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="1"
      :page-sizes="[3,5,10,20]"
      :page-size="params.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>
    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="30%"
      :before-close="addHandleClose"
    >
      <el-form :model="addUserForm" :rules="FormRules" ref="addUserForm" label-width="65px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addHandleCancel">取 消</el-button>
        <el-button type="primary" @click="addHandleSure">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑用户对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="30%"
      :before-close="editHandleClose"
    >
      <el-form :model="editUserForm" :rules="FormRules" ref="editUserForm" label-width="65px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editUserForm.username" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editHandleClose">取 消</el-button>
        <el-button type="primary" @click="editHandleSure">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="rolesDialogVisible"
      width="30%"
      :before-close="rolesHandleClose"
    >
      <div>当前用户：{{currentUser.username}}</div>
      <div>当前的角色：{{currentUser.role_name}}</div>
      <div>
        分配新角色：
        <el-select v-model="rolesValue" placeholder="请选择">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          ></el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rolesHandleClose">取 消</el-button>
        <el-button type="primary" @click="rolesHandleSure">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'users',
  data(){
    // -----自定义表单规则-----
    let validateEmail = (rule, value, callback) => {
      // 判断邮箱是否符合
      let re = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/
      if(!re.test(value) && value != ''){
        callback(new Error('邮箱不符合要求'))
      }else{
        callback()
      }
    }
    let validateMobile = (rule, value, callback) => {
      let re = /1\d{10}/
      if(!re.test(value) && value != ''){
        callback(new Error('请输入正确的手机号码'))
      }else{
        callback()
      }
    }
    return {
      // 分页的请求参数
      params: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 每页显示的总数
      total:0,
      // 专门存放到table里面的容器
      userData:[],
      // 是否显示添加用户对话框
      addDialogVisible: false,
      // 是否显示编辑用户对话框
      editDialogVisible: false,
      // 是否显示分配角色对话框
      rolesDialogVisible: false,
      // 当前选择的用户
      currentUser: {},
      // 存放所有的角色
      rolesList: [],
      // option的角色选择
      rolesValue: '',
      // 添加用户表单元素
      addUserForm:{
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 编辑用户表单元素
      editUserForm:{
        username: '',
        email: '',
        mobile: ''
      },
      // 用户表单规则, 添加和编辑都可以使用
      FormRules:{
        username: [
          { required: true, message: '请设置用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请设置密码', trigger: 'blur' },
          { min: 6, max: 18, message: '长度在 6 到 18 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, trigger: 'blur' , validator:validateEmail},
        ],
        mobile: [
          { required: true, trigger: 'blur' , validator:validateMobile},
        ],
      }
    }
  },
  methods:{
    // 获取用户列表
    async getUserList(){
      const res = await this.$axios.get('users',{params: this.params})
      const userData = res.data.data.users
      this.total = res.data.data.total
      this.userList = userData
      this.userData = userData
      // window.console.log(userData);
    },
    // 修改每页显示多少
    handleSizeChange(val) {
      this.params.pagesize = val
      this.getUserList()
      // window.console.log(`每页 ${val} 条`);
    },
    // 跳转到第几页
    handleCurrentChange(val) {
      this.params.pagenum = val
      this.getUserList()
      // window.console.log(`当前页: ${val}`);
    },
    // 修改用户权限
    async handlePower(row){
      // 发送到后台做修改
      const res = await this.$axios.put(`users/${row.id}/state/${row.mg_state}`)
      const { status } = res.data.meta 
      if(status == 200){
        this.$message({
          message: "更新用户状态成功！",
          type: 'success'
        })
      }else{
        // 因为更新失败了，所以把修改后的改回去
        row.mg_state = !row.mg_state
        this.$message({
          message: "更新用户状态失败！",
          type: 'error'
        })
      }
    },
    // ------------------添加用户的事件------------------
    // 交叉对话框
    addHandleClose(){
      this.addDialogVisible = false
    },
    // 取消对话框
    addHandleCancel(){
      this.addDialogVisible = false
      // 清空表单
      this.$refs.addUserForm.resetFields();
    },
    // 确定对话框, 添加用户
    addHandleSure(){
      // 检验表单
      this.$refs.addUserForm.validate( async (flag) => {
        // 如果flag为true就发送请求添加用户
        if(flag){
          window.console.log(JSON.parse(JSON.stringify(this.addUserForm)))
          this.addDialogVisible = false
          // 发起请求
          let res = await this.$axios.post('users', JSON.parse(JSON.stringify(this.addUserForm)))
          let {status} = res.data.meta
            if(status === 201){
              this.$message({
                message: '创建用户成功！',
                type: 'success'
              })
              // 重新获取用户数据
              this.getUserList()
            }else{
            this.$message({
              message: '创建用户失败！',
              type: 'error'
            })
          }
        }
      });
    },
    // ------------------------------------------------

    // -------------------修改用户的事件-----------------
    editDialogShow(row){
      this.editDialogVisible = true
      // 设置编辑用户的表单数据
      this.editUserForm = row
      // window.console.log(row)
    },
    editHandleClose(){
      this.editDialogVisible = false
      this.$refs.editUserForm.resetFields();
    },
    // 确定对话框, 修改用户
    editHandleSure(){
      // 检验表单
      this.$refs.editUserForm.validate( async (flag) => {
        // 如果flag为true就发送请求添加用户
        if(flag){
          let {id, email, mobile} = this.editUserForm
          let res = await this.$axios.put(`users/${id}`, {email,mobile})
          let {status} = res.data.meta
          if(status == 200){
            this.$message({
              message: '修改用户成功！',
              type: 'success'
            })
            this.editDialogVisible = false
            return
          }
          this.$message({
            message: '修改用户失败！',
            type: 'error'
          })
        }
      });
    },
    // ------------------------------------------------
    // ---------------------删除用户---------------------
    // eslint-disable-next-line no-unused-vars
    deleteUser(id){
      this.$confirm('是否删除该用户?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 删除用户
        this.$axios.delete(`users/${id}`).then(res => {
          let {status} = res.data.meta          
          if(status == 200){
            this.$message({
              message: '删除成功！',
              type: 'success'
            })
            this.getUserList()
          }else{
            this.$message({
              message: '删除失败！',
              type: 'error'
            })
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });          
      });
    },
    // -----------------------------------------------------
    // -----------------------分配角色-----------------------
    // 获取角色列表
    async getRolesList(){
      let res = await this.$axios.get('roles')
      this.rolesList = res.data.data
    },
    alotRoles(row){
      // 显示对话框
      this.rolesDialogVisible = true
      this.currentUser = row
      window.console.log(this.currentUser)
    },
    // 取消
    rolesHandleClose(){
      this.rolesDialogVisible = false
      this.rolesValue = ''
    },
    // 确定
    async rolesHandleSure(){
      if(!this.rolesValue){
        return this.$message({
          message:'请选择分配角色',
          type: 'warning'
        }) 
      }
      let res = await this.$axios.put(`users/${this.currentUser.id}/role`, {
        rid: this.rolesValue
      })
      if(res.data.meta.status == 200){
        this.$message({
          message: '更新成功！',
          type: 'success'
        })
        this.rolesDialogVisible = false
        this.getUserList()
      }else{
        this.$message({
          message:'更新失败！',
          type: 'error'
        })
      }
    }
    // -----------------------------------------------------
  },
  created(){
    this.getUserList()
    this.getRolesList()
  }
}
</script>

<style lang="scss" scoped>
.el-card {
  margin-top: 20px;
  -webkit-box-shadow: none;
  box-shadow: none;
}
.el-table {
  margin-top: 20px;
}
.el-pagination {
  margin-top: 20px;
}
</style>