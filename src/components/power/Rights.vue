<template>
  <div class="rights">
    <!-- 显示当前路径：面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 数据表格 -->
    <el-table :data="RightsData" style="width: 100%" border>
      <el-table-column type="index" label="#" width="180"></el-table-column>
      <el-table-column prop="authName" label="权限名称" width="180"></el-table-column>
      <el-table-column prop="path" label="路径" width="180"></el-table-column>
      <el-table-column prop="level" label="权限等级">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.level == 0">一级</el-tag>
          <el-tag type="info" v-else-if="scope.row.level == 1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'rights',
  data(){
    return {
      RightsData:[]
    }
  },
  methods:{
    async getRightsData(){
      const res = await this.$axios.get('rights/list')
      const {data, meta} = res.data
      if(meta.status){
        this.RightsData = data
        window.console.log(data)
      }else{
        return this.$message({
          message: '获取后台数据失败！'
        })
      }
    }
  },
  created(){
    this.getRightsData()
  }
}
</script>

<style lang="scss" scoped>
.el-table {
  margin-top: 20px;
}
</style>