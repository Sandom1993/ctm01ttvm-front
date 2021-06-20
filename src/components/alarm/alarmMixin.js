import alarmUtils from '@/utils/alarm';

export default {
  data() {
    return {
      broadcastVehicles: [],
      broadcastAlarms: [] // 批量处警的报警
    };
  },

  methods: {
    onBatchDealAlarms(table) {
      const selection = this.$refs[table].$refs.table.selection;
      if (selection.length === 0) {
        this.$msgbox({
          title: '提示',
          type: 'warning',
          message: '请先选择要处理的报警'
        });
        return;
      }
      const vehicles = [];
      selection.forEach(selection => {
        const vehicle = vehicles.find(
          item => item.vehicleIndexCode === selection.vehicleIndexCode
        );
        if (!vehicle) {
          vehicles.push({
            plateNo: selection.vehicleLicensePlate,
            vehicleIndexCode: selection.vehicleIndexCode
          });
        }
      });
      this.broadcastAlarms = selection;
      this.broadcastVehicles = vehicles;
      this.$refs.BroadcastDialog.openDialog();
    },
    dealAlarm(alarm) {
      this.broadcastVehicles = [
        {
          plateNo: alarm.vehicleLicensePlate,
          vehicleIndexCode: alarm.vehicleIndexCode
        }
      ];
      this.broadcastAlarms = [alarm];
      this.$refs.BroadcastDialog.openDialog();
    },
    onSaveMessageLabelSuccess(payload) {
      payload.eventIds.forEach(eventId => {
        const alarm = this.allAlarms.find(item => item.eventId === eventId);
        if (alarm) {
          const keys = ['broadcast', 'message', 'dealPerson', 'dealTime'];
          alarmUtils.replaceLabels(alarm, keys, payload.label);
        }
      });
    }
  }
};
