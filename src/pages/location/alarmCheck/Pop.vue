levelName<template>
  <div class="pop-content">
    <el-row v-if="!option.isNormal" :gutter="16">
      <el-col :span="6">
        <div class="text-title">报警</div>
      </el-col>
      <el-col :span="18">
        <span class="text-content">{{ option.eventTypeName }}</span>
      </el-col>
    </el-row>
    <el-row v-if="!option.isNormal" :gutter="16">
      <el-col :span="6">
        <div class="text-title">持续时间</div>
      </el-col>
      <el-col :span="18">
        <span class="text-content">{{ option.continueTime | formatSeconds }}</span>
      </el-col>
    </el-row>
    <el-row v-if="!option.isNormal" :gutter="16">
      <el-col :span="6">
        <div class="text-title">等级</div>
      </el-col>
      <el-col :span="18">
        <span class="text-content">{{ getAlarmLevel(option.level) }}</span>
      </el-col>
    </el-row>
    <el-row :gutter="16">
      <el-col :span="6">
        <div class="text-title">企业</div>
      </el-col>
      <el-col :span="18">
        <span class="text-content">{{ option.orgName }}</span>
      </el-col>
    </el-row>
    <el-row :gutter="16">
      <el-col :span="6">
        <div class="text-title">定位速度</div>
      </el-col>
      <el-col :span="18">
        <span class="text-content">{{ option.speed }}km/h</span>
      </el-col>
    </el-row>
    <el-row :gutter="16">
      <el-col :span="6">
        <div class="text-title">驾驶员</div>
      </el-col>
      <el-col :span="18">
        <span class="text-content">{{ option.driverName }}</span>
      </el-col>
    </el-row>
    <el-row :gutter="16">
      <el-col :span="6">
        <div class="text-title">定位位置</div>
      </el-col>
      <el-col :span="18">
        <span class="text-content">{{ addr }}</span>
      </el-col>
    </el-row>
    <div class="bottom-box">
      <div style="height: 1px;width: 100%;background-color: #e6e6e6;"/>
      <div class="bottom-btn" @click="handleDetail">
        <i class="h-icon-details"></i>
        <span>查看详情</span>
      </div>
    </div>
  </div>
</template>

<script>
import { toTimezoneString } from '../../../components/util';
export default {
  name: 'Pop',
  components: {},
  data() {
    return {
      addr: ''
    }
  },
  created() {
    this.getAddress(this.option.location)
  },
  methods: {
    getAlarmLevel(level) {
      switch (level) {
        case 'l':
          return '一级';
        case 'm':
          return '二级';
        case 'h':
          return '三级';
        case 'w':
          return '预警';
      }
    },
    handleDetail() {
      const { option: { indexCode, beginTime, endTime, plateNo } } = this
      window.top.goToApp({
        url: '/ctm01ttvm-web/#/location/vehicleTrack',
        name: '行车轨迹',
        param: `indexCode=${indexCode}&plateNo=${plateNo}&beginTime=${toTimezoneString(beginTime)}&endTime=${toTimezoneString(endTime)}`
      })
    },
    getAddress(arr) {
      let geocoder = null;
      if (!geocoder) {
        geocoder = new AMap.Geocoder({
          radius: 1000 // 范围
        });
      }
      geocoder.getAddress([arr[0], arr[1]], (status, result) => {
        if (status === 'complete' && result.regeocode) {
          this.addr = result.regeocode.formattedAddress
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.pop-content {
  position: relative;
  padding: 20px 20px 0 20px;
  height: 362px;
  .bottom-box {
    position: absolute;
    width: 300px;
    height: 41px;
    bottom: 0;
    .bottom-btn {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: #333333;
      cursor: pointer;
    }
  }
  .text-title {
    text-align: right;
    font-size: 14px;
  }
  .text-content {
    font-size: 14px;
    color: #333333;
  }
}
::v-deep {
  .el-row {
    margin-bottom: 20px;
  }
}
</style>
