<template>
  <h-page-container class="wrapper">
    <h-layout>
      <router-view class="location-wrap"></router-view>
    </h-layout>
  </h-page-container>
</template>
<script>
import '@/pages/location/mapreset.css';

export default {
  name: 'IntelligentVideo',
  data() {
    return {
      menus: [
        {
          name: '监控管理',
          route: '/intelligentVideo/monitor'
        },
        {
          name: '实时警情',
          route: '/intelligentVideo/realtimeAlarms'
        },
        {
          name: '警情复议',
          route: '/intelligentVideo/alarmReconsider'
        },
        {
          name: '警情审核',
          route: '/intelligentVideo/alarmAudit'
        }
      ]
    };
  }
};
</script>

<style lang="scss" scoped>
.slidebar {
  background: #fafbfc;
  box-shadow: 1px 0 0 0 #e3e4e6;
}
.slidebar ::v-deep {
  .h-page-sidebar {
    padding: 0;
  }
  .h-page-sidebar__main {
    padding: 0;
  }
  .h-page-sidebar__main--content {
    padding-right: 0;
  }
}

.menu-item {
  position: relative;
  text-align: center;
  cursor: pointer;
  padding: 6px 0;
  color: rgba(0, 0, 0, 0.5);
  &.router-link-active {
    color: rgba(0, 0, 0, 0.7);
    background: #eeeff0;
    &::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 3px;
      background: #2080f7;
    }
  }
}

.menu-icon {
  font-size: 24px;
}

.menu-name {
  font-size: 12px;
}
</style>
