<template>
  <div class="pass-table-wrap">
    <div class="table-wrap">
      <el-table
        :data="tableData"
        force-scroll
        highlight-current-row
        @current-change="handleCurrentRowChange"
      >
        <el-table-column
          prop="vehicleLicensePlate"
          label="车牌号码"
        ></el-table-column>
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
.pass-table-wrap {
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
.pass-table-wrap {
  .pagination-wrap {
    .el-pagination {
      text-align: center;
    }
  }
}
</style>
