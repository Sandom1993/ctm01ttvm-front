import http from '@/core/httpInstance';

// 获取设备树
export function getDeviceTree(param) {
  return http.post('/msa-web/tree/getDeviceTree.do', param);
}
// 过滤设备树
export function filterDeviceByName(param) {
  return http.post('/msa-web/tree/filterDeviceByName.do', param);
}
// 获取用户树
export function getUserTree(param) {
  return http.post('/msa-web/tree/getUserTree.do', param);
}
// 获取应用角色的组织树
export function getOrgTree(param) {
  return http.post('/msa-web/tree/getOrgTree.do', param);
}
// 获取管理角色的组织树
export function getManagerOrgTree(param) {
  return http.post({
    url: '/tree/getManagerOrgTree',
    data: param
  }); //  getOrgTree.do
}
// 过滤组织树
export function filterOrgByName(param) {
  return http.post({
    url: '/tree/filterOrgByName',
    data: param
  });
}
// 根据设备获取监控点
export function geCamerasByDevice(vehicleIndexCode) {
  return http.get(
    `/msa-web/resource/cameras/auth/query.do?vehicleIndexCode=${vehicleIndexCode}`
  );
}

// 根据车辆编号获取监控点
export function queryCameraByVehicleIndexCode(param) {
  return http.post({
    url: '/vehicle/queryCameraByVehicleIndexCode',
    data: param
  });
}

// 获取报警树
export function getAlarmTypeTree(param) {
  return http.post({
    data: param,
    url: '/msa-web/tree/getAlarmTypeLevelTree'
  });
}

// 获取报警树父节点
export function geAlarmParent() {
  return http.get(
    '/msa-web/datadict/findFirstLayerByTypeCode.do?typeCode=msa.alarm_type'
  );
}

// 获取报警树子节点
export function geAlarmSon(str) {
  return http.get(
    `/msa-web/datadict/findChildLayerByTypeCode.do?typeCode=msa.alarm_type&dataKeys=${str}`
  );
}
// 获取车辆树
export function getVehicleTree(param) {
  return http.post({
    data: param,
    url: '/tree/getVehicleTree'
  });
}
// 过滤车辆树
export function filterVehicleByName(param) {
  return http.post({
    url: '/tree/filterVehicleByName',
    data: param
  });
}

// 获取非标车辆树
export function getNonStandardVehicleTree(param) {
  return http.post({
    data: {
      nonstandard: true,
      ...param
    },
    url: '/tree/getVehicleTree'
  });
}

// 过滤非标车辆树
export function filterNonStandardVehicleByName(param) {
  return http.post({
    url: '/tree/filterVehicleByName',
    data: {
      nonstandard: true,
      ...param
    }
  });
}

// 过滤用户树
export function filterUserTree(param) {
  return http.post('/msa-web/tree/filterUserByName.do', param);
}

// 监控点树
export function getVehicleCameraTree(param) {
  return http.post('/msa-web/tree/getVehicleCameraTree.do', param);
}

// 获取treepath
export function getTreePath(param) {
  return http.post({
    url: '/tree/getResourceTreePath',
    data: param
  });
}
export function getNewOrgTree(param) {
  return http.post({
    url: '/tree/getOrgTree',
    data: param
  }); //  getOrgTree.do
}
export function getNewUserTree(param) {
  return http.post({
    url: '/tree/getUserTree',
    data: param
  });
}
