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
                        style="width: 24%; margin-right: 6px"
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
                    force-scroll
                    v-loading="loading"
                    :height="tableHeight - 96"
                    :data="tableData.slice( (currentPage-1) * pageSize,currentPage * pageSize)"
                    >
                        <el-table-column width="60" label="序号" fixed>
                            <template slot-scope="scope">
                                {{ getIndex(scope.$index) }}
                            </template>
                        </el-table-column>

                        <el-table-column
                            prop="vehicleLicensePlate"
                            label="车牌号"
                            min-width="160"
                            fixed
                        ></el-table-column>

                        <el-table-column
                            prop="orgName"
                            label="所属单位"
                            fixed
                            min-width="180"
                        ></el-table-column>
    <!--                    <el-table-column-->
    <!--                        prop="onlineTime"-->
    <!--                        label="在线时长（分）"-->
    <!--                        fixed-->
    <!--                        width="160"-->
    <!--                    ></el-table-column>-->
                        <el-table-column
                            prop="onlineRate"
                            label="上线率"
                            fixed
                            min-width="100"
                        >
                            <template slot-scope="scope">
<!--                                <span v-if="scope.row.onlineRate > 0 ">-->
<!--                                    {{ (scope.row.onlineRate * 100).toFixed(2) }} {{ (scope.row.onlineRate * 100).toFixed(2) ? '%' : '' }}-->
<!--                                </span>-->
<!--                                <span v-else>{{ scope.row.onlineRate }}</span>-->
                                <span>{{ (scope.row.onlineRate * 100).toFixed(2) }} {{ (scope.row.onlineRate * 100).toFixed(2) ? '%' : '' }}</span>
                            </template>
                        </el-table-column>

                        <el-table-column
                            prop="onlineDays"
                            label="上线天数"
                            fixed
                            min-width="100"
                        ></el-table-column>

                        <el-table-column
                            v-for="day of days"
                            :key="day"
                            prop="orgName"
                            :label="day"
                            width="64"
                        >
                            <template slot-scope="scope">
                                <i
                                    v-if="scope.row.vehicleOnlineDetail[day]"
                                    class="h-icon-done"
                                    style="color: #2080F7;"
                                ></i>
                                <i
                                    v-else
                                    class="h-icon-close_sm"
                                    style="color: #E72528;"
                                ></i>
                            </template>
                        </el-table-column>
                    </el-table>

                    <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="currentPage"
                    :page-size="pageSize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="tableData.length"
                >
                </el-pagination>
                </div>
            </h-layout-content>
        </h-layout>
    </h-layout>
</template>

<script>
// import VehicleTree from '@/components/Tree';
import DropDownTree from '../components/DropDownTree';
import {getOrgOnlineVehicleDetail,getOrgOffVehicleDetail} from '@/api/statistics';
import {dateToMs, msToDate, toTimezoneString} from '@/components/util.js';

const now = new Date();
now.setHours(0);
now.setMinutes(0);
now.setSeconds(0);
now.setMilliseconds(0);
// const endTime = now.getTime() + 24 * 60 * 60 * 1000 - 1;
const end = now.getTime() - 1; // update by chenying 2021.06.03

export default {
    // 车辆日在线率
    name: 'VehicleMonthOnline',
    components: {
        // VehicleTree
        DropDownTree
    },
    data() {
        return {
            pageSize: 30, //每页多少条
            tableData:[],
            currentPage: 1, // 当前页

            pickerOptions: {
                disabledDate(time) {
                    const now = new Date();
                    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
                    return time.getTime() >= nextMonth.getTime();
                }
            },
            datePickerOptions: {
                disabledDate(time) {
                    return time.getTime() > end;
                },
                customValidation(start, end) {
                    return end.getTime() - start.getTime() <= 30 * 24 * 60 * 60 * 1000;
                },
                customPrompt: '选择时间范围不能超过31天'
            },
            dateRange: [],
            dateDefault: [],
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
        const {orgIndexCode, orgName, beginTime, endTime } = this.$route.query;

        const orgObj = {
            orgIndexCode: orgIndexCode,
            name: orgName
        }
        this.$refs.dropdownTree.setSelected([orgObj])

        this.$nextTick(() => {
            this.orgIndexCode = orgIndexCode;
            this.orgName = orgName;
            this.dateRange = [dateToMs(beginTime), dateToMs(endTime)];
            this.dateDefault = [beginTime, endTime];
            this.query();
        })
    },
    methods: {
        // 每页多少条
        handleSizeChange(val) {
            this.pageSize = val;
        },
        handleCurrentChange(val) {
            this.currentPage = val;
        },
        getIndex(index) {
            return (this.currentPage - 1) * this.pageSize + index + 1;
        },
        query() {
            if (!this.checkParams()) {
                return;
            }
            const params = {
                beginTime: toTimezoneString(this.dateRange[0]),
                endTime: toTimezoneString(
                    this.dateRange[1] + 24 * 60 * 60 * 1000 - 1
                ),
                orgIndexCode: this.orgIndexCode,
                orgName: this.orgName,
            };
            this.loading = true;
            if (this.$route.query.type === '1') {
                // 上线车辆
                getOrgOnlineVehicleDetail(params).then( res => {
                    if (res.code === '0' && res.data !== null ) {
                        this.tableData = res.data;
                        if (this.tableData.length > 0) {
                            this.days = Object.keys(res.data[0].vehicleOnlineDetail);
                        } else {
                            this.days = [];
                        }
                    } else {
                        this.tableData = [];
                    }
                    this.loading = false;
                }).catch( ()=> {
                    this.loading = false;
                });
            } else if (this.$route.query.type === '2') {
                // 未上线车辆
                getOrgOffVehicleDetail(params).then( res => {
                    if (res.code === '0' && res.data !==null ) {
                        this.tableData = res.data;
                        if (this.tableData.length > 0) {
                            this.days = Object.keys(res.data[0].vehicleOnlineDetail);
                        } else {
                            this.days = [];
                        }
                    } else {
                        this.tableData = [];
                    }
                    this.loading = false;
                }).catch( ()=> {
                    this.loading = false;
                });
            }
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
