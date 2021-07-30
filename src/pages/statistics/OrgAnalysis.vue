<template>
  <h-layout class="statistics-page">
    <h-layout-aside width="280px" class="left-bar">
      <org-tree
        ref="resourceTree"
        :top="8"
        :bottom="8"
        :left="8"
        :right="8"
        :slot-line="3"
      >
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
      </org-tree>
    </h-layout-aside>
    <h-layout class="right-bar">
      <h-layout-header>
        <el-button type="iconButton" icon="h-icon-export" @click="onOpenExport">
          导出
        </el-button>
        <div class="statistics-chart-wrap">
          <div class="chart">
            <div class="chart-title">警情分类统计</div>
            <div id="pie-chart" class="chart-container"></div>
          </div>
          <div class="chart">
            <div class="chart-title">各公司警情对比</div>
            <div id="bar-chart" class="chart-container"></div>
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
              prop="orgName"
              label="组织名称"
              width="150"
            ></el-table-column>
            <el-table-column label="被扣除分数" width="120">
              <template slot-scope="scope">
                <span style="color: #F33636;">
                  {{ scope.row.score }}
                </span>
              </template>
            </el-table-column>
            <el-table-column
              prop="onlineTime"
              label="时长"
              width="120"
            ></el-table-column>
            <el-table-column
              prop="miles"
              label="里程（公里）"
              width="120"
            ></el-table-column>
            <el-table-column
              prop="total"
              label="报警事件总数"
              width="120"
            ></el-table-column>
            <el-table-column
              v-for="item in alarmTypes"
              :key="item.eventType"
              :label="item.name"
              width="120"
            >
              <template slot-scope="scope">
                <template
                  v-if="
                    scope.row.alarmCountDtoMap &&
                      scope.row.alarmCountDtoMap[item.eventType]
                  "
                >
                  <el-button
                    v-if="scope.row.alarmCountDtoMap[item.eventType].alarmNum"
                    type="link"
                    @click="onView(scope.row, item.eventType)"
                  >
                    {{ scope.row.alarmCountDtoMap[item.eventType].alarmNum }}
                  </el-button>
                  <span v-else>
                    {{ scope.row.alarmCountDtoMap[item.eventType].alarmNum }}
                  </span>
                </template>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
        </h-paged-table>
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
    <h-img-preview :data="alarmPics" :visible.sync="showAlarmPics" />
  </h-layout>
</template>

<script>
  import OrgTree from '@/components/OrgTree';
  import { findAlarmPageByOrg, getOrgAlarmCount, orgAlarmCount } from '@/api/statistics';
  import { findAlarmPics, getAllAlarmTypes } from '@/api/alarm';
  import { toTimezoneString } from '@/components/util.js';
  import echarts from 'echarts';
  import { clearMap, initMap } from '@/pages/statistics/map.js';
  import statisticsMixin from '@/pages/statistics/statisticsMixin';
  import { downloadExcel } from '@/core/httpInstance';

  export default {
  name: 'OrgAnalysis',
  components: {
    OrgTree
  },
  mixins: [statisticsMixin],
  data() {
    return {
      pageNo: 1,
      pageSize: 30,
      total: 0,
      detailPageNo: 1,
      detailPageSize: 30,
      loading: false,
      shouldSearch: false,
      dialogVisible: false,
      exportDialogVisible: false,
      exportStartPage: 1,
      exportEndPage: 1,
      maxExportPage: 1,
      searchCondition: {
        indexCodes: [],
        date: ''
      },
      alarmTypes: [],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now() - 24 * 60 * 60 * 1000;
        },
        customValidation(start, end) {
          return end.getTime() - start.getTime() < 31 * 24 * 60 * 60 * 1000;
        },
        customPrompt: '选择时间范围不能超过31天'
      },
      alarmPics: [],
      showAlarmPics: false,
      detailExportDialogVisible: false,
      detailExportStartPage: 1,
      detailExportEndPage: 1,
      detailMaxExportPage: 1
    };
  },
  created() {
    // 加载所有报警类型
    getAllAlarmTypes().then(json => {
      if (json.code === '0') {
        this.alarmTypes = json.data;
      }
    });
  },
  mounted() {
    this.pieChart = echarts.init(document.getElementById('pie-chart'));
    this.barChart = echarts.init(document.getElementById('bar-chart'));
    window.addEventListener('resize', this.resize);
  },
  destroyed() {
    window.removeEventListener('resize', this.resize);
    if (this.trackMap) {
      clearMap();
    }
  },
  methods: {
    checkParams() {
      if (this.$refs.resourceTree.getChecked().length === 0) {
        this.$message.warning('请选择组织');
        return false;
      }
      if (!this.searchCondition.date) {
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
      return true;
    },
    onSearch() {
      if (!this.checkParams()) {
        return;
      }
      this.shouldSearch = true;
      if (this.pageNo === 1) {
        this.$refs.table.reload();
      } else {
        this.pageNo = 1;
      }
      // 加载图表数据
      this.loadChart();
    },
    loadChart() {
      const orgs = this.$refs.resourceTree.getChecked().map(item => {
        return {
          indexCode: item.indexCode,
          name: item.name
        };
      });
      const params = {
        beginTime: toTimezoneString(this.searchCondition.date[0]),
        endTime: toTimezoneString(
          this.searchCondition.date[1].getTime() + 24 * 60 * 60 * 1000 - 1
        ),
        orgs: orgs
      };
      getOrgAlarmCount(params).then(json => {
        if (json.code === '0') {
          const pieOptions = this.getPieOptions();
          const barOptions = this.getBarOptions();
          const data = [];
          Object.keys(json.data.typeCountDtoMap).forEach(key => {
            data.push({
              value: json.data.typeCountDtoMap[key].alarmNum,
              name: json.data.typeCountDtoMap[key].eventTypeName
            });
          });
          pieOptions.series[0].data = data;
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
          this.pieChart.setOption(pieOptions, true);
          this.barChart.setOption(barOptions, true);
        }
      });
    },
    tableFetch(url, perPage, page) {
      if (!this.shouldSearch) {
        return Promise.resolve();
      }
      const indexCodes = this.$refs.resourceTree
        .getChecked()
        .map(item => item.indexCode);
      const params = {
        beginTime: toTimezoneString(this.searchCondition.date[0]),
        endTime: toTimezoneString(
          this.searchCondition.date[1].getTime() + 24 * 60 * 60 * 1000 - 1
        ),
        pageNo: page,
        pageSize: perPage,
        inCondition: {
          orgIndexCode: indexCodes
        }
      };
      this.pageNo = page;
      return orgAlarmCount(params);
    },
    fetchDetail(url, perPage, page) {
      if (!this.shouldSearchSummaryDetail) {
        return Promise.resolve();
      }
      const params = {
        beginTime: toTimezoneString(this.searchCondition.date[0]),
        endTime: toTimezoneString(
          this.searchCondition.date[1].getTime() + 24 * 60 * 60 * 1000 - 1
        ),
        eventTypes: [this.summaryDetailEventType],
        pageNo: page,
        pageSize: perPage,
        orgs: [{ indexCode: this.summaryDetailData.orgIndexCode }]
      };
      this.detailPageNo = page;

      return findAlarmPageByOrg(params);
    },
    // 查看报警详情
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
    getIndex(index) {
      return (this.pageNo - 1) * this.pageSize + index + 1;
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
    detailFetchSuccess(json) {
      if (json.code === '0') {
        if (json.data.pageSize) {
          this.detailPageSize = json.data.pageSize;
        }
        this.detailTotal = json.data.total;
      }
    },
    onOpenExport() {
      if (!this.checkParams()) {
        return;
      }
      if (this.total === 0) {
        this.$message.warning('请先查询数据再导出');
        return;
      }
      this.exportStartPage = this.pageNo;
      this.exportEndPage = this.pageNo;
      this.maxExportPage = Math.floor(this.total / this.pageSize) + 1;
      this.exportDialogVisible = true;
    },
    onExport() {
      const indexCodes = this.$refs.resourceTree
        .getChecked()
        .map(item => item.indexCode);
      const params = {
        beginTime: toTimezoneString(this.searchCondition.date[0]),
        endTime: toTimezoneString(
          this.searchCondition.date[1].getTime() + 24 * 60 * 60 * 1000 - 1
        ),
        pageSize: this.pageSize,
        orgIndexCodes: indexCodes,
        beginPage: this.exportStartPage,
        endPage: this.exportEndPage
      };
      downloadExcel(
        `/${process.env.VUE_APP_CONTEXT}/statistic/alarm/exportOrgAlarmCountPage.do`,
        params
      );
      this.exportDialogVisible = false;
    },
    resize() {
      if (this.pieChart) {
        this.pieChart.resize();
      }
      if (this.lineChart) {
        this.lineChart.resize();
      }
    },
    getPieOptions() {
      return {
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
    },
    viweAlarmPic(alarm) {
      findAlarmPics({
        alarmId: alarm.alarmId,
        alarmTime: toTimezoneString(alarm.beginTime),
        netDomainId: this.$store.state.userInfo.domainId
      }).then(json => {
        if (json.code === '0') {
          if (json.data.length > 0) {
            this.alarmPics = json.data.map(item => item.url);
            this.showAlarmPics = true;
          } else {
            this.$message({
              type: 'warning',
              message: '无相关违规照片'
            });
          }
        }
      });
    },
    onOpenExportDetail() {
      if (this.detailTotal === 0) {
        this.$message.warning('没有要导出的数据');
        return;
      }
      this.detailMaxExportPage = Math.ceil(
        this.detailTotal / this.detailPageSize
      );
      this.detailExportStartPage = this.detailPageNo;
      this.detailExportEndPage = this.detailPageNo;
      this.detailExportDialogVisible = true;
    },
    onExportDetail() {
      const params = {
        beginTime: toTimezoneString(this.searchCondition.date[0]),
        endTime: toTimezoneString(
          this.searchCondition.date[1].getTime() + 24 * 60 * 60 * 1000 - 1
        ),
        eventType: this.summaryDetailEventType,
        pageSize: this.detailPageSize,
        orgIndexCode: this.summaryDetailData.orgIndexCode,
        beginPage: this.detailExportStartPage,
        endPage: this.detailExportEndPage
      };
      downloadExcel(
        `/${process.env.VUE_APP_CONTEXT}/statistic/alarm/exportOrgAlarmPage.do`,
        params
      );
      this.detailExportDialogVisible = false;
    }
  }
};
</script>

<style src="@/pages/statistics/statistics.scss" lang="scss"></style>
