<template>
  <div class="gps-table-wrap">
    <div class="table-wrap">
      <el-table
        :data="tableData"
        force-scroll
        highlight-current-row
        @row-click="rowClick"
      >
        <el-table-column prop="time" label="时间">
          <template slot-scope="scope">
            <div v-if="scope.row.retransFlag === 1" class="retrans-flag">
              补
            </div>
            {{
              new Date(scope.row.time).toLocaleDateString() +
                ' ' +
                new Date(scope.row.time).toTimeString().substr(0, 8)
            }}
          </template>
        </el-table-column>

        <el-table-column prop="longitude" label="经度">
          <template slot-scope="scope">
            {{ (scope.row.longitude / 360000).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="latitude" label="纬度">
          <template slot-scope="scope">
            {{ (scope.row.latitude / 360000).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="speed" label="GPS速度">
          <template slot-scope="scope">
            {{ formatSpeed(scope.row.speed) }} km/h
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="total-card">
      <el-row>
        <el-col :span="8">
          <div class="value blue">
            {{ status.gpsTotal }}
            <span class="label">个</span>
          </div>
          <div class="label">GPS总数</div>
        </el-col>
        <el-col :span="8">
          <div class="value green">
            {{ status.validTotal }}
            <span class="label">个</span>
          </div>
          <div class="label">有效个数</div>
        </el-col>
        <el-col :span="8">
          <div class="value red">
            {{ status.inValidTotal }}
            <span class="label">个</span>
          </div>
          <div class="label">无效个数</div>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <div class="value green">
            {{ status.correctRate }}
          </div>
          <div class="label">合格率</div>
        </el-col>
        <el-col :span="8">
          <div class="value">
            {{ status.integrityRate }}
          </div>
          <div class="label">轨迹完成率</div>
        </el-col>
        <el-col :span="8">
          <div class="value">
            {{ status.validRate }}
          </div>
          <div class="label">数据有效率</div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
import alarmUtils from '@/utils/alarm';

export default {
  name: 'PassVehicleTable',
  props: {
    tableData: {
      type: Array,
      default: () => []
    },
    status: {
      type: Object,
      default: () => {
        return {
          gpsTotal: 0,
          validTotal: 0,
          inValidTotal: 0,
          correctRate: '0.0%',
          integrityRate: '0.0%',
          validRate: '0.0%'
        };
      }
    }
  },
  methods: {
    formatSpeed(value) {
      return alarmUtils.formatSpeed(value);
    },
    rowClick(row) {
      this.$emit('gpsTableClick', row);
    }
  }
};
</script>

<style lang="scss" scoped>
.gps-table-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .table-wrap {
    height: 0;
    flex: 1;
    padding-top: 8px;
    padding-bottom: 152px;
  }
  .retrans-flag {
    display: block;
    position: absolute;
    top: -6px;
    left: 0;
    height: 20px;
    width: 20px;
    font-size: 12px;
    color: #fff;
    background: #ff5a5a;
    background: linear-gradient(-45deg, transparent 13px, #ff5a5a 0);
  }
  .total-card {
    height: 120px;
    box-shadow: 1px 1px 8px #333333;
    position: absolute;
    left: 16px;
    right: 16px;
    bottom: 16px;
    text-align: center;
    vertical-align: middle;
    padding: 12px;
    .value {
      font-size: 24px;
    }
    .label {
      color: #000000;
      font-size: 12px;
    }
    .blue {
      color: #67b4ff;
    }
    .green {
      color: #82ccad;
    }
    .red {
      color: #f88175;
    }
  }
}
</style>
