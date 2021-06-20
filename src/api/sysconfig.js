import http from '@/core/httpInstance';

// 报警订阅-列表查询
export function getPageQuery(condition) {
  // return http.post('/msa-web/alarmconfig/pageQuery.do', condition);
  return http.post('/msa-web/alarmConfig/findAlarmConfigPage.do', condition);
}

// 报警订阅-列表删除
export function deleteAlarmConfig(arr) {
  // return http.post('/msa-web/alarmconfig/delete.do', arr);
  return http.post('/msa-web/alarmConfig/deleteAlarmConfigs.do', arr);
}

// 报警订阅-获取单个布控的详情
export function getDetail(id) {
  // return http.get(`/msa-web/alarmConfig/query.do?deploymentId=${id}`);
  return http.get(`/msa-web/alarmConfig/findAlarmConfig.do?deploymentId=${id}`);
}

// 报警订阅-添加报警布控
export function addAlarmConfig(param) {
  // return http.post('/msa-web/alarmConfig/save.do', param);
  return http.post('/msa-web/alarmConfig/saveAlarmConfigs.do', param);
}

// 获取地图配置
export function getMapConfig() {
  return http.post('/msa-web/mapconfig/query.do');
}

// 更新地图配置
export function updateMapconfig(param) {
  return http.post('/msa-web/mapconfig/update.do', param);
}

// 远程配置-获取表格记录
export function getRemotePageQuery(param) {
  return http.post('/msa-web/device/config/findConfigPage.do', param);
}

// 远程配置-查看单个设备的远程配置记录
export function getStatusQuery(param) {
  return http.post('/msa-web/device/config/findConfigStatus.do', param);
}

// 远程配置-获取参考配置
export function getTempData(param) {
  return http.post('/msa-web/device/config/findConfig.do', param);
}

// 远程配置-批量保存配置
export function batchConfig(param) {
  return http.post('/msa-web/device/config/batchConfig.do', param);
}

// 远程配置-重新下发
export function reconfig(param) {
  return http.post('/msa-web/device/config/reconfig.do', param);
}

// 获取ehome远程配置项
export function getRemoteConfigs(type) {
  return http.get(
    `/msa-web/datadict/findFirstLayerByTypeCode.do?typeCode=${type}`
  );
}

// 获取用户信息
export function getUsers() {
  return http.get('/msa-web/resource/user/all.do');
}

// 远程配置-获取通道列表
export function findCameraInfo(param) {
  return http.post('/msa-web/device/config/findCameraInfo.do', param);
}

export function findTimeConfigByType(params) {
  return http.get({
    url: '/vehicle/findTimeConfigByType',
    params
  });
}

export function updateTimeConfig(params) {
  return http.post({
    url: '/vehicle/updateTimeConfig',
    data: params
  });
}
