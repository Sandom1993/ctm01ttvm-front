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
              ref="terminalParamsForm"
              v-loading="contentLoading"
              :rules="terminalParamsRules"
              label-width="220px"
              :model="terminalParamsForm"
            >
              <el-row :gutter="8">
                <el-col :span="8">
                  <el-form-item label="车辆里程表读数(km)：" prop="128">
                    <el-input
                      v-model="terminalParamsForm[128]"
                      :disabled="handleDisabled(128)"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="车辆所在的省域ID：" prop="province">
                    <el-input
                      v-model="terminalParamsForm[129]"
                      :disabled="handleDisabled(129)"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="车辆所在的市域ID：" prop="city">
                    <el-input
                      v-model="terminalParamsForm[130]"
                      :disabled="handleDisabled(130)"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="8">
                <el-col :span="8">
                  <el-form-item
                    label="车牌号码："
                    prop="plateNo"
                    introduction="公安交通管理部门颁发的机动车号牌"
                  >
                    <el-input
                      v-model="terminalParamsForm[131]"
                      :disabled="handleDisabled(131)"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="车牌颜色：" prop="plateColor">
                    <el-select
                      v-model="terminalParamsForm[132]"
                      :disabled="handleDisabled(132)"
                      placeholder="请选择车牌颜色"
                    >
                      <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="8">
                <el-col :span="8">
                  <el-form-item
                    label="终端心跳发送间隔(s)："
                    prop="1"
                  >
                    <el-input-number
                      v-model="terminalParamsForm[1]"
                      :disabled="handleDisabled(1)"
                      :min="0"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    label="TCP消息应答超时时间(s)："
                    prop="tcpReplyExpiredTime"
                  >
                    <el-input-number
                      v-model="terminalParamsForm[2]"
                      :disabled="handleDisabled(2)"
                      :min="0"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="TCP消息重传次数：" prop="tcpResendTimes">
                    <el-input-number
                      v-model="terminalParamsForm[3]"
                      :disabled="handleDisabled(3)"
                      :min="0"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="8">
                <el-col :span="8">
                  <el-form-item
                    label="UDP消息应答超时时间(s)："
                    prop="udpReplyExpiredTime"
                  >
                    <el-input-number
                      v-model="terminalParamsForm[4]"
                      :disabled="handleDisabled(4)"
                      :min="0"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="UDP消息重传次数：" prop="udpResendTimes">
                    <el-input-number
                      v-model="terminalParamsForm[5]"
                      :disabled="handleDisabled(5)"
                      :min="0"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    label="SMS消息应答超时时间(s)："
                    prop="smsReplyExpiredTime"
                  >
                    <el-input-number
                      v-model="terminalParamsForm[6]"
                      :disabled="handleDisabled(6)"
                      :min="0"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="8">
                <el-col :span="8">
                  <el-form-item label="SMS消息重传次数：" prop="smsResendTimes">
                    <el-input-number
                      v-model="terminalParamsForm[7]"
                      :disabled="handleDisabled(7)"
                      :min="0"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="8">
                <el-col :span="8">
                  <el-form-item label="主服务器APN：" prop="mainApn">
                    <el-input v-model="terminalParamsForm[16]" :disabled="handleDisabled(16)" placeholder="" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    label="主服务器无线通信拨号用户名："
                    prop="mainUser"
                    introduction="无线通信拨号访问点。若网络制式为CDMA，则该处为PPP拨号号码"
                  >
                    <el-input v-model="terminalParamsForm[17]" :disabled="handleDisabled(17)" placeholder="" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    label="主服务器无线通信拨号密码："
                    prop="mainPwd"
                  >
                    <el-input v-model="terminalParamsForm[18]" :disabled="handleDisabled(18)" placeholder="" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="8">
                <el-col :span="8">
                  <el-form-item
                    label="主服务器地址，IP或域名："
                    prop="mainHost"
                  >
                    <el-input v-model="terminalParamsForm[19]" :disabled="handleDisabled(19)" placeholder="" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    label="备份服务器APN："
                    prop="secondApn"
                    introduction="无线通信拨号访问点"
                  >
                    <el-input v-model="terminalParamsForm[20]" :disabled="handleDisabled(20)" placeholder="" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    label="备份服务器无线通信拨号用户名："
                    prop="secondUser"
                  >
                    <el-input v-model="terminalParamsForm[21]" :disabled="handleDisabled(21)" placeholder="" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="8">
                <el-col :span="8">
                  <el-form-item
                    label="备份服务器无线通信拨号密码："
                    prop="secondPwd"
                  >
                    <el-input v-model="terminalParamsForm[22]" :disabled="handleDisabled(22)" placeholder="" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    label="备份服务器地址，IP或域名："
                    prop="secondHost"
                  >
                    <el-input v-model="terminalParamsForm[23]" :disabled="handleDisabled(23)" placeholder="" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item  label="服务器TCP端口：" prop="tcpPort">
                    <el-input v-model="terminalParamsForm[24]" :disabled="handleDisabled(24)" placeholder="" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="8">
                <el-col :span="8">
                  <el-form-item label="服务器UDP端口：" prop="udpPort">
                    <el-input v-model="terminalParamsForm[25]" :disabled="handleDisabled(25)" placeholder="" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="8">
                <el-col :span="12">
                  <el-form-item label="位置汇报策略：" prop="posStrategy">
                    <el-radio
                      v-model="terminalParamsForm[32]"
                      :disabled="handleDisabled(32)"
                      class="radio"
                      :label="0"
                    >
                      定时汇报
                    </el-radio>
                    <el-radio
                      v-model="terminalParamsForm[32]"
                      :disabled="handleDisabled(32)"
                      class="radio"
                      :label="1"
                    >
                      定距汇报
                    </el-radio>
                    <el-radio
                      v-model="terminalParamsForm[32]"
                      :disabled="handleDisabled(32)"
                      class="radio"
                      :label="2"
                    >
                      定时和定距汇报
                    </el-radio>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item
                    label="位置汇报方案："
                    prop="posScheme"
                    introduction="若为1，则先判断登录状态，若登录再根据ACC状态"
                  >
                    <el-radio
                      v-model="terminalParamsForm[33]"
                      :disabled="handleDisabled(33)"
                      class="radio"
                      :label="0"
                    >
                      根据ACC状态
                    </el-radio>
                    <el-radio
                      v-model="terminalParamsForm[33]"
                      :disabled="handleDisabled(33)"
                      class="radio"
                      :label="1"
                    >
                      根据登录状态和ACC状态
                    </el-radio>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="8">
                <el-col :span="8">
                  <el-form-item
                    label="驾驶员未登录汇报时间间隔(s)："
                    prop="intervalDriverTime"
                  >
                    <el-input-number
                      v-model="terminalParamsForm[34]"
                      :disabled="handleDisabled(34)"
                      :min="0"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    label="休眠时汇报时间间隔(s)："
                    prop="intervalSleepTime"
                  >
                    <el-input-number
                      v-model="terminalParamsForm[39]"
                      :disabled="handleDisabled(39)"
                      :min="0"
                      style="width: 100%;"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    label="紧急报警时汇报时间间隔(s)："
                    prop="intervalEmergencyTime"
                  >
                    <el-input-number
                      v-model="terminalParamsForm[40]"
                      :disabled="handleDisabled(40)"
                      :min="0"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="8">
                <el-col :span="8">
                  <el-form-item
                    label="缺省时间汇报间隔(s)："
                    prop="intervalDefaultTime"
                  >
                    <el-input-number
                      v-model="terminalParamsForm[41]"
                      :disabled="handleDisabled(41)"
                      :min="0"
                      style="width: 100%;"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    label="缺省距离汇报间隔(m)："
                    prop="intervalDefaultDist"
                  >
                    <el-input-number
                      v-model="terminalParamsForm[44]"
                      :disabled="handleDisabled(44)"
                      :min="0"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    label="驾驶员未登录汇报距离间隔(m)："
                    prop="intervalDriverDist"
                  >
                    <el-input-number
                      v-model="terminalParamsForm[45]"
                      :disabled="handleDisabled(45)"
                      :min="0"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="8">
                <el-col :span="8">
                  <el-form-item
                    label="休眠时汇报距离间隔(m)："
                    prop="intervalSleepDist"
                  >
                    <el-input-number
                      v-model="terminalParamsForm[46]"
                      :disabled="handleDisabled(46)"
                      :min="0"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    label="紧急报警时汇报距离间隔(m)："
                    prop="intervalEmergencyDist"
                  >
                    <el-input-number
                      v-model="terminalParamsForm[47]"
                      :disabled="handleDisabled(47)"
                      :min="0"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="拐点补传角度(°)：" prop="angle">
                    <el-input-number
                      v-model="terminalParamsForm[48]"
                      :disabled="handleDisabled(48)"
                      :max="180"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="8">
                <el-col :span="8">
                  <el-form-item label="监控平台电话号码：" prop="platformTel">
                    <el-input v-model="terminalParamsForm[64]" :disabled="handleDisabled(64)" placeholder="" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    label="复位电话号码"
                    prop="resetTel"
                    introduction="可采用此电话号码拨打终端电话让终端复位"
                  >
                    <el-input v-model="terminalParamsForm[65]" :disabled="handleDisabled(65)" placeholder="" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    label="恢复出厂设置电话号码："
                    prop="renewTel"
                    introduction="可采用此电话号码拨打终端电话让终端恢复出厂设置"
                  >
                    <el-input v-model="terminalParamsForm[66]" :disabled="handleDisabled(66)" placeholder="" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="8">
                <el-col :span="8">
                  <el-form-item label="监控平台SMS电话号码：" prop="smsTel">
                    <el-input v-model="terminalParamsForm[67]" :disabled="handleDisabled(67)" placeholder="" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    label="接收终端SMS文本报警号码"
                    prop="smsAlertTel"
                  >
                    <el-input v-model="terminalParamsForm[68]" :disabled="handleDisabled(68)" placeholder="" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    label="终端电话接听策略："
                    prop="terAnswerStrategy"
                    introduction="若选择ACC，则ACC ON时自动接听，OFF时手动接听"
                  >
                    <el-radio
                      v-model="terminalParamsForm[69]"
                      :disabled="handleDisabled(69)"
                      class="radio"
                      :label="0"
                    >
                      自动接听
                    </el-radio>
                    <el-radio
                      v-model="terminalParamsForm[69]"
                      :disabled="handleDisabled(69)"
                      class="radio"
                      :label="1"
                    >
                      ACC
                    </el-radio>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="8">
                <el-col :span="8">
                  <el-form-item
                    label="每次最长通话时间(s)："
                    prop="maxConversationTime"
                    introduction="0为不允许通话，0xFFFFFFFF为不限制"
                  >
                    <el-input-number
                      v-model="terminalParamsForm[70]"
                      :disabled="handleDisabled(70)"
                      style="width: 100%"
                      :min="0"
                      :max="4294967295"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    label="当月最长通话时间(s)"
                    prop="monthMaxConversationTime"
                    introduction="0为不允许通话，0xFFFFFFFF为不限制"
                  >
                    <el-input-number
                      v-model="terminalParamsForm[71]"
                      :disabled="handleDisabled(71)"
                      :min="0"
                      :max="4294967295"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="监听电话号码：" prop="monitorTel">
                    <el-input v-model="terminalParamsForm[72]" :disabled="handleDisabled(72)" placeholder="" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="8">
                <el-col :span="8">
                  <el-form-item
                    label="监管平台特权短信号码："
                    prop="platformPermissionTel"
                  >
                    <el-input v-model="terminalParamsForm[73]" :disabled="handleDisabled(73)" placeholder="" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="8">
                <el-col :span="8">
                  <el-form-item
                    label="报警屏蔽开关"
                    prop="alertMaskWord"
                    introduction="与位置信息汇报消息中的报警标志相对应，相应位为1则相应报警被屏蔽"
                  >
                    <el-input-number
                      v-model="terminalParamsForm[80]"
                      :disabled="handleDisabled(80)"
                      :min="0"
                      :max="4294967295"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    label="报警发送文本SMS开关："
                    prop="alertTextSms"
                    introduction="与位置信息汇报消息中的报警标志相对应，相应位为1则相应报警时发送文本SMS"
                  >
                    <el-input-number
                      v-model="terminalParamsForm[81]"
                      :disabled="handleDisabled(81)"
                      :min="0"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    label="报警拍摄开关："
                    prop="alertPhotoSwitch"
                    introduction="与位置信息汇报消息中的报警标志相对应，相应位为1则相应报警时摄像头拍摄"
                  >
                    <el-input-number
                      v-model="terminalParamsForm[82]"
                      :disabled="handleDisabled(82)"
                      :min="0"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="8">
                <el-col :span="8">
                  <el-form-item
                    label="报警拍摄存储开关"
                    prop="alertPhotoSaveFlag"
                    introduction="与位置信息汇报消息中的报警标志相对应，相应位为1则对相应报警时牌的照片进行存储，否则实时长传"
                  >
                    <el-input-number
                      v-model="terminalParamsForm[83]"
                      :disabled="handleDisabled(83)"
                      :min="0"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    label="关键标志开关："
                    prop="keyFlag"
                    introduction="与位置信息汇报消息中的报警标志相对应，相应位为1则对相应报警为关键报警"
                  >
                    <el-input-number
                      v-model="terminalParamsForm[84]"
                      :disabled="handleDisabled(84)"
                      :min="0"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="8">
                <el-col :span="8">
                  <el-form-item label="最高速度(km/h)：" prop="maxSpeed">
                    <el-input-number
                      v-model="terminalParamsForm[85]"
                      :disabled="handleDisabled(85)"
                      :min="0"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="超速持续时间(s)" prop="overSpeedTime">
                    <el-input-number
                      v-model="terminalParamsForm[86]"
                      :disabled="handleDisabled(86)"
                      :min="0"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item
                    label="连续驾驶时间门限(s)："
                    prop="continuousDrivingTime"
                  >
                    <el-input-number
                      v-model="terminalParamsForm[87]"
                      :disabled="handleDisabled(87)"
                      :min="0"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="8">
                <el-col :span="8">
                  <el-form-item
                    label="当天累计驾驶时间门限(s)："
                    prop="accumulateDrivingTime"
                  >
                    <el-input-number
                      v-model="terminalParamsForm[88]"
                      :disabled="handleDisabled(88)"
                      :min="0"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="最小休息时间(s)" prop="minSleepTime">
                    <el-input-number
                      v-model="terminalParamsForm[89]"
                      :disabled="handleDisabled(89)"
                      :min="0"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="最长停车时间(s)：" prop="maxParkTime">
                    <el-input-number
                      v-model="terminalParamsForm[90]"
                      :disabled="handleDisabled(90)"
                      :min="0"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="8">
                <el-col :span="8">
                  <el-form-item
                    label="图像/视频质量："
                    prop="videoQuality"
                    introduction="1-10,1最好"
                  >
                    <el-input-number
                      v-model="terminalParamsForm[112]"
                      :disabled="handleDisabled(112)"
                      :min="0"
                      :max="10"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="亮度(0-255)" prop="brightness">
                    <el-input-number
                      v-model="terminalParamsForm[113]"
                      :disabled="handleDisabled(113)"
                      :min="0"
                      :max="255"
                      style="width: 100%"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="对比度(0-127)：" prop="contrastRate">
                    <el-input-number
                      v-model="terminalParamsForm[114]"
                      :disabled="handleDisabled(114)"
                      :min="0"
                      :max="127"
                      style="width: 100%;"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="8">
                <el-col :span="8">
                  <el-form-item label="饱和度(0-127)：" prop="saturation">
                    <el-input-number
                      v-model="terminalParamsForm[115]"
                      :disabled="handleDisabled(115)"
                      :min="0"
                      :max="127"
                      style="width: 100%;"
                      placeholder=""
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="色度(0-255)" prop="chroma">
                    <el-input-number
                      v-model="terminalParamsForm[116]"
                      :disabled="handleDisabled(116)"
                      :min="0"
                      :max="255"
                      style="width: 100%;"
                      placeholder=""
                    />
                  </el-form-item>
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
            :disabled="!isOnline"
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
import { getVehicleDetail, terminalAbility } from '@/api/location';

export default {
  // 终端参数设置
  name: 'TerminalParam',
  components: {
    VehicleTree
  },
  data() {
    return {
      param: {},
      formDisabled: false,
      isOnline: false,
      contentLoading: false,
      tempForm: {},
      terminalParamsForm: {
        '132': ''
      },
      terminalParamsRules: {},
      selectedNodes: [],
      deviceIndexCode: null,
      deviceIndexCodes: [],
      terminalIds: [],
      options: [
        { value: 1, label: '蓝色' },
        { value: 2, label: '黄色' },
        { value: 3, label: '黑色' },
        { value: 4, label: '白色' },
        // { value: 5, label: '绿色' },
        { value: 9, label: '其他' }
      ]
    };
  },
  methods: {
    handleDisabled(num) {
      return !this.terminalIds.includes(num);
    },
    //  保存设置操作
    handleSaveSetting() {
      const arr = [];
      // console.log(this.terminalParamsForm)
      // console.log(this.tempForm)
      Object.keys(this.terminalParamsForm).forEach(item => {
        if (this.tempForm[item] !== this.terminalParamsForm[item]) {
          const obj = {
            paramId: Number(item),
            paramValue: this.terminalParamsForm[item]
          };
          arr.push(obj);
        }
      });
      if (this.selectedNodes.length === 0) {
        this.$msgbox({
          title: '提示',
          type: 'warning',
          message: '请先选择车辆'
        });
      } else {
        const param = {
          method: 'SetRemoteConfigParameters',
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
            this.contentLoading = true;
            this.handleSearch();
          }
        });
      }
    },
    //  重置表格校验规则
    resetValidates(formName) {
      this.$refs[formName].resetValidates();
    },
    //  重置表格
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    switchDevice(data) {
      this.selectedNodes = data;
      this.isOnline = data[0].online === 1;
      // this.formDisabled = true;
      this.terminalIds = [];
      this.$forceUpdate();
      this.terminalParamsForm = {
        '132': ''
      };
      // this.resetForm('terminalParamsForm');
    },
    handleSearch() {
      const param = {
        method: 'QueryRemoteConfigParameters',
        params: {
          indexCode: this.param.indexCode,
          plateNo: this.param.plateNo,
          plateColor: this.param.plateColor,
          simNumber: this.param.simNumber
        }
      };
      terminalAbility(param).then(res => {
        if (res.code === '0') {
          const obj = {};
          const data = res.data.data;
          const arr = data.params;
          arr.forEach(item => {
            obj[item.id] = item.value;
            this.terminalIds.push(item.id)
          });
          this.$forceUpdate();
          // this.formDisabled = false;
          this.terminalParamsForm = obj;
          this.tempForm = JSON.parse(JSON.stringify(obj));
          this.contentLoading = false;
        } else {
          this.contentLoading = false;
        }
      }).catch(() => {
        this.contentLoading = false;
      });
    },
    handleSearchSetting() {
      this.contentLoading = true;
      const data = [...this.selectedNodes];
      getVehicleDetail({ vehicleIndexCode: data[0].indexCode }).then(res => {
        if (res.code === '0') {
          this.param = {
            indexCode: data[0].deviceIndexCode,
            plateNo: data[0].name,
            plateColor: res.data.vehicleLicenseColor,
            simNumber: res.data.simNo === null ? undefined : res.data.simNo
            // paramIds: this.terminalIds
          };
          this.handleSearch();
        } else {
          this.contentLoading = false;
        }
      }).catch(() => {
        this.contentLoading = false;
      });
    }
  }
};
</script>

<style src="@/pages/statistics/statistics.scss" lang="scss"></style>
<style lang="scss" scoped>
::v-deep {
  .el-input.is-disabled .el-input__inner {
    /*color: #333333;*/
  }
}
.right-box {
  height: 100%;
  .form-box {
    height: 100%;
    padding: 20px 10px;
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
