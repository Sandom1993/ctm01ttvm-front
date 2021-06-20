<template>
  <div v-loading="uploadLoading" class="wrap">
    <el-form
      ref="form"
      label-position="top"
      :model="form"
      label-width="90px"
      :inline="true"
      content-width="300px"
    >
      <el-form-item label="围栏类型">
        <el-select
          v-model="form.type"
          clear
          placeholder="请选择"
          @change="typeChange"
        >
          <el-option
            v-for="item in options"
            :key="item"
            :label="item"
            :value="item"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="围栏名称">
        <el-input v-model="form.shapeName"></el-input>
      </el-form-item>
      <!-- <el-form-item label="关联报警类型">
        <el-select
          clear
          v-model="form.alarmType"
          placeholder="请选择"
          :disabled="form.type === '标记点围栏'"
        >
          <el-option
            v-for="item in alarmOptions"
            :key="item"
            :label="item"
            :value="item"
          >
          </el-option>
        </el-select>
      </el-form-item> -->
      <el-form-item class="form-btns" content-width="400px">
        <el-button type="info" @click="searchBtnClick">查询</el-button>
        <el-button @click="reset">重置</el-button>
        <el-dropdown placement="bottom-start">
          <el-button class="el-dropdown-link">
            导入
          </el-button>
          <el-dropdown-menu slot="dropdown" ref="dropmenu">
            <el-dropdown-item>
              <el-upload
                :on-success="importSuccess"
                :on-error="importError"
                :before-upload="beforeUpload"
                :headers="csrfToken"
                :show-file-list="false"
                action="/ctm01ttvm-web/fence/importFenceExcelFile.do"
              >
                <div style="width: 100%; padding: 0 20px;">
                  导入文档
                </div>
              </el-upload>
            </el-dropdown-item>
            <el-dropdown-item>
              <div style="width: 100%; padding: 0 20px;" @click="exportMod">
                导出模板
              </div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-form-item>
    </el-form>

    <el-table
      border
      height="100%"
      :data="tableData"
      @selection-change="selChange"
    >
      <!-- <el-table-column
        type="selection">
      </el-table-column> -->
      <el-table-column
        v-for="item in tableTitle"
        :key="item.prop"
        :prop="item.prop"
        :label="item.label"
      >
        <!-- <template v-slot="scope" v-if="item.label === '应用时段'">
          <el-button type="link" slot="reference" @click="dialogVisible = true">查看应用时段</el-button>
        </template> -->
      </el-table-column>
      <el-table-column label="操作">
        <template v-slot="scope">
          <el-button
            v-if="!scope.row.ruleTypes.length"
            type="link"
            title="暂无详情信息可预览"
            disabled
          >
            详情
          </el-button>
          <el-button
            v-if="scope.row.ruleTypes.length"
            type="link"
            @click="detail(scope)"
          >
            详情
          </el-button>
          <!-- <el-button type="link" @click="del(scope)">删除</el-button> -->
          <el-button type="link" @click="copy(scope.row)">复制</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :current-page="currentPage"
      :page-sizes="[20, 50, 100, 200]"
      :page-size="pageSize"
      layout="total, sizes, huiPager, jumper"
      :total="pageTotal"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    ></el-pagination>

    <el-dialog :visible.sync="dialogVisible">
      <div class="item-wrap">
        <span>围栏名称</span>
        <el-input disabled :value="detailInfo.shapeName"></el-input>
      </div>
      <div class="item-wrap">
        <span>围栏类型</span>
        <el-input disabled :value="fenceType(detailInfo.shapeType)"></el-input>
      </div>
      <div v-if="detailInfo.radius" class="item-wrap">
        <span>半径</span>
        <el-input disabled :value="detailInfo.radius"></el-input>
        米
      </div>
      <div v-if="detailInfo.width" class="item-wrap">
        <span>路宽</span>
        <el-input disabled :value="detailInfo.width"></el-input>
        米
      </div>
      <div class="item-wrap">
        <p>关联车辆信息</p>
        <div class="plateno-group">
          <span
            v-for="item in detailInfo.vehicles"
            :key="item.vehicleIndexCode"
            class="plateno"
          >
            {{ item.plateNo }}
          </span>
        </div>
      </div>

      <div
        v-for="item in detailInfo.ruleList"
        :key="item.shapeRuleIndexCode"
        class="rule-item"
      >
        <div class="item-wrap">
          <span>关联报警类型</span>
          <el-input disabled :value="ruleType(item.ruleType)"></el-input>
        </div>
        <div class="item-wrap">
          <span>图形类型</span>
          <el-input disabled :value="graphType(item.shapeRuleType)"></el-input>
        </div>
        <div v-if="item.rule.speed" class="item-wrap">
          <span>最大告警速度</span>
          <el-input disabled :value="item.rule.speed"></el-input>
          公里/小时
        </div>
        <div v-if="item.rule.alarmNum" class="item-wrap">
          <span>告警次数</span>
          <el-input disabled :value="item.rule.alarmNum"></el-input>
          次
        </div>
        <div v-if="item.rule.stayTime" class="item-wrap">
          <span>停留时间</span>
          <el-input disabled :value="item.rule.stayTime"></el-input>
          次
        </div>
        <div
          v-if="item.rule.effectiveDate && item.rule.expiringDate"
          class="item-wrap"
        >
          <span>有效日期</span>
          <el-input
            disabled
            :value="
              item.rule.effectiveDate.split('-').join('/') +
                '-' +
                item.rule.expiringDate.split('-').join('/')
            "
          ></el-input>
        </div>
        <!-- <h-plan-group label-width="80px" action-width="48px" disabled>
          <h-plan
            v-for="(value,index) in rangeData"
            :key="index"
            :current-type="1"
            :custom-range-color="customRangeColor"
            v-model="rangeData[index]"
            @mouseenter="handleMouseEnter(index)"
            @timeerror="timeError"
            :step="1"
          >
            <span slot="label">{{week[index]}}</span>
            <el-popover
              slot="action"
              :ref="'popover'+index"
              placement="left"
              title="复制到"
              popper-class="page-plan-popover"
              trigger="click"
              @show="handlePopShow"
              @hide="handlePopHide"
            >
              <div>
                <el-checkbox
                  :indeterminate="isIndeterminate"
                  v-model="checkAll"
                  @change="handleCheckAllChange"
                >
                  全选
                </el-checkbox>
                <el-checkbox-group
                  v-model="checkedDays"
                  @change="handleCheckedDaysChange"
                >
                  <el-checkbox
                    v-for="(day,n) in week"
                    :disabled="n===index"
                    :label="n"
                    :key="day"
                  >
                    {{day}}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
              <div style="text-align: right; margin: 0">
                <el-button type="text" size="mini" @click="handleCopyConfirm(index)">
                  确定
                </el-button>
                <el-button
                  type="text"
                  size="mini"
                  class="popover-cancel-btn"
                  @click="closePopover(index)"
                >
                  取消
                </el-button>
              </div>
              <el-button
                :class="{'btn-plan-copy':true,'show':focus===index}"
                icon="h-icon-copy"
                slot="reference"
              ></el-button>
            </el-popover>
          </h-plan>
        </h-plan-group> -->
      </div>
    </el-dialog>
    <el-dialog
      title="复制围栏"
      :visible.sync="dialogFenceVisible"
      :area="[500, 420]"
      @close="handleFenceClose"
    >
      <el-form
        ref="fenceForm"
        :model="fenceForm"
        :rules="fenceRules"
        label-position="top"
      >
        <el-form-item label="围栏名称" label-width="90px" prop="shapeName">
          <el-input v-model="fenceForm.shapeName"></el-input>
        </el-form-item>
        <el-form-item label="挂载组织" required></el-form-item>
        <div class="org-tree-wrap">
          <org-tree
            ref="orgTree"
            tree-type="1"
            :is-need-check-box="false"
            :is-need-filter="false"
            @deviceClick="nodeClick"
          />
        </div>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="handleCopy">
          确 定
        </el-button>
        <el-button @click="handleFenceClose">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getToken } from '@/utils/common';
import tTitle from './tableTitle';
import { fenceType, ruleType, graphType } from './someTrans';
import OrgTree from '@/components/Tree';
import {
  findFencePage,
  findFence,
  deleteFenceInfo,
  addFenceInfo
} from '@/api/fence';
export default {
  components: {
    OrgTree
  },
  data() {
    return {
      loading: null,
      dialogFenceVisible: false,
      uploadLoading: false,
      fenceForm: {
        shapeName: ''
      },
      fenceRules: {
        shapeName: [
          { required: true, message: '请输入围栏名称', trigger: 'blur' }
        ]
      },
      fenceCopyParams: {},
      week: [
        '星期一',
        '星期二',
        '星期三',
        '星期四',
        '星期五',
        '星期六',
        '星期日'
      ],
      options: ['区域围栏', '线路围栏', '标记点围栏'],
      form: {
        type: '区域围栏',
        shapeName: ''
        // alarmType: ''
      },
      orgIndexCode: '',
      detailInfo: {
        ruleList: [
          {
            ruleType: '',
            rule: {
              speed: 0
            }
          }
        ],
        vehicles: []
      },
      tableData: [],
      selectable: [],
      rangeData: [
        [{ type: 1, from: 900, to: 86399 }],
        [
          { type: 2, from: 28800, to: 46800 },
          { type: 2, from: 72000, to: 78300 }
        ],
        [{ type: 1, from: 18000, to: 36000 }],
        [{ type: 1, from: 36900, to: 45000 }],
        [{ type: 2, from: 27000, to: 45000 }],
        [{ type: 1, from: 72000, to: 78300 }],
        [{ type: 1, from: 28800, to: 46800 }]
      ],
      customRangeColor: {
        '1': '#3d6ce5'
      },
      isPopoverShow: false,
      checkAll: false,
      focus: 0,
      checkedDays: [],
      isIndeterminate: false,
      dialogVisible: false,
      pageTotal: 1,
      pageSize: 20,
      currentPage: 1,
      csrfToken: {}
    };
  },
  computed: {
    // alarmOptions: function() {
    //   this.form.alarmType = ''
    //   return this.form.type === '区域围栏'
    //   ? ['区域内低速', '进区域', '出区域', '长时间停留']
    //   : this.form.type === '线路围栏'
    //     ? ['偏离线路', '进入线路'] : []
    // },
    // relaAlarmType: function () {
    //   console.log(this.tableData.ruleList.map(i => {
    //     ruleType(i.ruleType)
    //   }))
    //   return this.detailInfo.ruleList.map(i => {
    //     ruleType(i.ruleType)
    //   }).join('|')
    // },
    tableTitle: function() {
      // return tTitle[this.form.type || 'all']
      return tTitle.easy;
    },
    shapeTypes: function() {
      if (this.form.type === '区域围栏') return [1, 2, 3];
      else if (this.form.type === '线路围栏') return [4, 5];
      else if (this.form.type === '标记点围栏') return [6];
      else return [1, 2, 3, 4, 5, 6];
    },
    // 用于计算需要合并的行的index
    mergeTable: function() {
      const mergeInfo = [];
      const last = null;
      const nameList = this.tableData.map(v => v.shapeName);
      let isSame = false;
      nameList.forEach((i, index) => {
        // 后面有相同的情况
        if (nameList.slice(index + 1).indexOf(i) !== -1) {
          // 说明是该name第一次出现相同
          if (isSame === false) {
            mergeInfo.push([index, null]);
          }
          isSame = true;
        } else {
          if (isSame === true) {
            mergeInfo[mergeInfo.length - 1][1] = index;
          }
          isSame = false;
        }
      });
      return mergeInfo;
    }
  },
  mounted() {
    this.csrfToken = {
      'X-CSRF-TOKEN': getToken()
    };
    this.doSearch();
  },
  methods: {
    // 树节点点击事件
    nodeClick(e) {
      this.orgIndexCode = e[0] && e[0].indexCode;
    },
    searchBtnClick() {
      this.currentPage = 1;
      this.pageSize = 20;
      this.doSearch();
    },
    doSearch() {
      this.loading = this.$loading({ fullscreen: true });
      // search here
      findFencePage({
        pageNo: this.currentPage,
        pageSize: this.pageSize,
        shapeName: this.form.shapeName,
        shapeTypes: this.shapeTypes
      })
        .then(r => {
          // 做table的合并所需数据处理
          this.tableData = r.data.list.sort((b, a) => {
            if (b.shapeName > a.shapeName) return 1;
            else if (b.shapeName == a.shapeName) return 0;
            else return -1;
          });
          this.pageTotal = r.data.total;
          this.pageSize = r.data.pageSize;
          this.tableData.forEach((i, index) => {
            this.tableData[index]._shapeType = fenceType(
              this.tableData[index].shapeType
            );
            this.tableData[index]._ruleTypes = this.tableData[index].ruleTypes
              .length
              ? this.tableData[index].ruleTypes.map(v => ruleType(v)).join('|')
              : '未配置规则';
          });
        })
        .finally(() => {
          this.loading.close();
        });
    },
    reset() {
      this.form = {
        type: '',
        name: ''
        // alarmType: ''
      };
      this.tableData = [];
    },
    typeChange() {
      this.tableData = [];
    },
    // spanMethod ({ row, column, rowIndex, columnIndex }) {
    //   // 只对第0 + 1行进行合并
    //   if(columnIndex === 3) {
    //     for(let i = 0; i< this.mergeTable.length; i++) {
    //       if (rowIndex === this.mergeTable[i][0]) {
    //         return {
    //           rowspan: this.mergeTable[i][1] - this.mergeTable[i][0] + 1,
    //           columnspan: 1
    //         }
    //       } else if(rowIndex > this.mergeTable[i][0] && rowIndex <= this.mergeTable[i][1]) {
    //         return {
    //           rowspan: 0,
    //           columnspan: 0
    //         }
    //       }
    //     }
    //   }
    // },
    selChange(selection) {
      console.log(selection);
    },
    timeError() {
      console.log('timeerror');
    },
    handlePopShow() {
      this.isPopoverShow = true;
    },
    handlePopHide() {
      this.checkAll = false;
      this.checkedDays = [];
      this.isIndeterminate = false;
      this.isPopoverShow = false;
    },
    handleCheckAllChange(checked) {
      this.checkedDays = checked ? [0, 1, 2, 3, 4, 5, 6] : [];
      this.isIndeterminate = false;
    },
    handleCheckedDaysChange(value) {
      const checkedCount = value.length;
      this.checkAll = checkedCount === this.week.length;
      this.isIndeterminate =
        checkedCount > 0 && checkedCount < this.week.length;
    },
    handleMouseEnter(index) {
      if (!this.isPopoverShow) {
        this.focus = index;
        console.log(this.focus);
      }
    },
    closePopover(index) {
      this.$refs['popover' + index][0].doClose();
    },
    handleCopyConfirm(index) {
      const currentData = this.rangeData[index];
      this.checkedDays.forEach(val => {
        this.$set(this.rangeData, val, JSON.parse(JSON.stringify(currentData)));
      });
      this.closePopover(index);
    },
    detail(r) {
      this.loading = this.$loading({ fullscreen: true });
      findFence({
        ruleTypes: r.row.ruleTypes[0].toString(),
        shapeIndexCode: r.row.shapeIndexCode,
        shapeType: r.row.shapeType
      })
        .then(r => {
          this.detailInfo = r.data;
          this.dialogVisible = true;
        })
        .finally(() => {
          this.loading.close();
        });
    },
    // del(r) {
    //   this.$confirm('此操作将永久删除, 是否继续?', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'question'
    //   })
    //     .then(() => {
    //       deleteFenceInfo({
    //         shapeIndexCode: r.row.shapeIndexCode
    //       }).then(r => {
    //         if (r.code === '0') {
    //           this.$message({
    //             type: 'success',
    //             message: '删除成功!'
    //           });
    //         }
    //         this.doSearch();
    //       });
    //     })
    //     .catch(() => {
    //       this.$message({
    //         type: 'success',
    //         message: '已取消删除!'
    //       });
    //     });
    // },
    copy(row) {
      console.log(row);
      const latList = [];
      const lonList = [];
      row.points.forEach(item => {
        latList.push(item.latitude);
        lonList.push(item.longitude);
      });
      this.fenceForm.shapeName = row.shapeName;
      this.fenceCopyParams = {
        latList: latList,
        lonList: lonList,
        radius: row.radius,
        ruleTypes: null,
        shapeName: row.shapeName,
        shapeType: row.shapeType,
        width: row.width
      };
      this.dialogFenceVisible = true;
    },
    handleFenceClose() {
      this.orgIndexCode = '';
      this.$refs.orgTree.clearSelectNodes();
      this.resetForm('fenceForm');
      this.resetValidates('fenceForm');
      this.dialogFenceVisible = false;
    },
    handleCopy() {
      // 是否选择组织树
      if (!this.orgIndexCode) {
        this.$message.warning('请选择组织');
        return;
      }
      this.$refs.fenceForm.validate(valid => {
        if (valid) {
          this.fenceCopyParams.shapeName = this.fenceForm.shapeName;
          this.fenceCopyParams.orgIndexCode = this.orgIndexCode;
          this.loading = this.$loading({ fullscreen: true });
          addFenceInfo(this.fenceCopyParams)
            .then(res => {
              this.resetForm('fenceForm');
              this.$refs.orgTree.clearSelectNodes();
              this.orgIndexCode = '';
              this.resetValidates('fenceForm');
              this.dialogFenceVisible = false;
              this.doSearch();
            })
            .finally(() => {
              this.loading.close();
            });
        } else {
          return false;
        }
      });
    },
    //  重置表格
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    //  重置表格验证规则
    resetValidates(formName) {
      this.$refs[formName].resetValidates();
    },
    beforeUpload(file) {
      this.uploadLoading = true;
      const extension = file.name.split('.').slice(-1)[0];
      if (extension !== 'xlsx' && extension !== 'xls') {
        this.uploadLoading = false;
        this.$message({
          type: 'warning',
          message: '上传文件格式出错，仅支持上传.xlsx或.xls'
        });
        return false;
      }
    },
    handleCurrentChange(n, o) {
      this.currentPage = n;
      this.doSearch();
    },
    handleSizeChange(n, o) {
      this.currentPage = 1;
      this.pageSize = n;
      this.doSearch();
    },
    ruleType(e) {
      return ruleType(e);
    },
    fenceType(e) {
      return fenceType(e);
    },
    graphType(e) {
      return graphType(e);
    },
    // 导入文档 成功
    importSuccess(r) {
      this.uploadLoading = false;
      if (r.code !== '0') {
        if (!r.data) {
          this.$msgbox({
            title: '错误',
            type: 'error',
            message: r.msg
          });
          return;
        }
        const arr = r.data.split(']').map(item => {
          return item + ']';
        });
        arr.pop();
        let str = '';
        arr.forEach(item => {
          str += `<p>${item}</p>`;
        });
        this.$msgbox({
          title: '错误',
          type: 'error',
          dangerouslyUseHTMLString: true,
          message: str
        });
        return;
      }
      this.$message.success(r.msg);
      // 刷新数据
      this.doSearch();
      // 对code进行判断
      // this.$message(r.msg)
    },
    // 失败
    importError(r) {
      this.uploadLoading = false;
      this.$message.error('服务器错误');
    },
    // 导出模板
    exportMod() {
      window.open('static/doc/template.xlsx');
    }
  }
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-dropdown-menu__item {
    padding: 0;
  }
}
.wrap {
  height: calc(100% - 85px - 56px);
}

.form-btns {
  vertical-align: bottom;
}

.btn-plan-copy {
  display: none;
}
.show {
  display: inline-block;
}

.el-dropdown {
  margin-left: 20px;
}

.el-table {
  height: 100%;
  overflow: auto;
}

.el-dialog {
  .item-wrap {
    padding: 5px 0;
    p {
      margin: 0 0 10px 40px;
    }
    .plateno-group {
      padding-left: 40px;
    }
    span:not(.plateno) {
      display: inline-block;
      width: 140px;
      margin-right: 10px;
      text-align: center;
    }
    .el-input {
      width: 40%;
      margin-left: 10px;
      margin-right: 5px;
    }
  }
}

.rule-item {
  &::before {
    content: '';
    display: inline-block;
    width: 100%;
    height: 10px;
    background-color: rgba(0, 0, 0, 0.1);
  }
}

.plateno {
  display: inline-block;
  width: 86px;
  height: 28px;
  line-height: 28px;
  color: white;
  margin: 0 10px 5px 0;
  text-align: center;
  background-image: url('../../assets/png/license.png');
}
.org-tree-wrap {
  position: relative;
  height: 150px;
  margin-top: -20px;
  .wrap {
    height: auto;
  }
}
</style>
