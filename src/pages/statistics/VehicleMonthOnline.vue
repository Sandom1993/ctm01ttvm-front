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
        <template slot="time">
          <el-form label-position="top">
            <el-form-item label="时间" required style="margin-bottom:0">
              <el-date-picker
                v-model="searchCondition.date"
                :picker-options="pickerOptions"
                type="month"
                placeholder="请选择月份"
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
      </vehicle-tree>
    </h-layout-aside>
    <h-layout class="right-bar">
      <h-layout-header>
        <el-button type="iconButton" icon="h-icon-export" @click="onOpenExport">
          导出
        </el-button>
      </h-layout-header>
      <h-layout-content>
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
            style="width: 100%"
          >
            <el-table-column label="序号" width="80" fixed>
              <template slot-scope="scope">
                {{ getIndex(scope.$index) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="vehicleLicensePlate"
              label="车牌号"
              width="140"
              fixed
            ></el-table-column>
            <el-table-column
              prop="orgName"
              label="所属企业"
              fixed
              width="200"
            ></el-table-column>
            <el-table-column
              v-for="day of days"
              :key="day"
              prop="orgName"
              :label="day"
              width="64"
            >
              <template slot-scope="scope">
                <i
                  v-if="scope.row.vehicleOnlineDetail[day]"
                  class="h-icon-done"
                  style="color: #2080F7;"
                ></i>
              </template>
            </el-table-column>
          </el-table>
        </h-paged-table>
      </h-layout-content>
    </h-layout>
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
  </h-layout>
</template>

<script>
import VehicleTree from '@/components/Tree';
import { findVehicleOnlineInfoByVehicleIndexCodes } from '@/api/statistics';
import { toTimezoneString } from '@/components/util.js';
import { downloadExcel } from '@/core/httpInstance';

export default {
  // 车辆月在线率
  name: 'VehicleMonthOnline',
  components: {
    VehicleTree
  },
  data() {
    return {
      pageNo: 1,
      pageSize: 30,
      total: 0,
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
      pickerOptions: {
        disabledDate(time) {
          const now = new Date();
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          return time.getTime() >= nextMonth.getTime();
        }
      },
      days: []
    };
  },
  methods: {
    checkParams() {
      if (this.searchCondition.indexCodes.length === 0) {
        this.$message.warning('请选择车辆');
        return false;
      }
      if (!this.searchCondition.date) {
        this.$message.warning('请选择月份');
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
    },
    tableFetch(url, perPage, page) {
      if (!this.shouldSearch) {
        return Promise.resolve();
      }
      const endTime = new Date(
        new Date(
          this.searchCondition.date.getFullYear(),
          this.searchCondition.date.getMonth() + 1,
          1
        ).getTime() - 1
      );
      const params = {
        beginTime: toTimezoneString(this.searchCondition.date),
        endTime: toTimezoneString(endTime),
        pageNo: page,
        pageSize: perPage,
        inCondition: {
          indexCode: this.searchCondition.indexCodes
        }
      };
      this.pageNo = page;
      return findVehicleOnlineInfoByVehicleIndexCodes(params);
    },
    getSelectedNodes(node) {
      this.searchCondition.indexCodes = node.map(item => item.id);
    },
    getIndex(index) {
      return (this.pageNo - 1) * this.pageSize + index + 1;
    },
    fetchSuccess(json) {
      if (json.code === '0') {
        this.pageSize = json.data.pageSize;
        this.total = json.data.total;
        if (json.data.list.length > 0) {
          this.days = Object.keys(json.data.list[0].vehicleOnlineDetail);
        }
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
      if (this.exportStartPage > this.exportEndPage) {
        this.$message.warning('导出开始页数不能大于结束页数');
        return;
      }
      const endTime = new Date(
        new Date(
          this.searchCondition.date.getFullYear(),
          this.searchCondition.date.getMonth() + 1,
          1
        ).getTime() - 1
      );
      const params = {
        beginPage: this.exportStartPage,
        endPage: this.exportEndPage,
        beginTime: toTimezoneString(this.searchCondition.date),
        endTime: toTimezoneString(endTime),
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        vehicleIndexCodes: this.searchCondition.indexCodes.join(',')
      };
      downloadExcel(
        `/${process.env.VUE_APP_CONTEXT}/statistic/online/exportVehicleOnlineInfo.do`,
        params
      );
      this.exportDialogVisible = false;
    }
  }
};
</script>

<style src="@/pages/statistics/statistics.scss" lang="scss"></style>
