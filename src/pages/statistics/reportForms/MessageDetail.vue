<template>
    <h-layout class="statistics-page">
        <h-layout class="right-bar">
            <h-layout-header style="padding-bottom: 10px;">
                <div style="display: flex; padding: 6px 10px">
                    <div style="line-height: 32px">时间选择：</div>
                    <el-date-picker
                        v-model="dateRange"
                        type="daterange"
                        value-format="timestamp"
                        start-placeholder="开始时间"
                        end-placeholder="结束时间"
                        style="width: 20%; margin-right: 6px"
                        :picker-options="datePickerOptions"
                        :default-value="dateDefault"
                    />
                    <div style="line-height: 32px">组织选择：</div>
                    <drop-down-tree
                        ref="dropdownTree"
                        style="width: 20%; margin-right: 6px"
                        tree-type="1"
                        :is-need-filter="false"
                        :is-need-check-box="false"
                        @input="handleSelectOrg"
                    ></drop-down-tree>
                    <el-button type="primary" @click="query">查询</el-button>
                </div>
            </h-layout-header>

            <h-layout-content>
                <div ref="pageBox" class="page-box" style="height: 100%">
                <el-table
                    v-loading="loading"
                    :height="tableHeight - 96"
                    :data="tableData"
                >
                    <el-table-column label="序号" width="80">
                        <template slot-scope="scope">
                            {{ getIndex(scope.$index) }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="vehicleLicensePlate"
                        label="车牌号"
                        width="160"
                    ></el-table-column>
                    <el-table-column
                        prop="orgName"
                        label="所属单位"
                        width="230"
                    ></el-table-column>
                    <el-table-column
                        prop="content"
                        label="短信内容"
                        width="300"
                    ></el-table-column>
                </el-table>

                    <el-pagination
                        ref="pagination"
                        :page-sizes="[30, 50, 100]"
                        :page-size="pageSize"
                        :current-page="pageNo"
                        layout="total, sizes, prev, pager, next, jumper"
                        :total="total"
                        @size-change="onSizeChange"
                        @current-change="onCurrentChange"
                    ></el-pagination>
                </div>
            </h-layout-content>
        </h-layout>
    </h-layout>
</template>

<script>
// import VehicleTree from '@/components/Tree';
import DropDownTree from '../components/DropDownTree';
import {getOrgMessageDetail} from '@/api/statistics';
import {dateToMs, toTimezoneString} from '@/components/util.js';

const now = new Date();
now.setHours(0);
now.setMinutes(0);
now.setSeconds(0);
now.setMilliseconds(0);
// const endTime = now.getTime() + 24 * 60 * 60 * 1000 - 1;
const endTime = now.getTime() - 1; // update by chenying 2021.06.03

export default {
    // 车辆日在线率
    name: 'VehicleMonthOnline',
    components: {
        // VehicleTree
        DropDownTree
    },
    data() {
        return {
            pageNo: 1,
            pageSize: 30,
            total: 0,

            tableData:[],

            pickerOptions: {
                disabledDate(time) {
                    const now = new Date();
                    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                    return time.getTime() >= nextMonth.getTime();
                }
            },
            datePickerOptions: {
                disabledDate(time) {
                    return time.getTime() > endTime;
                },
                customValidation(start, end) {
                    return end.getTime() - start.getTime() <= 30 * 24 * 60 * 60 * 1000;
                },
                customPrompt: '选择时间范围不能超过31天'
            },
            dateRange: [],
            dateDefault:[],
            loading: false,
            days: [],
            tableHeight: null,
            orgIndexCode:'',
            orgName: '',
        };
    },

    mounted() {
        this.resize();

        // 路由跳转相关参数获取及设置
        // 初始化默认选中节点
        const {orgIndexCode, orgName, dayDate} = this.$route.query;

        const orgObj = {
            orgIndexCode: orgIndexCode,
            name: orgName
        }
        this.$refs.dropdownTree.setSelected([orgObj])

        this.$nextTick(() => {
            this.orgIndexCode = orgIndexCode;
            this.orgName = orgName;
            this.dateRange = [dateToMs(dayDate), dateToMs(dayDate)]
            this.dateDefault = [dayDate, dayDate]
            this.query();
        })
    },
    created() {
    },
    methods: {
        onSizeChange(pageSize) {
            this.pageSize = pageSize;
            this.query();
        },
        onCurrentChange(pageNo) {
            this.pageNo = pageNo;
            this.query();
        },
        getIndex(index) {
            return (this.pageNo - 1) * this.pageSize + index + 1;
        },
        query() {
            if (!this.checkParams()) {
                return;
            }
            this.loading = true;
            const params = {
                pageSize: this.pageSize,
                pageNo: this.pageNo,
                beginTime: toTimezoneString(this.dateRange[0]),
                endTime: toTimezoneString(
                    this.dateRange[1] + 24 * 60 * 60 * 1000 - 1
                ),
                orgIndexCode: this.orgIndexCode,
                orgName: this.orgName,
            };
            getOrgMessageDetail(params).then( res => {
                if (res.code === '0') {
                    this.tableData = res.data.list;
                    if (res.data.total !== null ) {
                        this.total = res.data.total;
                    } else {
                        this.total = 0;
                        this.tableData = [];
                    }
                }
                this.loading = false;
            });
            this.loading = false;
        },
        resize() {
            this.tableHeight = this.$refs.pageBox.clientHeight ;
        },
        checkParams() {
            if (this.dateRange.length === 0) {
                this.$message.warning('请选择时间');
                return false;
            }
            if (this.orgIndexCode === undefined || this.orgIndexCode.length === 0) {
                this.$message.warning('请选择组织');
                return false;
            }
            return true;
        },
        //  选择组织
        handleSelectOrg(node) {
            this.orgName = node[0].name;
            this.orgIndexCode = node[0].indexCode;
        },
    }
};
</script>

<style src="@/pages/statistics/statistics.scss" lang="scss"></style>
<style>
.page-box{padding-top:15px;}
</style>
