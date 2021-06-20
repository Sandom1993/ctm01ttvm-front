// 空白数据的占位符
const PLACEHOLDER = '--';
// 时期格式
const FORMAT_DATETIME = 'YYYY-MM-DD HH:mm:ss';
const FORMAT_DATE = 'YYYY-MM-DD';
const FORMAT_MONTH = 'YYYY-MM';
const FORMAT_TIME = 'HH:mm:ss';
const FORMAT_HHMM = 'HH:mm';
const FORMAT_DATETIME_GCF = 'yyyy-MM-dd HH:mm:ss';
const FORMAT_DATE_GCF = 'yyyy-MM-dd';
const FORMAT_MONTH_GCF = 'yyyy-MM';
// 表单校验规则
// 字符串必填项
const RULE_REQUIRED = {
  required: true,
  type: 'string',
  message: '此项为必填项',
  trigger: 'blur'
};
// 数字必填项
const RULE_REQUIRED_NUMBER = {
  required: true,
  message: '此项为数字必填项',
  type: 'number',
  trigger: 'blur'
};
// 单项选择
const RULE_MUSTSELECT = {
  required: true,
  message: '请选择一项',
  trigger: 'blur'
};
// 多选
const RULE_MUSTSELECT_NUMBER = {
  required: true,
  validator: (rule, value, callback) => {
  if (!value && value !== 0) {
  return callback(new Error('请选择一项'));
} else {
  return callback();
}
},
trigger: 'change'
};
// 数组多选
const RULE_MUSTSELECT_ARRAY = {
  required: true,
  message: '请选择一项',
  type: 'array',
  trigger: 'change'
};
// 角度
const RULE_ANGLE = {
  validator: (rule, value, callback) => {
  if (value < 0 || value > 360) {
  return callback(new Error('请输入正确的角度'));
} else {
  return callback();
}
},
trigger: 'blur'
};
// 字母开头，由字母、数字、下划线组成
const RULE_INVALIDINPUT = {
  pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
  message: '此项需为字母开头，由字母、数字、下划线组成',
  trigger: 'blur'
};
// 小写字母开头，由小写字母、数字、下划线组成
const RULE_INVALIDSMALLINPUT = {
  pattern: /^[a-z][a-z0-9_]*$/,
  message: '此项需为小写字母开头，由小写字母、数字、下划线组成',
  trigger: 'blur'
};
// 至少包含以下4种字符：大、小写字母、数字、特殊字符, 长度大于等于8位 [密码]
const RULE_PASSWORD = {
  pattern: /^.*(?=.{8,})(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@+._#$%^&*? ]).*$/,
  message: '需至少包含以下4种字符：大、小写字母、数字、特殊字符, 长度大于等于8位',
  trigger: 'blur'
};
// 允许输入字母、数字、下划线
const RULE_CORRECTINPUT = {
  pattern: /^[a-zA-Z0-9_]*$/,
  message: '此项仅允许输入字母、数字、下划线',
  trigger: 'blur'
};
// 仅允许输入小写字母、数字、下划线
const RULE_CORRECTLOWERLETTER = {
  pattern: /^[a-z0-9_]*$/,
  message: '此项仅允许输入小写字母、数字、下划线',
  trigger: 'blur'
};
// 不能包含特殊字符
const RULE_SPECIALPARAMS = {
  pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]*$/,
  message: '不能包含特殊字符',
  trigger: 'blur'
};
// 必须输入正整数
const RULE_POSITIVEINTEGERONLY = {
  required: true,
  pattern: /^[1-9]\d*$/,
  message: '必须输入正整数',
  trigger: 'blur'
};
// 必须输入整数
const RULE_INTEGERONLY = {
  pattern: /^[0-9]\d*$/,
  message: '必须输入整数',
  trigger: 'blur'
};
// 最多不超过10个字
const RULE_LT10LETTERS = {
  max: 10,
  message: '最多不超过10个字符',
  trigger: 'blur'
};
// 最多不超过32个字
const RULE_LT32LETTERS = {
  max: 32,
  message: '最多不超过32个字符',
  trigger: 'blur'
};
// 最多不超过64个字
const RULE_LT64LETTERS = {
  max: 64,
  message: '最多不超过64个字符',
  trigger: 'blur'
};
// 最多不超过200个字
const RULE_LT200LETTERS = {
  max: 200,
  message: '最多不超过200个字符',
  trigger: 'blur'
};
// RULE_LT127LETTERS
const RULE_LT127LETTERS = {
  max: 127,
  message: '最多不超过127个字符',
  trigger: 'blur'
};
// 请输入0到4096的数字
const RULE_NUM0TO4096 = {
  pattern: /^([0-9]|[1-9][0-9]|[1-9][0-9][0-9]|[1-3][0-9][0-9][0-9]|40[0-8][0-9]|409[0-6])$/,
  message: '请输入0到4096的数字',
  trigger: 'blur'
};
// 小数校验
const RULE_FLOAT = {
  required: true,
  pattern: /^(?:[0-9][0-9]*(?:\.[0-9]+)?|0\.(?!0+$)[0-9]+)$/,
  message: '请输入正确的小数或整数',
  trigger: 'blur'
};
// 身份证格式错误
const RULE_INCORRECTIDCARD = {
  pattern: /(^\d{15}$)|(^\d{17}(\d|X|x)$)/,
  message: '身份证格式错误',
  trigger: 'blur'
};
// ip (127.0.0.1)
const RULE_INCORRECTIP = {
  required: true,
  pattern: /^(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)$/,
  message: 'IP格式错误',
  trigger: 'blur'
};
// 请输入正确的IPV6地址
const RULE_IPV6 = {
  pattern: /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/,
  message: '请输入正确的IPV6地址',
  trigger: 'blur'
};
// 端口号必须为数字且应在1-65535之间
const RULE_INCORRECTPORT = {
  required: true,
  pattern: /(^[1-9]\d{0,3}$)|(^[1-5]\d{4}$)|(^6[0-4]\d{3}$)|(^65[0-4]\d{2}$)|(^655[0-2]\d$)|(^6553[0-5]$)/,
  message: '端口号必须为数字且应在1-65535之间',
  trigger: 'blur'
};
// 必须输入中文
const RULE_CHINESE = {
  required: true,
  pattern: /[\u4e00-\u9fa5]/,
  message: '必须输入中文',
  trigger: 'blur'
};
// 不能输入中文
const RULE_ENGLISH = {
  required: true,
  pattern: /^[^\u4e00-\u9fa5]+$/,
  message: '不能输入中文',
  trigger: 'blur'
};
const RULE_URLPATH = {
  required: true,
  pattern: /^\/[^\\]*$/,
  message: '以"/"开头且不含"\\"',
  trigger: 'blur'
};
const RULE_NOTOVER60 = {
  required: true,
  pattern: /^([1-9]|[1-5][0-9]|60)$/,
  message: '输入值必须为0-60的整数',
  trigger: 'blur'
};
const RULE_NOTOVER32767 = {
  // 65535
  required: true,
  pattern: /(^[1-9]\d{0,3}$)|(^[1-5]\d{4}$)|(^3[0-4]\d{3}$)|(^32[0-4]\d{2}$)|(^327[0-2]\d$)|(^3276[0-7]$)/,
  message: '输入值必须为0-32767的整数',
  trigger: 'blur'
};
// 经度的取值范围-180~180,最多保留15位小数点
const RULE_LONGITUDE = {
  required: true,
  pattern: /^(\-|\+)?(((\d|[1-9]\d|1[0-7]\d|0{1,3})\.\d{0,15})|(\d|[1-9]\d|1[0-7]\d|0{1,3})|180\.0{0,15}|180)$/,
  message: '经度的取值范围-180~180,最多保留15位小数点',
  trigger: 'blur'
};
// 纬度的取值范围
const RULE_LATITUDE = {
  required: true,
  pattern: /^(\-|\+)?([0-8]?\d{1}\.\d{0,15}|90\.0{0,15}|[0-8]?\d{1}|90)$/,
  message: '纬度的取值范围-90~90,最多保留15位小数点',
  trigger: 'blur'
};
// 请输入正确的MAC地址
const RULE_MAC = {
  pattern: /^[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}:[A-Fa-f\d]{2}$/,
  message: '请输入正确的MAC地址',
  trigger: 'blur'
};
// 请输入正确的手机号码
const RULE_PHONE = {
  pattern: /^[1][3578]\d{9}$/,
  message: '请输入正确的手机号码',
  trigger: 'blur'
};
// 请输入正确的手机号码和座机号
const RULE_PHONE2 = {
  pattern: /^((0\d{2,3}-\d{7,8})|(1[3584]\d{9}))$/,
  message: '请输入正确的手机号码或区号+座机号',
  trigger: 'blur'
};
// 请输入正确的邮箱地址
const RULE_EMAIL = {
  pattern: /(^\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$)|(^$)/,
  message: '请输入正确的邮箱地址',
  trigger: 'blur'
};
export {
  PLACEHOLDER,
  RULE_IPV6,
  RULE_PHONE,
  RULE_PHONE2,
  RULE_REQUIRED_NUMBER,
  RULE_MAC,
  FORMAT_DATETIME,
  FORMAT_DATE,
  FORMAT_TIME,
  FORMAT_MONTH,
  FORMAT_HHMM,
  FORMAT_DATETIME_GCF,
  FORMAT_DATE_GCF,
  FORMAT_MONTH_GCF,
  RULE_PASSWORD,
  RULE_REQUIRED,
  RULE_MUSTSELECT_NUMBER,
  RULE_MUSTSELECT,
  RULE_MUSTSELECT_ARRAY,
  RULE_INVALIDINPUT,
  RULE_INVALIDSMALLINPUT,
  RULE_CORRECTINPUT,
  RULE_POSITIVEINTEGERONLY,
  RULE_LT10LETTERS,
  RULE_LT32LETTERS,
  RULE_LT64LETTERS,
  RULE_LT200LETTERS,
  RULE_LT127LETTERS,
  RULE_NUM0TO4096,
  RULE_INTEGERONLY,
  RULE_INCORRECTIDCARD,
  RULE_INCORRECTIP,
  RULE_INCORRECTPORT,
  RULE_SPECIALPARAMS,
  RULE_CHINESE,
  RULE_ENGLISH,
  RULE_URLPATH,
  RULE_NOTOVER60,
  RULE_NOTOVER32767,
  RULE_FLOAT,
  RULE_CORRECTLOWERLETTER,
  RULE_LONGITUDE,
  RULE_LATITUDE,
  RULE_ANGLE,
  RULE_EMAIL
};
