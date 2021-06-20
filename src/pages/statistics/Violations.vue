<template>
  <violation :alarm-types="alarmTypes"></violation>
</template>

<script>
import Violation from '@/pages/statistics/Violation';

export default {
  // 违规统计
  name: 'Violations',
  components: {
    Violation
  },
  data() {
    return {
      alarmTypes: [
        {
          key: 132405,
          label: '超速报警'
        },
        {
          key: 132424,
          label: '凌晨禁行'
        },
        {
          key: 131330,
          label: '视频遮挡'
        },
        {
          key: 132409,
          label: '进区域'
        },
        {
          key: 132408,
          label: '出区域'
        },
        {
          key: 225442,
          label: '连续驾车超时'
        },
        {
          key: 225443,
          label: '连续驾车超市预警'
        },
        {
          key: 132418,
          label: '偏离线路报警'
        },
        // {
        //   key: 132419,
        //   label: '区域内超速'
        // },
        {
          key: 132421,
          label: '超时停车'
        }
      ]
    };
  }
};
</script>
