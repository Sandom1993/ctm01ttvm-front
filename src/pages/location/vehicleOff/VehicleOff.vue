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
        :is-need-check-box="true"
        :slot-line="1"
        @getSelectedNodes="handleSelectedNodes"
        @deviceClick="switchDevice"
      >
        <template slot="btns">
          <el-button
            :min-width="100"
            size="small"
            type="primary"
            @click="handleVehicleOn"
          >
            启用
          </el-button>
          <el-button
            :min-width="100"
            size="small"
            type="primary"
            @click="handleVehicleOff"
          >
            停运
          </el-button>
        </template>
      </vehicle-tree>

    </h-layout-aside>

    <h-layout class="right-bar">
      <h-layout-header>
        <el-row :gutter="8">
          <el-col :span="12">
            <h4>车辆停运记录表</h4>
          </el-col>
          <el-col :span="4">
            <el-select
              v-model="queryParams.idleStatus"
              placeholder="操作状态"
              clear
            >
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-col>
          <el-col :span="6">
            <el-date-picker
              v-model="queryParams.date"
              :default-time="['00:00:00', '23:59:59']"
              value-format="timestamp"
              :picker-options="pickerOptions"
              type="datetimerange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            />
          </el-col>
          <el-col :span="2">
            <el-button type="primary" style="width: 100%" @click="handleQuery">
              查询
            </el-button>
            <!--            <el-button type="primary" @click="handleVehicleOff">
                          停运
                        </el-button>-->
          </el-col>
        </el-row>
      </h-layout-header>
      <h-layout-content style="overflow: auto;">
        <div ref="pageBox" class="table-box">
          <el-table
            v-loading="tableLoading"
            :data="tableData"
            :height="tableHeight - 56"
            style="width: 100%"
          >
            <el-table-column prop="vehiclePlateNo" label="车牌号" width="180" />
            <el-table-column prop="updateTime" show-overflow-tooltip label="操作时间" />
            <el-table-column prop="userId" label="操作人" />
            <el-table-column prop="idleStatus" label="操作状态">
              <template slot-scope="scope">{{ scope.row.idleStatus === '1' ? '停运' : '启用' }}</template>
            </el-table-column>
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
<!--        <el-dialog
          :area="408"
          title="车辆停运管理"
          :visible.sync="dialogVisible"
          :modal="false"
          :before-close="handleClose"
          size="small"
        >
          <div v-loading="dialogLoading" class="dialog-content">
            <el-radio v-model="isOff" class="radio" label="0">运行</el-radio>
            <el-radio v-model="isOff" class="radio" label="1">停运</el-radio>
          </div>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="handleOk">
              确 定
            </el-button>
            <el-button @click="handleClose">取 消</el-button>
          </div>
        </el-dialog>-->
      </h-layout-content>
    </h-layout>
  </h-layout>
</template>

<script>
import VehicleTree from '@/components/TreeVehicle';
import { toTimeNormalString, toTimezoneString } from '@/components/util';
import { queryVehicleOffPage, vehicleOff } from '@/api/vehicleOff';
import { remove } from 'lodash'
const now = new Date();
now.setHours(0);
now.setMinutes(0);
now.setSeconds(0);
now.setMilliseconds(0);
const endTime = now.getTime() + 24 * 60 * 60 * 1000 - 1;
export default {
  // 车辆停运管理
  name: 'VehicleOff',
  components: {
    VehicleTree
  },
  data() {
    return {
      pageNo: 1,
      total: 0,
      isOff: '0',
      queryParams: {
        idleStatus: '',
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
      },
      tableLoading: false,
      dialogVisible: false,
      dialogLoading: false,
      tableHeight: null,
      tableWidth: null,
      options: [
        {
          value: '0',
          label: '启用'
        },
        {
          value: '1',
          label: '停运'
        }
      ],
      veList: [],
      tableData: [],
      selectedNodes: [],
      pageSize: 30
    };
  },
  created() {
  },
  mounted() {
    this.resize();
    window.addEventListener('resize', this.resize);
  },
  destroyed() {
    window.removeEventListener('resize', this.resize);
  },
  methods: {
    //  关闭车辆停运管理弹框
    handleClose() {
      this.dialogVisible = false;
      this.isOff = '0';
    },
    handleOk(isOff) {
        const vehicleIndexCodes = this.selectedNodes.map( item => {
           return item.indexCode;
        });
        const params = {
            idleStatus: isOff,
            vehicleIndexCodes: vehicleIndexCodes
        };

        vehicleOff(params).then(res => {
            if (res.code === '0') {
                this.$message({
                    type: 'success',
                    message: '操作成功!'
                });
                this.$refs.resourceTree.handleReload();
            } else {
                this.$message({
                    type: 'success',
                    message: '操作失败!'
                });
            }
        });

        // let vehicleIndexCodes =[]
        // const newSelect = [...this.selectedNodes]
        // newSelect.forEach( it => {
        //     if (it.idleStatus === isOff) {
        //         _.remove(newSelect, function(item){
        //             return item.idleStatus == isOff
        //         });
        //     }
        // })
        //
        //
        // if (newSelect.length !== 0) {
        //     vehicleIndexCodes = newSelect.map(item => {
        //         return item.indexCode;
        //     });
        //
        //     const params = {
        //         idleStatus: isOff,
        //         vehicleIndexCodes: vehicleIndexCodes
        //     };
        //     vehicleOff(params).then(res => {
        //         if (res.code === '0') {
        //             this.$message({
        //                 type: 'success',
        //                 message: '操作成功!'
        //             });
        //             this.$refs.resourceTree.handleReload();
        //         } else {
        //             this.$message({
        //                 type: 'success',
        //                 message: '操作失败!'
        //             });
        //         }
        //     });
        // }
    },
    handleVehicleOff() {
      this.$refs.resourceTree.getVehicleStatus('off');
      if (this.selectedNodes.length === 0) {
        this.$msgbox({
          title: '提示',
          type: 'warning',
          message: '请先选择车辆'
        });
        return false;
      }
      this.openMsgBox('1');
      this.dialogVisible = true;
    },
    handleVehicleOn() {
      this.$refs.resourceTree.getVehicleStatus('on');
      if (this.selectedNodes.length === 0) {
        this.$msgbox({
          title: '提示',
          type: 'warning',
          message: '请先选择车辆'
        });
        return false;
      }
      this.openMsgBox('0');
      this.dialogVisible = true;
    },
    //  查询表格
    handleQuery() {
      if (this.queryParams.date.length === 0) {
        this.$msgbox({
          title: '提示',
          type: 'warning',
          message: '请先选择日期'
        });
        return false;
      }
      this.tableLoading = true;
      const vehicleIndexCodes = this.selectedNodes.map(item => {
        return item.indexCode;
      });
      const { queryParams: { idleStatus, date }, pageNo, pageSize } = this;
      const params = {
        pageNo,
        pageSize,
        beginTime: toTimezoneString(date[0]),
        endTime: toTimezoneString(date[1]),
        idleStatus: idleStatus === '' ? undefined : idleStatus,
        vehicleIndexCodes
      };
      queryVehicleOffPage(params)
        .then(res => {
          if (res.code === '0') {
            this.tableData = res.data.list.map(item => {
              item.updateTime = toTimeNormalString(
                toTimezoneString(item.updateTime)
              );
              return item;
            });
            this.tableLoading = false;
            this.total = res.data.total;
          } else {
            this.tableLoading = false;
          }
        })
        .catch(() => {
          this.tableLoading = false;
        });
    },
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
    switchDevice() {
    },
    //  打开消息确认弹出层
    openMsgBox(type) {
      if (type === '0') {
        //  运行
        this.$confirm('是否确认启用操作?', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
          .then(() => {
            this.handleOk(type);
          })
          .catch(() => {});
      } else if (type === '1') {
        this.$confirm('是否确认停运操作?', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
          .then(() => {
            this.handleOk(type);
          })
          .catch(() => {});
      }
    }
  }
};
</script>

<style src="@/pages/statistics/statistics.scss" lang="scss"></style>
<style lang="scss" scoped>
::v-deep {
  /*.el-dialog__body {*/
  /*  padding: 0;*/
  /*}*/
}
/*.dialog-content::v-deep {*/
/*  padding: 12px;*/
/*  font-size: 12px;*/
/*}*/
.table-box {
  height: 100%;
}
h4{line-height: 32px;height:32px}
</style>
