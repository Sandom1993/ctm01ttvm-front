/* eslint-disable */
import { ExpireTime, LowSpeedLimit, AlarmContinue } from './gpsAlarmMixin.js';

let vehicleInfoMap = {}; // {} key:vehicleIndexCode,gps,alarm,status,vector

export function getVehicleInfoMap() {
  return vehicleInfoMap;
}

export function getVehicleInfo(id) {
  const info =
    vehicleInfoMap.hasOwnProperty(id) && vehicleInfoMap[id]
      ? vehicleInfoMap[id]
      : null;
  return info;
}

export function getStatus(id) {
  // -0:离线 -1:在线 -2:告警 -3:低速 4-无定位
  const info = getVehicleInfo(id);
  if (info) {
    return info.status;
  }
  return false;
}

// 修改车辆状态,根据time进行判断
export function judgeStatus(gps) {
  // -0:离线 -1:在线 -2:告警 -3:低速 4-无定位
  if (gps.serverTime === null) {
    return 4;
  }
  if (new Date().getTime() - new Date(gps.serverTime).getTime() >= ExpireTime) {
    // 离线
    return 0;
  }
  if (gps.speed < LowSpeedLimit) {
    return 3;
  }
  return 1;
}

export function resetVehicleInfoMap() {
  vehicleInfoMap = {};
}

function initialSummarize() {
  offlineNum = 0;
  normalNum = 0;
  alarmNum = 0;
  lowspeedNum = 0;
}

export function getSummarize() {
  initialSummarize();
  const ids = Object.keys(vehicleInfoMap);
  ids.forEach(item => {
    switch (item.status) {
      case 4:
      case 0:
        offlineNum += 1;
        break;
      case 1:
        normalNum += 1;
        break;
      case 2:
        alarmNum += 1;
        break;
      case 3:
        lowspeedNum += 1;
        break;
      default:
        break;
    }
  });
}

// 更新GPS
export function refreshVehicleGPS(gpsArr) {
  gpsArr.forEach(item => {
    if (getVehicleInfo(item.vehicleIndexCode)) {
      // 根据时间判断是否是新数据
      // 原始数据中的time  vehicleInfoMap[item.vehicleIndexCode].gps.time
      // console.log(vehicleInfoMap[item.vehicleIndexCode].gps.time, item.time)
      if (vehicleInfoMap[item.vehicleIndexCode].gps.time === item.time) {
        // console.log(`${item.vehicleIndexCode}--------被过滤`)
        return;
      }
      // 区分是否刚进行数据更新
      vehicleInfoMap[item.vehicleIndexCode].justUpdate = true
      // console.log(`${item.vehicleIndexCode}-------未被过滤`)
      // 更新
      // 判断是否处于报警状态 若是保留报警状态30秒
      let stautsC;
      if (
        vehicleInfoMap[item.vehicleIndexCode].status === 2 &&
        new Date().getTime() -
          new Date(
            vehicleInfoMap[item.vehicleIndexCode].alarm.receivedTime
          ).getTime() <
          AlarmContinue
      ) {
        stautsC = 2;
      } else {
        stautsC = judgeStatus(item);
      }
      Object.assign(vehicleInfoMap[item.vehicleIndexCode], {
        gps: { ...vehicleInfoMap[item.vehicleIndexCode].gps, ...item }, // Object.assign(vehicleInfoMap[item.vehicleIndexCode], item),
        status: stautsC
      });
    } else {
      // 初始化
      vehicleInfoMap[item.vehicleIndexCode] = {
        gps: item,
        alarm: null,
        status: judgeStatus(item),
        vector: null,
        tag: null
      };
    }
  });
}

// 更新justUpdate更新状态
export function closeVehicleJustUpdate (id) {
  if (getVehicleInfo(id)) {
    // 更新
    Object.assign(vehicleInfoMap[id], {
      justUpdate: false
    });
  }
}

// 更新收藏状态
export function updateVehicleCollect(id, isCollected) {
  if (getVehicleInfo(id)) {
        // 更新
        Object.assign(vehicleInfoMap[id].gps, {
          isCollected
        });
  }
}

export function refreshVehicleDot(id, vector, tag) {
  if (getVehicleInfo(id)) {
    // 更新
    Object.assign(vehicleInfoMap[id], {
      vector,
      tag
    });
  } else {
    vehicleInfoMap[id] = {
      gps: null,
      alarm: null,
      status: null,
      vector,
      tag
    };
  }
}

// 更新报警信息
export function refreshVehicleAlarm(id, alarmInfo) {
  if (getVehicleInfo(id)) {
    // 更新
    Object.assign(vehicleInfoMap[id], {
      alarm: alarmInfo,
      status: 2
    });
  } else {
    // 初始化
    vehicleInfoMap[id] = {
      gps: null,
      alarm: alarmInfo,
      status: 2,
      vector: null,
      tag: null
    };
  }
}

export function refreshVehicleInfoMap() {
  const ids = Object.keys(vehicleInfoMap);
  ids.forEach(item => {
    if (vehicleInfoMap[item].gps) {
      vehicleInfoMap[item].status = judgeStatus(vehicleInfoMap[item].gps);
    }
    if (vehicleInfoMap[item].alarm) {
      if (
        new Date().getTime() -
          new Date(vehicleInfoMap[item].alarm.receivedTime).getTime() <
        AlarmContinue
      ) {
        vehicleInfoMap[item].status = 2;
      }
    }
  });
}

export function clearVehicleInfo(id) {
  vehicleInfoMap[id] = null;
}
