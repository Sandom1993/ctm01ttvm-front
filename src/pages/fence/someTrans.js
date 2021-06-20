export function fenceType (code) {
  code = parseInt(code)
  // switch (code) {
  //   case 1:
  //     return '圆形'
  //   case 2:
  //     return '多边形'
  //   case 3:
  //     return '矩形'
  //   case 4:
  //     return '单线段'
  //   case 5:
  //     return '多线段'
  //   case 6:
  //     return '标记点'
  //   default:
  //     return ''
  // }
  if (code >= 1 && code <= 3) {
    return '区域围栏'
  } else if (code >= 4 && code <= 5) {
    return '线路围栏'
  } else if (code === 6) {
    return '标记点围栏'
  } else {
    return ''
  }
}

export function graphType (code) {
  switch (code) {
    case 1:
      return '圆形'
    case 2:
      return '多边形'
    case 3:
      return '矩形'
    case 4:
      return '单线段'
    case 5:
      return '多线段'
    case 6:
      return '标记点'
    default:
      return ''
  }
}

export function ruleType (code) {
  code = parseInt(code)
  switch (code) {
    case 120:
      return '超速'
    case 121:
      return '低速'
    case 122:
      return '出区域'
    case 123:
      return '进区域'
    case 124:
      return '长时间停留'
    case 125:
      return '偏离路线'
    case 126:
      return '线路限速'
    case 127:
      return '未按时离开'
    case 128:
      return '未按时到达'
    case 129:
      return '进路线'
    case 130:
      return '分段限速'
    case 131:
      return '停留超时'
  }
}

export function ruleTypeRollback (code) {
  switch (code) {
    case '超速':
      return 120
    case '低速':
      return 121
    case '出区域':
      return 122
    case '进区域':
      return 123
    case '长时间停留':
      return 124
    case '偏离路线':
      return 125
    case '线路限速':
      return 126
    case '未按时离开':
      return 127
    case '未按时到达':
      return 128
    case '进路线':
      return 129
    case '分段限速':
      return 130
    case '停留超时':
      return 131
  }
}