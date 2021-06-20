import Vue from 'vue';
import hui from 'hui';
import '@/core/huiPro';
import initApp from '@/core/initApp';
import components from '@/components';
import ReplaceEmptyText from './plugins/emptyText/ReplaceEmptyText.js';
import { toTimeNormalString, toTimezoneString } from '@/components/util.js';

if (process.env.NODE_ENV === 'development') {
  require('./mock');
}

Vue.prototype.$eventBus = new Vue(); // 全局的事件总线
Vue.use(hui);
Vue.directive('empty', ReplaceEmptyText);
Vue.filter('formateDateTime', function(date) {
  if (!date) {
    return '';
  }
  return toTimeNormalString(toTimezoneString(date));
});
Vue.filter('formateSourceType', function(sourceType) {
  if (sourceType === 0) {
    return '设备';
  } else if (sourceType === 1) {
    return '平台';
  } else if (sourceType === 2) {
    return '人工';
  }
});
Vue.filter('formatSeconds', function(value) {
  if (!value) {
    return value;
  }
  let theTime = parseInt(value); // 需要转换的时间秒
  let theTime1 = 0; // 分
  let theTime2 = 0; // 小时
  let theTime3 = 0; // 天
  if (theTime > 60) {
    theTime1 = parseInt(theTime / 60);
    theTime = parseInt(theTime % 60);
    if (theTime1 >= 60) {
      theTime2 = parseInt(theTime1 / 60);
      theTime1 = parseInt(theTime1 % 60);
      if (theTime2 >= 24) {
        // 大于24小时
        theTime3 = parseInt(theTime2 / 24);
        theTime2 = parseInt(theTime2 % 24);
      }
    }
  }
  var result = '';
  if (theTime > 0) {
    result = '' + parseInt(theTime) + '秒';
  }
  if (theTime1 > 0) {
    result = '' + parseInt(theTime1) + '分' + result;
  }
  if (theTime2 > 0) {
    result = '' + parseInt(theTime2) + '小时' + result;
  }
  if (theTime3 > 0) {
    result = '' + parseInt(theTime3) + '天' + result;
  }
  return result;
});

initApp(Vue);

components.map(({ install }) => {
  install(Vue);
});
