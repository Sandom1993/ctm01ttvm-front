<template>
  <div class="speed-card-wrap">
    <div id="left">
      <div class="carSpeed"></div>
    </div>
    <div id="right"></div>
  </div>
</template>

<script>
import echarts from 'echarts';
export default {
  name: 'SpeedCard',
  props: {
    speed: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      leftChart: null,
      rightChart: null,
      leftOptions: {
        tooltip: {
          formatter: '{a} <br/>{c} {b}'
        },
        series: [
          {
            name: '速度',
            type: 'gauge',
            min: 0,
            max: 240,
            splitLine: {
              // 分隔线
              length: 6
            },
            axisLine: {
              // 坐标轴线
              lineStyle: {
                // 属性lineStyle控制线条样式
                width: 10
              }
            },
            axisTick: {
              // 坐标轴小标记
              length: 15, // 属性length控制线长
              lineStyle: {
                // 属性lineStyle控制线条样式
                color: 'auto'
              }
            },
            detail: {
              formatter: function(value) {
                value = (value + '').split('.');
                value.length < 2 && value.push('00');
                return (
                  ('00' + value[0]).slice(-2) +
                  '.' +
                  (value[1] + '00').slice(0, 2) +
                  'km/h'
                );
              },
              color: '#000',
              fontSize: 12
            },
            data: [{ value: 0, name: '' }]
          }
        ]
      },
      rightOptions: {
        tooltip: {
          trigger: 'axis',
          formatter: '时间: {b}<br/>速度: {c}'
        },
        legend: {
          right: 10,
          data: ['速度']
        },
        xAxis: {
          type: 'category',
          data: []
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: [],
            color: '#6CB0F9',
            type: 'line',
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(66,133,228,0.22)' },
                  { offset: 1, color: 'rgba(66,133,228,0.02)' }
                ])
              }
            }
          }
        ]
      }
    };
  },
  // mounted() {
  //   this.initEchart();
  // },
  methods: {
    initEchart() {
      this.leftChart = echarts.init(document.getElementById('left'));
      this.rightChart = echarts.init(document.getElementById('right'));
    },
    setLeftEchart(speed) {
      setTimeout(() => {
        if (!this.leftChart) {
          this.initEchart();
        }
        this.leftOptions.series[0].data[0].value = speed;
        this.leftChart.setOption(this.leftOptions);
      }, 0);
    },
    setRightEchart(x, y) {
      setTimeout(() => {
        this.rightOptions.xAxis.data = x;
        this.rightOptions.series[0].data = y;
        this.rightChart.setOption(this.rightOptions);
      }, 0);
    }
  }
};
</script>

<style lang="scss">
.speed-card-wrap {
  position: absolute;
  right: 416px;
  bottom: 32px;
  left: 374px;
  height: 300px;
  background: #fff;
  #left {
    display: inline-block;
    width: 40%;
    height: 100%;
  }
  #right {
    display: inline-block;
    width: 60%;
    height: 100%;
  }
}
</style>
