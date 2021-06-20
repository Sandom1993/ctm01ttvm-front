<template>
  <div class="speed-card-wrap">
    <div id="chart"></div>
  </div>
</template>

<script>
import echarts from 'echarts';

export default {
  name: 'SpeedCard',
  props: {
    speedLevel: {
      type: Number,
      default: 80,
    }
  },
  data() {
    return {
      chart: null,
      data_max: 0,
      data_min: 200,
      level_offset: 0,
      
    };
  },
  // mounted() {
  //   this.initEchart();
  // },
  methods: {
    initEchart() {
      this.chart = echarts.init(document.getElementById('chart'));
    },
    setChart(x, y) {
      // y.forEach((v, index) => {
      //   y[index] = Math.random() * 100;
      // })
      setTimeout(() => {
        if (!this.chart) {
          this.initEchart();
        }
        this.data_max = this.max(y);
        this.data_min = this.min(y);
        if (this.speedLevel > this.data_max) {
          this.level_offset = 0
        } else {
          this.level_offset = (Math.ceil(this.data_max) - this.speedLevel) / (Math.ceil(this.data_max) - 0)
        }
        // this.chartOptions.xAxis[0].data = x;
        // this.chartOptions.series[0].data = y;
        this.chart.setOption({
        grid: { x: '5%', y: '10%', width: '93%', height: '75%' },
        xAxis: [{
            type: 'category',
            data: x,
            axisTick: {
                show: false
            },
            axisLabel: {
                textStyle: {
                    color: 'rgb(0,0,0,0.70)',
                }
            }
        }],
        // dataZoom: [
        //   {
        //       type: 'inside',
        //       realtime: true,
        //       start: 0,
        //       end: 100
        //   }
        // ],
        yAxis: [{
            type: 'value',
            z: 3,
            max: Math.ceil(this.data_max),
            min: 0,
            scale: true,
            show: true,
            axisLine: {
                show: false,
            },
            axisTick: {
                show: false
            },
            axisLabel: {
                textStyle: {
                    color: 'rgb(0,0,0,0.30)',
                }
            }
        }],
        /*
        * 将折线分3端。绿色、灰色、红色
        */
        visualMap: {
            show: false,
            dimension: 1,
            pieces: [{
                    gte: 0,
                    lte: this.speedLevel,
                    color: '#2080f7'
                },
                {
                    gte: this.speedLevel,
                    lte: this.data_max,
                    color: '#f00'
                }
            ]
        },
        series: [{
            type: 'line',
            lineStyle: {
                width: 1.656
            },
            // 开启平滑
            smooth: true,
            showSymbol: false,
            animation: false,
            hoverAnimation: false,
            data: y,
            areaStyle: {
                origin: 'start',
                // color: '#f00'
                color: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [{
                            offset: 0,
                            color: '#f00'
                        },
                        {
                            offset: this.level_offset,
                            color: '#f00'
                        },
                        {
                            offset: this.level_offset,
                            color: 'rgba(32,128,247,0.60)'
                        },
                        {
                            offset: 1,
                            color: 'rgba(32,128,247,0.10)'
                        }
                    ]
                }
            },
            /*
            * 标记的两条虚线
            */
            markLine: {
              symbol: 'none',
              silent: true,
              lineStyle: {
                  normal: {
                      type: 'solid',
                  }
              },
              label: {
                  position: 'start'
              },
              data: [{
                  yAxis: this.speedLevel,
                  lineStyle: {
                      width: 1.656,
                      color: '#F5A623'
                  },
                  label: {
                      show: false
                  }
                },
              ]
            },
            /*
            * 标记的文字
            */
            markPoint: {
              silent: true,
              label: {
                  fontSize: 33.12
              },
              data: [{
                  yAxis: this.speedLevel,
                  x: '100%',
                  symbolSize: 0.1,
                  label: {
                      textStyle: {
                          color: '#f6ab30'
                      },
                      fontSize: 12,
                      position: 'left',
                      formatter: this.speedLevel + ''
                  }
              }],
            }
          },
        ]
      });
        window.addEventListener("resize", () => { 
          this.chart.resize();
        });
      }, 0);
    },
    max: function(list) {
      if (!(list instanceof Array) || !list.length) {
          return null;
      }
      let _max = parseFloat(list[0]);
      list.forEach(i => {
          if (parseFloat(i) > _max) {
              _max = parseFloat(i);
          }
      })
      return parseFloat(_max);
    },
    min: function(list) {
      if (!(list instanceof Array) || !list.length) {
          return null;
      }
      let _min = parseFloat(list[0]);
      list.forEach(i => {
          if (parseFloat(i) < _min) {
              _min = parseFloat(i);
          }
      })
      return parseFloat(_min);
    }
  }
};
</script>

<style lang="scss">
.speed-card-wrap {
  position: absolute;
  right: 440px;
  bottom: 80px;
  left: 374px;
  height: 200px;
  background: #fff;
  #chart {
    display: inline-block;
    width: 100%;
    height: 100%;
  }
}
</style>
