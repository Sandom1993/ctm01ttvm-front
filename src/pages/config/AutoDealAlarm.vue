<template>
  <div class="autodeal-wrap">
    <div class="tree-wrap">
      <tree
        ref="resourceTree"
        tree-type="1"
        :is-need-check-box="false"
        :is-need-filter="false"
        @deviceClick="getDeviceClick"
      ></tree>
    </div>
    <div class="config-wrap">
      <div class="config-title">
        <el-row>
          <el-col :span="3"><span>报警类型</span></el-col>
          <el-col :span="2"><span>开/关</span></el-col>
          <el-col :span="7"><span>下发内容</span></el-col>
          <el-col :span="2"><span>插入车牌</span></el-col>
          <el-col :span="5"><span>下发方式</span></el-col>
          <el-col :span="5"><span>报警级别</span></el-col>
        </el-row>
      </div>
      <div class="config-content">
        <div v-for="(i, index) in ALARM_TYPES" :key="index" class="config-item">
          <el-row type="flex" align="middle">
            <el-col :span="3">
              <span>{{ i.name }}</span>
            </el-col>
            <el-col :span="2">
              <el-switch v-model="alarmInfo[index].on"></el-switch>
            </el-col>
            <el-col :span="7">
              <el-input v-model="alarmInfo[index].content"></el-input>
            </el-col>
            <el-col :span="2">
              <el-switch v-model="alarmInfo[index].insertPlateNo"></el-switch>
            </el-col>
            <el-col :span="5">
              <el-select
                v-model="alarmInfo[index].issueType"
                multiple
                multiple-nowrap
              >
                <el-option
                  v-for="(item, idx) in ISSUE_TYPES"
                  :key="idx"
                  :label="item.text"
                  :value="item.text"
                ></el-option>
              </el-select>
            </el-col>
            <el-col :span="5">
              <el-select
                v-model="alarmInfo[index].alarmLevel"
                multiple
                multiple-nowrap
              >
                <el-option
                  v-for="(item, idx) in ALARM_LEVEL"
                  :key="idx"
                  :label="item.text"
                  :value="item.text"
                ></el-option>
              </el-select>
            </el-col>
          </el-row>
        </div>
      </div>
      <div class="config-footer">
        <el-button type="primary">
          应用
        </el-button>
        <el-button>
          重置
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import Tree from '@/components/Tree';
import { ALARM_TYPES, ISSUE_TYPES, ALARM_LEVEL } from './autodealType';
export default {
  name: 'AutoDealAlarm',
  components: { Tree },
  data() {
    return {
      ALARM_TYPES,
      ISSUE_TYPES,
      ALARM_LEVEL,
      alarmInfo: []
    };
  },
  created() {
    for (let i = 0; i < ALARM_TYPES.length; i++) {
      this.alarmInfo.push({
        on: false,
        content: '',
        insertPlateNo: false,
        issueType: [],
        alarmLevel: []
      });
    }
  },
  methods: {
    getDeviceClick(node) {
      console.log(node);
    }
  }
};
</script>

<style lang="scss" scoped>
.autodeal-wrap {
  height: 100%;
  width: 100%;
  display: flex;
  min-width: 1000px;
}
.tree-wrap {
  height: 100%;
  width: 20%;
  min-width: 200px;
  overflow-y: auto;
  position: relative;
  border: 1px solid rgba(0, 0, 0, 0.144);
}
.config-wrap {
  width: 80%;
  min-width: 800px;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.144);
  .config-title {
    height: 60px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.144);
    display: flex;
    // justify-content: center;
    align-items: center;
    span {
      font-size: 16px;
    }
  }
  .config-content {
    height: 90%;
    min-height: 600px;
    overflow-y: auto;
    padding: 15px 0;
    .config-item {
      height: 60px;
    }
  }
  .config-footer {
    padding-left: 20px;
  }
}
.el-col {
  display: flex;
  justify-content: center;
  align-items: center;
}
.el-row {
  width: 100%;
}
.el-select {
  width: 80%;
}
</style>
