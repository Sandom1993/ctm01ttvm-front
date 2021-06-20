<template>
  <div
    id="companysubscription"
    class="company-subscription-main">
    <company-add
      ref="add"
      v-show="isShowAdd"
      :isShowAdd="isShowAdd"
      :type="type"
      :orgIndexCode="orgIndexCode"
    ></company-add>
    <div
      v-show="!isShowAdd"
      class="config-wrap">
      <div class="left-box">
        <tree
          url="tree/getOrgTree.do"
          filterUrl="tree/filterOrgByName.do"
          type="1"
          moduleName="config"
          @tree-node-click="setOrgIndexCode"
        ></tree>
      </div>
      <div class="right-box">
        <div class="right-main">
          <span class="add-delete">
            <el-button
              type="iconButton"
              icon="h-icon-add"
              @click="addConfig()">添加</el-button>
            <el-button
              type="iconButton"
              icon="h-icon-delete"
              @click="deleteConfig()">删除</el-button>
          </span>
          <span class="operate-option-wrap-right">
            <el-select
              v-model="conditionKey"
              class="change-search-condition"
              placeholder="请选择">
              <el-option
                label="企业名"
                :value="0"></el-option>
            </el-select>
            <el-input
              v-model="conditionValue"
              class="right-search"
              placeholder="请输入"
              suffix-icon="h-icon-search"
              :on-icon-click="tableSearch"
            ></el-input>
          </span>
          <div class="table-wrap">
            <el-table
              :data="tableData"
              stripe
              force-scroll
              @selection-change="handleSelectionChange"
            >
              <template slot="empty">
                <span class="no-data"></span>
              </template>
              <el-table-column type="selection"></el-table-column>
              <el-table-column
                :label="$t('排序')"
                type="index"
                width="58"></el-table-column>
              <el-table-column
                label="企业名称"
                prop="attributes">
                <template slot-scope="scope">
                  <p>{{ scope.row.companyName }}</p>
                </template>
              </el-table-column>
              <el-table-column
                label="组织机构代码"
                prop="attributes">
                <template slot-scope="scope">
                  <p>{{ scope.row.organizingInstitution ? scope.row.organizingInstitution : "-" }}</p>
                </template>
              </el-table-column>
              <el-table-column
                label="经营负责人"
                prop="attributes">
                <template slot-scope="scope">
                  <p>{{ scope.row.operationManager ? scope.row.operationManager : "-" }}</p>
                </template>
              </el-table-column>
              <el-table-column
                label="法人"
                prop="attributes">
                <template slot-scope="scope">
                  <p>{{ scope.row.legalRepresentative ? scope.row.legalRepresentative : "-" }}</p>
                </template>
              </el-table-column>
              <el-table-column
                label="电话号码"
                prop="attributes">
                <template slot-scope="scope">
                  <p>{{ scope.row.phoneNumber ? scope.row.phoneNumber : "-" }}</p>
                </template>
              </el-table-column>
              <el-table-column label="编辑">
                <template slot-scope="scope">
                  <el-button
                    class="button-item"
                    size="small"
                    type="text"
                    @click="editConfig(scope.$index, scope.row)"
                  >编辑</el-button>
                  <el-button
                    class="button-item"
                    size="small"
                    type="text"
                    @click="delOne(scope.$index, scope.row)"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              class="pagination-bg"
              @size-change="handleChangeSize"
              @current-change="handleChangePage"
              :current-page.sync="currentPage"
              :page-sizes="[20, 40, 60, 100]"
              :page-size.sync="currentPageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
            ></el-pagination>
            <!-- </h-paged-table> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import CompanyAdd from './CompanyAdd.vue';
  import tree from '../../components/resTree';
  import api from '../../api/companyManger.js';
  import {
    toTimezoneString
  } from '../../components/util.js';

  export default {
    //企业管理
    name: 'Company',
    components: {
      tree,
      CompanyAdd
    },
    data() {
      return {
        conditionKey: 0,
        conditionValue: '',
        selectDevices: null,
        isShowAdd: false,
        type: 1,
        searchCondition: {
          // 表格搜索条件
          pageNo: 1,
          pageSize: 20,
          condition: {},
          exactCondition: {}
        },
        isAvailable: true, // 查询权限
        orgIndexCode: '', // 组织树
        datas: [], // 列表数据
        currentPage: 1,
        currentPageSize: 20,
        total: 0,
        tableData: []
      };
    },
    methods: {
      handleChangePage(currentPage) {
        this.searchCondition.pageNo = currentPage;
      },
      handleChangeSize(size) {
        this.searchCondition.pageSize = size;
      },
      tableFetch() {
        /* eslint-disable */
        var _this = this;
        api.findCompanyPage(this.searchCondition).then(data => {
          console.log(data)
          if (data.msg === 'SUCCESS') {
            _this.tableData = data.data.data.list;
            _this.showPagenation = true;
            _this.total = data.data.data.total;
          }
        });
      },
      editConfig(index, row) {
        Object.keys(this.$refs.add.editForm).forEach(key => {
          this.$refs.add.editForm[key] = row[key];
          /* eslint-disable */
          this.$refs.add.editForm['photoType'] = 1;
          if (
            key === 'issueDate' ||
            key === 'validateEnd' ||
            key === 'validateStart'
          ) {
            if (row[key] === null || row[key] === '') {
              this.$refs.add.editForm[key] = toTimezoneString(new Date());
            } else {
              this.$refs.add.editForm[key] = toTimezoneString(row[key]);
            }
          }
        });
        if (row.indexCode) {
          api.findByIndexCode(row.indexCode).then(response => {
            this.type = 2;
            this.isShowAdd = true;
          });
        }
      },
      checkOrg() {
        if (!this.orgIndexCode) {
          this.$message({
            showClose: true,
            message: this.$t('请选择组织'),
            type: 'warning'
          });
          return false;
        }
        return true;
      },
      addConfig() {
        if (this.checkOrg()) {
          this.isShowAdd = true;
          this.type = 1;
        }
      },
      deleteConfig() {
        if (this.selectDevices && this.selectDevices.length > 0) {
          this.$confirm(this.$t('确认删除'), '提示', {
            confirmButtonText: this.$t('确认'),
            cancelButtonText: this.$t('取消'),
            type: 'question'
          })
            .then(() => {
              const deploymentIds = [];
              this.selectDevices.forEach(item => {
                deploymentIds.push(item.indexCode);
              });
              api.deleteCompanys(deploymentIds).then(json => {
                this.$message({
                  type: 'success',
                  message: this.$t('删除成功')
                });
                this.onSearch();
              });
            })
            .catch(() => {});
        } else {
          this.$message({
            type: 'warning',
            message: this.$t('请选择删除的企业')
          });
        }
      },
      delOne(index, row) {
        this.$confirm(this.$t('确认删除'), '提示', {
          confirmButtonText: this.$t('确认'),
          cancelButtonText: this.$t('取消'),
          type: 'question'
        })
          .then(() => {
            api.deleteCompanys([row.indexCode]).then(json => {
              this.$message({
                type: 'success',
                message: this.$t('删除成功')
              });
              this.onSearch();
            });
          })
          .catch(() => {});
      },
      handleSelectionChange(selection) {
        this.selectDevices = selection;
      },
      tableSearch() {
        this.searchCondition.condition = {
          companyName: this.conditionValue
        };
        this.$nextTick(() => {
          this.onSearch();
        });
      },
      setOrgIndexCode(param) {
        this.isAvailable = true;
        this.orgIndexCode = param.indexCode;
        this.onSearch();

      },

      onSearch() {
        if (!this.isAvailable) {
          this.$message({
            showClose: true,
            message: this.$t('无查询权限'),
            type: 'warning'
          });
          this.datas = [];
          return false;
        }
        let param = {
          pageNo: this.currentPage,
          pageSize: this.currentPageSize,
          exactCondition: {
            orgIndexCodes: [this.orgIndexCode]
          },
          condition: {
            companyName: this.conditionValue
          }
        };
        this.searchCondition = param;
        this.tableFetch();
      }
    }
  };
</script>
<style lang="scss">
  .company-subscription-main {
    position: absolute;
    top: 0px;
    bottom: 0px;
    left: 0px;
    right: 0px;
    background-color: #f5f5f5;
    .config-wrap {
      background-color: #fff;
      padding: 8px;
    }
    .left-box {
      position: absolute;
      width: 280px;
      left: 0;
      top: 0;
      bottom: 0;
      background-color: #fff;
      overflow: hidden;
      border-radius: 3px;
      padding: 8px 8px 16px 8px;
    }
    .pagination-bg {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 48px;
      padding: 0 8px;
    }
    .right-box {
      position: absolute;
      min-width: 800px;
      top: 0;
      bottom: 0;
      left: 280px;
      right: 0;
      padding: 8px;
      overflow-y: hidden;
      background-color: rgb(245, 245, 245);
    }
    .right-main {
      width: 100%;
      height: 100%;
      background: #fff;
    }
    .add-delete {
      margin-left: 8px;
      height: 48px;
      line-height: 48px;
      color: #4d4d4d;
    }
    .button-item {
      color: #6091f8;
    }
    .operate-option-wrap-right {
      position: absolute;
      right: 8px;
      top: 14px;
      .change-search-condition {
        width: 120px;
      }
      .right-search {
        width: 240px;
      }
    }
    .table-wrap {
      position: absolute;
      top: 56px;
      bottom: 8px;
      left: 24px;
      right: 8px;
    }
  }
</style>
