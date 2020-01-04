<template>
  <div class="Roles">
    <!-- 显示当前路径：面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色管理</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 添加角色 -->
    <div class="add-box">
      <el-button type="primary">添加角色</el-button>
    </div>
    <!-- 表格区域 -->
    <el-table :data="rolesList" style="width: 100%" border>
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-row
            :class="[index == 0 ? 'border-top' : '','border-bottom','flex-align-center']"
            v-for="(one,index) in scope.row.children"
            :key="one.id"
          >
            <!-- 一级 -->
            <el-col :span="3">
              <el-tag closable @close="handleTagClose(scope.row, one.id)">{{one.authName}}</el-tag>
              <i style="color:#409eff" class="iconfont icon-cc-left"></i>
            </el-col>
            <!-- 二级 -->
            <el-col :span="21">
              <el-row v-for="two in  one.children" :key="two.id" :class="['flex-align-center']">
                <el-col :span="3">
                  <el-tag
                    closable
                    @close="handleTagClose(scope.row, two.id)"
                    type="success"
                  >{{two.authName}}</el-tag>
                  <i class="iconfont icon-cc-left" style="color:#67c23a"></i>
                </el-col>
                <!-- 三级 -->
                <el-col :span="3" class="el-col-three">
                  <el-tag
                    closable
                    @close="handleTagClose(scope.row, three.id)"
                    type="warning"
                    v-for="three in two.children"
                    :key="three.id"
                  >{{three.authName}}</el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column type="index" label="#" width="180"></el-table-column>
      <el-table-column prop="roleName" label="角色名称" width="180"></el-table-column>
      <el-table-column prop="roleDesc" label="角色描述" width="180"></el-table-column>
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
              @click="deleteRoles(scope.row.id)"
            ></el-button>
          </el-tooltip>
          <el-tooltip class="item" effect="dark" content="分配权限" placement="top" :enterable="false">
            <el-button
              @click="AllotRights(scope.row)"
              type="warning"
              icon="el-icon-lollipop"
              size="mini"
            ></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分配权限对话框 -->
    <el-dialog 
      title="提示" width="30%" 
      :visible.sync="rightsDialog"
      :before-close="handleRightsClose"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightsTree"
        show-checkbox
        node-key="id"
        :default-expanded-keys="rightsExpanded"
        :default-checked-keys="rightsChecked"
        :props="defaultProps"
        ref="tree"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleRightsClose">取 消</el-button>
        <el-button type="primary" @click="rightsAdd">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'roles',
  data(){
    return {
      // 所有角色的列表,里面包含各个角色目前的权限
      rolesList:[],
      // -----------------------权限分配-----------------------
      // 分配权限对话框是否显示
      rightsDialog: false,
      // 权限树形容器
      rightsTree: [],
      // 因为不知道返回的数据子数组的名称是什么,所以这里可以设置
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      // 默认展开
      rightsExpanded:[],
      // 默认选中
      rightsChecked:[],
      // 当前展开的角色id
      currentRolesId: ''
      // ----------------------------------------------------
    }
  },
  methods:{
    // 获取角色列表
    async getRolesList(){
      let res = await this.$axios.get('roles')
      if(res.data.meta.status == 200){
        this.rolesList = res.data.data
      }
    },
    // 删除用户权限
    handleTagClose(row, rightId){
      let url = `roles/${row.id}/rights/${rightId}`
      let title = '确定要删除这个权限吗？'
      let type = 'rights'
      this.deleteConfirm(url, title , type, row)
    },
    // 删除角色
    deleteRoles(roleId){
      let url = `roles/${roleId}`
      let title = '确定要删除这个角色吗？'
      this.deleteConfirm(url, title)
    },
    // 删除确认框
    deleteConfirm(url, title, type, row){
      this.$confirm(title, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$axios.delete(url).then(res => {
          let {status} = res.data.meta          
          // window.console.log(res)
          if(status == 200 && type =='rights'){
            this.$message({
              message: '删除权限成功！',
              type: 'success'
            })
            row.children = res.data.data
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
    // ----------------------分配权限部分----------------------
    // 添加权限，将数据保存到服务器
    async rightsAdd(){
      this.rightsDialog = false
      // 获取选中一半的id，例如子叶里面一半选了、一半没选。那么这个父叶子就为半选
      let halfChecked = this.$refs.tree.getHalfCheckedKeys()
      // 获取选中全选的id
      let allChecked = this.$refs.tree.getCheckedKeys()
      let sumChecked = halfChecked.concat(allChecked).join(',')
      // 将数据提交到后台
      let res = await this.$axios.post(`roles/${this.currentRolesId}/rights`, {rids: sumChecked})
      if(res.data.meta.status == 200){
        this.$message({
          message: '更新成功！',
          type: 'success'
        })
        this.getRolesList()
      }else{
        this.$message({
          message: '更新失败！',
          type: 'error'
        })
      }
      // 清空默认选中
      this.$refs.tree.setCheckedKeys([])
    },
    // 关闭分配权限对话框
    handleRightsClose(){
      this.rightsDialog = false
      // 清空默认选中
      this.$refs.tree.setCheckedKeys([])
    },
    // 显示权限对话框
    AllotRights(row){
      this.currentRolesId = row.id
      // 清空
      this.rightsExpanded = []
      this.rightsChecked = []
      this.rightsDialog = true
      // 利用函数递归获取默认展开和选中
      if(row.children.length > 0){
        // 一级
        this.rightsExpanded.push(row.id)
        this.rightsEandC(row.children)
      }
    },
    // 二级和三级
    rightsEandC(children){
      children.forEach(item => {
        if(item.children && item.children.length > 0){
          this.rightsExpanded.push(item.id)
          return this.rightsEandC(item.children)
        }
        this.rightsChecked.push(item.id)
      })
    },
    // 获取权限列表, 目的用来添加权限
    async getRolesRights(){
      const res = await this.$axios.get('rights/tree')
      if(res.data.meta.status == 200){
        this.rightsTree = res.data.data
        // window.console.log(this.rightsTree)
      }
    }
    // ------------------------------------------------------
  },
  created(){
    this.getRolesList()
    this.getRolesRights()
  }
}
</script>

<style lang="scss" scoped>
.add-box {
  margin: 20px 0;
}
.el-tag {
  margin: 7px 3px;
}
.el-col-three {
  display: flex;
}
.flex-align-center {
  display: flex;
  align-items: center;
}
.border-bottom {
  border-bottom: 1px solid #ebeef5;
}
.border-top {
  border-top: 1px solid #ebeef5;
}
</style>