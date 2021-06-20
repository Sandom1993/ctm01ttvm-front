<template>
  <div>
    <el-dialog
    :visible.sync="localdialogVisible"
    :area="[580,430]"
    @open="open"
    @closed="closed">
    <el-transfer
    v-model="targetData"
    :data="sourceDataFormat"
    :titles="['可展示项','已展示项']"></el-transfer>
    <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="confirm">确 定</el-button>
      <el-button @click="setDefault">恢复默认</el-button>
    </span>
    </el-dialog>
  </div>
</template>

<script>
import echarts from 'echarts';
export default {
  name: 'TableTransferDialog',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    // 当前已经显示的数据
    existTargetData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      sourceData: [
        'GPS时间',
        'GPS速度',
        'GPS接收时间',
        '脉冲速度',
        // DELAY_TASK
        // '导航屏速度',
        '限速值',
        '方向',
        '经度',
        '纬度',
        'ACC'
      ],
      // 相应格式的源数据
      sourceDataFormat: [],
      defaultTargetData: ['GPS时间', 'GPS速度', '经度', '纬度'],
      targetData: [],
      localdialogVisible: false,
      hasConfirm: false
    };
  },
  watch: {
    dialogVisible(n, o) {
      this.localdialogVisible = n;
    }
  },
  mounted() {
    this.targetData = this.existTargetData;
    this.sourceDataFormat = this.dataFormat(this.sourceData);
  },
  methods: {
    closed() {
      if (!this.hasConfirm) {
        this.targetData = this.existTargetData;
      }
      this.$emit('closed');
    },
    open() {
      this.hasConfirm = false;
    },
    setDefault() {
      this.targetData = this.defaultTargetData;
    },
    dataFormat(data) {
      const formatedData = []
      data.forEach(v => {
        formatedData.push({
          key: v,
          label: v,
          disabled: false,
        })
      })
      return formatedData;
    },
    confirm() {
      this.$emit('trackTableConfig', this.targetData);
      this.localdialogVisible = false;
      this.hasConfirm = true
    }
  }
};
</script>

<style lang="scss">
</style>
