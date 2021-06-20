import http from '@/core/httpInstance';

// 轨迹状态面板
export function queryVehicleStatus(param) {
  return http.post({
    url: '/map/queryVehicleStatus',
    data: param
  });
}
// 查轨迹
export function gethistoryGps(param) {
  return http.post({
    url: '/map/findHistoryGps',
    data: param
  });
}
// 查报警
export function findAlarmPage(param) {
  return http.post({
    url: '/map/findAlarmPage',
    data: param
  });
}

// 查电子围栏
export function findFenceByVehicle(param) {
  return http.post({
    url: '/fence/pageFenceByVehicle',
    data: param
  });
}
