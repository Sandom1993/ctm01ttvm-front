<template>
  <div id="print_day">
    <div
      v-for="(temp, key) in dayTableData"
      :key="key"
      style="height: 100%;width: 100%;page-break-after: always;"
    >
      <div style="display: flex;">
        <div
          v-for="(item, key) in items"
          :key="key"
          :style="
            `display: flex;align-items: center;justify-content: center;font-size: 14px;width: ${item.width};min-height: 40px;max-height: 80px;border: solid 1px #333;border-right: 0;border-left: 0;`
          "
        >
          {{ item.name }}
        </div>
      </div>
      <div v-for="(item, key) in temp" :key="key" style="display: flex;">
        <div
          v-for="(index, key) in getRowData(item)"
          :key="key"
          :style="`font-size: 14px;width: ${index.width};height: 40px;display: flex;align-items: center;justify-content: center;`"
        >
          {{ index.value }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DayStatistic',
  components: {},
  props: {
    dayTableData: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  data() {
    return {
      option: {},
      items: [
        { value: 0, width: '16%', name: '组织' },
        { value: 0, width: '6%', name: '报警数' },
        { value: 0, width: '6%', name: '处警率' },
        { value: 0, width: '6%', name: '短信数' },
        { value: 0, width: '6%', name: '车辆数' },
        { value: 0, width: '8%', name: '在线车辆数' },
        { value: 0, width: '8%', name: '车辆在线率' },
        { value: 0, width: '10%', name: '未定位车辆数' },
        { value: 0, width: '8%', name: '车辆定位率' },
        { value: 0, width: '8%', name: '下线车辆数' },
        { value: 0, width: '8%', name: '停运车辆数' },
        { value: 0, width: '10%', name: '无数据车辆数' }
      ]
    };
  },
  created() {},
  mounted() {},
  methods: {
    //  获取单行数据
    getRowData(data) {
      const arr = [
        { width: '16%', value: data.orgName, name: '组织' },
        { width: '6%', value: data.alarmNum, name: '报警数' },
        { width: '6%', value: data.broadcastRate, name: '处警率' },
        { width: '6%', value: data.messageNum, name: '短信数' },
        { width: '6%', value: data.vehicleNum, name: '车辆数' },
        { width: '8%', value: data.onlineVehicleNum, name: '在线车辆数' },
        { width: '8%', value: data.vehicleOnlineRate, name: '车辆在线率' },
        { width: '10%', value: data.noGpsVehicleNum, name: '未定位车辆数' },
        { width: '8%', value: data.vehicleGpsRate, name: '车辆定位率' },
        { width: '8%', value: data.offlineVehicleNum, name: '下线车辆数' },
        { width: '8%', value: data.outageVehicleNum, name: '停运车辆数' },
        { width: '10%', value: data.noDataVehicleNum, name: '无数据车辆数' }
      ];
      return [...arr];
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
