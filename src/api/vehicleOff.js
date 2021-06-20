import http from '@/core/httpInstance';

// 停运车辆分页查询
export function queryVehicleOffPage(param) {
  return http.post({
    url: '/vehicle/pageVehicleIdle',
    data: param
  });
}

// 车辆停运设置
export function vehicleOff(param) {
  return http.post({
    url: '/vehicle/vehicleIdle',
    data: param
  });
}
