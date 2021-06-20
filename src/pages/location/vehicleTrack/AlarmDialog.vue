<template>
  <div>
    <el-dialog
    :visible.sync="localdialogVisible"
    size="tiny"
    @closed="closed"
    >
    <!-- slot将tabs传入title -->
    <span slot="title">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="部标类报警" name="部标类报警">
        </el-tab-pane>
        <el-tab-pane label="主动安全" name="主动安全">
        </el-tab-pane>
      </el-tabs>
    </span>
    <!-- 内容 -->
    <div v-show="activeName === '部标类报警'">
        <el-checkbox :indeterminate="bbl.isIndeterminate" v-model="bbl.checkAll" @change="bblhandleCheckAllChange">全选</el-checkbox>
        <div style="margin: 15px 0;"></div>
        <el-checkbox-group v-model="bbl.value" @change="bblhandleCheckedChange">
          <el-checkbox v-for="item in bbl.alarmList" :key="item" :label="item">{{item}}</el-checkbox>
        </el-checkbox-group>
    </div>
    <div v-show="activeName === '主动安全'">
      <el-checkbox :indeterminate="zd.isIndeterminate" v-model="zd.checkAll" @change="zdhandleCheckAllChange">全选</el-checkbox>
      <div style="margin: 15px 0;"></div>
      <el-checkbox-group v-model="zd.value" @change="zdhandleCheckedChange">
        <el-checkbox v-for="item in zd.alarmList" :key="item" :label="item">{{item}}</el-checkbox>
      </el-checkbox-group>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirm">确 定</el-button>
      <el-button @click="setDefault">恢复默认</el-button>
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
      default: false,
    },
  },
  data: function() {
    return {
      activeName: '部标类报警',
      localdialogVisible: false,
      bbl: {
        isIndeterminate: false,
        defaultValue: [
          '超速（一级）',
          '超速（二级）',
          '超速（三级）',
          ],
        alarmList: [
          '超速（一级）',
          '超速（二级）',
          '超速（三级）',
          '疲劳驾驶（一级）',
          '疲劳驾驶（二级）',
          '疲劳驾驶（三级）',
          '凌晨禁行（一级）',
          '凌晨禁行（二级）',
          '越界行驶（一级）',
          '越界行驶（二级）',
          '越界行驶（三级）',
          ],
        checkAll: false,
        value: []
      },
      zd: {
        isIndeterminate: false,
        defaultValue: [
          '前向碰撞'
          ],
        alarmList: [
          '前向碰撞',
          '接打电话',
          '车距过近',
          '行人碰撞',
          '频繁变道',
          '障碍物报警',
          '抽烟',
          '长时间不目视前方',
          '双手脱离方向盘',
          '驾驶员身份异常'
        ],
        checkAll: false,
        value: []
      }
    }
  },
  watch: {
    dialogVisible: function(n, o) {
      this.localdialogVisible = n;
    }
  },
  mounted() {
    this.bbl.value = this.bbl.defaultValue;
    this.bbl.isIndeterminate = this.bbl.defaultValue.length !== 0 
    if (this.bbl.defaultValue.length === this.bbl.alarmList.length) {
      this.bbl.checkAll = true;
      this.bbl.isIndeterminate = false
    }
    this.zd.value = this.zd.defaultValue;
    this.zd.isIndeterminate = this.zd.defaultValue.length !== 0 
    if (this.zd.defaultValue.length === this.zd.alarmList.length) {
      this.zd.checkAll = true;
      this.zd.isIndeterminate = false
    }
  },
  methods: {
    init() {
    },
    confirm() {
      this.$emit('alarmConfig', {
        bbl: this.bbl.value,
        zd: this.zd.value
      })
      this.localdialogVisible = false
    },
    closed() {
      this.init();
      this.$emit('closed')
    },
    setDefault() {
      if(this.activeName === '部标类报警') {
        this.bbl.value = this.bbl.defaultValue;
        this.bbl.isIndeterminate = this.bbl.defaultValue.length !== 0 
        if (this.bbl.defaultValue.length === this.bbl.alarmList.length) {
          this.bbl.checkAll = true;
          this.bbl.isIndeterminate = false
        }
      } else {
        this.zd.value = this.zd.defaultValue;
        this.zd.isIndeterminate = this.zd.defaultValue.length !== 0 
        if (this.zd.defaultValue.length === this.zd.alarmList.length) {
          this.zd.checkAll = true;
          this.zd.isIndeterminate = false
        }
      }
    },
    handleClick(tab) {
      // console.log(this.activeName)
    },
    bblhandleCheckAllChange(value) {
        this.bbl.value = value ?  this.bbl.alarmList : [];
        this.bbl.isIndeterminate = false;
    },
    bblhandleCheckedChange(value) {
      const checkedCount = value.length;
      this.bbl.checkAll = checkedCount === this.bbl.alarmList.length;
      this.bbl.isIndeterminate = checkedCount > 0 && checkedCount < this.bbl.alarmList.length;
    },
    zdhandleCheckAllChange(value) {
        this.zd.value = value ?  this.zd.alarmList : [];
        this.zd.isIndeterminate = false;
    },
    zdhandleCheckedChange(value) {
      const checkedCount = value.length;
      this.zd.checkAll = checkedCount === this.zd.alarmList.length;
      this.zd.isIndeterminate = checkedCount > 0 && checkedCount < this.zd.alarmList.length;
    },
  }
};
</script>

<style lang="scss" scoped>
  .el-checkbox-group {
    .el-checkbox:first-child {
      margin-left: 16px;
    }
  }
</style>

<style lang="scss">
  .el-dialog__header {
    height: 31px;
  }
</style>
