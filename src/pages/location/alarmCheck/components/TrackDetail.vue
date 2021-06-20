<template>
  <el-dialog
    title="轨迹详情"
    :visible.sync="dialogVisible"
    :area="[dialogWidth, dialogHeight]"
    size="small"
    :before-close="handleClose"
  >
    <div class="dialog-box">
      <div :class="isExpand ? 'track-table' : 'track-table track-table-hide'">
<!--        <div class="track-table-title" @click="handleClick">-->
<!--          <span>轨迹详情</span>-->
<!--          <i-->
<!--            :class="isExpand ? 'drop-icon' : 'drop-icon-expand'"-->
<!--            class="h-icon-angles_up_sm"-->
<!--          ></i>-->
<!--        </div>-->
        <div class="track-car-info">
          <div style="display: flex;align-items: center">
            <i class="h-icon-car"></i>
            <span>{{ rowData.vehicleLicensePlate }}</span>
          </div>
          <div style="display: flex;align-items: center">
            <span style="color: #FF952C">{{ rowData.vehicleSelfNo }}</span>
          </div>
        </div>
        <div class="track-table-content">
          <el-table
            ref="trackTable"
            :data="tableData"
            stripe
            force-scroll
            :height="tableHeight * 0.75 - 86"
            highlight-current-row
            :row-class-name="tableRowClassName"
            style="width: 100%"
            @current-change="handleRowClick"
          >
            <el-table-column prop="time" label="数据时间" width="100">
              <template slot-scope="scope">
                {{ getDateTime(scope.row.time) }}
              </template>
            </el-table-column>
            <el-table-column prop="speed" label="定位速度" width="100">
              <template slot-scope="scope">
                {{ scope.row.speed + ' km/h' }}
              </template>
            </el-table-column>
            <el-table-column prop="pulseSpeed" label="脉冲速度" width="100">
              <template slot-scope="scope">
                {{ scope.row.pulseSpeed + ' km/h' }}
              </template>
            </el-table-column>
            <!-- <el-table-column prop="recordSpeed" label="导航屏速" width="100">
              <template slot-scope="scope">
                {{ scope.row.recordSpeed + ' km/h' }}
              </template>
            </el-table-column> -->
            <el-table-column prop="limitSpeed" label="限速" width="100">
              <template slot-scope="scope">
                {{ scope.row.limitSpeed + ' km/h' }}
              </template>
            </el-table-column>
            <el-table-column prop="serverTime" label="GPS接收时间" width="110">
              <template slot-scope="scope">
                {{ getDateTime(scope.row.serverTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="satellites" label="搜星数量" width="80" />
            <el-table-column prop="longitude" label="经度" width="100" show-overflow-tooltip />
            <el-table-column prop="latitude" label="纬度" width="100" show-overflow-tooltip />
            <el-table-column prop="direction" label="方向" width="90" />
          </el-table>
        </div>
      </div>
      <div id="track-map" class="map-container"></div>
    </div>
  </el-dialog>
</template>

<script>
import { clearMap, closePopup, initMap, openPopup } from '../map';
import { gethistoryGps } from '@/api/findVehicle';
import { toTimeNormalString, toTimezoneString } from '../../../../components/util';

let markers;
export default {
  name: 'TrackDetail',
  props: {
    dialogVisible: {
      type: Boolean,
      default: function() {
        return false;
      }
    },
    rowData: {
      type: Object,
      default: function() {
        return {};
      }
    },
    tableHeight: {
      type: Number,
      default: function() {
        return 0;
      }
    },
    tableWidth: {
      type: Number,
      default: function() {
        return 0;
      }
    },
    isCheck: {
      type: Boolean,
      default: function() {
        return false;
      }
    }
  },
  data() {
    return {
      dialogWidth: 0,
      dialogHeight: 0,
      isExpand: true,
      tableData: [],
      map: null,
      points: []
    };
  },
  watch: {
    tableHeight(val) {
      this.dialogHeight = val * 0.75;
    },
    tableWidth(val) {
      this.dialogWidth = val * 0.75;
    },
    isCheck() {
      this.isExpand = true;
      this.$nextTick(() => {
        this.getPoint();
        this.initMap();
      });
    }
  },
  mounted() {},
  methods: {
    getDateTime(time) {
      if (time === null) {
        return '';
      }
      return typeof time !== 'undefined'
        ? toTimeNormalString(toTimezoneString(time)).split(' ')[1]
        : '';
    },
    getDate(time) {
      if (time === null) {
        return '';
      }
      return typeof time !== 'undefined'
        ? toTimeNormalString(toTimezoneString(time))
        : '';
    },
    /**
     * @description: 通过表格索引 定位表格的位置
     * @return:
     * @author: hch
     * @param refName
     * @param index
     */
    tableScrollMove(refName, index) {
      if (!refName || !this.$refs[refName]) return; // 不存在表格的ref vm 则返回
      const vmEl = this.$refs[refName].$el;
      if (!vmEl) return;
      // 计算滚动条的位置
      const scrollParent = vmEl.querySelector('.el-table-scrollbar__wrap');
      scrollParent.scrollTop = scrollParent.scrollHeight * index - (this.tableHeight * 0.75 - 158) / 2;
    },
    //  获取数据点
    getPoint() {
      const params = {
        beginTime: toTimezoneString(this.rowData.beginTime - 10 * 60 * 1000),
        endTime: toTimezoneString(this.rowData.endTime + 10 * 60 * 1000),
        plateNo: this.rowData.vehicleLicensePlate,
        pageNo: 1,
        pageSize: 10,
        vehicleIndexCode: this.rowData.vehicleIndexCode
      };
      gethistoryGps(params).then(res => {
        const arr = [];
        if (res.data.length > 0) {
          this.tableData = res.data.map(item => {
            item.speed = (item.speed ? item.speed : 0) / 100000;
            item.recordSpeed = (item.recordSpeed ? item.recordSpeed : 0) / 100000;
            item.longitude = parseFloat((item.longitude / 360000).toFixed(6));
            item.latitude = parseFloat((item.latitude / 360000).toFixed(6));
            item.direction = parseInt(item.direction / 100, 10);
            item.pulseSpeed = item.pulseSpeed ? item.pulseSpeed : 0;
            item.limitSpeed = item.limitSpeed ? item.limitSpeed : 0;
            return item;
          });
          this.tableData.forEach(item => {
            const obj = {
              longitude: item.longitude,
              latitude: item.latitude,
              direction: item.direction,
              isAlarm:
                this.rowData.beginTime <= item.time &&
                item.time <= this.rowData.endTime
            };
            if (obj.latitude !== 0 && obj.longitude !== 0) {
              arr.push(obj);
            }
          });
          let barPosition = 0;
          let tempRow = null;
          this.tableData.forEach((item, index) => {
            if (this.rowData.beginTime <= item.time && item.time <= this.rowData.endTime) {
              barPosition = index / this.tableData.length;
              tempRow = item;
              return false;
            }
          });
          this.points = [...arr];
          this.$nextTick(() => {
            this.tableScrollMove('trackTable', barPosition);
          });
          setTimeout(() => {
            this.getTrack();
            this.handleRowClick(tempRow);
          }, 200);
        }
      });
    },
    handleClick() {
      this.isExpand = !this.isExpand;
    },
    initMap() {
      // 初始化报警的地图
      const {
        map,
        vectorLayer,
        traceLayer,
        markerLayer,
        pointLayer
      } = initMap();
      this.map = map;
      this.vectorLayer = vectorLayer;
      this.traceLayer = traceLayer;
      this.markerLayer = markerLayer;
      this.pointLayer = pointLayer;
      // 创建Marker图层
      markers = new HGIS.Layer.Markers('Markers', {});
      this.map.addLayer(markers);
      this.map.events.register('zoomend', this.map, (...args) => {
        this.pointLayer.setVisibility(this.map.getZoom() >= 15);
      });
    },
    //  获取线路
    getTrack() {
      const lineStyle = {
        fillColor: '#ED3838', // 十六进制填充颜色，默认为”#ee9900”。
        fillOpacity: 0.1, // {Number} 填充不透明度。默认为0.4。
        strokeColor: '#ED3838', // {String} 十六进制描边颜色r. 默认为 “#ee9900”.
        strokeOpacity: 0.7, // {Number} 描边的不透明度(0-1),默认为1.
        strokeWidth: 2
      };
      const pointList = this.points.map(item => {
        return new HGIS.Geometry.Point(item.longitude, item.latitude).transform(
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
      const lineFeature = new HGIS.Feature.Vector(
        new HGIS.Geometry.LineString(pointList),
        null,
        lineStyle
      );
      this.traceLayer.addFeatures([lineFeature]);
      this.pointLayer.removeAllFeatures();
      this.markerLayer.removeAllFeatures();
      this.points.forEach((item, index) => {
        const lastAlarmPoint = new HGIS.Geometry.Point(
          item.longitude,
          item.latitude
        ).transform(
          new HGIS.Projection('EPSG:4326'),
          new HGIS.Projection('EPSG:900913')
        );
        const pointStyle = {
          graphicWidth: index !== 0 && index !== (this.points.length - 1) ? 20 : 40,
          graphicHeight: index !== 0 && index !== (this.points.length - 1) ? 20 : 40,
          graphicZIndex: 10000,
          graphicYOffset: index !== 0 && index !== (this.points.length - 1) ? undefined : -40
        };
        let iconData;
        if (index === 0) {
          iconData = require('../../../../assets/png/map-start.png');
        } else if (index === this.points.length - 1) {
          iconData = require('../../../../assets/png/map-end.png');
        } else {
          iconData = item.isAlarm ? require('../../../../assets/png/vehicle-alarm.png') : require('../../../../assets/png/map-vehicle.png');
        }
        const pointVector = new HGIS.Feature.Vector(lastAlarmPoint, null, {
          ...pointStyle,
          rotation: index !== 0 && index !== (this.points.length - 1) ? item.direction : undefined,
          externalGraphic: iconData
        });
        if (index !== 0 && index !== this.points.length - 1) {
          this.pointLayer.addFeatures(pointVector);
        } else {
          this.markerLayer.addFeatures(pointVector);
        }
      });
      this.map.zoomToExtent(new HGIS.Bounds(minX, minY, maxX, maxY));
    },
    //  打开地图infoWindow
    showPopUp(row, lng, lat, normal) {
      closePopup();
      const option = {
        beginTime: this.rowData.beginTime - 10 * 60 * 1000,
        endTime: this.rowData.endTime + 10 * 60 * 1000,
        indexCode: row.vehicleIndexCode,
        time: this.getDate(row.time),
        location: [lng, lat],
        titleHTML: row.vehicleLicensePlate,
        eventTypeName: this.rowData.eventTypeName,
        continueTime: this.rowData.continueTime,
        id: this.rowData.eventId,
        level: this.rowData.level,
        orgName: row.orgName,
        speed: row.speed ? row.speed : 0,
        driverName: this.rowData.driverName,
        isNormal: normal,
        plateNo: this.rowData.vehicleLicensePlate
      };
      openPopup(option, this);
    },
    //  点击一行数据
    handleRowClick(row) {
      closePopup();
      if (row) {
        const lng = row.longitude;
        const lat = row.latitude;
        const centerP = new HGIS.LonLat(lng, lat).transform(
          new HGIS.Projection('EPSG:4326'),
          new HGIS.Projection('EPSG:900913')
        );
        this.map.setCenter(centerP);
        if (this.rowData.beginTime <= row.time && row.time <= this.rowData.endTime) {
          markers.removeMarker(markers.markers[0]);
          // 在图层上添加 Marker
          const size = new HGIS.Size(50, 50);
          // const offset = new HGIS.Pixel(-(size.w / 2), -size.h);
          const lonlat1 = new HGIS.LonLat(lng, lat).transform(
            new HGIS.Projection('EPSG:4326'),
            new HGIS.Projection('EPSG:900913')
          );
          const icon = new HGIS.Icon(require('../../../../assets/png/Map_Box_camera_Alarm_Nor.png'), size);
          const marker = new HGIS.Marker(lonlat1, icon);
          marker.events.register('click', marker, () => {
            this.showPopUp(row, lng, lat, false);
          });
          markers.addMarker(marker);
          if (markers.markers.length > 1) {
            markers.removeMarker(markers.markers[0]);
          }
        } else {
          markers.removeMarker(markers.markers[0]);
          // 在图层上添加 Marker
          const size = new HGIS.Size(40, 40);
          const lonlat1 = new HGIS.LonLat(lng, lat).transform(
            new HGIS.Projection('EPSG:4326'),
            new HGIS.Projection('EPSG:900913')
          );
          const icon = new HGIS.Icon(require('../../../../assets/png/inverseClusterCenter.gif'), size);
          const marker = new HGIS.Marker(lonlat1, icon);
          marker.events.register('click', marker, () => {
            this.showPopUp(row, lng, lat, true);
          });
          markers.addMarker(marker);
        }
      }
    },
    //  自定义报警数据表格样式
    tableRowClassName({ row, rowIndex }) {
      if (this.rowData.beginTime <= row.time && row.time <= this.rowData.endTime) {
        return 'alarm-row';
      }
      return '';
    },
    handleOk() {
      clearMap();
      this.$emit('on-close');
    },
    handleCancel() {
      clearMap();
      this.$emit('on-close');
    },
    handleClose() {
      this.map.destroy();
      this.tableData = [];
      this.$emit('on-close');
    }
  }
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-table .alarm-row {
    color: #ff5a5b !important;
  }
  .el-dialog__body {
    position: relative;
    padding: 0;
    .dialog-box {
      display: flex;
      .map-container {
        width: 70%;
        height: calc(100vh * 0.75 - 36px);
      }
      .track-table {
        /*position: absolute;*/
        /*top: 12px;*/
        /*left: 12px;*/
        /*bottom: 12px;*/
        height: calc(100vh * 0.75 - 36px);
        width: 30%;
        background-color: #ffffff;
        z-index: 750;
        box-shadow: 0 0 4px #a3a3a3;
        .track-table-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          height: 50px;
          line-height: 50px;
          font-size: 16px;
          cursor: pointer;
          color: #333333;
          .drop-icon {
            transition: 0.3s;
          }
          .drop-icon-expand {
            transition: 0.3s;
            transform: rotate(-180deg);
            -ms-transform: rotate(-180deg); /* Internet Explorer */
            -moz-transform: rotate(-180deg); /* Firefox */
            -webkit-transform: rotate(-180deg); /* Safari 和 Chrome */
            -o-transform: rotate(-180deg); /* Opera */
          }
        }
        .track-car-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          height: 46px;
          background-color: rgba(0, 0, 0, 0.04);
          box-shadow: 0 -1px 0 0 rgba(0, 0, 0, 0.12), 0 1px 0 0 rgba(0, 0, 0, 0.1);
        }
      }
    }
    .track-table-hide {
      height: 50px !important;
      overflow: hidden;
    }
  }
}
</style>
