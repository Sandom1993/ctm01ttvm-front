<template>
  <div class="map-menu-wrap" :class="wrapClass">
    <div class="map-menu">
      <i
        class="menu-icon"
        :class="currentMode === -1 ? 'h-icon-angle_left' : 'h-icon-close'"
        @click="iconClick"
      ></i>
      <el-button
        type="primary"
        size="mini"
        :class="{ 'dis-none': currentMode === 2 }"
        @click="measure"
      >
        地图测距
      </el-button>
      <!-- <el-button
        type="primary"
        size="mini"
        :class="{ 'dis-none': currentMode === 1 }"
        @click="signPoint"
      >
        添加标记点
      </el-button> -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'MapMenu',
  data() {
    return {
      // -1 未选择 1 地图测距 2 添加标记点
      currentMode: -1
    };
  },
  computed: {
    wrapClass: function() {
      return this.currentMode === -1
        ? 'width-30 animation'
        : this.currentMode === 1
        ? 'width-110'
        : 'width-130';
    }
  },
  methods: {
    measure() {
      this.currentMode = 1;
      this.$emit('measure');
    },
    signPoint() {
      this.currentMode = 2;
      this.$emit('signPoint');
    },
    iconClick() {
      this.$emit('doNone');
      this.currentMode = -1;
    }
  }
};
</script>

<style lang="scss" scoped>
.map-menu-wrap {
  width: 30px;
  height: 30px;
  position: absolute;
  right: 440px;
  overflow: hidden;
  transition: all 0.5s;
  // border-radius: 15px;
  .menu-icon {
    font-size: 16px;
    padding: 0 7px;
  }
  .map-menu {
    height: 30px;
    width: 240px;
    display: flex;
    align-items: center;
    background-color: #ffffff;
  }
}
.animation:hover {
  width: 110px;
}
.width-30 {
  width: 30px;
}
.width-110 {
  width: 110px;
}
.width-130 {
  width: 130px;
}
.dis-none {
  display: none;
}
</style>
