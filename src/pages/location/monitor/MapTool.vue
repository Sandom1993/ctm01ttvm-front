<template>
  <div>
    <div class="map-tool-bar-wrap">
      <div class="tool-bar-wrap">
        <div class="tool-wrap mr8 " @click="showToolBox()">
          <i class="rm-collection"></i>
          <span>工具箱</span>
        </div>
        <div class="split-line"></div>
        <div class="tool-wrap mr8 " @click="toggleTrafficLayer()">
          <i class="h-icon-location"></i>
          <span>{{ isShowTrafficLayer ? '隐藏路况' : '显示路况' }}</span>
        </div>
        <div class="split-line"></div>
        <div class="tool-wrap mr8 ml8" @click="showMeasure()">
          <i class="rm-measure"></i>
          <span>测量</span>
        </div>
        <div class="split-line"></div>
        <div
          v-if="isFullScreen"
          class="tool-wrap ml8"
          @click="toNormalScreen()"
        >
          <i class="h-icon-windows_minimize"></i>
          <span>返回</span>
        </div>
        <div v-else class="tool-wrap ml8" @click="toFullScreen()">
          <i class="h-icon-windows_maximum"></i>
          <span>全屏</span>
        </div>
      </div>
    </div>
    <div v-if="isShowRightBar" class="right-bar-wrap">
      <div class="right-bar-head">
        <span class="card-name">
          {{ rightBarHeadName }}
        </span>
        <span class="close" @click="closeRightBar()">
          <i class="h-icon-close"></i>
        </span>
      </div>
      <div class="right-bar-body">
        <div
          v-if="activeTool === 10 && isShowTrafficLayer"
          class="traffic-layer"
        >
          <el-tag color="#C31926">
            严重拥堵
          </el-tag>
          <el-tag color="#FF3845">
            拥挤
          </el-tag>
          <el-tag color="#FCA134">
            缓行
          </el-tag>
          <el-tag color="#2DC019">
            畅通
          </el-tag>
          <div class="update-time">
            最新更新时间:
            <span>{{ lastUpdateTime }}</span>
          </div>
        </div>
        <div v-else-if="isShowtoolBox">
          <div class="app-card" @click="goToApp('/ctm01ttvm-web/#/location/vehicleTrack', '行车轨迹')">
            <i class="rm-track size32"></i>
            <span>行车轨迹</span>
          </div>
          <div class="app-card" @click="goToApp('/ctm01ttvm-web/#/location/findVehicle', '区域查车')">
            <i class="rm-passingcar size32"></i>
            <span>区域查车</span>
          </div>
          <div class="app-card" @click="goToApp('/brtfence-web/vehicle', '电子围栏')">
            <i class="rm-eventissue size32"></i>
            <span>电子围栏</span>
          </div>
        </div>
        <div v-else-if="isShowMeasure" class="spatial-query">
          <el-button
            title="测线"
            type="iconButton"
            icon="rm-line"
            @click="measureLength()"
          ></el-button>
          <el-button
            title="测面"
            type="iconButton"
            icon="rm-polygon"
            @click="measureArea1()"
          ></el-button>
        </div>
        <div v-else-if="isShowStatus" class="vehicle-status">
          <span>
            <i class="blue"></i>
            {{ $t('Normal') }}
            <p>{{ onlineDeviceNum }}{{ $t('Vehicle') }}</p>
          </span>
          <span class="fr">
            <i class="red"></i>
            {{ $t('Alarm') }}
            <p>{{ alarmDeviceNum }}{{ $t('Vehicle') }}</p>
          </span>
          <span>
            <i class="orange"></i>
            {{ $t('LowSpeed') }}
            <p>{{ lowSpeedDeviceNum }}{{ $t('Vehicle') }}</p>
          </span>
          <span class="fr">
            <i class="grey"></i>
            {{ $t('Offline') }}
            <p>{{ offlineDeviceNum }}{{ $t('Vehicle') }}</p>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { toTimezoneString, toTimeNormalString } from '@/components/util.js';
import {
  measureDistance,
  measureArea,
  showTrafficLayer,
  refreshTrafficLayer
} from '@/pages/location/monitor/map.js';

export default {
  name: 'MapTool',
  props: {
    onlineDeviceNum: {
      type: Number,
      require: true,
      default: 0
    },
    offlineDeviceNum: {
      type: Number,
      require: true,
      default: 0
    },
    alarmDeviceNum: {
      type: Number,
      require: true,
      default: 0
    },
    lowSpeedDeviceNum: {
      type: Number,
      require: true,
      default: 0
    },
    isShowRightPanel: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      activeTool: 888,
      tool: [
        { id: '0', name: '工具箱' },
        { id: '1', name: this.$t('StatusStatic') },
        { id: '2', name: this.$t('SpatialQuery') },
        { id: '3', name: this.$t('Show') },
        { id: '4', name: '测量' },
        { id: '5', name: '截屏' },
        { id: '6', name: this.$t('Clear') },
        { id: '7', name: this.$t('Location') },
        { id: '8', name: '重置' },
        { id: '9', name: '全屏' },
        { id: '10', name: '实时路况' },
        { id: '11', name: this.$t('BroadcastingPanel') }
      ],
      rightBarHeadName: '',
      isShowRightBar: false,
      isFullScreen: false, // 是否全屏
      lastUpdateTime: null,
      isShowTrafficLayer: false
    };
  },
  computed: {
    isShowtoolBox() {
      return this.activeTool === 0;
    },
    isShowStatus() {
      return this.activeTool === 1;
    },
    isShowSpatial() {
      return this.activeTool === 2;
    },
    isShowMeasure() {
      return this.activeTool === 4;
    }
  },
  watch: {
    activeTool(val) {
      if (val < 888) {
        if (val !== 11) {
          this.rightBarHeadName = this.tool[val].name;
          this.isShowRightBar = true;
          this.$emit('update:isShowRightPanel', false);
        }
      } else {
        this.isShowRightBar = false;
      }
    }
  },
  methods: {
    closeRightBar() {
      if (this.activeTool === 10) {
        this.activeTool = 888;
        this.isShowTrafficLayer = false;
        showTrafficLayer(this.isShowTrafficLayer);
      } else if (this.isShowTrafficLayer) {
        this.activeTool = 10;
      } else {
        this.activeTool = 888;
      }
    },
    showToolBox() {
      this.activeTool = 0;
    },
    showBroadcastPanel() {
      if (!this.isShowRightPanel) {
        this.activeTool = 11;
      } else {
        this.activeTool = 888;
      }
      this.$emit('update:isShowRightPanel', !this.isShowRightPanel);
    },
    toggleTrafficLayer() {
      this.isShowTrafficLayer = !this.isShowTrafficLayer;
      if (this.isShowTrafficLayer) {
        this.activeTool = 10;
      } else {
        this.activeTool = 888;
      }
      this.updateTime();
      showTrafficLayer(this.isShowTrafficLayer);
    },
    updateTime() {
      this.lastUpdateTime = toTimeNormalString(toTimezoneString(new Date()));
    },
    refresh() {
      this.updateTime();
      refreshTrafficLayer();
    },
    showStatus() {
      this.activeTool = 1;
    },
    showSpatial() {
      this.activeTool = 2;
    },
    showMeasure() {
      this.activeTool = 4;
    },
    toolBoxTrigger(eventValue) {
      this.$emit('showToolBoxApp', eventValue);
    },
    measureLength() {
      measureDistance();
    },
    measureArea1() {
      measureArea();
    },
    toFullScreen() {
      this.isFullScreen = true;
      top.window.extendScreen({ isExtend: true });
    },
    toNormalScreen() {
      this.isFullScreen = false;
      top.window.extendScreen({ isExtend: false });
    },
    goToApp (url, name) {
      window.top.goToApp({
        url,
        name
      });
    }
  }
};
</script>
<style scoped>
.map-tool-bar-wrap {
  height: 48px;
}
.tool-wrap {
  display: inline-block;
}
.tool-bar-wrap {
  display: inline-block;
  background-color: #fff;
  box-shadow: 0 0.01rem 0.06rem rgba(0, 0, 0, 0.15);
  padding: 8px 16px;
  border-radius: 2px;
  float: right;
}
.split-line {
  display: inline-block;
  width: 1px;
  height: 16px;
  vertical-align: middle;
  background-color: #eee;
}
.tool-bar-wrap span {
  display: inline-block;
  margin-left: 8px;
  vertical-align: middle;
}
.tool-bar-wrap div :hover {
  cursor: pointer;
}
.tool-box-wrap {
  display: inline-block;
  background-color: #fff;
  box-shadow: 0 0.01rem 0.06rem rgba(0, 0, 0, 0.15);
  padding: 8px 16px;
  border-radius: 2px;
}
.tool-box-wrap span {
  display: inline-block;
  margin-left: 8px;
  vertical-align: middle;
}
.tool-box-wrap div:hover {
  cursor: pointer;
}
.right-bar-wrap {
  background-color: #fff;
  box-shadow: 0 0.01rem 0.06rem rgba(0, 0, 0, 0.15);
  border-radius: 2px;
  width: 300px;
  float: right;
}
.right-bar-head {
  height: 40px;
  line-height: 40px;
  padding: 8px 16px;
}
.app-card {
  display: inline-block;
  width: 88px;
  height: 88px;
  padding: 16px;
  text-align: center;
}
.app-card:hover {
  cursor: pointer;
}
.app-card span {
  display: block;
  margin-top: 8px;
}
.close {
  width: 24px;
  height: 24px;
  float: right;
}
.close:hover {
  cursor: pointer;
}
.vehicle-status > span {
  display: inline-flex;
  align-items: center;
  width: 128px;
  height: 36px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
  vertical-align: middle;
  margin-right: 0px !important;
}
.traffic-layer > span {
  margin-right: 12px !important;
}
.update-time {
  height: 36px;
  line-height: 36px;
  font-size: 12px;
}

.vehicle-status i {
  margin-right: 8px;
  display: inline-block;
  width: 12px;
  height: 12px;
  vertical-align: middle;
}
.vehicle-status p {
  margin-left: 16px;
  color: rgba(0, 0, 0, 0.7);
  vertical-align: middle;
}
.right-bar-body {
  padding: 0 16px 16px 16px;
}
.right-bar-body span {
  white-space: nowrap;
  height: 24px;
  margin-right: 16px;
}
.spatial-query {
  padding: 16px;
  font-size: 12px;
}

.fr {
  float: right;
}
.blue {
  background-color: #2080f7;
}
.grey {
  background-color: #d8d8d8;
}
.red {
  background-color: #ff6b6b;
}
.orange {
  background-color: #fdb434;
}
i {
  vertical-align: middle;
}

.rm-collection {
  font-size: 24px;
}
</style>
