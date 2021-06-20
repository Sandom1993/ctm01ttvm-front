<template>
  <location-alarms default-approve-status="-1"></location-alarms>
</template>
<script>
import LocationAlarms from '@/components/alarm/LocationAlarms';

export default {
  name: 'AlarmReconsider',
  components: {
    LocationAlarms
  }
};
</script>
