export function numRound(num, digit) {
  if (!num || Number.isNaN(num)) {
    return num
  }
  if (num instanceof String) {
    num = parseFloat(num);
  }
  digit = 10 ** digit
  num = Math.round(num * digit) / digit;
  return num.toString()
}

/**
 * 时间戳 转YY-MM-DD HH:MM:SS 格式
 * @param timeStamp
 * @returns {newTime}
 * @author chenying
 */
export function formatDate (timeStamp) {
    var date = new Date(timeStamp);
    var YY = date.getFullYear() + '-';
    var MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var DD = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate());
    var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    var ss = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
    return YY + MM + DD +" "+hh + mm + ss;
}
