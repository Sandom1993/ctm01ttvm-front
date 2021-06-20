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
          <div class="mbs">
            <el-date-picker
              v-model="vehicleTime"
              type="daterange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptions"
            ></el-date-picker>
          </div>
        </template>
        <template v-slot:query>
          <el-button type="primary" @click="onSearch">
            {{ "查询" }}
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
            <el-table-column prop="orgName" label="所属组织"></el-table-column>
            <el-table-column prop="beginDate" label="开始日期">
              <template slot-scope="scope">
                <p>{{ scope.row.beginDate | formateDateTime}}</p>
              </template>
            </el-table-column>
            <el-table-column prop="endDate" label="结束日期">
              <template slot-scope="scope">
                <p>{{ scope.row.endDate | formateDateTime }}</p>
              </template>
            </el-table-column>
            <el-table-column label="里程(Km)">
              <template slot-scope="scope">
                <p>{{ scope.row.miles }}</p>
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
import VehicleTree from '../../components/Tree.vue';
import { pageQueryMileageByVehicle } from '../../api/mileageStatistic.js';
import { toTimezoneString } from '../../components/util.js';
import { downloadExcel } from '../../core/httpInstance.js';

export default {
  // 车辆里程统计
  name: 'MileageStatistic',
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
      exportDialogVisible: false,
      exportStartPage: 1,
      exportEndPage: 1,
      maxExportPage: 1,
      orgIndexCodesV: [],
      vehicleIndexCodes: [],
      vehicleTime: [new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate()-1,
        0,
        0,
        0,
      ), new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate()-1,
        23,
        59,
        59,
      )],
      beginTime: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate()-1,
        0,
        0,
        0,
      ),
      endTime: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate()-1,
        23,
        59,
        59,
      ),
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
      if (this.orgIndexCodesV.length === 0 && this.vehicleIndexCodes.length === 0) {
        this.$message.warning('请选择组织或者车辆');
        return false;
      }
      if (this.vehicleTime.length !== 2) {
        this.$message.warning('请选择时间段');
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
      const params = {
        beginTime: toTimezoneString(this.vehicleTime[0]),
        endTime: toTimezoneString(this.vehicleTime[1]),
        pageNo: page,
        pageSize: perPage,
        vehicleIndexCodes: this.vehicleIndexCodes,
        orgIndexCodes: this.orgIndexCodesV,
      };
      return pageQueryMileageByVehicle(params);
    },
    getSelectedNodes(node) {
      this.vehicleIndexCodes = node.map(item => item.id);
    },
    getIndex(index) {
      return (this.pageNo - 1) * this.pageSize + index + 1;
    },
    fetchSuccess(json) {
      if (json.code === '0') {
        this.pageNo = json.data.pageNo;
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
        beginTime: toTimezoneString(this.vehicleTime[0]),
        endTime: toTimezoneString(this.vehicleTime[1]),
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        vehicleIndexCodes: this.vehicleIndexCodes,
        orgIndexCodes: this.orgIndexCodesV,
      };
      downloadExcel(
        `/${process.env.VUE_APP_CONTEXT}/statistic/mileage/exportMileage.do`,
        params
      );
      this.exportDialogVisible = false;
    }
  }
};
</script>

<style src="@/pages/statistics/statistics.scss" lang="scss"></style>
<style>
  .mbs {
    margin-bottom: 8px;
  }
</style>
