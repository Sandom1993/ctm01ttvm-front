<template>
  <div class="detail-config-wrap">
    <div class="breadcrumb-wrap">
      <el-button
        type="iconButton"
        icon="h-icon-arrow_left"
        @click="goBack()"></el-button>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item
          v-for="item in headPath"
          :key="item">{{ item }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="detail-config-main">
      <el-scrollbar wrap-style="height:100%;overflow-x:hidden;">
        <div
          id="linkageconfig"
          ref="linkageconfig"
          class="set-linkage box">
          <div class="head">基础信息</div>
          <div class="message-linkage">
            <form
              name="form0"
              ref="form0"
              enctype="multipart/form-data"
              v-if="type === 1">
              <input
                style="display:none"
                type="text"
                name="companyName"
                v-model="form.companyName" />
              <input
                style="display:none"
                type="text"
                name="phoneNumber"
                v-model="form.phoneNumber" />
              <!-- <input style="display:none" type="text" name="ctime" v-model="form.ctime"> -->
              <input
                style="display:none"
                type="text"
                name="licenseWord"
                v-model="form.licenseWord" />
              <input
                style="display:none"
                type="text"
                name="licenseNumber"
                v-model="form.licenseNumber"
              />
              <input
                style="display:none"
                type="text"
                name="operationManager"
                v-model="form.operationManager"
              />
              <input
                style="display:none"
                type="text"
                name="legalRepresentative"
                v-model="form.legalRepresentative"
              />
              <input
                style="display:none"
                type="text"
                name="ownerQualification"
                v-model="form.ownerQualification"
              />
              <input
                style="display:none"
                type="text"
                name="organizingInstitution"
                v-model="form.organizingInstitution"
              />
              <input
                style="display:none"
                type="text"
                name="businessType"
                v-model="form.businessType"
              />
              <input
                style="display:none"
                type="text"
                name="registeredFund"
                v-model="form.registeredFund"
              />
              <input
                style="display:none"
                type="text"
                name="businessScope"
                v-model="form.businessScope"
              />
              <input
                style="display:none"
                type="text"
                name="validateStart"
                v-model="form.validateStart"
              />
              <input
                style="display:none"
                type="text"
                name="validateEnd"
                v-model="form.validateEnd" />
              <input
                style="display:none"
                type="text"
                name="issuingAuthority"
                v-model="form.issuingAuthority"
              />
              <input
                style="display:none"
                type="text"
                name="issueDate"
                v-model="form.issueDate" />
              <input
                style="display:none"
                type="text"
                name="vehicleNum"
                v-model="form.vehicleNum" />
              <input
                style="display:none"
                type="text"
                name="operationState"
                v-model="form.operationState"
              />
              <input
                style="display:none"
                type="text"
                name="testLevel"
                v-model="form.testLevel" />
              <input
                style="display:none"
                type="text"
                name="remark"
                v-model="form.remark" />
              <input
                style="display:none"
                type="text"
                name="photoType"
                v-model="form.photoType" />
              <input
                style="display:none"
                type="text"
                name="ownerAddress"
                v-model="form.ownerAddress"
              />
              <input
                style="display:none"
                type="text"
                name="orgIndexCode"
                v-model="orgIndexCode" />
              <input
                style="display:none"
                type="text"
                name="administrativeRegion"
                v-model="form.administrativeRegion"
              />
              <input
                style="display:none"
                type="file"
                name="filePhoto"
                id="filePhoto"
                ref="filePhoto0"
                @change="getPic(0)"
              />
              <el-form
                v-if="type===1"
                :rules="rules_V"
                message-position="right"
                ref="form"
                :model="form"
                label-width="120px"
                content-width="360px"
              >
                <el-form-item
                  label="图片"
                  prop="url"
                  class="form-line">
                  <label
                    class="el-upload__label"
                    @click="changeSrc(0)"
                    v-show="!imgSrc">
                    <i class="h-icon-plus"></i>
                  </label>
                  <img
                    :src="imgSrc"
                    class="imgSrc"
                    @click="changeSrc(0)"
                    v-show="imgSrc"
                    name="filePhoto"
                  />
                  <span class="avatar-uploader-text">最大尺寸：800*800，格式：jpg，jpeg</span>
                </el-form-item>
                <el-form-item
                  prop="companyName"
                  label="企业名称"
                  class="form-line">
                  <el-input
                    :maxlength="64"
                    v-model="form.companyName"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="phoneNumber"
                  label="电话号码"
                  class="form-line">
                  <el-input
                    v-model="form.phoneNumber"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="licenseWord"
                  label="经营许可证字"
                  class="form-line">
                  <el-input
                    :maxlength="32"
                    v-model="form.licenseWord"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="licenseNumber"
                  label="经营许可证号"
                  class="form-line">
                  <el-input
                    :maxlength="32"
                    v-model="form.licenseNumber"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="operationManager"
                  label="经营负责人"
                  class="form-line">
                  <el-input
                    :maxlength="10"
                    v-model="form.operationManager"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="legalRepresentative"
                  label="法人代表"
                  class="form-line">
                  <el-input
                    :maxlength="32"
                    v-model="form.legalRepresentative"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="ownerQualification"
                  label="业户资质"
                  class="form-line">
                  <el-input
                    :maxlength="32"
                    v-model="form.ownerQualification"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="ownerAddress"
                  label="业户地址"
                  class="form-line">
                  <el-input
                    :maxlength="64"
                    v-model="form.ownerAddress"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="organizingInstitution"
                  label="组织机构名称"
                  class="form-line">
                  <el-input
                    :maxlength="32"
                    v-model="form.organizingInstitution"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="businessType"
                  label="经济类型"
                  class="form-line">
                  <el-input
                    :maxlength="32"
                    v-model="form.businessType"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="registeredFund"
                  label="注册资金"
                  class="form-line">
                  <el-input
                    v-model="form.registeredFund"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="businessScope"
                  label="经营范围"
                  class="form-line">
                  <el-input
                    :maxlength="64"
                    v-model="form.businessScope"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="validateStart"
                  label="有效期起"
                  class="form-line">
                  <el-date-picker
                    class="dateWidth"
                    v-model="form.validateStart"
                    type="date"
                    placeholder="选择日期"
                  ></el-date-picker>
                </el-form-item>
                <el-form-item
                  prop="validateEnd"
                  label="有效期止"
                  class="form-line">
                  <el-date-picker
                    class="dateWidth"
                    v-model="form.validateEnd"
                    type="date"
                    placeholder="选择日期"
                  ></el-date-picker>
                </el-form-item>
                <el-form-item
                  prop="issuingAuthority"
                  label="发证机关"
                  class="form-line">
                  <el-input
                    :maxlength="32"
                    v-model="form.issuingAuthority"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="issueDate"
                  label="核发日期"
                  class="form-line">
                  <el-date-picker
                    class="dateWidth"
                    v-model="form.issueDate"
                    type="date"
                    placeholder="选择日期"
                    :picker-options="pickerOptions0"
                  ></el-date-picker>
                </el-form-item>
                <el-form-item
                  prop="vehicleNum"
                  label="拥有车辆数"
                  class="form-line">
                  <el-input
                    v-model="form.vehicleNum"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="operationState"
                  label="经营状态"
                  class="form-line">
                  <el-input
                    :maxlength="32"
                    v-model="form.operationState"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="testLevel"
                  label="质量信誉等级"
                  class="form-line">
                  <el-input
                    :maxlength="32"
                    v-model="form.testLevel"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="remark"
                  label="备注"
                  class="form-line">
                  <el-input
                    :maxlength="64"
                    v-model="form.remark"
                    placeholder></el-input>
                </el-form-item>
              </el-form>
            </form>
            <form
              name="form1"
              ref="form1"
              enctype="multipart/form-data"
              v-if="type === 2">
              <input
                style="display:none"
                type="text"
                name="companyName"
                v-model="editForm.companyName"
              />
              <input
                style="display:none"
                type="text"
                name="phoneNumber"
                v-model="editForm.phoneNumber"
              />
              <!-- <input style="display:none" type="text" name="ctime" v-model="form.ctime"> -->
              <input
                style="display:none"
                type="text"
                name="licenseWord"
                v-model="editForm.licenseWord"
              />
              <input
                style="display:none"
                type="text"
                name="licenseNumber"
                v-model="editForm.licenseNumber"
              />
              <input
                style="display:none"
                type="text"
                name="operationManager"
                v-model="editForm.operationManager"
              />
              <input
                style="display:none"
                type="text"
                name="legalRepresentative"
                v-model="editForm.legalRepresentative"
              />
              <input
                style="display:none"
                type="text"
                name="ownerQualification"
                v-model="editForm.ownerQualification"
              />
              <input
                style="display:none"
                type="text"
                name="organizingInstitution"
                v-model="editForm.organizingInstitution"
              />
              <input
                style="display:none"
                type="text"
                name="businessType"
                v-model="editForm.businessType"
              />
              <input
                style="display:none"
                type="text"
                name="registeredFund"
                v-model="editForm.registeredFund"
              />
              <input
                style="display:none"
                type="text"
                name="businessScope"
                v-model="editForm.businessScope"
              />
              <input
                style="display:none"
                type="text"
                name="validateStart"
                v-model="editForm.validateStart"
              />
              <input
                style="display:none"
                type="text"
                name="validateEnd"
                v-model="editForm.validateEnd"
              />
              <input
                style="display:none"
                type="text"
                name="issuingAuthority"
                v-model="editForm.issuingAuthority"
              />
              <input
                style="display:none"
                type="text"
                name="issueDate"
                v-model="editForm.issueDate" />
              <input
                style="display:none"
                type="text"
                name="vehicleNum"
                v-model="editForm.vehicleNum"
              />
              <input
                style="display:none"
                type="text"
                name="operationState"
                v-model="editForm.operationState"
              />
              <input
                style="display:none"
                type="text"
                name="testLevel"
                v-model="editForm.testLevel" />
              <input
                style="display:none"
                type="text"
                name="remark"
                v-model="editForm.remark" />
              <input
                style="display:none"
                type="text"
                name="photoType"
                v-model="editForm.photoType" />
              <input
                style="display:none"
                type="text"
                name="ownerAddress"
                v-model="editForm.ownerAddress"
              />
              <input
                style="display:none"
                type="text"
                name="orgIndexCode"
                v-model="orgIndexCode" />
              <input
                style="display:none"
                type="text"
                name="administrativeRegion"
                v-model="editForm.administrativeRegion"
              />
              <input
                style="display:none"
                type="text"
                name="indexCode"
                v-model="editForm.indexCode" />
              <input
                style="display:none"
                type="file"
                name="filePhoto"
                id="filePhoto"
                ref="filePhoto1"
                @change="getPic(1)"
              />
              <el-form
                v-if="type===2"
                :rules="rules_V"
                message-position="right"
                ref="editForm"
                :model="editForm"
                label-width="120px"
                content-width="360px"
              >
                <el-form-item
                  label="图片"
                  prop="url"
                  class="form-line">
                  <div class="img-box">
                    <label
                      for="__x_upload_form__1550564040383425"
                      class="el-upload__label"
                      @click="changeSrc(0)"
                      v-show="!imgSrc"
                    >
                      <i class="h-icon-plus"></i>
                    </label>
                    <img
                      :src="imgSrc"
                      alt
                      @error="setdefaultImg"
                      class="imgSrc"
                      @click="changeSrc(0)"
                      v-show="imgSrc"
                    />
                    <div
                      class="noImg"
                      v-show="imgSrc"></div>
                  </div>
                  <span class="avatar-uploader-text">最大尺寸：800*800，格式：jpg，jpeg</span>
                </el-form-item>
                <el-form-item
                  prop="companyName"
                  label="企业名称"
                  class="form-line">
                  <el-input
                    :maxlength="64"
                    v-model="editForm.companyName"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="phoneNumber"
                  label="电话号码"
                  class="form-line">
                  <el-input
                    v-model="editForm.phoneNumber"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="licenseWord"
                  label="经营许可证字"
                  class="form-line">
                  <el-input
                    :maxlength="32"
                    v-model="editForm.licenseWord"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="licenseNumber"
                  label="经营许可证号"
                  class="form-line">
                  <el-input
                    :maxlength="32"
                    v-model="editForm.licenseNumber"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="operationManager"
                  label="经营负责人"
                  class="form-line">
                  <el-input
                    :maxlength="10"
                    v-model="editForm.operationManager"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="legalRepresentative"
                  label="法人代表"
                  class="form-line">
                  <el-input
                    :maxlength="32"
                    v-model="editForm.legalRepresentative"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="ownerQualification"
                  label="业户资质"
                  class="form-line">
                  <el-input
                    :maxlength="32"
                    v-model="editForm.ownerQualification"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="ownerAddress"
                  label="业户地址"
                  class="form-line">
                  <el-input
                    :maxlength="64"
                    v-model="editForm.ownerAddress"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="organizingInstitution"
                  label="组织机构名称"
                  class="form-line">
                  <el-input
                    :maxlength="32"
                    v-model="editForm.organizingInstitution"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="businessType"
                  label="经济类型"
                  class="form-line">
                  <el-input
                    :maxlength="32"
                    v-model="editForm.businessType"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="registeredFund"
                  label="注册资金"
                  class="form-line">
                  <el-input
                    v-model="editForm.registeredFund"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="businessScope"
                  label="经营范围"
                  class="form-line">
                  <el-input
                    :maxlength="64"
                    v-model="editForm.businessScope"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="validateStart"
                  label="有效期起"
                  class="form-line">
                  <el-date-picker
                    class="dateWidth"
                    v-model="editForm.validateStart"
                    type="date"
                    placeholder="选择日期"
                  ></el-date-picker>
                </el-form-item>
                <el-form-item
                  prop="validateEnd"
                  label="有效期止"
                  class="form-line">
                  <el-date-picker
                    class="dateWidth"
                    v-model="editForm.validateEnd"
                    type="date"
                    placeholder="选择日期"
                  ></el-date-picker>
                </el-form-item>
                <el-form-item
                  prop="issuingAuthority"
                  label="发证机关"
                  class="form-line">
                  <el-input
                    :maxlength="32"
                    v-model="editForm.issuingAuthority"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="issueDate"
                  label="核发日期"
                  class="form-line">
                  <el-date-picker
                    class="dateWidth"
                    v-model="editForm.issueDate"
                    type="date"
                    placeholder="选择日期"
                    :picker-options="pickerOptions0"
                  ></el-date-picker>
                </el-form-item>
                <el-form-item
                  prop="vehicleNum"
                  label="拥有车辆数"
                  class="form-line">
                  <el-input
                    v-model="editForm.vehicleNum"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="operationState"
                  label="经营状态"
                  class="form-line">
                  <el-input
                    :maxlength="32"
                    v-model="editForm.operationState"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="testLevel"
                  label="质量信誉等级"
                  class="form-line">
                  <el-input
                    :maxlength="32"
                    v-model="editForm.testLevel"
                    placeholder></el-input>
                </el-form-item>
                <el-form-item
                  prop="remark"
                  label="备注"
                  class="form-line">
                  <el-input
                    :maxlength="64"
                    v-model="editForm.remark"
                    placeholder></el-input>
                </el-form-item>
              </el-form>
            </form>
          </div>
        </div>
        <!-- <div
          id="selectdevice"
          class="select-device mt8 box">
          <div class="head">
            关联车辆
          </div>
          <div class="select-device-body">
            <el-alert
              title="勾选需要配置的车辆,可多选"
              type="info"
              simple
              show-icon>
            </el-alert>
            <transfer
              ref="transfer"
              :table-head="[{'id':1,'prop': 'vehicleLicensePlate','label':'车牌号','treeProp': 'name'}]"
              :tree-checked-data="deviceTreeCheckedId"
              tree-type="4"
              :init-table-data="deviceTableData"
              @sendTableData="getDevices">
            </transfer>
          </div>
        </div>-->
      </el-scrollbar>
    </div>
    <div class="save">
      <el-button
        type="primary"
        style="width: 96px;"
        :loading="buttonLoading"
        @click="saveCompanyConfig()"
      >保存</el-button>
      <el-button
        style="width: 96px;"
        @click="goBack()">取消</el-button>
    </div>
  </div>
</template>
<script>
  import api from '../../api/companyManger.js';
  import { RULE_SPECIALPARAMS, RULE_PHONE2 } from '../../api/dic.js';
  import {
    toTimezoneString
  } from '../../components/util.js';
  export default {
    name: 'CompanyAdd',
    props: {
      type: {
        type: [String, Number],
        require: false,
        default: '1' // 1-添加 2-修改
      },
      isShowAdd: {
        type: Boolean,
        require: false
      },
      orgIndexCode: {
        type: String,
        default: () => ''
      }
    },
    data() {
      // 数字验证
      /* eslint-disable */
      let validateNumber = (rule, value, callback) => {
        if (isNaN(value)) {
          callback(new Error(this.$t('请输入数字')));
        } else {
          callback();
        }
      };
      return {
        rules_V: {
          companyName: [
            RULE_SPECIALPARAMS,
            { required: true, message: '不可为空', trigger: 'blur' }
          ],
          legalRepresentative: [
            RULE_SPECIALPARAMS,
            { required: true, message: '不可为空', trigger: 'blur' }
          ],
          operationManager: [
            RULE_SPECIALPARAMS,
            { required: true, message: '不可为空', trigger: 'blur' }
          ],
          ownerAddress: [
            RULE_SPECIALPARAMS,
            { required: true, message: '不可为空', trigger: 'blur' }
          ],
          phoneNumber: [
            RULE_PHONE2,
            { required: true, message: '不可为空', trigger: 'blur' }
          ],
          registeredFund: [{ validator: validateNumber, trigger: 'blur' }]
        },
        deviceList: [], // 被选中的设备列表
        iSrc: null, // 图片
        imgflag: null,
        form: {
          administrativeRegion: '', // 企业所在行政区划代码
          businessScope: '', // 经营范围
          businessType: '', // 经济类型
          companyName: '', // 企业名称
          // ctime: "", //创建时间
          indexCode: '', // 企业唯一标识
          issueDate: new Date(), // 核发日期
          issuingAuthority: '', // 发证机关
          legalRepresentative: '', // 法人代表
          licenseNumber: '', // 经营许可证号
          licenseWord: '', // 经营许可证字
          // mtime: "", //更新时间
          operationManager: '', // 经营负责人
          operationState: '', // 经营状态
          // orgIndexCode: this.orgIndexCode, //所属组织编号
          organizingInstitution: '', // 企业组织机构
          ownerAddress: '', // 业户地址
          ownerQualification: '', // 业户资质
          phoneNumber: '', // 电话号码
          photo: '', // 图片数据
          photoExtension: '', // jpg，png
          photoType: 1, // 1：企业经营许可证图片
          registeredFund: '', // 注册资金
          remark: '', // 备注
          reserve1: '', // 预留1
          reserve2: '', // 预留2
          reserve3: '', // 预留3
          testLevel: '', // 质量信誉等级
          validateEnd: new Date(), // 有效期止
          validateStart: new Date(), // 有效期起
          vehicleNum: '' // 拥有车辆数
        },
        editForm: {
          // indexCode: '',
          // companyName: '',
          // organizingInstitution: '',
          // legalRepresentative: '',
          // operationManager: '',
          // operatorAddress: '',
          // phoneNumber: '',
          // vehicleIndexCodes: []
          administrativeRegion: '', // 企业所在行政区划代码
          businessScope: '', // 经营范围
          businessType: '', // 经营类型
          companyName: '', // 企业名称
          // ctime: "", //创建时间
          indexCode: '', // 企业唯一标识
          issueDate: new Date(), // 核发日期
          issuingAuthority: '', // 发证机关
          legalRepresentative: '', // 法人代表
          licenseNumber: '', // 经营许可证号
          licenseWord: '', // 经营许可证字
          // mtime: "", //更新时间
          operationManager: '', // 经营负责人
          operationState: '', // 经营状态
          orgIndexCode: '', // 所属组织编号
          organizingInstitution: '', // 企业组织机构
          ownerAddress: '', // 业户地址
          ownerQualification: '', // 业户资质
          phoneNumber: '', // 电话号码
          photo: '', // 图片数据
          photoExtension: '', // jpg，png
          photoType: 1, // 1：企业经营许可证图片
          registeredFund: '', // 注册资金
          remark: '', // 备注
          reserve1: '', // 预留1
          reserve2: '', // 预留2
          reserve3: '', // 预留3
          testLevel: '', // 质量信誉等级
          validateEnd: new Date(), // 有效期止
          validateStart: new Date(), // 有效期起
          vehicleNum: '' // 拥有车辆数
        },
        deviceTreeCheckedId: [], // 编辑时设备id的初始列表
        deviceTableData: [], // 编辑时设备表格数据的初始列表
        scrollY: 0,
        buttonLoading: false,
        // issueDate:'',
        pickerOptions0: {
          disabledDate(time) {
            return time.getTime() > Date.now();
          }
        }
      };
    },
    computed: {
      headPath() {
        let path = localStorage.portal_config_crumbs
          ? localStorage.portal_config_crumbs
          : '';
        path = this.type === 1 ? '添加' : '修改';
        return path.split('/');
      },
      imgSrc () {
        if (this.iSrc) {
          this.imgflag = false;
          return this.iSrc;
        }
        if (this.editForm.indexCode) {
          return ('company/findImgByCompanyIndexCode.do?width=104&height=104&companyIndexCode=' + this.editForm.indexCode + '&photoType=1');
        }
      }
    },
    // created () {
    //   this.$nextTick(() => {
    //     this.$refs.linkageconfig.parentElement.parentElement.addEventListener('scroll', (e) => {
    //       this.scrollY = Math.abs(Math.round(e.target.scrollTop)) + 16;
    //     });
    //   });
    // },
    methods: {
      goBack() {
        this.$parent.isShowAdd = false;
        this.imgflag = false;
        this.iSrc = null;
        this.form.indexCode = '';
        this.editForm.indexCode = '';
        // this.form.issueDate = toTimezoneString(new Date());
        // this.form.validateEnd = toTimezoneString(new Date());
        // this.form.validateStart = toTimezoneString(new Date());
        // this.editForm.issueDate = toTimezoneString(new Date());
        // this.editForm.validateEnd = toTimezoneString(new Date());
        // this.editForm.validateStart = toTimezoneString(new Date());
        this.deviceList = [];
        this.deviceTableData = [];
        this.$parent.tableSearch();
        if (this.$refs.form) {
          this.$refs.form.resetFields();
        }
      },
      getDevices(tableData) {
        this.deviceList = tableData;
      },
      setdefaultImg() {
        this.imgflag = true;
      },
      changeSrc(val) {
        if (this.type === 1) {
          if (val === 0) {
            this.$refs.filePhoto0.click();
          }
        } else {
          if (val === 0) {
            this.$refs.filePhoto1.click();
          }
        }
      },
      getObjectURL(file) {
        var url = null;
        if (window.createObjectURL !== undefined) {
          url = window.createObjectURL(file);
        } else if (window.URL !== undefined) {
          // mozilla(firefox)
          url = window.URL.createObjectURL(file);
        } else if (window.webkitURL !== undefined) {
          // webkit or chrome
          url = window.webkitURL.createObjectURL(file);
        }
        return url;
      },
      getPic(that) {
        var file;
        if (this.type === 1) {
          // if(flag === 0){
          file = this.$refs.filePhoto0.files[0];
          // }
        } else {
          // if(flag === 0){
          file = this.$refs.filePhoto1.files[0];
          // }
        }

        var objUrl = this.getObjectURL(file);
        var AllImgExt = '.jpg、.jpeg';
        var extName = file.name
          .substring(file.name.lastIndexOf('.'))
          .toLowerCase(); // （把路径中的所有字母全部转换为小写）
        if (AllImgExt.indexOf(extName + '|') === -1) {
          let ErrMsg =
            '该文件类型不允许上传。请上传 ' +
            AllImgExt +
            ' 类型的文件，当前文件类型为' +
            extName;
          this.$message({
            type: 'error',
            message: ErrMsg
          });
          this.sizeRight = false;
          return false;
        }
        if (file.size > 1024 * 1024) {
          this.$message({
            type: 'error',
            message: '请选择小于1M的文件'
          });
          this.sizeRight = false;
          return false;
        }
        if (objUrl) {
          // if(flag === 0){
          this.iSrc = objUrl;
          // }
        }
        this.sizeRight = true;
      },
      changeDate(value) {
        // this.editForm.issueDate=value;
        // let time= this.editForm.issueDate;
        // this.editForm.issueDate = moment(time).format("YYYY-MM-DD");
        // var t = Date.parse(this.editForm.issueDate)
        // if (!isNaN(t)) {
        //   return new Date(Date.parse(this.editForm.issueDate.replace(/-/g, '/')))
        // }
        // this.editForm.issueDate = moment(this.editForm.issueDate, 'YYYY-MM-DD HH:mm:ss').valueOf();
        // console.log( this.editForm.issueDate)
      },
      saveCompanyConfig() {
        let param;
        let _this = this;
        // this.buttonLoading = true;
        if (_this.type === 1) {
          _this.$refs.form.validate((valid, invalidFields) => {
            if (valid) {
              _this.form.issueDate = toTimezoneString(_this.form.issueDate);
              _this.form.validateEnd = toTimezoneString(_this.form.validateEnd);
              _this.form.validateStart = toTimezoneString(
                _this.form.validateStart
              );
              setTimeout(function() {
                param = new FormData(_this.$refs.form0);
                api.addCompany(param)
                  .then(res => {
                    if (res.msg === 'SUCCESS') {
                      _this.$message({
                        type: 'success',
                        message: '添加成功'
                      });
                      _this.goBack();
                      _this.buttonLoading = false;
                    } else {
                      _this.$message({
                        type: 'success',
                        message: '添加失败'
                      });
                    }
                  })
                  .catch(res => {
                    _this.buttonLoading = false;
                    _this.$message({
                      type: 'error',
                      message: res.response.data.msg
                    });
                  });
              }, 10);
            }
          });
        } else {
          _this.$refs.editForm.validate((valid, invalidFields) => {
            if (valid) {
              _this.editForm.issueDate = toTimezoneString(
                _this.editForm.issueDate
              );
              _this.editForm.validateEnd = toTimezoneString(
                _this.editForm.validateEnd
              );
              _this.editForm.validateStart = toTimezoneString(
                _this.editForm.validateStart
              );
              setTimeout(function() {
                param = new FormData(_this.$refs.form1);
                api.updateCompany(param)
                  .then(res => {
                    _this.$message({
                      type: 'success',
                      message: '修改成功'
                    });
                    _this.goBack();
                    _this.buttonLoading = false;
                  })
                  .catch(res => {
                    _this.buttonLoading = false;
                    _this.$message({
                      type: 'error',
                      message: '修改失败'
                    });
                  });
              }, 10);
            }
          });
        }
      }
    }
  };
</script>
<style scoped>
  .detail-config-wrap {
    position: absolute;
    top: 48px;
    left: 0;
    bottom: 48px;
    right: 0;
    background-color: #f5f5f5;
    overflow: hidden;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .breadcrumb-wrap {
    position: fixed;
    top: 0;
    width: 100%;
    height: 48px;
    box-shadow: 0 0.01rem 0.06rem rgba(0, 0, 0, 0.15);
    background-color: #fff;
    line-height: 48px;
    z-index: 1000;
  }
  .breadcrumb-wrap > * {
    vertical-align: middle;
  }
  .imgSrc {
    display: block;
    width: 104px;
    height: 104px;
    line-height: 104px;
    text-align: center;
    /* border: 1px dashed #aaa; */
    border-radius: 4px;
    cursor: pointer;
    position: relative;
    margin-right: 8px;
    z-index: 2;
  }
  .img-box {
    position: relative;
    float: left;
    width: 116px;
    height: 116px;
  }
  .noImg {
    position: absolute;
    top: 1px;
    left: 1px;
    width: 102px;
    height: 102px;
    border: 1px dashed #aaa;
    border-radius: 4px;
    z-index: 1;
  }
  .el-upload__label {
    display: block;
    width: 104px;
    height: 104px;
    line-height: 104px;
    text-align: center;
    border: 1px dashed #aaa;
    border-radius: 4px;
    cursor: pointer;
    position: relative;
  }
  .box {
    box-shadow: 0 0.01rem 0.06rem rgba(0, 0, 0, 0.15);
  }

  .breadcrumb-wrap .el-breadcrumb {
    display: inline-block;
    line-height: 48px;
    height: 48px;
    margin-left: 8px;
    color: #7f7f7f;
  }
  .avatar-uploader-text {
    position: absolute;
    right: 66px;
    font-size: 12px;
    top: 36px;
  }
  .detail-config-main {
    position: absolute;
    top: 0px;
    left: 0px;
    bottom: 0px;
    right: 0px;
    padding: 8px;
  }

  .save {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 48px;
    line-height: 48px;
    background-color: #fff;
    text-align: center;
  }

  .add-delete {
    height: 48px;
    line-height: 48px;
    padding-left: 16px;
  }

  .company-type,
  .select-device,
  .set-linkage,
  .selected {
    background-color: #fff;
    width: 100%;
  }

  .head {
    /* height: 48px; */
    padding: 16px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.9);
    border-bottom: 1px solid #dedede;
  }

  ul.companys > li {
    display: inline-block;
    padding: 40px;
  }

  .companys-wrap {
    padding: 8px;
    margin: 0 auto;
  }

  .select-device-body {
    padding: 8px;
  }

  .client-linkage {
    height: 512px;
  }

  .message-linkage {
    width: 100%;
    margin: 0 auto;
    text-align: center;
    padding: 32px 0;
  }

  .mt8 {
    margin-top: 8px;
  }

  .font12 {
    font-size: 12px;
  }

  .form-line {
    margin: 0 auto 16px;
    width: 620px;
  }

  .el-collapse {
    border: 1px solid #fff !important;
  }
  .selected-wrap {
    padding: 24px 40px;
  }

  .selected-wrap > div {
    height: 40px;
    line-height: 40px;
  }
</style>
