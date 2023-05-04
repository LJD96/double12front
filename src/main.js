import { createApp } from 'vue'
import App from './App.vue'
// import echarts from "echarts";
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
// import axios from '@/plugins/axiosInstance.js'

//每个应用都有一个跟组件，这里就是App
const app = createApp(App);

app.use(ElementPlus);
//配置echarts的全局引用
// app.config.globalProperties.$echarts=echarts
//配置axios的全局引用
// app.config.globalProperties.$axios=axios;
//应用实例只有在调用了mount()方法后才会被渲染出来，这里的#app对应根目录下的public目录下的index.html中的id=app的div块
app.mount("#app");


