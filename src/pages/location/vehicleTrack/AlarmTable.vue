<template>
    <div class="alarm-table-wrap">
        <div class="table-wrap">
            <el-table
                :data="tableData"
                force-scroll
                highlight-current-row
                @row-click="rowClick"
            >

                <el-table-column prop="time" label="报警时间">
                    <template slot-scope="scope">
                        {{
                            new Date(scope.row.beginTime).toLocaleDateString() +
                            ' ' +
                            new Date(scope.row.beginTime).toTimeString().substr(0, 8)
                        }}
                    </template>
                </el-table-column>
                <el-table-column prop="levelName" label="警情级别">
                    <template slot-scope="scope">
                        <span class="square" :class="scope.row.level"></span>
                        {{
                            scope.row.levelName === '一般'
                                ? '一级'
                                : scope.row.levelName === '严重'
                                ? '三级'
                                : scope.row.levelName === '较重'
                                    ? '二级' : '等级有误'
                        }}
                    </template>
                </el-table-column>
                <el-table-column
                    prop="eventTypeName"
                    label="报警名称"
                ></el-table-column>
            </el-table>
        </div>
    </div>
</template>
<script>
export default {
    name: 'AlarmTable',
    props: {
        tableData: {
            type: Array,
            default: () => []
        }
    },
    methods: {
        rowClick(row) {
            row.longitude = row.beginLongitude;
            row.latitude = row.beginLatitude;
            this.$emit('alarmTableClick', row);
        }
    }
};
</script>

<style lang="scss" scoped>
.alarm-table-wrap {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .table-wrap {
        height: 0;
        flex: 1;
        padding-top: 8px;

        .square {
            display: inline-block;
            width: 12px;
            height: 12px;
        }

        .h {
            background-color: #e22533;
        }

        .m {
            background-color: #f89a1a;
        }

        .l {
            background-color: #3288f0;
        }

        .w {
            background-color: #a39e9d;
        }
    }
}
</style>
