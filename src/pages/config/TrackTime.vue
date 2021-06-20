<template>
  <simple-config
    :type="2"
    label="报警轨迹回放时长（分钟）"
    crumb="报警轨迹回放配置"
    :max-value="60"
  ></simple-config>
</template>

<script>
import SimpleConfig from '@/pages/config/SimpleConfig';

export default {
  name: 'TrackTime',
  components: {
    SimpleConfig
  }
};
</script>
