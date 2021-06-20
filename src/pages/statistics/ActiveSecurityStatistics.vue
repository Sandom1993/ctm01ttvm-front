<template>
  <h-layout class="statistics-page">
    <h-layout-aside width="280px" class="left-bar">
      <vehicle-tree
        ref="resourceTree"
        :top="8"
        :bottom="8"
        :left="8"
        :right="8"
        tree-key="indexCode"
        tree-type="3"
        :check-limit="2000"
        :slot-line="3"
        @getSelectedNodes="getSelectedNodes"
      >
        <template slot="time">
          <el-form label-position="top">
            <el-form-item label="时间" required style="margin-bottom:0">
              <el-date-picker
                v-model="searchCondition.date"
                :picker-options="pickerOptions"
                type="date"
                placeholder="请选择日期"
              />
            </el-form-item>
          </el-form>
        </template>
        <template slot="btns">
          <el-button
            type="primary"
            style="width: 100%; max-width: 100%;"
            :loading="loading"
            @click="onSearch"
          >
            查询
          </el-button>
        </template>
      </vehicle-tree>
    </h-layout-aside>
    <h-layout class="right-bar">
      <h-layout-header>
        <el-button type="iconButton" icon="h-icon-export" @click="onExport">
          导出
        </el-button>
        <div class="chart-wrap">
          <div class="chart">
            <div class="chart-title">告警类型分布</div>
            <div id="pie-chart" class="chart-container"></div>
          </div>
          <div class="chart">
            <div class="chart-title">告警统计趋势图（日）</div>
            <div id="line-chart" class="chart-container"></div>
          </div>
        </div>
      </h-layout-header>
      <h-layout-content>
        <h-paged-table
          ref="table"
          class="statistics-page-table"
          :data="json => json.data.list"
          :total="json => json.data.total"
          :fetch="tableFetch"
          :page-size="pageSize"
          style="height:100%;"
          :loading.sync="loading"
          @fetch-success="fetchSuccess"
        >
          <el-table slot-scope="props" :data="props.data" force-scroll>
            <el-table-column label="序号" width="80">
              <template slot-scope="scope">
                {{ getIndex(scope.$index) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="vehicleLicensePlate"
              label="车牌号"
              width="150"
            ></el-table-column>
            <el-table-column prop="orgName" label="所属企业"></el-table-column>
            <el-table-column
              prop="beginTime"
              label="开始时间"
            ></el-table-column>
            <el-table-column prop="endTime" label="结束时间"></el-table-column>
            <el-table-column
              prop="mileageBroke"
              label="不连续里程"
            ></el-table-column>
            <el-table-column
              prop="mileageTotal"
              label="总公里数"
            ></el-table-column>
            <el-table-column
              prop="integrityRate"
              label="轨迹完整率"
            ></el-table-column>
            <el-table-column label="操作" width="80">
              <template slot-scope="scope">
                <el-button type="link" @click="onView(scope.row)">
                  查看
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </h-paged-table>
      </h-layout-content>
    </h-layout>
    <el-dialog
      title="数据分析"
      :visible.sync="dialogVisible"
      :area="1135"
      top="middle"
    >
      <el-button type="iconButton" icon="h-icon-export">
        导出
      </el-button>
      <h-paged-table
        ref="detailTable"
        class="statistics-page-table"
        :data="json => json.data.list"
        :total="json => json.data.total"
        :fetch="fetchDetail"
        :page-size="detailPageSize"
        style="height:540px;"
        @fetch-success="detailFetchSuccess"
      >
        <el-table slot-scope="props" :data="props.data" force-scroll>
          <el-table-column label="序号" width="80">
            <template slot-scope="scope">
              {{ getDetailIndex(scope.$index) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="vehicleLicensePlate"
            label="车牌号"
            width="120"
          ></el-table-column>
          <el-table-column
            prop="mileageBroke"
            label="不连续里程(公里)"
          ></el-table-column>
          <el-table-column label="起点GPS时间">
            <template slot-scope="scope">
              {{ scope.row.beginTime | formateDateTime }}
            </template>
          </el-table-column>
          <el-table-column
            prop="beginSpeed"
            label="起点GPS速度（公里/小时）"
          ></el-table-column>
          <el-table-column label="起点GPS速度（公里/小时）">
            <template slot-scope="scope">
              {{ scope.row.endTime | formateDateTime }}
            </template>
          </el-table-column>
          <el-table-column
            prop="endSpeed"
            label="终点GPS速度（公里/小时）"
          ></el-table-column>
        </el-table>
      </h-paged-table>
    </el-dialog>
    <el-dialog
      title="导出"
      :visible.sync="exportDialogVisibel"
      :area="480"
      top="middle"
      class="export-dialog"
    >
      <div>
        从第
        <el-input-number v-model="exportStartPage" :min="1"></el-input-number>
        页
      </div>
      <div style="margin:0 10px;">到</div>
      <div>
        第
        <el-input-number
          v-model="exportEndPage"
          :min="50"
          :max="100"
        ></el-input-number>
        页
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogVisible = false">
          确 定
        </el-button>
        <el-button @click="exportDialogVisibel = false">取 消</el-button>
      </span>
    </el-dialog>
  </h-layout>
</template>

<script>
import VehicleTree from '@/components/Tree';
import {
  queryGpsIntegrityRate,
  pageIntegrityRateDetailQuery
} from '@/api/statistics';
import { toTimezoneString } from '@/components/util.js';
import echarts from 'echarts';

export default {
  name: 'ActiveSecurityStatistics',
  components: {
    VehicleTree
  },
  data() {
    return {
      pageNo: 1,
      pageSize: 30,
      detailPageNo: 1,
      detailPageSize: 30,
      loading: false,
      shouldSearch: false,
      dialogVisible: false,
      exportDialogVisibel: false,
      exportStartPage: 1,
      exportEndPage: 1,
      searchCondition: {
        indexCodes: [],
        date: ''
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now() - 24 * 60 * 60 * 1000;
        }
      }
    };
  },
  mounted() {
    const pieOptions = {
      series: [
        {
          type: 'pie',
          radius: [50, 120],
          center: ['50%', '50%'],
          color: ['#4FDB5D', '#FFD138', '#31DDE0', '#489DF7'],
          roseType: 'area',
          clockwise: false,
          label: {
            formatter: '{b}\n{c}({d}%)',
            color: '#000'
          },
          data: [
            { value: 10, name: '疲劳驾驶' },
            { value: 5, name: '车距过近' },
            { value: 15, name: '分神驾驶' },
            { value: 25, name: '接打电话' }
          ]
        }
      ]
    };
    this.pieChart = echarts.init(document.getElementById('pie-chart'));
    this.pieChart.setOption(pieOptions, true);
    const lineOptions = {
      grid: {
        top: '5%',
        left: '0%',
        right: '5%',
        bottom: '5%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: '#e0e0e0'
          }
        },
        axisLabel: {
          color: '#333'
        },
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        }
      },
      series: [
        {
          data: [820, 932, 901, 934, 1290, 1330, 1320],
          type: 'line',
          tooltip: {
            formatter: '{a} {b} {c} {d}'
          },
          lineStyle: {
            normal: {
              color: '#2080F7'
            }
          },
          symbolSize: 5,
          itemStyle: {
            color: '#6c50f3',
            borderColor: '#2080F7',
            borderWidth: 1
          },
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(
                0,
                0,
                0,
                1,
                [
                  {
                    offset: 0,
                    color: 'rgba(32,128,247,0.48)'
                  },
                  {
                    offset: 1,
                    color: 'rgba(32,128,247,0)'
                  }
                ],
                false
              )
            }
          }
        }
      ]
    };
    this.lineChart = echarts.init(document.getElementById('line-chart'));
    this.lineChart.setOption(lineOptions, true);
    window.addEventListener('resize', this.resize);
  },
  destroyed() {
    window.removeEventListener('resize', this.resize);
  },
  methods: {
    onSearch() {
      if (this.searchCondition.indexCodes.length === 0) {
        this.$message.warning('请选择车辆');
        return;
      }
      if (!this.searchCondition.date) {
        this.$message.warning('请选择日期');
        return;
      }
      this.shouldSearch = true;
      this.$refs.table.reload();
    },
    tableFetch(url, perPage, page) {
      if (!this.shouldSearch) {
        return Promise.resolve();
      }
      const params = {
        beginTime: toTimezoneString(this.searchCondition.date),
        endTime: toTimezoneString(
          this.searchCondition.date.getTime() + 24 * 60 * 60 * 1000 - 1
        ),
        pageNo: page,
        pageSize: perPage,
        exactCondition: {
          vehicleIndexCodes: this.searchCondition.indexCodes
        }
      };
      return queryGpsIntegrityRate(params);
    },
    fetchDetail(url, perPage, page) {
      if (!this.shouldSearchDetail) {
        return Promise.resolve();
      }
      const beginTime = new Date(
        new Date(this.trackData.beginTime).setHours(0)
      );
      const params = {
        beginTime: toTimezoneString(beginTime),
        endTime: toTimezoneString(
          beginTime.getTime() + 24 * 60 * 60 * 1000 - 1
        ),
        pageNo: page,
        pageSize: perPage,
        vehicleIndexCode: this.trackData.vehicleIndexCode
      };
      return pageIntegrityRateDetailQuery(params);
    },
    getSelectedNodes(node) {
      this.searchCondition.indexCodes = node.map(item => item.id);
    },
    getIndex(index) {
      return (this.pageNo - 1) * this.pageSize + index + 1;
    },
    getDetailIndex(index) {
      return (this.detailPageNo - 1) * this.detailPageSize + index + 1;
    },
    fetchSuccess(json) {
      if (json.code === '0') {
        this.pageNo = json.data.pageNo;
        this.pageSize = json.data.pageSize;
      }
    },
    detailFetchSuccess(json) {
      if (json.code === '0') {
        this.detailPageNo = json.data.pageNo;
        this.detailPageSize = json.data.pageSize;
      }
    },
    onView(data) {
      this.dialogVisible = true;
      this.trackData = data;
      this.$nextTick(() => {
        this.shouldSearchDetail = true;
        this.$refs.detailTable.reload();
      });
    },
    onExport() {
      this.exportDialogVisibel = true;
    },
    resize() {
      if (this.pieChart) {
        this.pieChart.resize();
      }
      if (this.lineChart) {
        this.lineChart.resize();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.export-dialog::v-deep {
  .el-dialog__body-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
  }
  .el-input-number {
    margin: 0 6px;
  }
}

.chart-wrap {
  display: flex;
  margin-bottom: 10px;
}

.chart {
  display: flex;
  flex-direction: column;
  height: 326px;
  flex: 1;
  padding: 10px 0 10px 14px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.chart-title {
  font-size: 16px;
  line-height: 24px;
  color: rgba(0, 0, 0, 0.9);
}

.chart-container {
  flex: 1;
}

.chart:first-child {
  margin-right: 20px;
}
</style>
