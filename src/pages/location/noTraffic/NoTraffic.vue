<template>
    <h-layout class="statistics-page">
        <h-layout-aside width="280px" class="left-bar">
            <vehicle-tree
                ref="resourceTree"
                :top="8"
                :bottom="8"
                :left="8"
                :right="8"
                tree-key="indexCode"
                tree-type="3"
                :check-limit="2000"
                :is-need-online="true"
                :is-need-search-type="true"
                :slot-line="1"
                :is-need-check-box="false"
                @deviceClick="switchDevice"
            ></vehicle-tree>
        </h-layout-aside>
        <h-layout class="right-bar">
            <h-layout-header></h-layout-header>
            <h-layout-content style="overflow: auto;">
                <div ref="pageBox" class="right-box">
                    <div v-if="true" class="form-box">
                        <el-form
                            ref="noTraffic"
                            v-loading="contentLoading"
                            :rules="noTrafficRules"
                            label-width="220px"
                            :model="noTraffic"
                        >
                            <el-row :gutter="10">
                                <el-col :span="24">
                                    <el-form-item
                                        label="禁行时段："
                                        prop="trafficTime"
                                    >
                                        <el-col :span="8">
                                            <el-time-picker
                                                v-model="startTime"
                                                :disabled="handleDisabled(49691)"
                                                placeholder="开始时间"
                                                prop="startTime"
                                                clearable
                                            />
                                            <input type="hidden" v-model="noTraffic[49691]"/>
                                        </el-col>
                                        <el-col :span="8">
                                            <el-time-picker
                                                v-model="endTime"
                                                :disabled="handleDisabled(49691)"
                                                placeholder="结束时间"
                                                prop="endTime"
                                                clearable
                                            />
                                        </el-col>
<!--                                        <el-time-picker-->
<!--                                            is-range-->
<!--                                            v-model="noTraffic[49691]"-->
<!--                                            :disabled="handleDisabled(49691)"-->
<!--                                            start-placeholder="开始时间"-->
<!--                                            end-placeholder="结束时间"-->
<!--                                        />-->
                                    </el-form-item>
                                </el-col>
                            </el-row>

                            <el-row :gutter="10">
                                <el-col :span="24">
                                    <el-form-item
                                        label="禁行时段到达提醒提前时间(分钟)："
                                        prop=""
                                    >
                                        <el-col :span="16">
                                            <el-input-number
                                                v-model="noTraffic[49696]"
                                                :disabled="handleDisabled(49696)"
                                                :max="60"
                                                :min="0"
                                                style="width: 100%"
                                                placeholder=""
                                            >
                                            </el-input-number>
                                    </el-col>
                                    </el-form-item>
                                </el-col>
                            </el-row>

                            <el-row :gutter="10">
                                <el-col :span="24">
                                    <el-form-item
                                        label="禁行时段提醒时间间隔(分钟)："
                                        prop=""
                                    >
                                        <el-col :span="16">
                                            <el-input-number
                                                v-model="noTraffic[49697]"
                                                :disabled="handleDisabled(49697)"
                                                :min="0"
                                                :max="60"
                                                style="width: 100%"
                                                placeholder=""
                                            >
                                            </el-input-number>
                                        </el-col>
                                    </el-form-item>
                                </el-col>
                            </el-row>

<!--                            <el-row :gutter="10">-->
<!--                                <el-col :span="18">-->
<!--                                    <el-form-item-->
<!--                                        label=" 禁行时段到达提醒语音："-->
<!--                                        prop=""-->
<!--                                    >-->
<!--                                        <el-input-->
<!--                                            class="el-input&#45;&#45;width"-->
<!--                                            placeholder=""-->
<!--                                            style="width: 100%"-->
<!--                                            v-model="noTraffic[49712]"-->
<!--                                            :disabled="handleDisabled(49712)"-->
<!--                                        ></el-input>-->
<!--                                    </el-form-item>-->
<!--                                </el-col>-->
<!--                            </el-row>-->

<!--                            <el-row :gutter="10">-->
<!--                                <el-col :span="18">-->
<!--                                    <el-form-item-->
<!--                                        label=" 禁行时段到达报警语音："-->
<!--                                        prop="voicePrompt"-->
<!--                                    >-->
<!--                                        <el-input-->
<!--                                            class="el-input&#45;&#45;width"-->
<!--                                            placeholder=""-->
<!--                                            style="width: 100%"-->
<!--                                            v-model="noTraffic[49713]"-->
<!--                                            :disabled="handleDisabled(49713)"-->
<!--                                        ></el-input>-->
<!--                                    </el-form-item>-->
<!--                                </el-col>-->
<!--                            </el-row>-->

                            <el-row :gutter="10">
                                <el-col :span="24">
                                    <el-form-item
                                        label="禁行时段到达提醒播报次数："
                                        prop=""
                                    >
                                        <el-col :span="16">
                                            <el-input-number
                                                v-model="noTraffic[49714]"
                                                :disabled="handleDisabled(49714)"
                                                :min="0"
                                                :max="255"
                                                style="width: 100%"
                                                placeholder=""
                                            ></el-input-number>
                                        </el-col>
                                    </el-form-item>
                                </el-col>
                            </el-row>

                            <el-row :gutter="10">
                                <el-col :span="24">
                                    <el-form-item
                                        label="禁行时段到达报警语音次数 ："
                                        prop=""
                                    >
                                        <el-col :span="16">
                                            <el-input-number
                                                v-model="noTraffic[49716]"
                                                :disabled="handleDisabled(49716)"
                                                :min="0"
                                                :max="255"
                                                style="width: 100%"
                                                placeholder=""
                                            ></el-input-number>
                                        </el-col>
                                    </el-form-item>
                                </el-col>
                            </el-row>

                            <el-row :gutter="10">
                                <el-col :span="24">
                                    <el-form-item
                                        label="禁行时段到达报警报时间间隔(分钟)："
                                        prop=""
                                    >
                                        <el-col :span="16">
                                            <el-input-number
                                                v-model="noTraffic[49717]"
                                                :disabled="handleDisabled(49717)"
                                                :min="0"
                                                style="width: 100%"
                                                placeholder=""
                                            ></el-input-number>
                                        </el-col>
                                    </el-form-item>
                                </el-col>
                            </el-row>

                            <el-row :gutter="10">
                                <el-col :span="18"><p style="padding-left:255px;color: #999999">备注：本功能仅对有为设备生效</p></el-col>
                            </el-row>

                        </el-form>
                    </div>
                </div>
            </h-layout-content>

            <h-layout-footer>
                <div class="footer-btn">
                    <el-button
                        :disabled="!isOnline"
                        type="primary"
                        @click="handleSearchSetting"
                    >
                        查询设置
                    </el-button>
                    <el-button
                        :disabled="!isOnline2"
                        type="primary"
                        @click="handleSaveSetting"
                    >
                        保存设置
                    </el-button>
                </div>
            </h-layout-footer>

        </h-layout>
    </h-layout>
</template>

<script>
import VehicleTree from "@/components/Tree";
import {getVehicleDetail, terminalAbility} from "@/api/location";

const now = new Date();

 // 夜间禁行
export default {
    name: "NoTraffic",
    components: {
        VehicleTree
    },
    data() {
        return {
            param: {},
            isOnline: false,
            isOnline2: false,
            // formDisabled: false,
            contentLoading: false,
            noTrafficRules: {
            },
            noTraffic: { // 表单对象
                '49691': [new Date( now.getFullYear(),now.getMonth(),now.getDate(),2, 0,0),new Date(  now.getFullYear(),now.getMonth(),now.getDate(),5, 0,0)],
            },
            startTime: new Date(now.getFullYear(), now.getMonth() , now.getDate(), 22, 0),
            endTime: new Date(now.getFullYear(), now.getMonth() , now.getDate(), 5, 0),
            selectedNodes: [], // tree选中的节点
            terminalIds: [], // 设备终端id
            vehicleIndexCode:'',
            tempForm: {}, // 存储原有的数据
        }
    },
    created() {
        // console.log(now.getHours())
        // console.log(this.forMateTime(this.noTraffic['49691'][0]))
        // console.log(this.noTraffic['49691'][1])
    },
    methods: {
        p(s) {
            return s < 10 ? '0' + s : s
        },
        forMateTime(date) {
            const d = new Date(date)
            const resDate = d.getFullYear() + '-' + this.p((d.getMonth() + 1)) + '-' + this.p(d.getDate())
            const resTime = this.p(d.getHours()) + ':' + this.p(d.getMinutes()) + ':' + this.p(d.getSeconds())
            return resDate+" "+resTime
        },
        handleDisabled(num) {
            // 验证设备 num为设备id
            return !this.terminalIds.includes(num);
        },
        switchDevice(data) {
            this.selectedNodes = data;
            this.isOnline = data[0].online === 1;
            // this.contentLoading = true;
            this.terminalIds = [];
            this.$forceUpdate();
        },
        // 查询参数
        handleSearchSetting() {
            const data = [...this.selectedNodes];
            this.contentLoading = true;
            getVehicleDetail({vehicleIndexCode:data[0].indexCode}).then( res => {
                if (res.code === '0') {
                    const desc = this.forMateTime(this.startTime) + "-" + this.forMateTime(this.endTime);
                    // 封装需要的参数格式
                    this.param ={
                        indexCode : data[0].deviceIndexCode,
                        plateNo : data[0].name,
                        plateColor : res.data.vehicleLicenseColor,
                        simNumber : res.data.simNo === null ? undefined : res.data.simNo,
                        // desc : this.forMateTime(this.noTraffic['49691'][0]) + "-" + this.forMateTime(this.noTraffic['49691'][1])
                        desc : desc,
                    }
                    this.handleSearch();// 调用接口
                } else {
                    this.contentLoading =  false;
                }
            });
        },
        // 保存设置
        handleSaveSetting() {
            const arr = [];
            // console.log(this.noTraffic)
            Object.keys(this.noTraffic).forEach( item => {
                if (this.tempForm[item] !== this.noTraffic[item]) {
                    let obj = [];
                    if (item === '49691') {
                        // console.log(this.noTraffic[item][0].getHours()*3600)
                        // console.log(this.noTraffic[item][1].getHours()*3600)
                        // const startTime=this.noTraffic[item][0].getHours()*3600 + this.noTraffic[item][0].getMinutes()*60 + this.noTraffic[item][0].getSeconds();
                        // const endTime=this.noTraffic[item][1].getHours()*3600 + this.noTraffic[item][1].getMinutes()*60 + this.noTraffic[item][1].getSeconds();
                        const startTime=this.startTime.getHours()*3600 + this.startTime.getMinutes()*60 + this.startTime.getSeconds()
                        const endTime=this.endTime.getHours()*3600 + this.endTime.getMinutes()*60 + this.endTime.getSeconds()
                        obj = {
                            paramId: Number(item),
                            paramValue: '4_'+startTime+'_'+endTime
                        }
                    }else{
                        obj ={
                            paramId: Number(item),
                            paramValue: this.noTraffic[item]
                        };
                    }
                    arr.push(obj);
                    // console.log(arr)
                }
            });
            if(this.selectedNodes.length === 0) {
                this.$msgbox({
                    title : '提示',
                    type : 'warning',
                    message : '请先选择车辆'
                });
            } else {
                const param ={
                    method: 'SetRemoteConfigParameters',
                     // type  1夜间禁行  2疲劳驾驶
                    moreParams: {
                        type : 1,
                        desc: this.param.desc
                    },
                    params: {
                        indexCode: this.param.indexCode,
                        plateNo: this.param.plateNo,
                        plateColor: this.param.plateColor,
                        simNumber: this.param.simNumber,
                        parameters: arr,
                    }
                };
                terminalAbility(param).then(res => {
                    if (res.code === '0'){
                        this.$message({
                            type: 'success',
                            message: '操作成功！'
                        });
                        // 刷新数据
                        this.handleSearch();
                        this.contentLoading = true;
                    }
                })
            }
        },
        handleSearch() {
            const arr = [];
            Object.keys(this.noTraffic).forEach(item =>{
               arr.push(parseInt(item));
            });
            const param = {
                method: 'GetRemoteConfigParameters',
                params: {
                    indexCode: this.param.indexCode,
                    plateNo: this.param.plateNo,
                    plateColor: this.param.plateColor,
                    simNumber: this.param.simNumber,
                    paramIds : arr,
                }
            }
            terminalAbility(param).then(res => {
                if(res.code === '0'){
                    this.isOnline2 = true;

                    const obj = {};
                    const arr = res.data.data.params;
                    arr.forEach(item => {
                        if (item.id === 49691){
                            const trafficTime = (item.value).slice(2).split('_') ;
                            const startTime = trafficTime[0];
                            const endTime = trafficTime[1];
                            // console.log(time)
                            obj[item.id] = [new Date(
                                now.getFullYear(),
                                now.getMonth() +1,
                                now.getDate(),
                                parseInt(startTime/60/60),
                                parseInt(startTime/60%60),
                                startTime%(60)
                            ),new Date(
                                now.getFullYear(),
                                now.getMonth() +1,
                                now.getDate(),
                                parseInt(endTime/60/60),
                                parseInt(endTime/60%60),
                                endTime%(60)
                            )]
                        } else {
                            obj[item.id] = item.value;
                        }
                        this.terminalIds.push(item.id)
                    })

                    this.$forceUpdate(); // 强制刷新组件
                    this.noTraffic = obj;
                    this.tempForm = JSON.parse(JSON.stringify(obj)); // 存储原有的数据
                    this.contentLoading = false;
                } else {
                    this.contentLoading = false; // 关闭loading
                }
            })
        }
    },
}
</script>

<style src="@/pages/statistics/statistics.scss" lang="scss"></style>
<style lang="scss" scoped>
::v-deep {
    .el-form-item__label{width: 255px!important;}
    .el-form-item__content{margin-left: 255px!important;}
}
.right-box {
    height: 100%;
    .form-box {
        height: 100%;
        padding: 20px 10px;
        width: 70%;
        margin: 0 auto;
    }
}
.footer-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    border-top: solid 1px #eaeaea;
    height: 48px;
}
</style>
