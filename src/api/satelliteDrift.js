import http from '@/core/httpInstance';

export function querySatelliteDriftByVehicle(param) {
  return http.post({
    url: '/statistic/vehicle/querySatelliteDriftByVehicle',
    data: param
  });
}

export function querySatelliteDriftDetail(param) {
  return http.post({
    url: '/statistic/vehicle/querySatelliteDriftDetail',
    data: param
  });
}
