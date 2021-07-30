<template>
  <div class="ledger-wrap">
    <div class="alarm-detail-wrap" :class="{ 'show-close': showClose }">
      <div v-if="showClose" class="title">
        报警数据
        <el-button icon="h-icon-close" @click="closeLedger"></el-button>
      </div>
      <div class="alarm-type mb-24">
        <div class="alarm-type-info">
          <span v-if="currentVehicle.vehicleLicensePlate" class="alarm-name">
            乘客超员
          </span>
        </div>
        <div class="speed-chart-wrap">
          <div id="speed-chart-container" class="speed-chart"></div>
          <h-vehicle-plate-tag
            v-if="currentVehicle.vehicleLicensePlate"
            color="yellow"
            :value="currentVehicle.vehicleLicensePlate"
            class="vehicle-plate"
          />
        </div>
      </div>
      <div class="driver-info mb-24">
        <img :src="driverImg" class="driver-img" />
        <div class="driver-detail">
          <div class="driver-detail-item">
            <span class="driver-detail-label">当班司机：</span>
            <span class="driver-detail-value">{{ driverDTO.name }}</span>
          </div>
          <div class="driver-detail-item">
            <span class="driver-detail-label">所属单位：</span>
            <span class="driver-detail-value">{{ alarm.orgName }}</span>
          </div>
          <div class="driver-detail-item">
            <span class="driver-detail-label">联系电话：</span>
            <span class="driver-detail-value">{{ driverDTO.tel }}</span>
          </div>
        </div>
      </div>
      <div id="alarm-map-container" class="alarm-map"></div>
      <div class="alarm-detail-title">最新定位时间：{{ locationTime }}</div>
      <div class="mb-24">
        <el-button type="primary" :disabled="!vehicleIndexCode" @click="talk">
          语音对讲
        </el-button>
        <el-button
          type="primary"
          :disabled="!vehicleIndexCode"
          @click="broadcast"
        >
          消息提醒
        </el-button>
        <el-button
          type="primary"
          :disabled="!vehicleIndexCode"
          @click="playBack"
        >
          回放
        </el-button>
      </div>
      <template v-if="false">
        <div class="alarm-detail-title">报警处理方式：</div>
        <el-checkbox-group v-model="processAction" class="mb-24">
          <el-checkbox label="电话通知"></el-checkbox>
          <el-checkbox label="消息提醒"></el-checkbox>
          <el-checkbox label="语音对讲"></el-checkbox>
          <el-checkbox label="远程查看"></el-checkbox>
        </el-checkbox-group>
        <div class="alarm-detail-title">驾驶员响应：</div>
        <el-radio-group v-model="driverResponse" class="mb-24">
          <el-radio label="接收提醒"></el-radio>
          <el-radio label="无视提醒"></el-radio>
          <el-radio label="反对提醒"></el-radio>
        </el-radio-group>
        <el-form
          v-if="false"
          ref="form"
          label-position="top"
          label-width="90px"
          inline
        >
          <el-form-item label="报警级别：" content-width="120px">
            <el-select v-model="form.alarmLevel" placeholder="请选择">
              <el-option
                v-for="item in alarmLevelOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="报警名称：" content-width="200px">
            <el-input v-model="form.alarmName" readonly></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template>
        <div class="alarm-detail-title">
          警情处理备注：
          <alarm-remark
            @select-template="onSelectRemarkTemplate"
          ></alarm-remark>
        </div>
        <el-input
          v-model="alarmRemark"
          type="textarea"
          style="width:100%;"
          :rows="4"
        ></el-input>
        <div class="submit-btn-wrap">
          <el-button
            type="primary"
            :loading="loading"
            :disabled="!vehicleIndexCode"
            @click="saveAlarm"
          >
            确认提交
          </el-button>
        </div>
      </template>
      <broadcast-dialog
        ref="BroadcastDialog"
        :vehicle-index-codes="[vehicleIndexCode]"
      ></broadcast-dialog>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts';
import { addVectorFeature } from '@/pages/location/monitor/maptools';
import vehicleControlMixin from '@/mixins/vehicleControlMixin';
import basicInfoMixin from '@/mixins/basicInfoMixin.js';
import BroadcastDialog from '@/components/BroadcastDialog.vue';
import { toTimeNormalString, toTimezoneString } from '@/components/util.js';
import { sendAlarm } from '@/api/alarm.js';
import driverDefaultImg from '@/assets/png/defaultDriver.png';
import { queryCameraByVehicleIndexCode } from '@/api/tree.js';
import { startapp } from '@/components/checkTools.js';
import { getlastGps } from '@/api/location';
import AlarmRemark from '@/components/alarm/AlarmRemark';
import alarmUtils from '@/utils/alarm';

export default {
  name: 'AlarmLedger',
  components: {
    BroadcastDialog,
    AlarmRemark
  },
  mixins: [vehicleControlMixin, basicInfoMixin],
  props: {
    show: {
      type: Boolean,
      default: false
    },
    showClose: {
      type: Boolean,
      default: false
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
      alarm: {},
      vehicleGps: {},
      form: {
        alarmName: '乘客超员',
        alarmLevel: ''
      },
      driverDTO: {},
      processAction: [],
      alarmPics: [],
      driverResponse: null,
      alarmRemark: null,
      loading: false,
      approveHistory: [],
      subAlarm: {},
      gpsTotalResult: [],
      showGpsTable: false,
      trackTime: null, // 报警轨迹回放时长,
      vehicleIndexCode: null,
      currentVehicle: {},
      vehicleCameras: {},
      alarmLevelOptions: [
        {
          label: '严重',
          value: 'h'
        },
        {
          label: '较重',
          value: 'm'
        },
        {
          label: '一般',
          value: 'l'
        }
      ]
    };
  },
  computed: {
    driverImg() {
      return this.alarm.driverIndexCode
        ? `/ctm01ttvm-web/resource/findDriverImage.do?driverIndexCode=${this.alarm.driverIndexCode}&width=100&height=100`
        : driverDefaultImg;
    },
    locationTime() {
      return this.getDateTime(this.vehicleGps.time);
    }
  },
  watch: {
    alarm() {
      this.setSpeedChar();
    },
    currentVehicle() {
      this.refresh(this.currentVehicle.vehicleIndexCode);
    }
  },
  created() {
    this.init();
    this.getBasicInfo({
      initGPSWebsocket: this.initGPSWebsocket
    });
    this.initQt();
  },
  mounted() {
    this.initMap();
    this.initChart();
  },
  methods: {
    // 给客户端提供可调用的方法
    initQt() {
      /**
       * 监控点开始播放
       * param str 为json字符串
       * str: {
       *  "vehicleIndexCode": "XXXXXXXXXXXXXXX",
       *  "vehicleLicensePlate": "浙A88888",
       *  "cameraIndexCode": "XXXXXXXXXXXXXXX"
       * }
       */
      window.StartPlay = str => {
        const data = JSON.parse(decodeURIComponent(str));
        this.currentVehicle = data;
        if (
          this.vehicleCameras[data.vehicleIndexCode] &&
          this.vehicleCameras[data.vehicleIndexCode].length > 0
        ) {
          this.vehicleCameras[data.vehicleIndexCode].push(data.cameraIndexCode);
        } else {
          this.vehicleCameras[data.vehicleIndexCode] = [data.cameraIndexCode];
        }
      };
      /**
       * 监控点停止播放
       * param str 为json字符串
       * str: {
       *  "vehicleIndexCode": "XXXXXXXXXXXXXXX",
       *  "vehicleLicensePlate": "浙A88888",
       *  "cameraIndexCode": "XXXXXXXXXXXXXXX"
       * }
       */
      window.StopPlay = str => {
        const data = JSON.parse(decodeURIComponent(str));
        if (
          this.vehicleCameras[data.vehicleIndexCode] &&
          this.vehicleCameras[data.vehicleIndexCode].length > 0
        ) {
          this.vehicleCameras[data.vehicleIndexCode] = this.vehicleCameras[
            data.vehicleIndexCode
          ].filter(camera => camera !== data.cameraIndexCode);
          // 该车辆当前没有监控点在预览
          if (this.vehicleCameras[data.vehicleIndexCode].length === 0) {
            this.currentVehicle = {};
            this.removeGPS(data.vehicleIndexCode);
            this.clearMap();
          }
        }
      };
      /**
       *  更新播放信息,定时调用
       * param str 为json字符串
       * str: {
       *  "selectStatus": 1,  //1表示窗口被选中
       *  "vehicleIndexCode": "XXXXXXXXXXXXXXX",
       *  "vehicleLicensePlate": "浙A88888",
       *  "cameraIndexCode": "XXXXXXXXXXXXXXX"
       * }
       */
      window.PostPlayingParams = str => {
        const data = JSON.parse(decodeURIComponent(str));
        if (data.selectStatus === 1) {
          this.currentVehicle = data;
        }
      };
    },
    initMap() {
      this.alarmMap = new HGIS.MapEx('alarm-map-container');
      this.vectorLayer = new HGIS.Layer.Vector('VectorLayer');
      this.markerLayer = new HGIS.Layer.Vector('Markers');
      this.traceLayer = new HGIS.Layer.Vector('TraceLayer');
      this.alarmMap.addLayers([
        this.vectorLayer,
        this.markerLayer,
        this.traceLayer
      ]);
    },
    initChart() {
      this.speedChart = echarts.init(
        document.getElementById('speed-chart-container')
      );
      this.speedChart.setOption(this.chartOption, true);
    },
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
    talk() {
      this.getTalkDevice(this.vehicleIndexCode).then(deviceIndexCode => {
        if (!deviceIndexCode) {
          this.$message({
            message: `该车辆没有关联支持语音对讲的设备!`,
            type: 'warning'
          });
          return;
        }
        this.talkReal(
          this.vehicleIndexCode,
          deviceIndexCode,
          this.currentVehicle.vehicleLicensePlate
        );
      });
    },
    broadcast() {
      this.$refs.BroadcastDialog.openDialog();
    },
    // 回放
    playBack() {
      queryCameraByVehicleIndexCode({
        vehicleIndexCode: this.vehicleIndexCode
      }).then(json => {
        if (json.code === '0' && json.data.length > 0) {
          const arr = json.data.map(item => item.indexCode);
          let camList = `${arr[0]}_${toTimezoneString(
            this.alarm.beginTime || this.alarm.time
          )}`;
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
    saveAlarm() {
      if (!this.vehicleGps.deviceIndexCode) {
        this.$msgbox({
          title: '提示',
          type: 'warning',
          message: '没有获取到定位信息，不能新增报警'
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
      if (!this.vehicleIndexCode) {
        this.$msgbox({
          title: '提示',
          type: 'warning',
          message: '请选择车辆'
        });
        return;
      }
      this.loading = true;
      sendAlarm({
        alarmName: this.form.alarmName,
        cameraIndexCode: this.currentVehicle.cameraIndexCode,
        deviceIndexCode: this.vehicleGps.deviceIndexCode,
        direction: this.vehicleGps.direction,
        driverNo: this.vehicleGps.driverNo,
        height: this.vehicleGps.height,
        ioIndexCode: null,
        latitude: this.vehicleGps.latitude,
        longitude: this.vehicleGps.longitude,
        speed: this.vehicleGps.speed,
        vehicleIndexCode: this.vehicleIndexCode,
        alarmInfo: {
          remark: this.alarmRemark
        }
      })
        .then(json => {
          if (json.code === '0') {
            this.$message.success('处理成功');
            this.resetForm();
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },

    closeLedger() {
      this.$emit('update:show', false);
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
    // 初始化GPS的websoket
    initGPSWebsocket() {
      if (!this.addr) {
        this.$message.error(this.$t('GetCMSIpFailure'));
        return;
      }
      this.wsGPS = new WebSocket(`${this.addr}/msa-acs/websocket`); // this.wsGPS = new WebSocket('ws://10.16.83.15:8100/msa-acs/websocket'); //
      this.wsGPS.addEventListener('open', () => {
        this.isListeningGPS = true;
      });
      this.wsGPS.onclose = () => {
        this.isListeningGPS = false;
      };
      this.wsGPS.addEventListener('error', event => {
        this.isListeningGPS = false;
      });
      this.wsGPS.addEventListener('message', event => {
        // 收到服务器数据后的回调函数
        const receivedData = JSON.parse(event.data);
        if (receivedData.event === 'gps') {
          // 更新地图上车辆位置
          this.refreshVehicleInfo(receivedData.data);
        }
      });
    },
    // 客户端传入车辆编号,刷新车辆信息
    refresh(vehicleIndexCode) {
      if (this.vehicleIndexCode !== vehicleIndexCode) {
        this.reset();
        if (vehicleIndexCode) {
          this.queryVehicleInfo(vehicleIndexCode);
          this.addGPS(vehicleIndexCode);
        }
        if (this.vehicleIndexCode) {
          this.removeGPS(this.vehicleIndexCode);
        }
      }
      this.vehicleIndexCode = vehicleIndexCode;
    },
    reset() {
      this.clearMap();
      this.resetForm();
      this.loading = false;
      this.approveHistory = [];
      this.alarm = {};
      this.vehicleGps = {};
      this.driverDTO = {};
    },
    resetForm() {
      this.processAction = [];
      this.driverResponse = null;
      this.alarmRemark = null;
    },
    clearMap() {
      this.vectorLayer.removeAllFeatures();
    },
    addGPS(vehicleIndexCode) {
      if (!this.isListeningGPS) {
        return;
      }
      this.wsGPS.send(
        `{"operation":"add","vehicleIndexCodes":["${vehicleIndexCode}"],"token":"${this.token.token}"}`
      );
    },
    removeGPS(vehicleIndexCode) {
      if (!this.isListeningGPS) {
        return;
      }
      this.wsGPS.send(
        `{"operation":"remove","vehicleIndexCodes":["${vehicleIndexCode}"],"token":"${this.token.token}"}`
      );
    },
    // 更新车辆信息
    refreshVehicleInfo(gps) {
      if (gps.vehicleIndexCode === this.vehicleIndexCode) {
        this.vehicleGps = gps;
        this.vectorLayer.removeAllFeatures();
        addVectorFeature(gps, 1, this.vectorLayer);
        this.setMapCenter(gps);
        this.alarm = {
          ...this.alarm,
          speed: alarmUtils.formatSpeed(gps.speed)
        };
      }
    },
    setSpeedChar() {
      this.chartOption.series[0].data[0].value = this.alarm.speed;
      this.speedChart.setOption(this.chartOption, true);
    },
    // 查询车辆最新定位信息
    queryVehicleInfo(vehicleIndexCode) {
      getlastGps([vehicleIndexCode])
        .then(json => {
          if (json.code === '0') {
            const data = json.data[0];
            // 添加车辆到地图上
            addVectorFeature(data, 1, this.vectorLayer);
            // 设置地图中心点
            this.setMapCenter(data);
            this.alarm = {
              vehicleLicensePlate: data.vehicleLicensePlate,
              orgName: data.orgName,
              speed: alarmUtils.formatSpeed(data.speed)
            };
            this.vehicleGps = data;
            this.driverDTO = data.driverDTO || {};
          }
        })
        .catch(() => {
          this.$message.warning('未找到车辆定位信息');
        });
    },
    onSelectRemarkTemplate(value) {
      this.alarmRemark = value;
    }
  }
};
</script>

<style src="@/components/alarm/alarmLedger.scss" lang="scss" scoped></style>
<style lang="scss" scoped>
.ledger-wrap {
  width: 400px;
  height: 100%;
  position: relative;
}
</style>
