import { downloadExcel } from '@/core/httpInstance';

export default {
  data() {
    return {
      defaultDateRange: null,
      alarmParams: null,
      exportDialogVisible: false,
      exportStartPage: 1,
      exportEndPage: 1,
      maxExportPage: 1
    };
  },
  created() {
    const beginTime = new Date();
    beginTime.setHours(0);
    beginTime.setMinutes(0);
    beginTime.setSeconds(0);
    beginTime.setMilliseconds(0);
    const endTime = new Date(beginTime.getTime() + 24 * 60 * 60 * 1000 - 1);
    this.form.dateRange = [beginTime, endTime];
    this.defaultDateRange = [beginTime, endTime];
  },

  methods: {
    onSearchYesterday() {
      const now = new Date();
      const yesterday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1
      );
      const endTime = new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1);
      this.form.dateRange = [yesterday, endTime];
      this.onSearch();
    },
    onExportAlarm() {
      if (this.total === 0) {
        this.$message.warning('请先查询数据再导出');
        return;
      }
      this.maxExportPage = Math.floor(this.total / this.pageSize) + 1;
      this.exportDialogVisible = true;
      this.exportStartPage = this.pageNo;
      this.exportEndPage = this.pageNo;
    },
    exportAlarm() {
      if (this.exportStartPage > this.exportEndPage) {
        this.$message.warning('导出开始页数不能大于结束页数');
        return;
      }
      downloadExcel(
        `/${process.env.VUE_APP_CONTEXT}/alarm/exportAlarmPage.do`,
        {
          params: JSON.stringify({
            ...this.alarmParams,
            beginPage: this.exportStartPage,
            endPage: this.exportEndPage,
            type: this.type,
            viewType: this.isRealtime ? 0 : 1
          })
        }
      );
      this.exportDialogVisible = false;
    },
    getCurrentTable() {
      return this.$refs[this.activeName + 'Table'].$refs.table;
    },
    onSelectAll() {
      const table = this.getCurrentTable();
      table.getData().forEach(row => {
        table.toggleRowSelection(row, true);
      });
    }
  }
};
