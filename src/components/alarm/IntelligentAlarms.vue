<template>
  <h-page-container>
    <h-layout>
      <div ref="tabref" class="alarm-tabs">
        <el-form
          v-if="!isRealtime"
          ref="searchForm"
          :inline="true"
          label-position="top"
          content-width="240px"
          class="search-form"
        >
          <div class="form-item-wrap">
            <el-form-item label="车辆选择">
              <drop-down-tree
                ref="dropdownTree"
                tree-type="3"
                :is-need-filter="true"
                @input="getVehicle"
              ></drop-down-tree>
            </el-form-item>
            <el-form-item label="选择时间">
              <el-date-picker
                v-model="form.dateRange"
                type="datetimerange"
                :default-time="['00:00:00', '23:59:59']"
                value-format="timestamp"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                :picker-options="form.datePickerOptions"
              />
            </el-form-item>
            <el-form-item label="审核状态">
              <el-select v-model="form.approveStatus" clear>
                <el-option
                  v-for="item in approveOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </div>
          <div class="btn-wrap">
            <el-button type="primary" :loading="loading" @click="onSearch">
              查询
            </el-button>
            <el-button type="primary" @click="onSearchYesterday">
              昨日报警
            </el-button>
            <el-button type="primary" @click="onExportAlarm">
              导出
            </el-button>
            <el-button @click="resetForm">重置</el-button>
          </div>
        </el-form>
        <el-tabs v-model="activeName">
          <el-tab-pane name="first">
            <tab-badge slot="label" :value="activityAlarms.length">
              主动安全
            </tab-badge>
            <alarm-level-summary
              :h-count="activityHCount"
              :m-count="activityMCount"
              :l-count="activityLCount"
              :w-count="activityWCount"
            >
              <div v-if="isRealtime" slot="left">
                <el-button
                  type="text"
                  :show-summary="false"
                  @click="onBatchDealAlarms('alarmTable')"
                >
                  <i class="h-icon-export"></i>
                  批量处理
                </el-button>
                <!-- <el-checkbox v-model="filterAutoDeal" @change="findAlarms">
                  过滤自动处警
                </el-checkbox> -->
              </div>
            </alarm-level-summary>
            <location-alarm-table
              ref="alarmTable"
              v-loading="loading"
              :alarms="activityAlarms"
              :table-height="tableHeight"
              :is-realtime="isRealtime"
              @deal-alarm="dealAlarm"
            ></location-alarm-table>
          </el-tab-pane>
          <el-tab-pane name="riskEvent">
            <tab-badge slot="label" :value="riskEvents.length">
              风险事件
            </tab-badge>
            <alarm-level-summary
              :h-count="riskHCount"
              :m-count="riskMCount"
              :l-count="riskLCount"
              :w-count="riskWCount"
            ></alarm-level-summary>
            <location-alarm-table
              v-loading="riskLoading"
              :alarms="riskEvents"
              :table-height="tableHeight"
              :is-realtime="isRealtime"
              is-risk-event
            ></location-alarm-table>
          </el-tab-pane>
          <el-tab-pane v-if="false" name="fourth">
            <tab-badge slot="label" :value="earlyMorningAlarms.length">
              凌晨禁行
            </tab-badge>
            <location-alarm-table
              v-loading="loading"
              :alarms="earlyMorningAlarms"
              :table-height="tableHeight + 44"
              :is-realtime="isRealtime"
              @row-click="clickAlarm"
            ></location-alarm-table>
          </el-tab-pane>
        </el-tabs>
        <el-pagination
          v-if="!isRealtime"
          v-show="activeName !== 'riskEvent'"
          ref="pagination"
          :page-sizes="[30, 50, 100]"
          :page-size="pageSize"
          :current-page="pageNo"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="onSizeChange"
          @current-change="onCurrentChange"
        ></el-pagination>
        <el-pagination
          v-if="!isRealtime"
          v-show="activeName === 'riskEvent'"
          :page-sizes="[30, 50, 100]"
          :page-size="riskPageSize"
          :current-page="riskPageNo"
          layout="total, sizes, prev, pager, next, jumper"
          :total="riskTotal"
          @size-change="onRiskSizeChange"
          @current-change="onRiskCurrentChange"
        ></el-pagination>
      </div>
      <div v-show="showDetail" class="alarm-multi-media-wrap">
        <alarm-multi-media
          :alarm="alarmLedger"
          :ngixinfo="ngixinfo"
          :sg="sg"
          :user-info="userInfo"
          @update-sub-alarm="onUpdateSubAlarm"
        ></alarm-multi-media>
      </div>
      <div v-show="showDetail" class="alarm-slidebar">
        <alarm-ledger
          ref="alarmLedger"
          :alarm="alarmLedger"
          :show.sync="showDetail"
          is-show-track
          @update-alarm="onUpdateAlarm"
          @update-risk="onUpdateRisk"
          @update-message-label="onUpdateMessageLabel"
        ></alarm-ledger>
      </div>
    </h-layout>
    <audit-dialog
      ref="auditDialog"
      @getAlarmDuration="getAlarmDuration"
      @refresh="refreshMergeAlarm"
    ></audit-dialog>
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
        <el-button type="primary" @click="exportAlarm">
          确 定
        </el-button>
        <el-button @click="exportDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <broadcast-dialog
      ref="BroadcastDialog"
      :vehicles="broadcastVehicles"
      :alarms="broadcastAlarms"
      @saveMessageLabelSuccess="onSaveMessageLabelSuccess"
    ></broadcast-dialog>
  </h-page-container>
</template>
<script>
import AlarmLedger from '@/components/alarm/AlarmLedger';
import AuditDialog from '@/components/alarm/AuditDialog';
import TabBadge from '@/components/TabBadge';
import AlarmLevelSummary from '@/components/AlarmLevelSummary';
import { findAlarmPage, auditLedgerQuery } from '@/api/alarm';
import basicInfoMixin from '@/mixins/basicInfoMixin.js';
import DropDownTree from '@/components/DropDownTree.vue';
import LocationAlarmTable from '@/components/alarm/LocationAlarmTable';
import { toTimezoneString } from '@/components/util.js';
import AlarmMultiMedia from '@/components/alarm/AlarmMultiMedia';
import { ALARM_INTERVAL } from '@/core/constant';
import alarmUtils from '@/utils/alarm';
import alarmTableMixin from '@/components/alarm/AlarmTableMixin.js';
import alarmMixin from '@/components/alarm/alarmMixin.js';
import BroadcastDialog from '@/components/BroadcastDialog.vue';

// 凌晨禁行
const eventTypes = [132424];
// 主动安全报警
const safeTyps = [
  132371,
  132370,
  132353,
  132354,
  132358,
  132357,
  132356,
  132355,
  132359,
  132360,
  132361,
  132362,
  225409,
  225413,
  225414,
  225415,
  225416,
  132370,
  132371,
  132374,
  132375,
  132372,
  132373,
  225300,
  225282,
  132377,
  132386,
  132384,
  132385,
  132387,
  132388,
  132389,
  132390,
  225430,
  225431,
  225288,
  225289,
  225432,
  132369,
  132376
];
const allEventTypes = [...eventTypes, ...safeTyps];

export default {
  name: 'IntelligentAlarms',
  components: {
    AlarmLedger,
    TabBadge,
    AlarmLevelSummary,
    AuditDialog,
    DropDownTree,
    LocationAlarmTable,
    AlarmMultiMedia,
    BroadcastDialog
  },
  mixins: [basicInfoMixin, alarmTableMixin, alarmMixin],
  props: {
    isRealtime: {
      type: Boolean,
      default: false
    },
    defaultApproveStatus: {
      type: String,
      default: ''
    }
  },
  data() {
    const now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);
    const endTime = now.getTime() + 24 * 60 * 60 * 1000 - 1;
    return {
      activeName: 'first',
      showDetail: false,
      isShowAlarmMultiMedia: false,
      tableHeight: null,
      alarmLedger: {},
      allAlarms: [],
      riskEvents: [],
      maxAlarms: 100,
      loading: false,
      pageSize: 30,
      pageNo: 1,
      total: 0,
      riskPageSize: 30,
      riskPageNo: 1,
      riskTotal: 0,
      riskLoading: false,
      form: {
        dateRange: null,
        approveStatus: '',
        vehicleIndexCodes: [],
        datePickerOptions: {
          disabledDate(time) {
            return time.getTime() > endTime;
          }
        }
      },
      approveOptions: [
        {
          value: '-1',
          label: '等待审核'
        },
        {
          value: '1',
          label: '初审完成'
        },
        {
          value: '2',
          label: '复审完成'
        }
      ],
      filterAutoDeal: true
    };
  },
  computed: {
    // 主动安全报警
    activityAlarms() {
      // 排除凌晨禁行
      return this.allAlarms.filter(
        item => eventTypes.indexOf(item.eventType) === -1
      );
    },
    // 凌晨禁行
    earlyMorningAlarms() {
      return this.allAlarms.filter(item => item.eventType === 132424);
    },
    activityHCount() {
      return this.activityAlarms.filter(item => item.level === 'h').length;
    },
    activityMCount() {
      return this.activityAlarms.filter(item => item.level === 'm').length;
    },
    activityLCount() {
      return this.activityAlarms.filter(item => item.level === 'l').length;
    },
    activityWCount() {
      return this.activityAlarms.filter(item => item.level === 'w').length;
    },
    hCount() {
      return this.allAlarms.filter(item => item.level === 'h').length;
    },
    mCount() {
      return this.allAlarms.filter(item => item.level === 'm').length;
    },
    lCount() {
      return this.allAlarms.filter(item => item.level === 'l').length;
    },
    wCount() {
      return this.allAlarms.filter(item => item.level === 'w').length;
    },
    otherHCount() {
      return this.otherAlarms.filter(item => item.level === 'h').length;
    },
    otherMCount() {
      return this.otherAlarms.filter(item => item.level === 'm').length;
    },
    otherLCount() {
      return this.otherAlarms.filter(item => item.level === 'l').length;
    },
    otherWCount() {
      return this.otherAlarms.filter(item => item.level === 'w').length;
    },
    riskHCount() {
      return this.riskEvents.filter(item => item.level === 'h').length;
    },
    riskMCount() {
      return this.riskEvents.filter(item => item.level === 'm').length;
    },
    riskLCount() {
      return this.riskEvents.filter(item => item.level === 'l').length;
    },
    riskWCount() {
      return this.riskEvents.filter(item => item.level === 'w').length;
    }
  },
  watch: {
    showDetail(value) {
      this.$nextTick(() => {
        this.resize();
      });
    }
  },
  created() {
    if (this.isRealtime) {
      this.findAlarms();
      this.findRiskEvents();
      this.alarmInterval = setInterval(() => {
        this.findAlarms();
        this.findRiskEvents();
      }, ALARM_INTERVAL);
    } else {
      this.form.approveStatus = this.defaultApproveStatus;
      this.doSearch();
      // this.doSearchRisk();
    }
    this.getBasicInfo();
  },
  mounted() {
    this.resize();
    window.addEventListener('resize', this.resize);
  },
  destroyed() {
    window.removeEventListener('resize', this.resize);
    this.closeOnOffWebsocket();
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
    }
  },
  methods: {
    resize() {
      this.tableHeight = this.$refs.tabref.clientHeight - 84;
      if (!this.isRealtime) {
        this.tableHeight =
          this.tableHeight - this.$refs.searchForm.$el.clientHeight - 20 - 56;
      }
    },
    openSubscriptionDialog() {
      this.$refs.auditDialog.openDialog();
    },
    getAlarmDuration() {},
    refreshMergeAlarm() {
      this.findAlarms();
      this.findRiskEvents();
    },
    clickAlarm(alarm) {
      this.showDetail = true;
      if (alarm.isRiskEvent || alarm.picNum > 0 || alarm.videoNum > 0) {
        this.isShowAlarmMultiMedia = true;
      } else {
        this.isShowAlarmMultiMedia = false;
      }
      this.$nextTick(() => {
        this.alarmLedger = alarm;
      });
    },
    initWebsocket() {
      if (!this.isRealtime) {
        return;
      }
      if (!this.isListeningOnOff) {
        this.getBasicInfo({
          initOnOffWebsocket: this.initOnOffWebsocket
        });
      }
    },
    initOnOffWebsocket() {
      if (!this.addr) {
        this.$message.error('获取 CMS IP 失败');
        return;
      }
      if (process.env.NODE_ENV === 'development') {
        this.wsOnOff = new WebSocket(
          'ws://10.196.42.111:17001/ctm01ttvm-web/socket'
        );
      } else {
        this.wsOnOff = new WebSocket(`${this.addr}/ctm01ttvm-web/socket`);
      }

      this.wsOnOff.addEventListener('open', () => {
        this.isListeningOnOff = true;
        // console.log('onoff 连接成功');
      });
      this.wsOnOff.onclose = () => {
        this.isListeningOnOff = false;
        // console.log('onoff 关闭');
      };
      this.wsOnOff.addEventListener('error', event => {
        this.isListeningOnOff = false;
        // console.log(`error!!!!${event}`);
      });
      this.wsOnOff.addEventListener('message', event => {
        const data = JSON.parse(event.data);
        if (data.params && data.params.ability === 'msa_alarm_event') {
          const events = data.params.events;
          const alarms = [];
          events.forEach(item => {
            if (allEventTypes.indexOf(item.data.eventType) === -1) {
              return;
            }
            alarms.push({
              ...item.data,
              // latitude: item.data.beginLatitude,
              // longitude: data.beginLongitude,
              speed: (item.data.speed || 0) / 100000,
              beginTime: item.data.beginTime || item.data.alarmTime
              // direction: data.beginDirection
            });
          });
          this.allAlarms = [...alarms, ...this.allAlarms];
          this.allAlarms = this.allAlarms.slice(0, this.maxAlarms);
        } else if (
          data.params &&
          data.params.ability === 'event_irtsafedriving'
        ) {
          const events = data.params.events;
          const alarms = [];
          events.forEach(item => {
            const levels = ['h', 'm', 'l', 'w'];
            alarms.push({
              ...item.data,
              isRiskEvent: true,
              // latitude: item.data.beginLatitude,
              // longitude: data.beginLongitude,
              speed: (item.data.beginSpeed || 0) / 100000,
              level: levels[item.data.level - 1]
              // beginTime: item.data.beginTime || item.data.alarmTime
              // direction: data.beginDirection
            });
          });
          this.riskEvents = [...alarms, ...this.riskEvents];
          this.riskEvents = this.riskEvents.slice(0, this.maxAlarms);
        }
      });
    },
    closeOnOffWebsocket() {
      if (this.isListeningOnOff) {
        this.wsOnOff.close();
      }
    },
    onUpdateAlarm(eventId, labels) {
      const label = [
        {
          component: process.env.VUE_APP_COMPONENT_ID,
          labels: labels
        }
      ];
      // const alarm = this.allAlarms.find(item => item.eventId === eventId);
      // if (alarm) {
      //   alarm.label = label;
      // }
      if (this.alarmLedger && this.alarmLedger.eventId === eventId) {
        this.alarmLedger.label = label;
      }
      if (this.isRealtime) {
        this.findAlarms();
      } else {
        this.doSearch();
      }
    },

    onUpdateMessageLabel(payload) {
      if (this.isRealtime) {
        this.findAlarms();
      } else {
        this.doSearch();
      }
    },
    doFindAlarms(params) {
      this.loading = true;
      findAlarmPage(params)
        .then(json => {
          if (json.code === '0') {
            this.alarmParams = params;
            this.total = json.data.total;
            this.allAlarms = json.data.list.map(item => {
              item.speed = alarmUtils.formatSpeed(item.beginSpeed);
              item.recordSpeed = alarmUtils.formatSpeed(item.recordSpeed);
              item.latitude = item.beginLatitude;
              item.longitude = item.beginLongitude;
              item.direction = item.beginDirection;
              return item;
            });
          }
        })
        .finally(() => {
          this.loading = false;
          // this.initWebsocket();
        });
    },
    doFindRiskEvents(params) {
      this.riskLoading = true;
      if (params.vehicleIndexCodes && params.vehicleIndexCodes.length > 1) {
        params.inCondition = {
          indexCode: params.vehicleIndexCodes
        };
      }
      auditLedgerQuery(params)
        .then(json => {
          if (json.code === '0') {
            this.riskTotal = json.data.total || 0;
            const riskEvents = json.data.list || [];
            riskEvents.forEach(item => {
              const driver = item.driver || {};
              const vehicle = item.vehicle || {};
              item.driverName = driver.driverName;
              item.driverIndexCode = driver.driverIndexCode;
              item.tel = driver.driverTel;
              item.vehicleIndexCode = vehicle.vehicleIndexCode;
              item.vehicleLicensePlate = vehicle.vehicleLicensePlate;
              item.eventTypeName = item.eventName;
              item.beginTime = item.startTime;
              item.isRiskEvent = true;
              // TODO 根据后台返回数据格式修改
              if (item.approveStatus !== null) {
                item.label = [
                  {
                    component: process.env.VUE_APP_COMPONENT_ID,
                    labels: [
                      {
                        key: 'processAction',
                        value: item.processAction
                      },
                      {
                        key: 'approveStatus',
                        value: item.approveStatus + ''
                      },
                      {
                        key: 'driverResponse',
                        value: item.driverResponse
                      },
                      {
                        key: 'valid',
                        value: item.status + ''
                      }
                    ]
                  }
                ];
              }
            });
            this.riskEvents = riskEvents;
          }
        })
        .finally(() => {
          this.riskLoading = false;
        });
    },
    // 查询最近一段时间的报警
    findAlarms() {
      const params = {
        pageNo: 1,
        pageSize: this.maxAlarms,
        type: 2
      };
      let labels = [
        [
          {
            key: 'valid',
            value: '1' // 有效报警
          }
        ],
        [
          {
            key: 'valid',
            value: '-1' // 可疑报警
          }
        ],
        [
          {
            key: 'valid',
            value: '-2' // 没有核警过的报警
          }
        ]
      ];
      if (this.filterAutoDeal) {
        labels = [
          [
            {
              key: 'valid',
              value: '1' // 有效报警
            },
            {
              key: 'broadcast',
              value: '2' // 有效报警
            }
          ],
          [
            {
              key: 'valid',
              value: '-1' // 可疑报警
            },
            {
              key: 'broadcast',
              value: '2' // 有效报警
            }
          ],
          [
            {
              key: 'valid',
              value: '-2' // 没有核警过的报警
            },
            {
              key: 'broadcast',
              value: '2' // 有效报警
            }
          ],
          [
            {
              key: 'valid',
              value: '1' // 有效报警
            },
            {
              key: 'broadcast',
              value: '-1' // 有效报警
            }
          ],
          [
            {
              key: 'valid',
              value: '-1' // 可疑报警
            },
            {
              key: 'broadcast',
              value: '-1' // 有效报警
            }
          ],
          [
            {
              key: 'valid',
              value: '-2' // 没有核警过的报警
            },
            {
              key: 'broadcast',
              value: '-1' // 有效报警
            }
          ]
        ];
      }
      params.label = {
        component: process.env.VUE_APP_COMPONENT_ID,
        includeNull: true,
        labels
      };
      this.doFindAlarms(params);
    },
    findRiskEvents() {
      const endTime = new Date();
      this.doFindRiskEvents({
        pageNo: 1,
        pageSize: this.maxAlarms,
        type: 2,
        endTime: toTimezoneString(endTime),
        beginTime: toTimezoneString(endTime.getTime() - 60 * 60 * 1000)
      });
    },
    onSearch() {
      if (this.form.dateRange) {
        if (
          this.form.dateRange[1] - this.form.dateRange[0] >=
          30 * 24 * 60 * 60 * 1000
        ) {
          this.$message.warning('开始日期和结束日期间隔不能超过30天');
          return;
        }
      }
      this.pageNo = 1;
      this.doSearch();
    },
    onSearchYesterday() {
      const now = new Date();
      const yesterday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1
      );
      const endTime = new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1);
      this.form.dateRange = [yesterday, endTime];
      this.onSearch();
    },
    onCurrentChange(pageNo) {
      this.pageNo = pageNo;
      this.doSearch();
    },
    onSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.doSearch();
    },
    onRiskCurrentChange(pageNo) {
      this.riskPageNo = pageNo;
      this.doSearchRisk();
    },
    onRiskSizeChange(pageSize) {
      this.riskPageSize = pageSize;
      this.doSearchRisk();
    },
    getParams() {
      const params = {
        vehicleIndexCodes: this.form.vehicleIndexCodes,
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        type: 2
      };
      if (this.form.dateRange) {
        params.beginTime = toTimezoneString(this.form.dateRange[0]);
        params.endTime = toTimezoneString(this.form.dateRange[1]);
      }
      if (this.form.approveStatus === '-1') {
        params.label = {
          component: process.env.VUE_APP_COMPONENT_ID,
          includeNull: true,
          labels: [
            [
              {
                key: 'approveStatus',
                value: '-1'
              }
            ]
          ]
        };
      } else if (this.form.approveStatus) {
        params.label = {
          component: process.env.VUE_APP_COMPONENT_ID,
          labels: [
            [
              {
                key: 'approveStatus',
                value: this.form.approveStatus
              }
            ]
          ]
        };
      }
      return params;
    },
    doSearchRisk() {
      const params = this.getParams();
      if (this.form.approveStatus === '-1') {
        params.status = 0;
      } else if (this.form.approveStatus) {
        params.approveStatus = this.form.approveStatus;
      }
      params.pageSize = this.riskPageSize;
      params.pageNo = this.riskPageNo;
      // params.approveStatus = 1;
      if (!params.beginTime) {
        const endTime = new Date();
        params.endTime = toTimezoneString(endTime);
        params.beginTime = toTimezoneString(endTime.getTime() - 60 * 60 * 1000);
      }
      this.doFindRiskEvents(params);
    },
    doSearch() {
      this.doFindAlarms(this.getParams());
      this.doSearchRisk();
    },
    getVehicle(node) {
      if (node.length === 0) {
        this.form.vehicleIndexCodes = [];
      } else {
        this.form.vehicleIndexCodes = node.map(item => item.id);
      }
    },
    resetForm() {
      this.$refs.dropdownTree.reset();
      this.form.dateRange = [...this.defaultDateRange];
      this.form.approveStatus = this.defaultApproveStatus;
    },
    onUpdateSubAlarm(subAlarm) {
      this.$refs.alarmLedger.updateSubAlarm(subAlarm);
    },
    onUpdateRisk(eventId, labels) {
      const label = [
        {
          component: process.env.VUE_APP_COMPONENT_ID,
          labels: labels
        }
      ];
      const index = this.riskEvents.findIndex(item => item.eventId === eventId);
      if (index > -1) {
        this.riskEvents.splice(index, 1, {
          ...this.riskEvents[index],
          label: label
        });
      }
      if (this.alarmLedger && this.alarmLedger.eventId === eventId) {
        this.alarmLedger = {
          ...this.alarmLedger,
          label: label
        };
      }
      if (!this.isRealtime) {
        this.doSearch();
      }
    }
  }
};
</script>

<style src="@/pages/statistics/statistics.scss" lang="scss"></style>
<style lang="scss" scoped>
.alarm-tabs {
  flex: 1;
  min-width: 500px;
  margin: 0 12px;
}

.alarm-slidebar {
  width: 440px;
  height: 100%;
  position: relative;
}

.search-form {
  margin: 12px 0 8px;
  position: relative;
  border-bottom: 1px solid #dedede;
  &::v-deep {
    .el-form-item {
      margin-bottom: 12px;
    }
  }
  .btn-wrap {
    margin-bottom: 12px;
  }
}
.alarm-multi-media-wrap {
  position: relative;
  width: 400px;
  height: 100%;
  background: #fff;
}

::v-deep .rm-focus {
  font-size: 16px;
}
</style>
