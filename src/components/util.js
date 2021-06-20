// 返回当前页面相对于窗口显示区左上角的 X ，Y 的位置
export const getScroll = top => {
  let ret = window[`page${top ? 'Y' : 'X'}Offset`];
  const method = `scroll${top ? 'Top' : 'Left'}`;
  if (typeof ret !== 'number') {
    const d = window.document;
    // ie6,7,8 standard mode
    ret = d.documentElement[method];
    if (typeof ret !== 'number') {
      // quirks mode
      ret = d.body[method];
    }
  }
  return ret;
};

// 获取元素top,left,right,bottom的绝对位置
export const getOffset = (element, container = document.body) => {
  const elRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  const clientTop = element.clientTop || container.clientTop || 0;
  const clientLeft = element.clientLeft || container.clientLeft || 0;
  let top;
  let left;

  if (container === document.body) {
    top = getScroll(true);
    left = getScroll();
  } else {
    top = container.scrollTop - containerRect.top;
    left = container.scrollLeft - containerRect.left;
  }

  return {
    top: elRect.top + top - clientTop,
    left: elRect.left + left - clientLeft,
    right: elRect.right + left - clientLeft,
    bottom: elRect.bottom + top - clientTop
  };
};

/**
 *将时间转换为带本地时区的格式
 *@param{String|Date}dt可以作为 new Date() 参数的字符串或 Date 对象
 */
export function toTimezoneString(dt) {
  const date = new Date(dt);
  if (date.toString() === 'Invalid Date') {
    return '';
  }
  // UTC+8 会返回 -480
  const tzo = date.getTimezoneOffset();
  const tzSign = tzo > 0 ? '-' : '+';
  const tzHour = String(Math.abs(tzo / 60) | 0);
  const tzMinute = String(Math.abs(tzo % 60) | 0);
  const timezone = tzo === 0 ? '+Z' : `${tzSign}${tzHour}:${tzMinute}`;
  return `${[date.getFullYear(), date.getMonth() + 1, date.getDate()].join(
    '-'
  )} ${[date.getHours(), date.getMinutes(), date.getSeconds()].join(
    ':'
  )}.${`000${date.getMilliseconds()}`.slice(-3)}${timezone}`
    .replace(/\b\d\b/g, '0$&')
    .replace(/\+Z/, 'Z')
    .replace(/\s/, 'T');
}

// 后台传回"2018-10-30T21:08:49.416+08:00"转正常展示格式'2018-10-30 21:08:49'
export function toTimeNormalString(str) {
  return str
    .split('.')[0]
    .split('T')
    .join(' ');
}

// 校验
export const validate = {
  //
  ip: (rule, value, callback) => {
    if (!value) {
      return callback(new Error('请输入IP'));
    }
    if (
      /(?=(\b|\D))(((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))(?=(\b|\D))/.test(
        value
      )
    ) {
      return callback();
    }
    return callback(new Error('请输入正确的IP'));
  },

  port: (rule, value, callback) => {
    if (!value) {
      return callback(new Error('请输入端口号'));
    }
    if (
      /^([0-9]|[1-9]\d{1,3}|[1-5]\d{4}|6[0-4]\d{4}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/.test(
        value
      )
    ) {
      return callback();
    }
    return callback(new Error('请输入正确的端口号'));
  },

  // 非法字符
  specialWord: (rule, value, callback) => {
    const ASCII_UN_USE = [];
    ASCII_UN_USE[0] = ['32']; // SPACE
    ASCII_UN_USE[1] = ['33']; // !
    ASCII_UN_USE[2] = ['34']; // "
    ASCII_UN_USE[3] = ['35']; // #
    ASCII_UN_USE[4] = ['36']; // $
    ASCII_UN_USE[5] = ['37']; // %
    ASCII_UN_USE[6] = ['38']; // &
    ASCII_UN_USE[7] = ['39']; // '
    ASCII_UN_USE[8] = ['40']; // (
    ASCII_UN_USE[9] = ['41']; // )
    ASCII_UN_USE[10] = ['42']; // *
    ASCII_UN_USE[11] = ['43']; // +
    ASCII_UN_USE[12] = ['44']; // ,
    ASCII_UN_USE[13] = ['45']; // -
    ASCII_UN_USE[14] = ['47']; // /
    ASCII_UN_USE[15] = ['58']; // :
    ASCII_UN_USE[16] = ['59']; // ;
    ASCII_UN_USE[17] = ['60']; // <
    ASCII_UN_USE[18] = ['61']; // =
    ASCII_UN_USE[19] = ['62']; // >
    ASCII_UN_USE[20] = ['63']; // ?
    ASCII_UN_USE[21] = ['64']; // @
    ASCII_UN_USE[22] = ['92']; // \
    ASCII_UN_USE[23] = ['94']; // ^
    ASCII_UN_USE[24] = ['95']; // _
    ASCII_UN_USE[25] = ['123']; // {
    ASCII_UN_USE[26] = ['124']; // |
    ASCII_UN_USE[27] = ['125']; // }
    ASCII_UN_USE[28] = ['126']; // ~

    const arr = [];
    ASCII_UN_USE.forEach(item => {
      const s = String.fromCharCode(parseInt(item, 10));
      if (value.indexOf(s) > -1) {
        arr.push(s);
      }
    });
    if (value.indexOf('“') > -1) {
      arr.push('“');
    }
    if (value.indexOf('”') > -1) {
      arr.push('”');
    }
    if (arr.length === 0) {
      return callback();
    }
    return callback(new Error(`不能包含以下字符:${arr.join(' ')}`));
  },

  // 非负整数
  integer: (rule, value, callback) => {
    if (!value) {
      return callback(new Error('请输入整数'));
    }
    if (/^[+]{0,1}(\d+)$/.test(value)) {
      return callback();
    }
    return callback(new Error('请输入整数'));
  }
};

// 导出excel表格 param是一个key-value对象
export function downloadExcel(url, param) {
  const keys = Object.keys(param);
  if (document.getElementsByName('downloadframe').length > 0) {
    document
      .getElementsByTagName('body')[0]
      .removeChild(document.getElementsByName('downloadframe')[0]);
  }
  if (document.getElementById('downloadform')) {
    document
      .getElementsByTagName('body')[0]
      .removeChild(document.getElementById('downloadform'));
  }
  const frame = document.createElement('iframe');
  frame.setAttribute('name', 'downloadframe');
  frame.setAttribute('style', 'display:none');
  const form = document.createElement('form');
  form.setAttribute('id', 'downloadform');
  form.setAttribute('style', 'display:none');
  form.setAttribute('target', 'downloadframe');
  form.setAttribute('method', 'post');
  form.setAttribute('action', url);
  keys.forEach(item => {
    const input = document.createElement('input');
    input.setAttribute('type', 'hidden');
    input.setAttribute('name', item);
    input.setAttribute('value', param[item]);
    form.appendChild(input);
  });
  const input = document.createElement('input');
  input.setAttribute('type', 'hidden');
  input.setAttribute('name', window.parameterName);
  input.setAttribute('value', window.token);
  form.appendChild(input);
  document.getElementsByTagName('body')[0].appendChild(frame);
  document.getElementsByTagName('body')[0].appendChild(form);
  form.submit();
}

/**
 * 设置cookie
 * @param {*} name key
 * @param {*} value 值
 * @param {*} exdays 过期时间
 */
export function setCookie(name, value, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  const expires = `expires=${d.toGMTString()}`;
  document.cookie = `${name}=${value}; ${expires}`;
}

/**
 *
 * @param {*} cname key
 */
export function getCookie(cname) {
  const name = `${cname}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim();
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

// GPS转度分秒
export function gpsTodms(value) {
  value /= 360000.0;
  const degree = Math.floor(value);
  const minute = (value - degree) * 60;
  const second = (minute - Math.floor(minute)) * 60;
  return `${degree}°${Math.floor(minute)}′${Math.floor(second)}″`;
}
