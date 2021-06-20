<template>
  <location-alarms :type="3" default-approve-status="-1"></location-alarms>
</template>
<script>
import LocationAlarms from '@/components/alarm/LocationAlarms';

export default {
  name: 'TraditionaltrAlarmAudit',
  components: {
    LocationAlarms
  }
};
</script>
