/**
 * 报警级别
 * @ALARM_LEVEL
 */
export const ALARM_LEVEL = [
  { value: 'l', label: '一级', color: '#2080FC' },
  { value: 'm', label: '二级', color: '#FD9511' },
  { value: 'h', label: '三级', color: '#FA3239' },
  { value: 'w', label: '预警', color: '#a3a3a3' }
];

/**
 * 审核状态
 * @CHECK_TYPE
 */
export const CHECK_TYPE = [
  // { value: '0', label: '系统核警' },
  { value: '1', label: '人工核警' },
  { value: '2', label: '已复核' },
  { value: '-1', label: '待审核' }
];

/**
 * 报警来源
 * @SOURCE_TYPE
 */
export const SOURCE_TYPE = [
  { value: 0, label: '设备' },
  { value: 1, label: '平台' }
];

/**
 * 报警类型
 * @ALARM_TYPE
 */
export const ALARM_TYPE = [
    { eventType: '132405', name: '超速' },
    { eventType: '132424', name: '夜间禁行时段行驶' },
    { eventType: '225442', name: '连续驾驶超时' },
];

/**
 * 过滤类型
 * @FILTER_TYPE
 */
export const FILTER_TYPE = [
  // { value: '0', label: '全部' },
  { value: '1', label: '卫星定位' },
  { value: '2', label: '智能视频' },
  { value: '3', label: '传统视频' }
];

/**
 * 核定状态
 * @VALID_TYPE
 */
export const VALID_TYPE = [
  { value: '0', label: '误报' },
  { value: '1', label: '有效' }
];

/**
 * 处置
 * @VALID_TYPE
 */
export const HANDLE_TYPE = [
    { value: '0', label: '全部' },
    { value: '1', label: '已处置' },
    { value: '2', label: '未处置' }
];
