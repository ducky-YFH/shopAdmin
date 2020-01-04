<template>
  <div class="category">
    <!-- 显示当前路径：面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 添加分类按钮 -->
    <div class="btnbox">
      <el-button type="primary" @click="cateDialogShow">添加分类</el-button>
    </div>
    <!-- 表格内容 -->
    <table-tree
      ref="table"
      sum-text="sum"
      index-text="#"
      :columns="columns"
      :data="CateData"
      :stripe="false"
      :border="true"
      :showHeader="true"
      :showSummary="false"
      :showRowHover="false"
      :showIndex="true"
      :treeType="true"
      :isFold="true"
      :expandType="false"
      :selectionType="false"
    >
      <template slot="check" scope="scope">
        <i v-if="!scope.row.cat_deleted" class="el-icon-check"></i>
        <i v-else class="el-icon-close"></i>
      </template>
      <template slot="level" scope="scope">
        <el-tag v-if="scope.row.cat_level === 0">标签一</el-tag>
        <el-tag v-else-if="scope.row.cat_level === 1" type="success">标签二</el-tag>
        <el-tag v-else type="warning">标签三</el-tag>
      </template>
      <template slot="operate">
        <el-button size="mini" type="primary">编辑</el-button>
        <el-button size="mini" type="danger">删除</el-button>
      </template>
    </table-tree>
    <!-- 添加对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addDialogVisible"
      width="30%"
      :before-close="addHandleClose"
    >
      <el-form :model="addCateForm" :rules="FormRules" ref="addCateForm" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <!-- 多级联动选择器 -->
        <el-form-item label="分类级别">
          <div class="block">
            <el-cascader
              v-model="addCateForm.cat_id"
              :options="addCateData"
              :props="{
                label: 'cat_name',
                value: 'cat_id',
              }"
              @change="handleChange"
              clearable
              change-on-select
            ></el-cascader>
          </div>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addHandleCancel">取 消</el-button>
        <el-button type="primary" @click="addHandleSure">确 定</el-button>
      </span>
    </el-dialog>
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
  </div>
</template>

<script>
export default {
  name:'Cate',
  data(){
    return {
      // 分页的请求参数
      params: {
        type: 3,
        pagenum: 1,
        pagesize: 3,
      },
      total: 0,
      // 数据容器
      CateData: [],
      // 表格的头部信息
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
          width: '400px'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          minWidth: '50px',
          type: 'template',
          template: 'check'
        },
        {
          label: '排序',
          prop: 'cat_level',
          type:'template',
          template: 'level'
        },
        {
          label: '操作',
          minWidth: '200px',
          type: 'template',
          template: 'operate'
        },
      ],
      // ------------------添加分类------------------
      // 显示隐藏添加分类对话框
      addDialogVisible: false,
      // 分类元素表单
      addCateForm:{
        cat_id: [],
        cat_name: '',
        cat_level: 0,
        cat_pid: 0,
      },
      FormRules:{
        cat_name: [
          { required: true, message: '请设置分类名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ]
      },
      addCateData: []
      // -------------------------------------------
    }
  },
  methods:{
    // 获取后端数据
    async getCateData(){
      let res = await this.$axios.get('categories',{
        params:{
          type:this.params.type,
          pagenum: this.params.pagenum,
          pagesize: this.params.pagesize
        }
      })
      if(res.data.meta.status != 200){
        return this.$message({
          message:'获取数据失败！',
          type: 'error'
        })
      }
      // 所有分类数据
      this.CateData = JSON.parse(JSON.stringify(res.data.data.result))
      // window.console.log(this.CateData)
      // 总条数
      this.total = res.data.data.total
      // 删除第二层children里面的数据，因为添加分类里面的级联选择器用不到第二层的children
      this.addCateData = JSON.parse(JSON.stringify(res.data.data.result))
      this.addCateData.forEach(item => {
        item.children.forEach(item2 => {
          delete item2['children']
        })
      })
      window.console.log(this.CateData)
    },
    // 修改每页显示多少
    handleSizeChange(val) {
      this.params.pagesize = val
      this.getCateData()
      // window.console.log(`每页 ${val} 条`);
    },
    // 跳转到第几页
    handleCurrentChange(val) {
      this.params.pagenum = val
      this.getCateData()
      // window.console.log(`当前页: ${val}`);
    },
    // --------------------添加分类--------------------
    // 显示对话框
    cateDialogShow(){
      this.addDialogVisible = true
    },
    // 关闭对话框，不清除内容
    addHandleClose(){
      this.addDialogVisible = false
    },
    // 关闭对话框，清除内容
    addHandleCancel(){
      this.addDialogVisible = false
      this.addCateForm = {
        cat_id: [],
        cat_name: '',
        cat_level: 0,
        cat_pid: 0,
      }
    },
    //确定，发起请求
    addHandleSure(){
      // 完善提交的表单数据,详细要求看后台接口文件
      let length = this.addCateForm.cat_id.length
      this.addCateForm.cat_level = length
      if(length > 0){
        this.addCateForm.cat_pid = this.addCateForm.cat_id[length - 1]
      }
      this.$refs.addCateForm.validate(async flag => {
        if(flag){
          // 提交请求数据
          let res = await this.$axios.post("categories",{
            cat_pid: this.addCateForm.cat_pid,
            cat_name: this.addCateForm.cat_name,
            cat_level: this.addCateForm.cat_level,
          })
          if(res.data.meta.status == 201){
            this.$message({
              message: '添加成功！',
              type: 'success'
            })
            this.getCateData()
          }else{
            this.$message({
              message: '添加失败！',
              type: 'error'
            })
          }
          this.addDialogVisible = false
          // 清空表单数据
          this.addCateForm = {
            cat_id: [],
            cat_name: '',
            cat_level: 0,
            cat_pid: 0,
          }
          return
        }
        this.$message({
          message: '请完善表单数据',
          type: 'error'
        })
      })
      window.console.log('确定');
    },
    // 选择多级联动
    handleChange(){
    }
    // ----------------------------------------------
  },
  created(){
    this.getCateData()
  }
}
</script>

<style lang="scss" scoped>
.btnbox {
  margin: 20px 0;
}
.el-cascader {
  width: 100%;
}
</style>