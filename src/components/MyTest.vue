<template>
<div>
  <el-button @click="test2">请求</el-button>
</div>
</template>

<script>
import API from "../plugins/axiosInstance";
import {onMounted} from "vue";
export default {
  name: "MyTest",
  setup(){
    onMounted(() =>{

    })
    function test2(){
      API({
        url:'/test',
        method:'get'
      }).then((res) => {
        console.log(res.data);
      })
    }
    return{
      test2
    }
  }
}
</script>

<style scoped>

</style>
