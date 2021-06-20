<template>
  <div class="tree-wrap">
    <el-autocomplete
      v-model="keyword"
      :fetch-suggestions="querySearchAsync"
      :props="props"
      :placeholder="$t('请输入关键字')"
      :trigger-on-focus="false"
      :on-icon-click="handleTreeClick"
      :clear-icon-click="clearTreeClick"
      @select="handleSelect"
    >
      <i slot="suffix" class="el-input__icon h-icon-search"></i>
    </el-autocomplete>
    <div class="group-tree-wrap" :style="{ bottom: treeBottom + 'px' }">
      <el-tree
        ref="resourceTree"
        default-icon="rm-treeOrg"
        :show-checkbox="showCheckbox"
        :data="treeData"
        :props="defaultProps"
        simple-data
        node-key="id"
        parent-key="parentId"
        lazy
        :load="loadChildren"
        :default-expanded-keys="[rootIndexCode]"
        @node-click="handleNodeClick"
      ></el-tree>
    </div>
    <div class="buttonSearch">
      <span v-if="dateType">
        {{ $t('time') }}
        <span class="red">*</span>
      </span>
      <el-date-picker
        v-if="dateType == 4"
        v-model="date.date1"
        align="right"
        type="datetime"
        :placeholder="$t('SelectDate')"
        :picker-options="pickerOptions1"
        @change="returnTime"
      ></el-date-picker>
      <el-date-picker
        v-if="dateType == 4"
        v-model="date.date2"
        align="right"
        type="datetime"
        :placeholder="$t('SelectDate')"
        :picker-options="pickerOptions1"
        @change="returnTime"
      ></el-date-picker>
      <el-date-picker
        v-if="dateType == 1"
        v-model="date.date3"
        type="month"
        :placeholder="$t('SelectMonth')"
        @change="returnTime"
      ></el-date-picker>
      <el-date-picker
        v-if="dateType == 2"
        v-model="date.date4"
        type="daterange"
        :placeholder="$t('SelectRange')"
        @change="returnTime"
      ></el-date-picker>
      <el-date-picker
        v-if="dateType == 5"
        v-model="date.date5"
        type="daterange"
        :picker-options="pickerOptions"
        :placeholder="$t('SelectRange')"
        @change="returnTime"
      ></el-date-picker>
      <el-button v-if="hasSearch" type="primary" @click="search">
        {{ $t('Query') }}
      </el-button>
    </div>
  </div>
</template>
<script type="text/babel">
// 外传的参数
// url:资源树的地址
// type:资源树的类型,1,通道树 2设备树 3组织树
// showCheckbox:树是否有选择框
// dateType: 时间选择器的类型,4:双框具体到时分秒,1:具体到月,2:单框具体到时分秒,5只具体到天
// hasSearch: 是否有查询按钮
import '../../temp/icons/rm-icons.css';
import { getNewOrgTree, filterOrgByName } from '../api/tree.js';
export default {
  name: 'ResTree',
  props: [
    'url',
    'filterUrl',
    'type',
    'showCheckbox',
    'dateType',
    'hasSearch',
    'params',
    'moduleName'
  ],
  data() {
    return {
      rootIndexCode: '',
      treeBottom: 168, // 树距离底部的距离跟随模块而改变
      props: {
        label: 'name',
        value: 'name'
      },
      keyword: '',
      treeData: [],
      currentTree: [],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now() - 3600 * 1000 * 24;
        }
      },
      pickerOptions1: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },
      date: {
        date1: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          new Date().getDate(),
          0,
          0,
          0
        ),
        date2: new Date(),
        date3: '',
        date4: '',
        date5: [
          new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate() - 1,
            0,
            0,
            0
          ),
          new Date()
        ]
      },
      defaultProps: {
        children: 'children',
        label: 'name',
        icon: 'icon'
      },
      param: {
        treeCode: '0',
        checked: false,
        // userId:"admin",//正式删除
        id: '',
        iconSkin: ''
      },
      isExpandChildren: false // loadchildren时是否需要展开子节点的标记
    };
  },
  watch: {
    keyword: function() {
      if (this.keyword === '') {
        this.getTreeDate();
        // this.loadChildren ();
      }
    }
  },
  mounted() {
    switch (this.moduleName) {
      case 'deviceStatu':
      case 'remoteUp':
        this.treeBottom = 56;
        break;
      case 'simManger':
      case 'carManger':
        this.treeBottom = 8;
        break;
      case 'flowStatistic':
      case 'mileage':
        this.treeBottom = 130;
        break;

      default:
        break;
    }
  },
  methods: {
    handleSelect(item) {
      this.currentTree = [item];
      this.handleTreeClick();
      this.$refs.resourceTree.setCheckedKeys([item.id]);
    },
    getTreeDate() {
      this.param.id = '';
      this.param.iconSkin = '';

      const _this = this;
      const newNode = [];
      const org = 'rm-treeOrg';
      const leaf = 'org';
      const leafOff = 'rm-treeOrg';
      getNewOrgTree(_this.param)
        .then(data => {
          const list = data.data;
          list.forEach(item => {
            item.children.forEach(children => {
              const cChildren = children;
              cChildren.iconSkin = children.parent
                ? org
                : item.online
                ? leaf
                : leafOff;
              cChildren.isLeaf = !children.parent;
            });

            newNode.push({
              id: item.id,
              name: item.name,
              parentId: item.parentId,
              isLeaf: !item.parent,
              iconSkin: item.parent ? org : item.online ? leaf : leafOff,
              children: item.children ? item.children : [],
              deviceIndexCode: item.deviceIndexCode
                ? item.deviceIndexCode
                : ' ',
              indexCode: item.indexCode ? item.indexCode : ' ',
              isAvailable: true
            });
          });
          _this.rootIndexCode = list[0].id;
          _this.treeData = newNode;
        })
        .catch(err => {
          console.log(err);
        });
      // },
    },
    setIcon(data) {
      for (const key in data) {
        if (data[key].iconSkin === 'org') {
          data[key].icon = 'rm-treeOrg';
        } else if (data[key].iconSkin === 'encode_device_on') {
          data[key].icon = 'rm-tree_设备';
        } else if (data[key].iconSkin === 'camera') {
          data[key].icon = 'rm-tree_通道';
        } else if (data[key].iconSkin === 'encode_new_resources_on') {
          data[key].icon = 'rm-tree_车';
        }
        if (!data[key].parent) {
          data[key].isLeaf = true;
        }
        if (data[key].children.length) {
          this.setIcon(data[key].children);
        }
      }
      return data;
    },
    search() {
      let nodes;
      if (this.hasSearch) {
        nodes = this.$refs.resourceTree.getCheckedNodes();
      }
      this.returnTime();
      this.$emit('search-click', nodes);
      // 获取树的数据
    },
    handleTreeClick() {
      if (this.currentTree.length && this.keyword) {
        this.treeData = this.currentTree;
      } else if (this.keyword) {
        this.$message({
          showClose: true,
          message: this.$t('noSearchData'),
          type: 'warning'
        });
        this.treeData = [];
      } else {
        this.getTreeDate();
      }
    },
    clearTreeClick() {
      // 清除树搜索
    },
    handleNodeClick(data, node, tree, event) {
      this.$emit('tree-node-click', data);
    },
    // 返回时间
    returnTime() {
      this.$emit('getTime', this.date);
    },
    loadNode(node, resolve) {
      if (node.level !== 0) {
        this.param.id = node.key;
        this.param.iconSkin = node.data.iconSkin;
      }

      const _this = this;
      getNewOrgTree(_this.param)
        .then(data => {
          if (node.level === 0) {
            _this.rootIndexCode = data.data[0].id;
          }
          data = _this.setIcon(data.data);
          resolve(data);
        })
        .catch(err => {
          console.log(err);
        });
      // getTreeService.getTree({ url: this.url, param: this.param }, data => {
      //   if (node.level == 0) {
      //     this.rootIndexCode = data[0].id;
      //   }
      //   data = this.setIcon(data);
      //   resolve(data);
      // });
    },
    querySearchAsync(filterDeviceByName, cb) {
      if (!filterDeviceByName) return;
      const param = {
        treeCode: '0',
        searchName: filterDeviceByName || ''
      };
      // getTreeService.filterDeviceByName(
      //   { url: this.filterUrl, param: param },
      filterOrgByName(param).then(res => {
        if (res.code === '0') {
          const data = res.data;
          // data.list = this.setIcon(data.list);
          this.currentTree = data.list || [];
          if (data.list) {
            cb(data.list);
          } else {
            cb([]);
          }
        }
      });
    },
    loadChildren(node, resolve) {
      const treeParamNew = {
        treeCode: '0',
        checked: false,
        id: node.data.id,
        isOnline: this.isOnlineVehicle ? 1 : null
      };
      const newNode = [];
      const org = 'rm-treeOrg';
      const leaf = 'org';
      const leafOff = 'rm-treeOrg';
      // let p2 = null;
      // p2 = getOrgTree(treeParamNew);

      getNewOrgTree(treeParamNew).then(json => {
        if (json.code === '0') {
          const list = json.data;
          list.forEach(item => {
            item.children.forEach(children => {
              const cChildren = children;
              cChildren.iconSkin = children.parent
                ? org
                : item.online
                ? leaf
                : leafOff;
              cChildren.isLeaf = !children.parent;
            });
            newNode.push({
              id: item.id,
              name: item.name,
              parentId: item.parentId,
              isLeaf: !item.parent,
              iconSkin: item.parent ? org : item.online ? leaf : leafOff,
              children: item.children ? item.children : [],
              deviceIndexCode: item.deviceIndexCode
                ? item.deviceIndexCode
                : ' ',
              indexCode: item.indexCode ? item.indexCode : ' ',
              isAvailable: true
            });
          });
          // 是否全部展开完毕
          this.$nextTick(() => {
            if (this.isExpandChildren) {
              list.forEach(item => {
                setTimeout(() => {
                  // setTimeOut为了规避HUI的缺陷
                  this.$refs.resourceTree.expandNode(item.id);
                }, 0);
              });
              // if (list.every(item => !item.parent)) {
              // this.$nextTick(() => {
              // if (this.isCompleted()) {
              // if (this.selectOneNode !== '') { // 设置默认勾选的设备,并返回
              //   this.$refs.resourceTree.setCurrentKey(this.selectOneNode);
              //   const treeSelectedData = this.$refs.resourceTree.getSelectedNode();
              //   this.$emit('deviceClick', [treeSelectedData.data]);
              // } else {
              //   if (this.selectId.length > 0) { // 从查询结果页面返回到树的页面需要select的节点
              //     this.$refs.resourceTree.setCurrentKey(this.selectId[0]);
              //     this.selectId = [];
              //   }
              //   if (this.isNeedCheckBox) {
              //     const checked = this.$refs.resourceTree.getCheckedNodes(true).filter(item => item.isLeaf);
              //     this.$emit('getSelectedNodes', checked);
              //     this.selectedNode = checked;
              //   } else {
              //     const selected = this.$refs.resourceTree.getSelectedNode() ? [this.$refs.resourceTree.getSelectedNode().data] : [];
              //     this.$emit('deviceClick', selected);
              //   }
              // }
              // }
              // });
              // }
            }
          });
          // 是否需要默认全部展开
          // if (this.selectOneNode !== '') { // [轨迹回放]默认需要勾选,继续展开
          //   this.isExpandChildren = true;
          //   this.$nextTick(() => {
          //     this.expandedAllDefault();
          //   });
          // }
          // 设置默认展开两个层级
          if (node.level === 0) {
            this.rootIndexCode = list[0].id;
          }
          resolve(newNode);
        } else {
          this.$message({
            message: this.$t('获取资源失败'),
            type: 'warning'
          });
        }
      });
    }
  }
};
</script>
<style>
.tree-wrap {
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 0px;
}
.el-input__inner,
.el-input__inner:focus,
.el-input__inner:hover {
  border: 1px #dedede solid;
}
.tree-wrap .el-autocomplete {
  width: 100%;
}
.buttonSearch {
  position: absolute;
  bottom: 16px;
  left: 8px;
  right: 8px;
}
.buttonSearch .el-date-editor.el-input {
  width: 100%;
  margin-top: 12px;
}
.buttonSearch .el-button {
  width: 100%;
  margin-top: 12px;
  max-width: 1000px;
}
.group-tree-wrap {
  position: absolute;
  top: 32px;
  left: 0;
  right: 0;
  bottom: 168px;
}
.el-tree-node__content .el-tree-node__icon {
  font-size: 20px;
}
</style>
