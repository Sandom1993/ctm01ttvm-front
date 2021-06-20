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
        :is-need-online="true"
        :is-need-search-type="true"
        :is-need-check-box="false"
        :slot-line="1"
        @getSelectedNodes="handleSelectedNodes"
        @deviceClick="switchDevice"
      >
        <template slot="query">
          <el-button type="primary" @click="handleIssued">
            下发
          </el-button>
        </template>
      </vehicle-tree>
    </h-layout-aside>
    <h-layout class="right-bar">
      <h-layout-header></h-layout-header>
      <h-layout-content style="overflow: auto;">
        <div ref="pageBox" class="table-box">
          <el-table
            :data="tableData"
            :height="tableHeight - 56"
            style="width: 100%"
          >
            <el-table-column prop="plateNo" label="车牌号" width="180" />
            <el-table-column prop="date" show-overflow-tooltip label="时间" />
            <el-table-column prop="person" label="操作人" />
            <el-table-column prop="ipAddress" label="目标平台地址" />
          </el-table>
          <el-pagination
            ref="pagination"
            :page-sizes="[30, 50, 100]"
            :page-size="pageSize"
            :current-page="pageNo"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="onSizeChange"
            @current-change="onCurrentChange"
          ></el-pagination>
        </div>
        <el-dialog
          :area="408"
          title="命令下发"
          :visible.sync="dialogVisible"
          :modal="false"
          :before-close="handleClose"
          size="small"
        >
          <div class="dialog-content">
            <el-form
              ref="ruleForm"
              :model="ruleForm"
              label-position="top"
              :rules="rules"
              label-width="100px"
              class="demo-ruleForm"
            >
              <el-form-item label="命令内容" prop="message">
                <el-input v-model="ruleForm.message"></el-input>
                <span>注意IP地址和端口号格式</span>
              </el-form-item>
            </el-form>
          </div>
          <div class="btn-footer">
            <el-button type="primary" @click="onIssued">
              下发
            </el-button>
            <el-button @click="handleClose">
              取消
            </el-button>
          </div>
          <div class="message-head">选择的{{ dialogTableData.length }}辆车</div>
          <el-table
            v-loading="dialogTableLoading"
            :data="dialogTableData"
            style="width: 100%"
            max-height="160px"
            class="broadcast-table"
          >
            <el-table-column
              type="index"
              label="序号"
              width="60"
            ></el-table-column>
            <el-table-column
              prop="plateNo"
              label="车牌"
              width="100"
            ></el-table-column>
            <el-table-column
              prop="isStandard"
              label="是否非标"
              width="80"
            ></el-table-column>
            <el-table-column label="下发结果" width="100" show-overflow-tooltip>
              <template slot-scope="scope">
                <span class="send-success">
                  {{ scope.row.msg }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-dialog>
      </h-layout-content>
    </h-layout>
  </h-layout>
</template>

<script>
import VehicleTree from '@/components/Tree';
import validate from '../../../components/validate';
import { batchBroadcast } from '@/api/location';
import { findIndexObject } from '../../../utils/common';
export default {
  // 命令下发
  name: 'CommandIssued',
  components: {
    VehicleTree
  },
  data() {
    return {
      ruleForm: {
        message: ''
      },
      rules: {
      },
      pageNo: 1,
      total: 0,
      targetIp: '',
      targetPort: '',
      dialogVisible: false,
      tableHeight: null,
      tableWidth: null,
      veList: [],
      dialogTableData: [],
      dialogTableLoading: false,
      tableData: [],
      selectedNodes: [],
      pageSize: 30
    };
  },
  mounted() {
    this.resize();
    window.addEventListener('resize', this.resize);
  },
  destroyed() {
    window.removeEventListener('resize', this.resize);
  },
  methods: {
    //  命令下发提交
    onIssued() {
      const standardArr = [];
      const unStandardArr = [];
      this.veList.forEach(item => {
        if (item.isStandard) {
          standardArr.push(item);
        } else {
          unStandardArr.push(item);
        }
      });
      this.$refs.ruleForm.validate((valid, invalidFields) => {
        if (valid) {
          const params = {
            message: this.ruleForm.message,
            type: 1,
            userId: '',
            vehicles: standardArr.length > 0 ? standardArr : unStandardArr
          };
          this.dialogTableLoading = true;
          batchBroadcast(params).then(res => {
            if (res.code === '0') {
              res.data.forEach(item => {
                findIndexObject(this.dialogTableData, [
                  'plateNo',
                  item.data
                ]).msg = item.msg ? item.msg : '成功';
              });
              this.dialogTableLoading = false;
            }
          });
        } else {
          this.$refs.ruleForm.focusFirstField();
          return false;
        }
      });
    },
    //  重置表格
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    //  重置表格验证规则
    resetValidates(formName) {
      this.$refs[formName].resetValidates();
    },
    //  关闭命令下发弹框
    handleClose() {
      this.resetValidates('ruleForm');
      this.resetForm('ruleForm');
      this.dialogVisible = false;
    },
    //  打开命令下发弹框
    handleIssued() {
      if (this.selectedNodes.length === 0) {
        this.$msgbox({
          title: '提示',
          type: 'warning',
          message: '请先选择车辆'
        });
      } else {
        const arr = [];
        const veArr = [];
        this.selectedNodes.forEach(item => {
          const obj = { plateNo: item.name, msg: '', isStandard: item.isStandard ? '否' : '是' };
          const veObj = { plateNo: item.name, vehicleIndexCode: item.id, isStandard: item.isStandard };
          arr.push(obj);
          veArr.push(veObj);
        });
        this.dialogTableData = [...arr];
        this.veList = [...veArr];
        this.targetIp = undefined;
        this.targetPort = undefined;
        this.dialogVisible = true;
      }
    },
    //  查询表格
    handleQuery() {},
    resize() {
      this.tableHeight = this.$refs.pageBox.clientHeight;
      this.tableWidth = this.$refs.pageBox.clientWidth;
    },
    onCurrentChange(pageNo) {
      this.pageNo = pageNo;
      this.handleQuery();
    },
    onSizeChange(pageSize) {
      this.pageSize = pageSize;
      this.handleQuery();
    },
    handleSelectedNodes(nodes) {
      this.selectedNodes = nodes;
    },
    switchDevice(nodes) {
      this.selectedNodes = nodes;
    }
  }
};
</script>

<style src="@/pages/statistics/statistics.scss" lang="scss"></style>
<style lang="scss" scoped>
::v-deep {
  .el-dialog__body {
    padding: 0;
  }
  .el-form-item {
    margin-bottom: 0;
  }
}
.dialog-content::v-deep {
  padding: 12px;
  font-size: 12px;
}
.table-box {
  height: 100%;
}
.btn-footer {
  text-align: right;
  padding: 10px;
  background: #f5f5f5;
}
.message-head {
  padding: 0 12px;
}
.broadcast-table::v-deep {
  padding: 0 12px 12px 12px;
  border: 0;
  &::before,
  &::after {
    display: none;
  }
  th {
    background: none !important;
    border: 0;
    padding: 5px;
    height: 30px;
    color: rgba(0, 0, 0, 0.4);
  }
  th:not(:first-child) > .cell:after {
    display: none;
  }
  td {
    border: 0;
    padding: 5px;
    height: 30px;
  }
  .el-table__body-wrapper::before {
    display: none;
  }
}
</style>
