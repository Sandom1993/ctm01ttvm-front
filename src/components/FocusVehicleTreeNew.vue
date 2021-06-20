<template>
  <div class="wrap">
    <div>
      <el-tree
        ref="resourceTree"
        default-icon="rm-tree-org"
        :show-checkbox="isNeedCheckBox"
        :data="treeData"
        :props="defaultProps"
        node-key="indexCode"
        default-expand-all
        @node-click="handleNodeClick"
        @check="treeCheck"
      ></el-tree>
    </div>
  </div>
</template>

<script>
import { getFocusVehicleList } from '@/api/alarm';

export default {
  name: 'FocusVeicleTree',
  props: {
    // 是否支持多选
    isNeedCheckBox: { default: false, type: Boolean },
  },
  data() {
    return {
      filterText: '',
      treeData: [],
      defaultProps: {
        children: 'children',
        label: 'name',
        icon: 'icon',
        isLeaf: 'isLeaf',
        expanded: 'expanded',
        disabled: 'disabled',
        checked: 'checked',
        indeterminate: 'indeterminate'
      }
    };
  },
  mounted() {
    this.loadData();
    this.$eventBus.$on('updateVehicleCollect', () => {
      this.loadData();
    });
  },
  methods: {
    loadData() {
      getFocusVehicleList().then(json => {
        if (json.code === '0') {
          this.treeData = [
            {
              name: '收藏车辆',
              isLeaf: false,
              children: json.data.map(item => {
                return {
                  ...item,
                  id: item.indexCode,
                  isLeaf: true,
                  icon:
                    item.status === 1
                      ? 'rm-tree-vehicle'
                      : 'rm-tree-vehicle off'
                };
              })
            }
          ];
        }
      });
    },
    handleNodeClick(data) {
      // 点击树节点
      if (data.isLeaf) {
        this.$emit('deviceClick', [data]);
      }
    },
    treeCheck() {
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
    // 清空当前选中节点，非多选
    cleanCheckedKey() {
      this.$refs.resourceTree.setCurrentKey(null)
    }
  }
};
</script>
<style scoped>
.wrap {
  height: 100%;
}
</style>
