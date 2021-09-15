<template>
    <div class="info-slider-wrap" :style="{ height: String(height) + 'px' }">
        <i @click="close" class="h-icon-close"></i>
        <div class="info-top">
            <div class="basic-info">
        <span class="basic-info-left">
          <p>{{ info.eventTypeName }}</p>
          <p>{{ (new Date(info.beginTime)).toTimeString().split(' ')[0] }}</p>
        </span>
                <span class="basic-info-right">
          <dashboard-chart
              :speed="Number(formatAlarmSpeed(info))">
          </dashboard-chart>
          <h-vehicle-plate-tag class="plateNo" color="yellow" :value="info.vehicleLicensePlate"/>
        </span>
            </div>
            <div class="driver-info">
                <img class="avatar" :src="driverimg"/>
                <div class="driver-info-detail">
                    <p>当班司机：{{ info.driverName || '暂无信息' }}</p>
                    <p>所属单位：{{ info.orgName || '暂无信息' }}</p>
                    <p>联系电话：{{ info.tel || '暂无信息' }}</p>
                </div>
            </div>
        </div>
        <div class="info-bottom">
            <p>警情流转记录：</p>
            <time-line
                class="time-line"
                :eventList="eventList">
            </time-line>
        </div>
    </div>
</template>

<script>
import DashboardChart from './DashboardChart'
import TimeLine from './TimeLine'
import VehiclePlateTag from '@hui-pro/vehicle-plate-tag';
import '@hui-pro/vehicle-plate-tag/theme/index.scss';
import alarmUtils from '@/utils/alarm';
import { getAlarmDealsByEventId} from '@/api/alarm'

const driverDefaultImg = require('@/assets/png/defaultDriver.png')
export default {
    name: 'InfoSlider',
    components: {
        DashboardChart,
        TimeLine
    },
    props: {
        height: {
            type: Number,
            default: () => {
                return 0;
            }
        },
        info: {
            type: Object,
            default: () => {
                return {
                    eventTypeName: '',
                    beginTime: '',
                    speed: 0,
                    vehicleLicensePlate: '',
                    driverName: '',
                    orgName: '',
                    tel: ''
                }
            }
        }
    },
    data() {
        return {
            driverimg: '',
            eventList: []
        }
    },
    watch: {
        info: {
            handler: function (n, o) {
                // 获取事件信息
                // 获取照片
                this.driverimg = n.driverIndexCode
                    ? `${process.env.VUE_APP_CONTEXT}/resource/findDriverImage.do?driverIndexCode=${n.driverIndexCode}&width=75&height=75`
                    : driverDefaultImg

                getAlarmDealsByEventId({
                    eventId: n.eventId
                })
                    .then(r => {
                        if (r.code !== "0") {
                            this.$message.warning('请求错误')
                            this.eventList = [];
                            this.$emit('close')
                            return;
                        }
                        if (!r.data) {
                            this.eventList = [];
                            return;
                        }
                        this.eventList = r.data
                    })
            },
            deep: true,
        }
    },
    methods: {
        formatAlarmSpeed(s) {
            return alarmUtils.formatAlarmSpeed(s);
        },
        close() {
            this.$emit('close');
        }
    }
}
</script>

<style lang="scss" scoped>
.info-slider-wrap {
    overflow: hidden;
    /*max-height: 667px;*/
    width: 440px;
    position: relative;
    background-color: #f5f5f5;

    .h-icon-close {
        position: absolute;
        top: 0;
    }
}

.info {
    &-top {
        height: 35%;
        background-color: white;
        border-left: 2px solid rgba($color: #000000, $alpha: .12);
        margin-bottom: 2%;
        padding: 20px 5px 5px 5px;

        .basic-info {
            position: relative;
            display: flex;
            height: 112px;
            width: 90%;
            margin: 0 auto;
            border-radius: 2px;
            box-shadow: 0 0 5px 0 #ccc;

            &-left {
                display: inline-block;
                height: 100%;
                width: 60%;
                background-image: linear-gradient(229deg, #FF8383 0%, #E94444 100%);

                &::before {
                    content: '';
                    position: absolute;
                    right: 40%;
                    display: block;
                    width: 20px;
                    height: 100%;
                    border-radius: 50% 0 0 50%;
                    background-color: white;
                }

                p {
                    color: white;
                    text-align: center;
                }

                p:first-child {
                    font-size: 24px;
                    line-height: 24px;
                    margin: 30px 0 10px 0;
                }

                p:nth-child(2) {
                    font-size: 14px;
                    line-height: 14px;
                }
            }

            &-right {
                display: inline-block;
                width: 40%;
                height: 100%;

                .plateNo {
                    display: block;
                    margin: -10px auto 0 auto;
                }
            }
        }

        .driver-info {
            width: 90%;
            margin: 10px auto 0 auto;
            display: flex;

            .avatar {
                width: 75px;
                height: 75px;
                border-radius: 50%;
            }

            &-detail {
                margin-left: 20px;
                display: flex;
                flex-direction: column;
                justify-content: space-around;

                p {
                    font-family: MicrosoftYaHeiUI;
                    font-size: 14px;
                    color: rgba(0, 0, 0, 0.50);
                    letter-spacing: 0;
                }
            }
        }
    }

    &-bottom {
        height: 64%;
        background-color: white;
        border-left: 2px solid rgba($color: #000000, $alpha: .12);
        padding: 15px;

        p {
            font-family: MicrosoftYaHeiUI;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.50);
        }

        .time-line {
            height: 90%;
            //margin-top: 10px; // update by chenying 2021.05.19
        }
    }
}
</style>
