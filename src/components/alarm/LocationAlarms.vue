<template>
  <h-page-container>
    <h-layout>
      <div ref="tabref" class="alarm-tabs">
        <el-form
          v-if="!isRealtime"
          ref="searchForm"
          :inline="true"
          label-position="top"
          content-width="288px"
          class="search-form"
        >
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
            <el-button type="primary" @click="onSelectAll">
              全选
            </el-button>
            <el-button @click="resetForm">重置</el-button>
          </div>
        </el-form>
        <el-tabs v-if="type === 1" v-model="activeName" @tab-click="handleTabClick">
          <el-tab-pane name="all">
            <tab-badge slot="label" :value="allAlarms.length">
              全部
            </tab-badge>
            <div>
              <div v-if="isRealtime" slot="left" style="height: 48px; line-height: 48px;">
                <el-button type="text" @click="onBatchDealAlarms('allTable')">
                  <i class="h-icon-export"></i>
                  批量处理
                </el-button>
                <!-- <el-checkbox v-model="filterAutoDeal" @change="findAlarms">
                  过滤自动处警
                </el-checkbox> -->
              </div>
              <location-alarm-table
                ref="allTable"
                v-loading="loading"
                :alarms="allAlarms"
                :table-height="tableHeight"
                :is-realtime="isRealtime"
                @deal-alarm="dealAlarm"
              ></location-alarm-table>
            </div>
          </el-tab-pane>
          <el-tab-pane name="areaAlarms">
            <tab-badge slot="label" :value="areaAlarms.length">
              越界行驶
            </tab-badge>
            <div>
              <div v-if="isRealtime" slot="left" style="height: 48px; line-height: 48px;">
                <el-button
                  type="text"
                  :show-summary="false"
                  @click="onBatchDealAlarms('areaAlarms')"
                >
                  <i class="h-icon-export"></i>
                  批量处理
                </el-button>
                <!-- <el-checkbox v-model="filterAutoDeal" @change="findAlarms">
                  过滤自动处警
                </el-checkbox> -->
              </div>
              <location-alarm-table
                ref="areaAlarms"
                v-loading="loading"
                :alarms="areaAlarms"
                :table-height="tableHeight"
                :is-realtime="isRealtime"
                @deal-alarm="dealAlarm"
              ></location-alarm-table>
            </div>
          </el-tab-pane>
          <el-tab-pane name="second">
            <tab-badge slot="label" :value="speedAlarms.length">
              超速报警
            </tab-badge>
            <div>
              <div v-if="isRealtime" slot="left" style="height: 48px; line-height: 48px;">
                <el-button
                  type="text"
                  :show-summary="false"
                  @click="onBatchDealAlarms('speedAlarms')"
                >
                  <i class="h-icon-export"></i>
                  批量处理
                </el-button>
                <!-- <el-checkbox v-model="filterAutoDeal" @change="findAlarms">
                  过滤自动处警
                </el-checkbox> -->
              </div>
              <location-alarm-table
                ref="speedAlarms"
                v-loading="loading"
                :alarms="speedAlarms"
                :table-height="tableHeight"
                :is-realtime="isRealtime"
                @deal-alarm="dealAlarm"
              ></location-alarm-table>
            </div>
          </el-tab-pane>
          <el-tab-pane name="third">
            <!-- 2021.08.09 updata by chenying -->
            <tab-badge slot="label" :value="tiredAlarms.length">
                驾驶超时
            </tab-badge>
            <div>
              <div v-if="isRealtime" slot="left" style="height: 48px; line-height: 48px;">
                <el-button
                  type="text"
                  :show-summary="false"
                  @click="onBatchDealAlarms('tiredAlarms')"
                >
                  <i class="h-icon-export"></i>
                  批量处理
                </el-button>
                <!-- <el-checkbox v-model="filterAutoDeal" @change="findAlarms">
                  过滤自动处警
                </el-checkbox> -->
              </div>
            </div>
            <location-alarm-table
              ref="tiredAlarms"
              v-loading="loading"
              :alarms="tiredAlarms"
              :table-height="tableHeight"
              :is-realtime="isRealtime"
              @deal-alarm="dealAlarm"
            ></location-alarm-table>
          </el-tab-pane>
          <el-tab-pane name="fourth">
            <tab-badge slot="label" :value="earlyMorningAlarms.length">
              凌晨禁行
            </tab-badge>
            <div>
              <div v-if="isRealtime" slot="left" style="height: 48px; line-height: 48px;">
                <el-button
                  type="text"
                  :show-summary="false"
                  @click="onBatchDealAlarms('earlyMorningAlarms')"
                >
                  <i class="h-icon-export"></i>
                  批量处理
                </el-button>
                <!-- <el-checkbox v-model="filterAutoDeal" @change="findAlarms">
                  过滤自动处警
                </el-checkbox> -->
              </div>
            </div>
            <location-alarm-table
              ref="earlyMorningAlarms"
              v-loading="loading"
              :alarms="earlyMorningAlarms"
              :table-height="tableHeight"
              :is-realtime="isRealtime"
              @deal-alarm="dealAlarm"
            ></location-alarm-table>
          </el-tab-pane>
          <el-tab-pane label="其他报警" name="sixth">
            <tab-badge slot="label" :value="otherAlarms.length">
              其他报警
            </tab-badge>
            <div>
              <div v-if="isRealtime" slot="left" style="height: 48px; line-height: 48px;">
                <el-button
                  type="text"
                  :show-summary="false"
                  @click="onBatchDealAlarms('otherAlarms')"
                >
                  <i class="h-icon-export"></i>
                  批量处理
                </el-button>
                <!-- <el-checkbox v-model="filterAutoDeal" @change="findAlarms">
                  过滤自动处警
                </el-checkbox> -->
              </div>
            </div>
            <location-alarm-table
              ref="otherAlarms"
              v-loading="loading"
              :alarms="otherAlarms"
              :table-height="tableHeight"
              :is-realtime="isRealtime"
              @deal-alarm="dealAlarm"
            ></location-alarm-table>
          </el-tab-pane>
          <el-tab-pane label="紧急报警" name="seventh">
            <tab-badge slot="label" :value="emergencyAlarms.length">
              紧急报警
            </tab-badge>
            <div>
              <div v-if="isRealtime" slot="left" style="height: 48px; line-height: 48px;">
                <el-button
                  type="text"
                  :show-summary="false"
                  @click="onBatchDealAlarms('emergencyAlarms')"
                >
                  <i class="h-icon-export"></i>
                  批量处理
                </el-button>
                <!-- <el-checkbox v-model="filterAutoDeal" @change="findAlarms">
                  过滤自动处警
                </el-checkbox> -->
              </div>
            </div>
            <emergency-alarm-table
              ref="emergencyAlarms"
              v-loading="emergencyLoading"
              :alarms="emergencyAlarms"
              :table-height="tableHeight"
              :is-realtime="isRealtime"
              @deal-alarm="dealAlarm"
            ></emergency-alarm-table>
          </el-tab-pane>
        </el-tabs>
        <div v-else-if="type === 3">
          <alarm-level-summary
            :h-count="hCount"
            :m-count="mCount"
            :l-count="lCount"
            :w-count="wCount"
          ></alarm-level-summary>
          <location-alarm-table
            v-loading="loading"
            :alarms="allAlarms"
            :table-height="tableHeight + 30"
            :is-realtime="isRealtime"
            @row-click="clickAlarm"
          ></location-alarm-table>
        </div>
        <el-pagination
          v-if="!isRealtime"
          ref="pagination"
          :page-sizes="[30, 50, 100]"
          :page-size="pageSize"
          :current-page="pageNo"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="onSizeChange"
          @current-change="onCurrentChange"
        ></el-pagination>
      </div>
      <div v-if="showDetail" class="alarm-slidebar">
        <alarm-ledger
          :alarm="alarmLedger"
          :show.sync="showDetail"
          is-show-track
          @update-alarm="onUpdateAlarm"
          @update-message-label="onUpdateMessageLabel"
        ></alarm-ledger>
      </div>
    </h-layout>
    <audit-dialog ref="auditDialog" @refresh="refreshMergeAlarm"></audit-dialog>
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
import { findAlarmPage } from '@/api/alarm';
import basicInfoMixin from '@/mixins/basicInfoMixin.js';
import DropDownTree from '@/components/DropDownTree.vue';
import LocationAlarmTable from '@/components/alarm/LocationAlarmTable';
import { toTimezoneString } from '@/components/util.js';
import { ALARM_INTERVAL } from '@/core/constant';
import alarmUtils from '@/utils/alarm';
import alarmTableMixin from '@/components/alarm/AlarmTableMixin.js';
import alarmMixin from '@/components/alarm/alarmMixin.js';
import BroadcastDialog from '@/components/BroadcastDialog.vue';
import EmergencyAlarmTable from './EmergencyAlarmTable';

const eventTypes = [
  132408,
  132409,
  132418,
  132406,
  132405,
  132419,
  132407,
  132424
];
const otherTypes = [131330, 132418, 132421];
// 部标违规所有报警类型
const allEventTypes = [...eventTypes, ...otherTypes];

export default {
  name: 'LocationAlarms',
  components: {
    EmergencyAlarmTable,
    AlarmLedger,
    TabBadge,
    AlarmLevelSummary,
    AuditDialog,
    DropDownTree,
    LocationAlarmTable,
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
    },
    type: {
      type: Number,
      default: 1 // 1: 卫星定位, 2:传统视频
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
      activeName: 'all',
      emergencyAlarms: [],
      emergencyLoading: false,
      showDetail: false,
      tableHeight: null,
      alarmLedger: {},
      allAlarms: [],
      maxAlarms: 100,
      loading: false,
      pageSize: 30,
      pageNo: 1,
      total: 0,
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
      filterAutoDeal: false
    };
  },
  computed: {
    // 越界报警
    areaAlarms() {
      return this.allAlarms.filter(
        item =>
          item.eventType === 132408 ||
          item.eventType === 132409 ||
          item.eventType === 132418
      );
    },
    // 超速报警
    speedAlarms() {
      return this.allAlarms.filter(
        item =>
          item.eventType === 132406 ||
          item.eventType === 132405 ||
          item.eventType === 132419
      );
    },
    // 疲劳报警
    tiredAlarms() {
      return this.allAlarms.filter(
        item =>
          item.eventType === 225442 ||
          item.eventType === 225443 ||
          item.eventType === 132370 ||
          item.eventType === 132371
      );
    },
    // 凌晨禁行
    earlyMorningAlarms() {
      return this.allAlarms.filter(item => item.eventType === 132424);
    },
    // 运营违规
    violationAlarms() {
      return this.allAlarms.filter(
        item => eventTypes.indexOf(item.eventType) !== -1
      );
    },
    // 其他报警
    otherAlarms() {
      return this.allAlarms.filter(
        item => eventTypes.indexOf(item.eventType) === -1
      );
    },
    violationHCount() {
      return this.violationAlarms.filter(item => item.level === 'h').length;
    },
    violationMCount() {
      return this.violationAlarms.filter(item => item.level === 'm').length;
    },
    violationLCount() {
      return this.violationAlarms.filter(item => item.level === 'l').length;
    },
    violationWCount() {
      return this.violationAlarms.filter(item => item.level === 'w').length;
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
      this.interval = setInterval(this.findAlarms, ALARM_INTERVAL);
    } else {
      this.form.approveStatus = this.defaultApproveStatus;
      this.doSearch();
    }
  },
  mounted() {
    this.resize();
    window.addEventListener('resize', this.resize);
  },
  destroyed() {
    window.removeEventListener('resize', this.resize);
    this.closeOnOffWebsocket();
    if (this.interval) {
      clearInterval(this.interval);
    }
  },
  methods: {
    getEventTypeName(obj) {
      const alarmInfo = obj.alarmInfo;
      if (JSON.parse(alarmInfo)) {
        const str = parseInt(JSON.parse(alarmInfo).alarmFlag).toString(2);
        let strTemp = str.substring(str.length - 3, str.length);
        while (strTemp.length < 3) {
          strTemp = '0' + strTemp;
        }
        switch (strTemp) {
          case '001':
            return '紧急报警';
          case '011':
            return '紧急报警，超速';
          case '101':
            return '紧急报警，疲劳驾驶';
          case '111':
            return '紧急报警，超速，疲劳驾驶';
        }
      } else {
        return '';
      }
    },
    handleTabClick(tab, event) {
      if (tab.name === 'seventh') {
        const now = new Date();
        const params = {
          endTime: toTimezoneString(now),
          beginTime: toTimezoneString(now.getTime() - 60 * 60 * 1000),
          pageNo: 1,
          pageSize: 100,
          eventTypes: [132441],
          type: 2,
          vehicleIndexCodes: ['266f5f04549742e1a1847613114ca218']
          // vehicleIndexCodes: ['2b4bbbd50b13465e8a8fd7f96229447d']
        };
        this.emergencyLoading = true;
        findAlarmPage(params)
          .then(json => {
            if (json.code === '0') {
              // this.alarmParams = params;
              this.total = json.data.total;
              if (this.isRealtime) {
                this.emergencyAlarms = json.data.list.filter(i => {
                  const broadcast = alarmUtils.getLabelValueByKey(i, 'broadcast');
                  if (broadcast === '1' || broadcast === '2') {
                    return false;
                  }
                  return true;
                });
              } else {
                this.emergencyAlarms = json.data.list;
              }
              this.emergencyAlarms = this.emergencyAlarms.map(item => {
                item.speed = alarmUtils.formatSpeed(item.beginSpeed);
                item.maxSpeed = alarmUtils.formatSpeed(item.maxSpeed ? item.maxSpeed : 0);
                item.recordSpeed = alarmUtils.formatSpeed(item.recordSpeed);
                item.eventTypeName = this.getEventTypeName(item);
                item.latitude = item.beginLatitude;
                item.longitude = item.beginLongitude;
                item.direction = item.beginDirection;
                return item;
              });
            }
          })
          .finally(() => {
            this.emergencyLoading = false;
          });
      }
    },
    resize() {
      this.tableHeight = this.$refs.tabref.clientHeight - 84;
      if (!this.isRealtime) {
        this.tableHeight =
          this.tableHeight -
          this.$refs.pagination.$el.clientHeight -
          this.$refs.searchForm.$el.clientHeight -
          20;
      }
    },
    openSubscriptionDialog() {
      this.$refs.auditDialog.openDialog();
    },
    refreshMergeAlarm() {
      this.findAlarms();
    },
    clickAlarm(alarm) {
      this.showDetail = true;
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
          // this.allAlarms.push({
          //   ...data,
          //   latitude: data.beginLatitude,
          //   longitude: data.beginLongitude,
          //   speed: (data.beginSpeed || 0) / 100000,
          //   direction: data.beginDirection
          // });
          this.allAlarms = this.allAlarms.slice(0, this.maxAlarms);
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
            if (this.isRealtime) {
              this.allAlarms = json.data.list.filter(i => {
                const broadcast = alarmUtils.getLabelValueByKey(i, 'broadcast');
                if (broadcast === '1' || broadcast === '2') {
                  return false;
                }
                return true;
              })
            } else {
              this.allAlarms = json.data.list
            }
            this.allAlarms = this.allAlarms.map(item => {
              item.speed = alarmUtils.formatSpeed(item.beginSpeed);
              item.maxSpeed = alarmUtils.formatSpeed(item.maxSpeed ? item.maxSpeed : 0);
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
    // 查询最近一段时间的报警
    findAlarms() {
      const params = {
        pageNo: 1,
        pageSize: this.maxAlarms,
        type: this.type
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
    doSearch() {
      const params = {
        vehicleIndexCodes: this.form.vehicleIndexCodes,
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        type: this.type
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
      this.doFindAlarms(params);
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
    }
  }
};
</script>

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
    margin-bottom: 10px;
  }
}
</style>
