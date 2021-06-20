<template>
  <intelligent-alarms default-approve-status="-1"></intelligent-alarms>
</template>
<script>
import IntelligentAlarms from '@/components/alarm/IntelligentAlarms';

export default {
  name: 'IntelligentAlarmReconsider',
  components: {
    IntelligentAlarms
  }
};
</script>
