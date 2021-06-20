import { queryCameraByVehicleIndexCode } from '@/api/tree.js';
import { startapp } from '@/components/checkTools.js';
import { findAbilityDevicesByVehicle } from '@/api/location';

export default {
  methods: {
    // 视频预览
    getVehicleCameraChannels(vehicleIndexCode) {
      queryCameraByVehicleIndexCode({
        vehicleIndexCode
      }).then(json => {
        if (json.code === '0') {
          let cameraIndexCodes = json.data.map(item => {
            if (item.streamType) {
              return `${item.indexCode}+${item.streamType}`;
            }
            return `${item.indexCode}`;
          });
          if (cameraIndexCodes.length === 0) {
            this.$message({
              type: 'warning',
              message: '该车辆没有配置监控点 或 监控点没有权限'
            });
            return;
          }
          let WndCount = 1;
          if (cameraIndexCodes.length > 1) {
            WndCount = 4;
          }
          if (cameraIndexCodes.length > 4) {
            WndCount = 9;
          }
          if (cameraIndexCodes.length > 9) {
            cameraIndexCodes = cameraIndexCodes.slice(0, 9);
          }
          const videoURL =
            cameraIndexCodes.length === 0
              ? 'btoolpplayerprotocol://'
              : 'btoolpplayerprotocol://ReqType:PlayReal;language:zh_CN;clear:2;' +
                `WndCount:${WndCount};` +
                `NginxIp:${this.ngixinfo.ip};` +
                `NginxPort:${this.ngixinfo.port};` +
                `UserID:${this.userInfo.userId};` +
                `sg:${this.sg};` +
                `protocol:${this.ngixinfo.protocal};` +
                `CamList:${cameraIndexCodes.join(',')};` +
                'appType:vas;gridtrack:1;';
          startapp(
            'btoolpplayerprotocol',
            `${this.ngixinfo.protocal}://${this.ngixinfo.ip}:${this.ngixinfo.port}`,
            videoURL
          );
        }
      });
    },

    // 获取语音对讲设备
    getTalkDevice(id) {
      return new Promise(resolve => {
        findAbilityDevicesByVehicle({
          vehicleIndexCode: id
        }).then(json => {
          resolve(json.data.voicetalk || '');
        });
      });
    },

    // 语音对讲
    talkReal(vehicleIndexCode, deviceIndexCode, vehicleLicensePlate) {
      const linkVoiceHref =
        'btoolvoicetalkprotocol://protocol:https;' +
        `NginxIp:${this.ngixinfo.ip};` +
        `NginxPort:${this.ngixinfo.port};` +
        `UserID:${this.userInfo.userId};` +
        `sg:${this.sg};` +
        `DevIndex:${deviceIndexCode};` +
        `DisPlayInfo:${encodeURI(vehicleLicensePlate)};` +
        'Language:zh_CN;';
      startapp(
        'btoolvoicetalkprotocol',
        `${this.ngixinfo.protocal}://${this.ngixinfo.ip}:${this.ngixinfo.port}`,
        linkVoiceHref
      );
    }
  }
};
