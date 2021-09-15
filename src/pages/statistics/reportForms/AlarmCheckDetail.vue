<template>
    <h-page-container>
        <h-layout>
            <div ref="pageBox" class="page-box">
                <div class="page-header">
                    <el-button icon="h-icon-export" @click="onExportAlarm">
                        导出
                    </el-button>
                </div>

                <div id="pageSearch" class="page-search">
                    <el-row :gutter="16">
                        <el-col :span="5">

                            <div class="search-item">
                                <div style="line-height: 32px">报警类型：</div>
                                <el-select
                                    v-model="eventTypes"
                                    filterable
                                    multiple
                                    clearable
                                    collapse-tags
                                    placeholder="请选择报警类型"
                                >
                                    <el-option
                                        v-for="item in alarmTypes"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    />
                                </el-select>
                            </div>

                        </el-col>
                        <el-col :span="5">
                            <div class="search-item">
                                <div style="line-height: 32px">时间选择：</div>
                                    <el-date-picker
                                        v-model="dateRange"
                                        type="daterange"
                                        value-format="timestamp"
                                        start-placeholder="开始时间"
                                        end-placeholder="结束时间"
                                        :picker-options="datePickerOptions"
                                        :default-value="dateDefault"
                                        range-separator=" ~ "
                                    />
                            </div>
                        </el-col>
                        <el-col :span="5">
                            <div class="search-item">
                                <div style="line-height: 32px">组织选择：</div>
                                <drop-down-tree
                                    ref="dropdownTree"
                                    tree-type="1"
                                    :is-need-filter="false"
                                    :is-need-check-box="false"
                                    @input="handleSelectOrg"
                                ></drop-down-tree>
                            </div>
                        </el-col>

                        <el-col :span="3">
                            <div class="search-btn">
                                <el-button type="primary" @click="query">查询</el-button>
                            </div>
                        </el-col>
                    </el-row>
                </div>

                <div class="table-wrap">
                    <el-table
                    force-scroll
                    :height="tableHeight - 196"
                    :data="tableData"
                    ref="tabref"
                    stripe
                    v-loading="loading"
                    enable-virtual-scroll
                    @selection-change="handleSelectionChange"
                    :row-class-name="tableRowClassName"
                >
<!--                    <el-table-column type="selection" :selectable="selectable"/>-->
                    <el-table-column
                        prop="vehicleLicensePlate"
                        label="车牌号码"
                        width="100"
                    />
                    <el-table-column prop="beginTime" label="开始时间" width="152">
                        <template slot-scope="scope">
                            {{ getDateTime(scope.row.beginTime) }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="endTime" label="结束时间" width="152">
                        <template slot-scope="scope">
                            {{ getDateTime(scope.row.endTime) }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="continueTime"
                        label="持续时间"
                        width="80"
                        show-overflow-tooltip
                    >
                        <template slot-scope="scope">
                            {{ scope.row.continueTime | formatSeconds }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="eventTypeName"
                        label="报警名称"
                        width="150"
                        show-overflow-tooltip
                    />
                    <el-table-column prop="level" label="报警级别" width="80">
                        <template slot-scope="scope">
                            <s-table-type
                                :text="scope.row.level"
                                :list="ALARM_LEVEL"
                                type="iconSpan"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column prop="speed" label="定位速度" width="100">
                        <template slot-scope="scope">
                            {{ scope.row.speed + ' km/h' }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="maxSpeed" label="最高速度" width="100">
                        <template slot-scope="scope">
                            {{ scope.row.maxSpeed + ' km/h' }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="pulseSpeed" label="脉冲速度" width="100">
                        <template slot-scope="scope">
                            {{
                                (scope.row.pulseSpeed ? scope.row.pulseSpeed : 0) + ' km/h'
                            }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="value3" label="限速" width="100">
                        <template slot-scope="scope">
                            {{
                                (scope.row.limitSpeed ? scope.row.limitSpeed : 0) + ' km/h'
                            }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="orgName"
                        label="所属单位"
                        width="150"
                        show-overflow-tooltip
                    />
                    <el-table-column prop="checkPerson" label="核警人" width="80"/>
                    <el-table-column prop="checkTime" label="核警时间" width="152"/>
                    <el-table-column label="处警人" width="80" show-overflow-tooltip>
                        <template slot-scope="scope">
                            {{ getLabelValueByKey(scope.row, 'dealPerson') }}
                        </template>
                    </el-table-column>
                    <el-table-column label="处警时间" width="152">
                        <template slot-scope="scope">
                            {{ getLabelValueByKey(scope.row, 'dealTime') }}
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="alarmRemark"
                        label="核警备注"
                        width="100"
                        show-overflow-tooltip
                    />
                    <el-table-column prop="valid" label="核定状态" width="80"/>
                    <el-table-column
                        prop="address"
                        label="地图坐标"
                        width="140"
                        show-overflow-tooltip
                    >
                        <template slot-scope="scope">
                            <el-button
                                v-if="!scope.row.addressInfo"
                                type="text"
                                size="mini"
                                style="color: #2196F3"
                                @click="handleAnalysis(scope.$index, scope.row)"
                            >
                                解析
                            </el-button>
                            <span v-else>{{ scope.row.addressInfo }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="action"
                        label="操作"
                        width="100"
                        fixed="right"
                    >
                        <template slot-scope="scope">

                            <!-- update by chenying 2021.05.21 -->
                            <el-button
                                type="text"
                                size="mini"
                                style="color: #2196F3"
                                :disabled="getClick(scope.row)"
                                @click="handleTrack(scope.row)"
                            >
                                轨迹
                            </el-button>
                            <el-button
                                type="text"
                                size="mini"
                                style="color: #2196F3"
                                :disabled="getClick(scope.row)"
                                @click="handleDetail(scope.row)"
                            >
                                详情
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
                    <info-slider
                        :height="tableHeight - 196"
                        :class="{ 'info-slider': 1, 'info-slider-close': !sliderShow }"
                        :info="sliderInfo"
                        @close="sliderClose"
                    ></info-slider>
                </div>
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
            <el-dialog
                title="导出"
                :visible.sync="exportDialogVisible"
                :area="480"
                top="middle"
                class="export-dialog"
            >
                <div style="display: flex; align-items: center;justify-content: center">
                    <div>
                        从第
                        <el-input-number
                            v-model="exportStartPage"
                            :min="1"
                            :max="maxExportPage"
                        ></el-input-number>
                        页
                    </div>
                    <div style="margin:0 10px;">到</div>
                    <div>
                        第
                        <el-input-number
                            v-model="exportEndPage"
                            :min="1"
                            :max="maxExportPage"
                        ></el-input-number>
                        页
                    </div>
                </div>
                <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="exportAlarm">
            确 定
          </el-button>
          <el-button @click="exportDialogVisible = false">取 消</el-button>
        </span>
            </el-dialog>
        </h-layout>
    </h-page-container>
</template>

<script>
// import VehicleTree from '@/components/Tree';
import DropDownTree from '../components/DropDownTree';
import {getOrgAlarms} from '@/api/statistics';
import {toTimeNormalString, toTimezoneString, dateToMs} from '@/components/util.js';
import alarmUtils from "@/utils/alarm";
import {findIndexObject} from "@/utils/common";
import alarmTableMixin from './AlarmCheckMixin.js';
// import {batchSaveAlarmLabel, saveAlarmLabel} from "@/api/alarm";
import STableType from '@/components/STableType';
import InfoSlider from '../components/InfoSlider';

import {
    ALARM_LEVEL,
    SOURCE_TYPE,
    ALARM_TYPE,
    CHECK_TYPE,
    VALID_TYPE
} from './config';
import {getAllAlarmTypes} from "@/api/alarm";

const now = new Date();
now.setHours(0);
now.setMinutes(0);
now.setSeconds(0);
now.setMilliseconds(0);
// const endTime = now.getTime() + 24 * 60 * 60 * 1000 - 1;
const endTime = now.getTime() - 1; // update by chenying 2021.06.03

export default {
    // 车辆日在线率
    name: 'AlarmCheckDetail',
    components: {
        // VehicleTree
        InfoSlider,
        STableType,
        DropDownTree
    },
    mixins: [alarmTableMixin],
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
            dateDefault: [],
            loading: false,
            days: [],
            tableHeight: null,
            tableWidth: null,
            orgIndexCode:'',
            orgName: '',
            alarmTypes: [
                // {value: '132405',label: '超速'},
                // {value: '132371',label: '疲劳驾驶'},
                // {value: '132424',label: '夜间禁行时段行驶'},
                // {value: '132408',label: '出区域'},
                // {value: '132409',label: '进区域'},
            ],
            eventTypes:"",

            SOURCE_TYPE,
            ALARM_LEVEL,
            CHECK_TYPE,
            VALID_TYPE,
            ALARM_TYPE,
            options: [
                {
                    value: 0,
                    label:
                        '报警发生在进出隧道、高架、互通立交区域的，GPS速度和脉冲速度为0或者大于160'
                },
                {
                    value: 1,
                    label: '报警发生的区域存在2个或多个限速值交叉，并且与实际限速值不一致'
                }
            ],
            sliderShow: false,
            sliderInfo: {},
            rowData: {},
            isCheck: false,
            filesBool: false,
        };
    },
    destroyed() {
        window.removeEventListener('resize', this.resize);
    },
    mounted() {
        this.resize();
        window.removeEventListener('resize', this.resize);
        // 路由跳转相关参数获取及设置
        // 初始化默认选中节点
        const {orgIndexCode, orgName , beginTime, endTime, eventType, } = this.$route.query;
        // type: 1-报警数  2-处警率

        const orgObj = {
            orgIndexCode: orgIndexCode,
            name: orgName
        }
        this.$refs.dropdownTree.setSelected([orgObj])
        // console.log(toTimezoneString(dayDate))
        this.$nextTick(() => {
            if (eventType === '1')
                this.eventTypes = [132405]; // 超速
             else if (eventType === '2')
                this.eventTypes = [132424]; // 夜间禁行
            else if (eventType === '3')
                this.eventTypes = [225442]; // 疲劳驾驶
            else if (eventType === '4')
                this.eventTypes = [132408,132409]; // 132409-进区域，132408-出区域

            this.orgIndexCode = orgIndexCode;
            this.orgName = orgName;
            this.dateRange = [dateToMs(beginTime), dateToMs(endTime)]
            this.dateDefault = [beginTime, endTime]
            this.query();
        })

    },
    created() {
        this.tableRowClassName();
        getAllAlarmTypes({type: 4}).then(json => {
            if (json.code === '0') {
                const arr = [];
                json.data.forEach(item => {
                    const obj = {value: item.eventType, label: item.name};
                    arr.push(obj);
                });
                this.alarmTypes = [...arr];
            }
        });
    },
    methods: {
        tableRowClassName(row) {
            if (row !== undefined  ) {
                if (row.row.relateAlarmId !== null)
                    // 修改表格颜色
                    return 'info-row' ;
            }
        },
        getClick(row){
            // console.log(row)
            return row.relateAlarmId !== null;
        },
        getIndex(index) {
            return (this.currentPage - 1) * this.pageSize + index + 1;
        },
        //  时间转换
        getDateTime(time) {
            if (time === null) {
                return '';
            }
            return typeof time !== 'undefined'
                ? toTimeNormalString(toTimezoneString(time))
                : '';
        },
        // 表格查询
        query() {
            if (!this.checkParams()) {
                return;
            }
            this.loading = true;
            let params = {};
            if (this.$route.query.type === 'count') {
                params = {
                    eventTypes: this.eventTypes, // 报警类型
                    beginTime: toTimezoneString(this.dateRange[0]),
                    endTime: toTimezoneString(
                        this.dateRange[1] + 24 * 60 * 60 * 1000 - 1
                    ),
                    orgIndexCode: this.orgIndexCode,
                    orgName: this.orgName,
                    label:{
                        component:"ctm01ttvm",
                        // includeNull:true,
                        labels:[[{key:"approveStatus",value:"1"}],[{key:"approveStatus",value:"2"}]]}
                };
            } else {
                params = {
                    pageSize: this.pageSize,
                    pageNo: this.pageNo,
                    eventTypes: this.eventTypes, // 报警类型
                    beginTime: toTimezoneString(this.dateRange[0]),
                    endTime: toTimezoneString(
                        this.dateRange[1] + 24 * 60 * 60 * 1000 - 1
                    ),
                    orgIndexCode: this.orgIndexCode,
                    orgName: this.orgName,
                    label:{
                        component:"ctm01ttvm",
                        includeNull:true,
                        labels:[[{key:"approveStatus",value:"-1"}],[{key:"approveStatus",value:"1"}],[{key:"approveStatus",value:"2"}]]}
                };
            }

            getOrgAlarms(params).then( res => {
                if (res.code === '0') {
                    this.total = res.data.total;
                    this.tableData = res.data.list.map(item => {
                        item.checkTime = this.getApproveInfo(item).checkTime || '';
                        item.checkPerson = this.getApproveInfo(item).checkPerson || '';
                        item.alarmRemark = this.getApproveInfo(item).alarmRemark || '';
                        item.checkStatus = this.getApproveStatus(item);
                        item.valid = this.getValid(item);
                        item.speed = alarmUtils.formatSpeed(item.beginSpeed);
                        item.maxSpeed = alarmUtils.formatSpeed(
                            item.maxSpeed ? item.maxSpeed : 0
                        );
                        item.latitude = item.beginLatitude;
                        item.longitude = item.beginLongitude;
                        item.direction = item.beginDirection;
                        item.isChecked =
                            this.getApproveStatus(item) === '待审核' ||
                            this.getApproveStatus(item) === '系统核警';
                        item.recordSpeed = item.recordSpeed / 100000;
                        item.addressInfo = undefined;
                        return item;
                    });
                    this.tableRowClassName();// 设置颜色
                    this.loading = false;
                } else {
                    this.loading = false;
                }
            }).catch(() => {
                this.loading = false;
            });
        },
        // 查看轨迹
        handleTrack(b) {
            // const beginTime = toTimezoneString(row.beginTime - 10 * 60 * 1000)
            // const endTime = toTimezoneString(row.endTime - 10 * 60 * 1000)
            window.top.goToApp({
                url: '/ctm01ttvm-web/#/location/vehicleTrack',
                name: '行车轨迹',
                param: `indexCode=${b.vehicleIndexCode}&beginTime=${toTimezoneString(b.beginTime - 10 * 60 * 1000)}&endTime=${toTimezoneString(b.endTime + 10 * 60 * 1000)}&plateNo=${b.vehicleLicensePlate}`
            });
        },
        handleDetail(r) {
            this.sliderInfo = r;
            this.sliderShow = true;
        },
        getLabelValueByKey(alarm, key) {
            return alarmUtils.getLabelValueByKey(alarm, key);
        },
        radioChange(e) {
            this.isError = e === '0';
            this.checkForm.remark = e === '0' ? this.checkForm.remark : '';
        },
        //  报警车辆选择结果
        getVehicle(node) {
            if (node.length === 0) {
                this.queryParams.vehicleIndexCodes = [];
            } else {
                this.queryParams.vehicleIndexCodes = node.map(item => item.id);
            }
        },
        //  解析地理位置
        handleAnalysis(index, row) {
            let geocoder = null;
            if (!geocoder) {
                geocoder = new AMap.Geocoder({
                    radius: 1000 // 范围
                });
            }
            geocoder.getAddress(
                [row.longitude / 360000, row.latitude / 360000],
                (status, result) => {
                    if (status === 'complete' && result.regeocode) {
                        row.addressInfo = result.regeocode.formattedAddress;
                    }
                }
            );
        },
        // 获取核警信息
        getApproveInfo(alarm) {
            if (!alarm.label) {
                return {};
            }
            const label = alarm.label.find(
                item => item.component === process.env.VUE_APP_COMPONENT_ID
            );
            if (!label) {
                return {};
            }
            const checkPerson = label.labels.find(item => item.key === 'checkPerson');
            const checkTime = label.labels.find(item => item.key === 'checkTime');
            const alarmRemark = label.labels.find(item => item.key === 'alarmRemark');
            const bool =
                label.labels.find(item => item.key === 'approveStatus').value !== '-1';
            return {
                checkPerson: bool && checkPerson ? checkPerson.value : '',
                alarmRemark: bool && alarmRemark ? alarmRemark.value : '',
                checkTime: bool && checkTime ? checkTime.value : ''
            };
        },
        //  获取核定状态
        getValid(alarm) {
            if (!alarm.label) {
                return '';
            }
            const label = alarm.label.find(
                item => item.component === process.env.VUE_APP_COMPONENT_ID
            );
            if (!label) {
                return '';
            }
            const valid = {
                '0': '误报',
                '1': '有效'
            };
            const status = label.labels.find(item => item.key === 'valid');
            if (status) {
                return valid[status.value];
            }
        },
        //  获取核警状态
        getApproveStatus(alarm) {
            if (!alarm.label) {
                return '待审核';
            }
            const label = alarm.label.find(
                item => item.component === process.env.VUE_APP_COMPONENT_ID
            );
            if (!label) {
                return '待审核';
            }
            const approveStatus = {
                '0': '系统核警',
                '1': '人工核警',
                '2': '已复核',
                '-1': '待审核'
            };
            const status = label.labels.find(item => item.key === 'approveStatus');
            if (status) {
                return approveStatus[status.value];
            }
        },
        onSizeChange(pageSize) {
            this.pageSize = pageSize;
            this.query();
        },
        onCurrentChange(pageNo) {
            this.pageNo = pageNo;
            this.query();
        },
        resize() {
            this.tableHeight = this.$refs.pageBox.clientHeight ;
            this.tableWidth = this.$refs.pageBox.clientWidth ;
        },
        checkParams() {
            // if (this.eventTypes.length === 0) {
            //     this.$message.warning('请选择报警类型');
            //     return false;
            // }
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
        handleSelectionChange(selection) {
            this.selectionRow = selection;
        },
        //  关闭对话框
        handleClose() {
            this.resetForm('form');
            this.checkVisible = false;
        },
        //  重置表格
        resetForm(formName) {
            this.$refs[formName].resetFields();
        },
        sliderClose() {
            this.sliderShow = false;
        }
    }
};
</script>
<style>
.el-table .info-row {
    color: #c3c3c3;
}
.info-row .cell div>div{background-color:#cccccc!important;}
</style>
<style lang="scss" scoped>
.page-box {
    padding: 0 16px;
    width: 100%;

    .page-header {
        height: 50px;
        line-height: 50px;
    }

    .page-search {
        padding: 0 6px;
        height: 88px;
        position: relative;
        background-color: rgba(0, 0, 0, 0.04);

        .search-item {
            margin-top: 5px;
        }

        .search-btn {
            position: absolute;
            line-height: 88px;
            right: 10px;
        }
    }

    .page-alarm-level {
        display: flex;
        flex-direction: row-reverse;
        height: 18px;
        margin: 10px 0;
    }
}

.info-slider {
    transition: all 0.5s;
}

.info-slider-close {
    width: 0;
    opacity: 0;
}

.table-wrap {
    display: flex;
    /*min-height: 640px;*/
}

.el-table {
    /*min-height: 640px;*/
}
::v-deep {
    .el-form-item {
        margin-bottom: 16px;
    }
}
</style>
