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
              ref="fatigueDrivingForm"
              v-loading="contentLoading"
              :rules="fatigueDrivingFormRules"
              label-width="220px"
              :model="fatigueDrivingForm"
            >

                <el-row :gutter="10">
                    <el-col :span="18">
                        <p style="margin-top: 60px;margin-bottom: 15px;"><strong>白天驾驶超时参数：</strong></p>
                    </el-col>
                </el-row>
              <el-row :gutter="10">
                  <el-col :span="12">
                    <el-form-item
                      label="连续驾驶时间门限(分钟)："
                      prop="continuousDrivingTime"
                    >
                      <el-input-number
                        v-model="fatigueDrivingForm[87]"
                        :disabled="handleDisabled(87)"
                        :min="0"
                        style="width: 100%"
                        placeholder=""
                      />
                    </el-form-item>
                  </el-col>

                  <el-col :span="12">
                      <el-form-item label="最小休息时间(分钟)" prop="minSleepTime">
                          <el-input-number
                              v-model="fatigueDrivingForm[89]"
                              :disabled="handleDisabled(89)"
                              :min="0"
                              style="width: 100%"
                              placeholder=""
                          />
                      </el-form-item>
                  </el-col>
              </el-row>

                <el-row :gutter="10">
                    <el-col :span="18">
                        <p style="padding-left:250px; margin-bottom:10px;color: #999999">备注：本功能对所有设备生效</p>
                    </el-col>
                </el-row>


                <el-row :gutter="10">
                    <el-col :span="18">
                        <p style="margin-top:25px;margin-bottom: 15px;"><strong>夜间参数：</strong></p>
                    </el-col>
                </el-row>

                <el-row :gutter="4">
                    <el-col :span="12">
                        <el-form-item label="夜间超时驾驶时间：" prop="">
                                <el-col :span="12" style="margin-left: -3px!important;">
                                    <el-time-picker
                                        v-model="startTime"
                                        :disabled="handleDisabled(49749)"
                                        placeholder="开始时间"
                                        prop="startTime"
                                        clearable
                                    />
                                    <input type="hidden" v-model="fatigueDrivingForm[49749]"/>
                                </el-col>
                                <el-col :span="12">
                                    <el-time-picker
                                        v-model="endTime"
                                        :disabled="handleDisabled(49749)"
                                        placeholder="结束时间"
                                        prop="endTime"
                                        clearable
                                    />
                                </el-col>
<!--                            <el-time-picker-->
<!--                                is-range="is-range"-->
<!--                                unlink-range="unlink-range"-->
<!--                                v-model="fatigueDrivingForm[49749]"-->
<!--                                :disabled="handleDisabled(49749)"-->
<!--                                start-placeholder="开始时间"-->
<!--                                end-placeholder="结束时间"-->
<!--                            />-->
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="10">
                    <el-col :span="12">
                        <el-form-item label="超时驾驶最长连续驾驶时间(分钟)：" prop="">
                            <el-input-number
                                v-model="fatigueDrivingForm[49751]"
                                :disabled="handleDisabled(49751)"
                                :min="0"
                                :unlink="false"
                                style="width: 100%"
                                placeholder=""
                            />
                        </el-form-item>
                    </el-col>

                    <el-col :span="12">
                        <el-form-item label="超时驾驶最小休息时间(分钟)：" prop="maxParkTime">
                            <el-input-number
                                v-model="fatigueDrivingForm[49752]"
                                :disabled="handleDisabled(49752)"
                                :min="0"
                                style="width: 100%"
                                placeholder=""
                            />
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-row :gutter="10">
                    <el-col :span="18">
                        <p style="padding-left:250px; margin-bottom:10px;color: #999999">备注：本功能仅对有为设备生效</p>
                    </el-col>
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
import VehicleTree from '@/components/Tree';
import {getVehicleDetail , terminalAbility} from "@/api/location";

const now = new Date();

// 驾驶超时
export default {
  name: "FatigueDriving",
  components: {
    VehicleTree
  },
  data() {
      return {
        param: {},
        formDisabled: false,
        isOnline: false,
        isOnline2:false,
        contentLoading: false,
        tempForm: {}, // 存储原有的数据
        fatigueDrivingForm: {
          '49749': [new Date(now.getFullYear(), now.getMonth() +1, now.getDate(), 22, 0),new Date(now.getFullYear(), now.getMonth() +1, now.getDate(), 5, 0)]
        },
        startTime: new Date(now.getFullYear(), now.getMonth() , now.getDate(), 22, 0),
        endTime: new Date(now.getFullYear(), now.getMonth() , now.getDate(), 5, 0),
        fatigueDrivingFormRules: {},
        selectedNodes: [], // tree选中的节点
        terminalIds: [], // 设备终端id
        vehicleIndexCode:'',
      }
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
      this.isOnline2 = false;
      // this.formDisabled = true;
      this.terminalIds = [];
      this.$forceUpdate();
    },
    // 查询设置
    handleSearchSetting() {
      this.contentLoading = true;
      const data = [...this.selectedNodes]; // 复制node数组给data
      getVehicleDetail({vehicleIndexCode:data[0].indexCode}).then(res =>{
        if(res.code === '0' && res.data != null) {
            // 保存四个参数
            // console.log(this.forMateTime(this.startTime))
            const desc = this.forMateTime(this.startTime) + "-" + this.forMateTime(this.endTime);
            this.param = {
                indexCode: data[0].deviceIndexCode, // 设备code
                plateNo: data[0].name, // 车牌号
                plateColor: res.data.vehicleLicenseColor, // 车牌颜色
                simNumber: res.data.simNo === null ? undefined :res.data.simNo,
                desc : desc
            }
            this.handleSearch();
        } else {
          this.contentLoading = false;
        }
      });
    },
      // 保存设置
      handleSaveSetting() {
          const arr = [];
          Object.keys(this.fatigueDrivingForm).forEach( item => {
              if (this.tempForm[item] !== this.fatigueDrivingForm[item]) {
                  let obj = [];
                  if (item === '49749') {
                      const startTime=this.startTime.getHours()*3600 + this.startTime.getMinutes()*60 + this.startTime.getSeconds()
                      const endTime=this.endTime.getHours()*3600 + this.endTime.getMinutes()*60 + this.endTime.getSeconds()
                      // const startTime=this.fatigueDrivingForm[item][0].getHours()*3600 + this.fatigueDrivingForm[item][0].getMinutes()*60 + this.fatigueDrivingForm[item][0].getSeconds();
                      // const endTime=this.fatigueDrivingForm[item][1].getHours()*3600 + this.fatigueDrivingForm[item][1].getMinutes()*60 + this.fatigueDrivingForm[item][1].getSeconds();
                      obj = {
                          paramId: Number(item) ,
                          paramValue: '4_'+startTime+'_'+endTime
                      }
                  } else {
                      obj ={
                          paramId: Number(item),
                          paramValue: this.fatigueDrivingForm[item] * 60
                      };
                  }
                  arr.push(obj);
                  // console.log(arr)
              }
          });

          if(this.selectedNodes.length === 0) {
              this.$msgbox({
                  title: '提示',
                  type: 'warning',
                  message: '请先选择车辆'
              });
          } else {
              const param ={
                  method: 'SetRemoteConfigParameters',
                  moreParams: {
                      type : 2, // type  1夜间禁行  2驾驶超时
                      desc: this.param.desc
                  },
                  params: {
                      indexCode: this.param.indexCode,
                      plateNo: this.param.plateNo,
                      plateColor: this.param.plateColor,
                      simNumber: this.param.simNumber,
                      parameters: arr
                  }
              };
              terminalAbility(param).then(res => {
                  if (res.code === '0') {
                      this.$message({
                          message: '设置成功！',
                          type: 'success'
                      });
                      this.handleSearch(); // 刷新页面
                      this.contentLoading = true;
                  }
              });
          }
      },
    handleSearch(){
        let arr = [];
        Object.keys(this.fatigueDrivingForm).forEach(item =>{
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
        if(res.code === '0') {
         this.isOnline2 = true;
         const obj = {};
         const arr = res.data.data.params;
            arr.forEach(item => {
                if (item.id === 49749){
                    const timeOver = (item.value).slice(2).split('_') ;
                    const startTime = timeOver[0];
                    const endTime = timeOver[1];
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
                    obj[item.id] = item.value / 60;
                }
                this.terminalIds.push(item.id)
            })
          this.$forceUpdate(); // 强制刷新组件
          this.fatigueDrivingForm = obj;
          this.tempForm = JSON.parse(JSON.stringify(obj)); // 存储原有的数据
          this.contentLoading = false;
        } else {
          this.contentLoading = false;
        }
      })
    }
  }
}
</script>

<style src="@/pages/statistics/statistics.scss" lang="scss"></style>
<style lang="scss" scoped>
::v-deep {
    .el-form-item__label{width: 250px!important;}
    .el-form-item__content{margin-left: 250px!important;}
    //.el-date-editor{float: left}
}
.right-box {
  height: 100%;
  .form-box {
    height: 100%;
    padding: 20px 10px;
    width: 90%;
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
