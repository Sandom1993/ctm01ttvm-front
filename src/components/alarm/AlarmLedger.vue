<template>
  <div class="alarm-detail-wrap" :class="{ 'show-close': showClose }">
    <div v-if="showClose" class="title">
      报警数据
      <el-button icon="h-icon-close" @click="closeLedger"></el-button>
    </div>
    <div class="alarm-type mb-24">
      <div class="alarm-type-info">
        <span class="alarm-name">{{ alarmName }}</span>
        <span class="alarm-time">{{ alarmTime }}</span>
      </div>
      <div class="speed-chart-wrap">
        <div id="speed-chart-container" class="speed-chart"></div>
        <h-vehicle-plate-tag
          color="yellow"
          :value="alarm.vehicleLicensePlate"
          class="vehicle-plate"
        />
      </div>
    </div>
    <div class="driver-info mb-24">
      <img :src="driverImg" class="driver-img" />
      <div class="driver-detail">
        <div class="driver-detail-item">
          <span class="driver-detail-label">当班司机：</span>
          <span class="driver-detail-value">{{ alarm.driverName }}</span>
        </div>
        <div class="driver-detail-item">
          <span class="driver-detail-label">所属单位：</span>
          <span class="driver-detail-value">{{ alarm.orgName }}</span>
        </div>
        <div class="driver-detail-item">
          <span class="driver-detail-label">联系电话：</span>
          <span class="driver-detail-value">{{ alarm.tel }}</span>
        </div>
      </div>
    </div>
    <div id="alarm-map-container" class="alarm-map"></div>
    <div class="alarm-detail-title">报警时间：{{ alarmDateTime }}</div>
    <div class="mb-24">
      <el-button type="primary" @click="playReal">预览</el-button>
      <el-button type="primary" @click="talk">语音对讲</el-button>
      <el-button type="primary" @click="broadcast">消息提醒</el-button>
      <el-button type="primary" @click="playBack">回放</el-button>
    </div>
    <div class="alarm-detail-title">报警处理方式：</div>
    <el-checkbox-group
      v-model="processAction"
      class="mb-24"
      :disabled="disableProcessAction"
    >
      <el-checkbox label="消息提醒"></el-checkbox>
      <el-checkbox label="语音对讲"></el-checkbox>
      <el-checkbox label="远程查看"></el-checkbox>
    </el-checkbox-group>
    <template v-if="!readonly && showSubmitBtns">
      <div class="alarm-detail-title">
        警情处理备注：
        <alarm-remark @select-template="onSelectRemarkTemplate"></alarm-remark>
      </div>
      <el-input
        v-model="alarmRemark"
        type="textarea"
        style="width:100%;"
        :rows="4"
      ></el-input>
      <div class="submit-btn-wrap">
        <template v-if="secondApprove">
          <el-button
            type="primary"
            :loading="loading"
            @click="approve('1', '2')"
          >
            有效
          </el-button>
          <el-button :loading="loading" @click="approve('0', '2')">
            误报
          </el-button>
        </template>
        <template v-else-if="firstApprove">
          <el-button
            type="primary"
            :loading="loading"
            @click="approve('1', '1')"
          >
            有效
          </el-button>
          <el-button :loading="loading" @click="approve('0', '1')">
            误报
          </el-button>
          <el-button :loading="loading" @click="approve('-1', '1')">
            存疑
          </el-button>
        </template>
      </div>
    </template>
    <broadcast-dialog
      ref="BroadcastDialog"
      :vehicle-index-codes="[alarm.vehicleIndexCode]"
      :alarms="[alarm]"
      :vehicles="broadcastVehicles"
      @saveMessageLabelSuccess="onSaveMessageLabelSuccess"
    ></broadcast-dialog>
    <template v-if="approveHistory.length > 0">
      <div class="alarm-detail-title mt-24">警情流转记录：</div>
      <el-steps direction="vertical" disorder class="approve-history-step">
        <el-step v-for="item of approveHistory" :key="item.id">
          <div slot="title">
            <span class="alarm-approve-time">
              {{ getDateTime(item.recordTime) }} {{ item.userId }}
            </span>
          </div>
          <div slot="description" class="alarm-approve-desc">
            <div>
              <template v-if="item.approveStatus === -1">下发消息：</template>
              <template v-else>处理备注：</template>
              {{ item.alarmRemark }}
            </div>
          </div>
        </el-step>
      </el-steps>
    </template>
    <div
      v-if="isShowTrack"
      class="arrow-container"
      :class="{ open: showGpsTable }"
      @click="showGpsTable = !showGpsTable"
    >
      <i v-if="showGpsTable" class="h-icon-angle_right"></i>
      <i v-else class="h-icon-angle_left"></i>
    </div>
    <div v-if="showGpsTable" class="gps-table-container">
      <vehicle-gps-table
        class="body-container"
        :table-data="gpsTotalResult"
        @gpsTableClick="onGpsTableClick"
      />
    </div>
  </div>
</template>

<script>
import echarts from 'echarts';
import {
  addVectorFeature,
  panTo,
  transLonLat,
  getAddress
} from '@/pages/location/monitor/maptools';
import vehicleControlMixin from '@/mixins/vehicleControlMixin';
import basicInfoMixin from '@/mixins/basicInfoMixin.js';
import BroadcastDialog from '@/components/BroadcastDialog.vue';
import { toTimeNormalString, toTimezoneString } from '@/components/util.js';
import {
  saveAlarmLabel,
  getAlarmDealsByEventId,
  saveRiskEventAuditResult
} from '@/api/alarm.js';
import driverDefaultImg from '@/assets/png/defaultDriver.png';
import { queryCameraByVehicleIndexCode } from '@/api/tree.js';
import { startapp } from '@/components/checkTools.js';
import { gethistoryGps } from '@/api/vehicleTrack';
import VehicleGpsTable from '@/components/alarm/VehicleGpsTable';
import { findTimeConfigByType } from '@/api/sysconfig';
import AlarmRemark from '@/components/alarm/AlarmRemark';

export default {
  name: 'AlarmLedger',
  components: {
    BroadcastDialog,
    VehicleGpsTable,
    AlarmRemark
  },
  mixins: [vehicleControlMixin, basicInfoMixin],
  props: {
    alarm: {
      type: Object,
      default: function() {
        return {};
      }
    },
    show: {
      type: Boolean,
      default: false
    },
    showClose: {
      type: Boolean,
      default: true
    },
    readonly: {
      type: Boolean,
      default: false
    },
    isShowTrack: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      processAction: [],
      alarmPics: [],
      alarmRemark: null,
      loading: false,
      approveHistory: [],
      subAlarm: {},
      gpsTotalResult: [],
      showGpsTable: false,
      trackTime: null // 报警轨迹回放时长
    };
  },
  computed: {
    showPic() {
      return this.alarm.picNum > 0;
    },
    driverImg() {
      return this.alarm.driverIndexCode
        ? `/ctm01ttvm-web/resource/findDriverImage.do?driverIndexCode=${this.alarm.driverIndexCode}&width=100&height=100`
        : driverDefaultImg;
    },
    approveLabel() {
      if (!this.alarm.label) {
        return null;
      }
      const approveLabel = this.alarm.label.find(
        item => item.component === process.env.VUE_APP_COMPONENT_ID
      );
      return approveLabel;
    },
    // 审核等级
    approveLevel() {
      if (!this.approveLabel) {
        return null;
      }
      const approveLevel = this.approveLabel.labels.find(
        item => item.key === 'approveLabel'
      );
      if (approveLevel) {
        return approveLevel.value;
      }
      return null;
    },
    // 审核等级
    approveStatus() {
      if (!this.approveLabel) {
        return null;
      }
      const approveStatus = this.approveLabel.labels.find(
        item => item.key === 'approveStatus'
      );
      if (approveStatus) {
        return approveStatus.value;
      }
      return null;
    },
    // 报警 0: 误报 1：有效 -1：存疑
    // 风险事件 2：误报 1：有效 -1：存疑
    valid() {
      if (!this.approveLabel) {
        return true;
      }
      const valid = this.approveLabel.labels.find(item => item.key === 'valid');
      if (!valid) {
        return true;
      }
      return valid.value === '1';
    },
    // 一级审核权限
    hasApproveRight() {
      const menus = this.$store.state.userInfo.menus || [];
      return menus.some(
        menu =>
          menu.menuCode === 'ctm01ttvm_alarmapprove' ||
          menu.menuCode === 'ctm01ttvm_ialarmapprove' ||
          menu.menuCode === 'ctm01ttvm_allalarmapprove' ||
          menu.menuCode === 'ctm01ttvm_talarmapprove'
      );
    },
    // 二级审核权限
    hasReApproveRight() {
      const menus = this.$store.state.userInfo.menus || [];
      return menus.some(
        menu =>
          menu.menuCode === 'ctm01ttvm_alarmreapprove' ||
          menu.menuCode === 'ctm01ttvm_ialarmreapprove' ||
          menu.menuCode === 'ctm01ttvm_allalarmreapprove' ||
          menu.menuCode === 'ctm01ttvm_talarmreapprove'
      );
    },
    // 是否禁用处理方式和驾驶员响应
    disableProcessAction() {
      return (
        this.readonly ||
        (!!this.approveLabel && this.approveStatus !== '-1') ||
        (!this.hasApproveRight && !this.hasReApproveRight)
      );
    },
    firstApprove() {
      if (!this.hasApproveRight) {
        return false;
      }
      return !this.approveStatus || this.approveStatus === '-1'; // 没有审核过
    },
    secondApprove() {
      // 判断是否有复审权限
      if (!this.hasReApproveRight) {
        return false;
      }
      return (
        !this.approveStatus ||
        this.approveStatus === '1' ||
        this.approveStatus === '-1'
      );
    },
    showSubmitBtns() {
      return this.firstApprove || this.secondApprove;
    },
    alarmName() {
      return this.subAlarm.alarmName || this.alarm.eventTypeName;
    },
    alarmTime() {
      return this.getTime(this.subAlarm.alarmTime || this.alarm.beginTime);
    },
    alarmDateTime() {
      return this.getDateTime(this.subAlarm.alarmTime || this.alarm.beginTime);
    },
    broadcastVehicles() {
      return [
        {
          vehicleIndexCode: this.alarm.vehicleIndexCode,
          plateNo: this.alarm.vehicleLicensePlate
        }
      ];
    }
  },
  watch: {
    alarm(alarm) {
      this.processAction = [];
      this.alarmPics = [];
      this.alarmRemark = null;
      this.loading = false;
      this.approveHistory = [];
      this.subAlarm = {};
      if (this.approveLabel) {
        const processAction = this.approveLabel.labels.find(
          item => item.key === 'processAction'
        );
        if (processAction) {
          this.processAction = processAction.value.split(',');
        }
      }
      if (this.approveLabel) {
        this.loadApproveHistory();
      }
      this.$nextTick(() => {
        if (!this.alarmMap) {
          // 初始化报警的地图
          const mapOptions = {
            mapLoaded: () => {
              // this.addVehicle();
              this.queryHistoryGps();
            }
          };
          this.alarmMap = new HGIS.MapEx('alarm-map-container', mapOptions);
          this.vectorLayer = new HGIS.Layer.Vector('VectorLayer');
          this.markerLayer = new HGIS.Layer.Vector('Markers');
          this.pointLayer = new HGIS.Layer.Vector('PointMarkers');
          this.traceLayer = new HGIS.Layer.Vector('TraceLayer');
          this.alarmMap.addLayers([
            this.vectorLayer,
            this.traceLayer,
            this.pointLayer,
            this.markerLayer
          ]);
          this.alarmMap.events.register('zoomend', this.alarmMap, (...args) => {
            const zoom = this.alarmMap.getZoom();
            if (zoom >= 15) {
              this.pointLayer.setVisibility(true);
            } else {
              this.pointLayer.setVisibility(false);
            }
          });
        } else {
          // this.addVehicle();
          this.queryHistoryGps();
        }
        if (!this.speedChart) {
          this.speedChart = echarts.init(
            document.getElementById('speed-chart-container')
          );
          this.speedChart.setOption(this.chartOption, true);
        }
        this.chartOption.series[0].data[0].value = alarm.speed;
        this.speedChart.setOption(this.chartOption, true);
      });
    }
  },
  created() {
    this.init();
    this.getBasicInfo();
  },
  methods: {
    init() {
      this.chartOption = {
        title: {
          text: 'km/h',
          top: 60,
          left: 70,
          textStyle: {
            color: 'rgba(0,0,0,0.40)',
            fontSize: 12,
            fontWeight: 'lighter'
          }
        },
        radius: '100%',
        tooltip: {
          formatter: '{a} : {c} km/h'
        },
        series: [
          {
            name: '速度',
            type: 'gauge',
            radius: 46,
            startAngle: 210,
            endAngle: -30,
            min: 0,
            max: 240,
            data: [{ value: 0 }],
            detail: {
              formatter: '{value}',
              offsetCenter: [0, 0],
              color: 'rgba(0,0,0,0.90)',
              fontFamily: 'Microsoft YaHei',
              fontSize: 18
            },
            axisTick: {
              show: false,
              splitNumber: 2
            },
            splitLine: {
              show: false
            },
            axisLine: {
              lineStyle: {
                width: 2,
                color: [[1, '#018DFF']]
              }
            },
            pointer: {
              length: '80%',
              width: 2
            },
            axisLabel: {
              show: false
            }
          },
          {
            radius: 46,
            type: 'gauge',
            startAngle: 210,
            endAngle: -30,
            min: 0,
            max: 240,
            data: [{ value: 0 }],
            detail: {
              show: false
            },
            axisTick: {
              show: false
            },
            splitLine: {
              length: 12, // 刻度节点线长度
              lineStyle: {
                width: 2,
                color: '#fff'
              } // 刻度节点线
            },
            axisLine: {
              lineStyle: {
                width: 10,
                color: [[1, 'rgba(32,128,252,0.51)']]
              }
            },
            pointer: {
              show: false
            },
            axisLabel: {
              show: false
            }
          }
        ]
      };
    },
    playReal() {
      this.getVehicleCameraChannels(this.alarm.vehicleIndexCode);
      this.addProcessAction('远程查看');
    },
    talk() {
      this.getTalkDevice(this.alarm.vehicleIndexCode).then(deviceIndexCode => {
        if (!deviceIndexCode) {
          this.$message({
            message: `该车辆没有关联支持语音对讲的设备!`,
            type: 'warning'
          });
          return;
        }
        this.talkReal(
          this.alarm.vehicleIndexCode,
          deviceIndexCode,
          this.alarm.vehicleLicensePlate
        );
        this.addProcessAction('语音对讲');
      });
    },
    addProcessAction(action) {
      if (
        !this.disableProcessAction &&
        this.processAction.indexOf(action) === -1
      ) {
        this.processAction.push(action);
      }
    },
    broadcast() {
      this.$refs.BroadcastDialog.openDialog();
      this.addProcessAction('消息提醒');
    },
    // 回放
    playBack() {
      queryCameraByVehicleIndexCode({
        vehicleIndexCode: this.alarm.vehicleIndexCode
      }).then(json => {
        if (json.code === '0' && json.data.length > 0) {
          const arr = json.data.map(item => item.indexCode);
          let camList = `${arr[0]}_${toTimezoneString(this.alarm.beginTime)}`;
          if (this.alarm.endTime) {
            let endTime = this.alarm.endTime;
            if (this.alarm.endTime === this.alarm.beginTime) {
              endTime = this.alarm.beginTime + 60 * 1000;
            }
            camList = `${camList}_${toTimezoneString(endTime)}`;
          }
          const videoURL =
            'btoolpplayerprotocol://ReqType:PlayBack;language:zh_CN;clear:2;WndCount:1;' +
            `NginxIp:${this.ngixinfo.ip};` +
            `NginxPort:${this.ngixinfo.port};` +
            `UserID:${this.userInfo.userId};` +
            `sg:${this.sg};` +
            `protocol:${this.ngixinfo.protocal};` +
            `CamList:${camList};` +
            'appType:vas;gridtrack:1;MiniUI:1;';
          startapp(
            'btoolpplayerprotocol',
            `${this.ngixinfo.protocal}://${this.ngixinfo.ip}:${this.ngixinfo.port}`,
            videoURL
          );
          this.addProcessAction('远程查看');
        } else {
          this.$message.warning('该车辆没有配置监控点 或 监控点没有权限');
        }
      });
    },
    getDateTime(time) {
      if (time === null) {
        return '';
      }
      return typeof time !== 'undefined'
        ? toTimeNormalString(toTimezoneString(time))
        : '';
    },
    getTime(time) {
      return this.getDateTime(time).split(' ')[1];
    },
    approve(valid, approveStatus) {
      const status = [
        {
          key: 'valid',
          value: valid
        },
        {
          key: 'approveStatus',
          value: approveStatus
        }
      ];
      if (this.processAction.length === 0) {
        this.$msgbox({
          title: '提示',
          type: 'warning',
          message: '请选择报警处理方式'
        });
        return;
      }
      if (this.alarmRemark && this.alarmRemark.length > 200) {
        this.$msgbox({
          title: '提示',
          type: 'warning',
          message: '警情处理备注不能超过200个字符'
        });
        return;
      }
      this.handleAlarm(status, valid);
    },
    handleAlarm(status, valid) {
      const labels = [
        {
          key: 'processAction',
          value: this.processAction.join(',')
        },
        {
          key: 'alarmRemark',
          value: this.alarmRemark
        },
        ...status
      ];
      // 处理警情
      this.loading = true;
      if (this.alarm.isRiskEvent) {
        let status = valid;
        if (valid === '0') {
          status = '2'; // 风险事件2表示误报
        }
        saveRiskEventAuditResult({
          // component: process.env.VUE_APP_COMPONENT_ID,
          riskTime: toTimezoneString(this.alarm.beginTime),
          endTime: toTimezoneString(this.alarm.endTime),
          eventId: this.alarm.eventId,
          labels: labels,
          remark: this.alarmRemark,
          status: status,
          vehicleIndexCode: this.alarm.vehicle.vehicleIndexCode
        })
          .then(json => {
            if (json.code === '0') {
              this.$message({
                message: '处理成功',
                type: 'success'
              });
              this.alarmRemark = null;
              // 加载风险事件审核历史
              this.loadApproveHistory();
              this.$emit('update-risk', this.alarm.eventId, labels);
            }
          })
          .finally(() => {
            this.loading = false;
          });
      } else {
        saveAlarmLabel({
          component: process.env.VUE_APP_COMPONENT_ID,
          beginTime: toTimezoneString(this.alarm.beginTime),
          eventId: this.alarm.eventId,
          labels: labels
        })
          .then(json => {
            if (json.code === '0') {
              this.$message({
                message: '处理成功',
                type: 'success'
              });
              this.alarmRemark = null;
              this.loadApproveHistory();
              this.$emit('update-alarm', this.alarm.eventId, labels);
            }
          })
          .finally(() => {
            this.loading = false;
          });
      }
    },
    // 加载报警处理历史
    loadApproveHistory() {
      getAlarmDealsByEventId({
        eventId: this.alarm.eventId
      }).then(json => {
        if (json.code === '0') {
          this.approveHistory = json.data || [];
        }
      });
    },
    // 监听风险事件报警变化
    updateSubAlarm(subAlarm) {
      this.subAlarm = subAlarm;
      this.$nextTick(() => {
        if (this.alarmMap) {
          // this.addVehicle();
          this.queryHistoryGps();
        }
        if (this.speedChart) {
          this.chartOption.series[0].data[0].value =
            subAlarm.averageSpeed / 100000;
          this.speedChart.setOption(this.chartOption, true);
        }
      });
    },
    // 查询车辆历史定位数据
    queryHistoryGps() {
      const defaultTrackTime = 10;
      if (this.trackTime) {
        this.doQueryHistoryGps(this.trackTime);
      } else {
        findTimeConfigByType({
          type: 2
        })
          .then(json => {
            if (json.code === '0') {
              this.trackTime = json.data.threshold;
              this.doQueryHistoryGps(this.trackTime);
            } else {
              this.doQueryHistoryGps(defaultTrackTime);
            }
          })
          .catch(() => {
            this.doQueryHistoryGps(defaultTrackTime);
          });
      }
    },

    doQueryHistoryGps(trackTime) {
      const endTime = new Date(this.alarm.endTime || this.alarm.beginTime);
      const param = {
        vehicleIndexCode: this.alarm.vehicleIndexCode,
        beginTime: toTimezoneString(
          new Date(endTime.getTime() - trackTime * 60 * 1000)
        ),
        endTime: toTimezoneString(
          new Date(endTime.getTime() + trackTime * 60 * 1000)
        )
      };
      gethistoryGps(param).then(json => {
        if (json.code === '0') {
          const beginTime = this.alarm.beginTime;
          const endTime = this.alarm.endTime ? this.alarm.endTime : beginTime;
          const gpsTotalResult = json.data.map(item => {
            return {
              ...item,
              isAlarm: item.time >= beginTime && item.time <= endTime
            };
          });
          this.gpsTotalResult = gpsTotalResult.filter(
            item => item.correctFlag === 0
          );
          this.showTrack(this.gpsTotalResult);
          this.showPoint(this.gpsTotalResult);
        } else {
          this.gpsTotalResult = [];
          this.$message({
            type: 'warning',
            message: '无相关轨迹信息'
          });
        }
      });
    },
    getPointColor(gps) {
      if (gps.retransFlag === 1) {
        return '#ffa940';
      } else if (gps.isAlarm) {
        return '#f5222d';
      }
      return '#2f54eb';
    },
    // TODO 修改定位点样式
    showPoint(gpsTotalResult) {
      this.pointLayer.removeAllFeatures();
      if (!gpsTotalResult || gpsTotalResult.length === 0) {
        return;
      }
      const points = [];
      const pointStyle = {
        // graphicWidth: 200,
        // graphicHeight: 200,
        // graphicZIndex: 100000,
        pointRadius: 8,
        stroke: false,
        strokeColor: '#fff'
        // externalGraphic: require('@/assets/png/vehicle-alarm.png')
      };
      gpsTotalResult.forEach(item => {
        const point = new HGIS.Geometry.Point(
          item.longitude / 360000,
          item.latitude / 360000
        ).transform(
          new HGIS.Projection('EPSG:4326'),
          new HGIS.Projection('EPSG:900913')
        );
        const pointVector = new HGIS.Feature.Vector(point, null, {
          ...pointStyle,
          fillColor: this.getPointColor(item)
        });
        points.push(pointVector);
      });
      this.pointLayer.addFeatures(points);
    },
    showTrack(gpsTotalResult) {
      this.traceLayer.removeAllFeatures();
      this.markerLayer.removeAllFeatures();
      if (!gpsTotalResult || gpsTotalResult.length === 0) {
        return;
      }
      const pointList = gpsTotalResult.map(item => {
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
        fillColor: '#FF002B', // 十六进制填充颜色，默认为”#ee9900”。
        fillOpacity: 0.1, // {Number} 填充不透明度。默认为0.4。
        strokeColor: '#FF002B', // {String} 十六进制描边颜色r. 默认为 “#ee9900”.
        strokeOpacity: 0.7, // {Number} 描边的不透明度(0-1),默认为1.
        strokeWidth: 4
      };
      // eslint-disable-next-line
      let lineFeature = new HGIS.Feature.Vector(new HGIS.Geometry.LineString(pointList), {}, lineStyle);
      // this.traceLayer.addFeatures([lineFeature]);
      this.traceLayer.addFeatures([
        lineFeature
        // startPointVector,
        // endPointVector
      ]);
      const pointStyle = {
        graphicWidth: 36,
        graphicHeight: 36,
        graphicZIndex: 10000
      };
      const lastAlarmGps = gpsTotalResult[gpsTotalResult.length - 1];
      const lastAlarmPoint = new HGIS.Geometry.Point(
        lastAlarmGps.longitude / 360000,
        lastAlarmGps.latitude / 360000
      ).transform(
        new HGIS.Projection('EPSG:4326'),
        new HGIS.Projection('EPSG:900913')
      );
      const pointVector = new HGIS.Feature.Vector(lastAlarmPoint, null, {
        ...pointStyle,
        rotation: parseInt(lastAlarmGps.direction / 100, 10),
        externalGraphic: lastAlarmGps.isAlarm
          ? require('@/assets/png/vehicle-alarm.png')
          : require('@/assets/png/map-vehicle.png')
      });
      this.markerLayer.addFeatures(pointVector);
      // if (al)
      // eslint-disable-next-line
      this.alarmMap.zoomToExtent(new HGIS.Bounds(minX, minY, maxX, maxY));
    },
    // 添加车辆信息到地图上
    addVehicle() {
      this.vectorLayer.removeAllFeatures();
      if (this.popup) {
        this.alarmMap.removePopup(this.popup);
      }
      const longitude = this.subAlarm.longitude || this.alarm.longitude;
      const latitude = this.subAlarm.latitude || this.alarm.latitude;
      const direction = this.subAlarm.direction || this.alarm.direction;
      if (longitude && latitude) {
        const gps = {
          longitude: longitude,
          latitude: latitude,
          direction: direction
        };
        addVectorFeature(gps, 2, this.vectorLayer);
        panTo(this.alarmMap, gps);

        const lonlat = transLonLat(
          new HGIS.LonLat(gps.longitude / 360000, gps.latitude / 360000)
        );
        // 设置弹框的大小
        const popSize = new HGIS.Size(320, 72);
        // 弹框内容
        const contentHTML = `
          <div class="alarm-popup-wrap">
            <div class="alarm-popup-icon"><i class="h-icon-alarm"></i></div>
            <div class="alarm-popup-info">
              <div class="alarm-popup-name">${this.alarmName}</div>
              <div class="alarm-popup-location" id="alarm-location"></div>
            </div>
          </div>`;
        // 声明普通弹框
        this.popup = new HGIS.Popup(
          'alarm-map-popup',
          lonlat,
          popSize,
          contentHTML,
          true
        );
        // 弹框添加到地图上
        this.alarmMap.addPopup(this.popup);
        const lonlat1 = [gps.longitude / 360000, gps.latitude / 360000];
        getAddress(lonlat1, 'alarm-location');
      }
    },
    closeLedger() {
      this.$emit('update:show', false);
    },
    // 表格点击事件
    onGpsTableClick(row) {
      this.markerLayer.removeAllFeatures();
      const point = new HGIS.Geometry.Point(
        row.longitude / 360000,
        row.latitude / 360000
      ).transform(
        new HGIS.Projection('EPSG:4326'),
        new HGIS.Projection('EPSG:900913')
      );
      const pointStyle = {
        graphicWidth: 36,
        graphicHeight: 36,
        graphicZIndex: 10000,
        externalGraphic: row.isAlarm
          ? require('@/assets/png/vehicle-alarm.png')
          : require('@/assets/png/map-vehicle.png')
      };
      const pointVector = new HGIS.Feature.Vector(point, null, {
        ...pointStyle,
        rotation: parseInt(row.direction / 100, 10)
      });
      this.markerLayer.addFeatures([pointVector]);
      this.setMapCenter(row);
    },
    setMapCenter(gps) {
      const centerP = new HGIS.LonLat(
        gps.longitude / 360000,
        gps.latitude / 360000
      ).transform(
        new HGIS.Projection('EPSG:4326'),
        new HGIS.Projection('EPSG:900913')
      );
      this.alarmMap.setCenter(centerP, 15);
    },
    onSelectRemarkTemplate(value) {
      this.alarmRemark = value;
    },
    onSaveMessageLabelSuccess(payload) {
      this.loadApproveHistory();
      this.$emit('update-message-label', payload);
    }
  }
};
</script>

<style src="@/components/alarm/alarmLedger.scss" lang="scss" scoped></style>
<style>
#alarm-map-popup {
  transform: translate(-50%, -96px);
  box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.2), 0 16px 32px 0 rgba(0, 0, 0, 0.12);
}

.alarm-popup-wrap {
  box-sizing: border-box;
  height: 100%;
  display: flex;
  padding: 15px 0 0 20px;
}

.alarm-popup-icon {
  font-size: 20px;
  color: #f00;
  margin-right: 4px;
}

.alarm-popup-name {
  font-size: 16px;
  color: rgba(0, 0, 0, 0.9);
}

.alarm-popup-location {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 248px;
}
</style>
