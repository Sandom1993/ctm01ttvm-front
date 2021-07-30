<template>
  <el-table
    ref="table"
    :data="alarms"
    stripe
    highlight-current-row
    force-scroll
    enable-virtual-scroll
    :height="tableHeight"
    @row-click="clickAlarm"
  >
    <el-table-column type="selection"></el-table-column>
    <el-table-column
      prop="vehicleLicensePlate"
      label="车牌号码"
      width="100"
      fixed="left"
    ></el-table-column>
    <el-table-column
      prop="vehicleSelfNo"
      label="自编号"
      width="100"
    ></el-table-column>
    <el-table-column prop="date" label="开始时间" width="152">
      <template slot-scope="scope">
        {{ getDateTime(scope.row.beginTime) }}
      </template>
    </el-table-column>
    <el-table-column label="结束时间" width="152">
      <template slot-scope="scope">
        {{ getDateTime(scope.row.endTime) }}
      </template>
    </el-table-column>
    <el-table-column prop="date" label="持续时间" width="80" show-overflow-tooltip>
      <template slot-scope="scope">
        {{ scope.row.continueTime | formatSeconds }}
      </template>
    </el-table-column>
    <el-table-column
      prop="eventTypeName"
      label="报警名称"
      width="200"
      show-overflow-tooltip
    ></el-table-column>
    <el-table-column label="报警来源" width="80">
      <template slot-scope="scope">
        <span class="approve-status">
          {{ scope.row.sourceType | formateSourceType }}
        </span>
      </template>
    </el-table-column>
    <el-table-column
      prop="level"
      show-overflow-tooltip
      label="报警级别"
      width="80"
    >
      <template slot-scope="scope">
        <alarm-level :level="scope.row.level"></alarm-level>
      </template>
    </el-table-column>
    <!--    <el-table-column-->
    <!--      prop="driverName"-->
    <!--      label="当班司机"-->
    <!--      width="100"-->
    <!--    ></el-table-column>-->
    <el-table-column label="定位速度" width="100">
      <template slot-scope="scope">{{ scope.row.speed }} km/h</template>
    </el-table-column>
    <el-table-column label="最高速度" width="100">
      <template slot-scope="scope">{{ scope.row.maxSpeed }} km/h</template>
    </el-table-column>
    <el-table-column label="脉冲速度" width="100">
      <template slot-scope="scope">{{ scope.row.pulseSpeed }} km/h</template>
    </el-table-column>
    <!-- <el-table-column label="导航速度" width="100">
      <template slot-scope="scope">{{ scope.row.recordSpeed }} km/h</template>
    </el-table-column> -->
    <el-table-column label="限速" width="100">
      <template slot-scope="scope">{{ scope.row.limitSpeed }} km/h</template>
    </el-table-column>
    <el-table-column
      prop="orgName"
      label="所属单位"
      width="150"
      show-overflow-tooltip
    ></el-table-column>
    <!--    <el-table-column label="定位" width="80">-->
    <!--      <template slot-scope="scope">-->
    <!--        {{ scope.row.location ? '已定位' : '未定位' }}-->
    <!--      </template>-->
    <!--    </el-table-column>-->
    <el-table-column label="处警人" width="80" show-overflow-tooltip>
      <template slot-scope="scope">
        {{ getLabelValueByKey(scope.row, 'dealPerson') }}
      </template>
    </el-table-column>
    <el-table-column label="处警时间" width="152">
      <template slot-scope="scope">
        {{ getLabelValueByKey(scope.row, 'dealTime') }}
      </template>
    </el-table-column>
    <el-table-column label="处警内容" width="100" show-overflow-tooltip>
      <template slot-scope="scope">
        {{ getLabelValueByKey(scope.row, 'message') }}
      </template>
    </el-table-column>
    <el-table-column
      v-if="!isRealtime"
      label="核警人"
      width="80"
      show-overflow-tooltip
    >
      <template slot-scope="scope">
        {{ getLabelValueByKey(scope.row, 'checkPerson') }}
      </template>
    </el-table-column>
    <el-table-column v-if="!isRealtime" label="核警时间" width="152">
      <template slot-scope="scope">
        {{ getLabelValueByKey(scope.row, 'checkTime') }}
      </template>
    </el-table-column>
    <el-table-column
      v-if="!isRealtime"
      label="核警备注"
      width="100"
      show-overflow-tooltip
    >
      <template slot-scope="scope">
        {{ getLabelValueByKey(scope.row, 'alarmRemark') }}
      </template>
    </el-table-column>
    <el-table-column v-if="false" label="审核状态" width="100">
      <template slot-scope="scope">
        <span class="approve-status" :class="getApproveStatusCls(scope.row)">
          {{ getApproveStatus(scope.row) }}
        </span>
      </template>
    </el-table-column>
    <el-table-column v-if="!isRealtime" label="有效性" width="80">
      <template slot-scope="scope">
        {{ getValid(scope.row) }}
      </template>
    </el-table-column>
    <el-table-column v-if="isRealtime" label="操作" width="100" fixed="right">
      <template slot-scope="scope">
        <el-button type="link" @click="onConfirmAlarm(scope.row)">确认</el-button>
        <el-button type="link" @click="onDealAlarm(scope.row)">处理</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { toTimeNormalString, toTimezoneString } from '@/components/util.js';
import AlarmLevel from '@/components/AlarmLevel';
import { terminalAbility } from '@/api/location';
import alarmUtil from '@/utils/alarm';

export default {
  name: 'EmergencyAlarmTable',
  components: {
    AlarmLevel
  },
  props: {
    alarms: {
      type: Array,
      default: () => {
        return [];
      }
    },
    tableHeight: {
      type: Number,
      default: 0
    },
    isRealtime: {
      type: Boolean,
      default: false
    },
    isRiskEvent: {
      // 是否是风险事件
      type: Boolean,
      default: false
    }
  },
  methods: {
    getLabelValueByKey(alarm, key) {
      return alarmUtil.getLabelValueByKey(alarm, key);
    },
    getDateTime(time) {
      if (time === null) {
        return '';
      }
      return typeof time !== 'undefined'
        ? toTimeNormalString(toTimezoneString(time))
        : '';
    },
    getApproveStatus(alarm) {
      if (!alarm.label) {
        return '等待审核';
      }
      const label = alarm.label.find(
        item => item.component === process.env.VUE_APP_COMPONENT_ID
      );
      if (!label) {
        return '等待审核';
      }
      const approveStatus = {
        '1': '初审完成',
        '2': '复审完成',
        '-1': '等待审核'
      };
      const status = label.labels.find(item => item.key === 'approveStatus');
      if (status) {
        return approveStatus[status.value];
      }
    },
    getApproveStatusCls(alarm) {
      if (!alarm.label) {
        return 'wait';
      }
      const label = alarm.label.find(
        item => item.component === process.env.VUE_APP_COMPONENT_ID
      );
      if (!label) {
        return 'wait';
      }
      const status = label.labels.find(item => item.key === 'approveStatus');
      if (status && status.value === '-1') {
        return 'wait';
      }
    },
    getValid(alarm) {
      if (alarm.label) {
        const label = alarm.label.find(
          item => item.component === process.env.VUE_APP_COMPONENT_ID
        );
        if (label) {
          const valid = label.labels.find(item => item.key === 'valid');
          if (valid) {
            if (valid.value === '0') {
              return '误报';
            } else if (valid.value === '1') {
              return '有效';
            } else if (valid.value === '-1') {
              return '存疑';
            } else if (this.isRiskEvent && valid.value === '2') {
              return '误报';
            }
          }
        }
        return '';
      }
    },
    clickAlarm(alarm) {
      // this.$emit('row-click', alarm);
    },
    onDealAlarm(alarm) {
      this.$emit('deal-alarm', alarm);
    },
    onConfirmAlarm(alarm) {
      const param = {
        method: 'ConfirmAlarm',
        params: {
          indexCode: alarm.deviceIndexCode || '',
          alarmType: 1
        }
      };
      terminalAbility(param).then(res => {
        if (res.code === '0') {
          this.$message({
            message: '确认成功！',
            type: 'success'
          });
        }
      });
    }
  }
};
</script>

<style src="@/pages/statistics/statistics.scss" lang="scss"></style>
<style lang="scss" scoped>
.approve-status.wait {
  color: #fa3239;
}
::v-deep {
  .el-table__body tr.current-row > td {
    background: #c9e5f5 !important;
  }
}
</style>
