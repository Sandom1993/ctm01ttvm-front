<template>
  <location-alarms is-realtime></location-alarms>
</template>
<script>
import LocationAlarms from '@/components/alarm/LocationAlarms';

export default {
  name: 'RealtimeAlarms',
  components: {
    LocationAlarms
  }
};
</script>
