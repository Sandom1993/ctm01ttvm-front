<template>
  <div class="wrap">
    <el-autocomplete
      v-model="filterText"
      :trigger-on-focus="false"
      :fetch-suggestions="querySearchAsync"
      @select="handleSelect"
    ></el-autocomplete>
    <div style="height:388px;">
      <el-tree
        ref="resourceTree"
        default-icon="rm-tree-org"
        :show-checkbox="true"
        :data="dataWithIcon"
        :props="defaultProps"
        simple-data
        node-key="id"
        parent-key="parentId"
        lazy
        :load="loadChildren"
        @node-expand="handleExpandNode"
      ></el-tree>
    </div>
  </div>
</template>

<script>
import {
  getVehicleTree,
  filterVehicleByName,
  getTreePath
} from '@/api/tree.js';

export default {
  name: 'TreeStatus',
  data() {
    return {
      filterText: '',
      dataWithIcon: [],
      defaultProps: {
        children: 'children',
        label: 'name',
        icon: 'icon',
        isLeaf: 'isLeaf',
        expanded: 'expanded',
        disabled: 'disabled',
        checked: 'checked',
        indeterminate: 'indeterminate'
      },
      isExpandPath: false,
      isExpandAll: false, // loadchildren时是否需要展开子节点的标记
      treePath: [] // 需要展开的父节点id,
    };
  },
  methods: {
    setIcons(data) {
      data.forEach(item => {
        const cItem = item;
        if (cItem.iconSkin === 'org') {
          cItem.icon = 'rm-tree-org';
        } else if (cItem.iconSkin === 'encode_device_on') {
          cItem.icon = 'rm-tree-device';
        } else if (cItem.iconSkin === 'user') {
          cItem.icon = 'rm-tree-user';
        } else if (cItem.iconSkin === 'camera') {
          cItem.icon = 'rm-tree-camera';
        } else if (cItem.iconSkin === 'encode_new_resources_on') {
          cItem.icon = 'rm-tree-vehicle';
          if (!cItem.online) {
            cItem.icon = 'rm-tree-vehicle off';
          }
        } else if (cItem.iconSkin === 'driver') {
          cItem.icon = 'rm-tree-driver';
        }
      });
      return data;
    },
    loadChildren(node, resolve) {
      const _this = this;
      getVehicleTree({
        treeCode: '0',
        id: node.data.id,
        sourceType: 'vehicle',
        isFocus: true,
        checked: false
      }).then(json => {
        if (json.code === '0') {
          const resNode = json.data.map(item => {
            if (item.children) {
              item.children = item.children.map(child => {
                return {
                  ...child,
                  isLeaf: !child.parent,
                  indeterminate: child.halfChecked
                };
              });
            }
            return {
              ...item,
              isLeaf: !item.parent,
              indeterminate: item.halfChecked
            };
          });
          const newNode = _this.setIcons(resNode);
          this.$nextTick(() => {
            if (this.isExpandPath) {
              // 是否展开节点的父节点们
              this.expandPath(node);
            }
          });
          const checkedNode = this.$refs.resourceTree.getCheckedNodes();
          const halfCheckedNode = this.$refs.resourceTree.getHalfCheckedNodes();
          let checkedNodeNew = newNode.filter(item => item.checked);
          let halfCheckedNodeNew = newNode.filter(item => item.halfChecked);
          newNode.forEach(item => {
            if (item.children) {
              checkedNodeNew = checkedNodeNew.concat(
                item.children.filter(item => item.checked)
              );
              halfCheckedNodeNew = halfCheckedNodeNew.concat(
                item.children.filter(item => item.halfChecked)
              );
            }
          });
          this.$nextTick(() => {
            this.$refs.resourceTree.setCheckedKeys(
              []
                .concat(checkedNode)
                .concat(checkedNodeNew)
                .map(item => item.id)
            );
            []
              .concat(halfCheckedNode)
              .concat(halfCheckedNodeNew)
              .forEach(item => {
                const Tnode = this.$refs.resourceTree.getNode(item.id);
                Tnode.indeterminate = true;
              });
          });
          resolve(newNode);
        } else {
          this.$message.warning('获取资源失败!');
        }
      });
    },
    getHalfChecked() {
      const halfChecked = this.$refs.resourceTree.getHalfCheckedNodes();
      const arr = halfChecked.filter(item => {
        const node = this.$refs.resourceTree.getNode(item.id);
        return item.parent && node.childNodes.length === 0;
      });
      return arr;
    },
    getChecked() {
      const checked = this.$refs.resourceTree.getCheckedNodes();
      const arr = checked.filter(item => {
        const node = this.$refs.resourceTree.getNode(item.id);
        return item.parent && node.childNodes.length === 0;
      });
      return arr;
    },
    getvehicle() {
      const checked = this.$refs.resourceTree.getCheckedNodes(true);
      return checked;
    },
    querySearchAsync(queryString, cb) {
      let result = [];
      this.totalList = [];
      const consition = {
        treeCode: '0',
        pageNo: 1,
        pageSize: 1000,
        searchName: queryString,
        searchType: 0
      };
      filterVehicleByName(consition).then(json => {
        if (json.code === '0') {
          const { data } = json;
          if (data && data.list && data.list.length > 0) {
            result = data.list.map(node => ({
              value: node.name,
              id: node.indexCode,
              checked: false
            }));
          }
          cb(result.length === 0 ? [] : result);
        }
      });
    },
    getTreePathArr(id) {
      // 车辆-vehicle 设备-ENCODE_DEVICE 驾驶员-driver 组织树-ORG 用户树-
      this.isExpandPath = true;
      const param = {
        indexCode: id,
        sourceType: 'vehicle',
        searchResourceType: 'vehicle'
      };
      getTreePath(param).then(json => {
        if (json) {
          this.treePath = json.data;
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
    handleExpandNode() {
      this.isExpandAll = false;
      this.isExpandPath = false;
    },
    expandPath(node) {
      const num = this.treePath.length - 1;
      this.$refs.resourceTree.expandNode(node.data.id);
      if (this.treePath.indexOf(node.data.id) !== num) {
        // 还没完全展开
        this.$refs.resourceTree.expandNode(
          this.treePath[this.treePath.indexOf(node.data.id) + 1]
        );
      } else if (this.treePath.indexOf(node.data.id) === num) {
        // 已经完全展开
        this.scrollCurrent(
          this.selectedResult ? this.selectedResult.id : this.selectOneNode
        );
      }
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
          const treeHeight = this.$refs.resourceTree.$el.clientHeight;
          const delta = currentOffsetTop - treeHeight / 2;
          this.$refs.resourceTree.$refs.scrollbar.setScroll(delta);
        }
        this.$refs.resourceTree.setSelected(this.selectedResult.id);
      }, 100);
    },
    handleSelect(node) {
      this.selectedResult = node;
      this.getTreePathArr(node.id);
    }
  }
};
</script>
<style scoped>
.wrap {
  height: 100%;
}
</style>
