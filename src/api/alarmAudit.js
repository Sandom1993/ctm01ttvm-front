import http from '@/core/httpInstance';

// 查询订阅的车辆树
export function getSubscribeTree(param) {
  return http.post({
    url: '/alarmAudit/getVehicleTree',
    data: param
  });
}

// 订阅报警和车辆
export function subscribeAlarmTypes(param) {
  return http.post({
    url: '/focus/updateFocusTypes',
    data: param
  });
}

// 查询用户车辆订阅
export function findSubscribeVehicles() {
  return http.post({
    url: '/alarmAudit/findSubscribeVehicles'
  });
}

// 查询订阅的报警类型
export function findSubscribeAlarmTypes() {
  return http.post({
    url: '/focus/findAlarmTypesTree'
  });
}

// 查询订阅时长和排序类型
export function findSubscribeAlarmConfig() {
  return http.post({
    url: '/focus/findAlarmConfig'
  });
}
