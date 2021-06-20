<template>
  <div v-clickoutside="handleClose" style="width:100%;position:relative">
    <div class="el-select">
<!--      <div ref="tags" class="el-select__tags" @click.stop="visible = !visible">-->
<!--        <transition-group-->
<!--          v-if="selected.length"-->
<!--          @after-leave="resetInputHeight"-->
<!--        >-->
<!--        </transition-group>-->
<!--      </div>-->
      <el-input
        v-if="selected.length > 0"
        ref="reference"
        v-model="selected[0].name"
        :class="{ 'is-icon-reverse': visible }"
        :placeholder="placeholder"
        :size="size"
        :disabled="false"
        :validate-event="false"
        suffix-icon="h-icon-angle_down_sm"
        readonly
        type="text"
        @mousedown.native="handleMouseDown"
        @click="iconClick"
      ></el-input>
      <el-input
        v-else
        ref="reference"
        :class="{ 'is-icon-reverse': visible }"
        :placeholder="placeholder"
        :size="size"
        :disabled="false"
        :validate-event="false"
        suffix-icon="h-icon-angle_down_sm"
        readonly
        type="text"
        @mousedown.native="handleMouseDown"
        @click="iconClick"
      ></el-input>
    </div>
    <div
      v-show="visible"
      :style="`width:100%;height:${menuHeight}px`"
      class="menu-content"
    >
      <tree
        ref="resourceTree"
        :tree-type="treeType"
        :bottom="8"
        :top="8"
        :left="8"
        :right="8"
        :is-need-check-box="isNeedCheckBox"
        :is-need-filter="isNeedFilter"
        :popper-class="true"
        @deviceClick="getDeviceClick"
      ></tree>
    </div>
  </div>
</template>

<script>
import clickoutside from 'hui/src/utils/clickoutside';
import Tree from '../../../components/Tree';

const sizeMap = {
  large: 42,
  small: 30,
  mini: 22
};

export default {
  name: 'DropDownTree',
  directives: { clickoutside },
  components: {
    Tree
  },
  props: {
    size: {
      type: String,
      default: 'small'
    },
    treeType: {
      type: String,
      default: '3' // 树的类型 1-组织树 2-设备树 3-车辆树 4-用户树
    },
    isNeedCheckBox: {
      // 是否多选
      type: Boolean,
      default: true
    },
    isNeedFilter: {
      // 是否需要搜索
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      selected: [],
      visible: false,
      placeholder: '请选择',
      inputwidth: 314,
      resourceTreeData: [],
      defaltProps: {
        children: 'children',
        label: 'name',
        icon: 'icon',
        isLeaf: 'isLeaf'
      },
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    };
  },
  computed: {
    menuHeight() {
      return this.isSimpleTree ? 330 : this.isNeedFilter ? 320 : 288;
    }
  },
  watch: {
    selected(val) {
      if (val.length === 0) {
        this.placeholder = '请选择';
      }
      this.$emit('input', this.selected);
    }
  },
  mounted() {},
  methods: {
    filter(value, data, node) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    iconClick() {
      this.visible = !this.visible;
      this.inputWidth = this.$refs.reference.offsetWidth;
    },
    handleMouseDown(event) {
      if (event.target.tagName !== 'INPUT') return;
      this.visible = !this.visible;
      this.inputWidth = this.$refs.reference.offsetWidth;
      event.preventDefault();
    },
    handleClose() {
      this.visible = false;
    },
    reset() {
      this.selected.splice(0, this.selected.length);
      if (this.isSimpleTree) {
        this.$refs.simpleTree.setCheckedNodes(this.selected);
      } else {
        // const { rootIndexCode } = this.$refs.resourceTree;
        // this.selected = [];
        this.$refs.resourceTree.$refs.resourceTree.setCheckedKeys(['']);
        this.$refs.resourceTree.$refs.resourceTree.setCheckedNodes([]);
        this.$refs.resourceTree.isExpandAll = false;
        // this.$refs.resourceTree.$refs.resourceTree.reload(rootIndexCode);
      }
    },
    getDeviceClick(node) {
      if (this.isNeedCheckBox) {
        return;
      }
      this.selected = node;
      this.placeholder = '';
      this.visible = false;
    }
  }
};
</script>

<style scoped>
.el-scrollbar {
  height: 288px !important;
}
.menu-content {
  max-height: 400px;
  position: absolute;
  z-index: 2001;
  background-color: white;
  border: solid 1px #e5e5e5;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 0 1px rgba(0, 0, 0, 0.1);
  margin: 4px 0px;
}

.no-data {
  padding: 10px 0;
  margin: 0;
  text-align: center;
  color: #999;
  font-size: 12px;
  line-height: 1.15;
}

.el-autocomplete {
  width: 248px;
  margin: 8px 8px;
}

.el-select__tags {
  white-space: nowrap;
  overflow: hidden;
  max-width: 238px;
}
</style>
<style>
.menu-content .el-tree {
  border: none;
}
.menu-content .el-input__icon {
  right: 4px;
}
.menu-content .el-checkbox.is-disabled {
  display: none;
}
.menu-content .el-input__inner {
  border-color: rgb(204, 204, 204);
}
.el-select .el-input {
  height: inherit;
}
.is-icon-reverse .h-icon-angle_down_sm {
  /* transform: translateY(-50%) !important; */
  transform: rotate(180deg) !important;
}
.el-input--small .el-input__inner {
  height: 32px;
}

.filter-tree-input {
  padding: 5px;
}
</style>
