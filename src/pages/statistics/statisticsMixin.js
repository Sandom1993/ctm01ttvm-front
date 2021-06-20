import { gethistoryGps } from '@/api/vehicleTrack';
import { findAlarmPics } from '@/api/alarm';
import { toTimezoneString } from '@/components/util.js';
import alarmUtils from '@/utils/alarm';

export default {
  filters: {
    formatSpeed(value) {
      return alarmUtils.formatSpeed(value);
    }
  },
  methods: {
    formatDuration(alarm) {
      if (!alarm.beginTime || !alarm.endTIme) {
        return '-';
      }
      const ms = alarm.endTime - alarm.beginTime;
      const time = {
        hour: Math.floor(ms / 3600000) + '',
        minute: (Math.floor(ms / 60000) % 60) + '',
        second: (Math.floor(ms / 1000) % 60) + ''
      };
      return Object.entries(time)
        .map(([key, val]) => `${val.length === 1 ? '0' : ''}${val}`)
        .join(':');
    },
    viweTrack(alarm) {
      const endTime = alarm.endTime ? alarm.endTime : alarm.beginTime;
      const param = {
        vehicleIndexCode: alarm.vehicleIndexCode,
        beginTime: toTimezoneString(alarm.beginTime),
        endTime: toTimezoneString(endTime),
        plateNo: alarm.vehicleLicensePlate
      };
      // 获取gps数据
      gethistoryGps(param).then(json => {
        if (json.code === '0') {
          if (json.data.length > 0) {
            this.gpsTotalResult = json.data;
            this.isShowTab = true;
            this.showTrack();
          } else {
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
        fillColor: '#2080F7', // 十六进制填充颜色，默认为”#ee9900”。
        fillOpacity: 0.1, // {Number} 填充不透明度。默认为0.4。
        strokeColor: '#2080F7', // {String} 十六进制描边颜色r. 默认为 “#ee9900”.
        strokeOpacity: 0.7, // {Number} 描边的不透明度(0-1),默认为1.
        strokeWidth: 2
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
        externalGraphic: require('@/assets/png/map-start.png')
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
        externalGraphic: require('@/assets/png/map-end.png')
      };
      // eslint-disable-next-line
      const endPointVector = new HGIS.Feature.Vector(endPoint, null, endPointStyle);
      this.traceLayer.addFeatures([
        lineFeature,
        startPointVector,
        endPointVector
      ]);
      // eslint-disable-next-line
      this.trackMap.zoomToExtent(new HGIS.Bounds(minX, minY, maxX, maxY));
    },
    viweAlarmPic(alarm) {
      findAlarmPics({
        alarmId: alarm.alarmId,
        alarmTime: toTimezoneString(alarm.beginTime),
        netDomainId: this.$store.state.userInfo.domainId
      }).then(json => {
        if (json.code === '0') {
          if (json.data.length > 0) {
            this.alarmPics = json.data.map(item => item.url);
            this.showAlarmPics = true;
          } else {
            this.$message({
              type: 'warning',
              message: '无相关违规照片'
            });
          }
        }
      });
    }
  }
};
