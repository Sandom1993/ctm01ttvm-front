import http from '@/core/httpInstance';

export function findFencePage (param) {
  return http.post({
    url: '/fence/pageFence',
    data: param
  })
}

export function addFenceInfo (param) {
  return http.post({
    url: '/fence/addFenceInfo',
    data: param
  })
}

export function findFence (param) {
  return http.post({
    url: '/fence/findFence',
    data: param
  })
}

export function deleteFenceInfo (param) {
  //  update by chenying 2021.10.13
  return http.post({
    // url: '/fence/deleteFenceInfo',
    url: '/fence/updateVehicleFenceInfo',
    data: param
  })
}

export function pageFenceByVehicle(param) {
  return http.post({
    url: '/fence/pageFenceByVehicle',
    data: param
  });
}
