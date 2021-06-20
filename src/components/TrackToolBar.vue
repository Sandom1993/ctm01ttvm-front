<template>
  <div class="track-tool-bar-wrap">
    <div class="plateno">
      {{ plateNo }}
    </div>
    <el-button
      title="后退"
      class="menu-btn"
      :disabled="progress === 1"
      icon="h-icon-angle_line_left"
      @click="backT"
    ></el-button>
    <el-button
      v-show="!isStart || isFinished"
      title="开始"
      class="menu-btn"
      icon="h-icon-angle_right"
      @click="startT"
    ></el-button>
    <el-button
      v-show="isStart && !isFinished"
      title="暂停"
      class="menu-btn"
      icon="h-icon-blocked"
      @click="pauseT"
    ></el-button>
    <el-button
      title="前进"
      class="menu-btn"
      :disabled="isFinished"
      icon="h-icon-angle_line_right"
      @click="nextT"
    ></el-button>
    <div class="speed-adj">
      <el-button
        title="慢速"
        :disabled="speed <= 0.25"
        icon="h-icon-angles_left_sm"
        @click="speedDown"
      ></el-button>
      <div class="speed-num">{{ speed }}x</div>
      <el-button
        title="倍速"
        :disabled="speed >= 16"
        icon="h-icon-angles_right_sm"
        @click="speedUp"
      ></el-button>
    </div>
    <div class="slider">
      <el-slider
        v-model="progress"
        :max="max"
        :min="0"
        :show-tooltip="false"
        @drag-end="sliderChange"
        @slider-click="sliderChange"
      ></el-slider>
      <div class="slider-time">
        <span class="slider-start-time">{{ time[0] }}</span>
        <span class="slider-now-time">
          {{ new Date(timeList[progress - 1]).toTimeString().substr(0, 8) }}
        </span>
        <span class="slider-end-time">{{ time[1] }}</span>
      </div>
    </div>
    <el-button
      title="设置"
      class="menu-btn"
      icon="h-icon-setting"
      @click="trackSetting"
    ></el-button>
    <el-button
      title="隐藏/显示速度图表"
      class="menu-btn"
      icon="h-icon-menu_leftbar"
      @click="chartShow"
    ></el-button>
  </div>
</template>

<script>
export default {
  name: 'OrgTree',
  props: {
    max: {
      type: Number,
      default: 1
    },
    time: {
      type: Array,
      default: ['无起始时间', '无截止时间']
    },
    timeList: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      speed: 1,
      progress: 1,
      isStart: false,
      plateNo: '暂无车牌信息'
    };
  },
  computed: {
    isFinished: function() {
      // console.log(this.progress, this.max)
      return this.progress === this.max;
    }
  },
  methods: {
    init() {
      this.progress = 1;
      this.speed = 1;
      this.isStart = false;
    },
    setPlateNo(v) {
      this.plateNo = v;
    },
    trackSetting() {
      this.$emit('trackSetting');
    },
    chartShow() {
      this.$emit('chartShow');
    },
    sliderChange(t) {
      this.$nextTick(() => {
        // this.progress = t;
        this.$emit('sliderChange', this.progress);
        this.isStart = false;
      });
    },
    progressIncrease() {
      this.isStart = true;
      if (this.progress < this.max) {
        this.progress++;
      }
    },
    startT() {
      this.isStart = true;
      if (!this.isFinished) {
        this.$emit('startT', this.progress - 1);
      }
      // 已经播放结束时候点击开始，重置progress
      if (this.isFinished) {
        this.progress = 1;
        this.$emit('sliderChange', this.progress - 1);
        this.$emit('startT', this.progress);
      }
    },
    pauseT() {
      this.isStart = false;
      this.$emit('pauseT');
    },
    nextT() {
      // 这里progress会自增2，是父组件中经过两个点触发回调progressIncrease,会先回到K0，然后返回的点，backT同理
      // 有时候只会自增1,前提是两个节点间会有插点时,这时候默认只回到K0,当前选择只在K0时进行自增
      if (this.isFinished) {
        return;
      }
      // this.progress -= 1;
      this.$emit('sliderChange', this.progress);
      this.isStart = false;
    },
    backT() {
      if (this.progress === 0) {
        return;
      }
      this.progress -= 2;
      // console.log(this.progress);
      this.$emit('sliderChange', this.progress);
      this.isStart = false;
    },
    speedUp() {
      if (this.speed >= 16) return;
      this.speed *= 2;
      this.$emit('speedUp');
    },
    speedDown() {
      if (this.speed <= 0.25) return;
      this.speed /= 2;
      this.$emit('speedDown');
    }
  }
};
</script>
<style lang="scss" scoped>
.track-tool-bar-wrap {
  display: flex;
  align-items: center;
}
.plateno {
  width: 20%;
  padding-left: 2%;
  padding-right: 3%;
  font-family: ArialMT;
  font-size: 12px;
  color: #4c4c4c;
}
.menu-btn {
  width: 30px;
  height: 24px;
}
.speed-adj {
  width: 118px;
  height: 24px;
  background: rgba(158, 158, 158, 0.2);
  border-radius: 12px;
  margin-left: 2%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  .el-button {
    width: 24px;
    height: 24px;
  }
  .speed-num {
    width: 30px;
    text-align: center;
  }
}
.slider {
  width: 50%;
  padding-left: 3%;
  padding-right: 5%;
  .el-slider {
    width: 100%;
    height: 24px;
  }
  .slider-time {
    display: flex;
    justify-content: space-between;
  }
  .slider-start-time {
    font-family: MicrosoftYaHeiUI;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.3);
    letter-spacing: 0;
  }
  .slider-now-time {
    font-family: MicrosoftYaHeiUI;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.3);
    letter-spacing: 0;
    display: inline-block;
  }
  .slider-end-time {
    font-family: MicrosoftYaHeiUI;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.3);
    letter-spacing: 0;
  }
}
@media screen and (max-width: 1410px) {
  ::v-deep .h-icon-setting {
    display: none;
  }
  ::v-deep .h-icon-menu_leftbar {
    display: none;
  }
  .slider-start-time {
    opacity: 0;
  }
  .slider-end-time {
    opacity: 0;
  }
}
</style>
