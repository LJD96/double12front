<template>
  <div id="num" :style="{width: '1000px', height: '250px', float: 'fixed'}">

    <el-row :gutter="12">
      <el-col :span="6">

        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="base-info-card-head">信息总条目数</span>
            </div>
          </template>
          <div class="base-info-card-body">
            {{atomicInfo.allInfoNum}}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="base-info-card-head">用户数</span>
            </div>
          </template>
          <div class="base-info-card-body">
            {{atomicInfo.userNum}}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="base-info-card-head">商品数</span>
            </div>
          </template>
          <div class="base-info-card-body">
            {{atomicInfo.itemNum}}
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="base-info-card-head">商品类目数</span>
            </div>
          </template>
          <div class="base-info-card-body">
            {{atomicInfo.itemCategoryNum}}
          </div>
        </el-card>
      </el-col>
    </el-row>

  </div>
  <div id="myChars" :style="{ width: '500px', height: '500px', float: 'left'}"></div>
  <div id="pvCharts" :style="{ width: '500px', height: '500px', float: 'left'}"></div>
  <div id="top10Browse" :style="{ width: '500px', height: '500px', float: 'left', clear: 'both'}">
    <el-table :data="top10BrowseTableData" style="width: 100%">
      <el-table-column type="index" width="50" />
      <el-table-column prop="itemId" label="商品ID" width="220" />
      <el-table-column prop="browseNum" label="浏览数量" width="220" />
    </el-table>
  </div>
  <div id="top10Buy" :style="{ width: '500px', height: '500px', float: 'left'}">
    <el-table :data="top10BuyTableData" style="width: 100%">
      <el-table-column type="index" width="50" />
      <el-table-column prop="itemId" label="商品ID" width="220" />
      <el-table-column prop="buyNum" label="购买数量" width="220" />
    </el-table>
  </div>
</template>

<script>
import {inject, onMounted, ref, watch} from "vue";
import API from "../plugins/axiosInstance";
import SockJS from  'sockjs-client';
import  Stomp from 'stompjs';
export default {
  name: 'Double12Dashboard',
  setup() {
    //引入echarts
    let echarts = inject("ec");
    let atomicInfo = ref('');
    let stompClient = '';
    let timer = '';
    let funnelChart = '';
    let funnelOption = ref('');
    let socket = '';
    let pvChart = '';
    let pvOption = '';
    let pvData = [];
    let uvData = [];
    let categories = '';
    let top10BrowseTableData = ref([]);
    let top10BuyTableData = ref([]);
    onMounted(() => {
      funnelChart  = echarts.init(document.getElementById("myChars"));
      API({
        url:'/info',
        method:'get'
      }).

      then((res)=>{
        atomicInfo.value = res.data;
        // 绘制图表
        funnelOption.value = {
          title: { text: "漏斗" },
          tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c}'
          },
          legend: {
            data: ['浏览', '收藏', '加购', '购买']
          },

          series: [
            {
              name: '实际',
              type: 'funnel',
              left: '10%',
              width: '80%',
              sort: 'descending',
              gap: 2,
              label: {
                show: true,
                position: 'left',
                textBorderColor: "#000",
                color: "#000",
              },

              labelLine: {
                length: 10,
                lineStyle: {
                  width: 1,
                  type: 'solid'
                }
              },
              itemStyle: {
                borderColor: '#fff',
                borderWidth: 1,
                opacity: 1
              },
              emphasis: {
                label: {
                  fontSize: 20
                }
              },
              data: [
                { value: atomicInfo.value.browseNum, name: '浏览' },
                { value: atomicInfo.value.collectNum, name: '收藏' },
                { value: atomicInfo.value.cartNum, name: '加购' },
                { value: atomicInfo.value.buyNum, name: '购买' },
              ],
              z: 100
            },
            {
              name: '除浏览',
              type: 'funnel',
              left: '10%',
              width: '80%',
              sort: 'descending',
              gap: 2,
              label: {
                show: true,
                position: 'right',
                color: "#000",

              },

              labelLine: {
                length: 10,
                lineStyle: {
                  width: 1,
                  type: 'solid'
                }
              },
              itemStyle: {
                borderColor: '#fff',
                borderWidth: 1,
                opacity: 0.5
              },
              emphasis: {
                label: {
                  fontSize: 20
                }
              },
              data: [
                { value: atomicInfo.value.collectNum, name: '收藏' },
                { value: atomicInfo.value.cartNum, name: '加购' },
                { value: atomicInfo.value.buyNum, name: '购买' },
              ]
            }
          ]
        }
        funnelChart.setOption(funnelOption.value);
        window.onresize = function () {
          //自适应大小
          funnelChart.resize();
        };

        //-------------------------------------------------------------------------
        //初始化pv uv x坐标的刻度数据
        categories = (function () {
          let now = new Date();
          let res = [];
          let len = 10;
          while (len--) {
            res.unshift(now.toLocaleTimeString().replace(/^\D*/, ''));
            now = new Date(+now - 2000);
          }
          return res;
        })();

        //初始化pv表的数据
        pvData = (function () {
          let res = [];
          let len = 10;
          while (len--) {
            res.push(0);
          }
          return res;
        })();

        //初始化uv表的数据
        uvData = (function () {
          let res = [];
          let len = 0;
          while (len < 10) {
            res.push(0);
            len++;
          }
          return res;
        })();

        pvChart = echarts.init(document.getElementById("pvCharts"))
        pvOption = {
          title: {
            text: 'pv & uv'
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#283b56'
              }
            }
          },
          legend: {},
          dataZoom: {
            show: false,
            start: 0,
            end: 100
          },
          xAxis: [
            {
              type: 'category',
              boundaryGap: true,
              data: categories
            },
          ],
          yAxis: [
            {
              type: 'value',
              scale: true,
              name: 'uv数',
              max: 30,
              min: 0,
              boundaryGap: [0.2, 0.2]
            },
            {
              type: 'value',
              scale: true,
              name: 'pv数',
              max: 500,
              min: 0,
              boundaryGap: [0.2, 0.2]
            }
          ],
          series: [
            {
              name: 'pv',
              type: 'bar',
              xAxisIndex: 0,
              yAxisIndex: 1,
              data: pvData
            },
            {
              name: 'uv',
              type: 'line',
              data: uvData
            }
          ]
        };
        pvOption && pvChart.setOption(pvOption);
        window.onresize = function () {
          //自适应大小
          pvChart.resize();
        };
      });
      // 建立连接对象，这里的endpointWechat和后端的stompEndpointRegistry.addEndpoint("/endpointWechat").setAllowedOriginPatterns("*")对应
      socket = new SockJS('http://localhost:9091/endpointWechat' + '?token=token8888');
      // 根据SockJS的websocket对象获取STOMP子协议的客户端对象
      stompClient = Stomp.over(socket);
      //送往服务端的心跳频率，每20000ms一次。心跳默认是开启的，且发送和接收频率都是10000ms
      stompClient.heartbeat.outgoing = 20000;
      //期望服务端发送来的心跳频率，这里是0代表不希望服务端发送心跳
      stompClient.heartbeat.incoming = 0;
      //去除stomp控制台打印，否则来一条打印一条
      // stompClient.debug = () => {};
      // 定义客户端的认证信息,按需求配置，比如login啊，password啊，Authorization啊，token啊，这里我们什么都不需要，后端比较简单
      let headers = {"uid": "ljd"}
      // 向服务器发起websocket连接
      stompClient.connect(headers,(frame) => {
        console.log('连接成功Connected: ' + frame);
        // 订阅服务端提供的某个topic，如果想要订阅多个topic需要在第三个参数传递不同的header对象
        stompClient.subscribe('/topic', (msg) => {
          let result = JSON.parse(msg.body);
          let parse = JSON.parse(result.data);
          if (result.typeId === 1) {
            //基本数据
            funnelOption.value.series[0].data[0].value = parse.browseNum;
            funnelOption.value.series[0].data[1].value = parse.collectNum;
            funnelOption.value.series[0].data[2].value = parse.cartNum;
            funnelOption.value.series[0].data[3].value = parse.buyNum;

            funnelOption.value.series[1].data[0].value = parse.collectNum;
            funnelOption.value.series[1].data[1].value = parse.cartNum;
            funnelOption.value.series[1].data[2].value = parse.buyNum;

            atomicInfo.value = parse;

            //--------------------------------------------------------------------
            let axisData = new Date().toLocaleTimeString().replace(/^\D*/, '');
            pvData.shift();
            pvData.push(parse.pv);
            uvData.shift();
            uvData.push(parse.uv);
            categories.shift();
            categories.push(axisData);
            pvChart.setOption({
              xAxis: [
                {
                  data: categories
                }
              ],
              series: [
                {
                  data: pvData
                },
                {
                  data: uvData
                }
              ]
            });

          }else if(result.typeId === 2){
            //前10名浏览
            top10BrowseTableData.value = parse;
          }else if(result.typeId === 3){
            //前10名购买
            top10BuyTableData.value = parse;
          }

        },headers);

        stompClient.subscribe('/test/ljd/queue', (msg) => {
          console.log(msg.body);
        })
        //向服务端发送消息
        // stompClient.send(
        //     "/receive",
        //     headers,
        //     JSON.stringify({sender: '',chatType: 'JOIN'}),
        // )
      }, (err) => {
        console.log('连接失败')
        console.log(err);
      });

    });

    watch(atomicInfo, () => {
      funnelChart.setOption(funnelOption.value);
    })
      return{
        echarts,
        atomicInfo,
        stompClient,
        timer,
        funnelChart,
        funnelOption,
        socket,
        pvOption,
        pvChart,
        pvData,
        uvData,
        categories,
        top10BrowseTableData,
        top10BuyTableData
      }
  },
  props: {
    msg: String
  },

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.base-info-card-body {
  height: 130px;
  align-content: center;
  line-height: 130px;
  font-size: 25px;
}

.base-info-card-head{
  height: 25px;
  align-content: center;
  line-height: 25px;
  font-size: 20px;
  font-weight: bolder;
  display: block;
}
</style>
