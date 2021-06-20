<template>
  <location-alarms
    :default-approve-status="defaultApproveStatus"
  ></location-alarms>
</template>
<script>
import LocationAlarms from '@/components/alarm/AllAlarms';

export default {
  name: 'AllAlarmAudit',
  components: {
    LocationAlarms
  },
  props: {
    defaultApproveStatus: {
      type: String,
      default: ''
    }
  }
};
</script>
