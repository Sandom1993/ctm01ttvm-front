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
                :default-time="['00:00:00', '23:59:59']"
                type="datetimerange"
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
            <el-form-item label="报警类型">
              <drop-down-tree
                ref="alarmTypeTree"
                is-simple-tree
                :simple-data="alarmTypeTreeData"
                @input="getChoosedAlarmTyps"
              ></drop-down-tree>
            </el-form-item>
            <el-form-item label="报警分类">
              <el-select
                v-model="form.alarmCategory"
                multiple
                placeholder="请选择"
                collapse-tags
              >
                <el-option
                  v-for="item in alarmCategories"
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
              <el-button @click="resetForm">重置</el-button>
            </div>
          </div>
        </el-form>
        <alarm-level-summary
          :h-count="hCount"
          :m-count="mCount"
          :l-count="lCount"
          :w-count="wCount"
        >
          <el-button
            v-if="isRealtime"
            icon="rm-focus"
            @click="openSubscriptionDialog"
          >
            重点关注
          </el-button>
        </alarm-level-summary>
        <location-alarm-table
          v-loading="loading"
          :alarms="allAlarms"
          :is-realtime="isRealtime"
          class="alarm-table-wrap"
          @row-click="clickAlarm"
        ></location-alarm-table>
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
  </h-page-container>
</template>
<script>
import AlarmLedger from '@/components/alarm/AlarmLedger';
import AuditDialog from '@/components/alarm/AuditDialog';
import AlarmLevelSummary from '@/components/AlarmLevelSummary';
import { findAlarmPage } from '@/api/alarm';
import basicInfoMixin from '@/mixins/basicInfoMixin.js';
import DropDownTree from '@/components/DropDownTree.vue';
import LocationAlarmTable from '@/components/alarm/LocationAlarmTable';
import { toTimezoneString } from '@/components/util.js';
import AlarmMultiMedia from '@/components/alarm/AlarmMultiMedia';
import { getAllAlarmTypes } from '@/api/alarm.js';
import alarmUtils from '@/utils/alarm';
import alarmTableMixin from '@/components/alarm/AlarmTableMixin.js';

export default {
  name: 'AllAlarms',
  components: {
    AlarmLedger,
    AlarmLevelSummary,
    AuditDialog,
    DropDownTree,
    LocationAlarmTable,
    AlarmMultiMedia
  },
  mixins: [basicInfoMixin, alarmTableMixin],
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
      alarmTypes: [],
      activeName: 'first',
      showDetail: false,
      isShowAlarmMultiMedia: false,
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
        eventTypes: [],
        alarmCategory: [],
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
      alarmCategories: [
        {
          label: '运营违规',
          value: 1
        },
        {
          label: '主动安全',
          value: 2
        },
        {
          label: '传统视频',
          value: 3
        }
      ],
      defaultDateRange: null
    };
  },
  computed: {
    smokingAlarms() {
      return this.allAlarms.filter(item => item.eventType === 132375);
    },
    callAlarms() {
      return this.allAlarms.filter(item => item.eventType === 132374);
    },
    tiredAlarms() {
      return this.allAlarms.filter(item => item.eventType === 132374);
    },
    otherAlarms() {
      const eventTypes = [132375, 132374, 132374];
      return this.allAlarms.filter(
        item => eventTypes.indexOf(item.eventType) === -1
      );
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
    alarmTypeTreeData() {
      const levels = {
        h: {
          name: '严重',
          children: [],
          eventType: -1
        },
        m: {
          name: '较重',
          children: [],
          eventType: -2
        },
        l: {
          name: '一般',
          children: [],
          eventType: -3
        },
        w: {
          name: '预警',
          children: [],
          eventType: -4
        }
      };
      this.alarmTypes.forEach(item => {
        if (levels[item.level]) {
          levels[item.level].children.push({
            ...item,
            isLeaf: true
          });
        }
      });
      return [levels.h, levels.m, levels.l, levels.w];
    }
  },
  created() {
    const beginTime = new Date();
    beginTime.setHours(0);
    beginTime.setMinutes(0);
    beginTime.setSeconds(0);
    beginTime.setMilliseconds(0);
    const endTime = new Date(beginTime.getTime() + 24 * 60 * 60 * 1000 - 1);
    this.form.dateRange = [beginTime, endTime];
    this.defaultDateRange = [beginTime, endTime];
    getAllAlarmTypes().then(json => {
      if (json.code === '0') {
        this.alarmTypes = json.data;
      }
    });
    if (this.isRealtime) {
      this.findAlarms();
    } else {
      this.form.approveStatus = this.defaultApproveStatus;
      this.doSearch();
    }
  },
  mounted() {},

  methods: {
    openSubscriptionDialog() {
      this.$refs.auditDialog.openDialog();
    },
    getAlarmDuration() {},
    refreshMergeAlarm() {
      this.findAlarms();
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
      this.doSearch();
    },
    onUpdateMessageLabel() {
      this.doSearch();
    },
    doFindAlarms(params) {
      this.loading = true;
      findAlarmPage(params)
        .then(json => {
          if (json.code === '0') {
            this.alarmParams = params;
            this.total = json.data.total;
            this.allAlarms = json.data.list.map(item => {
              item.speed = alarmUtils.formatAlarmSpeed(item);
              item.latitude = item.beginLatitude;
              item.longitude = item.beginLongitude;
              item.direction = item.beginDirection;
              return item;
            });
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 查询最近一段时间的报警
    findAlarms() {
      this.doFindAlarms({
        pageNo: 1,
        pageSize: this.maxAlarms
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
    onCurrentChange(pageNo) {
      this.pageNo = pageNo;
      this.doSearch();
    },
    onSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.doSearch();
    },
    getParams() {
      // 参数加上报警分类
      const params = {
        vehicleIndexCodes: this.form.vehicleIndexCodes,
        eventTypes: this.form.eventTypes,
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        typeChoose: this.form.alarmCategory.join(',')
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
    doSearch() {
      this.doFindAlarms(this.getParams());
    },
    getVehicle(node) {
      if (node.length === 0) {
        this.form.vehicleIndexCodes = [];
      } else {
        this.form.vehicleIndexCodes = node.map(item => item.id);
      }
    },
    getChoosedAlarmTyps(node) {
      if (node.length === 0) {
        this.form.eventTypes = [];
      } else {
        this.form.eventTypes = node.map(item => item.eventType);
      }
    },
    resetForm() {
      this.$refs.dropdownTree.reset();
      this.$refs.alarmTypeTree.reset();
      this.form.dateRange = [...this.defaultDateRange];
      this.form.approveStatus = this.defaultApproveStatus;
      this.form.alarmCategory = [];
    },
    onUpdateSubAlarm(subAlarm) {
      this.$refs.alarmLedger.updateSubAlarm(subAlarm);
    }
  }
};
</script>

<style lang="scss" scoped>
.alarm-tabs {
  flex: 1;
  min-width: 500px;
  margin: 0 12px;
  display: flex;
  flex-direction: column;
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
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  &::v-deep {
    .el-form-item {
      margin-bottom: 12px;
    }
  }
  .btn-wrap {
    margin-bottom: 12px;
  }
}

.alarm-table-wrap {
  flex: 1;
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
