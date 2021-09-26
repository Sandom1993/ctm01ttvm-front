<template>

    <div>
        <el-tabs value="first" :fix-width="120">
            <el-tab-pane label="定位信息" name="first">
                <ul class="control-box-center" style="display:block;">
                    <li>
                        <span class="control-label">定位状态</span>
                        <span id="deviceStatus" style="width:60px">{{ option.gpsStatus }}</span>
                        <span class="control-label">ACC信息</span>
                        <span id="m_ACC" v-empty style="width:60px">{{ option.ACCStatus }}</span>
                    </li>
                    <li>
                        <span class="control-label">定位速度</span>
                        <span style="width:60px">{{ option.speed }} km/h</span>
                        <span class="control-label">车辆限速</span>
                        <span style="width:60px">
                            {{ option.limitSpeed === 0 ? '-' : option.limitSpeed + ' km/h' }}
                        </span>
                    </li>
                    <li>
                        <span class="control-label">搜星数</span>
                        <span id="retransFlag" v-empty style="width:60px">{{ option.satellites }}</span>
                        <span class="control-label">里程数</span>
                        <span id="licheng" v-empty style="width:60px">{{ option.mileage }}</span>
                    </li>
                    <li>
                        <span class="control-label">经纬度</span>
                        <span id="lotgut" v-empty>{{ option.lotgut }}</span>
                    </li>
                    <li>
                        <span class="control-label">所属围栏</span>
                        <span id="shapeName" v-empty>{{ option.shapeName }}</span>
                    </li>
                    <li>
                        <span class="control-label">围栏限速值</span>
                        <span id="shapeLimitSpeed" v-empty>{{ option.shapeLimitSpeed }}</span>
                    </li>

                    <li>
                        <span class="control-label">定位时间</span>
                        <span id="lastLocationTime">
                            {{ option.lastLocationTime.replace(/T/, ' ').slice(0, 19) }}
                        </span>
                    </li>
                    <li>
                        <span class="control-label">数据接收时间</span>
                        <span id="updateTime">
                            {{ option.updateTime.replace(/T/, ' ').slice(0, 19) }}
                        </span>
                    </li>
                    <li>
                        <span class="control-label">定位位置</span>
                        <span id="deviceLocation">{{ option.location }}</span>
                    </li>
                </ul>
            </el-tab-pane>

            <el-tab-pane label="驾驶员信息" name="second">
                <ul class="control-box-center" style="display:block;">
                    <li>
                        <span class="control-label">当班驾驶员</span>
                        <span id="m_driverName" v-empty style="width:120px">
                        {{ option.driverName }}
                    </span>
                    </li>
                    <li>
                        <span class="control-label">驾驶员资格证号</span>
                        <span id="m_driverNo" v-empty>
                        {{ option.driverNo }}
                        </span>
                    </li>
                    <li>
                        <span class="control-label">打卡时间</span>
                        <span id="driverTime" v-empty>
                            {{ option.driverTime }}
                      </span>
                    </li>
                    <li>
                        <span class="control-label">性别</span>
                        <span id="ex" v-empty>
                            {{ option.sex }}
                      </span>
                    </li>
                    <li>
                        <span class="control-label">联系方式</span>
                        <span id="tel" v-empty>
                            {{ option.tel }}
                      </span>
                    </li>
                    <li>
                        <span class="control-label">单位名称</span>
                        <span id="company" v-empty>
                            {{ option.company }}
                      </span>
                    </li>
                    <li>
                        <span class="control-label">准驾车型</span>
                        <span id="vehicleType" v-empty>
                            {{ option.vehicleTypeDrive }}
                      </span>
                    </li>
                    <li>
                        <span class="control-label">家庭住址</span>
                        <span id="driver_address" v-empty>{{ option.driver_address }}</span>
                    </li>
                </ul>
            </el-tab-pane>

            <el-tab-pane label="车辆信息" name="third">
                <ul class="control-box-center">
                    <li>
                        <span class="control-label">运营区间</span>
                        <span id="runSection" v-empty>{{ option.runSection }}</span>
                    </li>
                    <li>
                        <span class="control-label">公司名称</span>
                        <span id="companyName1" v-empty>{{ option.companyName }}</span>
                    </li>
                    <li>
                        <span class="control-label">车辆类型</span>
                        <span id="vehicleType1" v-empty>{{ option.vehicleType }}</span>
                    </li>
                    <li>
                        <span class="control-label">所有人</span>
                        <span id="owner" v-empty>{{ option.owner }}</span>
                    </li>
                    <li>
                        <span class="control-label">使用性质</span>
                        <span id="using" v-empty>{{ option.using }}</span>
                    </li>
                    <li>
                        <span class="control-label">品牌</span>
                        <span id="brand" v-empty>{{ option.brand }}</span>
                    </li>
                    <li>
                        <span class="control-label">核定载人数</span>
                        <span id="limit" v-empty>{{ option.limit }}</span>
                    </li>

                </ul>
            </el-tab-pane>
        </el-tabs>

        <!--    <div class="control-pic">-->
        <!--      <span-->
        <!--        v-if="option.driverSource && option.driverSource === 2"-->
        <!--        class="driver-source"-->
        <!--      >-->
        <!--        <i class="h-icon-tag" style="background-color: #efefef;"></i>-->
        <!--      </span>-->
        <!--      <img-->
        <!--        :src="option.driverImg"-->
        <!--        :style="-->
        <!--          `top:${option.driverSource && option.driverSource === 2 ? -28 : 0}px;`-->
        <!--        "-->
        <!--      />-->
        <!--      <el-button-->
        <!--        type="default"-->
        <!--        :max-width="92"-->
        <!--        :min-width="92"-->
        <!--        class="popup-btn"-->
        <!--        @click="collecteVehicle"-->
        <!--      >-->
        <!--        <template v-if="!option.isCollected">-->
        <!--          <i class="h-icon-star"></i>-->
        <!--          收藏-->
        <!--        </template>-->
        <!--        <template v-else>-->
        <!--          <i class="h-icon-star_f"></i>-->
        <!--          取消收藏-->
        <!--        </template>-->
        <!--      </el-button>-->
        <!--    </div>-->

        <div class="popup-bottom">
            <el-button
                icon="rm-play"
                title="预览"
                @click="option.getVehicleCameraChannels(option.vehicleIndexCode)"
            ></el-button>
            <el-button
                icon="h-icon-talk_on"
                :disabled="!option.talkDeviceIndexCode"
                :title="
          option.talkDeviceIndexCode
            ? '语音对讲'
            : '该车辆没有关联支持语音对讲的设备'
        "
                @click="talk"
            ></el-button>
            <el-button
                icon="rm-trace"
                title="轨迹回放"
                @click="option.trackplayback(option.vehicleIndexCode)"
            ></el-button>
            <el-button
                id="m_unTrack"
                :style="{ display: option.isTracking ? 'inline-block' : 'none' }"
                icon="rm-map-untrack"
                title="取消追踪"
                @click="option.unTrack()"
            ></el-button>
            <el-button
                id="m_track"
                icon="rm-map-track"
                title="追踪"
                :style="{ display: option.isTracking ? 'none' : 'inline-block' }"
                @click="option.track(option.vehicleIndexCode, option.titleHTML)"
            ></el-button>
<!--            <el-button-->
<!--                icon="h-icon-location"-->
<!--                title="位置信息"-->
<!--                @click="option.getVehicleLocation(option.deviceIndexCode)"-->
<!--            ></el-button>-->
            <el-button
                icon="h-icon-location"
                title="位置信息"
            ></el-button>
            <el-button
                icon="rm-map-message-broadcast"
                title="下发信息"
                @click="option.sendSMS(option.vehicleIndexCode)"
            ></el-button>
            <el-button
                icon="h-icon-details"
                title="详细信息"
                @click="option.showVehicleInfo(option.vehicleIndexCode)"
            ></el-button>
        </div>
    </div>
</template>

<script>
import {collectVehicle} from '@/api/alarm';

export default {
    name: 'Pop',
    data() {
        return {
            option: null
        };
    },
    methods: {
        talk() {
            if (!this.option.talkDeviceIndexCode) {
                return;
            }
            this.option.talkReal(
                this.option.vehicleIndexCode,
                this.option.talkDeviceIndexCode,
                this.option.vehicleLicensePlate
            );
        },
        collecteVehicle() {
            const type = this.option.isCollected ? 0 : 1;
            collectVehicle({
                type,
                vehicleIndexCode: this.option.vehicleIndexCode
            }).then(json => {
                if (json.code === '0') {
                    const isCollected = !this.option.isCollected;
                    this.$set(this.option, 'isCollected', isCollected);
                    this.option.updateCollect(this.option.vehicleIndexCode, isCollected);
                }
            });
        }
    }
};
</script>
<style scoped>
.driver-source {
    float: right;
    z-index: 100;
    position: relative;
}

.control-pic img {
    width: 92px;
    height: 92px;
    display: block;
    margin-bottom: 8px;
}
</style>
<style lang="scss">
.popup-bottom .el-button {
    width: 40px;
    height: 40px;
}

.popup-bottom .rm-map-track,
.popup-bottom .rm-map-untrack {
    font-size: 16px !important;
}

.popup-btn {
    padding: 0;
}
</style>
