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
        <template v-if="activeTab === 'summary'">
          <template slot="time">
            <el-form label-position="top">
              <el-form-item label="时间" required style="margin-bottom:0">
                <el-date-picker
                  v-model="searchCondition.date"
                  :picker-options="pickerOptions"
                  type="daterange"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
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
        </template>
        <template v-else-if="activeTab === 'month'">
          <template slot="time">
            <el-form label-position="top">
              <el-form-item label="时间" required style="margin-bottom:0">
                <el-date-picker
                  v-model="searchCondition.month"
                  :picker-options="monthPickerOptions"
                  type="month"
                  placeholder="选择月份"
                />
              </el-form-item>
            </el-form>
          </template>
          <template slot="btns">
            <el-button
              type="primary"
              style="width: 100%; max-width: 100%;"
              :loading="monthLoading"
              @click="onSearch"
            >
              查询
            </el-button>
          </template>
        </template>
        <template v-else-if="activeTab === 'day'">
          <template slot="time">
            <el-form label-position="top">
              <el-form-item label="时间" required style="margin-bottom:0">
                <el-date-picker
                  v-model="searchCondition.dayDate"
                  :picker-options="pickerOptions"
                  type="date"
                  placeholder="选择日期"
                />
              </el-form-item>
            </el-form>
          </template>
          <template slot="btns">
            <el-button
              type="primary"
              style="width: 100%; max-width: 100%;"
              :loading="dayLoading"
              @click="onSearch"
            >
              查询
            </el-button>
          </template>
        </template>
      </vehicle-tree>
    </h-layout-aside>
    <h-layout class="right-bar">
      <h-layout-content>
        <el-tabs
          v-model="activeTab"
          class="statistics-tab"
          @tab-click="onTabClick"
        >
          <el-tab-pane label="汇总表" name="summary">
            <h-layout>
              <h-layout-header>
                <el-button
                  type="iconButton"
                  icon="h-icon-export"
                  @click="onOpenExport"
                >
                  导出
                </el-button>
                <div class="statistics-chart-wrap">
                  <div class="chart">
                    <div class="chart-title">告警分类统计</div>
                    <div id="summary-pie-chart" class="chart-container"></div>
                  </div>
                  <div class="chart">
                    <div class="chart-title">告警统计（汇总）</div>
                    <div id="summary-bar-chart" class="chart-container"></div>
                  </div>
                </div>
                <el-button
                  type="iconButton"
                  icon="h-icon-menu"
                  @click="onOpenAlarmTypes"
                >
                  选择报警类型
                </el-button>
              </h-layout-header>
              <h-layout-content style="overflow: auto;">
                <h-paged-table
                  ref="table"
                  class="statistics-page-table"
                  :data="json => json.data.list"
                  :total="json => json.data.total"
                  :fetch="tableFetch"
                  :page-size="pageSize"
                  :current-page="pageNo"
                  style="height:100%;"
                  :loading.sync="loading"
                  @fetch-success="fetchSuccess"
                >
                  <el-table
                    slot-scope="props"
                    v-loading="loading"
                    :data="props.data"
                    force-scroll
                  >
                    <el-table-column label="序号" width="80">
                      <template slot-scope="scope">
                        {{ getIndex(scope.$index) }}
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="orgName"
                      label="所属单位"
                    ></el-table-column>
                    <el-table-column
                      prop="vehicleLicensePlate"
                      label="车牌号"
                      width="140"
                    ></el-table-column>
                    <el-table-column
                      v-for="item in showAlarmTypes"
                      :key="item.key"
                      :label="item.label"
                      width="120"
                    >
                      <template slot-scope="scope">
                        <el-button
                          v-if="
                            scope.row.alarmCountDtoMap &&
                              scope.row.alarmCountDtoMap[item.key]
                          "
                          type="link"
                          @click="onView(scope.row, item.key)"
                        >
                          {{ scope.row.alarmCountDtoMap[item.key].alarmNum }}
                        </el-button>
                        <span v-else>-</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </h-paged-table>
              </h-layout-content>
            </h-layout>
          </el-tab-pane>
          <el-tab-pane label="月报表" name="month">
            <h-layout>
              <h-layout-header>
                <el-button
                  type="iconButton"
                  icon="h-icon-export"
                  @click="onOpenExport"
                >
                  导出
                </el-button>
                <div class="statistics-chart-wrap">
                  <div class="chart">
                    <div class="chart-title">告警分类统计</div>
                    <div id="month-pie-chart" class="chart-container"></div>
                  </div>
                  <div class="chart">
                    <div class="chart-title">告警统计趋势图</div>
                    <div id="month-line-chart" class="chart-container"></div>
                  </div>
                </div>
                <el-button
                  type="iconButton"
                  icon="h-icon-menu"
                  @click="onOpenAlarmTypes"
                >
                  选择报警类型
                </el-button>
              </h-layout-header>
              <h-layout-content style="overflow: auto;">
                <h-paged-table
                  ref="monthTable"
                  class="statistics-page-table"
                  :data="json => json.data.list"
                  :total="json => json.data.total"
                  :fetch="tableFetch"
                  :page-size="monthPageSize"
                  :current-page="monthPageNo"
                  style="height:100%;"
                  :loading.sync="monthLoading"
                  @fetch-success="fetchMonthDataSuccess"
                >
                  <el-table
                    slot-scope="props"
                    v-loading="monthLoading"
                    :data="props.data"
                    force-scroll
                  >
                    <el-table-column label="序号" width="80">
                      <template slot-scope="scope">
                        {{ getIndex(scope.$index) }}
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="orgName"
                      label="所属单位"
                    ></el-table-column>
                    <el-table-column
                      prop="vehicleLicensePlate"
                      label="车牌号"
                      width="140"
                    ></el-table-column>
                    <el-table-column
                      v-for="item in showAlarmTypes"
                      :key="item.key"
                      :label="item.label"
                      width="120"
                    >
                      <template slot-scope="scope">
                        <el-button
                          v-if="
                            scope.row.alarmCountDtoMap &&
                              scope.row.alarmCountDtoMap[item.key]
                          "
                          type="link"
                          @click="onView(scope.row, item.key)"
                        >
                          {{ scope.row.alarmCountDtoMap[item.key].alarmNum }}
                        </el-button>
                        <span v-else>-</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </h-paged-table>
              </h-layout-content>
            </h-layout>
          </el-tab-pane>
          <el-tab-pane label="日报表" name="day">
            <h-layout>
              <h-layout-header>
                <el-button
                  type="iconButton"
                  icon="h-icon-export"
                  @click="onOpenExport"
                >
                  导出
                </el-button>
                <div class="statistics-chart-wrap">
                  <div class="chart">
                    <div class="chart-title">告警分类统计</div>
                    <div id="day-pie-chart" class="chart-container"></div>
                  </div>
                  <div class="chart">
                    <div class="chart-title">告警统计</div>
                    <div id="day-bar-chart" class="chart-container"></div>
                  </div>
                </div>
                <el-button
                  type="iconButton"
                  icon="h-icon-menu"
                  @click="onOpenAlarmTypes"
                >
                  选择报警类型
                </el-button>
              </h-layout-header>
              <h-layout-content style="overflow: auto;">
                <h-paged-table
                  ref="dayDataTable"
                  class="statistics-page-table"
                  :data="json => json.data.list"
                  :total="json => json.data.total"
                  :fetch="tableFetch"
                  :page-size="dayPageSize"
                  :current-page="dayPageNo"
                  style="height:100%;"
                  :loading.sync="dayLoading"
                  @fetch-success="fetchDayDataSuccess"
                >
                  <el-table
                    slot-scope="props"
                    v-loading="dayLoading"
                    :data="props.data"
                    force-scroll
                  >
                    <el-table-column label="序号" width="80">
                      <template slot-scope="scope">
                        {{ getDayIndex(scope.$index) }}
                      </template>
                    </el-table-column>
                    <el-table-column
                      prop="orgName"
                      label="所属单位"
                    ></el-table-column>
                    <el-table-column
                      prop="vehicleLicensePlate"
                      label="车牌号"
                      width="140"
                    ></el-table-column>
                    <el-table-column
                      v-for="item in showAlarmTypes"
                      :key="item.key"
                      :label="item.label"
                      width="120"
                    >
                      <template slot-scope="scope">
                        <el-button
                          v-if="
                            scope.row.alarmCountDtoMap &&
                              scope.row.alarmCountDtoMap[item.key]
                          "
                          type="link"
                          @click="onView(scope.row, item.key)"
                        >
                          {{ scope.row.alarmCountDtoMap[item.key].alarmNum }}
                        </el-button>
                        <span v-else>-</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </h-paged-table>
              </h-layout-content>
            </h-layout>
          </el-tab-pane>
        </el-tabs>
      </h-layout-content>
    </h-layout>
    <el-dialog
      title="告警详情"
      :visible.sync="dialogVisible"
      :area="1135"
      top="middle"
    >
      <div id="track-map" style="height: 326px;"></div>
      <el-button
        type="iconButton"
        icon="h-icon-export"
        @click="onOpenExportDetail"
      >
        导出
      </el-button>
      <h-paged-table
        ref="detailTable"
        class="statistics-page-table"
        :data="json => json.data.list"
        :total="json => json.data.total"
        :fetch="fetchDetail"
        :page-size="detailPageSize"
        :current-page="detailPageNo"
        style="height:280px;"
        @fetch-success="detailFetchSuccess"
      >
        <el-table slot-scope="props" :data="props.data" force-scroll>
          <el-table-column label="序号" width="80">
            <template slot-scope="scope">
              {{ getDetailIndex(scope.$index) }}
            </template>
          </el-table-column>
          <el-table-column prop="orgName" label="所属单位"></el-table-column>
          <el-table-column
            prop="vehicleLicensePlate"
            label="车牌号"
            width="120"
          ></el-table-column>
          <el-table-column label="持续时间" width="140">
            <template slot-scope="scope">
              {{ formatDuration(scope.row) }}
            </template>
          </el-table-column>
          <el-table-column label="告警车速">
            <template slot-scope="scope">
              {{ scope.row.averageSpeed | formatSpeed }}
            </template>
          </el-table-column>
          <el-table-column label="违规开始车速">
            <template slot-scope="scope">
              {{ scope.row.beginSpeed | formatSpeed }}
            </template>
          </el-table-column>
          <el-table-column label="违规结束车速">
            <template slot-scope="scope">
              {{ scope.row.endSpeed | formatSpeed }}
            </template>
          </el-table-column>
          <el-table-column label="违规照片">
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.picNum > 0"
                type="link"
                @click="viweAlarmPic(scope.row)"
              >
                查看照片
              </el-button>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="link" @click="viweTrack(scope.row)">
                查看轨迹
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </h-paged-table>
    </el-dialog>
    <el-dialog
      title="导出"
      :visible.sync="exportDialogVisible"
      :area="480"
      top="middle"
      class="export-dialog"
    >
      <div>
        从第
        <el-input-number
          v-model="exportStartPage"
          :min="1"
          :max="maxExportPage"
        ></el-input-number>
        页
      </div>
      <div style="margin:0 10px;">到</div>
      <div>
        第
        <el-input-number
          v-model="exportEndPage"
          :min="1"
          :max="maxExportPage"
        ></el-input-number>
        页
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onExport">
          确 定
        </el-button>
        <el-button @click="exportDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="导出"
      :visible.sync="detailExportDialogVisible"
      :area="480"
      top="middle"
      class="export-dialog"
    >
      <div>
        从第
        <el-input-number
          v-model="detailExportStartPage"
          :min="1"
          :max="detailMaxExportPage"
        ></el-input-number>
        页
      </div>
      <div style="margin:0 10px;">到</div>
      <div>
        第
        <el-input-number
          v-model="detailExportEndPage"
          :min="1"
          :max="detailMaxExportPage"
        ></el-input-number>
        页
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onExportDetail">
          确 定
        </el-button>
        <el-button @click="detailExportDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="选择报警类型"
      :visible.sync="alarmTypeDialogVisible"
      top="middle"
      :area="784"
    >
      <el-transfer
        v-model="transferAlarmTypes"
        class="statistics-transfer"
        :footer-format="false"
        :titles="['未选择报警类型', '已选择报警类型']"
        :data="alarmTypes"
      ></el-transfer>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onChooseAlarmTypes">
          确 定
        </el-button>
        <el-button @click="alarmTypeDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <h-img-preview :data="alarmPics" :visible.sync="showAlarmPics" />
  </h-layout>
</template>

<script>
import VehicleTree from '@/components/Tree';
import {
  pageAlarmCount,
  getVehicleAlarmCount,
  getMonthAlarmCount
} from '@/api/statistics';
import { findAlarmPage } from '@/api/alarm';
import { toTimezoneString } from '@/components/util.js';
import { downloadExcel } from '@/core/httpInstance';
import echarts from 'echarts';
import { initMap, clearMap } from '@/pages/statistics/map.js';
import statisticsMixin from '@/pages/statistics/statisticsMixin';

export default {
  // 违规统计
  name: 'Violations',
  components: {
    VehicleTree
  },
  mixins: [statisticsMixin],
  props: {
    type: {
      type: String,
      default: '1' // 违规统计
    },
    alarmTypes: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      pageNo: 1,
      pageSize: 30,
      detailPageNo: 1,
      detailPageSize: 30,
      total: 0,
      detailTotal: 0,
      loading: false,
      shouldSearch: false,
      dayPageNo: 1,
      dayPageSize: 30,
      dayTotal: 0,
      dayLoading: false,
      monthPageNo: 1,
      monthPageSize: 30,
      monthTotal: 0,
      monthLoading: false,
      dialogVisible: false,
      exportDialogVisible: false,
      exportStartPage: 1,
      exportEndPage: 1,
      maxExportPage: 1,
      detailExportStartPage: 1,
      detailExportEndPage: 1,
      detailMaxExportPage: 1,
      detailExportDialogVisible: false,
      searchCondition: {
        indexCodes: [],
        date: [],
        month: null,
        dayDate: null
      },
      activeTab: 'summary',
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now() - 24 * 60 * 60 * 1000;
        },
        customValidation(start, end) {
          return end.getTime() - start.getTime() < 31 * 24 * 60 * 60 * 1000;
        },
        customPrompt: '选择时间范围不能超过31天'
      },
      monthPickerOptions: {
        disabledDate(time) {
          const now = new Date();
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          return time.getTime() >= nextMonth.getTime();
        }
      },
      alarmTypeDialogVisible: false,
      choosedAlarmTypes: [],
      transferAlarmTypes: [],
      alarmPics: [],
      showAlarmPics: false
    };
  },
  computed: {
    showAlarmTypes() {
      return this.alarmTypes.filter(item =>
        this.choosedAlarmTypes.includes(item.key)
      );
    }
  },
  watch: {
    activeTab(value) {
      this.$nextTick(() => {
        if (value === 'month') {
          if (!this.monthPieChart) {
            this.monthPieChart = echarts.init(
              document.getElementById('month-pie-chart')
            );
            this.monthLineChart = echarts.init(
              document.getElementById('month-line-chart')
            );
          }
        } else if (value === 'day') {
          if (!this.dayPieChart) {
            this.dayPieChart = echarts.init(
              document.getElementById('day-pie-chart')
            );
            this.dayBarChart = echarts.init(
              document.getElementById('day-bar-chart')
            );
          }
        }
      });
    }
  },
  mounted() {
    this.choosedAlarmTypes = this.alarmTypes.map(item => item.key);
    this.summaryPieChart = echarts.init(
      document.getElementById('summary-pie-chart')
    );
    this.summaryBarChart = echarts.init(
      document.getElementById('summary-bar-chart')
    );
  },
  destroyed() {
    if (this.trackMap) {
      clearMap();
    }
  },
  methods: {
    checkParams() {
      if (this.searchCondition.indexCodes.length === 0) {
        this.$message.warning('请选择车辆');
        return false;
      }
      if (this.activeTab === 'summary') {
        if (
          !this.searchCondition.date ||
          this.searchCondition.date.length === 0
        ) {
          this.$message.warning('请选择日期');
          return false;
        }
        if (
          this.searchCondition.date[1].getTime() -
            this.searchCondition.date[0].getTime() >=
          30 * 24 * 60 * 60 * 1000
        ) {
          this.$message.warning('开始日期和结束日期间隔不能超过30天');
          return false;
        }
      } else if (this.activeTab === 'day') {
        if (!this.searchCondition.dayDate) {
          this.$message.warning('请选择日期');
          return false;
        }
      } else if (this.activeTab === 'month') {
        if (!this.searchCondition.month) {
          this.$message.warning('请选择月份');
          return false;
        }
      }
      return true;
    },
    getParams() {
      const params = {
        vehicleIndexCodes: this.searchCondition.indexCodes,
        type: this.type
      };
      if (this.activeTab === 'summary') {
        params.beginTime = toTimezoneString(this.searchCondition.date[0]);
        params.endTime = toTimezoneString(
          this.searchCondition.date[1].getTime() + 24 * 60 * 60 * 1000 - 1
        );
      } else if (this.activeTab === 'day') {
        params.beginTime = toTimezoneString(this.searchCondition.dayDate);
        params.endTime = toTimezoneString(
          this.searchCondition.dayDate.getTime() + 24 * 60 * 60 * 1000 - 1
        );
      } else if (this.activeTab === 'month') {
        params.beginTime = toTimezoneString(this.searchCondition.month);
        const endTime = new Date(
          new Date(
            this.searchCondition.month.getFullYear(),
            this.searchCondition.month.getMonth() + 1,
            1
          ).getTime() - 1
        );
        params.endTime = toTimezoneString(endTime);
      }
      return params;
    },
    onSearch() {
      if (!this.checkParams()) {
        return;
      }
      if (this.activeTab === 'summary') {
        this.shouldSearch = true;
        this.loadSummaryChart(this.activeTab);
        if (this.pageNo === 1) {
          this.$refs.table.reload();
        } else {
          this.pageNo = 1;
        }
      } else if (this.activeTab === 'month') {
        this.shouldSearchMonthData = true;
        this.loadSummaryChart(this.activeTab);
        this.loadMonthChart();
        if (this.monthPageNo === 1) {
          this.$refs.monthTable.reload();
        } else {
          this.monthPageNo = 1;
        }
      } else if (this.activeTab === 'day') {
        this.shouldSearchDayData = true;
        this.loadSummaryChart(this.activeTab);
        if (this.dayPageNo === 1) {
          this.$refs.dayDataTable.reload();
        } else {
          this.dayPageNo = 1;
        }
      }
    },
    loadMonthChart() {
      const params = this.getParams();
      getMonthAlarmCount(params).then(json => {
        if (json.code === '0') {
          const days = [
            ...new Set(json.data.map(item => item.beginTime))
          ].sort();
          const series = [];
          const colors = ['#4FDB5D', '#FFD138', '#31DDE0', '#489DF7'];
          const areaColors = [
            ['rgba(79,219,93,0.48)', 'rgba(255,209,56,0)'],
            ['rgba(255,209,56,0.48)', 'rgba(255,209,56,0)'],
            ['rgba(49,221,224,0.48)', 'rgba(49,221,224,0)'],
            ['rgba(72,157,247,0.48)', 'rgba(72,157,247,0)']
          ];
          let i = 0;
          this.alarmTypes.forEach(type => {
            const datas = [];
            days.forEach(day => {
              const data = json.data.find(
                item =>
                  item.beginTime.endsWith(day) && item.eventType === type.key
              );
              if (data) {
                datas.push(data.alarmCount);
              } else {
                datas.push(0);
              }
            });
            series.push({
              name: type.label,
              data: datas,
              type: 'line',
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: areaColors[i % areaColors.length][0] // 0% 处的颜色
                    },
                    {
                      offset: 1,
                      color: areaColors[i % areaColors.length][1] // 100% 处的颜色
                    }
                  ]
                }
              }
            });
            i++;
          });
          const option = {
            grid: {
              left: '0%',
              right: '4%',
              top: '3%',
              bottom: '3%',
              containLabel: true
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: days.map(day => day.substring(5)),
              axisLine: {
                lineStyle: {
                  color: '#ccc'
                }
              }
            },
            yAxis: {
              type: 'value',
              axisTick: {
                show: false
              },
              axisLine: {
                show: false
              },
              splitLine: {
                lineStyle: {
                  type: 'dash'
                }
              }
            },
            color: colors,
            tooltip: {
              formatter: '{a} {b}: {c}'
            },
            series
          };
          this.monthLineChart.setOption(option, true);
        }
      });
    },
    loadSummaryChart(tab) {
      const params = this.getParams();
      getVehicleAlarmCount(params).then(json => {
        if (json.code === '0') {
          const options = this.getPieOptions();
          const data = [];
          Object.keys(json.data.typeCountDtoMap).forEach(key => {
            data.push({
              value: json.data.typeCountDtoMap[key].alarmNum,
              name: json.data.typeCountDtoMap[key].eventTypeName
            });
          });
          options.series[0].data = data;
          // options.legend.data = data.map(item => item.name);
          const barOptions = this.getBarOptions();
          const categoryData = [];
          const seriesData = [];
          Object.keys(json.data.countDtoMap).forEach(key => {
            categoryData.push(json.data.countDtoMap[key].name);
            seriesData.push(json.data.countDtoMap[key].alarmCountNum);
          });
          barOptions.yAxis.data = categoryData;
          barOptions.series[0].data = seriesData;
          if (seriesData.length !== 0) {
            barOptions.dataZoom[0].end = Math.min(
              100,
              Math.floor((7 / seriesData.length) * 100)
            );
          }
          if (tab === 'summary') {
            this.summaryPieChart.setOption(options, true);
            this.summaryBarChart.setOption(barOptions, true);
          } else if (tab === 'day') {
            this.dayPieChart.setOption(options, true);
            this.dayBarChart.setOption(barOptions, true);
          } else if (tab === 'month') {
            this.monthPieChart.setOption(options, true);
          }
        }
      });
    },
    tableFetch(url, perPage, page) {
      if (this.activeTab === 'summary' && !this.shouldSearch) {
        return Promise.resolve();
      }
      if (this.activeTab === 'day' && !this.shouldSearchDayData) {
        return Promise.resolve();
      }
      if (this.activeTab === 'month' && !this.shouldSearchMonthData) {
        return Promise.resolve();
      }
      const params = {
        ...this.getParams(),
        pageNo: page,
        pageSize: perPage
      };
      if (this.activeTab === 'summary') {
        this.pageNo = page;
        this.summaryBeginTime = params.beginTime;
        this.summaryEndTime = params.endTime;
      }
      if (this.activeTab === 'day') {
        this.dayPageNo = page;
        this.dayBeginTime = params.beginTime;
        this.dayEndTime = params.endTime;
      }
      if (this.activeTab === 'month') {
        this.monthPageNo = page;
        this.monthBeginTime = params.beginTime;
        this.monthEndTime = params.endTime;
      }
      return pageAlarmCount(params);
    },
    fetchDetail(url, perPage, page) {
      if (!this.shouldSearchSummaryDetail) {
        return Promise.resolve();
      }
      let beginTime = this.summaryBeginTime;
      let endTime = this.summaryEndTime;
      if (this.activeTab === 'day') {
        beginTime = this.dayBeginTime;
        endTime = this.dayEndTime;
      } else if (this.activeTab === 'month') {
        beginTime = this.monthBeginTime;
        endTime = this.monthEndTime;
      }
      const params = {
        beginTime,
        endTime,
        eventTypes: [this.summaryDetailEventType],
        pageNo: page,
        pageSize: perPage,
        vehicleIndexCodes: [this.summaryDetailData.indexCode]
      };
      this.detailPageNo = page;
      return findAlarmPage(params);
    },
    getSelectedNodes(node) {
      this.searchCondition.indexCodes = node.map(item => item.id);
    },
    getIndex(index) {
      return (this.pageNo - 1) * this.pageSize + index + 1;
    },
    getDayIndex(index) {
      return (this.dayPageNo - 1) * this.dayPageSize + index + 1;
    },
    getDetailIndex(index) {
      return (this.detailPageNo - 1) * this.detailPageSize + index + 1;
    },
    fetchSuccess(json) {
      if (json.code === '0') {
        this.pageSize = json.data.pageSize;
        this.total = json.data.total;
      }
    },
    fetchMonthDataSuccess(json) {
      if (json.code === '0') {
        this.monthPageSize = json.data.pageSize;
        this.monthTotal = json.data.total;
      }
    },
    fetchDayDataSuccess(json) {
      if (json.code === '0') {
        this.dayPageSize = json.data.pageSize;
        this.dayTotal = json.data.total;
      }
    },
    detailFetchSuccess(json) {
      if (json.code === '0') {
        if (json.data.pageSize) {
          this.detailPageSize = json.data.pageSize;
        }
        this.detailTotal = json.data.total;
      }
    },
    onView(data, eventType) {
      this.dialogVisible = true;
      this.summaryDetailData = data;
      this.summaryDetailEventType = eventType;
      this.$nextTick(() => {
        this.shouldSearchSummaryDetail = true;
        if (this.detailPageNo === 1) {
          this.$refs.detailTable.reload();
        } else {
          this.detailPageNo = 1;
        }
        if (!this.trackMap) {
          const { map, vectorLayer, traceLayer, markerLayer } = initMap(
            'track-map'
          );
          this.trackMap = map;
          this.vectorLayer = vectorLayer;
          this.traceLayer = traceLayer;
          this.markerLayer = markerLayer;
        }
        this.traceLayer.removeAllFeatures();
        this.markerLayer.removeAllFeatures();
      });
    },
    onOpenExport() {
      if (!this.checkParams()) {
        return;
      }
      if (this.activeTab === 'summary' && this.total === 0) {
        this.$message.warning('请先查询数据再导出');
        return;
      }
      if (this.activeTab === 'month' && this.monthTotal === 0) {
        this.$message.warning('请先查询数据再导出');
        return;
      }
      if (this.activeTab === 'day' && this.dayTotal === 0) {
        this.$message.warning('请先查询数据再导出');
        return;
      }
      if (this.activeTab === 'summary') {
        this.exportStartPage = this.pageNo;
        this.exportEndPage = this.pageNo;
        this.maxExportPage = Math.floor(this.total / this.pageSize) + 1;
      } else if (this.activeTab === 'month') {
        this.exportStartPage = this.monthPageNo;
        this.exportEndPage = this.monthPageNo;
        this.maxExportPage =
          Math.floor(this.monthTotal / this.monthPageSize) + 1;
      } else if (this.activeTab === 'day') {
        this.exportStartPage = this.dayPageNo;
        this.exportEndPage = this.dayPageNo;
        this.maxExportPage = Math.floor(this.dayTotal / this.dayPageSize) + 1;
      }
      this.exportDialogVisible = true;
    },
    onExport() {
      if (this.exportStartPage > this.exportEndPage) {
        this.$message.warning('导出开始页数不能大于结束页数');
        return;
      }
      const params = this.getParams();
      params.beginPage = this.exportStartPage;
      params.endPage = this.exportEndPage;
      params.vehicleIndexCodes = this.searchCondition.indexCodes.join(',');
      if (this.activeTab === 'summary') {
        params.pageSize = this.pageSize;
      } else if (this.activeTab === 'month') {
        params.pageSize = this.monthPageSize;
      } else if (this.activeTab === 'day') {
        params.pageSize = this.dayPageSize;
      }
      downloadExcel(
        `/${process.env.VUE_APP_CONTEXT}/statistic/alarm/exportAlarmCountPage.do`,
        params
      );
      this.exportDialogVisible = false;
    },
    onOpenExportDetail() {
      if (this.detailTotal === 0) {
        this.$message.warning('没有要导出的数据');
        return;
      }
      this.detailMaxExportPage = Math.ceil(
        this.detailTotal / this.detailPageSize
      );
      this.detailExportDialogVisible = true;
    },
    onExportDetail() {
      if (this.detailExportStartPage > this.detailExportEndPage) {
        this.$message.warning('导出开始页数不能大于结束页数');
        return;
      }
      const params = this.getParams();
      params.beginPage = this.detailExportStartPage;
      params.endPage = this.detailExportEndPage;
      params.vehicleIndexCodes = this.summaryDetailData.indexCode;
      params.eventType = this.summaryDetailEventType;
      params.pageSize = this.detailPageSize;
      downloadExcel(
        `/${process.env.VUE_APP_CONTEXT}/statistic/alarm/exportVehicleAlarmPage.do`,
        params
      );
      this.detailExportDialogVisible = false;
    },
    onTabClick() {
      // console.log('tab click');
    },
    onOpenAlarmTypes() {
      this.transferAlarmTypes = this.choosedAlarmTypes;
      this.alarmTypeDialogVisible = true;
    },
    onChooseAlarmTypes() {
      this.choosedAlarmTypes = this.transferAlarmTypes;
      this.alarmTypeDialogVisible = false;
    },
    getPieOptions() {
      return {
        legend: {
          type: 'scroll',
          bottom: 0,
          left: 'center',
          data: []
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b}\n{c}({d}%)'
        },
        series: [
          {
            type: 'pie',
            radius: [50, 120],
            center: ['50%', '55%'],
            color: ['#4FDB5D', '#FFD138', '#31DDE0', '#489DF7'],
            roseType: 'area',
            clockwise: false,
            label: {
              formatter: '{b}\n{c}({d}%)',
              color: '#000'
            },
            data: []
          }
        ]
      };
    },
    getBarOptions() {
      return {
        grid: {
          left: '0%',
          right: '4%',
          top: '3%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'value',
          axisTick: {
            inside: true,
            lineStyle: {
              color: '#ccc'
            }
          },
          axisLine: {
            lineStyle: {
              color: '#ccc'
            }
          },
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'category',
          axisTick: {
            show: false
          },
          axisLine: {
            show: false
          },
          data: []
        },
        dataZoom: [
          {
            type: 'slider',
            show: true,
            yAxisIndex: [0],
            left: '93%',
            start: 0, // 数据窗口范围的起始百分比
            end: 63
          }
        ],
        tooltip: {},
        series: [
          {
            color: ['#489DF7'],
            barMaxWidth: 16,
            type: 'bar',
            data: []
          }
        ]
      };
    }
  }
};
</script>

<style src="@/pages/statistics/statistics.scss" lang="scss"></style>

<style lang="scss">
.statistics-transfer {
  width: 704px;
  margin: 0 auto;
  .el-transfer-panel {
    width: 312px;
  }
  .el-transfer-panel__body {
    height: 324px;
  }
}
</style>
