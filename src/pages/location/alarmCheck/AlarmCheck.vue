<template>
    <h-page-container>
        <h-layout>
            <div ref="pageBox" class="page-box">
                <div class="page-header">
                    <el-button icon="h-icon-export" @click="onExportAlarm">
                        导出
                    </el-button>
                    <el-button icon="h-icon-access" @click="handleCheckBatch">
                        批量核定
                    </el-button>
                </div>
                <div id="pageSearch" class="page-search">
                    <el-row :gutter="16">
                        <el-col :span="2">
                            <div class="search-item">
                                <div style="margin-bottom: 4px">报警来源</div>
                                <el-select v-model="queryParams.sourceType" clear>
                                    <el-option
                                        v-for="item in SOURCE_TYPE"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                            </div>
                        </el-col>
                        <el-col :span="4">
                            <div class="search-item">
                                <div style="margin-bottom: 4px">车辆选择</div>
                                <drop-down-tree
                                    ref="dropdownTree"
                                    tree-type="3"
                                    :is-need-filter="true"
                                    @input="getVehicle"
                                ></drop-down-tree>
                            </div>
                        </el-col>
                        <el-col :span="4">
                            <div class="search-item">
                                <div style="margin-bottom: 4px">报警类型</div>
                                <el-select
                                    v-model="queryParams.eventTypes"
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
                        <el-col :span="2">
                            <div class="search-item">
                                <div style="margin-bottom: 4px">告警级别</div>
                                <el-select v-model="queryParams.level" clear>
                                    <el-option
                                        v-for="(item, key) in ALARM_LEVEL"
                                        :key="key"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                            </div>
                        </el-col>
                        <el-col :span="2">
                            <div class="search-item">
                                <div style="margin-bottom: 4px">审核状态</div>
                                <el-select v-model="queryParams.checkType" clear>
                                    <el-option
                                        v-for="(item, key) in CHECK_TYPE"
                                        :key="key"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                            </div>
                        </el-col>
                        <el-col :span="2">
                            <div class="search-item">
                                <div style="margin-bottom: 4px">核定状态</div>
                                <el-select v-model="queryParams.validType" clear>
                                    <el-option
                                        v-for="(item, key) in VALID_TYPE"
                                        :key="key"
                                        :label="item.label"
                                        :value="item.value"
                                    ></el-option>
                                </el-select>
                            </div>
                        </el-col>
                        <el-col :span="5">
                            <div class="search-item">
                                <div style="margin-bottom: 4px">时间范围</div>
                                <el-date-picker
                                    v-model="queryParams.dateRange"
                                    type="datetimerange"
                                    :default-time="['00:00:00', '23:59:59']"
                                    value-format="timestamp"
                                    start-placeholder="开始时间"
                                    end-placeholder="结束时间"
                                    :picker-options="queryParams.datePickerOptions"
                                />
                            </div>
                        </el-col>
                        <el-col :span="3">
                            <div class="search-btn">
                                <el-button type="primary" @click="handleQuery">查询</el-button>
                                <el-button type="default" @click="handleReset">重置</el-button>
                            </div>
                        </el-col>
                    </el-row>
                </div>
                <div class="table-wrap">
                    <el-table
                        ref="tabref"
                        v-loading="loading"
                        :data="tableData"
                        stripe
                        :height="tableHeight - 196"
                        enable-virtual-scroll
                        force-scroll
                        @selection-change="handleSelectionChange"
                        :row-class-name="tableRowClassName"
                    >
                        <!--  @current-change="handleCurrentChange"  -->
                        <el-table-column type="selection" :selectable="selectable"/>
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
                        <!-- <el-table-column prop="recordSpeed" label="导航屏速" width="100">
                          <template slot-scope="scope">
                            {{ (scope.row.recordSpeed ? scope.row.recordSpeed : 0) + ' km/h' }}
                          </template>
                        </el-table-column> -->
                        <el-table-column prop="value3" label="限速" width="100">
                            <template slot-scope="scope">
                                {{
                                    (scope.row.limitSpeed ? scope.row.limitSpeed : 0) + ' km/h'
                                }}
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="orgName"
                            label="所属机构"
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
                            width="180"
                            fixed="right"
                        >
                            <template slot-scope="scope">
                                <el-button
                                    v-if="scope.row.isChecked"
                                    type="text"
                                    size="mini"
                                    :disabled="getApproveType(1, scope.row)"
                                    style="color: #2196F3"
                                    @click="handleCheck(scope.$index, scope.row)"
                                >
                                    核定
                                </el-button>
                                <el-button
                                    v-else
                                    type="text"
                                    size="mini"
                                    :disabled="getApproveType(2, scope.row)"
                                    style="color: #2196F3"
                                    @click="handleCheck(scope.$index, scope.row)"
                                >
                                    复核
                                </el-button>
                                <!--                <el-button-->
                                <!--                  type="text"-->
                                <!--                  size="mini"-->
                                <!--                  style="color: #2196F3"-->
                                <!--                  @click="handleTrack(scope.$index, scope.row)"-->
                                <!--                >-->

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
                                <el-button
                                    type="text"
                                    size="mini"
                                    style="color: #2196F3"
                                    :disabled="enableFiles(scope.row)"
                                    @click="handleFiles(scope.row)"
                                >
                                    附件
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
                <el-dialog
                    title="核警"
                    top="middle"
                    :visible.sync="checkVisible"
                    :area="[444, 341]"
                    size="small"
                    :before-close="handleClose"
                >
                    <el-form
                        ref="form"
                        label-position="top"
                        :model="checkForm"
                        label-width="90px"
                        content-width="400px"
                    >
                        <div style="margin-bottom: 10px">核定状态</div>
                        <el-form-item label="" prop="radio">
                            <el-radio
                                v-model="checkForm.radio"
                                class="radio"
                                :label="'1'"
                                @change="radioChange"
                            >
                                有效
                            </el-radio>
                            <el-radio
                                v-model="checkForm.radio"
                                class="radio"
                                :label="'0'"
                                @change="radioChange"
                            >
                                误报
                            </el-radio>
                        </el-form-item>
                        <div style="margin-bottom: 10px">
                            {{ !isError ? '备注' : '误报原因' }}
                        </div>
                        <el-form-item label="" prop="remark">
                            <el-input
                                v-if="!isError"
                                v-model="checkForm.remark"
                                type="textarea"
                                :rows="4"
                                :count="200"
                                tips-placement="right"
                                placeholder="描述..."
                            ></el-input>
                            <div v-else>
                                <el-select
                                    v-model="checkForm.remark"
                                    placeholder="请选择误报原因"
                                >
                                    <el-option
                                        v-for="item in options"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.label"
                                    ></el-option>
                                </el-select>
                            </div>
                        </el-form-item>
                    </el-form>
                    <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="handleOk">
              确 定
            </el-button>
            <el-button @click="handleClose">取 消</el-button>
          </span>
                </el-dialog>
                <TrackDetail
                    :dialog-visible="trackDetailVisible"
                    :table-height="tableHeight"
                    :table-width="tableWidth"
                    :row-data="rowData"
                    :is-check="isCheck"
                    @on-close="trackDetailVisible = false"
                />

                <!--          <TableDialog-->
                <!--            :dialog-visible="tableDialogVisible"-->
                <!--            @on-close="tableDialogVisible = false"-->
                <!--            :table-height="tableHeight"-->
                <!--            :table-width="tableWidth"-->
                <!--            :row-data="rowData"-->
                <!--          />-->


                <MediaFiles
                    :dialog-visible="mediaFilesVisible"
                    :ngixinfo="ngixinfo"
                    :sg="sg"
                    :user-info="userInfo"
                    :media-files-data="mediaFilesData"
                    :table-height="tableHeight"
                    :table-width="tableWidth"
                    :files-bool="filesBool"
                    @on-media-close="mediaFilesVisible = false"
                />
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

<style>
.el-table .info-row {
    color: #c3c3c3;
}
.info-row .cell div>div{background-color:#cccccc!important;}
</style>

<script>
import {
    findAlarmPage,
    saveAlarmLabel,
    batchSaveAlarmLabel,
    getAllAlarmTypes,
} from '@/api/alarm';
import alarmUtils from '@/utils/alarm';
import alarmTableMixin from './AlarmCheckMixin';
import basicInfoMixin from '@/mixins/basicInfoMixin.js';
import {
    ALARM_LEVEL,
    SOURCE_TYPE,
    ALARM_TYPE,
    CHECK_TYPE,
    VALID_TYPE
} from './config';
import {toTimezoneString, toTimeNormalString} from '@/components/util';
import STableType from '@/components/STableType';
import TrackDetail from './components/TrackDetail';
import DropDownTree from '../../../components/DropDownTree';
import InfoSlider from './components/InfoSlider';
import MediaFiles from './components/MediaFiles';
import {findIndexObject} from '../../../utils/common';
// import TableDialog from "./components/TableDialog"; // add by chenying 2021.05.31
const now = new Date();
now.setHours(0);
now.setMinutes(0);
now.setSeconds(0);
now.setMilliseconds(0);
const endTime = now.getTime() + 24 * 60 * 60 * 1000 - 1;
export default {
    name: 'AlarmCheck',
    components: {
        // TableDialog,
        MediaFiles,
        DropDownTree,
        TrackDetail,
        STableType,
        InfoSlider,
    },
    mixins: [alarmTableMixin, basicInfoMixin],
    data() {
        return {
            // option: null,
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
            // 查询参数
            queryParams: {
                checkType: '',
                dateRange: [now, endTime],
                sourceType: '',
                eventTypes: '',
                validType: '',
                level: '',
                vehicleIndexCodes: [],
                approveStatus: undefined,
                datePickerOptions: {
                    disabledDate(time) {
                        return time.getTime() > endTime;
                    },
                    customValidation(start, end) {
                        return end.getTime() - start.getTime() <= 31 * 24 * 60 * 60 * 1000;
                    },
                    customPrompt: '选择时间范围不能超过31天'
                }
            },
            isError: false,
            isBatch: false,
            alarmTypes: [],
            videoAlarmTypes: [],
            loading: false,
            maxAlarms: 100,
            checkForm: {
                radio: '1',
                remark: ''
            },
            isCheck: false,
            checkVisible: false,
            trackDetailVisible: false,
            tableDialogVisible: false,
            mediaFilesVisible: false,
            mediaFilesData: {},
            filesBool: false,
            tableHeight: null,
            tableWidth: null,
            addressInfo: undefined,
            tempRow: {},
            rowData: {},
            indexTemp: 0,
            selectionRow: [],
            tableData: [],
            pageSize: 30,
            pageNo: 1,
            total: 0,
            sliderShow: false,
            sliderInfo: {}
        };
    },
    computed: {
        hCount() {
            return this.tableData.filter(item => item.level === 'h').length;
        },
        mCount() {
            return this.tableData.filter(item => item.level === 'm').length;
        },
        lCount() {
            return this.tableData.filter(item => item.level === 'l').length;
        },
        wCount() {
            return this.tableData.filter(item => item.level === 'w').length;
        }
    },
    created() {
        this.tableRowClassName();
        this.queryParams.type = JSON.parse(JSON.stringify(this.$route.query.type));
        getAllAlarmTypes({type: Number(this.$route.query.type)}).then(json => {
            if (json.code === '0') {
                const arr = [];
                json.data.forEach(item => {
                    const obj = {value: item.eventType, label: item.name};
                    arr.push(obj);
                });
                this.alarmTypes = [...arr];
            }
        });
        getAllAlarmTypes({type: 2}).then(json => {
            if (json.code === '0') {
                const arr = [];
                json.data.forEach(item => {
                    const obj = {value: item.eventType, label: item.name};
                    arr.push(obj);
                });
                this.videoAlarmTypes = [...arr];
            }
        });
        this.handleQuery();
    },
    mounted() {
        this.resize();
        window.addEventListener('resize', this.resize);
    },
    destroyed() {
        window.removeEventListener('resize', this.resize);
    },
    methods: {
        getClick(row){
            // console.log(row)
            return row.relateAlarmId !== null;
        },
        tableRowClassName(row) {
            // update by chenying 2021.06.10
            if (row !== undefined  ) {
                if (row.row.relateAlarmId !== null)
                // 修改表格颜色
                return 'info-row' ;
            }
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
        //  表格数据选择使能
        selectable(row, index) {
            if (!row.isChecked && this.$route.query.approveStatus === '1') {
                return false;
            }
            const bool =
                this.getApproveStatus(row) === '待审核' ||
                this.getApproveStatus(row) === '系统核警';
            const boolNum = bool ? 1 : 2;
            if (
                row.checkStatus === '已复核' &&
                this.$route.query.approveStatus === '2'
            ) {
                return false;
            } else {
                return boolNum === Number(this.$route.query.approveStatus);
            }
        },
        //  核定，复核 disabled
        getApproveType(type, row) {
            // update by chenying 2021.06.09
            return (
                row.relateAlarmId === null && row.eventTypeName !== '超速'
            );
            // return (
            //     type !== Number(this.$route.query.approveStatus) ||
            //         row.checkStatus === '已复核' ||
            //         row.eventTypeName !== '超速'
            // );
        },
        //  获取核警信息
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
        //  时间转换
        getDateTime(time) {
            if (time === null) {
                return '';
            }
            return typeof time !== 'undefined'
                ? toTimeNormalString(toTimezoneString(time))
                : '';
        },
        //  表格查询
        handleQuery() {
            this.loading = true;
            const {
                queryParams: {
                    approveStatus,
                    dateRange,
                    type,
                    sourceType,
                    eventTypes,
                    validType,
                    vehicleIndexCodes,
                    level,
                    checkType
                },
                pageNo,
                pageSize
            } = this;
            const sourceTypeTemp = sourceType === '' ? undefined : sourceType;
            const eventTypesTemp = eventTypes.length === 0 ? undefined : eventTypes;
            const levelTemp = level === '' ? undefined : level;
            const params = {
                approveStatus,
                pageNo,
                pageSize,
                type,
                sourceType: sourceTypeTemp,
                eventTypes: eventTypesTemp,
                level: levelTemp,
                vehicleIndexCodes
            };

            // 待审核，需要包含label为null的
            if (checkType === '-1') {
                params.label = {
                    component: process.env.VUE_APP_COMPONENT_ID,
                    includeNull: true,
                    labels: [[{key: 'approveStatus', value: '-1'}]]
                };
            } else if (checkType) {
                params.label = {
                    component: process.env.VUE_APP_COMPONENT_ID,
                    labels: [[{key: 'approveStatus', value: checkType}]]
                };
            } else {
                // 在这里修改不筛选审核状态，查询为除开 系统审核 的
                // 没有checktype的情况,不选择系统核警的情况
                params.label = {
                    component: process.env.VUE_APP_COMPONENT_ID,
                    includeNull: true,
                    labels: [
                        [{key: 'approveStatus', value: '-1'}],
                        [{key: 'approveStatus', value: '1'}],
                        [{key: 'approveStatus', value: '2'}]
                    ]
                };
            }
            // 核定状态
            if (validType !== '') {
                if (params.label.includeNull === true) {
                    delete params.label.includeNull;
                }
                params.label.labels.forEach(i => {
                    i.push({key: 'valid', value: validType});
                });
            }
            if (dateRange) {
                // if (dateRange[1] - dateRange[0] >= 30 * 24 * 60 * 60 * 1000) {
                //   this.$message.warning('开始日期和结束日期间隔不能超过30天');
                //   return;
                // }
                params.beginTime = toTimezoneString(dateRange[0]);
                params.endTime = toTimezoneString(dateRange[1]);
            }
            this.alarmParams = params;
            findAlarmPage(params)
                .then(res => {
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
                })
                .catch(() => {
                    this.loading = false;
                });
        },
        //  表格查询条件重置
        handleReset() {
            this.$refs.dropdownTree.reset();
            this.queryParams.eventTypes = [];
            this.queryParams.checkType = '';
            this.queryParams.validType = '';
            this.queryParams.sourceType = '';
            this.queryParams.level = '';
            this.queryParams.dateRange = [now, endTime];
        },
        resize() {
            this.tableHeight = this.$refs.pageBox.clientHeight;
            this.tableWidth = this.$refs.pageBox.clientWidth;
        },
        onCurrentChange(pageNo) {
            this.pageNo = pageNo;
            this.handleQuery();
        },
        onSizeChange(pageSize) {
            this.pageSize = pageSize;
            this.handleQuery();
        },
        //  核定
        handleCheck(index, row) {
            this.isBatch = false;
            this.tempRow = row;
            this.indexTemp = index;
            this.isError = false;
            this.checkVisible = true;
        },
        //  批量核定
        handleCheckBatch() {
            this.isError = false;
            this.isBatch = true;
            if (this.selectionRow.length > 0) {
                this.checkVisible = true;
            } else {
                this.$msgbox({
                    title: '提示',
                    type: 'warning',
                    message: '请先选择要核定的报警'
                });
            }
        },
        //  核定提交
        handleOk() {
            if (this.isError && this.checkForm.remark === '') {
                this.$message.error('请选择误报原因');
                return;
            }
            const time = new Date().getTime();
            const checkPerson = this.$store.state.userInfo.userId;
            const alarmRemark =
                this.checkForm.remark === '' ? undefined : this.checkForm.remark;
            const validObj = {
                '0': '误报',
                '1': '有效'
            };
            const valid = validObj[this.checkForm.radio];
            if (this.selectionRow.length > 0 && this.isBatch) {
                const paramArr = [];
                this.selectionRow.forEach(item => {
                    const params = {
                        beginTime: toTimezoneString(item.beginTime),
                        component: process.env.VUE_APP_COMPONENT_ID,
                        eventId: item.eventId,
                        labels: [
                            {key: 'approveStatus', value: this.$route.query.approveStatus},
                            {key: 'alarmRemark', value: this.checkForm.remark},
                            {key: 'valid', value: this.checkForm.radio}
                        ]
                    };
                    if (this.checkForm.radio === '0') {
                        const tempVal = findIndexObject(this.options, ['label', this.checkForm.remark]).value === 0 ? 20 : 21;
                        params.labels.push({key: 'ruleNo', value: String(tempVal)});
                    }
                    paramArr.push(params);
                    this.$set(
                        item,
                        'checkTime',
                        toTimeNormalString(toTimezoneString(time))
                    );
                    this.$set(item, 'checkPerson', checkPerson);
                    this.$set(item, 'alarmRemark', alarmRemark);
                    this.$set(item, 'valid', valid);
                    this.$set(item, 'isChecked', false);
                    if (this.$route.query.approveStatus === '2') {
                        this.$set(item, 'checkStatus', '已复核');
                    }
                });
                batchSaveAlarmLabel(paramArr).then(res => {
                    this.$message({
                        message: '操作成功！',
                        type: 'success'
                    });
                });
            } else {
                const params = {
                    beginTime: toTimezoneString(this.tempRow.beginTime),
                    component: process.env.VUE_APP_COMPONENT_ID,
                    eventId: this.tempRow.eventId,
                    labels: [
                        {key: 'approveStatus', value: this.$route.query.approveStatus},
                        {key: 'alarmRemark', value: this.checkForm.remark},
                        {key: 'valid', value: this.checkForm.radio}
                    ]
                };
                if (this.checkForm.radio === '0') {
                    const tempVal = findIndexObject(this.options, ['label', this.checkForm.remark]).value === 0 ? 20 : 21;
                    params.labels.push({key: 'ruleNo', value: String(tempVal)});
                }
                saveAlarmLabel(params).then(res => {
                    this.$message({
                        message: '操作成功！',
                        type: 'success'
                    });
                    this.$set(
                        this.tableData[this.indexTemp],
                        'checkTime',
                        toTimeNormalString(toTimezoneString(time))
                    );
                    this.$set(this.tableData[this.indexTemp], 'checkPerson', checkPerson);
                    this.$set(this.tableData[this.indexTemp], 'alarmRemark', alarmRemark);
                    this.$set(this.tableData[this.indexTemp], 'valid', valid);
                    this.$set(this.tableData[this.indexTemp], 'isChecked', false);
                    if (this.$route.query.approveStatus === '2') {
                        this.$set(this.tableData[this.indexTemp], 'checkStatus', '已复核');
                    }
                });
            }
            this.checkVisible = false;
            this.resetForm('form');
        },
        //  查看轨迹
        // handleTrack(index, row) {
        //   this.trackDetailVisible = true;
        //   this.rowData = row;
        //   this.isCheck = !this.isCheck;
        // },
        //  update by chenying 2021.05.19
        //
        handleTrack(b) {
            // const beginTime = toTimezoneString(row.beginTime - 10 * 60 * 1000)
            // const endTime = toTimezoneString(row.endTime - 10 * 60 * 1000)
            window.top.goToApp({
                url: '/ctm01ttvm-web/#/location/vehicleTrack',
                name: '行车轨迹',
                param: `indexCode=${b.vehicleIndexCode}&beginTime=${toTimezoneString(b.beginTime - 10 * 60 * 1000)}&endTime=${toTimezoneString(b.endTime + 10 * 60 * 1000)}&plateNo=${b.vehicleLicensePlate}`
            });
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
        handleTrackClose() {
            this.trackDetailVisible = false;
        },
        handleSelectionChange(selection) {
            this.selectionRow = selection;
        },
        handleDetail(r) {
            this.sliderInfo = r;
            this.sliderShow = true;
        },
        handleFiles(r) {
            this.getBasicInfo();
            this.filesBool = !this.filesBool;
            this.mediaFilesData = r;
            this.mediaFilesVisible = true;
        },
        enableFiles(row) {
            if (this.queryParams.type === '1' && row.relateAlarmId === null) {
                return true;
            } else if (this.queryParams.type === '2') {
                const bool = row.picNum > 0 || row.videoNum > 0;
                return !bool;
            } else {
                return (
                    findIndexObject(this.videoAlarmTypes, ['value', row.eventType]) ===
                    undefined
                );
            }
        },
        sliderClose() {
            this.sliderShow = false;
        }
    }
};
</script>

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
            right: 6px;
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
