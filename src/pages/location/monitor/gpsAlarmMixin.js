import { toTimezoneString } from '../../../components/util.js';
import {
  vectorLayerRemoveAll,
  getCluster,
  addMapPoint,
  setMapCenter
} from './map.js';
import {
  getVehicleInfo,
  refreshVehicleAlarm,
  refreshVehicleGPS,
  refreshVehicleInfoMap
} from './vehicleInfo.js';
import alarmUtils from '@/utils/alarm';

export const ExpireTime = 1000 * 60 * 6; // GPS过期时间 6min
export const LowSpeedLimit = 500000; // 判定为低速的速度阈值 5km/h
export const AlarmContinue = 1000 * 30; // 报警状态的持续时间 30s

export default {
  data() {
    return {
      timer: null, // 查询设备是否离线的定时器
      isListeningGPS: false, // 是否正在侦听GPS
      isListeningAlarm: false, // 是否正在侦听报警
      wsGPS: null,
      wsAlarm: null,
      tempGPS: []
    };
  },
  /** 依赖外部的变量:
   * addr
   * userInfo
   * token
   * isHideResourceBar
   * isTracking
   * gpsdataArr
   * vectorLayer
   * isCluster
   *
   * 依赖外部的方法:
   * switchDevice
   * addMapPoint
   * executeCluster
   * transformAlarm
   */

  methods: {
    // 在线和低速车辆集合发生变化时,居中正在追踪的车辆
    handleChange() {},
    // 获取某个车辆的状态
    getVehicleStatus(id) {
      let status = 0; // status -0:离线 -1:在线 -2:告警 -3:低速 -4无定位
      let text = '离线';
      const info = getVehicleInfo(id);
      if (info) {
        status = info.status;
        switch (status) {
          case 1:
            text = '正常';
            break;
          case 2:
            text = '告警';
            break;
          case 3:
            text = '低速';
            break;
          default:
            text = '离线';
            break;
        }
      }
      return { status, text };
    },
    // 获取某个车辆的最后定位时间
      getVehicleLastTime(id, defaultTime) {
          let time = toTimezoneString(defaultTime);
          const info = getVehicleInfo(id);
          if (info) {
            if (info.gps && info.gps.time) {
              time = toTimezoneString(new Date(info.gps.time));
            }
            if (info.alarm && info.alarm.time) {
              time = toTimezoneString(new Date(info.alarm.time));
            }
          }
      return time;
    },
      getVehicleUpdateTime(id, defaultTime) {
          let time = toTimezoneString(defaultTime);
          const info = getVehicleInfo(id);
          if (info) {
            if (info.gps && info.gps.serverTime) {
              time = toTimezoneString(new Date(info.gps.serverTime));
            }
          }
      return time;
    },
    // 获取某个车辆的速度
    getVehicleSpeed(id, defaultSpeed) {
      let speed = defaultSpeed;
      const info = getVehicleInfo(id);
      if (info) {
        if (info.gps && info.gps.speed) {
          speed = alarmUtils.formatSpeed(info.gps.speed);
        }
      }
      return speed;
    },
    // 获取某个车辆的最近报警
    getVehicleAlarm(id) {
      let alarmName = '';
      const info = getVehicleInfo(id);
      if (info) {
        if (info.alarm && info.alarm.eventName) {
          alarmName = info.alarm.eventName;
        }
      }
      return alarmName;
    },
    // 定时查询设备的最新GPS,超过十分钟判定为离线状态
    tickTock() {
      this.timer = setInterval(this.refresh, 1000 * 60 * 5);
    },
    // 刷新车辆的状态
    refresh() {
      refreshVehicleInfoMap();
      vectorLayerRemoveAll(false, true, false);
      if (!this.isCluster) {
        addMapPoint();
      } else {
        // 聚合
        getCluster();
      }
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
        // console.log('GPS连接成功');
      });
      this.wsGPS.onclose = () => {
        this.isListeningGPS = false;
        // console.log('关闭');
      };
      this.wsGPS.addEventListener('error', event => {
        this.isListeningGPS = false;
        // console.log(`error!!!!${event}`);
      });
      this.wsGPS.addEventListener('message', event => {
        // 收到服务器数据后的回调函数。
        const receivedData = JSON.parse(event.data);
        // console.log(receivedData);
        if (receivedData.event === 'gps') {
          // 判断更新车辆状态(判断树上是否有勾选该节点---处理反勾选节点同时推动GPS的情况)
          if (
            this.selectedNodes.find(
              item => item.id === receivedData.data.vehicleIndexCode
            )
          ) {
            this.judgeDevieStatus(receivedData.data);
          }
        }
      });
    },
    // 当勾选的节点超过500个,累计更新点位100次时,更新一次点位
    improvePerformance(gps) {
      if (this.selectedNodes.length > 500) {
        if (this.tempGPS.length < 100) {
          this.tempGPS.push(gps);
          return true;
        }
      }
      return false;
    },
    // websoket上报GPS时修改设备状态
    judgeDevieStatus(gpsData) {
      refreshVehicleGPS([gpsData]);
      if (this.isTracking === gpsData.vehicleIndexCode) {
        setMapCenter(gpsData);
      }
      // fangjialong 不进行更新点位存量更新
      // if (this.improvePerformance(gpsData)) {
      //   return;
      // }
      // const ids =
      //   this.tempGPS.length > 0
      //     ? this.tempGPS.map(item => item.vehicleIndexCode)
      //     : [gpsData.vehicleIndexCode];
      // fnagjialong 不用tempGPS
      // const arr = this.tempGPS.length > 0 ? this.tempGPS : [gpsData];
      const arr = [gpsData]
      if (!this.isCluster) {
        // removeVectors(ids, false, false);
        addMapPoint(arr, this);
      } else {
        // 聚合
        vectorLayerRemoveAll(false, true, false);
        getCluster();
      }
      this.tempGPS = [];
      // this.$refs.mapTable.createTableData();
      this.createTableData();
    },
    // websoket新增监听GPS的设备
    addGPS(str) {
      if (!this.isListeningGPS) {
        return;
      }
      const arr = str.split(',');
      const arr1 = arr.map(item => `"${item}"`);
      this.wsGPS.send(
        `{"operation":"add","vehicleIndexCodes":[${arr1.join(',')}],"token":"${
          this.token.token
        }"}`
      );
    },
    // 通过websoket减少监听GPS的设备
    removeGPS(str) {
      if (!this.isListeningGPS) {
        return;
      }
      const arr = str.split(',');
      const arr1 = arr.map(item => `"${item}"`);
      this.wsGPS.send(
        `{"operation":"remove","vehicleIndexCodes":[${arr1.join(
          ','
        )}],"token":"${this.token.token}"}`
      );
    },
    // 清除监听GPS的车辆
    clearGPS() {
      if (this.isListeningGPS) {
        this.wsGPS.send('{"operation":"clear"}');
      }
    },
    // 关闭GPS的websoket
    closeGPSWebsoket() {
      if (this.isListeningGPS) {
        // 页面离开之前clear websocket监听的设备GPS
        this.wsGPS.send(`{"operation":"clear","token":"${this.token.token}"}`);
        this.wsGPS.close();
      }
    },

    // 初始化报警的websoket
    initAlarmWebsocket() {
      const user = this.userInfo.userId;
      const { token } = this.token;
      if (!this.addr) {
        this.$message({
          type: 'error',
          message: this.$t('GetCMSIpFailure')
        });
        return;
      }
      this.wsAlarm = new WebSocket(`${this.addr}/mps/websocket`); // this.wsAlarm = new WebSocket('wss://10.41.6.111/mps/websocket'); //
      this.wsAlarm.addEventListener('open', () => {
        this.isListeningAlarm = true;
        // console.log('alarm连接成功');
        this.wsAlarm.send(
          `{"Type":1,"Seq":231,"Version":1,"Client":{"agent":"bs","user":"${user}","way":"websocket","componentSet":["balarmclient"]},"Security":{"token":"${token}"}}`
        ); // '+window.token+'  "SElLIEdNZDRHajJiWEVDWE9PN1g6NDZrdTQybXFiTE9maGtJL3VUdERmUWU1Q1hLenNjSkZQc0hQTjRsdWpiST0="
      });
      this.wsAlarm.onclose = () => {
        this.isListeningAlarm = false;
        // console.log('关闭');
      };
      this.wsAlarm.addEventListener('error', event => {
        this.isListeningAlarm = false;
        // console.log(`error!!!!${event}`);
      });
      this.wsAlarm.addEventListener('message', event => {
        // 收到服务器数据后的回调函数。
        const receivedData = JSON.parse(event.data);
        // console.log(receivedData);
        if (receivedData.Message) {
          const alarmMessage = receivedData.Message.EventData.ext;
          this.handleAlarmMessage(alarmMessage);
        }
        if (receivedData.Seq > 0) {
          this.wsAlarm.send(
            `{"Code":200,"Desciebe":"OK","Type":3,"Seq":${receivedData.Seq},"Version":1}`
          );
        }
      });
    },
    // websoket上报alarm时修改设备状态
    handleAlarmMessage(alarmMessage) {
      // 根据报警信息里面的srcParentIndex(设备编号)字段来更新设备状态信息
      const attribute = JSON.parse(alarmMessage.attribute);
      const deviceIndexCode = attribute.find(
        item => item.name === 'deviceIndexCode'
      ).value;
      // let deviceIndexCode = '';
      // if (alarmMessage.deviceIndexcode) {
      //   deviceIndexCode = alarmMessage.deviceIndexcode;
      // }
      // if (alarmMessage.eventObjectiveIndexCode) {
      //   deviceIndexCode = alarmMessage.eventObjectiveIndexCode;
      // }
      // if (alarmMessage.transInfo && JSON.parse(alarmMessage.transInfo) && (JSON.parse(alarmMessage.transInfo)).params.events[0].srcParentIndex) {
      //   deviceIndexCode = (JSON.parse(alarmMessage.transInfo)).params.events[0].srcParentIndex;
      // }
      // if (alarmMessage.transInfo && JSON.parse(alarmMessage.transInfo) && (JSON.parse(alarmMessage.transInfo)).params.events[0].srcIndex) {
      //   if (alarmMessage.eventType !== '131330') { // 部标的视频遮挡报警
      //     deviceIndexCode = (JSON.parse(alarmMessage.transInfo)).params.events[0].srcIndex;
      //   }
      // }
      const device = this.selectedNodes.filter(
        item => item.deviceIndexCode === deviceIndexCode
      );
      if (device.length > 0) {
        const info = getVehicleInfo(device[0].id);
        const alarmInfo = {
          vehicleIndexCode: device[0].id,
          vehicleLicensePlate: device[0].name,
          orgName: device[0].name,
          eventType: alarmMessage.eventType,
          eventName: this.transformAlarm(alarmMessage.eventType),
          time: alarmMessage.happenedTime,
          receivedTime: new Date()
        };
        refreshVehicleAlarm(device[0].id, alarmInfo);
        if (!this.isCluster) {
          // 不聚合的时候刷新报警点
          // removeVectors([device[0].id], false);
          if (info && info.gps) {
            addMapPoint([info.gps], this);
          }
        }
        this.$refs.mapTable.createTableData();
      }
    },
    // 关闭报警的websoket
    closeAlarmWebsoket() {
      if (this.isListeningAlarm) {
        this.wsAlarm.close();
      }
    }
  }
};
