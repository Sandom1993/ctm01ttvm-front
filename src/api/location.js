import http from '@/core/httpInstance';

// 批量获取设备最新定位
export function getlastGps(vehicleIndexCode) {
  return http.post({
    data: vehicleIndexCode,
    url: '/vehicle/findLastGps'
  });
}

// 批量获取设备最新定位
export function getVehicleDetail(vehicleIndexCode) {
  return http.get({
    url: '/vehicle/getVehicleDetail',
    params: vehicleIndexCode
  });
}

// 获取单个设备的历史定位
export function gethistoryGps(gpsQueryParam) {
  return http.post('/msa-web/map/findHistoryGps.do', gpsQueryParam);
}

// 导出单个设备的历史定位
export function exportHistoryGps(gpsQueryParam) {
  return http.post('/msa-web/map/exportHistoryGps.do', gpsQueryParam);
}

// 分页查询过车信息
export function getpassingGps(gpsQueryParam) {
  return http.post('/msa-web/map/findPassingGps.do', gpsQueryParam);
}

// 分页查询过车回放视频
export function getpassingVideo(gpsQueryParam) {
  return http.post('/msa-web/multimedia/video/pageQuery.do', gpsQueryParam);
}

// 导出过车信息
export function exportPagesPassingGps(gpsQueryParam) {
  return http.post('/msa-web/map/exportPagesPassingGps.do', gpsQueryParam);
}

// 事件下发
export function eventSend(param) {
  return http.post('/msa-web/vehicleTool/eventSend.do', param);
}

// 车辆控制
export function vehicleCtrl(param) {
  return http.post('/msa-web/vehicleTool/vehicleCtrl.do', param);
}

// 车辆跟踪
export function vehicleTrack(param) {
  return http.post('/msa-web/vehicleTool/vehicleTrack.do', param);
}

// 手动抓拍
export function capturePicture(param) {
  return http.post({
    url: '/vehicle/capturePicture',
    data: param
  });
}

// 批量播报
export function sendTxTmsg(param) {
  return http.post('/msa-web/vehicleTool/messageSend.do', param);
}

// 批量播报-获取模板列表
export function getTxTTemp(type) {
  return http.get({
    url: '/messageTemplate/getAllByType',
    params: {
      type
    }
  });
}

// 批量播报-添加模板
export function addTxTTemp(param) {
  return http.post({
    url: '/messageTemplate/add',
    data: param
  });
}

// 批量播报-删除模板
export function deleteTxTTemp(param) {
  return http.post({
    url: '/messageTemplate/delete',
    data: param
  });
}

// 批量播报-更新模板
export function updateTxTTemp(param) {
  return http.post({
    url: '/messageTemplate/update',
    data: param
  });
}

// 批量播报--新
export function batchBroadcast(param) {
  return http.post({
    url: '/vehicle/messageSendBatch',
    data: param
  });
}

// 批量播报--重新下发失败的设备
export function reissue(param) {
  return http.post('/msa-web/vehicleTool/reissue.do', param);
}

// 批量播报--车辆批量播报实时下发记录查询
export function queryImmediateBroadcast(param) {
  return http.post('/msa-web/vehicleTool/queryImmediateBroadcast.do', param);
}

// 批量播报--车辆批量播报定时下发记录查询
export function queryTaskBroadcast(param) {
  return http.post('/msa-web/vehicleTool/queryTaskBroadcast.do', param);
}

// 批量播报--批量播报实时任务详情查询
export function queryImmediateBroadcastDetail(param) {
  return http.post(
    '/msa-web/vehicleTool/queryImmediateBroadcastDetail.do',
    param
  );
}

// 获取ngix信息
export function getNginxInfo() {
  return http.get({
    url: '/bicservice/query',
    params: {
      serviceId: 'proxy',
      componentId: 'cluster',
      protocal: 'https'
    }
  });
}

// 获取gs
export function getGS() {
  return http.get({
    url: '/bicservice/querySG'
  });
}

// 获取io通道
export function getIOChannel(deviceIndexCode) {
  return http.get(
    `/msa-web/resource/ios/auth/query.do?deviceIndexCode=${deviceIndexCode}`
  );
}

// 获取用户信息
export function getUserInfo() {
  return http.get({
    url: '/bicservice/queryLoginInfo'
  });
}

// 获取token
export function getToken() {
  return http.get({
    url: '/bicservice/queryToken'
  });
}

// 查询指定编号的驾驶员
export function GetDriverInfo(indexCode) {
  return http.get(`/msa-web/resource/driver/query.do?indexCode=${indexCode}`);
}

// 查询指定编号的驾驶员
export function queryDriverImage(indexCode) {
  return http.get(
    `/msa-web/resource/driver/queryImage.do?indexCode=${indexCode}`
  );
}

// 轨迹回放分页查询报警
export function findAlarmPage(param) {
  return http.post('/msa-web/alarm/findAlarmPage.do', param);
}

// 定位获取对讲能力的设备编号
export function findAbilityDevicesByVehicle(param) {
  return http.post({
    url: '/tree/findAbilityDevicesByVehicle',
    data: param
  });
}

// 设备远程配置
export function saveDeviceRemoteConfig(param) {
  return http.post({
    url: '/vehicle/saveDeviceRemoteConfig',
    data: param
  });
}

// 获取设备远程配置
export function getDeviceRemoteConfig(param) {
  return http.get({
    url: '/vehicle/getDeviceRemoteConfig',
    params: param
  });
}

// 终端方法透传
export function terminalAbility(param) {
  return http.post({
    url: '/vehicle/terminalAbility',
    data: param
  });
}
