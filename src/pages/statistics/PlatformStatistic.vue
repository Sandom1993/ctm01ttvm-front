<template>
  <h-layout class="statistics-page">
    <h-layout class="right-bar">
      <h-layout-content>
        <el-tabs
          v-model="activeTab"
          class="statistics-tab"
          @tab-click="onTabClick"
        >
          <el-tab-pane label="日报表" name="day">
            <h-layout>
              <h-layout-header>
                <div style="display: flex; padding: 6px 10px">
                  <div style="line-height: 32px">时间选择：</div>
                  <el-date-picker
                    v-model="dayDate"
                    :picker-options="pickerOptions"
                    type="date"
                    style="width: 20%; margin-right: 6px"
                    placeholder="选择日期"
                  />
                  <el-button type="primary" @click="onSearch">查询</el-button>
                  <el-button
                    type="iconButton"
                    icon="h-icon-export"
                    @click="onExport"
                  >
                    导出
                  </el-button>
                  <el-button
                    type="iconButton"
                    icon="h-icon-print"
                    :disabled="tableData.length === 0"
                    @click="handlePrint('dayStatistic')"
                  >
                    打印
                  </el-button>
                </div>
              </h-layout-header>
              <h-layout-content style="overflow: auto;">
                <el-table
                  id="dayStatistic"
                  v-loading="loading"
                  :data="tableData"
                  force-scroll
                >
                  <el-table-column
                    prop="orgName"
                    label="组织"
                    width="140"
                    fixed="left"
                  ></el-table-column>
                  <el-table-column
                    prop="alarmNum"
                    width="140"
                    label="报警数"
                  ></el-table-column>
                  <el-table-column
                    prop="broadcastRate"
                    width="140"
                    label="处警率"
                  ></el-table-column>
                  <el-table-column
                    prop="messageNum"
                    width="140"
                    label="短信数"
                  ></el-table-column>
                  <el-table-column
                    prop="vehicleNum"
                    width="140"
                    label="车辆数"
                  ></el-table-column>
                  <el-table-column
                    prop="onlineVehicleNum"
                    width="140"
                    label="上线车辆数"
                  ></el-table-column>
                  <el-table-column
                    prop="vehicleOnlineRate"
                    width="140"
                    label="车辆上线率"
                  ></el-table-column>
                  <el-table-column
                    prop="noGpsVehicleNum"
                    width="140"
                    label="未定位车辆数"
                  ></el-table-column>
                  <el-table-column
                    prop="vehicleGpsRate"
                    width="140"
                    label="车辆定位率"
                  ></el-table-column>
                  <el-table-column
                    prop="offlineVehicleNum"
                    width="140"
                    label="未上线车辆数"
                  ></el-table-column>
                  <el-table-column
                    prop="outageVehicleNum"
                    width="140"
                    label="停运车辆数"
                  ></el-table-column>
                  <el-table-column
                    prop="noDataVehicleNum"
                    width="140"
                    label="无数据车辆数"
                  ></el-table-column>
                </el-table>
              </h-layout-content>
            </h-layout>
          </el-tab-pane>
          <el-tab-pane label="月报表" name="month">
            <h-layout>
              <h-layout-header>
                <div style="display: flex; padding: 6px 10px">
                  <div style="line-height: 32px">时间选择：</div>
                  <el-date-picker
                    v-model="dateRange"
                    type="datetimerange"
                    :default-time="['00:00:00', '23:59:59']"
                    value-format="timestamp"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                    style="width: 24%; margin-right: 6px"
                    :picker-options="datePickerOptions"
                  />
                  <div style="line-height: 32px">组织选择：</div>
                  <drop-down-tree
                    ref="dropdownTree"
                    style="width: 20%; margin-right: 6px"
                    tree-type="1"
                    :is-need-filter="false"
                    :is-need-check-box="false"
                    @input="handleSelectOrg"
                  ></drop-down-tree>
                  <el-button type="primary" @click="onSearch">查询</el-button>
                  <el-button
                    type="iconButton"
                    icon="h-icon-print"
                    :disabled="
                      !(approveCountData && approveCountData.length > 0)
                    "
                    @click="handlePrint('monthStatistic')"
                  >
                    打印
                  </el-button>
                </div>
              </h-layout-header>
              <h-layout-content style="overflow: auto;">
                <div
                  id="monthStatistic"
                  v-loading="monthLoading"
                  style="border: 1px solid #d9d9d9"
                >
                  <el-row>
                    <el-col :span="6">
                      <div class="table-title">统计时间</div>
                    </el-col>
                    <el-col :span="18">
                      <div class="table-content" style="border-right: 0">
                        {{ statisticTime }}
                      </div>
                    </el-col>
                  </el-row>
                  <div style="height: 1px;background-color: #d9d9d9;" />
                  <el-row>
                    <el-col :span="6">
                      <div class="table-title">平台监控车辆数</div>
                    </el-col>
                    <el-col :span="6">
                      <div class="table-title">上线率</div>
                    </el-col>
                    <el-col :span="6">
                      <div class="table-title">定位率</div>
                    </el-col>
                    <el-col :span="6">
                      <div class="table-title">处警率</div>
                    </el-col>
                  </el-row>
                  <div style="height: 1px;background-color: #d9d9d9;" />
                  <el-row>
                    <el-col :span="6">
                      <div class="table-content">{{ vehicleNum }}</div>
                    </el-col>
                    <el-col :span="6">
                      <div class="table-content">{{ vehicleOnlineRate }}</div>
                    </el-col>
                    <el-col :span="6">
                      <div class="table-content">{{ vehicleGpsRate }}</div>
                    </el-col>
                    <el-col :span="6">
                      <div class="table-content">{{ broadcastRate }}</div>
                    </el-col>
                  </el-row>
                  <div style="height: 1px;background-color: #d9d9d9;" />
                  <el-row>
                    <el-col :span="4">
                      <div class="table-title">报警类型</div>
                    </el-col>
                    <!--                    <el-col :span="6">-->
                    <!--                      <div-->
                    <!--                        class="table-title"-->
                    <!--                        style="height: 20px; border-bottom: 1px solid #d9d9d9"-->
                    <!--                      >-->
                    <!--                        超速报警-->
                    <!--                      </div>-->
                    <!--                      <div-->
                    <!--                        style="display: flex;justify-content: center;align-items: center"-->
                    <!--                      >-->
                    <!--                        <div-->
                    <!--                          class="table-title"-->
                    <!--                          style="height: 20px; width: 50%;"-->
                    <!--                        >-->
                    <!--                          昼间超速-->
                    <!--                        </div>-->
                    <!--                        <div-->
                    <!--                          class="table-title"-->
                    <!--                          style="height: 20px; width: 50%;"-->
                    <!--                        >-->
                    <!--                          夜间超速-->
                    <!--                        </div>-->
                    <!--                      </div>-->
                    <!--                    </el-col>-->
                    <el-col :span="4">
                      <div class="table-title">超速报警</div>
                    </el-col>
                    <el-col :span="4">
                      <div class="table-title">凌晨禁行</div>
                    </el-col>
                    <el-col :span="4">
                      <div class="table-title">疲劳驾驶</div>
                    </el-col>
                    <el-col :span="4">
                      <div class="table-title">越线行驶</div>
                    </el-col>
                    <el-col :span="4">
                      <div class="table-title" style="border-right: 0">
                        合计
                      </div>
                    </el-col>
                  </el-row>
                  <div style="height: 1px;background-color: #d9d9d9;" />
                  <el-row>
                    <el-col :span="4">
                      <div class="table-title">报警条数</div>
                    </el-col>
                    <!--                    <el-col :span="3">-->
                    <!--                      <div class="table-content">-->
                    <!--                        {{ getAlarmNum('昼间超速') }}-->
                    <!--                      </div>-->
                    <!--                    </el-col>-->
                    <!--                    <el-col :span="3">-->
                    <!--                      <div class="table-content">-->
                    <!--                        {{ getAlarmNum('夜间超速') }}-->
                    <!--                      </div>-->
                    <!--                    </el-col>-->
                    <el-col :span="4">
                      <div class="table-content">
                        {{ getAlarmNum('超速报警') }}
                      </div>
                    </el-col>
                    <el-col :span="4">
                      <div class="table-content">
                        {{ getAlarmNum('凌晨禁行') }}
                      </div>
                    </el-col>
                    <el-col :span="4">
                      <div class="table-content">
                        {{ getAlarmNum('疲劳驾驶') }}
                      </div>
                    </el-col>
                    <el-col :span="4">
                      <div class="table-content">
                        {{ getAlarmNum('越线行驶') }}
                      </div>
                    </el-col>
                    <el-col :span="4">
                      <div class="table-content" style="border-right: 0">
                        {{ getAlarmNum('合计') }}
                      </div>
                    </el-col>
                  </el-row>
                  <div style="height: 1px;background-color: #d9d9d9;" />
                  <el-row>
                    <el-col :span="4">
                      <div class="table-title">核实次数</div>
                    </el-col>
                    <!--                    <el-col :span="3">-->
                    <!--                      <div class="table-content">-->
                    <!--                        {{ getApproveNum('昼间超速') }}-->
                    <!--                      </div>-->
                    <!--                    </el-col>-->
                    <!--                    <el-col :span="3">-->
                    <!--                      <div class="table-content">-->
                    <!--                        {{ getApproveNum('夜间超速') }}-->
                    <!--                      </div>-->
                    <!--                    </el-col>-->
                    <el-col :span="4">
                      <div class="table-content">
                        {{ getApproveNum('超速报警') }}
                      </div>
                    </el-col>
                    <el-col :span="4">
                      <div class="table-content">
                        {{ getApproveNum('凌晨禁行') }}
                      </div>
                    </el-col>
                    <el-col :span="4">
                      <div class="table-content">
                        {{ getApproveNum('疲劳驾驶') }}
                      </div>
                    </el-col>
                    <el-col :span="4">
                      <div class="table-content">
                        {{ getApproveNum('越线行驶') }}
                      </div>
                    </el-col>
                    <el-col :span="4">
                      <div class="table-content" style="border-right: 0">
                        {{ getApproveNum('合计') }}
                      </div>
                    </el-col>
                  </el-row>
                  <div style="height: 1px;background-color: #d9d9d9;" />
                  <el-row>
                    <el-col :span="4">
                      <div class="table-title" style="height: 152px">备注</div>
                    </el-col>
                    <el-col :span="20">
                      <div
                        style="border-right: 0; padding: 10px 20px;display: flex; align-items: flex-end"
                      >
                        <el-input
                          v-model="remark"
                          :disabled="remarkOff"
                          type="textarea"
                          :rows="6"
                        ></el-input>
                        <el-button
                          type="link"
                          :disabled="remarkOff"
                          :min-width="64"
                          @click="handleSaveRemark"
                        >
                          保存备注
                        </el-button>
                      </div>
                    </el-col>
                  </el-row>
                </div>
                <div style="font-size: 16px; margin-top: 12px">
                  组织：{{ orgName }}
                </div>
              </h-layout-content>
            </h-layout>
          </el-tab-pane>
        </el-tabs>
      </h-layout-content>
    </h-layout>
    <div v-show="false">
      <DayStatistic :day-table-data="tableDataTemp" />
      <MonthStatistic
        :statistic-time="statisticTime"
        :org-name="orgName"
        :month-obj="monthObj"
      />
    </div>
  </h-layout>
</template>

<script>
import DayStatistic from './components/DayStatistic';
import {
  getDayStatistic,
  getMonthStatistic,
  saveRemark
} from '../../api/statistics.js';
import { toTimezoneString, toTimeNormalString } from '../../components/util.js';
import { downloadExcel } from '../../core/httpInstance.js';
import MonthStatistic from './components/MonthStatistic';
import DropDownTree from './components/DropDownTree';
import { findIndexObject } from '../../utils/common';
const now = new Date();
now.setHours(0);
now.setMinutes(0);
now.setSeconds(0);
now.setMilliseconds(0);
// const endTime = now.getTime() + 24 * 60 * 60 * 1000 - 1;
const endTime = now.getTime() - 1; // update by chenying 2021.06.03

export default {
  // 平台统计数据
  name: 'PlatformStatistic',
  components: {
    DropDownTree,
    MonthStatistic,
    DayStatistic
  },
  data() {
    return {
      monthObj: {},
      remarkOff: true,
      approveCountData: [],
      dateRange: [],
      datePickerOptions: {
        disabledDate(time) {
          return time.getTime() > endTime;
        },
        customValidation(start, end) {
          return end.getTime() - start.getTime() <= 31 * 24 * 60 * 60 * 1000;
        },
        customPrompt: '选择时间范围不能超过31天'
      },
      orgName: '',
      orgIndexCode: '',
      statisticTime: '',
      broadcastRate: '',
      vehicleGpsRate: '',
      vehicleNum: '',
      vehicleOnlineRate: '',
      activeTab: 'day',
      remark: '',
      dayDate: null,
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now() - 24 * 60 * 60 * 1000;
        }
      },
      tableData: [],
      tableDataTemp: [],
      isMonth: false,
      loading: false,
      monthLoading: false
    };
  },
  methods: {
    //  获取报警条数
    getAlarmNum(name) {
      if (this.approveCountData.length > 0) {
        const objTemp = findIndexObject(this.approveCountData, [
          'eventTypeName',
          name
        ]);
        return objTemp ? objTemp.alarmNum : '';
      } else {
        return '';
      }
    },
    //  获取核实次数
    getApproveNum(name) {
      if (this.approveCountData.length > 0) {
        const objTemp = findIndexObject(this.approveCountData, [
          'eventTypeName',
          name
        ]);
        return objTemp ? objTemp.approveNum : '';
      } else {
        return '';
      }
    },
    //  选择组织
    handleSelectOrg(node) {
      if (this.isMonth) {
        this.approveCountData = [];
        this.remark = '';
        this.broadcastRate = '';
        this.vehicleGpsRate = '';
        this.vehicleNum = '';
        this.vehicleOnlineRate = '';
        this.statisticTime = '';
        this.orgName = node[0].name;
        this.orgIndexCode = node[0].indexCode;
        this.remarkOff = true;
      }
    },
    //  保存备注
    handleSaveRemark() {
      const params = {
        beginTime: toTimezoneString(this.dateRange[0]),
        endTime: toTimezoneString(this.dateRange[1]),
        orgIndexCode: this.orgIndexCode,
        remark: this.remark
      };
      saveRemark(params).then(res => {
        this.$message.success('保存成功');
        this.onSearch();
      });
    },
    //  校验月份选择
    checkMonthParams() {
      if (this.dateRange.length === 0) {
        this.$message.warning('请选择时间');
        return false;
      }
      if (this.orgIndexCode.length === 0) {
        this.$message.warning('请选择组织');
        return false;
      }
      return true;
    },
    //  校验日期选择
    checkDayParams() {
      if (!this.dayDate) {
        this.$message.warning('请选择日期');
        return false;
      }
      return true;
    },
    //  查询数据
    onSearch() {
      if (this.isMonth) {
        if (!this.checkMonthParams()) {
          return;
        }
        this.monthLoading = true;
        const params = {
          beginTime: toTimezoneString(this.dateRange[0]),
          endTime: toTimezoneString(this.dateRange[1]),
          orgIndexCode: this.orgIndexCode
        };
        const startTimeStr = toTimeNormalString(
          toTimezoneString(this.dateRange[0])
        ).split(' ')[0];
        const endTimeStr = toTimeNormalString(
          toTimezoneString(this.dateRange[1])
        ).split(' ')[0];
        this.statisticTime = startTimeStr + '---' + endTimeStr;
        getMonthStatistic(params)
          .then(res => {
            if (res.code === '0') {
              this.approveCountData = [...res.data.approveCountDtos];
              this.remark = res.data.remark;
              this.broadcastRate = this.numberTransform(res.data.broadcastRate);
              this.vehicleGpsRate = this.numberTransform(
                res.data.vehicleGpsRate
              );
              this.vehicleOnlineRate = this.numberTransform(
                res.data.vehicleOnlineRate
              );
              this.vehicleNum = res.data.vehicleNum;
              this.monthObj = {
                approveCountData: [...res.data.approveCountDtos],
                remark: res.data.remark,
                broadcastRate: this.numberTransform(res.data.broadcastRate),
                vehicleGpsRate: this.numberTransform(res.data.vehicleGpsRate),
                vehicleNum: res.data.vehicleNum,
                vehicleOnlineRate: this.numberTransform(
                  res.data.vehicleOnlineRate
                )
              };
              this.remarkOff = false;
              this.monthLoading = false;
            } else {
              this.monthLoading = false;
            }
          })
          .catch(() => {
            this.monthLoading = false;
          });
      } else {
        if (!this.checkDayParams()) {
          return false;
        }
        this.loading = true;
        const params = {
          beginTime: toTimezoneString(this.dayDate),
          endTime: toTimezoneString(
            this.dayDate.getTime() + 24 * 60 * 60 * 1000 - 1
          )
        };
        getDayStatistic(params)
          .then(res => {
            if (res.code === '0') {
              const arr = res.data.map(item => {
                item.broadcastRate = this.numberTransform(item.broadcastRate);
                item.vehicleOnlineRate = this.numberTransform(
                  item.vehicleOnlineRate
                );
                item.vehicleGpsRate = this.numberTransform(item.vehicleGpsRate);
                return item;
              });
              this.tableData = [...arr];
              let index = 0;
              const newArray = [];
              while (index < [...res.data].length) {
                newArray.push([...res.data].slice(index, (index += 16)));
              }
              this.tableDataTemp = newArray;
              this.loading = false;
            } else {
              this.loading = false;
            }
          })
          .catch(() => {
            this.loading = false;
          });
      }
    },
    //  数字转换百分数
    numberTransform(num) {
      let numTemp = null;
      if (typeof num === 'number') {
        numTemp = String((num * 100).toFixed(2)) + '%';
      } else {
        numTemp = '';
      }
      return numTemp;
    },
    //  Tab click
    onTabClick(data) {
      this.isMonth = data.name === 'month';
    },
    //  打印
    handlePrint(str) {
      let iframe = document.getElementById('print-iframe');
      if (!iframe) {
        iframe = document.createElement('IFRAME');
        let doc = null;
        iframe.setAttribute('id', 'print-iframe');
        // iframe.setAttribute('style', 'position:absolute;width:0px;height:0px;left:-500px;top:-500px;');
        document.body.appendChild(iframe);
        doc = iframe.contentWindow.document;
        const printStr =
          str === 'dayStatistic'
            ? document.getElementById('print_day').innerHTML
            : document.getElementById('print_month').innerHTML;
        doc.write(printStr);
        doc.close();
        iframe.contentWindow.focus();
      }
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
      if (navigator.userAgent.indexOf('MSIE') > 0) {
        document.body.removeChild(iframe);
      }
    },
    //  导出
    onExport() {
      if (!this.checkDayParams()) {
        return;
      }
      if (this.tableData.length === 0) {
        this.$message.warning('请先查询数据再导出');
        return;
      }
      const params = {
        beginTime: toTimezoneString(this.dayDate),
        endTime: toTimezoneString(
          this.dayDate.getTime() + 24 * 60 * 60 * 1000 - 1
        )
      };
      downloadExcel(
        `/${process.env.VUE_APP_CONTEXT}/statistic/all/exportDayStatistic.do`,
        params
      );
    }
  }
};
</script>

<style src="@/pages/statistics/statistics.scss" lang="scss"></style>
<style>
.table-title {
  color: #333333;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border-right: 1px solid #d9d9d9;
  background-color: #ebebeb;
}
.table-content {
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #ebebeb;
  height: 40px;
}
.mbs {
  margin-bottom: 8px;
}
</style>
