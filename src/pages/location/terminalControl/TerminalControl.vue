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
          <el-radio-group v-model="controlValue" @change="radioChange">
            <el-radio
              v-for="(item, key) in controlOptions"
              :key="key"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio>
          </el-radio-group>
          <div
            v-show="controlValue === '1' || controlValue === '2'"
            class="mind-box"
          >
            <el-form
              ref="mindForm"
              :rules="mindFormRules"
              label-position="top"
              :model="mindForm"
            >
              <el-form-item
                :label="`${getMindLabel(controlValue)}指令`"
                prop="mindStr"
              >
                <el-input v-model="mindForm.mindStr" placeholder="请输入指令" />
              </el-form-item>
            </el-form>
            <div style="color: #b3b3b3">{{ gerMindExplain(controlValue) }}</div>
          </div>
        </div>
      </h-layout-content>
      <h-layout-footer>
        <div class="footer-btn">
          <el-button type="primary" @click="handleSaveSetting">
            设置
          </el-button>
        </div>
      </h-layout-footer>
    </h-layout>
  </h-layout>
</template>

<script>
import VehicleTree from '@/components/Tree';
import { findIndexObject } from '@/utils/common';
import { terminalAbility } from '@/api/location';
export default {
  // 终端参数设置
  name: 'TerminalControl',
  components: {
    VehicleTree
  },
  data() {
    return {
      contentLoading: false,
      selectedNodes: [],
      controlValue: '1',
      mindForm: {
        mindStr: undefined
      },
      mindFormRules: {
        mindStr: [{ required: true, message: '请输入指令', trigger: 'blur' }]
      },
      deviceIndexCode: null,
      deviceIndexCodes: [],
      controlOptions: [
        { value: '1', label: '无线升级' },
        { value: '2', label: '控制终端连接指定服务器' },
        { value: '3', label: '终端关机' },
        { value: '4', label: '终端复位' },
        { value: '5', label: '终端恢复出厂设置' },
        { value: '6', label: '关闭数据通讯' },
        { value: '7', label: '关闭所有无线通信' }
      ]
    };
  },
  methods: {
    //  单选框 change
    radioChange(e) {
      this.resetForm('mindForm');
    },
    //  指令 label
    getMindLabel(val) {
      return findIndexObject(this.controlOptions, ['value', val]).label;
    },
    //  指令说明
    gerMindExplain(val) {
      const str1 =
        '参数之间采用半角分号分隔，指令如下：“URL地址;拨号点名称;拨号用户名;拨号密码;地址;TCP端口;UDP端口;制造商ID;硬件版本;固件版本;连接到指定服务器时限”，若某个参数无值，则放空。';
      const str2 =
        '参数之间采用半角分号分隔，指令如下：“连接控制;监管平台鉴权码;拨号点名称;拨号用户名;拨号密码;地址;TCP端口;UDP端口;连接到指定服务器时限”，若某个参数无值，则放空，若连接控制值为1，则无后继参数。';
      return val === '1' ? str1 : str2;
    },
    //  保存设置操作
    handleSaveSetting() {
      if (this.selectedNodes.length === 0) {
        this.$msgbox({
          title: '提示',
          type: 'warning',
          message: '请先选择车辆'
        });
        return false;
      }
      if (this.controlValue !== '1' && this.controlValue !== '2') {
        this.handleSubmit();
      } else {
        const strTemp = this.mindForm.mindStr.replace(/；/g, ';');
        this.$refs.mindForm.validate((valid, invalidFields) => {
          if (valid) {
            this.handleSubmit(strTemp);
          } else {
            this.$refs.mindForm.focusFirstField();
            return false;
          }
        });
      }
    },
    handleSubmit(strTemp) {
      // this.contentLoading = true;
      const label = findIndexObject(this.controlOptions, [
        'value',
        this.controlValue
      ]).label;
      this.$confirm(`${label}，是否继续?`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      })
        .then(() => {
          const params = strTemp
            ? {
                indexCode: this.selectedNodes[0].deviceIndexCode,
                paramId: Number(this.controlValue),
                paramValue: strTemp
              }
            : {
                indexCode: this.selectedNodes[0].deviceIndexCode,
                paramId: Number(this.controlValue)
              };
          const param = {
            method: 'TerminalCtrl',
            params: params
          };
          terminalAbility(param).then(res => {
            if (res.code === '0') {
              this.$message({
                type: 'success',
                message: '设置成功!'
              });
              // this.contentLoading = false;
            }
          });
        })
        .catch(() => {});
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
      this.selectedNodes = [...data];
      this.resetForm('mindForm');
      this.controlValue = '1';
    }
  }
};
</script>

<style src="@/pages/statistics/statistics.scss" lang="scss"></style>
<style lang="scss" scoped>
::v-deep {
  .el-form-item {
    margin-bottom: 8px;
  }
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
  position: absolute;
  top: 10%;
  left: 30%;
  width: 800px;
  .mind-box {
    margin-top: 16px;
  }
}
.footer-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  border-top: solid 1px #f2f2f2;
  height: 48px;
}
</style>
