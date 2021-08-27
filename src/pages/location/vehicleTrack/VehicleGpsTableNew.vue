<template>
    <div class="gps-table-wrap">
        <div class="table-wrap">
            <el-table
                :data="tableData"
                force-scroll
                highlight-current-row
                @row-click="rowClick"
                :cell-style="cellStyle"
            >
                <el-table-column prop="time" v-if="showData.includes('GPS时间')" label="GPS时间" :key="'GPS时间'">
                    <template slot-scope="scope">
                        <div v-if="scope.row.retransFlag === 1" class="retrans-flag">
                            补
                        </div>
                        {{
                            new Date(scope.row.time).toLocaleDateString() +
                            ' ' +
                            new Date(scope.row.time).toTimeString().substr(0, 8)
                        }}
                    </template>
                </el-table-column>
                <!-- <el-table-column prop="backtime" v-if="showData.includes('回传时间')" label="回传时间" :key="'回传时间'">
                  <template slot-scope="scope">
                    回传时间 //
                  </template>
                </el-table-column> -->
                <el-table-column prop="gpsspeed" v-if="showData.includes('GPS速度')" label="GPS速度" :key="'GPS速度'">
                    <template slot-scope="scope">
                        {{ formatSpeed(scope.row.speed) }} km/h
                    </template>
                </el-table-column>
                <el-table-column prop="pulsespeed" v-if="showData.includes('脉冲速度')" label="脉冲速度" :key="'脉冲速度'">
                    <template slot-scope="scope">
                        {{ scope.row.pulseSpeed || 0 }} km/h
                    </template>
                </el-table-column>
                <!-- <el-table-column prop="recordspeed" v-if="showData.includes('导航屏速度')" label="导航屏速度" :key="'导航屏速度'">
                  <template slot-scope="scope">
                    {{ formatSpeed(scope.row.recordSpeed) }} km/h
                  </template>
                </el-table-column> -->
                <el-table-column prop="limitspeed" v-if="showData.includes('限速值')" label="限速值" :key="'限速值'">
                    <template slot-scope="scope">
                        {{ scope.row.limitSpeed || 0 }} km/h
                    </template>
                </el-table-column>
                <el-table-column prop="limitspeed" v-if="showData.includes('GPS接收时间')" label="GPS接收时间" :key="'GPS接收时间'">
                    <template slot-scope="scope">
                        <div v-if="scope.row.retransFlag === 1" class="retrans-flag">
                            补
                        </div>
                        {{
                            new Date(scope.row.serverTime).toLocaleDateString() +
                            ' ' +
                            new Date(scope.row.serverTime).toTimeString().substr(0, 8)
                        }}
                    </template>
                </el-table-column>
                <el-table-column prop="direction" v-if="showData.includes('方向')" label="方向" :key="'方向'">
                    <template slot-scope="scope">
                        {{ numRound(scope.row.direction / 100) }}°
                    </template>
                </el-table-column>
                <!-- <el-table-column prop="location" v-if="showData.includes('定位')" label="定位" :key="'定位'">
                  <template slot-scope="scope">
                    定位  lola
                  </template>
                </el-table-column> -->
                <el-table-column prop="latitude" v-if="showData.includes('纬度')" label="纬度" :key="'纬度'">
                    <template slot-scope="scope">
                        {{ numRound(scope.row.latitude / 360000) }}
                    </template>
                </el-table-column>
                <el-table-column prop="longitude" v-if="showData.includes('经度')" label="经度" :key="'经度'">
                    <template slot-scope="scope">
                        {{ numRound(scope.row.longitude / 360000) }}
                    </template>
                </el-table-column>
                <el-table-column prop="status" v-if="showData.includes('ACC')" label="ACC" :key="'ACC'">
                    <template slot-scope="scope">
                        <!-- update by chenying 2021.08.24  -->
                        {{ scope.row.vehicleStatus % 2 === 0 ? '关' : '开' }}
                    </template>
                </el-table-column>
                <!-- <el-table-column prop="longitude" label="经度">
                  <template slot-scope="scope">
                    {{ (scope.row.longitude / 360000).toFixed(2) }}
                  </template>
                </el-table-column>
                <el-table-column prop="latitude" label="纬度">
                  <template slot-scope="scope">
                    {{ (scope.row.latitude / 360000).toFixed(2) }}
                  </template>
                </el-table-column> -->
            </el-table>
        </div>
    </div>
</template>
<script>
import alarmUtils from '@/utils/alarm';
import {gpsTodms} from '@/components/util'
import {numRound} from './util'

export default {
    name: 'VehicleGpsTableNew',
    props: {
        tableData: {
            type: Array,
            default: () => []
        },
        showData: {
            type: Array,
            default: () => []
        }
    },
  methods: {
        formatSpeed(value) {
            return alarmUtils.formatSpeed(value);
        },
        rowClick(row) {
            this.$emit('gpsTableClick', row);
        },
        gpsTodms(t) {
            return gpsTodms(t)
        },
        numRound(n) {
            return numRound(n, 6)
        },
        cellStyle(row, column, rowIndex, columnIndex) {
            // add by chenying 2021.08.09
            if (alarmUtils.formatSpeed(row.row.speed) > row.row.limitSpeed) {
                return 'color:red'
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.gps-table-wrap {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .table-wrap {
        height: 0;
        flex: 1;
        padding-top: 8px;
    }

    .retrans-flag {
        display: block;
        position: absolute;
        top: -6px;
        left: 0;
        height: 20px;
        width: 20px;
        font-size: 12px;
        color: #fff;
        background: #ff5a5a;
        background: linear-gradient(-45deg, transparent 13px, #ff5a5a 0);
    }

    .total-card {
        height: 120px;
        box-shadow: 1px 1px 8px #333333;
        position: absolute;
        left: 16px;
        right: 16px;
        bottom: 16px;
        text-align: center;
        vertical-align: middle;
        padding: 12px;

        .value {
            font-size: 24px;
        }

        .label {
            color: #000000;
            font-size: 12px;
        }

        .blue {
            color: #67b4ff;
        }

        .green {
            color: #82ccad;
        }

        .red {
            color: #f88175;
        }
    }
}
</style>
