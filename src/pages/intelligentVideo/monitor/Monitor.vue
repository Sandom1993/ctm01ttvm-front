<template>
    <h-page-container
        class="wrapper"
        :class="{
      'show-alarm': isShowAlarmDetail,
      'show-tab': isShowTab,
      'show-alarm-multi-media': isShowAlarmDetail
    }"
    >
        <div id="map" class="map-container"></div>
        <div class="tree-wrap" :class="{ 'hide-tree': !showVehicleTree }">
            <i class="h-icon-angle_up arrow-icon" @click="toggleVehicleTree"></i>
            <el-tabs value="first" :fix-width="148">
                <el-tab-pane label="车辆列表" name="first">
                    <div class="inner">
                        <vehicle-tree
                            ref="resourceTree"
                            tree-key="indexCode"
                            tree-type="3"
                            :check-limit="2000"
                            :is-need-online="true"
                            :is-need-search-type="true"
                            :slot-line="1"
                            @getSelectedNodes="handleSelectedNodes"
                            @deviceClick="switchDevice"
                        >
                            <template slot="btns">
                                <el-button type="primary" @click="rollCall">点名</el-button>
                                <el-button type="primary" @click="openCaptureDialog">
                                    抓拍
                                </el-button>
                                <el-button type="primary" @click="sendBordcast">调度</el-button>
                            </template>
                        </vehicle-tree>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="收藏车辆" name="second">
                    <div class="inner">
                        <focus-vehicle-tree
                            @getSelectedNodes="handleSelectedNodes"
                            @deviceClick="switchDevice"
                        ></focus-vehicle-tree>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
        <div class="arrow-wrap"  @click="showTabInfo()">
            <i class="h-icon-angle_up"></i>
        </div>
        <div v-show="isShowTab" class="info-tab">
            <el-tabs v-model="activeTab" @tab-click="handleClick">
                <el-tab-pane v-if="false" name="first">
          <span slot="label" class="tab-label">
            实时定位
          </span>
                    <el-table
                        :data="selectedVehicles"
                        stripe
                        highlight-current-row
                        force-scroll
                        enable-virtual-scroll
                        height="224"
                        @row-click="rowClick"
                    >
                        <el-table-column
                            prop="status"
                            label="定位状态"
                            width="10%"
                            min-width="132"
                        >
                            <template slot-scope="scope">
                <span>
                  <span
                      class="vehicle-status-icon"
                      :class="statusMap[scope.row.onlineStatus]"
                  ></span>
                  {{ scope.row.status.text }}
                </span>
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="vehicleLicensePlate"
                            label="车牌号码"
                            width="10%"
                        ></el-table-column>
                        <el-table-column
                            prop="driverName"
                            label="当班驾驶员"
                            width="10%"
                        ></el-table-column>
                        <el-table-column
                            prop="longitude"
                            label="经度"
                            width="10%"
                        ></el-table-column>
                        <el-table-column
                            prop="latitude"
                            label="纬度"
                            width="10%"
                        ></el-table-column>
                        <el-table-column
                            prop="direction"
                            label="方位角(°)"
                            width="10%"
                        ></el-table-column>
                        <el-table-column
                            prop="speed"
                            label="定位速度(km/h)"
                            width="10%"
                        ></el-table-column>
                        <el-table-column
                            prop="time"
                            label="最后定位时间"
                            width="15%"
                        ></el-table-column>
                        <el-table-column
                            prop="orgName"
                            label="所属单位"
                            width="10%"
                        ></el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane name="activeSecurity">
                    <tab-badge slot="label" :value="activityAlarms.length">
                        主动安全
                    </tab-badge>
                    <div>
                        <alarm-level-summary
                            :h-count="activityHCount"
                            :m-count="activityMCount"
                            :l-count="activityLCount"
                            :w-count="activityWCount"
                        >
                            <el-button
                                slot="left"
                                type="text"
                                @click="onBatchDealAlarms('allAlarmTable')"
                            >
                                <i class="h-icon-export"></i>
                                批量处理
                            </el-button>
                        </alarm-level-summary>
                        <location-monitor-alarm-table
                            ref="allAlarmTable"
                            :alarms="activityAlarms"
                            v-loading="locationMoloading"
                            :table-height="180"
                            @deal-alarm="dealAlarm"
                        ></location-monitor-alarm-table>
                    </div>
                </el-tab-pane>
                <el-tab-pane name="fourth">
                    <tab-badge slot="label" :value="riskEvents.length">
                        风险事件
                    </tab-badge>
                    <alarm-level-summary
                        :h-count="riskHCount"
                        :m-count="riskMCount"
                        :l-count="riskLCount"
                        :w-count="riskWCount"
                    ></alarm-level-summary>
                    <el-table
                        :data="riskEvents"
                        v-loading="riskLoading"
                        class="alarm-table"
                        style="width: 100%"
                        height="180"
                        stripe
                    >
                        <el-table-column prop="date" label="开始时间">
                            <template slot-scope="scope">
                                {{ getVehileTime(scope.row.beginTime) }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="date" label="结束时间">
                            <template slot-scope="scope">
                                {{ getVehileTime(scope.row.endTime) }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="date" label="持续时间">
                            <template slot-scope="scope">
                                {{ scope.row.continueTime | formatSeconds }}
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="level"
                            show-overflow-tooltip
                            label="报警级别"
                        >
                            <template slot-scope="scope">
                                <alarm-level :level="scope.row.level"></alarm-level>
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="eventTypeName"
                            label="报警名称"
                        ></el-table-column>
                        <el-table-column
                            prop="vehicleLicensePlate"
                            label="车牌号码"
                        ></el-table-column>
                        <el-table-column
                            prop="driverName"
                            label="当班司机"
                        ></el-table-column>
                        <el-table-column prop="orgName" label="所属单位"></el-table-column>
                        <el-table-column prop="address" label="操作" width="100">
                            <template slot-scope="scope">
                                <el-button
                                    type="link"
                                    size="small"
                                    @click="viewAlarmDetail(scope.row)"
                                >
                                    查看台账
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane v-if="false" name="7">
                    <tab-badge slot="label" :value="earlyMorningAlarms.length">
                        凌晨禁行
                    </tab-badge>
                    <el-table
                        :data="earlyMorningAlarms"
                        class="alarm-table"
                        style="width: 100%"
                        height="224"
                        stripe
                    >
                        <el-table-column prop="date" label="开始时间">
                            <template slot-scope="scope">
                                {{ getVehileTime(scope.row.beginTime) }}
                            </template>
                        </el-table-column>
                        <el-table-column prop="date" label="结束时间">
                            <template slot-scope="scope">
                                {{ getVehileTime(scope.row.endTime) }}
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="level"
                            show-overflow-tooltip
                            label="报警级别"
                        >
                            <template slot-scope="scope">
                                <alarm-level :level="scope.row.level"></alarm-level>
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="eventTypeName"
                            label="报警名称"
                        ></el-table-column>
                        <el-table-column
                            prop="vehicleLicensePlate"
                            label="车牌号码"
                        ></el-table-column>
                        <el-table-column
                            prop="driverName"
                            label="当班司机"
                        ></el-table-column>
                        <el-table-column prop="orgName" label="所属单位"></el-table-column>
                        <el-table-column label="速度">
                            <template slot-scope="scope">{{ scope.row.speed }} km/h</template>
                        </el-table-column>
                        <el-table-column prop="address" label="操作" width="100">
                            <template slot-scope="scope">
                                <el-button
                                    type="link"
                                    size="small"
                                    @click="viewAlarmDetail(scope.row)"
                                >
                                    查看台账
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </div>
        <div class="tool-Bar">
            <map-tool></map-tool>
        </div>
        <div v-show="isShowAlarmDetail" class="alarm-multi-media-wrap">
            <alarm-multi-media
                :alarm="alarmLedger"
                :ngixinfo="ngixinfo"
                :sg="sg"
                :user-info="userInfo"
                @update-sub-alarm="onUpdateSubAlarm"
            ></alarm-multi-media>
        </div>
        <div v-show="isShowAlarmDetail" class="alarm-ledger-wrap">
            <alarm-ledger
                ref="alarmLedger"
                :alarm="alarmLedger"
                :show.sync="isShowAlarmDetail"
                is-show-track
                @update-alarm="onUpdateAlarm"
                @update-risk="onUpdateRisk"
            ></alarm-ledger>
        </div>
        <div v-if="isShowCaptureDialog">
            <captrue-dialog
                :visible.sync="isShowCaptureDialog"
                :channels="captureChannels"
                :vehicle-index-code="captureVehicleIndexCode"
            ></captrue-dialog>
        </div>
        <broadcast-dialog
            ref="BroadcastDialog"
            :vehicles="broadcastVehicles"
            :alarms="broadcastAlarms"
            @saveMessageLabelSuccess="onSaveMessageLabelSuccess"
        ></broadcast-dialog>
        <audit-dialog ref="auditDialog" @refresh="findAlarms"></audit-dialog>
        <vehicle-detail
            :visible.sync="showVehicleDetail"
            :vehicle-index-code="detailvehicleIndexCode"
        ></vehicle-detail>
    </h-page-container>
</template>
<script>
import gpsAlarmMixin from '@/pages/location/monitor/gpsAlarmMixin.js';
import basicInfoMixin from '@/mixins/basicInfoMixin.js';
import vehicleControlMixin from '@/mixins/vehicleControlMixin';
import VehicleTree from '@/components/Tree';
import AlarmLedger from '@/components/alarm/AlarmLedger';
import CaptrueDialog from '@/pages/location/monitor/CaptureDialog';
import BroadcastDialog from '@/components/BroadcastDialog.vue';
import TabBadge from '@/components/TabBadge';
import AlarmLevelSummary from '@/components/AlarmLevelSummary';
import AlarmLevel from '@/components/AlarmLevel';
import {findAlarmPage, auditLedgerQuery} from '@/api/alarm';
import AlarmMultiMedia from '@/components/alarm/AlarmMultiMedia';
import MapTool from '@/pages/location/monitor/MapTool';
import monitorMixin from '@/pages/location/monitor/monitorMixin';
import {toTimezoneString} from '@/components/util.js';
import AuditDialog from '@/components/alarm/AuditDialog';
import {ALARM_INTERVAL} from '@/core/constant';
import LocationMonitorAlarmTable from '@/pages/location/monitor/LocationMonitorAlarmTable';
import alarmUtils from '@/utils/alarm';
import VehicleDetail from '@/pages/location/monitor/VehicleDetail';
import FocusVehicleTree from '@/components/FocusVehicleTree';
import alarmMixin from '@/components/alarm/alarmMixin.js';

// 凌晨禁行
const eventTypes = [132424];

export default {
    name: 'IntelligentVideoMonitor',
    components: {
        VehicleTree,
        AlarmLedger,
        CaptrueDialog,
        BroadcastDialog,
        TabBadge,
        AlarmLevelSummary,
        AlarmLevel,
        AlarmMultiMedia,
        MapTool,
        AuditDialog,
        LocationMonitorAlarmTable,
        VehicleDetail,
        FocusVehicleTree
    },
    mixins: [
        monitorMixin,
        gpsAlarmMixin,
        basicInfoMixin,
        vehicleControlMixin,
        alarmMixin
    ],
    data() {
        return {
            locationMoloading: false,
            riskLoading: false,

            activeTab: 'activeSecurity',
            isShowAlarmMultiMedia: false,
            alarmLedgerWidth: 840,
            riskEvents: []
        };
    },
    computed: {
        // 主动安全报警
        activityAlarms() {
            // 排除凌晨禁行和疲劳驾驶
            return this.allAlarms.filter(
                item => eventTypes.indexOf(item.eventType) === -1
            );
        },
        // 凌晨禁行
        earlyMorningAlarms() {
            return this.allAlarms.filter(item => item.eventType === 132424);
        },
        activityHCount() {
            return this.activityAlarms.filter(item => item.level === 'h').length;
        },
        activityMCount() {
            return this.activityAlarms.filter(item => item.level === 'm').length;
        },
        activityLCount() {
            return this.activityAlarms.filter(item => item.level === 'l').length;
        },
        activityWCount() {
            return this.activityAlarms.filter(item => item.level === 'w').length;
        },
        riskHCount() {
            return this.riskEvents.filter(item => item.level === 'h').length;
        },
        riskMCount() {
            return this.riskEvents.filter(item => item.level === 'm').length;
        },
        riskLCount() {
            return this.riskEvents.filter(item => item.level === 'l').length;
        },
        riskWCount() {
            return this.riskEvents.filter(item => item.level === 'w').length;
        }
    },
    watch: {
        currentRow: {
            deep: true,
            handler(val) {
                this.switchDevice([{id: val}]);
                this.$refs.resourceTree.$refs.resourceTree.setCurrentKey(val);
            }
        }
    },
    mounted() {
        // TODO 暂时去掉风险事件
        // this.findRiskEvents();

    },
    destroyed() {
        if (this.riskInterval) {
            clearInterval(this.riskInterval);
        }
    },

    methods: {
        handleClick(tab) {
            console.log(tab.name)
            if (tab.name === 'fourth') {
                this.findRiskEvents();
                this.riskInterval = setInterval(this.findRiskEvents, ALARM_INTERVAL);

                // 清除主动安全的定时器
                if (this.findAlarmInterval) {
                    clearInterval(this.findAlarmInterval);
                }
            } else {
                // 清除定时器
                if (this.riskInterval) {
                    clearInterval(this.findAlarmInterval);
                }
            }
        },
        // 查询最近一段时间的报警
        findAlarms() {
            this.locationMoloading = true;
            const label = {
                component: process.env.VUE_APP_COMPONENT_ID,
                includeNull: true,
                labels: [
                    [
                        {
                            key: 'valid',
                            value: '1' // 有效报警
                        }
                    ],
                    [
                        {
                            key: 'valid',
                            value: '-1' // 可疑报警
                        }
                    ],
                    [
                        {
                            key: 'valid',
                            value: '-2' // 没有核警过的报警
                        }
                    ]
                ]
            };
            findAlarmPage({
                pageNo: 1,
                pageSize: this.maxAlarms,
                type: 2,
                label
            }).then(json => {
                if (json.code === '0') {
                    this.allAlarms = json.data.list.map(item => {
                        item.speed = alarmUtils.formatSpeed(item.beginSpeed);
                        item.recordSpeed = alarmUtils.formatSpeed(item.recordSpeed);
                        item.latitude = item.beginLatitude;
                        item.longitude = item.beginLongitude;
                        item.direction = item.direction || item.beginDirection;
                        return item;
                    });
                }
                this.locationMoloading = false;
            }).catch( () => {
                this.locationMoloading = false;
            });
        },
        findRiskEvents() {
            this.riskLoading = true;
            const endTime = new Date();
            auditLedgerQuery({
                beginTime: toTimezoneString(endTime.getTime() - 60 * 60 * 1000),
                endTime: toTimezoneString(endTime),
                pageSize: this.maxAlarms,
                pageNo: 1
            }).then(json => {
                if (json.code === '0' && json.data !== null) {
                    const riskEvents = json.data.list || [];
                    riskEvents.forEach(item => {
                        const driver = item.driver || {};
                        const vehicle = item.vehicle || {};
                        item.driverName = driver.driverName;
                        item.driverIndexCode = driver.driverIndexCode;
                        item.tel = driver.driverTel;
                        item.vehicleIndexCode = vehicle.vehicleIndexCode;
                        item.vehicleLicensePlate = vehicle.vehicleLicensePlate;
                        item.eventTypeName = item.eventName;
                        item.beginTime = item.startTime;
                        item.isRiskEvent = true;
                        if (item.approveStatus !== null) {
                            item.label = [
                                {
                                    component: process.env.VUE_APP_COMPONENT_ID,
                                    labels: [
                                        {
                                            key: 'processAction',
                                            value: item.processAction
                                        },
                                        {
                                            key: 'approveStatus',
                                            value: item.approveStatus + ''
                                        },
                                        {
                                            key: 'driverResponse',
                                            value: item.driverResponse
                                        },
                                        {
                                            key: 'valid',
                                            value: item.status + ''
                                        }
                                    ]
                                }
                            ];
                        }
                    });
                    this.riskEvents = riskEvents;
                }
                this.riskLoading =false;
            }).catch(() => {
                this.riskLoading =false;
            });
        },

        viewAlarmDetail(alarm) {
            this.isShowAlarmDetail = true;
            this.alarmLedger = alarm;
            if (alarm.isRiskEvent || alarm.picNum > 0 || alarm.videoNum > 0) {
                this.isShowAlarmMultiMedia = true;
            } else {
                this.isShowAlarmMultiMedia = false;
            }
        },

        // 车辆上下线、车辆报警websocket
        initOnOffWebsocket() {
            if (!this.addr) {
                this.$message.error('获取 CMS IP 失败');
                return;
            }
            if (process.env.NODE_ENV === 'development') {
                this.wsOnOff = new WebSocket(
                    'ws://10.196.42.111:17001/ctm01ttvm-web/socket'
                );
            } else {
                this.wsOnOff = new WebSocket(`${this.addr}/ctm01ttvm-web/socket`);
            }

            this.wsOnOff.addEventListener('open', () => {
                this.isListeningOnOff = true;
                // console.log('onoff 连接成功');
            });
            this.wsOnOff.onclose = () => {
                this.isListeningOnOff = false;
                // console.log('onoff 关闭');
            };
            this.wsOnOff.addEventListener('error', event => {
                this.isListeningOnOff = false;
                // console.log(`error!!!!${event}`);
            });
            this.wsOnOff.addEventListener('message', event => {
                const data = JSON.parse(event.data);
                // 车辆上下线
                if (data.params && data.params.ability === 'event_msa_onoff') {
                    this.vehicleOnOff = this.vehicleOnOff.concat(
                        data.params.events.map(item => item.data)
                    );
                }
            });
        },
        onUpdateSubAlarm(subAlarm) {
            this.$refs.alarmLedger.updateSubAlarm(subAlarm);
        },
        onUpdateRisk(eventId, labels) {
            const label = [
                {
                    component: process.env.VUE_APP_COMPONENT_ID,
                    labels: labels
                }
            ];
            const index = this.riskEvents.findIndex(item => item.eventId === eventId);
            if (index > -1) {
                this.riskEvents.splice(index, 1, {
                    ...this.riskEvents[index],
                    label: label
                });
            }
            if (this.alarmLedger && this.alarmLedger.eventId === eventId) {
                this.alarmLedger = {
                    ...this.alarmLedger,
                    label: label
                };
            }
        }
    }
};
</script>

<style src="@/pages/location/monitor/monitor.scss" lang="scss" scoped></style>
<style src="@/pages/location/location.css"></style>
