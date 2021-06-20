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
          >
            <el-table-column label="序号" width="80">
              <template slot-scope="scope">
                {{ getIndex(scope.$index) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="vehicleLicensePlate"
              label="车牌号"
              width="140"
            ></el-table-column>
            <el-table-column prop="orgName" label="所属企业"></el-table-column>
            <el-table-column
              prop="beginTime"
              label="开始时间"
            ></el-table-column>
            <el-table-column prop="endTime" label="结束时间"></el-table-column>
            <el-table-column label="时间段内在线率">
              <template slot-scope="scope">
                {{
                  (scope.row && scope.row.onlineRate
                    ? Number(scope.row.onlineRate * 100).toFixed(1)
                    : '0') + '%'
                }}
              </template>
            </el-table-column>
            <el-table-column prop="mileageTotal" label="车辆在线时长">
              <template slot-scope="scope">
                {{
                  scope.row && scope.row.onlineTime
                    ? getDuration(scope.row.onlineTime)
                    : ''
                }}
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
  // 车辆上线率
  name: 'VehicleOnlineRate',
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
        date: []
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now() - 24 * 60 * 60 * 1000;
        },
        customValidation(start, end) {
          return end.getTime() - start.getTime() < 31 * 24 * 60 * 60 * 1000;
        },
        customPrompt: '选择时间范围不能超过31天'
      }
    };
  },
  methods: {
    checkParams() {
      if (this.searchCondition.indexCodes.length === 0) {
        this.$message.warning('请选择车辆');
        return false;
      }
      if (
        !this.searchCondition.date ||
        this.searchCondition.date.length !== 2
      ) {
        this.$message.warning('请选择开始和结束日期');
        return false;
      }
      if (
        this.searchCondition.date[1].getTime() -
          this.searchCondition.date[0].getTime() >=
        30 * 24 * 60 * 60 * 1000
      ) {
        this.$message.warning('开始日期和结束日期间隔不能超过30天');
        return;
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
      const params = {
        beginTime: toTimezoneString(this.searchCondition.date[0]),
        endTime: toTimezoneString(
          this.searchCondition.date[1].getTime() + 24 * 60 * 60 * 1000 - 1
        ),
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
      const params = {
        beginPage: this.exportStartPage,
        endPage: this.exportEndPage,
        beginTime: toTimezoneString(this.searchCondition.date[0]),
        endTime: toTimezoneString(
          this.searchCondition.date[1].getTime() + 24 * 60 * 60 * 1000 - 1
        ),
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        vehicleIndexCodes: this.searchCondition.indexCodes.join(',')
      };
      downloadExcel(
        `/${process.env.VUE_APP_CONTEXT}/statistic/online/exportVehicleOnlineRate.do`,
        params
      );
      this.exportDialogVisible = false;
    },
    getDuration(time) {
      if (time) {
        if (time > 60) {
          return `${Math.floor(time / 60)}小时${time % 60}分钟`;
        }
        return `${time}分钟`;
      }
      return '-';
    }
  }
};
</script>

<style src="@/pages/statistics/statistics.scss" lang="scss"></style>
