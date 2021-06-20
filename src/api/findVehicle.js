import http from '@/core/httpInstance';

// 获取单个设备的历史定位
export function getpassingGps(gpsQueryParam) {
  return http.post({
    url: '/map/findPassingGps',
    data: gpsQueryParam
  });
}

export function gethistoryGps(gpsQueryParam) {
  return http.post({
    url: '/map/findHistoryGps',
    data: gpsQueryParam
  });
}

export function gethistoryGpsPage(gpsQueryParam) {
  return http.post({
    url: '/map/findHistoryGpsPage',
    data: gpsQueryParam
  });
}
