<template xmlns:margin-bottom="http://www.w3.org/1999/xhtml">
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
<!--        <template slot="time">-->
<!--          <div class="mbs">-->
<!--            <el-date-picker-->
<!--              v-model="beginTime"-->
<!--              placeholder="请选择开始日期"-->
<!--              type="datetime"-->
<!--              :picker-options="pickerOptions"-->
<!--            ></el-date-picker>-->
<!--          </div>-->
<!--          <div class="mbs">-->
<!--            <el-date-picker-->
<!--              v-model="endTime"-->
<!--              placeholder="请选择结束日期"-->
<!--              type="datetime"-->
<!--              :picker-options="pickerOptions"-->
<!--            ></el-date-picker>-->
<!--          </div>-->
<!--        </template>-->
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
            <el-table-column prop="orgName" label="所属单位"></el-table-column>
            <el-table-column label="超速时长">
              <template slot-scope="scope">
                {{ getContinueTime(scope.row.continueTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="alarmNum" label="超速次数"></el-table-column>
            <el-table-column prop="distance" label="超速里程"></el-table-column>
            <el-table-column prop="averageSpeed" label="平均速度(km/h)">
              <template slot-scope="scope">
                <p>{{ formatSpeed(scope.row.averageSpeed) }}</p>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template slot-scope="scope">
                <el-button type="link" @click="onView(scope.row)">
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </h-paged-table>
      </h-layout-content>
    </h-layout>
    <el-dialog
      title="超速详情"
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
        @fetch-success="detailFetchSuccess"
      >
        <el-table slot-scope="props" :data="props.data" force-scroll>
          <el-table-column label="序号" width="80">
            <template slot-scope="scope">
              {{ getDetailIndex(scope.$index) }}
            </template>
          </el-table-column>
          <el-table-column label="报警时间">
            <template slot-scope="scope">
              {{ scope.row.beginTime | formateDateTime }}
            </template>
          </el-table-column>
          <el-table-column prop="averageSpeed" label="报警速度(km/h)">
            <template slot-scope="scope">
              <p>{{ formatSpeed(scope.row.averageSpeed) + ' km/h'}}</p>
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
import VehicleTree from '../../components/Tree.vue';
import {
  pageQueryOverSpeed,
  pageQueryOverSpeedDetail
} from '../../api/overSpeed.js';
import { toTimezoneString } from '../../components/util.js';
import { downloadExcel } from '../../core/httpInstance.js';
import alarmUtils from '@/utils/alarm';

export default {
  // 车辆超速统计
  name: 'OverSpeed',
  components: {
    VehicleTree
  },
  data() {
    return {
      pageNo: 1,
      pageSize: 30,
      total: 0,
      detailPageNo: 1,
      detailPageSize: 30,
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
      shouldSearchDetail: false,
      searchCondition: {
        indexCodes: [],
        eventTypes: [132405],
        date: ''
      },
      beginTime: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate(),
        0,
        0,
        0
      ),
      endTime: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate(),
        23,
        59,
        59
      ),
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now() - 24 * 60 * 60 * 1000;
        },
        customValidation(start, end) {
          return end.getTime() - start.getTime() < 31 * 24 * 60 * 60 * 1000;
        },
        customPrompt: '选择时间范围不能超过31天'
        // disabledDate(time) {
        //   return (
        //     time.getTime() >
        //     new Date(
        //       new Date().getFullYear(),
        //       new Date().getMonth(),
        //       new Date().getDate(),
        //       23,
        //       59,
        //       59
        //     ).getTime()
        //   );
        // }
      }
    };
  },
  methods: {
    formatSpeed(value) {
      return alarmUtils.formatSpeed(value);
    },
    checkParams() {
      if (this.searchCondition.indexCodes.length === 0) {
        this.$message({
          type: 'warning',
          message: '请选择车辆'
        });
        return false;
      }
      if (!this.searchCondition.date) {
        this.$message.warning('请选择日期');
        return false;
      }
      // if (!this.beginTime) {
      //   this.$message({
      //     type: 'warning',
      //     message: '检查开始时间'
      //   });
      //   return false;
      // }
      // if (!this.endTime) {
      //   this.$message({
      //     type: 'warning',
      //     message: '检查结束时间'
      //   });
      //   return false;
      // }
      // if (this.endTime - this.beginTime > 30 * 24 * 3600 * 1000) {
      //   this.$message({
      //     type: 'warning',
      //     message: '时间间隔不得大于30天'
      //   });
      //   return false;
      // }
      // if (this.beginTime >= this.endTime) {
      //   this.$message({
      //     type: 'warning',
      //     message: '开始时间大于结束时间'
      //   });
      //   return false;
      // }
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
    onView(data) {
      this.dialogVisible = true;
      this.detailRow = data;
      this.$nextTick(() => {
        this.shouldSearchDetail = true;
        this.$refs.detailTable.reload();
      });
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
        vehicleIndexCodes: this.searchCondition.indexCodes,
        eventTypes: this.searchCondition.eventTypes
      };
      return pageQueryOverSpeed(params);
    },
    fetchDetail(url, perPage, page) {
      if (!this.shouldSearchDetail) {
        return Promise.resolve();
      }
      const params = {
        beginTime: toTimezoneString(this.searchCondition.date[0]),
        endTime: toTimezoneString(
          this.searchCondition.date[1].getTime() + 24 * 60 * 60 * 1000 - 1
        ),
        pageNo: page,
        pageSize: perPage,
        alarmTime: this.detailRow.beginTime,
        eventId: this.detailRow.eventId
      };
      return pageQueryOverSpeedDetail(params);
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
        this.pageNo = json.data.pageNo;
        this.pageSize = json.data.pageSize;
        this.total = json.data.total;
      }
    },
    detailFetchSuccess(json) {
      if (json.code === '0') {
        this.detailPageNo = json.data.pageNo;
        this.detailPageSize = json.data.pageSize;
        this.detailTotal = json.data.total;
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
        beginTime: toTimezoneString(this.beginTime),
        endTime: toTimezoneString(this.endTime),
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        vehicleIndexCodes: this.searchCondition.indexCodes,
        eventTypes: this.searchCondition.eventTypes
      };
      downloadExcel(
        `/${process.env.VUE_APP_CONTEXT}/statistic/alarm/exportOverSpeed.do`,
        params
      );
      this.exportDialogVisible = false;
    },
    getContinueTime(time) {
      if (time === 0) {
        return '0';
      }
      if (!time || time === 0) {
        return '-';
      }
      const hour = Math.floor(time / 3600);
      const minute = Math.floor(time / 60) % 60;
      const second = time % 60;
      return (
        (hour !== 0 ? `${hour}小时` : '') +
        (minute !== 0 ? `${minute}分钟` : '') +
        (second !== 0 ? `${second}秒` : '')
      );
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
      const params = {
        beginPage: this.detailExportStartPage,
        endPage: this.detailExportEndPage,
        beginTime: toTimezoneString(this.beginTime),
        endTime: toTimezoneString(this.endTime),
        pageNo: this.detailPageNo,
        pageSize: this.detailPageSize,
        alarmTime: toTimezoneString(this.detailRow.beginTime),
        eventId: this.detailRow.eventId
      };
      downloadExcel(
        `/${process.env.VUE_APP_CONTEXT}/statistic/alarm/exportOverSpeedDetail.do`,
        params
      );
      this.detailExportDialogVisible = false;
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
