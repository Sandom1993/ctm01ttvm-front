<template>
    <h-page-container id="vehicleTrack" v-loading="loading" class="wrapper">
        <div id="map" class="map-container"></div>
        <div v-show="isShow" class="tree-wrap">
            <el-tabs
                v-model="carActiveTab"
                class="pannel-wrap"
                :fix-width="148"
                @tab-click="carTableClick"
            >
                <el-tab-pane label="车辆列表" name="normal">
                    <div class="inner">
                        <vehicle-tree
                            ref="resourceTree"
                            tree-key="indexCode"
                            tree-type="3"
                            :select-one-node="defaultNode"
                            :top="10"
                            :slot-line="2"
                            :is-need-online="true"
                            :is-need-search-type="true"
                            :is-need-check-box="false"
                            @deviceClick="handleSelectedNodes"
                        >
                            <template slot="time">
                                <el-date-picker
                                    v-model="time"
                                    type="datetimerange"
                                    :picker-options="pickerOptions"
                                    :start-placeholder="
                    time[0] instanceof Date
                      ? toTimeNormalString(
                        toTimezoneString(this.time[0])
                      ).replace(/-/g, '/')
                      : toTimeNormalString(
                        toTimezoneString(
                          new Date(new Date().toLocaleDateString())
                        )
                      ).replace(/-/g, '/')
                  "
                                    :end-placeholder="
                    time[1] instanceof Date
                      ? toTimeNormalString(
                        toTimezoneString(this.time[1])
                      ).replace(/-/g, '/')
                      : toTimeNormalString(
                        toTimezoneString(
                          new Date(
                            new Date(
                              new Date().toLocaleDateString()
                            ).getTime() +
                              24 * 60 * 60 * 1000 -
                              1
                          )
                        )
                      ).replace(/-/g, '/')
                  "
                                    :clearable="false"
                                />
                            </template>
                            <template slot="btns">
                                <el-button type="primary" @click="searchGps">查询</el-button>
                            </template>
                        </vehicle-tree>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="收藏车辆" name="collect" class="collect-car-list">
                    <div class="inner">
                        <focus-vehicle-tree
                            ref="focusTree"
                            @deviceClick="handleSelectedNodes"
                        ></focus-vehicle-tree>
                        <div class="time-wrap">
                            <el-date-picker
                                v-model="focusTime"
                                type="datetimerange"
                                :picker-options="pickerOptions"
                                :clearable="false"
                            />
                        </div>
                        <div class="btns-wrap">
                            <el-button type="primary" @click="searchGps">查询</el-button>
                        </div>
                    </div>
                </el-tab-pane>
                <!-- DELAY_TASK -->
                <!-- <el-tab-pane label="区域" name="area">
                  暂无内容
                </el-tab-pane> -->
            </el-tabs>
        </div>
        <i
            :class="{ 'h-icon-angle_down arrow': true, rotate: isShow }"
            @click="isShow = !isShow"
        ></i>
        <track-tool-bar
            v-show="gpsTotalResult.length"
            ref="trackToolBar"
            class="track-tool-bar"
            :max="gpsTotalResult.length > 0 ? gpsTotalResult.length : 1"
            :time="progressTimeRange"
            :time-list="gpsTotalResult.map(v => v.time)"
            @startT="startT"
            @pauseT="pauseT"
            @sliderChange="restartT"
            @speedUp="speedupTrace"
            @speedDown="speeddownTrace"
            @chartShow="chartShow"
            @trackSetting="trackDialogVisible = true"
        >
            >
        </track-tool-bar>
        <!-- <div
          v-show="
            (isShowTab === false) & gpsTotalResult.length && activeTab === 'gps'
          "
          class="arrow-container"
          @click="isShowTab = true"
        >
          <i class="h-icon-angle_up"></i>
        </div> -->
        <speed-card
            v-show="gpsTotalResult.length && isShowTab"
            ref="speedCard"
            :speed-level="speedLevel"
        />
        <!-- <div
          v-show="showAlarmLedger && activeTab === 'alarm'"
          class="alarm-ledger-wrap"
        >
          <alarm-ledger
            :alarm="alarmLedger"
            :show.sync="showAlarmLedger"
            readonly
            @update-alarm="showAlarmLedger = false"
          ></alarm-ledger>
        </div> -->
        <map-menu
            :style="{ right: gpsTotalResult.length ? '440px' : '15px' }"
            @measure="mapMeasure"
            @signPoint="mapSignPoint"
            @doNone="mapDoNone"
        />
        <div
            v-show="gpsTotalResult.length"
            :class="{ 'data-container': 1, 'data-container-close': !rightIsShow }"
        >
            <selected-car-card
                ref="selectedCarCard"
                @close="rightIsShow = !rightIsShow"
            ></selected-car-card>
            <data-info-card
                v-show="rightIsShow"
                class="data-info-card"
                :gps="status.gpsTotal"
                :ava="status.validTotal"
                :unava="status.inValidTotal"
                :pop="status.correctRate"
                :pot="status.integrityRate"
                :pov="status.validRate"
                :mil="status.mileage"
            ></data-info-card>
            <el-tabs
                v-show="rightIsShow"
                v-model="activeTab"
                :fix-width="120"
                class="pannel-wrap tab-table"
                @tab-click="tabClick"
            >
        <span class="tab-table-do">
          <!-- DELAY_TASK -->
            <!-- <span><i class="h-icon-export"></i>导出</span> -->
          <span v-if="activeTab === 'gps'" @click="tableConfig">
            <i class="h-icon-setting"></i>
            配置
          </span>
            <!-- <span v-if="activeTab !== 'gps'" @click="tableFilter"><i class="h-icon-filter"></i>筛选</span> -->
        </span>
                <el-tab-pane label="轨迹" name="gps">
                    <vehicle-gps-table
                        class="body-container"
                        :table-data="gpsTotalResult"
                        :show-data="existTargetData"
                        @gpsTableClick="tableClick"
                    />
                </el-tab-pane>
                <el-tab-pane label="报警" name="alarm">
                    <alarm-table
                        class="body-container"
                        :table-data="alarmResult"
                        @alarmTableClick="tableClick"
                    />
                </el-tab-pane>
                <!-- DELAY_TASK -->
                <!-- <el-tab-pane label="停车点" name="park">
                </el-tab-pane> -->
            </el-tabs>
        </div>
        <track-dialog
            ref="trackConfig"
            :dialog-visible="trackDialogVisible"
            @closed="trackDialogVisible = false"
            @trackConfig="trackConfig"
        ></track-dialog>
        <alarm-dialog
            :dialog-visible="alarmDialogVisible"
            @alarmConfig="alarmConfig"
            @closed="alarmDialogVisible = false"
        ></alarm-dialog>
        <table-transfer-dialog
            :exist-target-data="existTargetData"
            :dialog-visible="trackTableDialogVisible"
            @closed="trackTableDialogVisible = false"
            @trackTableConfig="trackTableConfig"
        ></table-transfer-dialog>
    </h-page-container>
</template>
<script>
import  Vue from 'vue';
import {initMap, clearMap, setMapCenter} from './map.js';
import {
    popAlarmContext,
    popParkContext,
    popTraceContext,
    popFenceInfo
} from './popup.js';
import mapStart from '../../../assets/png/map-start.png';
import mapEnd from '../../../assets/png/map-end.png';
import mapVehicleRight from '../../../assets/png/map-vehicle-right.png';
// import { setMapCenter } from '@/pages/location/monitor/maptools';
import VehicleTree from '@/components/TreeNew';
import FocusVehicleTree from '@/components/FocusVehicleTreeNew';
import VehicleGpsTable from './VehicleGpsTableNew';
import AlarmTable from './AlarmTable';
import SpeedCard from './SpeedCardNew';
import AlarmLedger from '@/components/alarm/AlarmLedger';
import TrackToolBar from '@/components/TrackToolBar';
import TrackDialog from './TrackDialog';
import AlarmDialog from './AlarmDialog';
import TableTransferDialog from './TableTransferDialog';
import {
    queryVehicleStatus,
    gethistoryGps,
    findFenceByVehicle
} from '@/api/vehicleTrack';
import {findAlarmPage} from '@/api/alarm';
import {
    toTimezoneString,
    toTimeNormalString,
    normalStringToTime
} from '@/components/util.js';
import alarmUtils from '@/utils/alarm';
import SelectedCarCard from './SelectedCar2d';
import DataInfoCard from './DataInfoCard';
import MapMenu from './MapMenu';
import {
    createMarker,
    setMarkerRotation,
    toVectorList,
    redrawMarker
} from './trackmarkertool';
import {
    drawGeoFence,
    drawCircleFence,
    hidFence,
    showFence
} from './fencedraw';
import {throttle} from 'throttle-debounce';

export default {
    name: 'VehicleTrack',
    components: {
        VehicleTree,
        VehicleGpsTable,
        SpeedCard,
        AlarmTable,
        AlarmLedger,
        SelectedCarCard,
        DataInfoCard,
        TrackToolBar,
        TrackDialog,
        AlarmDialog,
        TableTransferDialog,
        FocusVehicleTree,
        MapMenu
    },
    data() {
        return {
            isShowTab: false,
            isShow: true,
            rightIsShow: true,
            activeTab: 'gps',
            carActiveTab: 'normal',
            selectedDevices: [],
            vehicleIndexCodes: [],
            deviceName: '设备名称',
            status: {
                gpsTotal: 0,
                validTotal: 0,
                inValidTotal: 0,
                correctRate: '0.0%',
                integrityRate: '0.0%',
                validRate: '0.0%',
                mileage: 0,
            },
            gpsTotalResult: [],
            alarmResult: [],
            alarmLedger: {},
            speedNum: 1,
            // showAlarmLedger: false,
            popup: null,
            fencePopup: null,
            loading: false,
            map: null,
            vectorLayer: null,
            traceLayer: null,
            markerLayer: null,
            fenceSpeedLimitLayer: null,
            fenceAreaLimitLayer: null,
            trackMarkerLayer: null,
            trace: null,
            isStart: false,
            trackDialogVisible: false,
            alarmDialogVisible: false,
            trackTableDialogVisible: false,
            // 轨迹表格,已经默认存在的显示项
            existTargetData: ['GPS时间', 'GPS速度', '限速值', 'GPS接收时间', 'ACC'],
            progressTimeRange: ['', ''],
            defaultNode: '',
            hasRestart: false,
            // 轨迹速度阈值
            speedLevel: 80,
            // 轨迹显示类型，点或者线
            trackDisplayType: '全轨迹',
            // 配置按钮返回的的菜单
            menuList: [],
            // 用于上一个的点位储存
            lastIndex: 0,
            // 用于储存vector的feature信息
            vectorList: [],
            time: ['', ''],
            // [
            // new Date(new Date().toLocaleDateString()),
            // new Date(
            //   new Date(new Date().toLocaleDateString()).getTime() +
            //     24 * 60 * 60 * 1000 -
            //     1
            // )
            // ],
            focusTime: [
                new Date(new Date().toLocaleDateString()),
                new Date(
                    new Date(new Date().toLocaleDateString()).getTime() +
                    24 * 60 * 60 * 1000 -
                    1
                )
            ],
            pickerOptions: {
                shortcuts: [
                    {
                        text: '一天前',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.setHours(0, 0, 0, 0) - 3600 * 1000 * 24);
                            end.setTime(end.setHours(0, 0, 0, 0) - 1);
                            picker.$emit('pick', [start, end], true);
                        }
                    },
                    {
                        text: '三天前',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.setHours(0, 0, 0, 0) - 3600 * 1000 * 24 * 4);
                            end.setTime(end.setHours(0, 0, 0, 0) - 3600 * 1000 * 24 * 3 - 1);
                            picker.$emit('pick', [start, end], true);
                        }
                    },
                    {
                        text: '一周前',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.setHours(0, 0, 0, 0) - 3600 * 1000 * 24 * 8);
                            end.setTime(end.setHours(0, 0, 0, 0) - 3600 * 1000 * 24 * 7 - 1);
                            picker.$emit('pick', [start, end], true);
                        }
                    }
                ],
                customValidation(startDate, endDate) {
                    return endDate - startDate < 48 * 60 * 60 * 1000;
                },
                customPrompt: '时间区间不能大于2天'
            },
            // Plot.MapOperate
            mapOpt: null,
            // map控件
            mapControl: null
        };
    },
    watch: {
        isShow: function (n, o) {
            if (n) {
                document
                    .getElementsByClassName('olControlPanZoomBarEx')[0]
                    .style.setProperty('left', '380px', 'important');
                document
                    .getElementsByClassName('olControlScaleLine')[0]
                    .style.setProperty('left', '380px', 'important');
            } else {
                document
                    .getElementsByClassName('olControlPanZoomBarEx')[0]
                    .style.setProperty('left', '40px', 'important');
                document
                    .getElementsByClassName('olControlScaleLine')[0]
                    .style.setProperty('left', '40px', 'important');
            }
        },
        menuList: function (n, o) {
            n.includes('speedLimit')
                ? showFence(this.fenceSpeedLimitLayer)
                : hidFence(this.fenceSpeedLimitLayer);
            n.includes('areaLimit')
                ? showFence(this.fenceAreaLimitLayer)
                : hidFence(this.fenceAreaLimitLayer);
        }
    },
    mounted() {
        // 路由跳转相关参数获取及设置
        // 初始化默认选中节点
        const {indexCode, beginTime, endTime, plateNo} = this.$route.query;
        this.time[0] = beginTime
            ? new Date(beginTime.split(' ').join('+'))
            : new Date(new Date().toLocaleDateString());
        this.time[1] = endTime
            ? new Date(endTime.split(' ').join('+'))
            : new Date(
                new Date(new Date().toLocaleDateString()).getTime() +
                24 * 60 * 60 * 1000 -
                1
            );
        if (indexCode) {
            // 如果没有传time,就展示当天24h的轨迹
            // 这里的时间需要根据跳转的进行调整
            this.defaultNode = indexCode || '';
            this.selectedDevices[0] = {indexCode: this.defaultNode, name: plateNo};
            // this.searchGps();
        }
        // 初始化地图
        const that = this;
        const {
            map,
            vectorLayer,
            traceLayer,
            markerLayer,
            trackMarkerLayer,
            fenceSpeedLimitLayer,
            fenceAreaLimitLayer
        } = initMap(that, indexCode);
        this.map = map;
        this.vectorLayer = vectorLayer;
        this.traceLayer = traceLayer;
        this.markerLayer = markerLayer;
        this.trackMarkerLayer = trackMarkerLayer;
        this.fenceSpeedLimitLayer = fenceSpeedLimitLayer;
        this.fenceAreaLimitLayer = fenceAreaLimitLayer;
        // fence

        // 图层选中事件
        // if (this.selectFeature) {
        // this.map.removeControl(this.selectFeature);
        // this.selectFeature.destroy();
        // }
        // 实例化 selectFeature 控件，调用了 onSelect 和 onUnselect 方法
        const selectFeature1 = new HGIS.Control.SelectFeature(
            this.fenceSpeedLimitLayer,
            {
                // onSelect: e => {
                //   console.log(e);
                // },
                callbacks: {
                    click: e => {
                        // console.log(e)
                        if (e.data.longitude) {
                            this.popFenceInfo(e.data);
                        } else {
                            this.popFenceInfo(e.style);
                        }
                    },
                    clickout: () => {
                        try {
                            if (this.fencePopup) {
                                this.fencePopup.destroy();
                            }
                        } catch (error) {
                        }
                    }
                },
                hover: false
            }
        );
        this.map.addControl(selectFeature1);
        // 激活控件
        selectFeature1.activate();

        const selectFeature2 = new HGIS.Control.SelectFeature(
            this.fenceAreaLimitLayer,
            {
                // onSelect: e => {
                //   console.log(e);
                // },
                callbacks: {
                    click: e => {
                        // console.log(e)
                        if (e.data.longitude) {
                            this.popFenceInfo(e.data);
                        } else {
                            this.popFenceInfo(e.style);
                        }
                    },
                    clickout: () => {
                        try {
                            if (this.fencePopup) {
                                this.fencePopup.destroy();
                            }
                        } catch (error) {
                        }
                    }
                },
                hover: false
            }
        );
        this.map.addControl(selectFeature2);
        // 激活控件
        selectFeature2.activate();

        // 图层点击事件
        const selectFeature = new HGIS.Control.SelectFeature(
            this.trackMarkerLayer,
            {
                // callbacks
                onSelect: t => {
                    // console.log(t)
                    const point = new HGIS.Geometry.Point(
                        t.data.longitude / 360000,
                        t.data.latitude / 360000
                    ).transform(
                        new HGIS.Projection('EPSG:4326'),
                        new HGIS.Projection('EPSG:900913')
                    );
                    if (t.data.alarmId) {
                        // 点击报警点位时
                        this.showPopUp(new HGIS.LonLat(point.x, point.y), t.data, 'alarm');
                    } else {
                        // 点击普通点位时
                        // console.log(t.data)
                        this.showPopUp(new HGIS.LonLat(point.x, point.y), t.data, 'gps');
                    }
                }
            }
        );
        this.map.addControl(selectFeature);
        selectFeature.activate();

        // zoom事件
        // 缩放时 tracemarker不显示
        this.map.events.register('zoomend', this.map, () => {
            const zoom = this.map.getZoom();
            if (zoom >= 15) {
                this.trackMarkerLayer.setVisibility(true);
            } else {
                this.trackMarkerLayer.setVisibility(false);
            }
            // >=17时，缩小线宽
            // 若不进行重绘，则实际为下一次zoom才会进行缩小
            if (zoom >= 17) {
                if (this.trace) {
                    this.trace._style.Line.strokeWidth = 2;
                    this.traceLayer.redraw();
                }
            } else {
                if (this.trace) {
                    this.trace._style.Line.strokeWidth = 5;
                    this.traceLayer.redraw();
                }
            }
        });
    },
    created() {
        window.popDestroy = this.popDestroy;
    },
    destroyed() {
        // this.vectorLayer.setVisibility(true);
        clearMap();
    },
    methods: {
        toTimeNormalString(t) {
            return toTimeNormalString(t);
        },
        toTimezoneString(t) {
            return toTimezoneString(t);
        },
        checkTime(start, end) {
            if (end.getTime() < start.getTime()) {
                this.$message({
                    type: 'warning',
                    message: '开始时间不能大于结束时间'
                });
                return false;
            }
            if (end.getTime() - start.getTime() >= 3600 * 1000 * 48) {
                this.$message({
                    type: 'warning',
                    message: '时间区间不能大于2天'
                });
                return false;
            }
            return true;
        },
        chartShow() {
            this.isShowTab = !this.isShowTab;
        },
        // 切换到报警tab页
        tabClick() {
            if (this.activeTab === 'alarm') {
                // this.loading = true;
                // if (this.vehicleIndexCodes.length > 0) {
                //   this.vehicleIndexCodes.length = 0;
                // }
                // this.vehicleIndexCodes.push(this.selectedDevices[0].indexCode);
                // const param = {
                //   vehicleIndexCodes: this.vehicleIndexCodes,
                //   beginTime: toTimezoneString(this.time[0]),
                //   endTime: toTimezoneString(this.time[1])
                // };
                // // 获取报警数据
                // findAlarmPage(param).then(json => {
                //   if (json.code === '0') {
                //     if (json.data.list.length > 0) {
                //       this.alarmResult = json.data.list;
                //       this.isShow = false;
                //     } else {
                //       this.$message({
                //         type: 'warning',
                //         message: '无相关报警信息'
                //       });
                //     }
                //   }
                //   this.loading = false;
                // });
            }
        },

        // 表格点击事件
        tableClick(row) {
            // console.log(row)
            let markIcon = require('../../../assets/png/Map_Box_camera_Alarm_Nor.png');
            // 轨迹tab下的点击事件
            if (this.activeTab === 'gps') {
                this.isShowTab = false;
                // this.$refs.speedCard.setLeftEchart(alarmUtils.formatSpeed(row.speed));
                markIcon = require('../../../assets/png/Map_Box_camera_Alarm_Sel.png');
            } else if (this.activeTab === 'alarm') {
                // 报警tab下的点击事件
                // this.$nextTick(() => {
                //   this.showAlarmLedger = true;
                //   this.alarmLedger = {
                //     ...row,
                //     speed: alarmUtils.formatAlarmSpeed(row)
                //   };
                // });
            } else if (this.activeTab === 'park') {
                // 停车点下的点击事件
            }
            this.markerLayer.removeAllFeatures();
            const point = new HGIS.Geometry.Point(
                row.longitude / 360000,
                row.latitude / 360000
            ).transform(
                new HGIS.Projection('EPSG:4326'),
                new HGIS.Projection('EPSG:900913')
            );
            const pointStyle = {
                graphicWidth: 36,
                graphicHeight: 36,
                graphicZIndex: 10000,
                externalGraphic: markIcon
            };
            const pointVector = new HGIS.Feature.Vector(point, null, pointStyle);
            this.markerLayer.addFeatures([pointVector]);
            this.showPopUp(new HGIS.LonLat(point.x, point.y), row, this.activeTab);
            setMapCenter(row);
        },
        // 车辆列表、收藏车辆tab切换
        carTableClick() {
            // 对选中的项进行清除操作
            this.$refs.focusTree.cleanCheckedKey();
            this.$refs.resourceTree.cleanCheckedKey();
            // this.selectedDevices = []
        },
        // 函数进行节流，否则在点击过快是会造成地图上遗留pop
        showPopUp: throttle(1000, async function (location, info, type) {
            // try {
            //   if (this.popup && this.popup.id) {
            //     // console.log('destroy')
            //     this.popup.destroy();
            //   }
            // } catch (error) {
            //   // console.log(error);
            // }
            // 设置弹框的大小
            var popSize;
            // 弹框内容
            var contentHTML = await (async function () {
                if (type === 'alarm') {
                    // 宽 高
                    popSize = new HGIS.Size(400, 680);
                    // console.log(info)
                    return await popAlarmContext(info);
                } else if (type === 'gps') {
                    popSize = new HGIS.Size(400, 680);
                    return await popTraceContext(info);
                } else if (type === 'park') {
                    popSize = new HGIS.Size(310, 140);
                    return await popParkContext(info);
                }
            })();

            const PopConstructor = Vue.extend({
                template: contentHTML,
                data () {
                    return {
                        dfd: ''
                    }
                },
                methods: {}
            });
            const popConstructor = new PopConstructor();
            const _contentHTML = popConstructor.$mount().$el
            const ele = document.createElement('div')
            ele.id = 'track-info-popup';
            // ele.style = 'height:460px';
            // ele.append(_contentHTML)
            // 弹框添加到地图上
            this.$nextTick(() => {
                // 声明普通弹框
                this.popup = new HGIS.Popup(
                    'popId',
                    location,
                    popSize,
                    ele.outerHTML,
                    false
                );
                this.popup.setBackgroundColor('rgba(0,0,0,0)');
                this.map.addPopup(this.popup, true);
                document.getElementById('track-info-popup').appendChild(_contentHTML)
            })
        }),
        popFenceInfo: throttle(1000, function (e) {
            try {
                if (this.fencePopup) {
                    this.fencePopup.destroy();
                }
            } catch (error) {
            }
            // 锚点
            var anchor = new HGIS.Icon('', new HGIS.Size(0, 0), new HGIS.Pixel(0, 0));
            // 设置弹框的大小
            var popSize = new HGIS.Size(200, 200);
            // 弹框内容
            var contentHTML = `<div style="width:200px">
          <ul>
            <li>
              围栏名称: ${e.name}
            </li>
            <li>
              围栏类型：${e.type}
            </li>
            ${e.speedlimit ? '<li>限速值：' + e.speedlimit + '</li>' : ''}
          </ul>
        </div>`;
            // 声明弹框
            this.fencePopup = new HGIS.Popup.FramedCloud(
                'framePop',
                new HGIS.LonLat(e.longitude / 360000, e.latitude / 360000).transform(
                    new HGIS.Projection('EPSG:4326'),
                    new HGIS.Projection('EPSG:900913')
                ),
                popSize,
                contentHTML,
                anchor,
                true
            );
            // 弹框添加到地图上
            this.map.addPopup(this.fencePopup);
        }),
        popDestroy() {
            this.markerLayer.removeAllFeatures();
            this.popup.destroy();
        },
        // 查询gps
        searchGps() {
            if (this.selectedDevices.length === 0) {
                this.$message.warning('请选择要查询的车辆');
                return;
            }
            if (!this.checkTime(this.time[0], this.time[1])) {
                return;
            }
            if (this.popup && this.popup.id) {
                this.popup.destroy();
            }
            this.loading = true;
            const param = {
                plateNo: this.selectedDevices[0].name,
                vehicleIndexCode: this.selectedDevices[0].indexCode,
                beginTime:
                    this.carActiveTab === 'normal'
                        ? toTimezoneString(this.time[0])
                        : toTimezoneString(this.focusTime[0]),
                endTime:
                    this.carActiveTab === 'normal'
                        ? toTimezoneString(this.time[1])
                        : toTimezoneString(this.focusTime[1])
            };

            // 获取报警数据
            if (this.vehicleIndexCodes.length > 0) {
                this.vehicleIndexCodes.length = 0;
            }
            this.vehicleIndexCodes.push(this.selectedDevices[0].indexCode);
            const alarmparam = {
                vehicleIndexCodes: this.vehicleIndexCodes,
                beginTime: toTimezoneString(this.time[0]),
                endTime: toTimezoneString(this.time[1]),
                pageNo: 1,
                pageSize: 1000
            };
            const fenceSpeedLimitParam = {
                pageNo: 1,
                pageSize: 100,
                ruleTypes: [120, 121],
                vehicleIndexCode: this.selectedDevices[0].indexCode
            };
            const fenceAreaLimitParam = {
                pageNo: 1,
                pageSize: 100,
                ruleTypes: [122, 123],
                vehicleIndexCode: this.selectedDevices[0].indexCode
            };
            const gpsPromise = gethistoryGps(param);
            const alarmPromise = findAlarmPage(alarmparam);
            const dashboardPromise = queryVehicleStatus(param);
            const fenceSpeedLimitPromise = findFenceByVehicle(fenceSpeedLimitParam);
            const fenceAreaLimitPromise = findFenceByVehicle(fenceAreaLimitParam);
            Promise.all([
                gpsPromise,
                alarmPromise,
                dashboardPromise,
                fenceSpeedLimitPromise,
                fenceAreaLimitPromise
            ]).then(r => {
                // 处理gps响应结果
                const gpsJson = r[0];
                if (gpsJson.code === '0') {
                    if (gpsJson.data.length > 0) {
                        this.gpsTotalResult = gpsJson.data;
                        this.progressTimeRange = [
                            new Date(this.gpsTotalResult[0].time).toTimeString().substr(0, 8),
                            new Date(this.gpsTotalResult[this.gpsTotalResult.length - 1].time)
                                .toTimeString()
                                .substr(0, 8)
                        ];
                        this.$refs.trackToolBar.init();
                        // console.log(this.selectedDevices[0].name)
                        this.$refs.trackToolBar.setPlateNo(this.selectedDevices[0].name);
                        this.$refs.selectedCarCard.setParams(
                            this.selectedDevices[0].name,
                            toTimeNormalString(toTimezoneString(this.time[0])),
                            toTimeNormalString(toTimezoneString(this.time[1]))
                        );
                        this.isShowTab = true;
                        this.upDateEchart();
                    } else {
                        this.$message({
                            type: 'warning',
                            message: '无相关轨迹信息'
                        });
                        // 没有轨迹信息不进行下面的判断
                        this.loading = false;
                        return;
                    }
                } else {
                    this.$message.error('获取轨迹信息异常');
                    // 没有轨迹信息不进行下面的判断
                    this.loading = false;
                    return;
                }

                // 处理报警数据
                this.$nextTick(() => {
                    // console.log(r)
                    const alarmJson = r[1];
                    if (alarmJson.code === '0') {
                        if (alarmJson.data.list.length > 0) {
                            const alarm = alarmJson.data.list;
                            //
                            // console.log(alarmJson.data.list)
                            // console.log(this.gpsTotalResult)

                            alarm.forEach( i => {
                                this.gpsTotalResult.forEach( n => {
                                    if(i.beginTime === n.time &&
                                        i.beginLatitude === n.latitude &&
                                        i.beginLongitude === n.longitude
                                    ){
                                        // console.log(n.ibmData);
                                        i['ibmData'] = n.ibmData;
                                        i['time'] = n.time;
                                        i['serverTime'] = n.serverTime;
                                        i['satellites'] = n.satellites;
                                        i['mileage'] = n.mileAge;
                                        i['shapeLimitSpeed'] = n.shapeLimitSpeed;
                                        i['shapeName'] = n.shapeName;
                                        i['attendanceDTO'] = n.attendanceDTO;
                                    }
                                })
                            })
                            // console.log(alarm)
                            this.alarmResult = alarm;

                            // this.isShow = false;
                        } else {
                            this.alarmResult = [];
                            this.$message({
                                type: 'warning',
                                message: '无相关报警信息'
                            });
                        }
                    } else {
                        this.$message.error('获取报警信息异常');
                    }
                    this.showTrack();
                });

                // 面板数据
                this.$nextTick(() => {
                    const milTotal = r[0].data;
                    // console.log('第一个里程数：'+milTotal[0].mileage)
                    // console.log('最后一个里程数：'+milTotal[milTotal.length-1].mileage)
                    const dashboardJson = r[2];
                    let beginMil;
                    let endMil;
                    if (dashboardJson.code === '0' && r[0].code === '0') {
                        if (dashboardJson.data) {
                            this.status = dashboardJson.data;
                            // add by chenying 2021.10.14
                            if (milTotal) {
                                // milTotal ;
                                for (let i = 0; i < milTotal.length; i++) {
                                    if (
                                        milTotal[i].correctFlag === 0 &&
                                        milTotal[i].longitude !== 0 &&
                                        milTotal[i].latitude !== 0 &&
                                        milTotal[i].mileAge !== 0
                                    ) {
                                        beginMil = milTotal[i].mileAge;
                                        break;
                                    }
                                }

                                // const reverseList = milTotal.reverse(); // 反转数组
                                for (let v = milTotal.length-1; v < milTotal.length; v--) {
                                    if (
                                        milTotal[v].correctFlag === 0 &&
                                        milTotal[v].longitude !== 0 &&
                                        milTotal[v].latitude !== 0 &&
                                        milTotal[v].mileAge !== 0
                                    ) {
                                        endMil = milTotal[v].mileAge;
                                        break;
                                    }
                                }
                            }
                            const mileageRate =  endMil - beginMil ;
                            // this.status.mileage = mileageRate; // 给数组添加元素
                            this.status = Object.assign(dashboardJson.data, {"mileage": mileageRate ? mileageRate : 0}) ;
                            // console.log(this.status)
                        } else {
                            this.$message({
                                type: 'warning',
                                message: '无相关统计信息'
                            });
                        }
                    } else {
                        this.$message('获取面板信息异常');
                    }
                    this.$refs.trackConfig.initMenuList();
                });
                this.loading = false;
                // 限速区域
                this.$nextTick(() => {
                    if (r[0].code !== '0' || !r[0].data.length) {
                        return;
                    }
                    this.fenceSpeedLimitLayer.removeAllFeatures();
                    const fenceSpeedLimitJson = r[3];
                    if (fenceSpeedLimitJson.code === '0') {
                        fenceSpeedLimitJson.data.list.forEach(item => {
                            // 圆形围栏
                            hidFence(this.fenceSpeedLimitLayer);
                            if (item.shapeType === 1) {
                                drawCircleFence(
                                    this.map,
                                    this.fenceSpeedLimitLayer,
                                    item.points[0],
                                    item.radius,
                                    1,
                                    {
                                        name: item.shapeName,
                                        type: item.ruleList[0].ruleType,
                                        speed: item.ruleList[0].rule.speed
                                    }
                                );
                            } else {
                                // 多边形或矩形围栏
                                drawGeoFence(this.fenceSpeedLimitLayer, item.points, 1, {
                                    name: item.shapeName,
                                    type: item.ruleList[0].ruleType,
                                    speed: item.ruleList[0].rule.speed
                                });
                            }
                        });
                    } else {
                        this.$message({
                            type: 'warning',
                            message: '无相关限速区域围栏'
                        });
                    }
                });

                // 越线区域
                this.$nextTick(() => {
                    if (r[0].code !== '0' || !r[0].data.length) {
                        return;
                    }
                    this.fenceAreaLimitLayer.removeAllFeatures();
                    const fenceAreaLimitJson = r[4];
                    if (fenceAreaLimitJson.code === '0') {
                        fenceAreaLimitJson.data.list.forEach(item => {
                            // 圆形围栏
                            hidFence(this.fenceAreaLimitLayer);
                            if (item.shapeType === 1) {
                                drawCircleFence(
                                    this.map,
                                    this.fenceAreaLimitLayer,
                                    item.points[0],
                                    item.radius,
                                    2,
                                    {
                                        name: item.shapeName,
                                        type: item.ruleList[0].ruleType,
                                        speed: item.ruleList[0].rule.speed
                                    }
                                );
                            } else {
                                // 多边形或矩形围栏
                                drawGeoFence(this.fenceAreaLimitLayer, item.points, 2, {
                                    name: item.shapeName,
                                    type: item.ruleList[0].ruleType,
                                    speed: item.ruleList[0].rule.speed
                                });
                            }
                        });
                    } else {
                        this.$message({
                            type: 'warning',
                            message: '无相关越线区域围栏'
                        });
                    }
                });
            });
        },
        upDateEchart() {
            const xDates = [];
            const yDates = [];
            for (let i = 0; i < this.gpsTotalResult.length; i++) {
                xDates.push(
                    new Date(this.gpsTotalResult[i].time).toTimeString().substr(0, 8)
                );
                yDates.push(alarmUtils.formatSpeed(this.gpsTotalResult[i].speed));
            }
            // this.$refs.speedCard.setLeftEchart(
            //   alarmUtils.formatSpeed(this.gpsTotalResult[0].speed)
            // );
            this.$refs.speedCard.setChart(xDates, yDates);
        },
        // 画轨迹
        showTrack() {
            this.lastIndex = 0;
            this.isStart = false;
            this.$refs.trackToolBar.init();
            if (!this.gpsTotalResult || !this.gpsTotalResult.length) {
                return;
            }
            const arr = [];
            // 将告警返回的数据抽取时间信息,[[startTime, endTime], ...]
            const alarmTime = this.alarmResult.map(v => [v.beginTime, v.endTime]);
            // 如果gpsTotal中数据 时间符合范围，给符合的gpsTotal添加alarm属性,为alarmResult中数据
            this.gpsTotalResult.forEach((item, index) => {
                // 对数据做报警筛选操作
                alarmTime.forEach((i, alarmindex) => {
                    // 符合报警匹配
                    if (item.time >= i[0] && item.time <= i[1]) {
                        this.gpsTotalResult[index].alarm = this.alarmResult[alarmindex];
                    }
                });
                this.deviceName = item.vehicleLicensePlate;
                if (item.correctFlag === 0 || ((item.latitude >= 1386000 && item.latitude <= 19278000) &&
                    (item.longitude >= 26478000 && item.longitude <= 48630000) &&
                    (item.height < 600000 && item.height > -20000) &&
                    (item.direction <= 36000 && item.direction >= 0))) {
                    arr.push({
                        id: `K${index}`,
                        latitude: item.latitude,
                        longitude: item.longitude,
                        label: item.vehicleLicensePlate,
                        speed: alarmUtils.formatSpeed(item.speed) || 0
                    });
                }
                // if (item.correctFlag === 0) {
                //   arr.push({
                //     id: `K${index}`,
                //     latitude: item.latitude,
                //     longitude: item.longitude,
                //     label: item.vehicleLicensePlate,
                //     speed: alarmUtils.formatSpeed(item.speed) || 0
                //   });
                // }
            });
            const arr1 = arr.map(item => {
                const lonlat = new HGIS.LonLat(
                    item.longitude / 360000,
                    item.latitude / 360000
                ).transform(
                    new HGIS.Projection('EPSG:4326'),
                    new HGIS.Projection('EPSG:900913')
                );
                return {
                    id: item.id,
                    latitude: lonlat.lat,
                    longitude: lonlat.lon,
                    label: item.deviceName,
                    speed: item.speed
                };
            });
            const startStyle = {
                externalGraphic: mapStart,
                graphicWidth: 32,
                graphicHeight: 32,
                graphicXOffset: -16,
                graphicYOffset: -32,
                graphicZIndex: 15
            };
            const endStyle = {
                externalGraphic: mapEnd,
                graphicWidth: 32,
                graphicHeight: 32,
                graphicXOffset: -16,
                graphicYOffset: -32,
                graphicZIndex: 15
            };
            const moveStyle = {
                externalGraphic: mapVehicleRight,
                graphicWidth: 48,
                graphicHeight: 48,
                graphicXOffset: -24,
                graphicYOffset: -24,
                graphicZIndex: 11111,
                labelXOffset: 0,
                labelYOffset: 32,
                fontColor: 'blue'
            };
            if (this.trace != null) {
                this.trace.destory();
            }
            this.traceLayer.removeAllFeatures();
            this.markerLayer.removeAllFeatures();
            this.trackMarkerLayer.removeAllFeatures();
            // this.trackMarkerLayer.clearMarkers();
            // let layer = this.map.getLayersByName('轨迹')[0];
            // if (!layer) {
            //   layer = new HGIS.Layer.Vector('轨迹');
            //   this.map.addLayer(layer);
            // } else {
            //   layer.removeAllFeatures(); // 清除掉图层上之前的对象,销毁轨迹对象,清理图层
            // }
            this.traceLayer.removeAllFeatures();
            this.map.setLayerIndex(this.traceLayer, 1);
            // 到点的回调
            this.trace = new HGIS.Biz.BayonetTrace(
                this.map,
                this.traceLayer,
                data => {
                    // console.log('increase')
                    // hasRestart已经点击前进，当插点的时候,data[1]=0
                    // 过滤冗余的一个数据,使得能够拿到当前的点信息
                    if (this.hasRestart && data[1] === 0) {
                        this.hasRestart = false;
                        return;
                    }
                    // console.log(data)
                    this.$refs.trackToolBar.progressIncrease();
                    if (this.trackDisplayType === '点轨迹') {
                        redrawMarker(
                            this.trackMarkerLayer,
                            this.vectorList,
                            this.lastIndex,
                            data[1]
                        );
                        this.lastIndex = data[1];
                        // data[1]
                        //   console.log(this.gpsTotalResult[data[1]])
                        //   const point = new HGIS.Geometry.Point(
                        //     this.gpsTotalResult[data[1]].longitude / 360000,
                        //     this.gpsTotalResult[data[1]].latitude / 360000
                        //   ).transform(
                        //     new HGIS.Projection('EPSG:4326'),
                        //     new HGIS.Projection('EPSG:900913')
                        //   )
                        //   // 逐点绘制
                        //   createMarker(this.trackMarkerLayer,
                        //   this.gpsTotalResult[data[1]],
                        //   // 1)
                        //   this.gpsTotalResult[data[1]].alarm ? 2 : 1,
                        //   null)
                    }
                }
            );
            this.trace.setPathShow(false);
            if (this.trackDisplayType === '全轨迹') {
                this.vectorList = toVectorList(this.gpsTotalResult);
                // console.log(vector)
                redrawMarker(
                    this.trackMarkerLayer,
                    this.vectorList,
                    0,
                    this.gpsTotalResult.length
                );
                // this.gpsTotalResult.forEach(async item => {
                // const point = new HGIS.Geometry.Point(
                //   item.longitude / 360000,
                //   item.latitude / 360000
                // ).transform(
                //   new HGIS.Projection('EPSG:4326'),
                //   new HGIS.Projection('EPSG:900913')
                // );

                // const marker = createMarker(this.trackMarkerLayer,
                // item,
                // item.alarm ? 2 : 1)
                // if (item.alarm) {
                // const callbacks = {
                //   click: f => {
                //     this.showPopUp(new HGIS.LonLat(point.x, point.y), item.alarm, 'alarm');
                //   }
                // };
                // // 这里应该只注册onSelect方法即可
                // const selectFeature = new HGIS.Control.SelectFeature(this.trackMarkerLayer, {
                //   // callbacks
                //   onSelect: function (t) {
                //     console.log(t + 'click me')
                //     this.showPopUp(new HGIS.LonLat(point.x, point.y), item.alarm, 'alarm')
                //   }
                // });
                // this.map.addControl(selectFeature);
                // selectFeature.activate();

                // const _this = this
                // marker.events.register('click', marker,
                // // function() {
                //   // () => this.showPopUp(new HGIS.LonLat(point.x, point.y), item.alarm, 'alarm')
                //   async function () {
                //     const location = new HGIS.LonLat(point.x, point.y)
                //     const type = 'alarm'
                //     const info = Object.assign(item.alarm, {
                //       latitude: item.latitude,
                //       longitude: item.longitude
                //       })
                //   try {
                //     if(_this.popup) {
                //       // console.log('destroy')
                //       _this.popup.destroy();
                //     }
                //   } catch (error) {
                //     console.log(error)
                //   }
                //   // 设置弹框的大小
                //   var popSize = new HGIS.Size(358, 360)
                //   //弹框内容
                //   var contentHTML = await popAlarmContext(info)
                //   // 声明普通弹框
                //   _this.popup = new HGIS.Popup("popId", location, popSize, contentHTML, false);
                //   _this.popup.setBackgroundColor('rgba(0,0,0,0)')
                //   //弹框添加到地图上
                //   _this.map.addPopup(_this.popup);
                // }
                // // }
                // );//为marker对象注册鼠标点击事件
                // }
                // });

                // 设置轨迹并且添加marker图层
                this.trace._style.Line.strokeWidth = 5;
            } else if (this.trackDisplayType === '点轨迹') {
                // 设置轨迹为加载模式
                this.trace.setPathShow(true);
                // 不显示点和 路线
                this.trace._style.PointDraw.pointRadius = 0;
                this.trace._style.Line.strokeWidth = 0;
                this.$nextTick(() => {
                    setMapCenter(this.gpsTotalResult[0]);
                });
            }
            this.trace._style.CompleteLine.strokeWidth = 5;
            this.trace._style.CompleteLine.strokeOpacity = 1;
            this.trace._style.CompleteLine.strokeColor = 'green';
            this.trace._style.CompleteLine.graphicZIndex = 1;
            // 不显示点
            this.trace._style.PointDraw.strokeOpacity = 0;
            this.trace._style.PointDraw.pointRadius = 0;
            // this.trace._style.Line.strokeWidth = 1;
            // this.trace.speed(16);
            // this.trace.setInterval(500);
            this.trace.setStopTime(0);
            this.trace.setStartStyle(startStyle);
            this.trace.setendStyle(endStyle);
            this.trace.setmoveStyle(moveStyle);
            this.trace.setPath(arr1);
            this.trace.stopTime(1);
            // 避免对点位进行插值,从而避免插值后前进点位出错的问题
            // 猜测hgis v1.4源码中87144，下一个点时停止点，steepLength = Infinity
            this.trace.setTranceStep(0);
            // this.trace.setPathShow(false);
        },
        handleSelectedNodes(nodes) {
            this.selectedDevices = nodes;
        },
        startT(t) {
            if (this.trace) {
                this.isStart = true;
                this.hasRestart = true;
                this.trace.start();
                setMapCenter(this.gpsTotalResult[t]);
            }
        },
        restartT(i) {
            if (i >= this.gpsTotalResult.length - 1) {
                i = this.gpsTotalResult.length - 2;
            }
            if (this.trace) {
                this.isStart = true;
                this.hasRestart = true;
                this.trace.restart(
                    i === 0 ? 0 : i - 1,
                    this.gpsTotalResult.filter(v => v.correctFlag === 0).length - 1
                );
                this.pauseT();
                // 设置为中心点
                setMapCenter(this.gpsTotalResult[i === 0 ? 0 : i]);
            }
        },
        pauseT() {
            if (this.trace) {
                this.isStart = false;
                this.trace.pause();
            }
        },
        stopT() {
            if (this.trace) {
                this.trace.stop();
                this.isStart = false;
                this.upDateEchart();
            }
        },
        // 由于逐点进行地播放，所以speed控制速度是无效的，采用停留时间进行控制，
        // speedNum用于显示倍速的负相关数，实际为停留时间。
        speedupTrace() {
            if (this.trace) {
                this.speedNum = this.speedNum > 0.5 ? this.speedNum / 2 : 0.25;
                // console.log(this.speedNum)
                this.trace.setStopTime(this.speedNum * 1);
                // this.trace.speed(this.speedNum);
            }
        },
        speeddownTrace() {
            if (this.trace) {
                this.speedNum = this.speedNum < 8 ? this.speedNum * 2 : 16;
                // console.log(this.speedNum)
                this.trace.setStopTime(this.speedNum * 1);
                // this.trace.speed(this.speedNum);
            }
        },
        // 轨迹配置
        trackConfig(config) {
            this.trackDisplayType = config.trackType || '全轨迹';
            this.menuList = config.menuList;
            this.showTrack();
            this.speedLevel = config.trackThreshold;
            this.upDateEchart();
        },
        alarmConfig(config) {
            // console.log(config);
        },
        trackTableConfig(config) {
            this.existTargetData = config;
        },
        // 点击配置按钮进行gps配置
        tableConfig() {
            this.trackTableDialogVisible = true;
        },
        // 点击筛选按钮进行报警/停车场配置
        tableFilter() {
            if (this.activeTab === 'alarm') {
                this.alarmDialogVisible = true;
            } else if (this.activeTab === 'park') {
            }
        },
        mapMeasure() {
            if (!this.mapOpt) {
                this.mapOpt = new HGIS.Plot.MapOperate(this.map);
            }
            this.mapOpt.clear();
            this.mapOpt.measureDistance();
        },
        // 标记点，这里应该要进行已标记点位的获取绘制等
        mapSignPoint() {
            if (this.mapControl) {
                this.mapControl.activate();
                return;
            }
            if (!this.map.drawControls.point) {
                this.mapControl = new HGIS.Control.DrawFeature(
                    this.vectorLayer,
                    HGIS.Handler.Point
                );
                this.mapControl.featureAdded = function (f) {
                    console.log(f);
                };
                this.map.drawControls.point = this.mapControl;
                this.map.addControl(this.mapControl);
                this.mapControl.activate();
            }
        },
        // 清除地图测量、标记点工具的使用
        mapDoNone() {
            // 关闭标记点
            if (this.mapControl) {
                this.mapControl.deactivate();
            }
            // 关闭测量工具
            if (this.mapOpt) {
                this.mapOpt.clear();
            }
        }
    }
};
</script>
<style src="@/pages/location/location.css"></style>
<style lang="scss" scoped>
#vehicleTrack {
    position: relative;
    display: flex;
    flex-direction: row;

    .arrow-container {
        position: absolute;
        bottom: 0px;
        left: 50%;
        width: 80px;
        height: 32px;
        cursor: pointer;
        z-index: 2000;
        background-color: #fff;
        -webkit-box-shadow: 0 0.01rem 0.06rem rgba(0, 0, 0, 0.15);
        box-shadow: 0 0.01rem 0.06rem rgba(0, 0, 0, 0.15);
        opacity: 0.9;
        display: flex;
        align-items: center;
        justify-content: center;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        border: 1px solid #e5e5e5;
        border-bottom: none;
    }

    .map-container {
        height: 100%;
        flex: 1;
    }

    .tree-wrap {
        position: absolute;
        height: 98%;
        width: 350px;
        top: 8px;
        left: 8px;
        bottom: 16px;
        background: #ffffff;
        box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.2);
        border-radius: 2px;
        padding: 10px 6px;

        .el-tabs {
            height: 100%;
        }

        .inner {
            // position: absolute;
            // height: 100%;;
            left: 12px;
            right: 12px;
            top: 60px;
            bottom: 0;
        }

        .title {
            font-size: 14px;
            color: rgba(0, 0, 0, 0.7);
            line-height: 20px;
            padding: 14px 12px;
            border-bottom: 1px solid #e8e8e8;
            margin-bottom: 12px;
        }

        .el-button--primary {
            width: 100%;
            max-width: 350px;
        }
    }

    .data-container {
        position: absolute;
        right: 0;
        height: 98%;
        display: flex;
        flex-direction: column;
        padding: 8px 8px 0px 8px;
        overflow: hidden;
        width: 439px;
        transition: width 0.7s;

        // update by chenying 2021.08.09
        .data-info-card {
            margin: 15px 0;
        }

        .tab-table {
            background-color: white;
            padding: 5px 10px;
        }

        .pannel-wrap {
            display: flex;
            // update by chenying 2021-09-27
            height: 50% !important;
            flex: 1;
            flex-direction: column;
        }
    }

    .data-container-close {
        height: 62px;
    }

    .alarm-ledger-wrap {
        position: absolute;
        top: 16px;
        bottom: 16px;
        left: 374px;
        width: 440px;
        background: #fff;
        overflow: hidden;

        .clearfix {
            padding: 4px;
        }
    }

    .tab-table-do {
        display: flex;
        padding: 10px 0 0 0;

        span {
            display: flex;
            width: 80px;
            line-height: 24px;
            align-items: center;
            cursor: pointer;
        }
    }
}

.track-tool-bar {
    position: absolute;
    bottom: 18px;
    left: 374px;
    right: 440px;
    height: 58px;
    background-color: #fff;
    display: flex;
    align-items: center;
}

.device-name {
    width: 80px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    height: 16px;
    line-height: 16px;
    margin-left: 35%;
    text-align: center;
}

.split-line {
    width: 1px;
    height: 16px;
    background-color: #eee;
    margin: 0 16px;
}

.arrow {
    position: absolute;
    top: 18px;
    left: 325px;
    width: 30px;
    height: 30px;
    cursor: pointer;
    transition: right 0.7s;
    z-index: 2000;
    background-color: #fff;
    // box-shadow: 0 0.01rem 0.06rem rgba(0, 0, 0, 0.15);
    opacity: 0.9;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    // border-top-left-radius: 4px;
    // border-bottom-left-radius: 4px;
    // border: 1px solid #e5e5e5;
    // border-right: none;
}

.rotate {
    transform: rotate(-180deg);
}

.time-wrap {
    position: absolute;
    bottom: 40px;
    width: 100%;
}

.btns-wrap {
    position: absolute;
    bottom: 0px;
    width: 100%;
    display: flex;
    justify-content: space-around;
}

.size-16 {
    font-size: 16px;
}

::v-deep .olControlScaleLine {
    left: 380px !important;
    bottom: 50px !important;
}

::v-deep .olControlPanZoomBarEx {
    left: 380px !important;
    bottom: 340px !important;
}
</style>
<style lang="scss">
#vehicleTrack {
    .el-tabs .el-tabs__content {
        width: 100%;
        height: 95%;
        flex: 1;
    }

    .el-tab-pane {
        height: 94%;
    }
}

.collect-car-list {
    overflow: auto;
}

tspan {
    display: none;
}

.map-menu-wrap {
    top: 8px;
    right: 440px;
}

// add by chenying 2021.06.08
.vehiclePop {
    height: 90%;
    width: 90%;
    box-shadow: 0 0 12px 0 #ddd;
    background-color: #fff !important;
    margin: 4% auto;
}

.vehiclePop .vehiclePop_title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ccc;
    font-family: MicrosoftYaHeiUI;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.90);
    letter-spacing: 0;
    line-height: 34px;
    height: 34px;
}

.vehiclePop .vehiclePop_con {
    display: flex;
    height: calc(100% - 34px)
}
</style>
