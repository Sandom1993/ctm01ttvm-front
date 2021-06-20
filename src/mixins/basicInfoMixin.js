import { getNginxInfo, getGS, getUserInfo, getToken } from '@/api/location.js';
// import { getMapConfig } from '@/api/sysconfig.js';
import { getAlarmTypeTree } from '@/api/tree.js';

export default {
  data() {
    return {
      ngixinfo: null, // 播放视频需要的参数:ip,port,protocal
      sg: null, // 播放视频需要的参数
      addr: '',
      userInfo: null, // 用户信息
      token: null, // token用于websoket
      mapconfig: {
        // 地图配置相关参数,
        centerLatitude: 30200000,
        centerLongitude: 120200000,
        clusterLevel: 8,
        zoomLevel: 12
      },
      alarmArr: [] // 数据字典获取报警树
    };
  },
  methods: {
    // 获取sg,token,userInfo,NginxInfo
    getBasicInfo({
      initGPSWebsocket,
      initAlarmWebsocket,
      initOnOffWebsocket
    } = {}) {
      const p1 = getNginxInfo().then(json => {
        if (json.code === '0') {
          this.ngixinfo = json.data;
          const { ip, port } = this.ngixinfo;
          const protocol = this.ngixinfo.protocal === 'https' ? 'wss' : 'ws';
          this.addr = `${protocol}://${ip}:${port}`;
          if (typeof initGPSWebsocket === 'function') {
            initGPSWebsocket();
          }
          if (typeof initOnOffWebsocket === 'function') {
            initOnOffWebsocket();
          }
        }
      });
      const p2 = getUserInfo().then(json => {
        if (json.code === '0') {
          this.userInfo = json.data;
        }
      });
      const p3 = getToken().then(json => {
        if (json.code === '0') {
          this.token = json.data;
        }
      });
      Promise.all([p1, p2, p3]).then(() => {
        if (typeof initAlarmWebsocket === 'function') {
          initAlarmWebsocket();
        }
      });
      getGS().then(json => {
        if (json.code === '0') {
          this.sg = json.data;
        }
      });
      // getMapConfig().then((json) => {
      //   if (json.code === '0') {
      //     this.mapconfig = json.data;
      //   }
      // });
    },
    // 获取报警
    getAlarmTree() {
      getAlarmTypeTree({ categories: [1, 2, 3, 4, 5, 6, 7] }).then(json => {
        if (json.code === '0') {
          const { data } = json;
          const arr = [];
          data.forEach(item => {
            arr.push({
              id: parseInt(item.id, 10),
              name: item.name
            });
            item.children.forEach(child => {
              arr.push({
                id: parseInt(child.id, 10),
                name: child.name
              });
            });
          });
          this.alarmArr = arr;
        } else {
          this.$message({
            type: 'error',
            message: this.$t('GetAlarmTreeError')
          });
        }
      });
    },
    // 根据eventType返回eventName
    transformAlarm(eventType) {
      const alarmName = this.alarmArr.filter(item => {
        if (eventType.indexOf('x') > -1) {
          return item.id === parseInt(eventType, 16);
        }
        return item.id === parseInt(eventType, 10);
      });
      return alarmName[0].name;
    }
  }
};
