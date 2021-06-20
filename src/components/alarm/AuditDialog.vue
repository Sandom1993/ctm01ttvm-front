<template>
  <el-dialog
    v-if="dialogVisible"
    title="审核订阅"
    :visible.sync="dialogVisible"
    :area="604"
    :append-to-body="true"
  >
    <div class="dialog-contant">
      <div v-loading="loading" style="position:relative">
        <div class="sort-time">
          <span class="sort-wrap">
            <span style="margin-right:8px;">排序规则</span>
            <el-radio-group v-model="alarmSortType">
              <el-radio :label="0">严重等级优先</el-radio>
              <el-radio :label="1">时间优先</el-radio>
            </el-radio-group>
          </span>
          <span class="time-wrap">
            查看近
            <el-select
              v-model="alarmDuration"
              style="display:inline-block;width:56px;height:24px;margin: 0 4px;"
            >
              <el-option label="5" :value="5"></el-option>
              <el-option label="10" :value="10"></el-option>
              <el-option label="20" :value="20"></el-option>
              <el-option label="30" :value="30"></el-option>
              <el-option label="60" :value="60"></el-option>
            </el-select>
            分钟报警
          </span>
        </div>
        <div class="audit-type">
          车辆订阅
          <div class="audit-box">
            <div style="padding:4px;height:422px;position:relative">
              <tree-status ref="treeStatus"></tree-status>
              <!-- <vehicle-tree
              ref="vehicleTree"
              tree-type="3"
              :default-selected="selectNodes"
              @getSelectedNodes="getSelectedNodes"
            ></vehicle-tree> -->
            </div>
          </div>
        </div>
        <div class="audit-type ml24">
          报警订阅
          <div class="audit-box">
            <el-scrollbar
              wrap-style="position: absolute;top: 0;bottom: 0;left: 0;right: 0;"
              view-style="margin:0px;padding:8px 0px"
            >
              <div class="box-head">
                <el-checkbox
                  v-model="seriousAll"
                  style="display:block;font-weight:bold"
                  :indeterminate="isIndeterminate1"
                  @change="handleCheckSeriousAll"
                >
                  严重级别报警
                </el-checkbox>
                <el-checkbox-group
                  v-model="checkedSerious"
                  @change="handleCheckSerious"
                >
                  <el-checkbox
                    v-for="alarm in seriousAlarm"
                    :key="alarm.id"
                    :label="alarm.id"
                  >
                    {{ alarm.name }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
              <div class="box-head">
                <el-checkbox
                  v-model="hardAll"
                  style="display:block;font-weight:bold"
                  :indeterminate="isIndeterminate2"
                  @change="handleCheckHardAll"
                >
                  较重级别报警
                </el-checkbox>
                <el-checkbox-group
                  v-model="checkedHard"
                  @change="handleCheckHard"
                >
                  <el-checkbox
                    v-for="alarm in hardAlarm"
                    :key="alarm.id"
                    :label="alarm.id"
                  >
                    {{ alarm.name }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
              <div class="box-head">
                <el-checkbox
                  v-model="normalAll"
                  style="display:block;font-weight:bold"
                  :indeterminate="isIndeterminate3"
                  @change="handleCheckNormalAll"
                >
                  一般级别报警
                </el-checkbox>
                <el-checkbox-group
                  v-model="checkedNormal"
                  @change="handleCheckNormal"
                >
                  <el-checkbox
                    v-for="alarm in normalAlarm"
                    :key="alarm.id"
                    :label="alarm.id"
                  >
                    {{ alarm.name }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
              <div class="box-head">
                <el-checkbox
                  v-model="warnAll"
                  style="display:block;font-weight:bold"
                  :indeterminate="isIndeterminate4"
                  @change="handleCheckWarnAll"
                >
                  预警级别报警
                </el-checkbox>
                <el-checkbox-group
                  v-model="checkedWarn"
                  @change="handleCheckWarn"
                >
                  <el-checkbox
                    v-for="alarm in warnAlarm"
                    :key="alarm.id"
                    :label="alarm.id"
                  >
                    {{ alarm.name }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </el-scrollbar>
          </div>
        </div>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" :loading="loading" @click="subscribeAlarmType">
        确 定
      </el-button>
      <el-button @click="closeDialog">
        取 消
      </el-button>
    </div>
  </el-dialog>
</template>
<script>
import {
  subscribeAlarmTypes,
  findSubscribeVehicles,
  findSubscribeAlarmTypes,
  findSubscribeAlarmConfig
} from '@/api/alarmAudit.js';
import TreeStatus from '@/components/TreeStatus.vue';

export default {
  name: 'AdditDialog',
  components: {
    TreeStatus
  },
  data() {
    return {
      dialogVisible: false,
      checkedSerious: [],
      checkedHard: [],
      checkedNormal: [],
      checkedWarn: [],
      isIndeterminate1: false,
      isIndeterminate2: false,
      isIndeterminate3: false,
      isIndeterminate4: false,
      auditVehicle: [], // 订阅的车辆
      selectNodes: [], // 查询到的订阅的车辆
      seriousAll: false,
      hardAll: false,
      normalAll: false,
      warnAll: false,
      seriousAlarm: [],
      hardAlarm: [],
      normalAlarm: [],
      warnAlarm: [],
      alarmSortType: 1, // 1是时间 0是严重等级
      alarmDuration: 30, // 报警查询时长
      loading: false
    };
  },
  watch: {
    dialogVisible(val) {
      if (val) {
        this.init();
      }
    }
  },
  methods: {
    openDialog() {
      this.dialogVisible = true;
    },
    closeDialog() {
      this.dialogVisible = false;
      // this.$emit('update:dialogVisible', false);
    },
    init() {
      this.findSubscribeAlarmType();
      this.findSubscribeConfig();
      // this.$nextTick(() => {
      //   this.findSubscribeVehicle();
      // });
      // this.$nextTick(() => {
      //   this.$refs.vehicleTree.isShowResult = false;
      //   this.$refs.vehicleTree.filterText = '';
      // });
    },
    // 获取用户订阅的车辆
    // findSubscribeVehicle() {
    //   findSubscribeVehicles().then(json => {
    //     if (json.code === '0') {
    //       const list = json.data;
    //       this.selectNodes = list.map(item => item.id);
    //     }
    //   });
    // },
    // 获取用户订阅的报警信息
    findSubscribeAlarmType() {
      findSubscribeAlarmTypes().then(json => {
        if (json.code === '0') {
          const list = json.data;
          this.seriousAlarm = list
            .filter(item => item.level === 'h')
            .map(child => ({
              checked: child.checked,
              id: child.eventType,
              name: child.name
            }));
          this.hardAlarm = list
            .filter(item => item.level === 'm')
            .map(child => ({
              checked: child.checked,
              id: child.eventType,
              name: child.name
            }));
          this.normalAlarm = list
            .filter(item => item.level === 'l')
            .map(child => ({
              checked: child.checked,
              id: child.eventType,
              name: child.name
            }));
          this.warnAlarm = list
            .filter(item => item.level === 'w')
            .map(child => ({
              checked: child.checked,
              id: child.eventType,
              name: child.name
            }));
          this.checkedSerious = this.seriousAlarm
            .filter(item => item.checked)
            .map(item => item.id);
          this.checkedHard = this.hardAlarm
            .filter(item => item.checked)
            .map(item => item.id);
          this.checkedNormal = this.normalAlarm
            .filter(item => item.checked)
            .map(item => item.id);
          this.checkedWarn = this.warnAlarm
            .filter(item => item.checked)
            .map(item => item.id);
          this.isIndeterminate1 =
            this.checkedSerious.length > 0 &&
            this.checkedSerious.length < this.seriousAlarm.length;
          this.seriousAll =
            this.checkedSerious.length === this.seriousAlarm.length;

          this.isIndeterminate2 =
            this.checkedHard.length > 0 &&
            this.checkedHard.length < this.hardAlarm.length;
          this.hardAll = this.checkedHard.length === this.hardAlarm.length;

          this.isIndeterminate3 =
            this.checkedNormal.length > 0 &&
            this.checkedNormal.length < this.normalAlarm.length;
          this.normalAll =
            this.checkedNormal.length === this.normalAlarm.length;

          this.isIndeterminate4 =
            this.checkedWarn.length > 0 &&
            this.checkedWarn.length < this.warnAlarm.length;
          this.warnAll = this.checkedWarn.length === this.warnAlarm.length;
        }
      });
    },
    // 查询订阅时长和排序类型
    findSubscribeConfig() {
      findSubscribeAlarmConfig().then(json => {
        if (json.code === '0' && json.data) {
          this.alarmSortType = json.data.alarmSortType;
          this.alarmDuration = json.data.alarmDuration;
          this.$emit('getAlarmDuration', this.alarmDuration);
        }
      });
    },
    // 订阅的车辆
    getSelectedNodes(node) {
      this.auditVehicle = node;
    },

    // 检查是否有订阅车辆
    checkedAudit() {
      const p1 = new Promise(resolve => {
        findSubscribeVehicles().then(json => {
          if (json.code === '0') {
            const list = json.data;
            resolve(list);
          }
        });
      });
      const p2 = new Promise(resolve => {
        findSubscribeAlarmTypes().then(json => {
          if (json.code === '0') {
            const list = json.data;
            resolve(list);
          }
        });
      });
      const p3 = new Promise(resolve => {
        findSubscribeAlarmConfig().then(json => {
          if (json.code === '0') {
            resolve(json.data);
          }
        });
      });
      return Promise.all([p1, p2, p3]);
    },

    handleCheckHard() {
      this.isIndeterminate2 =
        this.checkedHard.length > 0 &&
        this.checkedHard.length < this.hardAlarm.length;
      this.hardAll = this.checkedHard.length === this.hardAlarm.length;
    },
    handleCheckNormal() {
      this.isIndeterminate3 =
        this.checkedNormal.length > 0 &&
        this.checkedNormal.length < this.normalAlarm.length;
      this.normalAll = this.checkedNormal.length === this.normalAlarm.length;
    },
    handleCheckWarn() {
      this.isIndeterminate4 =
        this.checkedWarn.length > 0 &&
        this.checkedWarn.length < this.warnAlarm.length;
      this.warnAll = this.checkedWarn.length === this.warnAlarm.length;
    },
    handleCheckSeriousAll(val) {
      this.checkedSerious = val ? this.seriousAlarm.map(item => item.id) : [];
      this.isIndeterminate1 = false;
    },
    handleCheckHardAll(val) {
      this.checkedHard = val ? this.hardAlarm.map(item => item.id) : [];
      this.isIndeterminate2 = false;
    },
    handleCheckNormalAll(val) {
      this.checkedNormal = val ? this.normalAlarm.map(item => item.id) : [];
      this.isIndeterminate3 = false;
    },
    handleCheckWarnAll(val) {
      this.checkedWarn = val ? this.warnAlarm.map(item => item.id) : [];
      this.isIndeterminate4 = false;
    },
    handleCheckSerious() {
      this.isIndeterminate1 =
        this.checkedSerious.length > 0 &&
        this.checkedSerious.length < this.seriousAlarm.length;
      this.seriousAll = this.checkedSerious.length === this.seriousAlarm.length;
    },
    // 保存订阅信息
    subscribeAlarmType() {
      const halfCheckedOrgIndexCodes = this.$refs.treeStatus.getHalfChecked();
      const checkedOrgIndexCodes = this.$refs.treeStatus.getChecked();
      const vehicleIndexCodes = this.$refs.treeStatus.getvehicle();
      // if (this.auditVehicle.length === 0) {
      //   this.$message({
      //     message: '请选择车辆',
      //     type: 'warning',
      //   });
      //   return;
      // }
      const auditAlarms = []
        .concat(this.checkedSerious)
        .concat(this.checkedHard)
        .concat(this.checkedNormal)
        .concat(this.checkedWarn);
      if (auditAlarms.length === 0) {
        this.$message({
          message: '请选择报警',
          type: 'warning'
        });
        return;
      }
      this.loading = true;
      subscribeAlarmTypes({
        alarmDuration: this.alarmDuration,
        alarmSortType: this.alarmSortType,
        alarmTypes: auditAlarms.map(item => parseInt(item, 10)),
        vehicleIndexCodes: vehicleIndexCodes.map(item => item.id),
        checkedOrgIndexCodes: checkedOrgIndexCodes.map(item => item.id),
        halfCheckedOrgIndexCodes: halfCheckedOrgIndexCodes.map(item => item.id)
      })
        .then(json => {
          this.loading = false;
          if (json.code === '0') {
            this.$message({
              message: '订阅成功',
              type: 'success'
            });
            this.closeDialog();
            this.$emit('getAlarmDuration', this.alarmDuration);
            this.$emit('refresh');
          } else {
            this.$message({
              message: json.msg,
              type: 'error'
            });
          }
        })
        .catch(() => {
          this.loading = false;
        });
    }
  }
};
</script>
<style lang="scss" scoped>
.audit-type {
  display: inline-block;
  vertical-align: middle;
}
.sort-time {
  height: 36px;
  // display: flex;
  // align-items: center;
  // justify-content: space-between
}
.sort-wrap {
  display: inline-block;
  width: 296px;
}
.time-wrap {
  & ::v-deep .el-input__inner {
    height: 24px;
  }
}
.audit-box {
  border: 1px solid #d0d0d0;
  width: 276px;
  height: 430px;
  margin-top: 8px;
}
.box-head {
  padding: 0 16px;
  line-height: 32px;
}
.box-head label {
  height: 32px;
}
</style>
<style>
.ml24 {
  margin-left: 24px;
}
.audit-box li {
  height: 24px;
  line-height: 24px;
  padding: 0 16px;
}
.audit-box .el-checkbox__label {
  font-size: 12px;
}
.audit-box .el-checkbox-group .el-checkbox {
  display: block;
}
.box-head .el-checkbox-group .el-checkbox {
  margin-left: 16px;
}
</style>
