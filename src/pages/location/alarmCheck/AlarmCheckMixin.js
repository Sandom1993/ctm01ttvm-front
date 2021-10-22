import {downloadExcel} from '@/core/httpInstance';

export default {
    data() {
        return {
            alarmParams: null,
            exportDialogVisible: false,
            exportStartPage: 1,
            exportEndPage: 1,
            maxExportPage: 1
        };
    },
    created() {
    },

    methods: {
        // onExportAlarm() {
        //     if (this.total === 0) {
        //         this.$message.warning('请先查询数据再导出');
        //         return;
        //     }
        //     this.maxExportPage = Math.floor(this.total / this.pageSize) + 1;
        //     this.exportDialogVisible = true;
        //     this.exportStartPage = this.pageNo;
        //     this.exportEndPage = this.pageNo;
        // },
        onExportAlarm() {
            // exportAlarm 修改成 ==> onExportAlarm
            // update by chenying 2021.10.22
            if (this.total === 0) {
                this.$message.warning('请先查询数据再导出');
                return;
            }
            this.exportStartPage = 1;
            this.exportEndPage = Math.floor(this.total / this.pageSize);
            // if (this.exportStartPage > this.exportEndPage) {
            //   this.$message.warning('导出开始页数不能大于结束页数');
            //   return;
            // }
            downloadExcel(
                `/${process.env.VUE_APP_CONTEXT}/alarm/exportAlarmPage.do`,
                {
                    params: JSON.stringify({
                        ...this.alarmParams,
                        beginPage: this.exportStartPage,
                        endPage: this.exportEndPage,
                        type: this.queryParams.type,
                        viewType: 1
                    })
                }
            );
            this.exportDialogVisible = false;
        }
        // getCurrentTable() {
        //   return this.$refs[this.activeName + 'Table'].$refs.table;
        // },
        // onSelectAll() {
        //   const table = this.getCurrentTable();
        //   table.getData().forEach(row => {
        //     table.toggleRowSelection(row, true);
        //   });
        // }
    }
};
