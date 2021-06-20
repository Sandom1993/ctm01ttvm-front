export default {
  'post|/ctm01ttvm-web/api/mock/resource/cameras/auth/queryCameraByVehicleIndexCode.do': options => {
    return {
      type: 0,
      code: '0',
      msg: 'SUCCESS',
      data: [
        {
          streamType: 0,
          cascadeCode: '0',
          latitude: '',
          name: 'Camera 01',
          indexCode: 'aa9a873fdc1a4249a46af62e06a3a803',
          recordLocation: '',
          cameraType: 0,
          longitude: '',
          status: 0
        }
      ]
    };
  },
  'post|/ctm01ttvm-web/api/map/findLastGps': option => {
    return {
      type: 0,
      code: '0',
      msg: 'SUCCESS',
      data: [
        {
          vehicleIndexCode: '740c18e8b5684f8aa7091795e7c6124b',
          vehicleLicensePlate: '浙1100000',
          deviceIndexCode: '424931779a2b440eb71a1bd520d13892',
          orgIndexCode: '197549e077234cc2876d5de4ba61be4f',
          orgName: '江干区',
          time: '2020-04-13T09:56:21.000+08:00',
          longitude: 43286256,
          latitude: 11016612,
          speed: 6000000,
          recordSpeed: null,
          driverSource: null,
          direction: 24300,
          satellites: 0,
          precision: 0,
          height: 1000,
          driverIndexCode: null,
          driverDTO: null,
          retransFlag: null,
          vehicleStatus: 3
        }
      ]
    };
  },
  'post|/ctm01ttvm-web/api/vehicle/findLastGps.do': options => {
    return {
      type: 0,
      code: '0',
      msg: 'SUCCESS',
      data: [
        {
          vehicleIndexCode: '7438353a252b4ba594913cf05fc3a06e',
          vehicleLicensePlate: '津A02107D',
          deviceIndexCode: '7cb8325fe436411192b4fd2afa8444ae',
          orgIndexCode: 'f8d1ff2bc01c4152811ef422d1fdb272',
          orgName: '天津市',
          time: '2020-04-21T16:28:46.000+08:00',
          longitude: 42245500,
          latitude: 14078491,
          speed: 0,
          recordSpeed: null,
          driverSource: null,
          direction: 17465,
          satellites: 0,
          precision: 0,
          height: -390,
          driverIndexCode: null,
          driverDTO: null,
          retransFlag: null,
          vehicleStatus: null
        }
      ]
    };
  }
};
