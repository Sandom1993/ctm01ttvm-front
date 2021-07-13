<template>
    <h-layout class="statistics-page">
        <h-layout-aside width="280px" class="left-bar">
            <org-tree
                ref="resourceTree"
                tree-key="indexCode"
                :top="8"
                :bottom="8"
                :left="8"
                :right="8"
                :slot-line="3"
                :is-need-check-box="isNeedCheckBox"
                :is-need-search-type="true"
                @deviceClick="handleSelectedNodes"
            >
            </org-tree>
        </h-layout-aside>
        <h-layout class="right-bar">
            <h-layout-header>
                <el-button icon="h-icon-add">
                    新增
                </el-button>
            </h-layout-header>
            <h-layout-content style="overflow: auto;">
                <el-table
                    :data="tableData"
                    force-scroll
                    highlight-current-row
                >
                    <el-table-column
                        prop=""
                        label="报警类型"
                    ></el-table-column>
                    <el-table-column
                        prop=""
                        label="内容"
                    ></el-table-column>
                    <el-table-column
                        prop=""
                        label="下发方式"
                    ></el-table-column>
                    <el-table-column
                        prop=""
                        label="自动触警"
                    ></el-table-column>
                    <el-table-column label="操作" width="100" fixed="right">
                        <template slot-scope="scope">
                            <el-button type="link" @click="editMaticAlarm(scope.row)">编辑</el-button>
                        </template>
                    </el-table-column>
                        <!--                    <el-table-column v-if="isRealtime" label="操作" width="100" fixed="right">-->
<!--                        <template slot-scope="scope">-->
<!--                            <el-button type="link" @click="onConfirmAlarm(scope.row)">确认</el-button>-->
<!--                            <el-button type="link" @click="onDealAlarm(scope.row)">处理</el-button>-->
<!--                        </template>-->
<!--                    </el-table-column>-->
                </el-table>
            </h-layout-content>
        </h-layout>
    </h-layout>
</template>

<script>
import OrgTree from '@/components/OrgTree';

export default {
    name: "AutomaticAlarm",
    props: {
        // 是否支持多选
        isNeedCheckBox: { default: false, type: Boolean },
    },
    components: {
        OrgTree,
    },
    data() {
        return {
            indexCode: '', // tree的indexCode
            tableData: {}
        }
    },
    created() {
        // this.$nextTick(() => {
        // })
    },
    methods: {
        handleSelectedNodes(node){
            // console.log(node.indexCode)
            this.indexCode = node.indexCode;
            if (this.indexCode === '' || this.indexCode === null) {
                this.$message({
                    type: 'warning',
                    message: '请至少选择一条数据'
                });
            } else {
                const params = {}
            }
        },
        editMaticAlarm(row){
            console.log(row)
        },
    },
}
</script>

<style lang="scss" scoped>
::v-deep {
}
</style>
