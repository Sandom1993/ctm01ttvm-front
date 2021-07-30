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
        :is-need-check-box="true"
        @getSelectedNodes="handleSelectedNodes"
        @deviceClick="switchDevice"
      >
        <template slot="query">
          <el-button type="primary" @click="handleSetting">
            设置
          </el-button>
        </template>
      </vehicle-tree>
    </h-layout-aside>
    <h-layout class="right-bar">
      <h-layout-header></h-layout-header>
      <h-layout-content style="overflow: auto;">
        <div ref="pageBox" class="right-box">
          <div v-if="isClick" class="form-box">
            <el-form
              ref="terminalFormMsg"
              v-loading="contentLoading"
              label-width="180px"
              content-width="480px"
              :model="terminalFormMsg"
            >
              <el-form-item label="默认限速值（km/h）" prop="defaultLimitSpeed">
                <el-input v-model="terminalFormMsg.defaultLimitSpeed" disabled></el-input>
              </el-form-item>
              <el-form-item label="超速预警差值（km/h）" prop="warnDifference">
                <el-input v-model="terminalFormMsg.warnDifference" disabled></el-input>
              </el-form-item>
              <el-form-item label="夜间限速值×80%" prop="nightLimit">
                <el-switch v-model="terminalFormMsg.nightLimit" disabled></el-switch>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <el-dialog
          v-loading="loading"
          :area="600"
          title="远程参数设置"
          :visible.sync="dialogVisible"
          :modal="false"
          :before-close="handleClose"
          size="small"
        >
          <el-form
            ref="terminalForm"
            label-width="180px"
            content-width="360px"
            :model="terminalForm"
            :rules="terminalRules"
          >
            <el-form-item label="默认限速值（km/h）" prop="defaultLimitSpeed">
              <el-input v-model="terminalForm.defaultLimitSpeed"></el-input>
            </el-form-item>
            <el-form-item label="超速预警差值（km/h）" prop="warnDifference">
              <el-input v-model="terminalForm.warnDifference"></el-input>
            </el-form-item>
            <el-form-item label="夜间限速值×80%" prop="nightLimit">
              <el-switch v-model="terminalForm.nightLimit"></el-switch>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="handleSubmit">
              确 定
            </el-button>
            <el-button @click="handleClose">取 消</el-button>
          </div>
        </el-dialog>
      </h-layout-content>
    </h-layout>
  </h-layout>
</template>

<script>
import VehicleTree from '@/components/Tree';
import { saveDeviceRemoteConfig, getDeviceRemoteConfig } from '@/api/location';
export default {
  // 平台数据转网
  name: 'TerminalSetting',
  components: {
    VehicleTree
  },
  data() {
    return {
      dialogVisible: false,
      loading: false,
      contentLoading: false,
      terminalFormMsg: {
        defaultLimitSpeed: '',
        warnDifference: '',
        nightLimit: false
      },
      terminalForm: {
        defaultLimitSpeed: '',
        warnDifference: '',
        nightLimit: false
      },
      isClick: false,
      selectedNodes: [],
      deviceIndexCode: null,
      deviceIndexCodes: [],
      plateNos: [],
      terminalRules: {
        defaultLimitSpeed: [{ required: true, message: '请输入默认限速值' }],
        warnDifference: [{ required: true, message: '请输入超速预警差值' }]
      }
    };
  },
  methods: {
    //  关闭转网弹框
    handleClose() {
      this.resetValidates('terminalForm');
      this.resetForm('terminalForm');
      this.dialogVisible = false;
    },
    handleSetting() {
      this.isClick = false;
      if (this.selectedNodes.length === 0) {
        this.$msgbox({
          title: '提示',
          type: 'warning',
          message: '请先选择车辆'
        });
      } else {
        this.dialogVisible = true;
      }
    },
    handleSelectedNodes(nodes) {
      this.plateNos = [];
      this.deviceIndexCodes = [];
      this.isClick = false;
      this.selectedNodes = nodes;
      nodes.forEach(item => {
        this.deviceIndexCodes.push(item.deviceIndexCode);
        this.plateNos.push(item.name);
      });
    },
    handleSubmit() {
      const { deviceIndexCodes, plateNos } = this;
      this.$refs.terminalForm.validate((valid) => {
        if (valid) {
          const params = {
            deviceIndexCodes: deviceIndexCodes,
            plateNos: plateNos,
            defaultLimitSpeed: Number(this.terminalForm.defaultLimitSpeed),
            nightLimit: this.terminalForm.nightLimit ? 1 : 0,
            warnDifference: Number(this.terminalForm.warnDifference)
          };
          this.loading = true;
          saveDeviceRemoteConfig(params)
            .then(res => {
              if (res.code === '0') {
                this.resetValidates('terminalForm');
                this.resetForm('terminalForm');
                this.dialogVisible = false;
                this.loading = false;
                this.$message('保存成功！');
              }
            })
            .catch(() => {
              this.loading = false;
            });
        } else {
          return false;
        }
      });
    },
    //  重置表格验证规则
    resetValidates(formName) {
      this.$refs[formName].resetValidates();
    },
    //  重置表格
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    switchDevice(data) {
      this.contentLoading = true;
      this.isClick = true;
      this.$nextTick(() => {
        this.deviceIndexCode = data[0].deviceIndexCode;
        const params = {
          deviceIndexCode: data[0].deviceIndexCode
        };
        getDeviceRemoteConfig(params).then(res => {
          if (res.code === '0' && res.data !== null) {
            this.terminalFormMsg.defaultLimitSpeed = res.data.defaultLimitSpeed;
            this.terminalFormMsg.warnDifference = res.data.warnDifference;
            this.terminalFormMsg.nightLimit = res.data.nightLimit === 1;
            this.contentLoading = false;
          } else {
              this.contentLoading = false;
          }
        });
      });

    }
  }
};
</script>

<style src="@/pages/statistics/statistics.scss" lang="scss"></style>
<style lang="scss" scoped>
::v-deep {
  .el-input.is-disabled .el-input__inner {
    color: #333333;
  }
}
.right-box {
  height: 100%;
  .form-box {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .btn-box {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 10%;
  }
}
</style>
