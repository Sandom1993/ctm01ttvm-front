import alarmUtils from '@/utils/alarm';
import {numRound, formatDate} from './util';
import {toTimezoneString} from "@/components/util";

const {getAddress} = require('../monitor/maptools');

/**
 * 正常行驶轨迹点详情
 * @param info
 * @returns {Promise<html>}
 */
export function popTraceContext(info) {
    // console.log(info)
    return new Promise((resolve, reject) => {
        // const isRed = info.time > info.serverTime;
        // console.log(isRed);
        getAddress(
            [info.longitude / 360000, info.latitude / 360000],
            null,
            address => {
                resolve(`
        <div style="border:1px solid #dddddd;height:430px;box-shadow: 0 0 12px 0 #ddd;background-color: #fff;margin: 4% auto;">
            <span style="display:flex;justify-content:space-between;align-items: center;border-bottom:1px solid #ccc;font-family: MicrosoftYaHeiUI;font-size: 14px;color: rgba(0,0,0,0.90);letter-spacing: 0;line-height: 34px;height:34px;">
              <span v-empty style="display:inline-block;width:30%;text-align: center">
              ${info.vehicleLicensePlate || ''}
              </span>
              <span style="display:inline-block;width:60%;">
              ${new Date(info.time).toLocaleDateString() +
                    ' ' +
                    new Date(info.time).toTimeString().substr(0, 8)}
              </span>
              <i onclick="popDestroy()" class="h-icon-close"></i>
            </span>

            <el-tabs value="first" :fix-width="120">
                <el-tab-pane v-model="dfd" label="定位信息" name="first">
                    <ul class="control-box-center" style="display:block; padding-top:20px">
                        <li>
                            <span class="control-label">定位状态</span>
                            <span id="deviceStatus" v-empty style="width:60px">${ info.gpsStatus === 1 ? '定位' : '未定位' || '' }</span>
                            <span class="control-label">ACC信息</span>
                            <span id="m_ACC" v-empty style="width:80px">${info.acc % 2 === 0 ? 'ACC关闭' : 'ACC开启'}</span>
                        </li>
                        <li>
                            <span class="control-label">定位速度</span>
                            <span style="width:60px" v-empty>${alarmUtils.formatSpeed(info.speed) || 0}km/h</span>
                            <span class="control-label">车辆限速</span>
                            <span style="width:80px" v-empty>
                                ${info.limitSpeed || 0}km/h
                            </span>
                        </li>
                        <li>
                            <span class="control-label">搜星数</span>
                            <span id="retransFlag" v-empty style="width:60px">${ info.satellites || '' }</span>
                            <span class="control-label">里程数</span>
                            <span id="licheng" v-empty style="width:60px">${ info.mileage || '' }</span>
                        </li>
                        <li>
                            <span class="control-label">经纬度</span>
                            <span id="lotgut" v-empty>
                                ${numRound(info.longitude / 360000, 4)+ ' ' || ''}
                                ${numRound(info.latitude / 360000, 4) || ''}
                            </span>
                        </li>
                        <li>
                            <span class="control-label">所属围栏</span>
                            <span id="shapeName" v-empty>${ info.shapeName || '' }</span>
                        </li>
                        <li>
                            <span class="control-label">围栏限速值</span>
                            <span id="shapeLimitSpeed" v-empty>${ info.shapeLimitSpeed || ''}</span>
                        </li>

                        <li>
                            <span class="control-label">定位时间</span>
                            <span id="lastLocationTime" v-empty>
                                <div style="color:red" v-if="${info.time} > ${info.serverTime}">
                                    ${ formatDate(info.time) || '' }
                                </div>
<!--                                D08V36-->
                                <div v-else>
                                    ${ formatDate(info.time) || '' }
                                </div>
                            </span>
                        </li>
                        <li>
                            <span class="control-label">数据接收时间</span>
                            <span id="updateTime" v-empty>
                                ${ formatDate(info.serverTime) || '' }
                            </span>
                        </li>
                        <li>
                            <span class="control-label">定位位置</span>
                            <span v-empty
                                title="${address || ''}"
                                style="
                                  width: 200px;
                                  height:20px;
                                  white-space: nowrap;
                                  text-overflow: ellipsis;
                                  overflow: hidden;
                                  word-break: break-all;
                                  ">${address || ''}</span>
                        </li>
                    </ul>

                </el-tab-pane>
            </el-tabs>
      </div>
        `);
            }
        );
    });
}

/**
 * 报警点轨迹弹框
 * @param info
 * @returns {Promise<html(string)>}
 */
export function popAlarmContext(info) {
    return new Promise((resolve, reject) => {
        getAddress(
            [info.longitude / 360000, info.latitude / 360000],
            null,
            address => {
                resolve(`
        <div style="border:1px solid #dddddd;height:540px;box-shadow: 0 0 12px 0 #ddd;background-color: #fff;margin: 4% auto;">
                <span style="display:flex;justify-content:space-between;align-items: center;border-bottom:1px solid #ccc;font-family: MicrosoftYaHeiUI;font-size: 14px;color: rgba(0,0,0,0.90);letter-spacing: 0;line-height: 34px;height:34px;">
                  <span v-empty style="display:inline-block;width:30%;text-align: center">
                  ${info.vehicleLicensePlate || ''}
                  </span>
                  <span style="display:inline-block;width:60%;">
                  ${new Date(info.beginTime).toLocaleDateString() +
                ' ' +
                new Date(info.beginTime).toTimeString().substr(0, 8)}
                  </span>
                  <i onclick="popDestroy()" class="h-icon-close"></i>
                </span>

                <el-tabs value="first" :fix-width="120">
                    <el-tab-pane v-model="dfd" label="定位信息" name="first">
                        <ul class="control-box-center" style="display:block; padding-top:20px">
                            <li>
                                <span class="control-label">报警类型</span>
                                <span v-empty>${info.eventTypeName || ''}</span>
                            </li>
                            <li>
                                <span class="control-label">持续时间</span>
                                <span v-empty style="width:80px">${info.continueTime || ''}</span>
                                <span class="control-label">等级</span>
                                    <span v-empty style="width: 60px;">
                                       ${
                                        info.levelName === '一般'
                                            ? '一级'
                                            : info.levelName === '严重'
                                            ? '三级'
                                            : info.levelName === '较重'
                                                ? '二级'
                                                : '等级有误' || ''
                                    }</span>
                            </li>
                            <li>
                                <span class="control-label">报警时间</span>
                                <span v-empty style="width: 115px">${new Date(info.beginTime).toLocaleDateString() +
                                    ' ' +
                                    new Date(info.beginTime).toTimeString().substr(0, 8)}
                                </span>

                            </li>
                            <li>
                                <span class="control-label">定位状态</span>
                                <span id="deviceStatus" v-empty style="width:60px">${ info.gpsStatus === 1 ? '定位' : '未定位' || '' }</span>
                                <span class="control-label">ACC信息</span>
                                <span id="m_ACC" v-empty style="width:80px">${info.acc % 2 === 0 ? 'ACC关闭' : 'ACC开启'}</span>
                            </li>
                            <li>
                                <span class="control-label">定位速度</span>
                                <span style="width:60px" v-empty>${alarmUtils.formatSpeed(info.speed) || 0}km/h</span>
                                <span class="control-label">车辆限速</span>
                                <span style="width:80px" v-empty>
                                    ${info.limitSpeed || 0}km/h
                                </span>
                            </li>
                            <li>
                                <span class="control-label">搜星数</span>
                                <span id="retransFlag" v-empty style="width:60px">${ info.satellites || '' }</span>
                                <span class="control-label">里程数</span>
                                <span id="licheng" v-empty style="width:60px">${ info.mileage || '' }</span>
                            </li>
                            <li>
                                <span class="control-label">经纬度</span>
                                <span id="lotgut" v-empty>
                                    ${numRound(info.longitude / 360000, 6)  || ''}
                                    ${numRound(info.latitude / 360000, 6)  || ''}
                                </span>
                            </li>
                            <li>
                                <span class="control-label">所属围栏</span>
                                <span id="shapeName" v-empty>${ info.shapeName || '' }</span>
                            </li>
                            <li>
                                <span class="control-label">围栏限速值</span>
                                <span id="shapeLimitSpeed" v-empty>${ info.shapeLimitSpeed || ''}</span>
                            </li>

                            <li>
                                <span class="control-label">定位时间</span>
                                <span id="lastLocationTime" v-empty>
                                     ${ formatDate(info.time) || '' }
                                </span>
                            </li>
                            <li>
                                <span class="control-label">数据接收时间</span>
                                <span id="updateTime" v-empty>
                                    ${ formatDate(info.serverTime) || '' }
                                </span>
                            </li>
                            <li>
                                <span class="control-label">定位位置</span>
                                <span v-empty
                                    title="${address || ''}"
                                    style="
                                      width: 200px;
                                      height:20px;
                                      white-space: nowrap;
                                      text-overflow: ellipsis;
                                      overflow: hidden;
                                      word-break: break-all;
                                      ">${address || ''}</span>
                            </li>
                        </ul>
                    </el-tab-pane>
                </el-tabs>
          </div>
        `);
            }
        );
    });
}

export function popParkContext(info) {
    return new Promise((resolve, reject) => {
        getAddress(
            [info.longitude / 360000, info.latitude / 360000],
            null,
            address => {
                resolve(`
        <div style="height:80%;width: 90%;box-shadow: 0 0 12px 0 #ddd;background-color: #fff;margin: 4% auto;">
          <span style="display:flex;justify-content:space-between;align-items: center;border-bottom:1px solid #ccc;font-family: MicrosoftYaHeiUI;font-size: 14px;color: rgba(0,0,0,0.90);letter-spacing: 0;line-height: 34px;height:34px;">
            <span style="display:inline-block;width:30%;text-align: center">
            车辆名称
            </span>
            <span style="display:inline-block;width:60%;">
            地点
            </span>
            <i onclick="popDestroy()" class="h-icon-close"></i>
          </span>
          <div style="display:flex;height:calc(100% - 34px)">
            <div style="display:flex;flex-direction:column;justify-content:space-around;align-items:flex-end;width:30%;font-family: MicrosoftYaHeiUI;
            font-size: 14px;
            color: rgba(0,0,0,0.40);
            letter-spacing: 0;
            text-align: right;
            line-height: 20px;
            pading-right:10px;">
              <span>持续时间</span>
              <span>定位位置  </span>
            </div>
            <div style="display:flex;flex-direction:column;justify-content:space-around;align-items:flex-start;width:70%;font-family: MicrosoftYaHeiUI;
            font-size: 14px;
            color: rgba(0,0,0,0.70);
            letter-spacing: 0;
            line-height: 20px;
            padding-left:10px;">
              <span>持续时间</span>
              <span v-empty>${address || ''}</span>
            </div>
          </div>
        </div>
        `);
            }
        );
    });
}
