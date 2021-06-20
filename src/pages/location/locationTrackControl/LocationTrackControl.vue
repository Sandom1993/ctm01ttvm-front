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
        :slot-line="1"
        :is-need-check-box="false"
        @deviceClick="switchDevice"
      ></vehicle-tree>
    </h-layout-aside>
    <h-layout class="right-bar">
      <h-layout-content v-loading="contentLoading" style="overflow: auto;">
        <div class="right-content">
          <el-form
            ref="dataForm"
            :rules="dataFormRules"
            label-width="120px"
            content-width="480px"
            label-position="right"
            :model="dataForm"
          >
            <el-form-item label="时间间隔" prop="interval">
              <el-input
                v-model="dataForm.interval"
                :disabled="isDisabled"
                placeholder="请输入时间间隔"
                style="width: 70%"
              />
              (0~1800s)(0表示停止)
            </el-form-item>
            <el-form-item label="位置跟踪有效期" prop="positionTraceTerm">
              <el-input
                v-model="dataForm.positionTraceTerm"
                :disabled="isDisabled"
                placeholder="请输入位置跟踪有效期"
                style="width: 70%"
              />
              (0~65535s)
            </el-form-item>
          </el-form>
        </div>
      </h-layout-content>
      <h-layout-footer>
        <div class="footer-btn">
          <el-button
            type="primary"
            :disabled="isDisabled"
            @click="handleSaveSetting"
          >
            设置
          </el-button>
        </div>
      </h-layout-footer>
    </h-layout>
  </h-layout>
</template>

<script>
import VehicleTree from '@/components/Tree';
import { getVehicleDetail, terminalAbility } from '@/api/location';
export default {
  // 终端参数设置
  name: 'LocationTrackControl',
  components: {
    VehicleTree
  },
  data() {
    return {
      contentLoading: false,
      isDisabled: true,
      selectedNodes: [],
      dataForm: {
        interval: undefined,
        positionTraceTerm: undefined
      },
      dataFormRules: {
        interval: [{ required: true, message: '请输入时间间隔', trigger: 'blur' }],
        positionTraceTerm: [{ required: true, message: '请输入位置跟踪有效期', trigger: 'blur' }]
      },
      deviceIndexCode: null,
      deviceIndexCodes: []
    };
  },
  methods: {
    //  保存设置操作
    handleSaveSetting() {
      // if (this.selectedNodes.length === 0) {
      //   this.$msgbox({
      //     title: '提示',
      //     type: 'warning',
      //     message: '请先选择车辆'
      //   });
      //   return false;
      // }
      this.$refs.dataForm.validate((valid, invalidFields) => {
        if (valid) {
          this.contentLoading = true;
          const data = [...this.selectedNodes];
          let param = {};
          getVehicleDetail({ vehicleIndexCode: data[0].indexCode }).then(res => {
            if (res.code === '0') {
              param = {
                method: 'PositionTrack',
                params: {
                  indexCode: data[0].deviceIndexCode,
                  plateNo: data[0].name,
                  plateColor: res.data.vehicleLicenseColor,
                  simNumber: res.data.simNo === null ? undefined : res.data.simNo,
                  interval: Number(this.dataForm.interval),
                  positionTraceTerm: Number(this.dataForm.positionTraceTerm)
                }
              };
              terminalAbility(param).then(res => {
                if (res.code === '0') {
                  this.contentLoading = false;
                  this.$message({
                    message: '设置成功！',
                    type: 'success'
                  });
                } else {
                  this.contentLoading = false;
                }
              }).catch(() => {
                this.contentLoading = false;
              });
            } else {
              this.contentLoading = false;
            }
          }).catch(() => {
            this.contentLoading = false;
          });
        } else {
          this.$refs.dataForm.focusFirstField();
          return false;
        }
      });
    },
    //  重置表格校验规则
    resetValidates(formName) {
      this.$refs[formName].resetValidates();
    },
    //  重置表格
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    switchDevice(data) {
      this.isDisabled = false;
      this.selectedNodes = [...data];
      this.resetForm('dataForm');
    }
  }
};
</script>

<style src="@/pages/statistics/statistics.scss" lang="scss"></style>
<style lang="scss" scoped>
::v-deep {
  .el-radio {
    display: flex;
    align-items: center;
  }
  .el-radio+.el-radio {
    margin-left: 0px;
    margin-top: 16px;
  }
}
.right-content {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.footer-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: solid 1px #f2f2f2;
  height: 48px;
}
</style>
