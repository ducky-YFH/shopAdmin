<template>
  <div class="Params">
    <!-- 显示当前路径：面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 注意事项 -->
    <el-alert title="提示：只允许为第三级分类设置相关参数！" type="warning" show-icon></el-alert>
    <!-- 选择商品分类 -->
    <el-row class="selectCate">
      <el-col>
        <span class="demonstration">请选择商品分类：</span>
        <el-cascader
          v-model="currSelect"
          :options="cateData"
          :props="{
              expandTrigger: 'hover',
              label:'cat_name',
              value:'cat_id',
              children: 'children'
            }"
          @change="selectCate"
        ></el-cascader>
      </el-col>
    </el-row>
    <!-- 标签页 -->
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="静态参数" name="only">
        <el-button type="primary" :disabled="btnDisabled" @click="dialogShow">添加参数</el-button>
      </el-tab-pane>
      <el-tab-pane label="动态参数" name="many">
        <el-button type="primary" :disabled="btnDisabled" @click="dialogShow">添加参数</el-button>
      </el-tab-pane>
    </el-tabs>
    <!-- 表格数据 -->
    <el-table :data="tableData" style="width: 100%">
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-tag
            v-for="(item,index) in scope.row.attr_vals"
            :key="index"
            closable
            :disable-transitions="false"
            @close="handletagClose(item,scope.row)"
          >{{item}}</el-tag>
          <el-input
            class="input-new-tag"
            v-if="scope.row.tagInputFlag"
            v-model="scope.row.tagInputVal"
            ref="saveTagInput"
            size="small"
            @keyup.enter.native="handleInputConfirm(scope.row)"
            @blur="handleInputConfirm(scope.row)"
          ></el-input>
          <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ 添加属性</el-button>
        </template>
      </el-table-column>
      <el-table-column type="index" label="#"></el-table-column>
      <el-table-column label="参数名称" prop="attr_name"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" @click="handleEdit(scope.row)">修改</el-button>
          <el-button type="danger" @click="handleDel(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 对话框 -->
    <el-dialog :title="dialogForm.title" :visible.sync="dialogFlag">
      <el-form :model="dialogForm" :rules="formRules" ref="dialogForm">
        <el-form-item :label="dialogForm.label" label-width="50" prop="attr_name">
          <el-input v-model="dialogForm.attr_name" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="hideDialog">取 消</el-button>
        <el-button type="primary" @click="dialogSure">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Params',
  data(){
    return {
      // 当前选择的分类
      currSelect: [],
      // 当前选中的分类id
      currId: new Number(),
      // 分类数据
      cateData: [],
      // 标签页
      activeName: 'only',
      // 是否允许添加按钮点击
      btnDisabled: true,
      // 表格数据
      tableData: [],
      // 对话框状态
      dialogFlag: false,
      // 对话框内容
      dialogForm: {
        title: '',
        label: '',
        attr_name: ''
      },
      // 表单规则
      formRules:{
        attr_name: [
          { 
            required: true,
            message: '请输入参数',
            trigger: 'blur'
          },
        ]
      },
      // 显隐对话跨
      delDialogFlag: false
    }
  },
  methods: {
    // 添加标签
    showInput(row) {
      row.tagInputFlag = true;
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    async handleInputConfirm(row) {
      if (row.tagInputVal) {
        row.attr_vals.push(row.tagInputVal)
        let attr_vals = row.attr_vals.join(' ')
        // 发送请求，添加数据
        let { attr_name, attr_sel, attr_id } = row
        let res = await this.$axios.put(`categories/${this.currId}/attributes/${attr_id}`,{
          attr_name,
          attr_sel,
          attr_vals
        })
        if(res.data.meta.status == 200){
          this.$message({
            message: '添加成功！',
            type: 'success'
          })
          row.tagInputVal = ''
        }else{
          this.$message({
            message: '添加失败！',
            type: 'error'
          })
          row.attr_vals.pop()
        }
      }
      row.tagInputFlag = false;
    },
    // 删除标签
    async handletagClose(val, row){
      let index = row.attr_vals.findIndex(item => {
        return item == val
      })
      row.attr_vals.splice(index,1)
      let attr_vals = row.attr_vals.join(' ')
      let { attr_name, attr_sel, attr_id } = row
      let res = await this.$axios.put(`categories/${this.currId}/attributes/${attr_id}`,{
        attr_name,
        attr_sel,
        attr_vals
      })
      if(res.data.meta.status == 200){
        this.$message({
          message: '删除成功！',
          type: 'success'
        })
      }else{
        this.$message({
          message: '删除失败！',
          type: 'error'
        })
      }
    },
    // 删除
    handleDel(row){
      this.$confirm('确认删除？').then(val => {
        if(val == 'confirm'){
          this.$axios.delete(`categories/${this.currId}/attributes/${row.attr_id}`).then(res => {
            if(res.data.meta.status == 200){
              this.$message({
                message: '删除成功！',
                type: 'success'
              })
              this.handleClick()
            }else{
              this.$message({
                message: '删除失败',
                type: 'error'
              })
            }
          })
        }
      })
    },
    // 修改
    handleEdit(row){
      this.dialogFlag = true
      this.dialogForm.attr_name = ''
      this.dialogForm.title = '修改参数'
      if(this.activeName == 'only'){
        this.dialogForm.label = '修改静态参数'
      }else{
        this.dialogForm.label = '修改动态参数'
      }
      this.dialogForm.attr_name = row.attr_name
      // 在原来的基础上再添加一个数据，因为修改的时候需要用到
      this.dialogForm.attr_id = row.attr_id
    },
    // 对话框确定
    dialogSure(){
      const type = this.dialogForm.title === '修改参数' ? 'edit' : 'add'
      // 因为对话框和修改一起公用了，所以要判断一下哪个的确定
        this.$refs.dialogForm.validate(async flag => {
          if(flag && type == 'add'){
            // 发送请求， 提交数据
            let res = await this.$axios.post(`categories/${this.currId}/attributes`,{
              attr_name: this.dialogForm.attr_name,
              attr_sel: this.activeName
            })
            if(res.data.meta.status == 201){
              this.$message({
                message: '添加成功',
                type: 'success'
              })
              this.handleClick()
              this.dialogFlag = false
              // 清空表单
              this.dialogForm.attr_name = ''
              return
            }
            this.$message({
              message: '添加失败！',
              type: 'error'
            })
            return
          }
          if(flag && type == 'edit'){
            // 发送请求， 提交数据
            let res = await this.$axios.put(`categories/${this.currId}/attributes/${this.dialogForm.attr_id}`,{
              attr_name: this.dialogForm.attr_name,
              attr_sel: this.activeName
            })
            window.console.log(res)
            if(res.data.meta.status == 200){
              this.$message({
                message: '修改成功',
                type: 'success'
              })
              this.handleClick()
              this.dialogFlag = false
              // 清空表单
              this.dialogForm.attr_name = ''
              return
            }
            this.$message({
              message: '修改失败！',
              type: 'error'
            })
            return
          }
          this.$message({
            message: '请输入参数值',
            type: 'error'
          })
        })
    },
    // 弹出对话框
    dialogShow(){
      this.dialogFlag = true
      this.dialogForm.attr_name = ''
      this.dialogForm.title = '添加参数'
      if(this.activeName == 'only'){
        this.dialogForm.label = '添加静态参数'
      }else{
        this.dialogForm.label = '添加动态参数'
      }
    },
    // 获取后台数据
    async getCateData(){
      let res = await this.$axios.get('categories')
      if(res.data.meta.status !== 200){
        return this.$message({
          message:'获取数据失败'
        })
      }
      this.cateData = res.data.data
    },
    // 选择商品分类
    selectCate(val){
      if(val.length < 3){
        this.currSelect = []
        this.btnDisabled = true
        this.$message({
          message: '只允许为第三级分类设置相关参数！',
          type: 'error'
        })
        return 
      }
      this.handleClick()
      this.btnDisabled = false
    },
    // 转换标签页
    async handleClick(){
      // 判断是否有选中分类
      if(this.currSelect.length > 0){
        this.currId = this.currSelect[this.currSelect.length - 1]
        let res = await this.$axios.get(`categories/${this.currId}/attributes`, {
          params: { sel: this.activeName }
        })
        if(res.data.meta.status == 200){
          // 看需求来修改，我也不知道怎么说了。要做才知道
          res.data.data.forEach(item => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
            item.tagInputFlag = false
            item.tagInputVal = ''
          })
          this.tableData = res.data.data
          window.console.log(this.tableData)
          return
        }
        this.$message({
          message: '获取数据失败',
          type: 'error'
        })
      }else{
        this.$message({
          message: '请选择分类',
          type: 'warning'
        })
      }
    },
    // 隐藏添加、修改对话框
    hideDialog(){
      this.dialogFlag = false
      this.$refs.dialogForm.resetFields()
    }
  },
  created(){
    this.getCateData()
  }
}
</script>

<style lang="scss">
.el-alert {
  margin: 20px 0;
}
.el-cascader {
  width: 20%;
}
.el-cascader-panel {
  max-height: 400px !important;
}
.el-tabs {
  margin-top: 10px;
}
.el-tag {
  margin-right: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>