<template>
  <div
    class="wrap"
    :style="
      'top:' +
        top +
        'px;bottom:' +
        bottom +
        'px;left:' +
        left +
        'px;right:' +
        right +
        'px'
    "
  >
    <div v-show="isShowResult" class="search-result-wrap">
      <div class="back-to-res">
        <el-button
          type="iconButton"
          icon="h-icon-arrow_left"
          @click="goBackTree"
        >
          返回
        </el-button>
      </div>
      <div v-if="queryList.length === 0" class="no-result-wrap">
        <div>
          <img src="../assets/png/box.png" />
          <div
            :style="
              'margin-top:8px;color: rgba(0,0,0,0.70);font-size:12px;width:' +
                (isNeedSearchType ? 318 : 268) +
                'px;'
            "
          >
            查询无结果
          </div>
          <div
            :style="
              'margin-top:8px;color: rgba(0,0,0,0.50); font-size:12px;width:' +
                (isNeedSearchType ? 318 : 268) +
                'px;'
            "
          >
            请修改条件重新查询
          </div>
        </div>
      </div>
      <el-scrollbar
        v-else
        ref="resultScrollbar"
        wrap-style="overflow-x:hidden;position: absolute;top: 0;bottom: 17px;left: 0;right: 0;"
        view-style="padding-left:0px;margin:0px;"
        view-class="query-list"
        tag="ul"
        @on-scrolling-y="handleScrollResult"
      >
        <li
          v-for="item in queryList"
          :key="item.id"
          @click="selectResult(item)"
        >
          <i class="h-icon-location" style="font-size:20px;"></i>
          <span
            :title="item.value"
            style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;"
          >
            {{ item.value }}
          </span>
        </li>
      </el-scrollbar>
    </div>
    <div v-show="!isShowResult" class="tree-wrap">
      <div v-if="isNeedSearchType && isNeedFilter" class="search-type">
        <span style="width:120px;">
          <el-select v-model="searchType" placeholder="请选择">
            <el-option label="车牌号码" :value="0"></el-option>
            <el-option label="司机" :value="1"></el-option>
            <el-option label="企业" :value="2"></el-option>
            <el-option label="SIM卡" :value="3"></el-option>
            <el-option label="车队" :value="4"></el-option>
          </el-select>
        </span>
        <span style="position: absolute;left:96px;right:0px;">
          <el-autocomplete
            v-if="isNeedFilter"
            v-model="filterText"
            placeholder="请输入关键字"
            :trigger-on-focus="false"
            :fetch-suggestions="querySearchAsync"
            :debounce="debounce"
            @select="handleSelect"
          >
            <i
              slot="suffix"
              class="el-input__icon h-icon-search"
              @click="handleIconClick"
            ></i>
          </el-autocomplete>
        </span>
      </div>
      <el-autocomplete
        v-if="!isNeedSearchType && isNeedFilter"
        v-model="filterText"
        placeholder="请输入关键字"
        :trigger-on-focus="false"
        :fetch-suggestions="querySearchAsync"
        :popper-class="popperClass ? 'popperClass' : ''"
        :debounce="debounce"
        @select="handleSelect"
      >
        <i
          slot="suffix"
          class="el-input__icon h-icon-search"
          @click="handleIconClick"
        ></i>
      </el-autocomplete>
      <div v-if="isNeedOnline" class="online-device">
        <el-switch
          v-model="isOnline"
          active-color="#2080f7"
          :instruction="
            treeType === '3' || treeType === '7' ? '在线车辆' : '在线设备'
          "
          @change="getOnline"
        ></el-switch>
      </div>
      <div
        :class="{ 'tree-body': true, borderTop: isNeedFilter }"
        :style="
          'top:' +
            (isNeedOnline ? 72 : isNeedFilter ? 32 : 0) +
            'px;bottom:' +
            slotLine * 40 +
            'px'
        "
      >
        <el-tree
          v-if="isShowTree"
          ref="resourceTree"
          default-icon="rm-tree-org"
          :show-checkbox="isNeedCheckBox"
          :data="dataWithIcon"
          :props="defaultProps"
          simple-data
          :node-key="treeKey"
          parent-key="parentId"
          lazy
          :load="loadChildren"
          :default-expanded-keys="[rootIndexCode]"
          :render-content="renderContent"
          @node-click="handleNodeClick"
          @check="treeCheck"
          @node-expand="handleExpandNode"
        ></el-tree>
      </div>
      <div class="time-wrap">
        <slot name="time"></slot>
      </div>
      <div class="query-wrap">
        <slot name="query"></slot>
      </div>
      <div class="btns-wrap">
        <slot name="btns"></slot>
      </div>
    </div>
  </div>
</template>

<script>
// 抛出的事件:
//  1-deviceClick  param(Array) (被选中的节点)
//  2-getSelectedNodes param(Array) (被选中的节点)
// import { setTimeout } from 'timers';
import {
  getManagerOrgTree,
  getNonStandardVehicleTree,
  filterNonStandardVehicleByName,
  getDeviceTree,
  getVehicleTree,
  getUserTree,
  getNewUserTree,
  getVehicleCameraTree,
  getOrgTree,
  getNewOrgTree,
  filterOrgByName,
  filterDeviceByName,
  filterVehicleByName,
  filterUserTree,
  getTreePath
} from '../api/tree.js';

export default {
  name: 'Tree',
  props: {
    // 树的类型 1-管理角色组织树 2-设备树 3-车辆树 4-用户树 5-监控点树 2-应用角色组织树 7-非标车辆树
    treeType: { default: '2', type: String },
    // ENCODE_DEVICE, CAMERA,ORG,IO,vehicle,driver,sim
    searchResourceType: { type: String, default: '' },
    // 一次性勾选的数量
    checkLimit: { default: 2000, type: Number },
    // 树的key
    treeKey: { type: String, default: 'id' },
    treatType: { type: String, default: '' },
    // 是否需要搜索类型
    isNeedSearchType: { default: false, type: Boolean },
    // 是否需要过滤在线设备的按钮
    isNeedOnline: { default: false, type: Boolean },
    // 是否需要模糊查询的输入框
    isNeedFilter: { default: true, type: Boolean },
    // 是否支持多选
    isNeedCheckBox: { default: true, type: Boolean },
    // 是否默认选中根节点
    isSelectRoot: { default: false, type: Boolean },
    // 初始化被选中的节点
    selectOneNode: { default: '', type: String },
    // 是否显示pop
    popperClass: { default: false, type: Boolean },
    // 树的定位
    top: { default: 0, type: Number },
    left: { default: 0, type: Number },
    right: { default: 0, type: Number },
    bottom: { default: 8, type: Number },
    // slot行数--树的定位
    slotLine: { default: 0, type: Number },
    debounce: { default: 300, type: Number },
    renderContent: { type: Function }
  },
  data() {
    return {
      isShowResult: false,
      filterText: '',
      dataWithIcon: [],
      defaultProps: {
        children: 'children',
        label: 'name',
        icon: 'icon',
        isLeaf: 'isLeaf',
        expanded: 'expanded',
        disabled: 'disabled'
      },
      treeParam: {
        treeCode: '0',
        checked: false,
        id: '',
        isOnline: null
      },
      isExpandAll: false, // loadchildren时是否需要展开子节点的标记
      isExpandPath: false, // 是否需要展开节点的父节点们
      checkedId: '', // 被勾选的节点
      rootIndexCode: '', // 树的根节点的id
      queryList: [],
      selectedNode: [], // 树上勾选的节点
      isOnline: false,
      searchType: 0,
      selectedResult: null, // 模糊搜索结果中选择的节点
      pageNo: 1,
      totalList: 0,
      filterTextCopy: '',
      treePath: [], // 需要展开的父节点id
      isShowTree: true,
      firstLoad: true // 轨迹回放初始化的时候需要选中节点,后续操作不选中
    };
  },
  watch: {
    // selectOneNode(val) {
    //   this.getTreePathArr(val);
    // },
    filterText(val) {
      if (val !== '点击查看更多') {
        this.filterTextCopy = val;
      }
    }
  },
  methods: {
    goBackTree() {
      this.resetResult();
    },
    resetResult() {
      this.isShowResult = false;
      this.filterText = '';
      this.filterTextCopy = '';
      this.pageNo = 1;
      this.queryList = [];
    },
    filterFunc(name, type, cb) {
      let result = [];
      this.totalList = [];
      let p1 = null;
      const condition = {
        treeCode: '0',
        pageNo: this.pageNo,
        pageSize: 30,
        searchName: name,
        isOnline: this.isOnline ? 1 : null
      };
      if (this.treeType === '1' || this.treeType === '6') {
        p1 = filterOrgByName(
          Object.assign(
            {
              authCode: this.treeType === '1' ? 'manage' : 'view'
            },
            condition
          )
        );
      } else if (this.treeType === '2') {
        p1 = filterDeviceByName(condition);
      } else if (this.treeType === '3' || this.treeType === '5') {
        p1 = filterVehicleByName(
          Object.assign(
            {
              searchType: this.searchType
            },
            condition
          )
        );
      } else if (this.treeType === '4') {
        p1 = filterUserTree(condition);
      } else if (this.treeType === '7') {
        p1 = filterNonStandardVehicleByName(
          Object.assign(
            {
              searchType: this.searchType
            },
            condition
          )
        );
      }
      p1.then(json => {
        // if (json.code === '0') {
        const { data } = json;
        if (data && data.list.length > 0) {
          result = data.list.map(node => ({
            value: node.name,
            id: node.indexCode,
            checked: false,
            treePaths: node.treePaths
          }));
          this.totalList = data.total;
        }
        if (typeof cb !== 'undefined') {
          if (this.totalList > result.length) {
            result = result.concat({ value: '点击查看更多' });
          }
          cb(result.length === 0 ? [] : result);
        } else {
          this.isShowResult = true;
          this.queryList = this.queryList.concat(result);
        }
        // }
      });
    },
    handleIconClick() {
      const input = document.getElementsByClassName(
        'el-autocomplete-suggestion'
      );
      for (let i = 0; i < input.length; i += 1) {
        input[i].style.display = 'none';
      }
      this.filterFunc(this.filterTextCopy, 0);
    },
    handleScrollResult({ percentY }) {
      if (percentY > 0.9 && this.totalList > this.queryList.length) {
        this.pageNo += 1;
        this.filterFunc(this.filterTextCopy, 0);
      }
    },
    handleSelect(item) {
      if (item.value === '点击查看更多') {
        this.filterFunc(this.filterTextCopy, 0);
        return;
      }
      this.selectResult(item);
      // const str = item.value;
      // const arr = str.split('[');
      // if (arr.length > 0) {
      //   this.filterFunc(arr[0], 2);
      // } else {
      //   this.filterFunc(str, 2);
      // }
      // // this.filterFunc(item.value, 2);
    },
    querySearchAsync(queryString, cb) {
      this.filterFunc(queryString, 0, cb);
    },
    handleNodeClick(data) {
      this.$emit('userClick', data);
      // 点击树节点
      if (this.treeType === '1' || this.treeType === '6' || data.isLeaf) {
        this.$emit('deviceClick', [data]);
      }
    },
    handleExpandNode() {
      this.isExpandAll = false;
      this.isExpandPath = false;
    },
    uncheckNode(node) {
      const uncheckChilrenNode = children => {
        children.forEach(child => {
          this.$refs.resourceTree.setChecked(child.data.id, false);
          if (child.childNodes.length > 0) {
            uncheckChilrenNode(child.childNodes);
          }
        });
      };
      uncheckChilrenNode([node]);
    },
    checkVehicleNumber(checkedNode) {
      const deviceNum = this.isOnline
        ? checkedNode.onLineDeviceNum
        : checkedNode.deviceNum;
      if (deviceNum && parseInt(deviceNum, 10) > this.checkLimit) {
        const node = this.$refs.resourceTree.getNode(checkedNode.id);
        let type = '车辆';
        if (this.treeType === '2') {
          type = '设备';
        } else if (this.treeType === '4') {
          type = '用户';
        }
        this.$message.warning(
          `为保障性能,建议一次性勾选不超过${this.checkLimit}个${type}`
        );
        this.uncheckNode(node);
        return false;
      }
      return true;
    },
    treeCheck(checkedNode) {
      // 勾选展开所有子节点
      if (!this.checkVehicleNumber(checkedNode)) {
        return;
      }
      this.checkedId = checkedNode[this.treeKey];
      if (this.isAllCompleted()) {
        // 已经都展开过了
        this.getTreeSelected();
        this.$refs.resourceTree.expandNode(checkedNode[this.treeKey]);
      } else {
        // 展开节点,在展开完之后向父节点emit被勾选或者选中的节点
        this.isExpandAll = true;
        const node = this.$refs.resourceTree.getNode(checkedNode[this.treeKey]);
        this.expandChild(node);
      }
    },
    setIcon(data) {
      data.forEach(item => {
        const cItem = item;
        if (this.treeType !== '1' && this.treeType !== '6' && !item.parent) {
          cItem.isLeaf = true;
        }
        if (this.treeKey === 'phoneNo') {
          cItem.disabled = !cItem.parent ? !item.phoneNo : false;
          cItem.phoneNo = item.phoneNo ? item.phoneNo : item.id; // 去掉这个空格HUI会报错!!!
        }
        if (
          cItem.iconSkin === 'org' ||
          cItem.iconSkin === 'area' ||
          cItem.iconSkin === 'control-unit'
        ) {
          cItem.icon = 'h-icon-info_organization';
        } else if (cItem.iconSkin === 'encode_device_on' || !cItem.iconSkin) {
          cItem.icon = 'rm-tree-vehicle';
          if (!cItem.online) {
            cItem.icon = 'rm-tree-vehicle off';
          }
        } else if (cItem.iconSkin === 'user') {
          cItem.icon = 'rm-tree-user';
        } else if (cItem.iconSkin === 'camera') {
          cItem.icon = 'rm-tree-camera';
          cItem.isLeaf = true;
        } else if (cItem.iconSkin === 'encode_new_resources_on') {
          // cItem.icon = 'rm-tree-vehicle';
          cItem.icon = cItem.idleStatus === '1' ? 'rm-tree-vehicle onlineStop' : 'rm-tree-vehicle';
          if (!cItem.online) {
            // cItem.icon = 'rm-tree-vehicle off';
            cItem.icon = cItem.idleStatus === '1' ? 'rm-tree-vehicle offlineStop' : 'rm-tree-vehicle off';
          }
        }
        if (item.children && item.children.length > 0) {
          cItem.children = this.setIcon(item.children);
        }
      });
      return data;
    },
    expandCamera(node, data) {
      if (this.treeType === '5') {
        const arr = data.filter(
          item => item.children && item.children.length > 0
        );
        if (node.level !== 0 && arr.length > 0) {
          arr.forEach(item => {
            setTimeout(() => {
              // setTimeOut为了规避HUI的缺陷
              this.$refs.resourceTree.expandNode(item.id);
            }, 0);
          });
        }
      }
    },
    expandRoot(node, list) {
      if (list.length > 0 && node.level === 0) {
        this.rootIndexCode = list[0][this.treeKey];
        if (!this.isNeedCheckBox && this.isSelectRoot) {
          this.$nextTick(() => {
            this.$refs.resourceTree.setCurrentKey(this.rootIndexCode);
            this.getTreeSelected();
          });
        }
      }
    },
    expandDefault() {
      if (this.firstLoad && this.selectOneNode !== '') {
        // [轨迹回放]默认需要勾选,继续展开
        this.$nextTick(() => {
          this.getTreePathArr(this.selectOneNode);
        });
        this.firstLoad = false;
      }
    },
    expandChild(node) {
      // node是HUI的树节点参数
      this.$refs.resourceTree.expandNode(node.data.id);
      node.childNodes.forEach(child => {
        setTimeout(() => {
          // setTimeOut为了规避HUI的缺陷
          this.expandChild(child);
        }, 0);
      });
    },
    expandAll(list) {
      if (this.isNeedCheckBox) {
        // 有多选框的时候才存在需要展开所有子节点的情况
        list.forEach(item => {
          setTimeout(() => {
            // setTimeOut为了规避HUI的缺陷
            this.$refs.resourceTree.expandNode(item.id);
            // 针对多媒体回放模块通道树的特殊处理
            if (
              this.treeType === '5' &&
              list.every(item1 =>
                item1.children.length === 0 ? true : !item1.children[0].parent
              )
            ) {
              this.getTreeSelected();
            }
          }, 0);
        });
        if (list.every(item => !item.parent)) {
          this.$nextTick(() => {
            if (this.isAllCompleted()) {
              this.getTreeSelected();
            }
          });
        }
      }
    },
    expandPath(node) {
      if (this.treePath.indexOf(node.data.id) !== this.treePath.length - 1) {
        // 还没完全展开
        this.$refs.resourceTree.expandNode(
          this.treePath[this.treePath.indexOf(node.data.id) + 1]
        );
      } else if (
        this.treePath.indexOf(node.data.id) ===
        this.treePath.length - 1
      ) {
        // 已经完全展开
        this.selectNodes(
          this.selectedResult ? this.selectedResult.id : this.selectOneNode
        );
        this.getTreeSelected();
        this.scrollCurrent(
          this.selectedResult ? this.selectedResult.id : this.selectOneNode
        );
      }
      this.expandCamera(node, node.data.children);
    },
    getTreeSelected() {
      this.$nextTick(() => {
        if (this.isNeedCheckBox) {
          // 有checkbox
          const checked = this.$refs.resourceTree
            .getCheckedNodes(true)
            .filter(item => item.isLeaf);
          this.$emit('getSelectedNodes', checked);
          this.selectedNode = checked;
        } else {
          const selected = this.$refs.resourceTree.getSelectedNode()
            ? [this.$refs.resourceTree.getSelectedNode().data]
            : [];
          this.$emit('deviceClick', selected);
        }
      });
    },
    selectNodes(id) {
      this.$nextTick(() => {
        if (this.isNeedCheckBox) {
          const ids = this.selectedNode.map(item => item.id).concat([id]);
          this.$refs.resourceTree.setCheckedKeys(ids);
        }
        this.$refs.resourceTree.setCurrentKey(id);
      });
    },
    clearSelectNodes () {
      this.selectedNode = []
      this.$refs.resourceTree.setCurrentKey(null)
    },
    getTreePathByNode(node) {
      this.isExpandPath = true;
      this.treePath = node.treePaths.split('@').filter(path => !!path);
      this.treePath.forEach(item => {
        const N = this.$refs.resourceTree.getNode(item);
        if (!N) {
          this.$refs.resourceTree.expandNode(item);
        } else {
          this.expandPath(N);
        }
      });
    },
    getTreePathArr(id) {
      // 车辆-vehicle 设备-ENCODE_DEVICE 驾驶员-driver 组织树-ORG 用户树-
      this.isExpandPath = true;
      let sourceType = 'vehicle';
      if (this.treeType === '1' || this.treeType === '6') {
        sourceType = 'ORG';
      } else if (this.treeType === '2') {
        sourceType = 'ENCODE_DEVICE';
      }
      const param = {
        indexCode: id,
        sourceType,
        searchResourceType: this.searchResourceType
      };
      getTreePath(param).then(json => {
        if (json) {
          this.treePath = json.data;
          // const unExpandNode = this.treePath.filter((item) => {
          //   const N = this.$refs.resourceTree.getNode(item);
          //   return !N || !N.expanded;
          // });
          // if (unExpandNode.length > 0) { // 需要展开父节点
          //   this.$refs.resourceTree.expandNode(unExpandNode[0]);
          // } else { // 父节点已经全部展开过
          //   this.selectNodes(id);
          //   this.getTreeSelected();
          //   this.scrollCurrent(this.selectedResult ? this.selectedResult.id : this.selectOneNode);
          // }
          this.treePath.forEach(item => {
            const N = this.$refs.resourceTree.getNode(item);
            if (!N) {
              this.$refs.resourceTree.expandNode(item);
            } else {
              this.expandPath(N);
            }
          });
        }
      });
    },

    loadChildren(node, resolve) {
      if (
        this.treeType === '5' &&
        node.level !== 0 &&
        node.data.children &&
        node.data.children.length > 0
      ) {
        const children = this.setIcon(node.data.children);
        resolve(children);
        return;
      }
      const treeParamNew = {
        treeCode: '0',
        checked: false,
        id: node.data[this.treeKey],
        isOnline: this.isOnline ? 1 : null
      };
      let p2 = null;
      if (this.treeType === '1') {
        p2 = getNewOrgTree(treeParamNew);
      } else if (this.treeType === '2') {
        treeParamNew.treatType = this.treatType;
        p2 = getDeviceTree(treeParamNew);
      } else if (this.treeType === '3') {
        treeParamNew.sourceType = 'vehicle';
        p2 = getVehicleTree(treeParamNew);
      } else if (this.treeType === '4') {
        // p2 = getUserTree(treeParamNew);
        p2 = getNewUserTree(treeParamNew);
      } else if (this.treeType === '5') {
        if (node.level !== 0) {
          treeParamNew.iconSkin = 'org';
        }
        treeParamNew.sourceType = 'vehicle';
        p2 = getVehicleCameraTree(treeParamNew);
      } else if (this.treeType === '6') {
        p2 = getOrgTree(treeParamNew);
      } else if (this.treeType === '7') {
        treeParamNew.sourceType = 'vehicle';
        p2 = getNonStandardVehicleTree(treeParamNew);
      }
      p2.then(json => {
        if (json.code === '0') {
          let list = json.data;
          if (this.treeType === '1') {
            list = json.data.map(item => {
              if (item.children) {
                item.children = item.children.map(child => {
                  return {
                    ...child,
                    isLeaf: !child.parent,
                    selectable: child.isAvailable
                  };
                });
              }
              return {
                ...item,
                isLeaf: !item.parent,
                selectable: item.isAvailable
              };
            });
          }

          const newNode = this.setIcon(list);

          // 根节点设置默认展开两个层级
          this.expandRoot(node, list);
          // 监控点树默认展开车辆节点
          this.expandCamera(node, newNode);
          this.$nextTick(() => {
            if (this.isExpandAll) {
              // 是否全部展开该节点
              this.expandAll(list);
            }
            if (this.isExpandPath) {
              // 是否展开节点的父节点们
              this.expandPath(node);
            }
          });
          // 是否需要默认全部展开
          this.expandDefault();
          resolve(newNode);
        } else {
          this.$message.warning(this.$t('GetResourceError'));
        }
      });
    },
    selectResult(node) {
      this.resetResult();
      this.selectedResult = node;
      this.getTreePathArr(node.id);
      // this.getTreePathByNode(node);
    },
    getOnline() {
      this.selectOneNode = '';
      this.isExpandAll = false;
      this.isExpandPath = false;
      // const selected = this.$refs.resourceTree.getSelectedNode() ? [this.$refs.resourceTree.getSelectedNode().data] : [];
      // if (selected.length > 0) {
      //   this.$refs.resourceTree.setSelected(selected.map(item => item.id)[0], false);
      // }
      // const checked = this.$refs.resourceTree.getCheckedNodes(true).filter(item => item.isLeaf);
      // if (checked.length > 0) {
      //   this.$refs.resourceTree.setCheckedKeys(['']);
      // }
      this.treeParam.isOnline = this.isOnline ? 1 : null;
      this.isShowTree = false;
      this.$nextTick(() => {
        this.isShowTree = true;
      });
      this.$emit('getSelectedNodes', []);
      // this.$refs.resourceTree.reload(this.rootIndexCode);
    },
    isAllCompleted() {
      // checkedId下面的节点全部展开
      const nodes = this.$refs.resourceTree.getNode(this.checkedId);
      let flag = true;
      const getChildren = children => {
        children.forEach(child => {
          if (child.childNodes.length === 0) {
            flag = flag && !!child.isLeaf;
          } else {
            getChildren(child.childNodes);
          }
        });
      };
      getChildren([nodes]);
      return flag;
    },
    scrollCurrent(id) {
      setTimeout(() => {
        const nodeArr = Array.from(
          document.getElementsByClassName('el-tree-node')
        );
        const nodeCurrent = nodeArr.filter(
          item => item.getAttribute('data-key') === id
        );
        if (nodeCurrent.length > 0) {
          const currentOffsetTop = nodeCurrent[0].offsetTop;
          // const treeHeight = document.getElementsByClassName('tree-body')[0].offsetHeight;
          const treeHeight = this.$refs.resourceTree.$el.clientHeight;
          const delta = currentOffsetTop - treeHeight / 2;
          this.$refs.resourceTree.$refs.scrollbar.setScroll(delta);
        }
      }, 100);
    }
  }
};
</script>
<style scoped>
.wrap {
  position: absolute;
}
.tree-wrap > * {
  width: 100%;
}
.tree-wrap,
.search-result-wrap {
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
}
.online-device {
  height: 40px;
  line-height: 40px;
}
.active {
  background: rgba(0, 0, 0, 0.08);
}
.tree-body {
  margin-top: 4px;
  width: 100%;
  position: absolute;
}
.borderTop {
  border-top: 1px solid #ccc;
}
.time-wrap {
  position: absolute;
  bottom: 40px;
  width: 100%;
}
.query-wrap,
.btns-wrap {
  position: absolute;
  bottom: 0px;
  width: 100%;
}

.btns-wrap {
  display: flex;
  justify-content: space-around;
}

.query-wrap .el-button--primary {
  width: 100%;
}
.query-wrap .el-button {
  max-width: 100% !important;
}
.time-wrap .el-input {
  width: 100%;
}
.size-16 {
  font-size: 16px;
}
.back-to-res {
  height: 40px;
  line-height: 40px;
}
.no-result-wrap {
  position: absolute;
  top: 40px;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
<style>
.search-result-wrap .el-scrollbar {
  position: absolute;
  top: 40px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  height: auto;
}
.search-result-wrap ul.query-list {
  padding-left: 0px !important;
  width: 100% !important;
}
.search-result-wrap ul.query-list li {
  display: block;
  padding-left: 8px;
  height: 32px;
  line-height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
}
.search-result-wrap ul.query-list li i {
  margin-right: 8px;
}
.search-result-wrap ul.query-list > li:hover {
  background-color: #f6f6f6;
}
.mb8 {
  margin-bottom: 8px;
}
.rm-tree-device,
.rm-tree-device-off {
  font-size: 20px;
}
.rm-tree-vehicle,
.rm-tree-vehicle-off {
  font-size: 20px;
}
.rm-tree-device-off,
.rm-tree-vehicle-off {
  color: #ccc;
}
.rm-tree-vehicle-of {
  color: #d10505;
}
.rm-tree-user {
  font-size: 20px;
}
.rm-tree-org {
  font-size: 20px;
}
.search-type {
  position: relative;
}
.search-type .el-select {
  width: 96px;
}
.search-type .el-autocomplete {
  width: 100%;
}
.popperClass {
  display: none;
}
</style>
