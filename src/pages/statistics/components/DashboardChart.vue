<template>
  <div id="speed-chart-container">

  </div>
</template>

<script>
let speedChart;
import echarts from 'echarts'
export default {
  name: 'DashboardChart',
  props: {
    speed: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      chartOption: {
        title: {
          show: false,
        },
        radius: '100%',
        tooltip: {
          formatter: '{a} : {c} km/h'
        },
        series: [{
          name: '速度',
          type: 'gauge',
          radius: 46,
          startAngle: 210,
          endAngle: -30,
          min: 0,
          max: 240,
          data: [{
              value: 0
          }],
          detail: {
              formatter: '{value}',
              offsetCenter: [0, 0],
              color: 'rgba(0,0,0,0.90)',
              fontFamily: 'Microsoft YaHei',
              fontSize: 18
          },
          axisTick: {
              show: false,
              splitNumber: 2
          },
          splitLine: {
              show: false
          },
          axisLine: {
              lineStyle: {
                  width: 2,
                  color: [
                      [1, '#018DFF']
                  ]
              }
          },
          pointer: {
              length: '80%',
              width: 2
          },
          axisLabel: {
              show: false
          }
        },
        {
          radius: 46,
          type: 'gauge',
          startAngle: 210,
          endAngle: -30,
          min: 0,
          max: 240,
          data: [{
              value: 0
          }],
          detail: {
              formatter: '\nkm/h',
              offsetCenter: [0, 5],
              color: 'rgba(0,0,0,0.60)',
              fontFamily: 'Microsoft YaHei',
              fontSize: 14
          },
          axisTick: {
              show: false
          },
          splitLine: {
              length: 12, // 刻度节点线长度
              lineStyle: {
                  width: 2,
                  color: '#fff'
              } // 刻度节点线
          },
          axisLine: {
              lineStyle: {
                  width: 10,
                  color: [
                      [1, 'rgba(32,128,252,0.51)']
                  ]
              }
          },
          pointer: {
              show: false
          },
          axisLabel: {
              show: false
          }
        }]
      }
    }
  },
  watch: {
    speed: function (n, o) {
      this.chartOption = {
        title: {
          show: false,
        },
        radius: '100%',
        tooltip: {
          formatter: '{a} : {c} km/h'
        },
        series: [{
          name: '速度',
          type: 'gauge',
          radius: 46,
          startAngle: 210,
          endAngle: -30,
          min: 0,
          max: 240,
          data: [{
              value: n
          }],
          detail: {
              formatter: '{value}',
              offsetCenter: [0, 0],
              color: 'rgba(0,0,0,0.90)',
              fontFamily: 'Microsoft YaHei',
              fontSize: 18
          },
          axisTick: {
              show: false,
              splitNumber: 2
          },
          splitLine: {
              show: false
          },
          axisLine: {
              lineStyle: {
                  width: 2,
                  color: [
                      [1, '#018DFF']
                  ]
              }
          },
          pointer: {
              length: '80%',
              width: 2
          },
          axisLabel: {
              show: false
          }
        },
        {
          radius: 46,
          type: 'gauge',
          startAngle: 210,
          endAngle: -30,
          min: 0,
          max: 240,
          data: [{
              value: 0
          }],
          detail: {
              formatter: '\nkm/h',
              offsetCenter: [0, 5],
              color: 'rgba(0,0,0,0.60)',
              fontFamily: 'Microsoft YaHei',
              fontSize: 14
          },
          axisTick: {
              show: false
          },
          splitLine: {
              length: 12, // 刻度节点线长度
              lineStyle: {
                  width: 2,
                  color: '#fff'
              } // 刻度节点线
          },
          axisLine: {
              lineStyle: {
                  width: 10,
                  color: [
                      [1, 'rgba(32,128,252,0.51)']
                  ]
              }
          },
          pointer: {
              show: false
          },
          axisLabel: {
              show: false
          }
        }]
      }
      speedChart.setOption(this.chartOption, true);
    }
  },
  mounted() {
    this.initChart();
  },
  methods: {
    initChart() {
      speedChart = echarts.init(
        document.getElementById('speed-chart-container')
      );
      speedChart.setOption(this.chartOption, true);
    },
  }

}
</script>

<style lang="scss" scoped>
  #speed-chart-container {
    width: 112px;
    height: 92px;
  }
</style>
