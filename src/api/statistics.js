import http from '@/core/httpInstance';

// 轨迹完整率
export function queryGpsIntegrityRate(param) {
  return http.post({
    url: '/statistic/gps/pageQueryGpsIntegrityRateByVehicle',
    data: param
  });
}

// 轨迹完整率详情
export function pageIntegrityRateDetailQuery(param) {
  return http.post({
    url: '/statistic/gps/pageIntegrityRateDetailQuery',
    data: param
  });
}

// 数据合格率
export function queryGpsCorrectRateByVehicle(param) {
  return http.post({
    url: '/statistic/gps/queryGpsCorrectRateByVehicle',
    data: param
  });
}

// 数据合格率详情
export function queryIncorrectGpsDetail(param) {
  return http.post({
    url: '/statistic/gps/queryIncorrectGpsDetail',
    data: param
  });
}

// 车辆在线统计
export function findVehicleOnlineInfoByVehicleIndexCodes(param) {
  return http.post({
    url: '/statistic/online/findVehicleOnlineInfoByVehicleIndexCodes',
    data: param
  });
}

// 组织车辆在线统计
export function pageQueryOnlineRate(param) {
  return http.post({
    url: '/statistic/online/pageQueryOnlineRate',
    data: param
  });
}

// 分页查询车辆在线信息
export function pageQueryOnlineRateDetail(param) {
  return http.post({
    url: '/statistic/online/pageQueryOnlineRateDetail',
    data: param
  });
}

// 分页查询车辆运营信息
export function pageQueryVehicleStatusDetail(param) {
  return http.post({
    url: '/statistic/online/pageQueryVehicleStatusDetail',
    data: param
  });
}

// 分页查询报警汇总--违规统计
export function pageAlarmCount(param) {
  return http.post({
    url: '/statistic/alarm/pageAlarmCount',
    data: param
  });
}

// 全量查询车辆报警汇总、报警类型汇总
export function getVehicleAlarmCount(param) {
  return http.post({
    url: '/statistic/alarm/getVehicleAlarmCount',
    data: param
  });
}

// 月每日各类报警汇总
export function getMonthAlarmCount(param) {
  return http.post({
    url: '/statistic/alarm/getMonthAlarmCount',
    data: param
  });
}

// 机构组织分析
export function orgAlarmCount(param) {
  return http.post({
    url: '/statistic/alarm/orgAlarmCount',
    data: param
  });
}

// 根据组织查看报警详情
export function findAlarmPageByOrg(param) {
  return http.post({
    url: '/statistic/alarm/findAlarmPage',
    data: param
  });
}

// 组织机构报警分类汇总
export function getOrgAlarmCount(param) {
  return http.post({
    url: '/statistic/alarm/getOrgAlarmCount',
    data: param
  });
}

// 单日统计功能
export function getDayStatistic(param) {
  return http.post({
    url: '/statistic/all/dayStatistic',
    params: param
  });
}

// 月统计功能
export function getMonthStatistic(param) {
  return http.post({
    url: '/statistic/all/monthStatistic',
    params: param
  });
}

// 保存月统计备注
export function saveRemark(param) {
  return http.post({
    url: '/statistic/all/saveRemark',
    params: param
  });
}

// 分页查询用户操作日志
export function pageQueryOperation(param) {
  return http.post({
    url: '/operation/pageQueryOperation',
    data: param
  });
}
