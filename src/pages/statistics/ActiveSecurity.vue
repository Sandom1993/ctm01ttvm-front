<template>
  <violation :alarm-types="alarmTypes" type="2"></violation>
</template>

<script>
import Violation from '@/pages/statistics/Violation';

export default {
  // 违规统计
  name: 'ActiveSecurity',
  components: {
    Violation
  },
  data() {
    return {
      alarmTypes: [
        {
          key: 132353,
          label: '前向碰撞预警'
        },
        {
          key: 132354,
          label: '前向碰撞'
        },
        {
          key: 132355,
          label: '车道偏离（左）预警'
        },
        {
          key: 132356,
          label: '车道偏离（左）'
        },
        {
          key: 132357,
          label: '车道偏离（右）预警'
        },
        {
          key: 132358,
          label: '车道偏离（右）'
        },
        {
          key: 132359,
          label: '车距过近预警'
        },
        {
          key: 132360,
          label: '车距过近'
        },
        {
          key: 132361,
          label: '行人防撞预警'
        },
        {
          key: 132368,
          label: '行人防撞'
        },
        {
          key: 225409,
          label: '频繁变道预警'
        },
        {
          key: 225413,
          label: '频繁变道'
        },
        {
          key: 225414,
          label: '障碍物预警'
        },
        {
          key: 225415,
          label: '障碍物'
        },
        {
          key: 225416,
          label: '驾驶辅助功能失效'
        },
        {
          key: 132370,
          label: '疲劳驾驶预警'
        },
        {
          key: 132371,
          label: '疲劳驾驶'
        },
        {
          key: 132374,
          label: '接打手持电话'
        },
        {
          key: 132375,
          label: '抽烟'
        },
        {
          key: 132372,
          label: '长时间不目视前方预警'
        },
        {
          key: 132373,
          label: '长时间不目视前方'
        },
        {
          key: 225300,
          label: '双手同时脱离方向盘预警'
        },
        {
          key: 225282,
          label: '双手同时脱离方向盘'
        },
        {
          key: 132377,
          label: '驾驶员变更'
        },
        {
          key: 132405,
          label: '超速预警'
        },
        {
          key: 132406,
          label: '超速报警'
        },
        {
          key: 132386,
          label: '后方接近报警'
        },
        {
          key: 132384,
          label: '左侧后方接近预警'
        },
        {
          key: 132385,
          label: '右侧后方接近预警'
        },
        {
          key: 132387,
          label: '急加速报警'
        },
        {
          key: 132388,
          label: '急减速报警'
        },
        {
          key: 132389,
          label: '急转弯报警（左）'
        },
        {
          key: 132390,
          label: '急转弯报警（右）'
        },
        {
          key: 225430,
          label: '怠速报警'
        },
        {
          key: 225431,
          label: '异常熄火报警'
        },
        {
          key: 225288,
          label: '空挡滑行预警'
        },
        {
          key: 225289,
          label: '空挡滑行'
        },
        {
          key: 225432,
          label: '发动机超转报警'
        }
      ]
    };
  }
};
</script>
