<template>
  <Double12Dashboard/>
</template>

<script>
import Double12Dashboard from './components/Double12Dashboard.vue'
import * as echarts from 'echarts'
import { provide } from 'vue'

export default {
  name: 'App',
  setup(){
    provide('ec',echarts)//provide
  },
  components: {
    Double12Dashboard
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
