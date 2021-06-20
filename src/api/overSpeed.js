import http from '@/core/httpInstance';

export function pageQueryOverSpeed(param) {
  return http.post({
    url: '/statistic/alarm/queryOverSpeed',
    data: param
  });
}

export function pageQueryOverSpeedDetail(param) {
  return http.post({
    url: '/statistic/alarm/queryOverSpeedDetail',
    data: param
  });
}
