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
                type="date"
                placeholder="请选择日期"
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
            <el-table-column
              prop="vehicleType"
              label="车辆类型"
            ></el-table-column>
            <el-table-column prop="orgName" label="所属单位"></el-table-column>
            <el-table-column
              prop="beginTime"
              label="统计日期"
            ></el-table-column>
<!--            <el-table-column prop="endTime" label="结束时间"></el-table-column>-->
            <el-table-column label="连续里程">
              <template slot-scope="scope">
                {{ scope.row.mileageContinuous }}
              </template>
            </el-table-column>
            <el-table-column
              prop="mileageBroke"
              label="不连续里程"
            ></el-table-column>
            <el-table-column
              prop="mileageTotal"
              label="总公里数"
            ></el-table-column>
            <el-table-column
              prop="integrityRate"
              label="轨迹完整率"
            ></el-table-column>
            <el-table-column label="操作" width="80">
              <template slot-scope="scope">
                <el-button type="link" @click="onView(scope.row)">
                  查看
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </h-paged-table>
      </h-layout-content>
    </h-layout>
    <el-dialog
      title="数据分析"
      :visible.sync="dialogVisible"
      :area="1135"
      top="middle"
    >
      <el-button
        type="iconButton"
        icon="h-icon-export"
        @click="onOpenExportDetail"
      >
        导出
      </el-button>
      <h-paged-table
        ref="detailTable"
        class="statistics-page-table"
        :data="json => json.data.list"
        :total="json => json.data.total"
        :fetch="fetchDetail"
        :page-size="detailPageSize"
        style="height:540px;"
        :current-page="detailPageNo"
        @fetch-success="detailFetchSuccess"
      >
        <el-table slot-scope="props" :data="props.data" force-scroll>
          <el-table-column label="序号" width="80">
            <template slot-scope="scope">
              {{ getDetailIndex(scope.$index) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="vehicleLicensePlate"
            label="车牌号"
            width="120"
          ></el-table-column>
          <el-table-column
            prop="mileageBroke"
            label="不连续里程(公里)"
          ></el-table-column>
          <el-table-column label="起点GPS时间">
            <template slot-scope="scope">
              {{ scope.row.beginTime | formateDateTime }}
            </template>
          </el-table-column>
          <el-table-column label="起点GPS速度（公里/小时）">
            <template slot-scope="scope">
              {{ scope.row.beginSpeed | formatSpeed }}
            </template>
          </el-table-column>
          <el-table-column label="终点GPS时间">
            <template slot-scope="scope">
              {{ scope.row.endTime | formateDateTime }}
            </template>
          </el-table-column>
          <el-table-column prop="endSpeed" label="终点GPS速度（公里/小时）">
            <template slot-scope="scope">
              {{ scope.row.endSpeed | formatSpeed }}
            </template>
          </el-table-column>
        </el-table>
      </h-paged-table>
    </el-dialog>
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
    <el-dialog
      title="导出"
      :visible.sync="detailExportDialogVisible"
      :area="480"
      top="middle"
      class="export-dialog"
    >
      <div>
        从第
        <el-input-number
          v-model="detailExportStartPage"
          :min="1"
          :max="detailMaxExportPage"
        ></el-input-number>
        页
      </div>
      <div style="margin:0 10px;">到</div>
      <div>
        第
        <el-input-number
          v-model="detailExportEndPage"
          :min="1"
          :max="detailMaxExportPage"
        ></el-input-number>
        页
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onExportDetail">
          确 定
        </el-button>
        <el-button @click="detailExportDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </h-layout>
</template>

<script>
import VehicleTree from '@/components/Tree';
import {
  queryGpsIntegrityRate,
  pageIntegrityRateDetailQuery
} from '@/api/statistics';
import { toTimezoneString } from '@/components/util.js';
import { downloadExcel } from '@/core/httpInstance';
import alarmUtils from '@/utils/alarm';

export default {
  // 轨迹完整率
  name: 'TrackStatistics',
  components: {
    VehicleTree
  },
  filters: {
    formatSpeed(value) {
      return alarmUtils.formatSpeed(value);
    }
  },
  data() {
    return {
      pageNo: 1,
      pageSize: 30,
      detailPageNo: 1,
      detailPageSize: 30,
      total: 0,
      detailTotal: 0,
      loading: false,
      shouldSearch: false,
      dialogVisible: false,
      exportDialogVisible: false,
      exportStartPage: 1,
      exportEndPage: 1,
      maxExportPage: 1,
      detailExportStartPage: 1,
      detailExportEndPage: 1,
      detailMaxExportPage: 1,
      detailExportDialogVisible: false,
      searchCondition: {
        indexCodes: [],
        date: ''
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now() - 24 * 60 * 60 * 1000;
        }
      }
    };
  },
  methods: {
    checkParams() {
      if (this.searchCondition.indexCodes.length === 0) {
        this.$message.warning('请选择车辆');
        return false;
      }
      if (!this.searchCondition.date) {
        this.$message.warning('请选择日期');
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
        beginTime: toTimezoneString(this.searchCondition.date),
        endTime: toTimezoneString(
          this.searchCondition.date.getTime() + 24 * 60 * 60 * 1000 - 1
        ),
        pageNo: page,
        pageSize: perPage,
        exactCondition: {
          vehicleIndexCodes: this.searchCondition.indexCodes
        }
      };
      this.pageNo = page;
      return queryGpsIntegrityRate(params);
    },
    fetchDetail(url, perPage, page) {
      if (!this.shouldSearchDetail) {
        return Promise.resolve();
      }
      const beginTime = new Date(
        new Date(this.trackData.beginTime).setHours(0)
      );
      const params = {
        beginTime: toTimezoneString(beginTime),
        endTime: toTimezoneString(
          beginTime.getTime() + 24 * 60 * 60 * 1000 - 1
        ),
        pageNo: page,
        pageSize: perPage,
        vehicleIndexCode: this.trackData.vehicleIndexCode
      };
      this.detailPageNo = page;
      return pageIntegrityRateDetailQuery(params);
    },
    getSelectedNodes(node) {
      this.searchCondition.indexCodes = node.map(item => item.id);
    },
    getIndex(index) {
      return (this.pageNo - 1) * this.pageSize + index + 1;
    },
    getDetailIndex(index) {
      return (this.detailPageNo - 1) * this.detailPageSize + index + 1;
    },
    fetchSuccess(json) {
      if (json.code === '0') {
        if (json.data.pageSize) {
          this.pageSize = json.data.pageSize;
        }
        this.total = json.data.total;
      }
    },
    detailFetchSuccess(json) {
      if (json.code === '0') {
        if (json.data.pageSize) {
          this.detailPageSize = json.data.pageSize;
        }
        this.detailTotal = json.data.total;
      }
    },
    onView(data) {
      this.dialogVisible = true;
      this.trackData = data;
      this.$nextTick(() => {
        this.shouldSearchDetail = true;
        if (this.detailPageNo === 1) {
          this.$refs.detailTable.reload();
        } else {
          this.detailPageNo = 1;
        }
      });
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
        beginTime: toTimezoneString(this.searchCondition.date),
        endTime: toTimezoneString(
          this.searchCondition.date.getTime() + 24 * 60 * 60 * 1000 - 1
        ),
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        vehicleIndexCodes: this.searchCondition.indexCodes.join(',')
      };
      downloadExcel(
        `/${process.env.VUE_APP_CONTEXT}/statistic/gps/gpsIntegrityRateExport.do`,
        params
      );
      this.exportDialogVisible = false;
    },
    onOpenExportDetail() {
      if (this.detailTotal === 0) {
        this.$message.warning('没有要导出的数据');
        return;
      }
      this.detailMaxExportPage = Math.ceil(
        this.detailTotal / this.detailPageSize
      );
      this.detailExportDialogVisible = true;
    },
    onExportDetail() {
      if (this.detailExportStartPage > this.detailExportEndPage) {
        this.$message.warning('导出开始页数不能大于结束页数');
        return;
      }
      const beginTime = new Date(
        new Date(this.trackData.beginTime).setHours(0)
      );
      const params = {
        beginPage: this.detailExportStartPage,
        endPage: this.detailExportEndPage,
        beginTime: toTimezoneString(beginTime),
        endTime: toTimezoneString(
          beginTime.getTime() + 24 * 60 * 60 * 1000 - 1
        ),
        pageNo: this.detailPageNo,
        pageSize: this.detailPageSize,
        vehicleIndexCodes: this.trackData.vehicleIndexCode
      };
      downloadExcel(
        `/${process.env.VUE_APP_CONTEXT}/statistic/gps/gpsIntegrityRateDetailExport.do`,
        params
      );
      this.detailExportDialogVisible = false;
    }
  }
};
</script>

<style src="@/pages/statistics/statistics.scss" lang="scss"></style>
