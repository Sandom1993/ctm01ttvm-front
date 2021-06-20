<template>
  <div class="gps-table-wrap">
    <div class="table-wrap">
      <el-table
        :data="tableData"
        force-scroll
        highlight-current-row
        :row-class-name="tableRowClassName"
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
    },
    tableRowClassName({ row }) {
      return row.isAlarm ? 'is-alarm' : '';
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
  &::v-deep .el-table .is-alarm {
    color: #ff5a5a;
  }
}
</style>
