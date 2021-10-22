<template>
    <h-layout class="statistics-page">
        <h-layout class="right-bar">
            <h-layout-content>
                <el-tabs
                    v-model="activeTab"
                    class="statistics-tab"
                    @tab-click="onTabClick"
                >
                    <el-tab-pane label="日报表" name="day">
                        <h-layout>
                            <h-layout-aside width="270px" class="left-bar">
                                <org-tree-plat
                                    ref="resourceTree"
                                    :check-strictly="true"
                                    :top="8"
                                    :bottom="8"
                                    :left="8"
                                    :right="8"
                                    :slot-line="3"
                                    style="margin-top:10px"
                                >
                                    <template slot="time">
                                        <el-form label-position="top">
                                            <el-form-item label="时间" required style="margin-bottom:0">
                                                <!--                                                <el-date-picker-->
                                                <!--                                                    v-model="searchCondition.date"-->
                                                <!--                                                    :picker-options="pickerOptions"-->
                                                <!--                                                    type="daterange"-->
                                                <!--                                                    start-placeholder="开始日期"-->
                                                <!--                                                    end-placeholder="结束日期"-->
                                                <!--                                                />-->
                                                <el-date-picker
                                                    v-model="dayDate"
                                                    :picker-options="pickerOptions"
                                                    type="date"
                                                    style="width: 100%; margin-right: 6px"
                                                    placeholder="选择日期"
                                                />
                                            </el-form-item>
                                        </el-form>
                                    </template>
                                    <template slot="btns">
                                        <el-button
                                            type="primary"
                                            style="width: 100%; max-width: 100%;"
                                            :loading="loading"
                                            @click="onSearch"
                                        >
                                            查询
                                        </el-button>
                                    </template>
                                </org-tree-plat>
                            </h-layout-aside>
                            <h-layout class="right-bar">
                                <h-layout-header>
                                    <div style="display: flex; padding: 6px 10px">
                                        <el-button
                                            type="iconButton"
                                            icon="h-icon-export"
                                            @click="onExport"
                                        >
                                            导出
                                        </el-button>
                                        <el-button
                                            type="iconButton"
                                            icon="h-icon-print"
                                            :disabled="tableData.length === 0"
                                            @click="handlePrint('dayStatistic')"
                                        >
                                            打印
                                        </el-button>
                                    </div>
                                </h-layout-header>
                                <h-layout-content style="overflow: auto;">
                                    <el-table
                                        id="dayStatistic"
                                        v-loading="loading"
                                        :data="tableData"
                                        force-scroll
                                    >
                                        <el-table-column
                                            prop="orgName"
                                            label="组织"
                                            width="140"
                                            fixed="left"
                                        ></el-table-column>
                                        <el-table-column
                                            prop="alarmNum"
                                            width="140"
                                            label="报警数"
                                        >
                                            <template slot-scope="scope">

                                                <el-button
                                                    v-if="scope.row.orgIndexCode !== null"
                                                    type="text"
                                                    size="mini"
                                                    style="color: #2196F3"
                                                    @click="handleTreatmentRate( '报警数详情' ,scope.row )"
                                                >
                                                    {{ scope.row.alarmNum }}
                                                </el-button>
                                                <div v-else>
                                                    {{ scope.row.alarmNum }}
                                                </div>
                                            </template>

                                        </el-table-column>
                                        <el-table-column
                                            prop="broadcastRate"
                                            width="140"
                                            label="处警率"
                                        >
                                            <template slot-scope="scope">
                                                <el-button
                                                    v-if="scope.row.orgIndexCode !== null"
                                                    type="text"
                                                    size="mini"
                                                    style="color: #2196F3"
                                                    @click="handleTreatmentRate( '处警率详情' ,scope.row )"
                                                >
                                                    {{ scope.row.broadcastRate }}
                                                </el-button>
                                                <div v-else>
                                                    {{ scope.row.broadcastRate }}
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column
                                            prop="messageNum"
                                            width="140"
                                            label="短信数"
                                        >
                                            <template slot-scope="scope">
                                                <el-button
                                                    type="text"
                                                    v-if="scope.row.orgIndexCode !== null"
                                                    size="mini"
                                                    style="color: #2196F3"
                                                    @click="handleMessageNum(scope.$index, scope.row)"
                                                >
                                                    {{ scope.row.messageNum }}
                                                </el-button>
                                                <div v-else>
                                                    {{ scope.row.messageNum }}
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column
                                            prop="vehicleNum"
                                            width="140"
                                            label="车辆数"
                                        >
                                            <template slot-scope="scope">
                                                <el-button
                                                    v-if="scope.row.orgIndexCode !== null"
                                                    type="text"
                                                    size="mini"
                                                    style="color: #2196F3"
                                                    @click="handleOutageAllVehicle(scope.$index, scope.row)"
                                                >
                                                    {{ scope.row.vehicleNum }}

                                                </el-button>
                                                <div v-else>
                                                    {{ scope.row.vehicleNum }}
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column
                                            prop="onlineVehicleNum"
                                            width="140"
                                            label="上线车辆数"
                                        >
                                            <template slot-scope="scope">
                                                <el-button
                                                    v-if="scope.row.orgIndexCode !== null"
                                                    type="text"
                                                    size="mini"
                                                    style="color: #2196F3"
                                                    @click="handleOutageOnlineVehicle(scope.$index, scope.row)"
                                                >
                                                    {{ scope.row.onlineVehicleNum }}

                                                </el-button>
                                                <div v-else>
                                                    {{ scope.row.onlineVehicleNum }}
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column
                                            prop="vehicleOnlineRate"
                                            width="140"
                                            label="车辆上线率"
                                        >
                                            <template slot-scope="scope">
                                                <el-button
                                                    v-if="scope.row.orgIndexCode !== null"
                                                    type="text"
                                                    size="mini"
                                                    style="color: #2196F3"
                                                    @click="handleOutageOnlineVehicle(scope.$index, scope.row)"
                                                >
                                                    {{ scope.row.vehicleOnlineRate }}
                                                </el-button>
                                                <div v-else>
                                                    {{ scope.row.vehicleOnlineRate }}
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <!--                                        <el-table-column
                                                                                    prop="noGpsVehicleNum"
                                                                                    width="140"
                                                                                    label="未定位车辆数"
                                                                                ></el-table-column>
                                                                                <el-table-column
                                                                                    prop="vehicleGpsRate"
                                                                                    width="140"
                                                                                    label="车辆定位率"
                                                                                ></el-table-column>-->
                                        <el-table-column
                                            prop="offlineVehicleNum"
                                            width="140"
                                            label="未上线车辆数"
                                        >
                                            <template slot-scope="scope">
                                                <el-button
                                                    v-if="scope.row.orgIndexCode !== null"
                                                    type="text"
                                                    size="mini"
                                                    style="color: #2196F3"
                                                    @click="handleOutageOffVehicle(scope.$index, scope.row)"
                                                >
                                                    {{ scope.row.offlineVehicleNum }}
                                                </el-button>
                                                <div v-else>
                                                    {{ scope.row.offlineVehicleNum }}
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <el-table-column
                                            prop="outageVehicleNum"
                                            width="140"
                                            label="停运车辆数"
                                        >
                                            <template slot-scope="scope">
                                                <el-button
                                                    v-if="scope.row.orgIndexCode !== null"
                                                    type="text"
                                                    size="mini"
                                                    style="color: #2196F3"
                                                    @click="handleOutageVehicle(scope.$index, scope.row)"
                                                >
                                                    {{ scope.row.outageVehicleNum }}

                                                </el-button>
                                                <div v-else>
                                                    {{ scope.row.outageVehicleNum }}
                                                </div>
                                            </template>
                                        </el-table-column>
                                        <!--                                        <el-table-column-->
                                        <!--                                            prop="noDataVehicleNum"-->
                                        <!--                                            width="140"-->
                                        <!--                                            label="无数据车辆数"-->
                                        <!--                                        ></el-table-column>-->
                                    </el-table>
                                </h-layout-content>
                            </h-layout>
                        </h-layout>
                    </el-tab-pane>

                    <el-tab-pane label="月报表" name="month">
                        <h-layout>
                            <h-layout-header>
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
                                    <el-button type="primary" @click="onSearch">查询</el-button>
                                    <el-button
                                        type="iconButton"
                                        icon="h-icon-print"
                                        :disabled="
                      !(approveCountData && approveCountData.length > 0)
                    "
                                        @click="handlePrint('monthStatistic')"
                                    >
                                        打印
                                    </el-button>
                                </div>
                            </h-layout-header>
                            <h-layout-content style="overflow: auto;">
                                <div
                                    id="monthStatistic"
                                    v-loading="monthLoading"
                                    style="border: 1px solid #d9d9d9"
                                >
                                    <el-row>
                                        <el-col :span="6">
                                            <div class="table-title">统计时间</div>
                                        </el-col>
                                        <el-col :span="18">
                                            <div class="table-content" style="border-right: 0">
                                                {{ statisticTime }}
                                            </div>
                                        </el-col>
                                    </el-row>
                                    <div style="height: 1px;background-color: #d9d9d9;"/>
                                    <el-row>
                                        <el-col :span="8">
                                            <div class="table-title">平台监控车辆数</div>
                                        </el-col>
                                        <el-col :span="8">
                                            <div class="table-title">上线率</div>
                                        </el-col>
                                        <!--                                        <el-col :span="6">-->
                                        <!--                                            <div class="table-title">定位率</div>-->
                                        <!--                                        </el-col>-->
                                        <el-col :span="8">
                                            <div class="table-title">处警率</div>
                                        </el-col>
                                    </el-row>
                                    <div style="height: 1px;background-color: #d9d9d9;"/>
                                    <el-row>
                                        <el-col :span="8">
                                            <div class="table-content">
                                                <el-button
                                                    type="text"
                                                    size="mini"
                                                    style="color: #2196F3"
                                                    @click="handleOutageAllVehicle()"
                                                >
                                                    {{ vehicleNum }}
                                                </el-button>
                                            </div>
                                        </el-col>
                                        <el-col :span="8">
                                            <div class="table-content">
                                                <el-button
                                                    type="text"
                                                    size="mini"
                                                    style="color: #2196F3"
                                                    @click="handleOutageOnlineVehicle()"
                                                >
                                                    {{ vehicleOnlineRate }}
                                                </el-button>
                                            </div>
                                        </el-col>
                                        <!--                                        <el-col :span="6">-->
                                        <!--                                            <div class="table-content">{{ vehicleGpsRate }}</div>-->
                                        <!--                                        </el-col>-->
                                        <el-col :span="8">
                                            <div class="table-content">
                                                <el-button
                                                    type="text"
                                                    size="mini"
                                                    style="color: #2196F3"
                                                    @click="handleTreatmentRate( '处警率详情' )"
                                                >
                                                    {{ broadcastRate }}
                                                </el-button>
                                            </div>
                                        </el-col>
                                    </el-row>
                                    <div style="height: 1px;background-color: #d9d9d9;"/>
                                    <el-row>
                                        <el-col :span="4">
                                            <div class="table-title">报警类型</div>
                                        </el-col>
                                        <!--                    <el-col :span="6">-->
                                        <!--                      <div-->
                                        <!--                        class="table-title"-->
                                        <!--                        style="height: 20px; border-bottom: 1px solid #d9d9d9"-->
                                        <!--                      >-->
                                        <!--                        超速报警-->
                                        <!--                      </div>-->
                                        <!--                      <div-->
                                        <!--                        style="display: flex;justify-content: center;align-items: center"-->
                                        <!--                      >-->
                                        <!--                        <div-->
                                        <!--                          class="table-title"-->
                                        <!--                          style="height: 20px; width: 50%;"-->
                                        <!--                        >-->
                                        <!--                          昼间超速-->
                                        <!--                        </div>-->
                                        <!--                        <div-->
                                        <!--                          class="table-title"-->
                                        <!--                          style="height: 20px; width: 50%;"-->
                                        <!--                        >-->
                                        <!--                          夜间超速-->
                                        <!--                        </div>-->
                                        <!--                      </div>-->
                                        <!--                    </el-col>-->
                                        <el-col :span="4">
                                            <div class="table-title">超速报警</div>
                                        </el-col>
                                        <el-col :span="4">
                                            <div class="table-title">凌晨禁行</div>
                                        </el-col>
                                        <el-col :span="4">
                                            <div class="table-title">疲劳驾驶</div>
                                        </el-col>
                                        <el-col :span="4">
                                            <div class="table-title">越线行驶</div>
                                        </el-col>
                                        <el-col :span="4">
                                            <div class="table-title" style="border-right: 0">
                                                合计
                                            </div>
                                        </el-col>
                                    </el-row>
                                    <div style="height: 1px;background-color: #d9d9d9;"/>
                                    <el-row>
                                        <el-col :span="4">
                                            <div class="table-title">报警条数</div>
                                        </el-col>
                                        <!--                    <el-col :span="3">-->
                                        <!--                      <div class="table-content">-->
                                        <!--                        {{ getAlarmNum('昼间超速') }}-->
                                        <!--                      </div>-->
                                        <!--                    </el-col>-->
                                        <!--                    <el-col :span="3">-->
                                        <!--                      <div class="table-content">-->
                                        <!--                        {{ getAlarmNum('夜间超速') }}-->
                                        <!--                      </div>-->
                                        <!--                    </el-col>-->
                                        <el-col :span="4">
                                            <div class="table-content">
                                                <el-button
                                                    type="text"
                                                    size="mini"
                                                    style="color: #2196F3"
                                                    @click="getAlarmMouthDetail(1)"
                                                >
                                                    {{ getAlarmNum('超速报警') }}
                                                </el-button>
                                            </div>
                                        </el-col>
                                        <el-col :span="4">
                                            <div class="table-content">
                                                <el-button
                                                    type="text"
                                                    size="mini"
                                                    style="color: #2196F3"
                                                    @click="getAlarmMouthDetail(2)"
                                                >
                                                    {{ getAlarmNum('凌晨禁行') }}
                                                </el-button>
                                            </div>
                                        </el-col>
                                        <el-col :span="4">
                                            <div class="table-content">
                                                <el-button
                                                    type="text"
                                                    size="mini"
                                                    style="color: #2196F3"
                                                    @click="getAlarmMouthDetail(3)"
                                                >
                                                    {{ getAlarmNum('疲劳驾驶') }}
                                                </el-button>
                                            </div>
                                        </el-col>
                                        <el-col :span="4">
                                            <div class="table-content">
                                                <el-button
                                                    type="text"
                                                    size="mini"
                                                    style="color: #2196F3"
                                                    @click="getAlarmMouthDetail(4)"
                                                >
                                                    {{ getAlarmNum('越线行驶') }}
                                                </el-button>
                                            </div>
                                        </el-col>
                                        <el-col :span="4">
                                            <div class="table-content" style="border-right: 0">
                                                <el-button
                                                    type="text"
                                                    size="mini"
                                                    style="color: #2196F3"
                                                    @click="getAlarmMouthDetail(0)"
                                                >
                                                    {{ getAlarmNum('合计') }}
                                                </el-button>
                                            </div>
                                        </el-col>
                                    </el-row>
                                    <div style="height: 1px;background-color: #d9d9d9;"/>
                                    <el-row>
                                        <el-col :span="4">
                                            <div class="table-title">核实次数</div>
                                        </el-col>
                                        <!--                    <el-col :span="3">-->
                                        <!--                      <div class="table-content">-->
                                        <!--                        {{ getApproveNum('昼间超速') }}-->
                                        <!--                      </div>-->
                                        <!--                    </el-col>-->
                                        <!--                    <el-col :span="3">-->
                                        <!--                      <div class="table-content">-->
                                        <!--                        {{ getApproveNum('夜间超速') }}-->
                                        <!--                      </div>-->
                                        <!--                    </el-col>-->
                                        <el-col :span="4">
                                            <div class="table-content">
                                                <el-button
                                                    type="text"
                                                    size="mini"
                                                    style="color: #2196F3"
                                                    @click="getAlarmMouthDetailNum(1)"
                                                >
                                                    {{ getApproveNum('超速报警') }}
                                                </el-button>
                                            </div>
                                        </el-col>
                                        <el-col :span="4">
                                            <div class="table-content">
                                                <el-button
                                                    type="text"
                                                    size="mini"
                                                    style="color: #2196F3"
                                                    @click="getAlarmMouthDetailNum(2)"
                                                >
                                                    {{ getApproveNum('凌晨禁行') }}
                                                </el-button>
                                            </div>
                                        </el-col>
                                        <el-col :span="4">
                                            <div class="table-content">
                                                <el-button
                                                    type="text"
                                                    size="mini"
                                                    style="color: #2196F3"
                                                    @click="getAlarmMouthDetailNum(3)"
                                                >
                                                    {{ getApproveNum('疲劳驾驶') }}
                                                </el-button>
                                            </div>
                                        </el-col>
                                        <el-col :span="4">
                                            <div class="table-content">
                                                <el-button
                                                    type="text"
                                                    size="mini"
                                                    style="color: #2196F3"
                                                    @click="getAlarmMouthDetailNum(4)"
                                                >
                                                    {{ getApproveNum('越线行驶') }}
                                                </el-button>
                                            </div>
                                        </el-col>
                                        <el-col :span="4">
                                            <div class="table-content" style="border-right: 0">
                                                <el-button
                                                    type="text"
                                                    size="mini"
                                                    style="color: #2196F3"
                                                    @click="getAlarmMouthDetailNum(0)"
                                                >
                                                    {{ getApproveNum('合计') }}
                                                </el-button>
                                            </div>
                                        </el-col>
                                    </el-row>
                                    <div style="height: 1px;background-color: #d9d9d9;"/>
                                    <el-row>
                                        <el-col :span="4">
                                            <div class="table-title" style="height: 152px">备注</div>
                                        </el-col>
                                        <el-col :span="20">
                                            <div
                                                style="border-right: 0; padding: 10px 20px;display: flex; align-items: flex-end"
                                            >
                                                <el-input
                                                    v-model="remark"
                                                    :disabled="remarkOff"
                                                    type="textarea"
                                                    :rows="6"
                                                ></el-input>
                                                <el-button
                                                    type="link"
                                                    :disabled="remarkOff"
                                                    :min-width="64"
                                                    @click="handleSaveRemark"
                                                >
                                                    保存备注
                                                </el-button>
                                            </div>
                                        </el-col>
                                    </el-row>
                                </div>
                                <div style="font-size: 16px; margin-top: 12px">
                                    组织：{{ orgName }}
                                </div>
                            </h-layout-content>
                        </h-layout>
                    </el-tab-pane>
                </el-tabs>
            </h-layout-content>
        </h-layout>
        <div v-show="false">
            <DayStatistic :day-table-data="tableDataTemp"/>
            <MonthStatistic
                :statistic-time="statisticTime"
                :org-name="orgName"
                :month-obj="monthObj"
            />
        </div>
    </h-layout>
</template>

<script>
import DayStatistic from './components/DayStatistic';
import OrgTreePlat from '@/components/OrgTreePlat';
import {
    getDayStatistic,
    getMonthStatistic,
    saveRemark
} from '../../api/statistics.js';
import {toTimezoneString, toTimeNormalString, dateToMs, msToDate, formatDate} from '../../components/util.js';
import {downloadExcel} from '../../core/httpInstance.js';
import MonthStatistic from './components/MonthStatistic';
import DropDownTree from './components/DropDownTree';
import {findIndexObject} from '../../utils/common';

const now = new Date();
now.setHours(0);
now.setMinutes(0);
now.setSeconds(0);
now.setMilliseconds(0);

// const endTime = now.getTime() + 24 * 60 * 60 * 1000 - 1;
const endTime = now.getTime() - 1; // update by chenying 2021.06.03
const defaultDate = (now.getFullYear()) + '/' + (((now.getMonth() + 1) >= 10) ? (now.getMonth() + 1) : '0' + (now.getMonth() + 1)) + '/' + (((now.getDate() - 1) < 10) ? ('0' + (now.getDate() - 1)) : (now.getDate() - 1));
// console.log(defaultDate)

export default {
    // 平台统计数据
    name: 'PlatformStatistic',
    components: {
        OrgTreePlat,
        DropDownTree,
        MonthStatistic,
        DayStatistic
    },
    data() {
        return {
            monthObj: {},
            remarkOff: true,
            approveCountData: [],
            dateRange: [],
            datePickerOptions: {
                disabledDate(time) {
                    return time.getTime() > endTime;
                },
                customValidation(start, end) {
                    return end.getTime() - start.getTime() <= 30 * 24 * 60 * 60 * 1000;
                },
                customPrompt: '选择时间范围不能超过31天'
            },
            orgName: '',
            orgIndexCode: '',
            statisticTime: '',
            broadcastRate: '',
            vehicleGpsRate: '',
            vehicleNum: '',
            vehicleOnlineRate: '',
            activeTab: 'day',
            remark: '',
            dayDate: defaultDate,
            pickerOptions: {
                disabledDate(time) {
                    return time.getTime() > Date.now() - 24 * 60 * 60 * 1000;
                }
            },
            tableData: [],
            tableDataTemp: [],
            isMonth: false,
            loading: false,
            monthLoading: false
        };
    },
    created() {
        this.defaultDate();
    },
    methods: {
        // 超速报警
        getAlarmMouthDetail(eventType) {
            // type:1-超速，2-凌晨禁行，3-疲劳驾驶，4-越线行驶(包括出区域，进区域)，0-合计单元格
            window.top.goToApp({
                url: '/ctm01ttvm-web/#/statistics/alarmCheckDetail',
                name: '报警条数',
                param: `orgIndexCode=${this.orgIndexCode}&orgName=${this.orgName}&beginTime=${msToDate(this.dateRange[0])}&endTime=${msToDate(this.dateRange[1])}&eventType=${eventType}`
            });
        },

        getAlarmMouthDetailNum(eventType) {
            // type:1-超速，2-凌晨禁行，3-疲劳驾驶，4-越线行驶(包括出区域，进区域)，0-合计单元格
            window.top.goToApp({
                url: '/ctm01ttvm-web/#/statistics/alarmCheckDetail',
                name: '核实次数',
                param: `type=count&orgIndexCode=${this.orgIndexCode}&orgName=${this.orgName}&beginTime=${msToDate(this.dateRange[0])}&endTime=${msToDate(this.dateRange[1])}&eventType=${eventType}`
            });
        },
        // 跳转停运车辆详情列表页面
        handleOutageVehicle(index, row) {
            window.top.goToApp({
                url: '/ctm01ttvm-web/#/statistics/orgIdVehicleDetail',
                name: '停运车辆',
                param: `orgIndexCode=${row.orgIndexCode}&orgName=${row.orgName}&beginTime=${msToDate(this.dayDate)}&endTime=${msToDate(this.dayDate)}`
            });
        },
        handleOutageAllVehicle(index, row) {
            let beginTime = '';
            let endTime = '';
            let orgIndexCode = '';
            let orgName = '';
            if (this.isMonth) {
                orgIndexCode = this.orgIndexCode;
                orgName = this.orgName;
                beginTime = msToDate(this.dateRange[0]);
                endTime = msToDate(this.dateRange[1]);
            } else {
                orgIndexCode = row.orgIndexCode;
                orgName = row.orgName;
                beginTime = msToDate(this.dayDate);
                endTime = msToDate(this.dayDate);
            }
            window.top.goToApp({
                url: '/ctm01ttvm-web/#/statistics/orgAllVehicleDetail',
                name: '总车辆数',
                param: `orgIndexCode=${orgIndexCode}&orgName=${orgName}&beginTime=${beginTime}&endTime=${endTime}`
            });
        },
        handleMessageNum(index, row) {
            window.top.goToApp({
                url: '/ctm01ttvm-web/#/statistics/messageDetail',
                name: '短信数详情',
                param: `orgIndexCode=${row.orgIndexCode}&orgName=${row.orgName}&dayDate=${this.dayDate}`
            });
        },
        handleTreatmentRate(name, row) {
            // console.log(name)
            // console.log(row)
            let beginTime = '';
            let endTime = '';
            let orgIndexCode = '';
            let orgName = '';
            if (this.isMonth) {
                orgIndexCode = this.orgIndexCode;
                orgName = this.orgName;
                beginTime = msToDate(this.dateRange[0]);
                endTime = msToDate(this.dateRange[1]);
            } else {
                orgIndexCode = row.orgIndexCode;
                orgName = row.orgName;
                beginTime = msToDate(this.dayDate);
                endTime = msToDate(this.dayDate);
            }
            // 处警率
            window.top.goToApp({
                url: '/ctm01ttvm-web/#/statistics/alarmCheckDetail',
                name: name,
                param: `orgIndexCode=${orgIndexCode}&orgName=${orgName}&beginTime=${beginTime}&endTime=${endTime}`
            });
        },
        handleOutageOnlineVehicle(index, row) {
            let beginTime = '';
            let endTime = '';
            let orgIndexCode = '';
            let orgName = '';
            if (this.isMonth) {
                orgIndexCode = this.orgIndexCode;
                orgName = this.orgName;
                beginTime = msToDate(this.dateRange[0]);
                endTime = msToDate(this.dateRange[1]);
            } else {
                orgIndexCode = row.orgIndexCode;
                orgName = row.orgName;
                beginTime = msToDate(this.dayDate);
                endTime = msToDate(this.dayDate);
            }
            console.log(beginTime)
            console.log(endTime)
            window.top.goToApp({
                url: '/ctm01ttvm-web/#/statistics/vehicleDayOnline',
                name: '上线车辆',
                param: `orgIndexCode=${orgIndexCode}&orgName=${orgName}&type=1&beginTime=${beginTime}&endTime=${endTime}`
            });
        },
        handleOutageOffVehicle(index, row) {
            // console.log(this.dayDate)
            window.top.goToApp({
                url: '/ctm01ttvm-web/#/statistics/vehicleDayOnline',
                name: '未上线车辆数',
                param: `orgIndexCode=${row.orgIndexCode}&orgName=${row.orgName}&type=2&beginTime=${msToDate(this.dayDate)}&endTime=${msToDate(this.dayDate)}`
            });
        },

        //  获取报警条数
        getAlarmNum(name) {
            if (this.approveCountData.length > 0) {
                const objTemp = findIndexObject(this.approveCountData, [
                    'eventTypeName',
                    name
                ]);
                return objTemp ? objTemp.alarmNum : '';
            } else {
                return '';
            }
        },
        //  获取核实次数
        getApproveNum(name) {
            if (this.approveCountData.length > 0) {
                const objTemp = findIndexObject(this.approveCountData, [
                    'eventTypeName',
                    name
                ]);
                return objTemp ? objTemp.approveNum : '';
            } else {
                return '';
            }
        },
        //  选择组织
        handleSelectOrg(node) {
            if (this.isMonth) {
                this.approveCountData = [];
                this.remark = '';
                this.broadcastRate = '';
                this.vehicleGpsRate = '';
                this.vehicleNum = '';
                this.vehicleOnlineRate = '';
                this.statisticTime = '';
                this.orgName = node[0].name;
                this.orgIndexCode = node[0].indexCode;
                this.remarkOff = true;
            }
        },
        //  保存备注
        handleSaveRemark() {
            if (this.remark === null) {
                this.$message.warning('备注信息不能为空！');
                return;
            }
            const params = {
                beginTime: toTimezoneString(this.dateRange[0]),
                endTime: toTimezoneString(this.dateRange[1]),
                orgIndexCode: this.orgIndexCode,
                remark: this.remark
            };
            saveRemark(params).then(res => {
                this.$message.success('保存成功');
                this.onSearch();
            });
        },
        //  校验月份选择
        checkMonthParams() {
            if (this.dateRange.length === 0) {
                this.$message.warning('请选择时间');
                return false;
            }
            if (this.orgIndexCode.length === 0) {
                this.$message.warning('请选择组织');
                return false;
            }
            return true;
        },
        //  校验日期选择
        checkDayParams() {
            if (!this.dayDate) {
                this.$message.warning('请选择日期');
                return false;
            }
            if (this.$refs.resourceTree.getChecked().length === 0) {
                this.$message.warning('请选择组织');
                return false;
            }
            return true;
        },
        //  查询数据
        onSearch() {
            if (this.isMonth) { // 月报表
                if (!this.checkMonthParams()) {
                    return;
                }
                this.monthLoading = true;

                const params = {
                    beginTime: toTimezoneString(this.dateRange[0]),
                    endTime: toTimezoneString(
                        this.dateRange[1] + 24 * 60 * 60 * 1000 - 1
                    ),
                    orgIndexCode: this.orgIndexCode,
                    orgName: this.orgName,
                };
                // console.log(params)
                const startTimeStr = toTimeNormalString(
                    toTimezoneString(this.dateRange[0])
                ).split(' ')[0];
                const endTimeStr = toTimeNormalString(
                    toTimezoneString(this.dateRange[1])
                ).split(' ')[0];
                this.statisticTime = startTimeStr + '---' + endTimeStr;
                getMonthStatistic(params)
                    .then(res => {
                        if (res.code === '0') {
                            this.approveCountData = [...res.data.approveCountDtos];
                            this.remark = res.data.remark;
                            this.broadcastRate = this.numberTransform(res.data.broadcastRate);
                            this.vehicleGpsRate = this.numberTransform(
                                res.data.vehicleGpsRate
                            );
                            this.vehicleOnlineRate = this.numberTransform(
                                res.data.vehicleOnlineRate
                            );
                            this.vehicleNum = res.data.vehicleNum;
                            this.monthObj = {
                                approveCountData: [...res.data.approveCountDtos],
                                remark: res.data.remark,
                                broadcastRate: this.numberTransform(res.data.broadcastRate),
                                vehicleGpsRate: this.numberTransform(res.data.vehicleGpsRate),
                                vehicleNum: res.data.vehicleNum,
                                vehicleOnlineRate: this.numberTransform(
                                    res.data.vehicleOnlineRate
                                )
                            };
                            this.remarkOff = false;
                            this.monthLoading = false;
                        } else {
                            this.monthLoading = false;
                        }
                    })
                    .catch(() => {
                        this.monthLoading = false;
                    });
            } else {
                // 日报表
                if (!this.checkDayParams()) {
                    return false;
                }
                this.loading = true;
                // 多选的组织树的indexCode数组
                const orgs = this.$refs.resourceTree.getChecked().map(item => {
                    return {
                        indexCode: item.indexCode,
                        name: item.name
                    };
                });
                const params = {
                    beginTime: toTimezoneString(this.dayDate),
                    endTime: toTimezoneString(
                        dateToMs(this.dayDate) + 24 * 60 * 60 * 1000 - 1
                    ),
                    orgs: orgs
                };
                // console.log(params)
                getDayStatistic(params)
                    .then(res => {
                        if (res.code === '0') {
                            const arr = res.data.map(item => {
                                item.broadcastRate = this.numberTransform(item.broadcastRate);
                                item.vehicleOnlineRate = this.numberTransform(
                                    item.vehicleOnlineRate
                                );
                                item.vehicleGpsRate = this.numberTransform(item.vehicleGpsRate);
                                return item;
                            });
                            this.tableData = [...arr];
                            let index = 0;
                            const newArray = [];
                            while (index < [...res.data].length) {
                                newArray.push([...res.data].slice(index, (index += 16)));
                            }
                            this.tableDataTemp = newArray;
                            this.loading = false;
                        } else {
                            this.loading = false;
                        }
                    })
                    .catch(() => {
                        this.loading = false;
                    });
            }
        },
        //  数字转换百分数
        numberTransform(num) {
            let numTemp = null;
            if (typeof num === 'number') {
                numTemp = String((num * 100).toFixed(2)) + '%';
            } else {
                numTemp = '';
            }
            return numTemp;
        },
        //  Tab click
        onTabClick(data) {
            this.isMonth = data.name === 'month';
        },
        //  打印
        handlePrint(str) {
            let iframe = document.getElementById('print-iframe');
            if (!iframe) {
                iframe = document.createElement('IFRAME');
                let doc = null;
                iframe.setAttribute('id', 'print-iframe');
                // iframe.setAttribute('style', 'position:absolute;width:0px;height:0px;left:-500px;top:-500px;');
                document.body.appendChild(iframe);
                doc = iframe.contentWindow.document;
                const printStr =
                    str === 'dayStatistic'
                        ? document.getElementById('print_day').innerHTML
                        : document.getElementById('print_month').innerHTML;
                doc.write(printStr);
                doc.close();
                iframe.contentWindow.focus();
            }
            iframe.contentWindow.print();
            document.body.removeChild(iframe);
            if (navigator.userAgent.indexOf('MSIE') > 0) {
                document.body.removeChild(iframe);
            }
        },
        //  导出
        onExport() {
            if (!this.checkDayParams()) {
                return;
            }
            if (this.tableData.length === 0) {
                this.$message.warning('请先查询数据再导出');
                return;
            }

            // 多选的组织树的indexCode数组
            const orgs = this.$refs.resourceTree.getChecked().map(item => {
                return {
                    indexCode: item.indexCode,
                    name: item.name
                };
            });
            downloadExcel(
                `/${process.env.VUE_APP_CONTEXT}/statistic/all/exportDayStatistic.do`,
                {
                    beginTime: toTimezoneString(this.dayDate),
                    endTime: toTimezoneString(
                        dateToMs(this.dayDate) + 24 * 60 * 60 * 1000 - 1
                    ),
                    orgIndexCode: JSON.stringify(orgs)
                }
            );
        },
        //设置默认日期
        defaultDate() {
            //获取新的时间
            let date = new Date();
            //获取当前时间的年份转为字符串
            let year = date.getFullYear().toString();
            //获取月份，由于月份从0开始，此处要加1，判断是否小于10，如果是在字符串前面拼接'0'
            let month = date.getMonth() < 10 ? '0' + date.getMonth().toString() : date.getMonth().toString();
            //获取天，判断是否小于10，如果是在字符串前面拼接'0'
            let last = new Date(year, month, 0).getDate();//上个月最后一天
            //字符串拼接，开始时间，结束时间
            let end = year + '/' + month + '/' + last;  // 上个月最后一天
            let beg = year + '/' + month + '/01';    // 上个月第一天
            this.dateRange = [dateToMs(beg), dateToMs(end)]; //将值设置给插件绑定的数据
        },
    },
};
</script>

<style src="@/pages/statistics/statistics.scss" lang="scss"></style>
<style>
.table-title {
    color: #333333;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    border-right: 1px solid #d9d9d9;
    background-color: #ebebeb;
}

.table-content {
    display: flex;
    align-items: center;
    justify-content: center;
    border-right: 1px solid #ebebeb;
    height: 40px;
}

.mbs {
    margin-bottom: 8px;
}

.statistics-page .right-bar > .h-layout-content {
    padding: 0 !important;
}
</style>
