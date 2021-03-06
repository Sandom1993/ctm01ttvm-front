<template>
    <el-table
        ref="table"
        v-loading="locationMoloading"
        :data="alarms"
        class="alarm-table"
        style="width: 100%"
        :height="tableHeight"
        stripe
        highlight-current-row
    >
        <el-table-column type="selection"></el-table-column>
        <!--  <el-table-->
        <!--    ref="table"-->
        <!--    :data="alarms"-->
        <!--    class="alarm-table"-->
        <!--    style="width: 100%"-->
        <!--    :height="tableHeight"-->
        <!--    row-key="alarmId"-->
        <!--    stripe-->
        <!--    highlight-current-row-->
        <!--  >-->
        <!--    <el-table-column type="selection" reserve-selection></el-table-column>-->
        <el-table-column
            prop="vehicleLicensePlate"
            label="车牌号码"
            width="120"
            fixed="left"
        ></el-table-column>
        <el-table-column
            prop="vehicleSelfNo"
            label="自编号"
            width="120"
        ></el-table-column>
        <el-table-column prop="date" label="开始时间" width="160">
            <template slot-scope="scope">
                {{ getVehileTime(scope.row.beginTime) }}
            </template>
        </el-table-column>
        <el-table-column label="结束时间" width="160">
            <template slot-scope="scope">
                {{ getVehileTime(scope.row.endTime) }}
            </template>
        </el-table-column>
        <el-table-column prop="date" label="持续时间" width="100">
            <template slot-scope="scope">
                {{ scope.row.continueTime | formatSeconds }}
            </template>
        </el-table-column>
        <el-table-column
            prop="level"
            show-overflow-tooltip
            label="报警级别"
            width="80"
        >
            <template slot-scope="scope">
                <alarm-level :level="scope.row.level"></alarm-level>
            </template>
        </el-table-column>
        <el-table-column
            prop="eventTypeName"
            label="报警名称"
            width="150"
        ></el-table-column>
        <el-table-column
            prop="driverName"
            label="当班司机"
            width="100"
        ></el-table-column>
        <el-table-column
            prop="orgName"
            label="所属单位"
            width="150"
        ></el-table-column>
        <el-table-column label="定位速度" width="100">
            <template slot-scope="scope">{{ scope.row.speed }} km/h</template>
        </el-table-column>
        <el-table-column label="最高速度" width="100">
            <template slot-scope="scope">{{ scope.row.maxSpeed }} km/h</template>
        </el-table-column>
        <el-table-column label="脉冲速度" width="100">
            <template slot-scope="scope">{{ scope.row.pulseSpeed }} km/h</template>
        </el-table-column>
        <el-table-column v-if="false" label="导航速度" width="100">
            <template slot-scope="scope">{{ scope.row.recordSpeed }} km/h</template>
        </el-table-column>
        <el-table-column label="限速" width="100">
            <template slot-scope="scope">{{ scope.row.limitSpeed }} km/h</template>
        </el-table-column>
        <el-table-column label="定位" width="80">
            <template slot-scope="scope">
                {{ scope.row.location ? '已定位' : '未定位' }}
            </template>
        </el-table-column>
        <!--    <el-table-column label="确认状态" prop="confirm" width="80" />-->
        <el-table-column label="处警状态" width="80">
            <template slot-scope="scope">
                {{ getAlarmDealStatus(scope.row) }}
            </template>
        </el-table-column>
        <el-table-column
            label="地理位置"
            width="120"
            prop="address"
        ></el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
            <template slot-scope="scope">
                <el-button
                    type="link"
                    size="small"
                    title="解析地理位置"
                    @click="regeo(scope.row)"
                >
                    解析
                </el-button>
                <!--        <el-button type="link" size="small" @click="onConfirmAlarm(scope.row)">-->
                <!--          确认-->
                <!--        </el-button>-->
                <el-button type="link" size="small" @click="onDealAlarm(scope.row)">
                    处理
                </el-button>
            </template>
        </el-table-column>
    </el-table>
</template>

<script>
import {toTimeNormalString, toTimezoneString} from '@/components/util.js';
import AlarmLevel from '@/components/AlarmLevel';
import alarmUtil from '@/utils/alarm';
import {getAddress} from '@/pages/location/monitor/maptools.js';

export default {
    name: 'LocationMonitorAlarmTable',
    components: {
        AlarmLevel
    },
    props: {
        alarms: {
            type: Array,
            default: () => {
                return [];
            }
        },
        locationMoloading: {
            type: Boolean,
            default: false
        },
        tableHeight: {
            type: Number,
            default: 0
        },
        isRealtime: {
            type: Boolean,
            default: false
        },
        isRiskEvent: {
            // 是否是风险事件
            type: Boolean,
            default: false
        }
    },
    methods: {
        getAlarmDealStatus(alarm) {
            return alarmUtil.getAlarmDealStatus(alarm);
        },
        getVehileTime(time) {
            if (time === null) {
                return '';
            }
            return typeof time !== 'undefined'
                ? toTimeNormalString(toTimezoneString(time))
                : '';
        },
        onDealAlarm(alarm) {
            // this.$set(alarm, 'confirm', '已确认');
            this.$emit('deal-alarm', alarm);
        },
        onConfirmAlarm(alarm) {
            this.$set(alarm, 'confirm', '已确认');
        },
        getDateTime(time) {
            if (time === null) {
                return '';
            }
            return typeof time !== 'undefined'
                ? toTimeNormalString(toTimezoneString(time))
                : '';
        },
        getApproveStatus(alarm) {
            if (!alarm.label) {
                return '等待审核';
            }
            const label = alarm.label.find(
                item => item.component === process.env.VUE_APP_COMPONENT_ID
            );
            if (!label) {
                return '等待审核';
            }
            const approveStatus = {
                '1': '初审完成',
                '2': '复审完成',
                '-1': '等待审核'
            };
            const status = label.labels.find(item => item.key === 'approveStatus');
            if (status) {
                return approveStatus[status.value];
            }
        },
        getApproveStatusCls(alarm) {
            if (!alarm.label) {
                return 'wait';
            }
            const label = alarm.label.find(
                item => item.component === process.env.VUE_APP_COMPONENT_ID
            );
            if (!label) {
                return 'wait';
            }
            const status = label.labels.find(item => item.key === 'approveStatus');
            if (status && status.value === '-1') {
                return 'wait';
            }
        },
        getValid(alarm) {
            if (alarm.label) {
                const label = alarm.label.find(
                    item => item.component === process.env.VUE_APP_COMPONENT_ID
                );
                if (label) {
                    const valid = label.labels.find(item => item.key === 'valid');
                    if (valid) {
                        if (valid.value === '0') {
                            return '误报';
                        } else if (valid.value === '1') {
                            return '有效';
                        } else if (valid.value === '-1') {
                            return '存疑';
                        } else if (this.isRiskEvent && valid.value === '2') {
                            return '误报';
                        }
                    }
                }
                return '';
            }
        },
        clickAlarm(alarm) {
            this.$emit('row-click', alarm);
        },
        regeo(alarm) {
            // FIXME 数据自动刷新后，地址字段被覆盖为空
            getAddress(
                [alarm.longitude / 360000, alarm.latitude / 360000],
                null,
                address => {
                    const index = this.alarms.findIndex(
                        item => item.alarmId === alarm.alarmId
                    );
                    if (index > -1) {
                        this.$set(this.alarms[index], 'address', address);
                    }
                }
            );
        }
    }
};
</script>

<style lang="scss" scoped>
.approve-status.wait {
    color: #fa3239;
}

::v-deep {
    .el-table__body tr.current-row > td {
        background: #c9e5f5 !important;
    }
}
</style>
