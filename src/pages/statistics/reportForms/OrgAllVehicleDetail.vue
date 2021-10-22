<template>
    <h-page-container style="padding: 10px;">
        <h-layout>
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
                    <el-button type="primary" @click="handleQuery">查询</el-button>
                </div>
            </h-layout-header>
            <h-layout-content style="overflow: auto;">
                <div ref="pageBox" class="table-box">
                    <el-table
                        v-loading="tableLoading"
                        :data="tableData"
                        :height="tableHeight - 56"
                        style="width: 100%"
                    >
                        <el-table-column type="index" label="序号" width="60"></el-table-column>
                        <el-table-column prop="orgName" label="组织" width="180"/>
                        <el-table-column prop="name" label="车牌号" width="180"/>
                        <el-table-column prop="createTime" label="开始时间" width="180"/>
                        <el-table-column prop="updateTime" label="更新时间" width="180"/>
<!--                        <el-table-column prop="updateTime" show-overflow-tooltip label="更新时间"/>-->
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
    </h-page-container>
</template>

<script>
import DropDownTree from '../components/DropDownTree';
import {dateToMs, toTimezoneString} from '@/components/util.js';
import {pageOrgAll} from '@/api/statistics.js'

const now = new Date();
now.setHours(0);
now.setMinutes(0);
now.setSeconds(0);
now.setMilliseconds(0);
// const endTime = now.getTime() + 24 * 60 * 60 * 1000 - 1;
const endTime = now.getTime() - 1; // update by chenying 2021.06.03

export default {
    name: 'OrgAnalysis',
    components: {
        DropDownTree
    },
    data() {
        return {
            pageNo: 1,
            pageSize: 30,
            total: 0,

            tableLoading: false,

            orgIndexCode: '',
            orgName: '',

            tableData: [],
            tableHeight: null,
            tableWidth: null,
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
            dateDefault: [],
            pickerOptions: {
                disabledDate(time) {
                    return time.getTime() > Date.now() - 24 * 60 * 60 * 1000;
                }
            },
        };
    },
    created() {
    },
    mounted() {
        this.resize();
        window.addEventListener('resize', this.resize);

        // 路由跳转相关参数获取及设置
        // 初始化默认选中节点
        const {orgIndexCode, orgName, beginTime, endTime} = this.$route.query;

        const orgObj = {
            orgIndexCode: orgIndexCode,
            name: orgName
        }
        this.$refs.dropdownTree.setSelected([orgObj])

        this.$nextTick(() => {
            this.orgIndexCode = orgIndexCode;
            this.orgName = orgName;
            this.dateRange = [dateToMs(beginTime), dateToMs(endTime)]
            this.dateDefault = [beginTime, beginTime]
            this.handleQuery();
        })
    },
    destroyed() {
        window.removeEventListener('resize', this.resize);
    },
    methods: {
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
        handleQuery() {
            // console.log(this.orgIndexCode)
            if (!this.checkParams()) {
                return;
            }
            this.tableLoading = true;

            const params = {
                pageNo: this.pageNo,
                pageSize: this.pageSize,
                beginTime: toTimezoneString(this.dateRange[0]),
                endTime: toTimezoneString(
                    this.dateRange[1] + 24 * 60 * 60 * 1000 - 1
                ),
                orgIndexCode: this.orgIndexCode,
                orgName: this.orgName,
            }
            pageOrgAll(params).then(res => {
                if (res.code === '0') {
                    this.total = res.data.total;
                    this.tableData = res.data.list;

                    this.tableLoading = false;
                }
            }).catch( () => {
                this.tableLoading = false;
            });
        },

        onSizeChange(pageSize) {
            this.pageSize = pageSize;
            this.handleQuery();
        },
        onCurrentChange(pageNo) {
            this.pageNo = pageNo;
            this.handleQuery();
        },
        resize() {
            this.tableHeight = this.$refs.pageBox.clientHeight;
            this.tableWidth = this.$refs.pageBox.clientWidth;
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
<style lang="scss" scoped>
::v-deep {

}

.table-box {
    height: 100%;
    width: 100%;
}

.statistics-page .right-bar {
    padding-left: 8px !important;
    background-clip: initial;
}
</style>
