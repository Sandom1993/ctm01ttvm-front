<template>
  <div>
    <el-dialog
      title="轨迹显示配置"
      :visible.sync="localdialogVisible"
      size="tiny"
      @closed="closed"
      @open="open"
    >
      <!-- DELAY_TASK -->
      <!-- <span class="row">
      <span>查询精度</span>
      <el-input v-model="queryAccuracy"></el-input>
      <span>（时间：分）</span>
    </span> -->
      <span class="row">
        <span>轨迹阈值</span>
        <el-input v-model="trackThreshold"></el-input>
        <span>（km/h）</span>
      </span>
      <span class="row">
        <span>轨迹播放</span>
        <el-radio class="radio" v-model="trackType" label="全轨迹">全轨迹</el-radio>
        <el-radio class="radio" v-model="trackType" label="点轨迹">点轨迹</el-radio>
      </span>
      <el-checkbox-group v-model="menuList">
        <el-checkbox label="speedLimit">限速区域显示（全部）</el-checkbox>
        <el-checkbox label="areaLimit">越线区域显示（全部）</el-checkbox>
        <el-checkbox label="alarm">报警点显示</el-checkbox>
        <!-- <br>
      <el-checkbox label="是否显示漂移数据"></el-checkbox>
      <el-checkbox label="加载静止点"></el-checkbox> -->
      </el-checkbox-group>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirm">确 定</el-button>
        <el-button @click="localdialogVisible = false">取 消</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'TrackDialog',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data: function() {
    return {
      trackType: '全轨迹',
      localmenuList: [],
      menuList: [],
      // 是否通过确定按钮退出
      hasConfirm: false,
      // 精度
      queryAccuracy: '',
      trackThreshold: '',
      localdialogVisible: false
    };
  },
  watch: {
    dialogVisible: function(n, o) {
      this.localdialogVisible = n;
    }
  },
  methods: {
    init() {
      this.menuList = [];
      this.queryAccuracy = '';
      this.trackThreshold = '';
    },
    initMenuList() {
      this.menuList = []
    },
    confirm() {
      this.$emit('trackConfig', {
        trackType: this.trackType,
        menuList: this.menuList,
        queryAccuracy: this.queryAccuracy,
        // 参数校验,
        trackThreshold:
          isNaN(parseFloat(this.trackThreshold)) ||
          parseFloat(this.trackThreshold) <= 0
            ? 80
            : parseFloat(this.trackThreshold)
      });
      this.hasConfirm = true;
      this.localdialogVisible = false;
    },
    closed() {
      if (!this.hasConfirm) {
        this.menuList = this.localmenuList;
      }
      // this.init();
      this.$emit('closed');
    },
    open() {
      this.hasConfirm = false;
      this.localmenuList = this.menuList
    }
  }
};
</script>

<style lang="scss" scoped>
.row {
  display: flex;
  align-items: center;
  .el-input {
    width: 200px;
  }
  span:first-child {
    display: inline-block;
    width: 80px;
    font-family: MicrosoftYaHeiUI;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.5);
    letter-spacing: 0;
  }
  span:nth-child(3) {
    padding-left: 20px;
    font-family: MicrosoftYaHeiUI;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.7);
    letter-spacing: 0;
  }
  margin: 20px 0;
}
</style>
