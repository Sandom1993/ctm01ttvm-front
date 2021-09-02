<template>
    <h-page-container
        v-loading="rollCallLoading"
        class="wrapper"
        :class="{ 'show-alarm': isShowAlarmDetail, 'show-tab': isShowTab }"
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
<!--        <div class="arrow-wrap" @click="isShowTab = !isShowTab">-->
<!--            <i class="h-icon-angle_up"></i>-->
<!--        </div>-->
        <div class="arrow-wrap" @click="showTabInfo()">
            <i class="h-icon-angle_up"></i>
        </div>
        <div v-show="isShowTab" class="info-tab">
            <el-tabs v-model="activeTab" :fix-width="148">
                <el-tab-pane name="alarmTab" label="部标报警">
                    <el-tabs v-model="activeAlarmTab" type="border-card" class="sub-tab" @tab-click="handleTabClick">
                        <el-tab-pane name="1">
                            <tab-badge slot="label" :value="allAlarms.length">
                                全部
                            </tab-badge>
                            <div>
                                <alarm-level-summary :show-summary="false">
                                    <el-button
                                        slot="left"
                                        type="text"
                                        @click="onBatchDealAlarms('allAlarmsTable')"
                                    >
                                        <i class="h-icon-export"></i>
                                        批量处理
                                    </el-button>
                                </alarm-level-summary>
                                <location-monitor-alarm-table
                                    ref="allAlarmsTable"
                                    v-loading="locationMoloading"
                                    :alarms="allAlarms"
                                    :table-height="180"
                                    @deal-alarm="dealAlarm"
                                ></location-monitor-alarm-table>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane name="2">
                            <alarm-level-summary :show-summary="false">
                                <el-button
                                    slot="left"
                                    type="text"
                                    @click="onBatchDealAlarms('speedAlarmsTable')"
                                >
                                    <i class="h-icon-export"></i>
                                    批量处理
                                </el-button>
                            </alarm-level-summary>
                            <tab-badge slot="label" :value="speedAlarms.length">
                                超速报警
                            </tab-badge>
                            <location-monitor-alarm-table
                                ref="speedAlarmsTable"
                                :alarms="speedAlarms"
                                :table-height="180"
                                @deal-alarm="dealAlarm"
                            ></location-monitor-alarm-table>
                        </el-tab-pane>
                        <el-tab-pane name="3">
                            <tab-badge slot="label" :value="areaAlarms.length">
                                越界行驶
                            </tab-badge>
                            <alarm-level-summary :show-summary="false">
                                <el-button
                                    slot="left"
                                    type="text"
                                    @click="onBatchDealAlarms('areaAlarmsTable')"
                                >
                                    <i class="h-icon-export"></i>
                                    批量处理
                                </el-button>
                            </alarm-level-summary>
                            <location-monitor-alarm-table
                                ref="areaAlarmsTable"
                                :alarms="areaAlarms"
                                :table-height="180"
                                @deal-alarm="dealAlarm"
                            ></location-monitor-alarm-table>
                        </el-tab-pane>
                        <el-tab-pane name="4">
                            <tab-badge slot="label" :value="tiredAlarms.length">
                                疲劳驾驶
                            </tab-badge>
                            <alarm-level-summary :show-summary="false">
                                <el-button
                                    slot="left"
                                    type="text"
                                    @click="onBatchDealAlarms('tiredAlarmsTable')"
                                >
                                    <i class="h-icon-export"></i>
                                    批量处理
                                </el-button>
                            </alarm-level-summary>
                            <location-monitor-alarm-table
                                ref="tiredAlarmsTable"
                                :alarms="tiredAlarms"
                                :table-height="180"
                                @deal-alarm="dealAlarm"
                            ></location-monitor-alarm-table>
                        </el-tab-pane>
                        <el-tab-pane label="凌晨禁行" name="5">
                            <tab-badge slot="label" :value="earlyMorningAlarms.length">
                                凌晨禁行
                            </tab-badge>
                            <alarm-level-summary :show-summary="false">
                                <el-button
                                    slot="left"
                                    type="text"
                                    @click="onBatchDealAlarms('earlyMorningAlarmsTable')"
                                >
                                    <i class="h-icon-export"></i>
                                    批量处理
                                </el-button>
                            </alarm-level-summary>
                            <location-monitor-alarm-table
                                ref="earlyMorningAlarmsTable"
                                :alarms="earlyMorningAlarms"
                                :table-height="180"
                                @deal-alarm="dealAlarm"
                            ></location-monitor-alarm-table>
                        </el-tab-pane>
                        <el-tab-pane label="其他" name="6">
                            <tab-badge slot="label" :value="otherAlarms.length">
                                其他
                            </tab-badge>
                            <alarm-level-summary :show-summary="false">
                                <el-button
                                    slot="left"
                                    type="text"
                                    @click="onBatchDealAlarms('otherAlarmsTable')"
                                >
                                    <i class="h-icon-export"></i>
                                    批量处理
                                </el-button>
                            </alarm-level-summary>
                            <location-monitor-alarm-table
                                ref="otherAlarmsTable"
                                :alarms="otherAlarms"
                                :table-height="180"
                                @deal-alarm="dealAlarm"
                            ></location-monitor-alarm-table>
                        </el-tab-pane>
                        <el-tab-pane label="紧急报警" name="seventh">
                            <tab-badge slot="label" :value="emergencyAlarms.length">
                                紧急报警
                            </tab-badge>
                            <div>
                                <div slot="left" style="height: 48px; line-height: 48px;">
                                    <el-button
                                        type="text"
                                        :show-summary="false"
                                        @click="onBatchDealAlarms('emergencyAlarms')"
                                    >
                                        <i class="h-icon-export"></i>
                                        批量处理
                                    </el-button>
                                    <!-- <el-checkbox v-model="filterAutoDeal" @change="findAlarms">
                                      过滤自动处警
                                    </el-checkbox> -->
                                </div>
                            </div>
                            <emergency-alarm-table
                                ref="emergencyAlarms"
                                v-loading="emergencyLoading"
                                :alarms="emergencyAlarms"
                                :table-height="180"
                                :is-realtime="true"
                                @deal-alarm="dealAlarm"
                            ></emergency-alarm-table>
                        </el-tab-pane>
                    </el-tabs>
                </el-tab-pane>
                <el-tab-pane name="statusTab" label="车辆状态">
                    <el-table
                        :data="selectedVehicles"
                        stripe
                        highlight-current-row
                        force-scroll
                        enable-virtual-scroll
                        height="224"
                        style="margin-top: 20px;"
                        @row-click="rowClick"
                    >
                        <el-table-column
                            prop="vehicleLicensePlate"
                            label="车牌号码"
                            width="120"
                        ></el-table-column>
                        <el-table-column prop="status" label="状态" width="120">
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
                            prop="driverName"
                            label="当班驾驶员"
                            width="120"
                        ></el-table-column>
                        <el-table-column
                            prop="longitude"
                            label="经度"
                            width="120"
                        ></el-table-column>
                        <el-table-column
                            prop="latitude"
                            label="纬度"
                            width="120"
                        ></el-table-column>
                        <el-table-column
                            prop="direction"
                            label="方位角(°)"
                            width="120"
                        ></el-table-column>
                        <el-table-column prop="speed" label="定位速度(km/h)" width="180">
                            <template slot-scope="scope">{{ scope.row.speed }} km/h</template>
                        </el-table-column>
                        <el-table-column
                            prop="time"
                            label="最后定位时间"
                            width="180"
                        ></el-table-column>
                        <el-table-column label="ACC"></el-table-column>
                    </el-table>
                    <!-- <el-tabs v-model="atcitveStatusTab">
                      <el-tab-pane name="1">
                        <span slot="label" class="tab-label">
                          实时定位
                        </span>

                      </el-tab-pane>
                      <el-tab-pane name="2">
                        <tab-badge slot="label" :value="vehicleOnOff.length">
                          设备上下线
                        </tab-badge>
                        <el-table
                          :data="vehicleOnOff"
                          stripe
                          highlight-current-row
                          force-scroll
                          enable-virtual-scroll
                          height="224"
                        >
                          <el-table-column
                            prop="vehiclePlate"
                            label="车牌号码"
                          ></el-table-column>
                          <el-table-column label="上线/下线">
                            <template slot-scope="scope">
                              {{ scope.row.onOffType === 0 ? '下线' : '上线' }}
                            </template>
                          </el-table-column>
                          <el-table-column label="上线/下线时间">
                            <template slot-scope="scope">
                              {{ scope.row.onOffTime | formateDateTime }}
                            </template>
                          </el-table-column>
                        </el-table>
                      </el-tab-pane>
                      <el-tab-pane name="3">
                        <tab-badge slot="label" :value="longTimeOffVehicles.length">
                          车辆长期离线
                        </tab-badge>
                        <el-table
                          :data="longTimeOffVehicles"
                          stripe
                          highlight-current-row
                          force-scroll
                          enable-virtual-scroll
                          height="224"
                        >
                          <el-table-column
                            prop="vehiclePlate"
                            label="车牌号码"
                          ></el-table-column>
                          <el-table-column label="离线时间">
                            <template slot-scope="scope">
                              {{ scope.row.onOffTime | formateDateTime }}
                            </template>
                          </el-table-column>
                        </el-table>
                      </el-tab-pane>
                    </el-tabs> -->
                </el-tab-pane>
                <el-tab-pane name="gpsMonitor" label="GPS监控">
                    <el-table
                        :data="gpsMonitorData"
                        stripe
                        highlight-current-row
                        force-scroll
                        enable-virtual-scroll
                        height="224"
                        style="margin-top: 20px;"
                    >
                        <el-table-column
                            prop="vehicleLicensePlate"
                            label="车牌号码"
                            width="120"
                        ></el-table-column>
                        <el-table-column
                            prop="time"
                            label="GPS时间"
                            width="120"
                        ></el-table-column>
                        <el-table-column
                            prop="longitude"
                            label="经度"
                            width="120"
                        ></el-table-column>
                        <el-table-column
                            prop="latitude"
                            label="纬度"
                            width="120"
                        ></el-table-column>
                        <el-table-column
                            prop="address"
                            label="位置"
                            width="280"
                        ></el-table-column>
                        <el-table-column prop="speed" label="定位速度(km/h)" width="180">
                            <template slot-scope="scope">
                                {{ getSpeed(scope.row.speed) ? getSpeed(scope.row.speed) + ' km/h' : '' }}
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="limitSpeed"
                            label="限速值(km/h)"
                            width="120"
                        >
                            <template slot-scope="scope">
                                {{ scope.row.limitSpeed ? scope.row.limitSpeed + ' km/h' : '' }}
                            </template>
                        </el-table-column>
                        <!--            <el-table-column-->
                        <!--              prop="action"-->
                        <!--              label="操作"-->
                        <!--              width="100"-->
                        <!--            >-->
                        <!--              <template slot-scope="scope">-->
                        <!--                <el-button-->
                        <!--                  type="text"-->
                        <!--                  size="mini"-->
                        <!--                  style="color: #2196F3"-->
                        <!--                  @click="handleCall(scope.row)"-->
                        <!--                >-->
                        <!--                  点名-->
                        <!--                </el-button>-->
                        <!--              </template>-->
                        <!--            </el-table-column>-->
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </div>
        <div class="tool-Bar">
            <map-tool></map-tool>
        </div>
        <div v-show="isShowAlarmDetail" class="alarm-ledger-wrap">
            <alarm-ledger
                is-show-track
                :alarm="alarmLedger"
                :show.sync="isShowAlarmDetail"
                @update-alarm="onUpdateAlarm"
                @update-message-label="onUpdateMessageLabel"
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
        <!--    <audit-dialog ref="auditDialog" @refresh="findAlarms"></audit-dialog>-->
        <vehicle-detail
            :visible.sync="showVehicleDetail"
            :vehicle-index-code="detailvehicleIndexCode"
            :vehicle-org-name="detailvehicleOrgName"
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
import {
    findAlarmPage,
    getLongTimeOffVehicles,
    pageOnOffVehicles,
    getFocusVehicleList
} from '@/api/alarm';
import MapTool from '@/pages/location/monitor/MapTool';
import monitorMixin from '@/pages/location/monitor/monitorMixin';
import AuditDialog from '@/components/alarm/AuditDialog';
import LocationMonitorAlarmTable from '@/pages/location/monitor/LocationMonitorAlarmTable';
import alarmUtils from '@/utils/alarm';
import VehicleDetail from '@/pages/location/monitor/VehicleDetail';
import FocusVehicleTree from '@/components/FocusVehicleTree';
import alarmMixin from '@/components/alarm/alarmMixin.js';
import {toTimezoneString} from '@/components/util.js';
import EmergencyAlarmTable from '../../../components/alarm/EmergencyAlarmTable';
import {ALARM_INTERVAL} from "@/core/constant";

const eventTypes = [
    132408,
    132409,
    132418,
    132406,
    132405,
    132419,
    132407,
    132424
];

export default {
    name: 'Monitor',
    components: {
        EmergencyAlarmTable,
        VehicleTree,
        AlarmLedger,
        CaptrueDialog,
        BroadcastDialog,
        TabBadge,
        AlarmLevelSummary,
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
            // fangjialong 增加聚合
            // isCluster: true,
            locationMoloading: false,
            rollCallLoading: false,
            activeTab: 'alarmTab',
            activeAlarmTab: '1',
            atcitveStatusTab: '1',
            emergencyAlarms: [],
            emergencyLoading: false,
            props: {
                label: 'name'
            },
            dataAsync: [
                {
                    name: '收藏车辆',
                    children: []
                }
            ]
        };
    },
    computed: {
        // 越界报警
        areaAlarms() {
            return this.allAlarms.filter(
                item =>
                    item.eventType === 132408 ||
                    item.eventType === 132409 ||
                    item.eventType === 132418
            );
        },
        // 超速报警
        speedAlarms() {
            return this.allAlarms.filter(
                item =>
                    item.eventType === 132406 ||
                    item.eventType === 132405 ||
                    item.eventType === 132419
            );
        },
        // 疲劳报警
        tiredAlarms() {
            return this.allAlarms.filter(
                item =>
                    item.eventType === 225442 ||
                    item.eventType === 225443 ||
                    item.eventType === 132370 ||
                    item.eventType === 132371
            );
        },
        // 凌晨禁行
        earlyMorningAlarms() {
            return this.allAlarms.filter(item => item.eventType === 132424);
        },
        // 运营违规
        violationAlarms() {
            return this.allAlarms.filter(
                item => eventTypes.indexOf(item.eventType) !== -1
            );
        },
        // 其他报警
        otherAlarms() {
            return this.allAlarms.filter(
                item => eventTypes.indexOf(item.eventType) === -1
            );
        },
        violationHCount() {
            return this.violationAlarms.filter(item => item.level === 'h').length;
        },
        violationMCount() {
            return this.violationAlarms.filter(item => item.level === 'm').length;
        },
        violationLCount() {
            return this.violationAlarms.filter(item => item.level === 'l').length;
        },
        violationWCount() {
            return this.violationAlarms.filter(item => item.level === 'w').length;
        }
    },
    watch: {
        showVehicleTree: function (n, o) {
            if (n) {
                document
                    .getElementsByClassName('olControlPanZoomBarEx')[0]
                    .style.setProperty('left', '340px', 'important');
                document
                    .getElementsByClassName('olControlScaleLine')[0]
                    .style.setProperty('left', '340px', 'important');
            } else {
                document
                    .getElementsByClassName('olControlPanZoomBarEx')[0]
                    .style.setProperty('left', '40px', 'important');
                document
                    .getElementsByClassName('olControlScaleLine')[0]
                    .style.setProperty('left', '40px', 'important');
            }
        }
    },
    mounted() {
        // this.findLongTimeOffVehicles();
        // this.findOnOffVehicles();
        // this.getFocusVehicles();
    },

    methods: {
        getEventTypeName(obj) {
            const alarmInfo = obj.alarmInfo;
            if (JSON.parse(alarmInfo)) {
                const str = parseInt(JSON.parse(alarmInfo).alarmFlag).toString(2);
                let strTemp = str.substring(str.length - 3, str.length);
                while (strTemp.length < 3) {
                    strTemp = '0' + strTemp;
                }
                switch (strTemp) {
                    case '001':
                        return '紧急报警';
                    case '011':
                        return '紧急报警，超速';
                    case '101':
                        return '紧急报警，疲劳驾驶';
                    case '111':
                        return '紧急报警，超速，疲劳驾驶';
                }
            } else {
                return '';
            }
        },
        handleTabClick(tab, event) {
            if (tab.name === 'seventh') {
                const now = new Date();
                const params = {
                    endTime: toTimezoneString(now),
                    beginTime: toTimezoneString(now.getTime() - 60 * 60 * 1000),
                    // endTime: '2021-04-30T16:01:38.000+08:00',
                    // beginTime: '2021-04-30T16:01:38.000+08:00',
                    pageNo: 1,
                    pageSize: 100,
                    eventTypes: [132441],
                    type: 2,
                    vehicleIndexCodes: ['266f5f04549742e1a1847613114ca218']
                    // vehicleIndexCodes: ['2b4bbbd50b13465e8a8fd7f96229447d']
                };
                this.emergencyLoading = true;
                findAlarmPage(params)
                    .then(json => {
                        console.log('handleTab')
                        if (json.code === '0') {
                            // this.alarmParams = params;
                            this.total = json.data.total;
                            this.emergencyAlarms = json.data.list;
                            this.emergencyAlarms = this.emergencyAlarms.map(item => {
                                item.speed = alarmUtils.formatSpeed(item.beginSpeed);
                                item.maxSpeed = alarmUtils.formatSpeed(item.maxSpeed ? item.maxSpeed : 0);
                                item.recordSpeed = alarmUtils.formatSpeed(item.recordSpeed);
                                item.eventTypeName = this.getEventTypeName(item);
                                item.latitude = item.beginLatitude;
                                item.longitude = item.beginLongitude;
                                item.direction = item.beginDirection;
                                return item;
                            });
                        }
                    })
                    .finally(() => {
                        this.emergencyLoading = false;
                    });
            }
        },
        getSpeed(speed) {
            return alarmUtils.formatSpeed(speed);
        },
        getFocusVehicles() {
            getFocusVehicleList().then(json => {
                if (json.code === '0') {
                    this.dataAsync = [
                        {
                            name: '收藏车辆',
                            children: json.data
                        }
                    ];
                }
            });
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
            // this.allAlarms = [{ confirm: '未确认' }, { confirm: '未确认' }, { confirm: '未确认' }]; // 假数据--测试确认操作
            findAlarmPage({
                pageNo: 1,
                pageSize: this.maxAlarms,
                type: 1,
                label
            }).then(json => {
                console.log('findAlarms')
                if (json.code === '0') {
                    this.allAlarms = json.data.list
                        .filter(i => {
                            const broadcast = alarmUtils.getLabelValueByKey(i, 'broadcast');
                            if (broadcast === '1' || broadcast === '2') {
                                return false;
                            }
                            return true;
                        })
                        .map(item => {
                            // item.confirm = '未确认';
                            item.speed = alarmUtils.formatSpeed(item.beginSpeed);
                            item.maxSpeed = alarmUtils.formatSpeed(
                                item.maxSpeed ? item.maxSpeed : 0
                            );
                            item.recordSpeed = alarmUtils.formatSpeed(item.recordSpeed);
                            item.latitude = item.beginLatitude;
                            item.longitude = item.beginLongitude;
                            item.direction = item.direction || item.beginDirection;
                            return item;
                        });
                    this.locationMoloading = false;
                }
            }).catch( () => {
                this.locationMoloading = false;
            });
        },
        findLongTimeOffVehicles() {
            getLongTimeOffVehicles().then(json => {
                if (json.code === '0') {
                    this.longTimeOffVehicles = json.data || [];
                }
            });
        },
        findOnOffVehicles() {
            pageOnOffVehicles({
                pageNo: 1,
                pageSize: 30
            }).then(json => {
                if (json.code === '0') {
                    if (json.data) {
                        this.vehicleOnOff = json.data.list;
                    }
                }
            });
        },

        viewAlarmDetail(alarm) {
            this.isShowAlarmDetail = true;
            this.alarmLedger = alarm;
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
        }
    }
};
</script>

<style src="@/pages/location/monitor/monitor.scss" lang="scss" scoped></style>
<style src="@/pages/location/location.css"></style>
<style lang="scss" scoped>
.info-tab {
    height: 296px;
}

.show-tab .tree-wrap {
    bottom: 296px;
}

.show-tab .arrow-wrap {
    bottom: 296px;
}

::v-deep .olControlPanZoomBarEx {
    left: 340px !important;
    bottom: 340px !important;
}

::v-deep .olControlScaleLine {
    left: 340px !important;
    bottom: 50px !important;
}
</style>
