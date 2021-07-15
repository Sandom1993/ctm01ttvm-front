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
        <el-autocomplete
            v-model="filterText"
            :trigger-on-focus="false"
            placeholder="请输入关键字"
            :fetch-suggestions="querySearchAsync"
            @select="handleSelect"
        ></el-autocomplete>
        <div
            :style="'px;bottom:' + slotLine * 40 + 'px'"
            style="top: 32px; overflow: auto; position: absolute;left:0;right:0;"
        >
            <el-tree
                ref="resourceTree"
                default-icon="rm-tree-org"
                :show-checkbox="isNeedCheckBox"
                :data="dataWithIcon"
                :props="defaultProps"
                simple-data
                node-key="id"
                parent-key="parentId"
                lazy
                :load="loadChildren"
                @node-expand="handleExpandNode"
                @node-click="handleNodeClick"
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
</template>

<script>
import {getNewOrgTree, filterOrgByName, getTreePath} from '@/api/tree.js';

export default {
    name: 'OrgTree',
    props: {
        // 是否支持多选
        isNeedCheckBox: {default: true, type: Boolean},
        top: {default: 0, type: Number},
        left: {default: 0, type: Number},
        right: {default: 0, type: Number},
        bottom: {default: 8, type: Number},
        // slot行数--树的定位
        slotLine: {default: 0, type: Number}
    },
    data() {
        return {
            filterText: '',
            dataWithIcon: [],
            orgIndexCode: '',
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
        handleNodeClick(data) {
            // 点击树节点 add by chenying 2021.07.15
            this.$emit('deviceClick', data);
        },
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

            getNewOrgTree({
                treeCode: '0',
                id: node.data.id,
                checked: false
            }).then(json => {
                if (json.code === '0') {
                    // console.log(json.data)
                    if (json.data[0].parentId === '-1' && json.data[0].parent === true) {
                        // console.log(json.data[0].indexCode)
                        this.$emit('load',json.data[0])
                    }
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
                return node.childNodes.length === 0;
            });
            return arr;
        },
        getAllChecked() {
            return this.$refs.resourceTree.getCheckedNodes();
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
            filterOrgByName(consition).then(json => {
                if (json.code === '0') {
                    const {data} = json;
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
                sourceType: 'ORG',
                searchResourceType: 'ORG'
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
            const num = this.treePath.length - 2;
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
                this.$refs.resourceTree.setChecked(this.selectedResult.id, true);
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
    position: absolute;
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
</style>
