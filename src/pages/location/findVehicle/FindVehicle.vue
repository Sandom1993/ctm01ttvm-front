<template>
  <h-page-container class="wrapper">
    <div id="map" class="map-container"></div>
    <div class="tree-wrap">
      <div class="title">车辆列表</div>
      <div class="inner">
        <vehicle-tree
          ref="resourceTree"
          tree-key="indexCode"
          tree-type="3"
          :check-limit="2000"
          :is-need-online="true"
          :is-need-search-type="true"
          :slot-line="1"
          @getSelectedNodes="handleSelectedNodes"
        ></vehicle-tree>
      </div>
    </div>
    <div
      class="arrow-container"
      :class="{ collapsed: !isShowTab }"
      @click="isShowTab = !isShowTab"
    >
      <i v-show="!isShowTab" class="h-icon-angle_left"></i>
      <i v-show="isShowTab" class="h-icon-angle_right"></i>
    </div>
    <div class="data-container" :class="{ hide: !isShowTab }">
      <div class="find-steps-container">
        <el-button
          class="step-button"
          :class="{ 'current-step': currentStep === 0 }"
          @click="changeStep(0)"
        >
          区域信息
        </el-button>
        <div class="connect-line"></div>
        <el-button
          class="step-button"
          :class="{ 'current-step': currentStep === 1 }"
          @click="changeStep(1)"
        >
          过车信息
        </el-button>
        <div class="connect-line"></div>
        <el-button
          class="step-button"
          :class="{ 'current-step': currentStep === 2 }"
          @click="changeStep(2)"
        >
          轨迹信息
        </el-button>
      </div>
      <div v-show="currentStep === 0" class="result-container">
        <region-rule
          class="body-container"
          :regions="regions"
          :map="map"
          :vector-layer="vectorLayer"
          :modify-feature.sync="modifyFeature"
          @getRegions="getRegions"
        />
        <div class="foot-container">
          <el-button
            type="primary"
            :loading="buttonLoading"
            @click="gotoResult(true)"
          >
            查询
          </el-button>
        </div>
      </div>
      <div v-show="currentStep === 1" class="result-container">
        <pass-vehicle-table
          class="body-container"
          :table-data="passingResult"
          :total-number="passingNumber"
          :current-page.sync="passingPage"
          @currentRowChange="setCurrentVehicleRow"
          @currentPageChange="setCurrentVehiclePage"
        />
        <!--<div class="foot-container">-->
          <!--<el-button type="primary" :loading="buttonLoading" @click="addTrack">-->
            <!--查询-->
          <!--</el-button>-->
        <!--</div>-->
      </div>
      <div v-show="currentStep === 2" class="result-container">
        <vehicle-gps-table
          class="body-container"
          :table-data="gpsPageResult"
          :total-number="gpsNumber"
          :current-page.sync="gpsPage"
          @currentRowChange="setCurrentGpsRow"
          @currentPageChange="setCurrentGpsPage"
        />
      </div>
    </div>
  </h-page-container>
</template>
<script>
import { initMap, clearMap } from './map.js';
import VehicleTree from '@/components/Tree';
import RegionRule from './RegionRule';
import PassVehicleTable from './PassVehicleTable';
import VehicleGpsTable from './VehicleGpsTable';
import {
  getpassingGps,
  gethistoryGps,
  gethistoryGpsPage
} from '@/api/findVehicle';
import { toTimezoneString } from '@/components/util.js';

export default {
  name: 'FindVehicle',
  components: {
    VehicleTree,
    RegionRule,
    PassVehicleTable,
    VehicleGpsTable
  },
  data() {
    return {
      isShowTab: false,
      currentStep: 0,
      selectedDevices: [],
      map: null,
      vectorLayer: null,
      traceLayer: null,
      markerLayer: null,
      regions: [
        {
          id: 1,
          areaName: '区域1',
          gpsPoints: [],
          beginTime: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate(),
            new Date().getHours() > 1
              ? new Date().getHours() - 1
              : new Date().getHours(),
            new Date().getMinutes(),
            new Date().getSeconds()
          ),
          endTime: new Date(),
          geoId: ''
        }
      ],
      beginTime: null,
      endTime: null,
      modifyFeature: null,
      modifiedFeatureId: '',
      buttonLoading: false,
      passingPage: 1,
      passingGpsParam: [],
      passingNumber: 0,
      passingResult: [],
      selectVehicleRow: null,
      gpsPage: 1,
      gpsNumber: 0,
      gpsPageResult: [],
      gpsTotalResult: []
    };
  },
  mounted() {
    // 初始化地图
    const { map, vectorLayer, traceLayer, markerLayer } = initMap();
    this.map = map;
    this.vectorLayer = vectorLayer;
    this.traceLayer = traceLayer;
    this.markerLayer = markerLayer;
  },
  destroyed() {
    if (this.modifyFeature) {
      this.modifyFeature.deactivate();
    }
    this.vectorLayer.setVisibility(true);
    clearMap();
  },
  methods: {
    handleSelectedNodes(nodes) {
      this.selectedDevices = nodes;
    },
    getRegions(arr, t1, t2) {
      this.regions = arr;
      this.beginTime = t1;
      this.endTime = t2;
    },
    changeStep(val) {
      this.currentStep = val;
      if (val === 0) {
        this.modifyFeature && this.modifyFeature.activate();
      } else {
        this.modifyFeature && this.modifyFeature.deactivate();
      }
    },
    checkTime() {
      const start = toTimezoneString(this.beginTime);
      const end = toTimezoneString(this.endTime);
      let flag1 = false;
      this.regions.forEach(item => {
        flag1 = item.endTime === '' || item.beginTime === '' || flag1;
      });
      if (flag1) {
        this.$message({
          type: 'warning',
          message: '请选择时间'
        });
        return false;
      }
      let flag = false;
      const arr1 = [];
      this.regions.forEach(item => {
        const flag2 = item.endTime.getTime() < item.beginTime.getTime();
        flag = flag2 || flag;
        if (flag2) {
          arr1.push(item.areaName);
        }
      });
      if (flag) {
        this.$message({
          type: 'warning',
          message: `${arr1.join('、')}的结束时间不能早于开始时间}`
        });
        return false;
      }

      let flag2 = false;
      const arr2 = [];
      this.regions.forEach(item => {
        const flag3 =
          toTimezoneString(item.endTime).substring(0, 10) !==
          toTimezoneString(item.beginTime).substring(0, 10);
        flag2 = flag3 || flag2;
        if (flag3) {
          arr2.push(item.areaName);
        }
      });
      if (flag2) {
        this.$message({
          type: 'warning',
          message: `${arr2.join('、')}的起止时间不能跨天`
        });
        return false;
      }

      if (start.substring(0, 10) !== end.substring(0, 10)) {
        this.$message({
          type: 'warning',
          message: '所有区域的起止时间不能跨天'
        });
        return false;
      }
      return true;
    },
    // 检验是否有绘制图形
    checkGPS() {
      let flag = true;
      const arr = [];
      this.regions.forEach((item, index) => {
        flag = item.gpsPoints.length > 0 && flag;
        if (item.gpsPoints.length === 0) {
          arr.push(`区域${index + 1}`);
        }
      });
      if (!flag) {
        this.$message({
          type: 'warning',
          message: `请绘制${arr.join(',')}`
        });
        return false;
      }
      return true;
    },
    // 过车查询结果
    gotoResult(isFirstPage) {
      if (isFirstPage) {
        this.currentPage = 1;
      } else {
        this.currentPage = this.passingPage;
      }
      if (!this.checkTime()) {
        return;
      }
      if (!this.checkGPS()) {
        return;
      }
      this.modifyFeature.deactivate();
      const arr = this.regions.map(item => ({
        beginTime: toTimezoneString(item.beginTime),
        endTime: toTimezoneString(item.endTime),
        areaName: item.areaName,
        gpsPoints: item.gpsPoints
      }));
      // this.regions.forEach(item => {
      //   arr.push({
      //     beginTime: toTimezoneString(item.beginTime),
      //     endTime: toTimezoneString(item.endTime),
      //     areaName: item.areaName,
      //     gpsPoints: item.gpsPoints
      //   });
      // });
      this.passingGpsParam = arr;
      const deviceIds = this.selectedDevices.map(item => item.id);
      // this.vectorLayer.removeAllFeatures();
      this.buttonLoading = true;
      getpassingGps({
        vehicleIndexCodes: deviceIds,
        // userIndexCode: this.userInfo.userId ? this.userInfo.userId : '',
        passingAreas: this.passingGpsParam,
        pageNo: this.currentPage,
        pageSize: '20'
      })
        .then(json => {
          this.buttonLoading = false;
          if (json.code === '0') {
            this.currentStep = 1;
            if (json.data && json.data.total > 0) {
              this.passingNumber = json.data.total;
              this.passingResult = json.data.list;
              this.total = json.data.total;
            } else {
              this.total = 0;
              this.passingNumber = 0;
              this.passingResult = [];
              this.$message({
                type: 'warning',
                message: '无过车记录'
              });
            }
          }
        })
        .catch(() => {
          this.buttonLoading = false;
        });
    },
    setCurrentVehicleRow(val) {
      this.selectVehicleRow = val;
      const param = {
        vehicleIndexCode: this.selectVehicleRow.vehicleIndexCode,
        beginTime: toTimezoneString(this.beginTime),
        endTime: toTimezoneString(this.endTime),
        plateNo: this.selectVehicleRow.vehicleLicensePlate
      };
      gethistoryGps(param).then(json => {
        if (json.code === '0') {
          if (json.data.length > 0) {
            this.gpsTotalResult = json.data;
            this.showTrack();
          } else {
            this.$message({
              type: 'warning',
              message: '无相关轨迹信息'
            });
          }
        }
      });
      this.queryGpsPage();
    },
    setCurrentVehiclePage(val) {
      this.passingPage = val;
      this.gotoResult(false);
    },
    // addTrack() {
    //   if (!this.selectVehicleRow) {
    //     this.$message.warning('请选择要查询的车辆');
    //     return;
    //   }
    //   const param = {
    //     vehicleIndexCode: this.selectVehicleRow.vehicleIndexCode,
    //     beginTime: toTimezoneString(this.beginTime),
    //     endTime: toTimezoneString(this.endTime)
    //   };
    //   gethistoryGps(param).then(json => {
    //     if (json.code === '0') {
    //       if (json.data.length > 0) {
    //         this.gpsTotalResult = json.data;
    //         this.showTrack();
    //       } else {
    //         this.$message({
    //           type: 'warning',
    //           message: '无相关轨迹信息'
    //         });
    //       }
    //     }
    //   });
    //   this.queryGpsPage();
    // },
    queryGpsPage() {
      const param = {
        vehicleIndexCode: this.selectVehicleRow.vehicleIndexCode,
        beginTime: toTimezoneString(this.beginTime),
        endTime: toTimezoneString(this.endTime),
        pageNo: this.gpsPage,
        pageSize: 20
      };
      gethistoryGpsPage(param).then(json => {
        if (json.code === '0') {
          this.currentStep = 2;
          if (json.data && json.data.total > 0) {
            this.gpsNumber = json.data.total;
            this.gpsPageResult = json.data.list;
          } else {
            this.gpsNumber = 0;
            this.gpsPageResult = [];
            this.$message({
              type: 'warning',
              message: '无相关轨迹信息'
            });
          }
        }
      });
    },
    showTrack() {
      if (!this.gpsTotalResult || !this.gpsTotalResult.length) {
        return;
      }
      this.traceLayer.removeAllFeatures();
      this.markerLayer.removeAllFeatures();
      const pointList = this.gpsTotalResult.map(item => {
        return new HGIS.Geometry.Point(
          item.longitude / 360000,
          item.latitude / 360000
        ).transform(
          new HGIS.Projection('EPSG:4326'),
          new HGIS.Projection('EPSG:900913')
        );
      });
      let [minX, minY, maxX, maxY] = [0, 0, 0, 0];
      for (let i = 0; i < pointList.length; i++) {
        if (i === 0) {
          minX = pointList[i].x;
          minY = pointList[i].y;
          maxX = pointList[i].x;
          maxY = pointList[i].y;
        } else {
          minX = minX > pointList[i].x ? pointList[i].x : minX;
          minY = minY > pointList[i].y ? pointList[i].y : minY;
          maxX = maxX < pointList[i].x ? pointList[i].x : maxX;
          maxY = maxY < pointList[i].y ? pointList[i].y : maxY;
        }
      }
      const lineStyle = {
        fillColor: '#2080f7', // 十六进制填充颜色，默认为”#ee9900”。
        fillOpacity: 0.1, // {Number} 填充不透明度。默认为0.4。
        strokeColor: '#2080f7', // {String} 十六进制描边颜色r. 默认为 “#ee9900”.
        strokeOpacity: 0.7, // {Number} 描边的不透明度(0-1),默认为1.
        strokeWidth: 4
      };
      // eslint-disable-next-line
      let lineFeature = new HGIS.Feature.Vector(new HGIS.Geometry.LineString(pointList), {}, lineStyle);
      // this.traceLayer.addFeatures([lineFeature]);
      // 起点
      const startPoint = pointList[0];
      const startPointStyle = {
        fontColor: '#333',
        fontSize: 12,
        graphicWidth: 36,
        graphicHeight: 36,
        graphicYOffset: -36,
        externalGraphic: require('../../../assets/png/map-start.png')
      };
      // eslint-disable-next-line
      const startPointVector = new HGIS.Feature.Vector(startPoint, null, startPointStyle);
      // 终点
      const endPoint = pointList[pointList.length - 1];
      const endPointStyle = {
        fontColor: '#333',
        fontSize: 12,
        graphicWidth: 36,
        graphicHeight: 36,
        graphicYOffset: -36,
        externalGraphic: require('../../../assets/png/map-end.png')
      };
      // eslint-disable-next-line
      const endPointVector = new HGIS.Feature.Vector(endPoint, null, endPointStyle);
      this.traceLayer.addFeatures([
        lineFeature,
        startPointVector,
        endPointVector
      ]);
      // eslint-disable-next-line
      this.map.zoomToExtent(new HGIS.Bounds(minX, minY, maxX, maxY));
    },
    setCurrentGpsRow(val) {
      if (!val) {
        return;
      }
      this.markerLayer.removeAllFeatures();
      const point = new HGIS.Geometry.Point(
        val.longitude / 360000,
        val.latitude / 360000
      ).transform(
        new HGIS.Projection('EPSG:4326'),
        new HGIS.Projection('EPSG:900913')
      );
      const pointStyle = {
        fontColor: '#333',
        fontSize: 12,
        graphicWidth: 36,
        graphicHeight: 36,
        graphicYOffset: -36,
        labelAlign: 'cm',
        labelOutlineWidth: 0,
        labelXOffset: 0,
        labelYOffset: 20,
        externalGraphic: require('../../../assets/png/map-location-marker.png')
      };
      // eslint-disable-next-line
      const pointVector = new HGIS.Feature.Vector(point, null, pointStyle);
      this.markerLayer.addFeatures([pointVector]);
    },
    setCurrentGpsPage(val) {
      this.gpsPage = val;
      this.queryGpsPage();
    }
  }
};
</script>

<style lang="scss" scoped>
.wrapper {
  position: relative;
  display: flex;
  flex-direction: row;
}
.map-container {
  height: 100%;
  flex: 1;
}
.arrow-container {
  position: absolute;
  bottom: 90px;
  right: 498px;
  width: 32px;
  height: 80px;
  cursor: pointer;
  transition: right 0.7s;
  z-index: 2000;
  background-color: #fff;
  box-shadow: 0 0.01rem 0.06rem rgba(0, 0, 0, 0.15);
  opacity: 0.9;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  border: 1px solid #e5e5e5;
  border-right: none;
}
.arrow-container.collapsed {
  right: 0;
  transition: right 0.7s;
}
.data-container {
  width: 498px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: width 0.7s;

  .find-steps-container {
    height: 64px;
    display: flex;
    justify-content: center;
    align-items: center;

    .step-button {
      color: #2080f7;
      border: 1px solid #2080f7;
    }
    .current-step {
      color: #fff;
      background: #2080f7;
    }
    .connect-line {
      width: 24px;
      border-bottom: 1px solid #2080f7;
    }
  }
  .result-container {
    flex: 1;
    height: 0;
    padding: 0 32px;
    display: flex;
    flex-direction: column;
    .body-container {
      height: 0;
      flex: 1;
    }
    .foot-container {
      padding: 8px 0;
      .el-button {
        width: 100%;
        max-width: 500px;
      }
    }
  }
}
.data-container.hide {
  width: 0;
  transition: width 0.7s;
}
.tree-wrap {
  position: absolute;
  width: 320px;
  top: 8px;
  left: 8px;
  bottom: 16px;
  background: #ffffff;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.2);
  border-radius: 2px;
  .inner {
    position: absolute;
    left: 12px;
    right: 12px;
    top: 60px;
    bottom: 0;
  }
  .title {
    font-size: 14px;
    color: rgba(0, 0, 0, 0.7);
    line-height: 20px;
    padding: 14px 12px;
    border-bottom: 1px solid #e8e8e8;
    margin-bottom: 12px;
  }
}

.show-tab .tree-wrap {
  bottom: 264px;
}

.info-tab {
  height: 264px;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0 12px;
  background: #ffffff;
  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.2);
}

.show-alarm .info-tab {
  right: 440px;
}

.alarm-ledger-wrap {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: 440px;
  background: #fff;
  border-left: 1px solid rgba(0, 0, 0, 0.12);
  padding: 8px 12px 0;
  overflow: auto;
}
</style>

<style>
.location-wrap .control-box-center .control-label {
  width: 72px;
  margin-right: 8px;
  color: #999;
  text-align: right;
}

.location-wrap ul.control-box-center {
  height: inherit;
}

.location-wrap ul.control-box-center > li {
  height: 32px;
  line-height: 32px;
  color: #666;
  padding-left: 0px;
}

.location-wrap ul.control-box-center > li span {
  display: inline-block;
  width: 240px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.location-wrap .popup-bottom {
  border-top: 1px solid #ccc !important;
  height: 48px;
  line-height: 52px;
  width: 334px;
  position: absolute;
  bottom: 4px;
  padding: 0 8px;
}

.location-wrap .popup-bottom i {
  display: inline-block;
  padding: 8px;
}

.location-wrap .control-pic {
  width: 100px;
  height: 120px;
  margin-top: 16px;
  display: inline-block;
  position: absolute;
  top: 48px;
  right: 24px;
}
.olPopup li:hover {
  background: none !important;
}
</style>
