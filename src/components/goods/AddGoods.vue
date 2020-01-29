<template>
  <div class="addGoods">
    <!-- 显示当前路径：面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 步骤图 -->
    <el-steps :space="200" :active="tabsIndex" finish-status="success">
      <el-step title="基本信息"></el-step>
      <el-step title="商品参数"></el-step>
      <el-step title="商品属性"></el-step>
      <el-step title="商品图片"></el-step>
      <el-step title="商品内容"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>
    <!-- 选择栏 -->
    <el-tabs tab-position="left" :before-leave="tabsLeave">
      <el-tab-pane label="基本信息">
        <el-form
          :model="addForm"
          :rules="addRules"
          ref="addForm"
          label-width="100px"
          class="demo-ruleForm"
        >
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="addForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model="addForm.goods_price"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input v-model="addForm.goods_weight"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input v-model="addForm.goods_number"></el-input>
          </el-form-item>
          <el-form-item label="商品分类" prop="goods_cat">
            <el-cascader
              v-model="addForm.goods_cat"
              :options="selectOpt"
              :props="{ 
                expandTrigger: 'hover',
                label: 'cat_name',
                value: 'cat_id',
                children: 'children'
              }"
              @change="selChange"
            ></el-cascader>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="商品参数">
        <div v-for="(item,index) in cate" :key="index">
          {{item.attr_name}}
          <el-checkbox-group v-model="item.attr_vals">
            <el-checkbox :label="item2" v-for="(item2,index2) in item.attr_vals" :key="index2"></el-checkbox>
          </el-checkbox-group>
        </div>
      </el-tab-pane>
      <el-tab-pane label="商品属性">
        <el-form label-width="200px" class="demo-ruleForm" label-position="top">
          <el-form-item :label="item.attr_name" v-for="item in attr" :key="item.attr_id">
            <el-input v-model="item.attr_vals"></el-input>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="商品图片">
        <!-- 上传 -->
        <el-upload
          class="upload-demo"
          :action="uploadURL"
          :on-preview="handlePreview"
          :on-remove="uploadRemove"
          :file-list="fileList"
          :on-success="getTmpImg"
          :headers="uploadHeaders"
          list-type="picture"
        >
          <el-button size="small" type="primary">点击上传</el-button>
          <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
        </el-upload>
        <!-- 图片预览对话框 -->
        <el-dialog title="图片预览" :visible.sync="previewDialog">
          <img :src="previewPath" alt class="uploadImg" />
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="previewDialog = false">确 定</el-button>
          </div>
        </el-dialog>
      </el-tab-pane>
      <el-tab-pane label="商品内容">
        <!-- 富文本 -->
        <quill-editor
          v-model="textContent"
          ref="myQuillEditor"
          :options="editorOption"
        ></quill-editor>
        <el-button class="addBtn" @click="saveHtml">添加商品</el-button>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: 'addgoods',
  data(){
    return{
      textContent:'',
      editorOption: {},
      previewPath: '',
      previewDialog: false,
      fileList: [],
      // 上传图片的请求头，因为用的是elementUI的请求，没有用到axios的，所以要自己添加一个token
      uploadHeaders: {Authorization: window.sessionStorage.getItem('token')},
      // 上传图片的url
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 当前商品属性
      attr: [],
      // 当前商品参数
      cate: [],
      // 因为商品参数和商品属性每次进入都会发起请求，为了不让它每次进去都发起请求所以加个判断
      firstInto:{
        activeIndex1: true,
        activeIndex2: true
      },
      tabsIndex: 0,
      // 基本信息->商品分类数据
      selectOpt:[],
      addForm:{
        goods_name: '',
        goods_cat: [],  // 提交数据要将他转为字符串
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        goods_introduce: '',
        pics: [],
        attrs: '',
      },
      addRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price : [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' },
        ],
      }
    }
  },
  computed:{
    editor() {
      return this.$refs.myQuillEditor.quill;
    },
  },
  methods:{
    saveHtml:function(){
      this.addForm.goods_introduce = this.textContent
      this.attr.forEach(item => {
        delete item.attr_name
        delete item.cat_id
        delete item.attr_sel
        delete item.attr_write
        delete item.delete_time
      })
      if(Array.isArray(this.addForm.goods_cat)){
        this.addForm.goods_cat = this.addForm.goods_cat.join(',')
      }
      this.addForm.attrs = this.attr
      // window.console.log(this.addForm)
      // 提交数据
      this.$axios.post('goods', this.addForm).then((res)=>{
        window.console.log(res)
        if(res.data.meta.status == 201){
          this.$message({
            message: '添加成功！',
            type: 'success'
          })
          this.$router.push({path: 'goods'})
        }else{
          this.$message({
            message: res.data.meta.msg,
            type: 'error'
          })
        }
      })
    },
    // 上传图片成功的时候触发
    getTmpImg(response){
      window.console.log(response)
      if(response.meta.status == 200){
        this.addForm.pics.push({
          pic: response.data.tmp_path
        })
      }
      // window.console.log(this.addForm)
    },
    // 取消上传图片
    uploadRemove(file){
      let index = this.addForm.pics.findIndex(item => 
        item.pic === file.response.data.tmp_path
      )
      this.addForm.pics.splice(index, 1)
      window.console.log(this.addForm)
    },
    // 预览图
    handlePreview(file){
      this.previewDialog = true
      this.previewPath = file.response.data.url
    },
    // 获取商品参数或者属性
    async getParams(sel){
      // eslint-disable-next-line no-unused-vars
      let {data: res} = await this.$axios.get(`categories/${this.addForm.goods_cat[2]}/attributes`,{
        params: {sel}
      })
      if(res.meta.status == 200 && sel == 'many'){
        res.data.forEach((item)=>{
          item.attr_vals = item.attr_vals == "" ? [] : item.attr_vals.split(',')
        })
        this.cate = res.data
        window.console.log(this.cate)
      }
      if(res.meta.status == 200 && sel == 'only'){
        this.attr = res.data
        window.console.log(this.attr)
      }
    },
    // 离开标签栏触发
    tabsLeave(activeIndex, oldActive){
      if(oldActive == 0 && activeIndex !== 0 && this.addForm.goods_cat.length == 0){
        this.$message({
          message: '请选择商品分类',
          type: 'error'
        })
        return false;
      }
      if(activeIndex == 1 && this.firstInto.activeIndex1){
        this.getParams('many')
        this.firstInto.activeIndex1 = false
      }
      if(activeIndex == 2 && this.firstInto.activeIndex2){
        this.getParams('only')
        this.firstInto.activeIndex2 = false
      }
      this.tabsIndex = parseInt(activeIndex)
    },
    // 选择商品分类
    selChange(){
      if(this.addForm.goods_cat.length < 3){
        this.$message({
          message: '要选择第三层数据',
          type: 'error'
        })
        this.addForm.goods_cat = []
      }
    },
    // 获取分类数据
    async getCateData(){
      let res = await this.$axios.get('categories')
      if(res.data.meta.status !== 200){
        return this.$message({
          message:'获取数据失败'
        })
      }
      this.selectOpt = res.data.data
      // window.console.log(this.selectOpt)
    },
  },
  created(){
    this.getCateData()
  }
}
</script>

<style>
.el-steps {
  margin-top: 20px;
}
.el-tabs {
  margin-top: 40px;
}
.el-input {
  width: 300px;
}
.el-cascader {
  width: 20%;
}
.el-cascader-panel {
  max-height: 400px !important;
}
.el-checkbox-group {
  margin-top: 20px;
}
.uploadImg {
  width: 100%;
}
.addBtn{
  margin-top: 20px;
}
</style>