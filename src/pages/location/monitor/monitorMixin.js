import {
    initMap,
    addMapPoint,
    setMapCenter,
    openSelectFeature,
    openPopup,
    clearMap,
    closePopup,
    getCluster,
    removeVectors,
    trackActive,
    untrackActive
} from '@/pages/location/monitor/map.js';
import {
    getlastGps,
    batchBroadcast,
    terminalAbility,
    getLastAttendance,
    findAbilityDevicesByVehicle
} from '@/api/location';
import {throttle} from 'throttle-debounce';
import {
    getVehicleInfo,
    refreshVehicleGPS,
    getVehicleInfoMap,
    updateVehicleCollect
} from '@/pages/location/monitor/vehicleInfo.js';
import {queryCameraByVehicleIndexCode} from '@/api/tree.js';
import {
    gpsTodms,
    toTimeNormalString,
    toTimezoneString
} from '@/components/util.js';
import {ALARM_INTERVAL} from '@/core/constant';
import {getAddress} from '@/pages/location/monitor/maptools.js';
import alarmUtils from '@/utils/alarm';

export default {
    data() {
        return {
            driverInfo: {},
            // 定时器
            timer: null,
            countNum: 0,
            veList: [],
            errorArr: [],
            successArr: [],
            selectedNodes: [],
            paramsVeArr: [],
            isShowAlarmDetail: false,
            isShowTab: false,
            isShowCaptureDialog: false,
            captureChannels: [],
            captureVehicleIndexCode: null,
            selectedVehicles: [],
            gpsMonitorData: [],
            alarmMap: null,
            processAction: [],
            driverResponse: null,
            alarmRemark: null,
            alarmLedger: {},
            currentRow: null,
            vehicleOnOff: [], // 车辆上下线,
            longTimeOffVehicles: [], // 长时间离线车辆
            maxAlarms: 100,
            statusMap: {
                0: 'grey',
                1: 'blue',
                2: 'red',
                3: 'orange',
                4: 'grey'
            },
            allAlarms: [],
            img1: require('../../../assets/png/defaultDriver.png'), // 驾驶员默认头像
            showVehicleTree: true,
            showVehicleDetail: false,
            detailvehicleIndexCode: '',
            detailvehicleOrgName: '',
        };
    },
    computed: {
        hCount() {
            return this.allAlarms.filter(item => item.level === 'h').length;
        },
        mCount() {
            return this.allAlarms.filter(item => item.level === 'm').length;
        },
        lCount() {
            return this.allAlarms.filter(item => item.level === 'l').length;
        },
        wCount() {
            return this.allAlarms.filter(item => item.level === 'w').length;
        }
    },
    watch: {
        countNum(val) {
            if (val === this.paramsVeArr.length) {
                const error = [...this.errorArr].length;
                const veArr = [...this.errorArr].map(item => {
                    return item.data;
                });
                const success = [...this.successArr].length;
                if (error === 0 && success > 0) {
                    this.$message.success('点名成功');
                    this.rollCallLoading = false;
                } else if (success === 0 && error > 0) {
                    this.$message.error(
                        `所有车辆点名失败：${
                            error > 3 ? `${veArr.slice(0, 3).join('、')}等` : veArr.join('、')
                        }`
                    );
                    this.rollCallLoading = false;
                } else {
                    this.$message.error(
                        `${error}台车辆点名失败：${
                            error > 3 ? `${veArr.slice(0, 3).join('、')}等` : veArr.join('、')
                        }`
                    );
                    this.rollCallLoading = false;
                }
            }
        },
        currentRow: {
            deep: true,
            handler(val) {
                this.switchDevice([{id: val}]);
                this.$refs.resourceTree.$refs.resourceTree.setCurrentKey(val);
            }
        }
    },
    mounted() {
        // 初始化地图
        initMap();
        // this.getAlarmTree();
        // 初始化websocket连接, 订阅报警、订阅设备上下线
        this.getBasicInfo({
            // fangjialong 修改ws为request方式
            // initGPSWebsocket: this.initGPSWebsocket,
            // initAlarmWebsocket: this.initAlarmWebsocket,
            initOnOffWebsocket: this.initOnOffWebsocket
        });
        // 点击地图上的车辆的回调
        setTimeout(() => {
            openSelectFeature(this.onFeatureSelect);
        }, 1000);
        // this.findAlarms();
        // this.findAlarmInterval = setInterval(this.findAlarms, ALARM_INTERVAL);
    },
    destroyed() {
        clearMap();
        this.closeGPSWebsoket();
        this.closeAlarmWebsoket();
        this.closeOnOffWebsocket();
        this.clearPopUp();
        if (this.findAlarmInterval) {
            clearInterval(this.findAlarmInterval);
        }
    },
    methods: {
        handleCall(row) {
            console.log(row)
        },
        /**
         *  一:在组织树上勾选设备时触发的操作
         *  1-接收到勾选的动作(handleSelectedNodes)
         *  2-判断是添加勾选的节点还是减少勾选的节点
         *     2.1-添加的情况:显示新选中的节点(showPoints),
         *                   对新勾选设备添加侦听GPS(addGPS),
         *     2.2-减少的情况:移除减少的设备(removePoints)
         *                   对移除的设备取消侦听GPS(removeGPS),
         *
         * 二:在设备树上点击设备触发的操作:弹出dialog,居中显示该设备(switchDevice)
         *
         */
        handleSelectedNodes(nodes) {
            if (nodes.length > 0) {
                // fangjialong 通过已选择的id进行请求
                const arr = nodes.map(i => i.id);
                // 清除定时器
                clearInterval(this.timer);
                // 清除地图,vehicleInfo,重新计算
                clearMap();
                // 先请求一次
                getlastGps(arr).then(json => {
                    if (json.data !== null && json.data.length > 0) {
                        // 对数据进行筛选，如果同一个id的time没有改变则不进行处理
                        const dataArr = json.data;
                        const noGPSData = dataArr.filter(item => item.latitude === null);
                        this.warnOffline(noGPSData);
                        // 更新vehicleInfo
                        refreshVehicleGPS(dataArr);
                        // 根据vehicleInfo进行绘制
                        if (!this.isCluster) {
                            addMapPoint(dataArr, this);
                        } else {
                            // 聚合
                            // vectorLayerRemoveAll(false, true, false);
                            getCluster();
                        }
                        setMapCenter(dataArr[dataArr.length - 1]);
                    } else {
                        this.warnOffline(nodes);
                    }
                    this.createTableData();
                });

                // 定时进行请求 5000ms
                this.timer = setInterval(() => {
                    // 请求
                    getlastGps(arr).then(json => {
                        if (json.data !== null && json.data.length > 0) {
                            // 对数据进行筛选，如果同一个id的time没有改变则不进行处理

                            const dataArr = json.data;
                            const noGPSData = dataArr.filter(item => item.latitude === null);
                            this.warnOffline(noGPSData);
                            refreshVehicleGPS(dataArr);
                            if (!this.isCluster) {
                                addMapPoint(dataArr, this);
                            } else {
                                // 聚合
                                // vectorLayerRemoveAll(false, true, false);
                                getCluster();
                            }
                            // setMapCenter(dataArr[dataArr.length - 1]);
                        } else {
                            this.warnOffline(nodes);
                        }
                        this.createTableData();
                    });
                }, 5000);

                // request方法
                // if (nodes.length > this.selectedNodes.length) {
                //   // 添加节点
                //   // 之前已经选择的
                //   const ids = this.selectedNodes.map(item => item.id);
                //   // 当前已经选择的车辆
                //   const addedNodes = nodes.filter(item => ids.indexOf(item.id) === -1);
                //   // 当前已选择的车辆的ids
                //   const arr1 = addedNodes.map(item => item.id);
                //   // 在地图上显示树上被选中的节点
                //   this.addPoints(addedNodes, arr1);
                //   // websoket新增监听GPS的设备
                //   this.addGPS(arr1.join(','));
                // } else if (nodes.length < this.selectedNodes.length) {
                //   // 减少节点
                //   // 当前已选节点的ids
                //   const ids = nodes.map(item => item.id);
                //   // 待删除节点
                //   const deleteNode = this.selectedNodes.filter(
                //     item => ids.indexOf(item.id) === -1
                //   );
                //   // 待删除节点ids
                //   const arr2 = deleteNode.map(item => item.id);
                //   this.removeGPS(arr2.join(','));
                //   // 在地图上移除取消勾选的节点
                //   this.removePoints(arr2);
                //   // 删除缓存GPS的数据
                //   // fangjialong 停用tempGPS
                //   // this.tempGPS = this.tempGPS.filter(
                //   //   item => arr2.indexOf(item.vehicleIndexCode) === -1
                //   // );
                // }
            } else if (nodes.length === 0) {
                clearInterval(this.timer);
                clearMap();
                this.clearPopUp();
                this.clearGPS();
                // this.$refs.mapTable.createTableData();
                this.createTableData();
            }
            this.selectedNodes = nodes;
        },
        clearPopUp() {
            closePopup();
        },
        // 在地图上显示树上被选中的节点
        addPoints: function (nodes, arr) {
            getlastGps(arr)
                .then(json => {
                    if (!(json.data !== null && json.data.length > 0)) {
                        this.warnOffline(nodes);
                    } else {
                        const dataArr = json.data;
                        const noGPSData = dataArr.filter(item => item.latitude === null);
                        this.warnOffline(noGPSData);
                        refreshVehicleGPS(dataArr);
                        if (!this.isCluster) {
                            addMapPoint(dataArr, this);
                        } else {
                            // 聚合
                            // vectorLayerRemoveAll(false, true, false);
                            getCluster();
                        }
                        setMapCenter(dataArr[dataArr.length - 1]);
                    }
                })
                .finally(() => {
                    // this.$refs.mapTable.createTableData();
                    this.createTableData();
                });
        },
        // 在地图上移除取消勾选的节点
        removePoints(arr) {
            if (!this.isCluster) {
                removeVectors(arr, true, true);
            } else {
                // 聚合
                getCluster();
            }
            // this.$refs.mapTable.createTableData();
            this.createTableData();
        },
        createTableData() {
            // -0:离线 -1:在线 -2:告警 -3:低速 4-无定位
            const vehicleInfoMap = getVehicleInfoMap();
            const ids = Object.keys(vehicleInfoMap);
            const gpsdataArr = [];
            ids.forEach(item => {
                if (vehicleInfoMap[item] && vehicleInfoMap[item].gps) {
                    gpsdataArr.push(vehicleInfoMap[item].gps);
                }
            });
            const data = gpsdataArr;
            this.selectedVehicles = data.map(item => ({
                vehicleIndexCode: item.vehicleIndexCode
                    ? item.vehicleIndexCode
                    : item.id,
                status: this.getVehicleStatus(item.vehicleIndexCode),
                vehicleLicensePlate: this.getVehiclePlate(item),
                driverName: item.attendanceDTO ? item.attendanceDTO.name : '',
                longitude: this.getVehicleGPS(item.longitude),
                latitude: this.getVehicleGPS(item.latitude),
                direction: this.getVehicleDirection(item.direction),
                speed: this.getVehicleSpeed(item.vehicleIndexCode, item.speed),
                time: this.getVehileTime(item.time),
                orgName: this.getVehicleOrgName(item.orgName),
                onlineStatus: vehicleInfoMap[item.vehicleIndexCode].status
            }));
            if (this.$refs.table) {
                this.$refs.table.reload();
            }
            // if (this.currentRow) {
            //   this.$nextTick(() => {
            //     this.setHightlightRow(this.currentRow);
            //   });
            // }
        },
        getVehiclePlate(item) {
            return typeof item.vehicleLicensePlate !== 'undefined'
                ? item.vehicleLicensePlate
                : item.name;
        },
        getVehicleGPS(gps) {
            if (gps === null) {
                return '';
            }
            return typeof gps !== 'undefined' ? gpsTodms(gps) : '';
        },
        getVehicleDirection(direction) {
            if (direction === null) {
                return '';
            }
            return typeof direction !== 'undefined'
                ? (direction / 100).toFixed(0)
                : '';
        },
        getVehileTime(time) {
            if (time === null) {
                return '';
            }
            return typeof time !== 'undefined'
                ? toTimeNormalString(toTimezoneString(time))
                : '';
        },
        getVehicleOrgName(orgName) {
            return typeof orgName !== 'undefined' ? orgName : '';
        },
        rowClick(row) {
            this.currentRow = row.vehicleIndexCode;
        },
        // 切换在地图中心的设备,弹出dialog
        switchDevice: throttle(500, false, function (node) {
            const info = getVehicleInfo(node[0].id);
            if (info) {
                setMapCenter(info.gps);
                // this.currentRow = node[0].id;
                this.$refs.resourceTree.$refs.resourceTree.setCurrentKey(node[0].id);
                this.imgMarkerClick(node[0].id);
            }
        }),

        // 有离线设备的提示
        warnOffline(nodes) {
            if (nodes.length > 0) {
                const arrName = nodes.map(item => item.vehicleLicensePlate);
                const arrNameStr =
                    arrName.length > 2
                        ? `${arrName[0]}、${arrName[1]}、${arrName[1]} 等 ${arrName.length} 个车辆`
                        : arrName.join('、');
                this.$message({
                    message: `${arrNameStr}无定位信息!`,
                    type: 'warning'
                });
            }
        },
        getDriverInfo(vehicleIndexCode) {
            return new Promise(resolve => {
                getLastAttendance({
                    vehicleIndexCode: vehicleIndexCode
                }).then(json => {
                    resolve(json.data || null);
                });
            });
        },
        onFeatureSelect(feature) {
            // 打开车辆弹窗
            this.imgMarkerClick(feature.data.gps.vehicleIndexCode);
        },
        // 车辆详情的弹框
        async imgMarkerClick(id) {
            // 获取车辆对讲信息
            const talkDeviceIndexCode = await this.getTalkDevice(id);
            const info = getVehicleInfo(id);
            const {gps, status} = info;
            this.clearPopUp();
            // this.currentRow = gps.vehicleIndexCode;
            this.$refs.resourceTree.$refs.resourceTree.setCurrentKey(
                gps.vehicleIndexCode
            );
            const {text} = this.getVehicleStatus(gps.vehicleIndexCode);
            const speed = this.getVehicleSpeed(
                gps.vehicleIndexCode,
                gps.speed ? gps.speed : 0
            );
            const limitSpeed = gps.limitSpeed ? gps.limitSpeed : 0;
            // 最后定位时间
            const lastLocationTime = this.getVehicleLastTime(
                gps.vehicleIndexCode,
                gps.lastLocationTime
            );
            // 最后更新时间 update by chenying 2021.06.02
            const updateTime = this.getVehicleUpdateTime(
                gps.vehicleIndexCode,
                gps.updateTime
            );
            const lotgut =  (gps.longitude / 360000).toFixed(6) +' ，'+(gps.latitude / 360000).toFixed(6)+''
            const ACCStatus = gps.vehicleStatus
                ? gps.vehicleStatus % 2 === 1
                    ? 'ACC开'
                    : 'ACC关'
                : '';
            // add by chenying 2021.06.07
            // const gpsStatus =gps.gpsStatus
            //   ? gps.gpsStatus === 1
            //     ? '未定位' : '定位';
            const gpsStatus = gps.gpsStatus === 1 ? '定位' : '未定位';
            const retransFlag = gps.retransFlag ? gps.retransFlag : '';

            // 获取驾驶员照片
            this.driverImg = gps.driverIndexCode
                ? `/ctm01ttvm-web/resource/findDriverImage.do?driverIndexCode=${gps.driverIndexCode}&width=100&height=120`
                : this.img1;
            // 获取驾驶员考勤信息
            const attendanceDTO = await this.getDriverInfo(gps.vehicleIndexCode);
            // console.log(attendanceDTO)

            // 最近报警事件
            const lastAlarm = this.getVehicleAlarm(gps.vehicleIndexCode);

            const option = {
                ...gps,
                ...{
                    companyName:
                        gps.ibmData && gps.ibmData.companyName ? gps.ibmData.companyName : '',
                    vehicleType: // 车辆类型
                        gps.ibmData && gps.ibmData.vehicleType ? gps.ibmData.vehicleType : '',
                    owner:
                        gps.ibmData && gps.ibmData.owner ? gps.ibmData.owner : '',
                    using:
                        gps.ibmData && gps.ibmData.using ? gps.ibmData.using : '',
                    brand:
                        gps.ibmData && gps.ibmData.brand ? gps.ibmData.brand : '',
                    limit:
                        gps.ibmData && gps.ibmData.limit ? gps.ibmData.limit : '',
                    runSection:
                        gps.ibmData && gps.ibmData.runSection ? gps.ibmData.runSection : '',
                    driver_address:
                        gps.ibmData && gps.ibmData.driverInfo && gps.ibmData.driverInfo.address ? gps.ibmData.driverInfo.address : '',
                    sex:
                        gps.ibmData && gps.ibmData.driverInfo && gps.ibmData.driverInfo.sex ? gps.ibmData.driverInfo.sex : '',
                    tel:
                        gps.ibmData && gps.ibmData.driverInfo && gps.ibmData.driverInfo.tel ? gps.ibmData.driverInfo.tel : '',
                    company:
                        gps.ibmData && gps.ibmData.driverInfo && gps.ibmData.driverInfo.company ? gps.ibmData.driverInfo.company : '',
                    vehicleTypeDrive: // 准驾车型
                        gps.ibmData && gps.ibmData.driverInfo && gps.ibmData.driverInfo.vehicleType ? gps.ibmData.driverInfo.vehicleType : '',

                    talkDeviceIndexCode,
                    vehicleIndexCode: gps.vehicleIndexCode,
                    id: `infoWindowId_${gps.vehicleIndexCode}`,
                    titleHTML: gps.vehicleLicensePlate,
                    status,
                    location: [gps.longitude / 360000, gps.latitude / 360000],
                    alarmEvent: '无',

                    driverName: attendanceDTO === null ? '' : attendanceDTO.name,
                    driverNo:
                        attendanceDTO !== null ? attendanceDTO.certificateID : '',
                    driverTime:
                        attendanceDTO && attendanceDTO.time
                            ? attendanceDTO.time
                            : '',
                    driverIndexCode: attendanceDTO === null ? '' : attendanceDTO.vehicleIndexCode,

                    text,
                    retransFlag,
                    gpsStatus, // gps定位状态
                    speed,
                    lotgut, // 经纬度
                    mileage : gps.mileage || '', // 里程数
                    satellites :gps.satellites || '', // 搜星数
                    limitSpeed,
                    lastLocationTime,
                    updateTime,
                    ACCStatus,
                    driverImg: this.driverImg,
                    lastAlarm,
                    // driverSource,
                    isTracking: this.isTracking,
                    clearDot: vehicleIndexCode => {
                        this.clearDot(vehicleIndexCode);
                    },
                    closeInfoWindow: () => {
                        this.closeInfoWindow();
                    },
                    getVehicleCameraChannels: vehicleIndexCode => {
                        this.getVehicleCameraChannels(vehicleIndexCode);
                    },
                    sendSMS: vehicleIndexCode => {
                        this.sendSMS(vehicleIndexCode, gps.vehicleLicensePlate);
                    },
                    talkReal: (id1, deviceIndexCode, vehicleLicensePlate) => {
                        this.talkReal(id1, deviceIndexCode, vehicleLicensePlate);
                    },
                    trackplayback: vehicleIndexCode => {
                        this.trackplayback(vehicleIndexCode, gps.vehicleLicensePlate);
                    },
                    track: (vehicleIndexCode, vehicleLicensePlate) => {
                        this.track(vehicleIndexCode, vehicleLicensePlate);
                    },
                    showVehicleInfo: vehicleIndexCode => {
                        this.showVehicleInfo(vehicleIndexCode, gps.orgName);
                    },
                    unTrack: () => {
                        this.unTrack();
                    },
                    updateCollect: (vehicleIndexCode, isCollected) => {
                        this.updateCollect(vehicleIndexCode, isCollected);
                    },
                    getVehicleLocation: deviceIndexCode => {
                        this.getVehicleLocation(deviceIndexCode, gps.vehicleLicensePlate);
                    }
                }
            };
            openPopup(option, this);
        },
        closeInfoWindow() {
            this.clearPopUp();
            this.currentRow = '';
        },
        updateCollect(vehicleIndexCode, isCollected) {
            updateVehicleCollect(vehicleIndexCode, isCollected);
            this.$eventBus.$emit('updateVehicleCollect');
        },
        clearDot(vehicleIndexCode) {
            removeVectors([vehicleIndexCode]);
            this.$refs.resourceTree.$refs.resourceTree.setChecked(
                vehicleIndexCode,
                false
            );
            this.selectedNodes = this.selectedNodes.filter(
                item => item.id !== vehicleIndexCode
            );
            // 取消实时定位订阅
            this.removeGPS(vehicleIndexCode);
            this.currentRow = '';
            this.createTableData();
        },
        track(vehicleIndexCode, vehicleLicensePlate) {
            if (!this.isTracking) {
                this.isTracking = vehicleIndexCode;
                untrackActive();
                return;
            }
            const info = getVehicleInfo(this.isTracking);
            this.$confirm(
                `目前正在追踪 ${
                    info ? info.gps.vehicleLicensePlate : ''
                }, 是否切换成 ${vehicleLicensePlate} ?`,
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'question'
                }
            ).then(() => {
                this.isTracking = vehicleIndexCode;
                untrackActive();
            });
        },
        unTrack() {
            this.isTracking = '';
            trackActive();
        },
        trackplayback(vehicleIndexCode, vehicleLicensePlate) {
            window.top.goToApp({
                url: '/ctm01ttvm-web/#/location/vehicleTrack',
                name: '行车轨迹',
                param: `indexCode=${vehicleIndexCode}&plateNo=${vehicleLicensePlate}`
            });
        },
        showVehicleInfo(vehicleIndexCode, orgName) {
            this.detailvehicleOrgName = orgName;
            this.detailvehicleIndexCode = vehicleIndexCode;
            this.showVehicleDetail = true;
        },
        getVehicleLocation(deviceIndexCode, vehicleLicensePlate) {
            const param = {
                method: 'LocationQuery',
                params: {
                    indexCode: deviceIndexCode
                }
            };
            terminalAbility(param).then(res => {
                if (res.code === '0') {
                    const data = res.data.data;
                    data.vehicleLicensePlate = vehicleLicensePlate;
                    data.address = '';
                    getAddress(
                        [Number(data.longitude) / 360000, Number(data.latitude) / 360000],
                        null,
                        address => {
                            this.$set(data, 'address', address);
                        }
                    );
                    data.longitude = this.getVehicleGPS(Number(data.longitude));
                    data.latitude = this.getVehicleGPS(Number(data.latitude));
                    data.limitSpeed = data.extraInfo ? data.extraInfo.limitSpeed : null;
                    this.gpsMonitorData = [data];
                    this.isShowTab = true;
                    this.activeTab = 'gpsMonitor';
                }
            });
        },
        // 点名
        rollCall() {
            this.countNum = 0;
            if (this.selectedNodes.length === 0) {
                this.$msgbox({
                    title: '提示',
                    type: 'warning',
                    message: '请先选择车辆'
                });
                return;
            }
            this.$confirm('确定对所选车辆进行点名?', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'question'
            })
                .then(() => {
                    this.rollCallLoading = true;
                    this.successArr = [];
                    this.errorArr = [];
                    this.paramsVeArr = [];
                    this.loading = true;
                    const arr = this.selectedNodes.map(item => item.id);
                    for (let i = 0; i < arr.length; i += 20) {
                        this.paramsVeArr.push(arr.slice(i, i + 20));
                    }
                    this.paramsVeArr.forEach(temp => {
                        const params = {
                            vehicleIndexCodes: temp,
                            message: '点名',
                            onEmergent: false,
                            onTerminal: false,
                            onTTS: false,
                            onLED: false,
                            needConfirm: 0,
                            userId: '',
                            // broadcastType: this.form2.type,
                            // broadcastRate: this.form2.frequency,
                            // endTime: toTimezoneString(this.form2.endTime),
                            type: 0 // 0：点名，1：下发消息
                        };
                        batchBroadcast(params).then(json => {
                            this.countNum++;
                            if (json.code === '0') {
                                if (json.data) {
                                    if (json.data.filter(item => item.code === '0').length > 0) {
                                        json.data
                                            .filter(item => item.code === '0')
                                            .forEach(item => {
                                                this.successArr.push(item);
                                            });
                                    }
                                    if (json.data.filter(item => item.code !== '0').length > 0) {
                                        json.data
                                            .filter(item => item.code !== '0')
                                            .forEach(item => {
                                                this.errorArr.push(item);
                                            });
                                    }
                                } else {
                                    this.$message.success('点名成功');
                                }
                            } else {
                                this.$message.error('所有车辆点名失败');
                            }
                        });
                    });
                })
                .catch(() => {
                });
        },
        // 打开抓拍窗口
        openCaptureDialog() {
            if (this.selectedNodes.length === 0) {
                this.$msgbox({
                    title: '提示',
                    type: 'warning',
                    message: '请先选择车辆'
                });
                return;
            }
            if (this.selectedNodes.length > 1) {
                this.$msgbox({
                    title: '提示',
                    type: 'warning',
                    message: '最多选择一个车辆进行抓拍'
                });
                return;
            }
            const vehicleIndexCode = this.selectedNodes.map(item => item.id)[0];
            queryCameraByVehicleIndexCode({
                vehicleIndexCode
            }).then(json => {
                if (json.code === '0') {
                    if (json.data.length > 0) {
                        this.isShowCaptureDialog = true;
                        this.captureVehicleIndexCode = vehicleIndexCode;
                        this.captureChannels = json.data.map(item => ({
                            id: item.indexCode,
                            name: item.name
                        }));
                    } else {
                        this.$message({
                            type: 'warning',
                            message: '该车辆没有监控点,请先配置监控点'
                        });
                    }
                } else {
                    this.$message({
                        type: 'warning',
                        message: '获取监控点失败'
                    });
                }
            });
        },

        sendSMS(vehicleIndexCode, vehicleLicensePlate) {
            this.broadcastVehicles = [
                {
                    vehicleIndexCode,
                    plateNo: vehicleLicensePlate
                }
            ];
            this.$refs.BroadcastDialog.openDialog();
        },
        sendBordcast() {
            if (this.selectedNodes.length === 0) {
                this.$msgbox({
                    title: '提示',
                    type: 'warning',
                    message: '请先选择车辆'
                });
                return;
            }
            this.broadcastVehicles = this.selectedNodes.map(item => {
                return {
                    vehicleIndexCode: item.id,
                    plateNo: item.name
                };
            });
            this.$refs.BroadcastDialog.openDialog();
        },
        closeOnOffWebsocket() {
            if (this.isListeningOnOff) {
                this.wsOnOff.close();
            }
        },
        onUpdateAlarm(eventId, labels) {
            const label = [
                {
                    component: process.env.VUE_APP_COMPONENT_ID,
                    labels: labels
                }
            ];
            // const alarm = this.allAlarms.find(item => item.eventId === eventId);
            // if (alarm) {
            //   alarm.label = label;
            // }
            if (this.alarmLedger && this.alarmLedger.eventId === eventId) {
                this.alarmLedger.label = label;
            }
        },
        onUpdateMessageLabel() {
            this.findAlarms();
        },
        openSubscriptionDialog() {
            this.$refs.auditDialog.openDialog();
        },
        toggleVehicleTree() {
            this.showVehicleTree = !this.showVehicleTree;
        },
        showTabInfo() {

            this.isShowTab = !this.isShowTab;
            // console.log(this.);
            if (this.isShowTab) {
                this.findAlarms();
                this.findAlarmInterval = setInterval(this.findAlarms, ALARM_INTERVAL);
            } else {
                // 清除定时器
                if (this.findAlarmInterval) {
                    clearInterval(this.findAlarmInterval);
                }
            }

        },
    }
};
