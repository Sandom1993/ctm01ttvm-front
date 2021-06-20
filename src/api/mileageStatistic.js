import http from '@/core/httpInstance';

export function pageQueryMileageByVehicle(param) {
  return http.post({
    url: '/statistic/mileage/pageQueryMileageByVehicle',
    data: param
  });
}

