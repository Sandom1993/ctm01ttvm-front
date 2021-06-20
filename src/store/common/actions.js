// 获取语言和皮肤参数
import { getLanKey, getSkinKey } from '@/utils/common';
import { getUserInfo } from '@/api/location';

export default {
  setUserInfo(context) {
    return new Promise(resolve => {
      // userInfo
      let data = {
        languageId: getLanKey(),
        skin: getSkinKey()
      };
      getUserInfo()
        .then(json => {
          if (json.code === '0') {
            data = {
              ...json.data,
              ...data
            };
          }
          context.commit('setUserInfo', data);
          resolve({
            userInfo: data
          });
        })
        .catch(e => {
          context.commit('setUserInfo', data);
          resolve({
            userInfo: data
          });
        });
    });
  }
};
