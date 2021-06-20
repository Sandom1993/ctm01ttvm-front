<template>
  <h-layout class="statistics-page">
    <h-layout-aside width="280px" class="left-bar">
      <org-tree
        ref="resourceTree"
        :top="8"
        :bottom="8"
        :left="8"
        :right="8"
        tree-key="indexCode"
        tree-type="1"
        :check-limit="2000"
        :slot-line="3"
        search-resource-type="ORG"
        @getSelectedNodes="getSelectedNodes"
      >
        <template slot="time">
          <el-form label-position="top">
            <el-form-item label="在线统计时间" required style="margin-bottom:0">
              <el-input-number
                v-model="searchCondition.duration"
                :min="1"
                :max="1440"
                style="width: 230px;"
              ></el-input-number>
              分钟
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
      </org-tree>
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
          @current-change="onCurrentChange"
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
            <el-table-column prop="orgName" label="组织名称"></el-table-column>
            <el-table-column prop="totalNum" label="车辆总数"></el-table-column>
            <el-table-column prop="runNum" label="运营车辆数"></el-table-column>
            <el-table-column
              prop="stopNum"
              label="停运车辆数"
            ></el-table-column>
            <el-table-column
              prop="onlineNum"
              label="在线车辆数"
            ></el-table-column>
            <el-table-column label="实时在线率">
              <template slot-scope="scope">
                {{ (scope.row.onlineRate * 100).toFixed(2) + '%' }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="155">
              <template slot-scope="scope">
                <el-button type="link" @click="onViewStatus(scope.row)">
                  运营信息
                </el-button>
                <el-button type="link" @click="onViewOnline(scope.row)">
                  在线信息
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </h-paged-table>
      </h-layout-content>
    </h-layout>
    <el-dialog
      title="运营信息"
      :visible.sync="statusDialogVisible"
      :area="960"
      top="middle"
    >
      <el-button
        type="iconButton"
        icon="h-icon-export"
        @click="onOpenStatusExport"
      >
        导出
      </el-button>
      <h-paged-table
        ref="detailTable"
        class="statistics-page-table"
        :data="json => json.data.list"
        :total="json => json.data.total"
        :fetch="fetchStatus"
        :page-size="statusPageSize"
        :current-page="statusPageNo"
        style="height:540px;"
        @fetch-success="statusFetchSuccess"
      >
        <el-table slot-scope="props" :data="props.data" force-scroll>
          <el-table-column label="序号" width="80">
            <template slot-scope="scope">
              {{ getDetailIndex(scope.$index) }}
            </template>
          </el-table-column>
          <el-table-column prop="orgName" label="组织名称"></el-table-column>
          <el-table-column
            prop="vehicleLicensePlate"
            label="车牌号"
            width="120"
          ></el-table-column>
          <el-table-column prop="vehicleStatus" label="运营状态">
            <template slot-scope="scope">
              {{ scope.row.vehicleStatus === 0 ? '正常' : '停运' }}
            </template>
          </el-table-column>
          <el-table-column label="最后上报时间">
            <template slot-scope="scope">
              {{ scope.row.time | formateDateTime }}
            </template>
          </el-table-column>
        </el-table>
      </h-paged-table>
    </el-dialog>
    <el-dialog
      title="在线信息"
      :visible.sync="onlineDialogVisible"
      :area="960"
      top="middle"
    >
      <el-button
        type="iconButton"
        icon="h-icon-export"
        @click="onOpenOnlineExport"
      >
        导出
      </el-button>
      <h-paged-table
        ref="onlineTable"
        class="statistics-page-table"
        :data="json => json.data.list"
        :total="json => json.data.total"
        :fetch="fetchOnline"
        :page-size="onlinePageSize"
        style="height:540px;"
        :current-page="onlinePageNo"
        @fetch-success="onlineFetchSuccess"
      >
        <el-table slot-scope="props" :data="props.data" force-scroll>
          <el-table-column label="序号" width="80">
            <template slot-scope="scope">
              {{ getOnlineIndex(scope.$index) }}
            </template>
          </el-table-column>
          <el-table-column prop="orgName" label="组织名称"></el-table-column>
          <el-table-column
            prop="vehiclePlate"
            label="车牌号"
            width="120"
          ></el-table-column>
          <el-table-column label="在线状态">
            <template slot-scope="scope">
              {{ scope.row.status === 0 ? '在线' : '离线' }}
            </template>
          </el-table-column>
          <el-table-column label="最后上报时间">
            <template slot-scope="scope">
              {{ scope.row.latestOnlineTime | formateDateTime }}
            </template>
          </el-table-column>
        </el-table>
      </h-paged-table>
    </el-dialog>
    <el-dialog
      title="导出在线率统计"
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
      title="导出运营信息"
      :visible.sync="statusExportDialogVisible"
      :area="480"
      top="middle"
      class="export-dialog"
    >
      <div>
        从第
        <el-input-number
          v-model="statusExportStartPage"
          :min="1"
          :max="statusMaxExportPage"
        ></el-input-number>
        页
      </div>
      <div style="margin:0 10px;">到</div>
      <div>
        第
        <el-input-number
          v-model="statusExportEndPage"
          :min="1"
          :max="statusMaxExportPage"
        ></el-input-number>
        页
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onExportStatus">
          确 定
        </el-button>
        <el-button @click="statusExportDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="导出在线信息"
      :visible.sync="onlineExportDialogVisible"
      :area="480"
      top="middle"
      class="export-dialog"
    >
      <div>
        从第
        <el-input-number
          v-model="onlineExportStartPage"
          :min="1"
          :max="onlineMaxExportPage"
        ></el-input-number>
        页
      </div>
      <div style="margin:0 10px;">到</div>
      <div>
        第
        <el-input-number
          v-model="onlineExportEndPage"
          :min="1"
          :max="onlineMaxExportPage"
        ></el-input-number>
        页
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onExportOnline">
          确 定
        </el-button>
        <el-button @click="onlineExportDialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </h-layout>
</template>

<script>
import OrgTree from '@/components/OrgTree';
import {
  pageQueryOnlineRate,
  pageQueryOnlineRateDetail,
  pageQueryVehicleStatusDetail
} from '@/api/statistics';
import { toTimezoneString } from '@/components/util.js';
import { downloadExcel } from '@/core/httpInstance';

export default {
  // 车辆在线率
  name: 'OrgOnlineRate',
  components: {
    OrgTree
  },
  data() {
    return {
      pageNo: 1,
      pageSize: 30,
      statusPageNo: 1,
      statusPageSize: 30,
      onlinePageNo: 1,
      onlinePageSize: 30,
      total: 0,
      loading: false,
      shouldSearch: false,
      exportDialogVisible: false,
      statusDialogVisible: false,
      onlineDialogVisible: false,
      exportStartPage: 1,
      exportEndPage: 1,
      maxExportPage: 1,
      statusExportStartPage: 1,
      statusExportEndPage: 1,
      statusMaxExportPage: 1,
      statusExportDialogVisible: false,
      statusTotal: 0,
      onlineExportStartPage: 1,
      onlineExportEndPage: 1,
      onlineMaxExportPage: 1,
      onlineTotal: 0,
      onlineExportDialogVisible: false,
      shoulSearchOnline: false,
      searchCondition: {
        indexCodes: [],
        duration: 30
      }
    };
  },
  methods: {
    checkParams() {
      if (this.$refs.resourceTree.getAllChecked().length === 0) {
        this.$message.warning('请选择组织');
        return false;
      }
      if (!this.searchCondition.duration) {
        this.$message.warning('请选择统计时间');
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
      const now = new Date();
      const params = {
        beginTime: toTimezoneString(
          now.getTime() - this.searchCondition.duration * 60 * 1000
        ),
        endTime: toTimezoneString(now),
        pageNo: page,
        pageSize: perPage,
        inCondition: {
          orgIndexCode: this.$refs.resourceTree
            .getAllChecked()
            .map(item => item.indexCode)
        }
      };
      return pageQueryOnlineRate(params);
    },
    // 查询运营信息
    fetchStatus(url, perPage, page) {
      if (!this.shouldSearchDetail) {
        return Promise.resolve();
      }
      const now = new Date();
      const params = {
        beginTime: toTimezoneString(
          now.getTime() - this.searchCondition.duration * 60 * 1000
        ),
        endTime: toTimezoneString(now),
        pageNo: page,
        pageSize: perPage,
        exactCondition: {
          orgIndexCode: [this.detailRow.orgIndexCode]
        }
      };
      this.statusPageNoCache = page;
      this.statusPageSizeCache = perPage;
      return pageQueryVehicleStatusDetail(params);
    },
    // 查询在线信息
    fetchOnline(url, perPage, page) {
      if (!this.shoulSearchOnline) {
        return Promise.resolve();
      }
      const now = new Date();
      const params = {
        beginTime: toTimezoneString(
          now.getTime() - this.searchCondition.duration * 60 * 1000
        ),
        endTime: toTimezoneString(now),
        pageNo: page,
        pageSize: perPage,
        orgIndexCode: this.detailRow.orgIndexCode,
        // 修改查询在线信息的参数
        status: 2
      };
      this.onlinePageNoCache = page;
      this.onlinePageSizeCache = perPage;
      return pageQueryOnlineRateDetail(params);
    },
    getSelectedNodes(node) {
      this.searchCondition.indexCodes = node.map(item => item.id);
    },
    getIndex(index) {
      return (this.pageNo - 1) * this.pageSize + index + 1;
    },
    getDetailIndex(index) {
      return (this.statusPageNo - 1) * this.statusPageSize + index + 1;
    },
    getOnlineIndex(index) {
      return (this.onlinePageNo - 1) * this.onlinePageSize + index + 1;
    },
    fetchSuccess(json) {
      if (json.code === '0') {
        this.pageSize = json.data.pageSize;
        this.total = json.data.total;
      }
    },
    onCurrentChange(pageNo) {
      this.pageNo = pageNo;
    },
    statusFetchSuccess(json) {
      if (json.code === '0') {
        this.statusPageNo = this.statusPageNoCache;
        this.statusPageSize = this.statusPageSizeCache;
        this.statusTotal = json.data.total;
      }
    },
    onlineFetchSuccess(json) {
      if (json.code === '0') {
        this.onlinePageNo = this.onlinePageNoCache;
        this.onlinePageSize = this.onlinePageSizeCache;
        this.onlineTotal = json.data.total;
      }
    },
    // 查看运营信息
    onViewStatus(data) {
      this.statusDialogVisible = true;
      this.detailRow = data;
      this.$nextTick(() => {
        this.shouldSearchDetail = true;
        if (this.statusPageNo === 1) {
          this.$refs.detailTable.reload();
        } else {
          this.statusPageNo = 1;
        }
      });
    },
    // 查看在线信息
    onViewOnline(data) {
      this.onlineDialogVisible = true;
      this.detailRow = data;
      this.$nextTick(() => {
        this.shoulSearchOnline = true;
        if (this.onlinePageNo === 1) {
          this.$refs.onlineTable.reload();
        } else {
          this.onlinePageNo = 1;
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
      const now = new Date();
      const params = {
        beginPage: this.exportStartPage,
        endPage: this.exportEndPage,
        beginTime: toTimezoneString(
          now.getTime() - this.searchCondition.duration * 60 * 1000
        ),
        endTime: toTimezoneString(now),
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        orgIndexCodes: this.$refs.resourceTree
          .getAllChecked()
          .map(item => item.indexCode)
          .join(',')
      };
      downloadExcel(
        `/${process.env.VUE_APP_CONTEXT}/statistic/online/exportOrgOnlineRate.do`,
        params
      );
      this.exportDialogVisible = false;
    },
    onOpenStatusExport() {
      if (this.statusTotal === 0) {
        this.$message.warning('没有要导出的数据');
        return;
      }
      this.statusExportStartPage = this.statusPageNo;
      this.statusExportEndPage = this.statusPageNo;
      this.statusMaxExportPage = Math.ceil(
        this.statusTotal / this.statusPageSizeCache
      );
      this.statusExportDialogVisible = true;
    },
    onExportStatus() {
      if (this.statusExportStartPage > this.statusExportEndPage) {
        this.$message.warning('导出开始页数不能大于结束页数');
        return;
      }
      const now = new Date();
      const params = {
        beginPage: this.statusExportStartPage,
        endPage: this.statusExportEndPage,
        beginTime: toTimezoneString(
          now.getTime() - this.searchCondition.duration * 60 * 1000
        ),
        endTime: toTimezoneString(now),
        pageNo: this.statusPageNo,
        pageSize: this.statusPageSize,
        orgIndexCodes: this.detailRow.orgIndexCode
      };
      downloadExcel(
        `/${process.env.VUE_APP_CONTEXT}/statistic/online/exportVehicleStatusDetail.do`,
        params
      );
      this.statusExportDialogVisible = false;
    },
    onOpenOnlineExport() {
      if (this.onlineTotal === 0) {
        this.$message.warning('没有要导出的数据');
        return;
      }
      this.onlineExportStartPage = this.onlinePageNo;
      this.onlineExportEndPage = this.onlinePageNo;
      this.onlineMaxExportPage = Math.ceil(
        this.onlineTotal / this.onlinePageSize
      );
      this.onlineExportDialogVisible = true;
    },
    onExportOnline() {
      if (this.onlineExportStartPage > this.onlineExportEndPage) {
        this.$message.warning('导出开始页数不能大于结束页数');
        return;
      }
      const now = new Date();
      const params = {
        beginPage: this.onlineExportStartPage,
        endPage: this.onlineExportEndPage,
        beginTime: toTimezoneString(
          now.getTime() - this.searchCondition.duration * 60 * 1000
        ),
        endTime: toTimezoneString(now),
        pageNo: this.onlinePageNo,
        pageSize: this.onlinePageSize,
        orgIndexCodes: this.detailRow.orgIndexCode,
        status: 2
      };
      downloadExcel(
        `/${process.env.VUE_APP_CONTEXT}/statistic/online/exportOrgOnlineRateDetail.do`,
        params
      );
      this.onlineExportDialogVisible = false;
    }
  }
};
</script>

<style src="@/pages/statistics/statistics.scss" lang="scss"></style>
