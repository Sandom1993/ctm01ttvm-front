<template>
    <div id="print_month">
<!--        <div style="text-align: center; line-height: 58px">{{ orgName }}监控月报表</div>-->
        <div style="border: solid 1px #d9d9d9;font-size: 14px">
            <div :style="rowStyle">
                <div style="width: 25%;text-align: center;">
                    统计时间
                </div>
                <div style="width: 1px; height: 100%; background-color: #d9d9d9"></div>
                <div style="width: 75%;text-align: center;">
                    {{ statisticTime }}
                </div>
            </div>
            <div :style="rowStyle">
                <div
                    v-for="(item, key) in list1"
                    :key="key"
                    style="width: 25%;text-align: center;"
                >
                    {{ item.name }}
                </div>
            </div>
            <div :style="rowStyle">
                <div
                    v-for="(item, key) in list1"
                    :key="key"
                    style="width: 25%;text-align: center;"
                >
                    {{ item.value }}
                </div>
            </div>
            <div :style="rowStyle">
                <div style="width: 10%;text-align: center;">
                    报警类型
                </div>
                <!--        <div style="width: 1px; height: 100%; background-color: #d9d9d9"></div>-->
                <!--        <div style="width: 30%;text-align: center;">-->
                <!--          <div style="height: 50%; line-height: 50%;display: flex;align-items: center;border-bottom: solid 1px #d9d9d9">-->
                <!--            <div style="width: 100%;">超速报警</div>-->
                <!--          </div>-->
                <!--          <div style="height: 50%; line-height: 50%;display: flex;align-items: center">-->
                <!--            <div style="width: 50%;">昼间超速</div>-->
                <!--            <div style="width: 50%;">夜间超速</div>-->
                <!--          </div>-->
                <!--        </div>-->
                <div style="width: 1px; height: 100%; background-color: #d9d9d9"></div>
                <div
                    v-for="(item, key) in list2"
                    :key="key"
                    style="width: 18%;text-align: center;"
                >
                    {{ item.name }}
                </div>
            </div>
            <div :style="rowStyle">
                <div style="width: 10%;text-align: center;">
                    报警条数
                </div>
                <div style="width: 1px; height: 100%; background-color: #d9d9d9"></div>
                <div
                    v-for="(item, key) in list2"
                    :key="key"
                    style="width: 18%;text-align: center;"
                >
                    {{ item.alarmNum }}
                </div>
            </div>
            <div :style="rowStyle">
                <div style="width: 10%;text-align: center;">
                    核警次数
                </div>
                <div style="width: 1px; height: 100%; background-color: #d9d9d9"></div>
                <div
                    v-for="(item, key) in list2"
                    :key="key"
                    style="width: 18%;text-align: center;"
                >
                    {{ item.approveNum }}
                </div>
            </div>
            <div style="display: flex;height: 30%;width: 100%">
                <div style="width: 10%;display: flex;align-items: center;justify-content: center">
                    备注
                </div>
                <div style="width: 1px; height: 100%; background-color: #d9d9d9"></div>
                <div style="width: 90%;">
                    <div style="padding: 10px">
                        {{ monthObj.remark }}
                    </div>
                </div>
            </div>
        </div>
        <div style="margin-top: 8px;font-size: 14px">组织：{{ orgName }}</div>
    </div>
</template>

<script>
import {findIndexObject} from '../../../utils/common';

export default {
    name: 'MonthStatistic',
    components: {},
    props: {
        statisticTime: {
            type: String,
            default: function () {
                return '';
            }
        },
        orgName: {
            type: String,
            default: function () {
                return '';
            }
        },
        monthObj: {
            type: Object,
            default: function () {
                return {};
            }
        }
    },
    data() {
        return {
            rowStyle: 'display: flex;align-items: center;height: 8%;width: 100%;border-bottom: solid 1px #d9d9d9',
            list1: [
                {value: '', name: '平台监控车辆数'},
                {value: '', name: '上线率'},
                // { value: '', name: '定位率' },
                {value: '', name: '处警率'}
            ],
            list2: [
                {alarmNum: '', approveNum: '', name: '超速报警'},
                {alarmNum: '', approveNum: '', name: '凌晨禁行'},
                {alarmNum: '', approveNum: '', name: '疲劳驾驶'},
                {alarmNum: '', approveNum: '', name: '越线行驶'},
                {alarmNum: '', approveNum: '', name: '合计'}
            ],
            option: {}
        };
    },
    watch: {
        monthObj: {
            handler(newValue, oldValue) {
                const arr = [...this.monthObj.approveCountData];
                this.list1.forEach(item => {
                    switch (item.name) {
                        case '平台监控车辆数':
                            item.value = this.monthObj.vehicleNum;
                            break;
                        case '上线率':
                            item.value = this.monthObj.vehicleOnlineRate;
                            break;
                        // case '定位率':
                        //   item.value = this.monthObj.vehicleGpsRate;
                        //   break;
                        case '处警率':
                            item.value = this.monthObj.broadcastRate;
                            break;
                    }
                });
                if (arr.length === 5) {
                    arr.forEach(item => {
                        findIndexObject(this.list2, [
                            'name',
                            item.eventTypeName
                        ]).alarmNum = item.alarmNum;
                        findIndexObject(this.list2, [
                            'name',
                            item.eventTypeName
                        ]).approveNum = item.approveNum;
                    });
                }
            },
            deep: true
        }
    },
    created() {
    },
    mounted() {
    },
    methods: {}
};
</script>

<style lang="scss" scoped></style>
