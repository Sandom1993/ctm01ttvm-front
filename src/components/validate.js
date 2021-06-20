export default {
  ip(rule, value, callback) {
    if (value === '' || typeof value === 'undefined' || value === null) {
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
  port(rule, value, callback) {
    if (value === '' || typeof value === 'undefined' || value === null) {
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
  specialWord(rule, value, callback) {
    if (value === '' || typeof value === 'undefined' || value === null) {
      return callback(new Error('请输入'));
    }
    const ASCII_UN_USE = [];
    // ASCII_UN_USE[0] = ['32'];// SPACE
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
    if (value.indexOf(' ') > -1) {
      arr.push('空格');
    }
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
  integer(rule, value, callback) {
    if (value === '' || typeof value === 'undefined' || value === null) {
      return callback(new Error('请输入整数'));
    }
    if (/^[+]{0,1}(\d+)$/.test(value)) {
      return callback();
    }
    return callback(new Error('请输入整数'));
  },
  ValidateInteger(min, max) {
    return (rule, value, callback) => {
      if (value === '' || typeof value === 'undefined' || value === null) {
        return callback(new Error(`请输入${min}-${max}的整数`));
      }
      if (/^[+]{0,1}(\d+)$/.test(value)) {
        if (value > max || value < min) {
          return callback(new Error(`请输入${min}-${max}的整数`));
        }
        return callback();
      }
      return callback(new Error(`请输入${min}-${max}的整数`));
    };
  },
  ValidateNumber(min, max) {
    return (rule, value, callback) => {
      if (value === '' || typeof value === 'undefined' || value === null) {
        return callback(new Error(`请输入${min}-${max}的数字`));
      }
      if (/^(-?\d+)(\.\d+)?$/.test(value)) {
        if (value > max || value < min) {
          return callback(new Error(`请输入${min}-${max}的数字`));
        }
        return callback();
      }
      return callback(new Error(`请输入${min}-${max}的数字`));
    };
  },
  ValidateString(min, max) {
    return (rule, value, callback) => {
      if (value === '' || typeof value === 'undefined' || value === null) {
        return callback(new Error(`请输入长度为${min}-${max}的字符串`));
      }
      if (/^.{0,128}$/.test(value)) {
        return callback();
      }
      return callback(new Error(`请输入长度为${min}-${max}的字符串`));
    };
  },
  requireInput(rule, value, callback) {
    if (value === '' || typeof value === 'undefined' || value === null) {
      return callback(new Error('请输入'));
    }
    return callback();
  },
  requireSelect(rule, value, callback) {
    if (value === '' || typeof value === 'undefined' || value === null) {
      return callback(new Error('请选择'));
    }
    return callback();
  }
};
