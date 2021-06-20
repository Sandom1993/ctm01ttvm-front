<template>
  <simple-config
    :type="1"
    label="车辆长时间离线时长（天）"
    crumb="长时间离线配置"
    :max-value="10"
  ></simple-config>
</template>

<script>
import SimpleConfig from '@/pages/config/SimpleConfig';

export default {
  name: 'LongOffline',
  components: {
    SimpleConfig
  }
};
</script>
