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
        tree-type="4"
        :check-limit="2000"
        :is-need-filter="false"
        :is-need-check-box="false"
        :slot-line="3"
        @userClick="userClick"
      >
      </vehicle-tree>
    </h-layout-aside>
    <h-layout class="right-bar">
      <h-layout-header>
        <div style="display: flex; padding: 6px 10px">
          <div style="line-height: 32px">事件：</div>
          <el-select
            v-model="eventSelect"
            style="width: 10%; margin-right: 8px"
            placeholder="请选择"
            clear
          >
            <el-option
              v-for="item in options"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
          <div style="line-height: 32px">时间：</div>
          <el-date-picker
            v-model="searchCondition.date"
            :default-time="['00:00:00', '23:59:59']"
            value-format="timestamp"
            :picker-options="pickerOptions"
            type="datetimerange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 25%; margin-right: 8px"
          />
          <el-button
            type="primary"
            :loading="loading"
            @click="onSearch"
          >
            查询
          </el-button>
          <el-button type="iconButton" icon="h-icon-export" @click="onOpenExport">
            导出
          </el-button>
        </div>
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
          @size-change="pageSizeChange"
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
              prop="userId"
              label="用户"
              width="140"
            ></el-table-column>
            <el-table-column
              prop="operateTime"
              label="时间"
              width="160"
            >
              <template slot-scope="scope">
                <span>{{ getOperateTime(scope.row.operateTime) }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="type"
              label="事件"
              width="140"
            >
              <template slot-scope="scope">
                <span>{{ getEvent(scope.row.type) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" show-overflow-tooltip>
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
import { pageQueryOperation } from '@/api/statistics';
import { downloadExcel } from '@/core/httpInstance';
import { toTimeNormalString, toTimezoneString } from '../../components/util';
const now = new Date();
now.setHours(0);
now.setMinutes(0);
now.setSeconds(0);
now.setMilliseconds(0);
const endTime = now.getTime() + 24 * 60 * 60 * 1000 - 1;

export default {
  // 平台操作日志
  name: 'PlatformOperateRecord',
  components: {
    VehicleTree
  },
  data() {
    return {
      eventSelect: '',
      options: [
        {
          value: 'alarmDeal',
          label: '处理警情'
        },
        {
          value: 'alarmApprove',
          label: '核实警情'
        },
        {
          value: 'messageSend',
          label: '消息下发'
        },
        {
          value: 'trackQuery',
          label: '轨迹查询'
        },
        {
          value: 'terminalConfig',
          label: '终端远程配置'
        },
        {
          value: 'noTraffic',
          label: '夜间禁行'
        },
        {
          value: 'fatigueDriving',
          label: '疲劳驾驶'
        },
        {
          value: 'brtFence',
          label: '电子围栏'
        },
        // {
        //   value: 'createFence',
        //   label: '创建电子围栏'
        // },
        // {
        //   value: 'updateFence',
        //   label: '修改电子围栏'
        // },
        // {
        //   value: 'deleteFence',
        //   label: '删除电子围栏'
        // }
      ],
      deptIndexCode: undefined,
      userIndexCode: undefined,
      isClicked: false,
      tableData: [],
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
        date: [now, endTime]
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > endTime;
        },
        customValidation(start, end) {
          return end.getTime() - start.getTime() <= 31 * 24 * 60 * 60 * 1000;
        },
        customPrompt: '选择时间范围不能超过31天'
      }
    };
  },
  methods: {
    pageSizeChange(e) {
      this.pageSize = e;
    },
    //  table 事件解析
    getEvent(type) {
      return this.options.filter(item => item.value === type)[0].label;
    },
    //  table 时间解析
    getOperateTime(time) {
      return toTimeNormalString(toTimezoneString(time));
    },
    //  参数验证
    checkParams() {
      if (!this.isClicked) {
        this.$message.warning('请选择部门或用户');
        return false;
      }
      if (
        !this.searchCondition.date ||
        this.searchCondition.date.length !== 2
      ) {
        this.$message.warning('请选择开始和结束日期');
        return false;
      }
      return true;
    },
    //  查询 table 数据
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
          this.searchCondition.date[1]
        ),
        pageNo: page,
        pageSize: perPage,
        deptIndexCode: this.deptIndexCode,
        userIndexCode: this.userIndexCode,
        type: this.eventSelect === '' ? undefined : this.eventSelect
      };
      this.pageNo = page;
      return pageQueryOperation(params);
    },
    userClick(node) {
      this.isClicked = true;
      if (node.parent) {
        this.deptIndexCode = node.id;
        this.userIndexCode = undefined;
      } else {
        this.userIndexCode = node.id;
        this.deptIndexCode = undefined;
      }
      // this.searchCondition.indexCodes = node.map(item => item.id);
    },
    getIndex(index) {
      return (this.pageNo - 1) * this.pageSize + index + 1;
    },
    fetchSuccess(json) {
      if (json.code === '0') {
        // this.pageSize = json.data.pageSize;
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
      const paramsTemp = {};
      const params = {
        beginPage: this.exportStartPage,
        beginTime: toTimezoneString(this.searchCondition.date[0]),
        endPage: this.exportEndPage,
        endTime: toTimezoneString(this.searchCondition.date[1]),
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        deptIndexCode: this.deptIndexCode,
        userIndexCode: this.userIndexCode,
        type: this.eventSelect === '' ? undefined : this.eventSelect
      };
      Object.keys(params).forEach(item => {
        if (params[item]) {
          paramsTemp[item] = params[item];
        }
      });
      downloadExcel(
        `/${process.env.VUE_APP_CONTEXT}/operation/exportOperation.do`,
        paramsTemp
      );
      this.exportDialogVisible = false;
    }
  }
};
</script>

<style src="@/pages/statistics/statistics.scss" lang="scss"></style>
