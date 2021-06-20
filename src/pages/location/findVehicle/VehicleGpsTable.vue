<template>
  <div class="gps-table-wrap">
    <div class="table-wrap">
      <el-table
        :data="tableData"
        force-scroll
        highlight-current-row
        @current-change="handleCurrentRowChange"
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
        <el-table-column
          prop="vehicleLicensePlate"
          label="车牌号码"
        ></el-table-column>
        <el-table-column prop="speed" label="速度">
          <template slot-scope="scope">
            {{ formatSpeed(scope.row.speed) }} km/h
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
      </el-table>
    </div>
    <div class="pagination-wrap">
      <el-pagination
        layout="prev, pager, next"
        :page-size="20"
        :current-page="currentPage"
        :total="totalNumber"
        @current-change="handleCurrentPageChange"
      ></el-pagination>
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
    totalNumber: {
      type: Number,
      default: 0
    },
    currentPage: {
      type: Number,
      default: 1
    }
  },
  methods: {
    formatSpeed(value) {
      return alarmUtils.formatSpeed(value);
    },
    handleCurrentRowChange(val) {
      this.$emit('currentRowChange', val);
    },
    handleCurrentPageChange(val) {
      this.$emit('currentPageChange', val);
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
  }
  .pagination-wrap {
    height: 48px;
    width: 100%;
    overflow: hidden;
    padding: 8px 0;
  }
}
</style>

<style lang="scss">
.gps-table-wrap {
  .pagination-wrap {
    .el-pagination {
      text-align: center;
    }
  }
}
.el-table .cell {
  overflow: visible;
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
</style>
