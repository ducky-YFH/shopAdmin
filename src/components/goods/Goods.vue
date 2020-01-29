<template>
  <div class="goods">
    <!-- 显示当前路径：面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索 -->
    <el-input class="searchInput" v-model="goodsParams.query" placeholder="请输入搜索内容" clearable @clear="getGoodsData">
      <el-button slot="append" icon="el-icon-search" @click='getGoodsData'></el-button>
    </el-input>
    <!-- 添加商品 -->
    <el-button class="addGoods" type="primary" @click="toAddGoods">添加商品</el-button>
    <!-- 表格数据 -->
    <el-table :data="goodsList" style="width: 100%" border>
      <el-table-column type="index" label="#" width="180"></el-table-column>
      <el-table-column prop="goods_name" label="商品名称" width="180"></el-table-column>
      <el-table-column prop="goods_price" label="商品价格(元)" width="180"></el-table-column>
      <el-table-column prop="goods_weight" label="商品重量"></el-table-column>
      <el-table-column prop="add_time" label="创建时间" :formatter="formatTime"></el-table-column>
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
              @click="deleteGoods(scope.row.goods_id)"
            ></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页功能 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="goodsParams.pagenum"
      :page-sizes="[5, 10, 20, 30]"
      :page-size="goodsParams.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>
  </div>
</template>

<script>
export default {
  name: 'goods',
  data(){
    return {
      // 获取商品列表的请求参数
      goodsParams:{
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品列表数据
      goodsList: [],
      // 商品总数
      total: 0
    }
  },
  methods:{
    // 删除商品
    async deleteGoods(id){
      let res = await this.$axios.delete(`goods/${id}`)
      if(res.data.meta.status == 200){
        this.$message({
          message: '删除成功！',
          type: 'success'
        })
        this.getGoodsData()
      }else{
        this.$message({
          message: '删除失败！',
          type: 'error'
        })
      }
    },
    // 跳转到添加商品页
    toAddGoods(){
      // window.console.log(this.$router)
      this.$router.push('/addgoods')
    },
    // 分页功能
    handleSizeChange(val){
      // window.console.log(`每页${val}页`)
      this.goodsParams.pagesize = val
      this.getGoodsData()
    },
    handleCurrentChange(val){
      // window.console.log(`当前页:${val}`)
      this.goodsParams.pagenum = val
      this.getGoodsData()
    },
    // 格式化时间
    formatTime(row){
      return new Date(row.add_time * 1000).toLocaleString()
    },
    // 获取商品列表数据
    async getGoodsData(){
      let {data: res} = await this.$axios.get('/goods', {params: this.goodsParams})
      if(res.meta.status == 200){
        this.goodsList = res.data.goods
        this.total = res.data.total
        // window.console.log(this.goodsList)
      }
    }
  },
  created(){
    this.getGoodsData()
  }
}
</script>

<style>
.searchInput {
  margin-top: 20px;
  width: 250px;
}
.addGoods {
  margin-left: 20px;
}
.el-table {
  margin-top: 20px;
}
</style>