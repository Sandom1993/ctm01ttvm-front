import http from '@/core/httpInstance';

// 获取设备树
export function findAlarmPage(param) {
  return http.post({
    url: '/alarm/findAlarmPage',
    data: param
  });
}

export function findAlarmPics(params) {
  return http.post({
    url: '/alarm/findPicturesByAlarmId',
    data: params
  });
}

export function findAlarmVideos(params) {
  return http.post({
    url: '/alarm/findVideoByAlarmId',
    data: params
  });
}
export function saveAlarmLabel(params) {
  return http.post({
    url: '/alarm/saveAlarmLabel',
    data: params
  });
}
export function batchSaveAlarmLabel(params) {
  return http.post({
    url: '/alarm/batchSaveAlarmLabel',
    data: params
  });
}

// 审核风险事件
export function saveRiskEventAuditResult(params) {
  return http.post({
    url: '/alarm/saveRiskEventAuditResult',
    data: params
  });
}

export function getAlarmDealsByEventId(params) {
  return http.get({
    url: '/alarm/getAlarmDealsByEventId',
    params: params
  });
}

export function getLongTimeOffVehicles() {
  return http.get({
    url: '/vehicle/getLongTimeOffVehicles'
  });
}

export function pageOnOffVehicles(params) {
  return http.post({
    url: '/vehicle/pageOnOffVehicles',
    data: params
  });
}

// 查找风险事件
export function auditLedgerQuery(params) {
  return http.post({
    url: '/alarm/auditLedgerQuery',
    data: params
  });
}

// 查找风险事件详情
export function riskLedgerDetailQuery(params) {
  return http.post({
    url: '/alarm/riskLedgerDetailQuery',
    data: params
  });
}

// 查找视频回放url
export function findVideoPlaybackUrl(params) {
  return http.post({
    url: '/alarm/findVideoPlaybackUrl',
    data: params
  });
}

// 获取交运所有报警类型
export function getAllAlarmTypes(params) {
  return http.get({
    url: '/focus/getAlarmTypes',
    params: params
  });
}

// 保存自定义报警
export function sendAlarm(params) {
  return http.post({
    url: '/alarm/sendAlarm',
    data: params
  });
}

// 收藏/取消收藏车辆
export function collectVehicle(params) {
  return http.post({
    url: '/focus/collectVehicle',
    data: params
  });
}

// 收藏/取消收藏车辆
export function getFocusVehicleList() {
  return http.get({
    url: '/focus/getFocusVehicleList'
  });
}

// 自动处警-查询
export function getDealStrategy(params) {
    return http.get({
        url: '/dealStrategy/queryDealStrategy',
        params: params
    });
}
// 自动处警-新增
export function saveDealStrategy(params) {
    return http.post({
        url: '/dealStrategy/save',
        data: params
    });
}
