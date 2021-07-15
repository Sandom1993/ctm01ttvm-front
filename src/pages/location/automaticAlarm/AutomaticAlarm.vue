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
                @load="loadChildren"
                @deviceClick="handleSelectedNodes"
            >
            </org-tree>
        </h-layout-aside>
        <div ref="pageBox" class="page-box">
            <h-layout class="right-bar">
            <h-layout-header>
                <el-button icon="h-icon-add" @click="dialogVisible = true ">
                    新增
                </el-button>
            </h-layout-header>
            <h-layout-content style="overflow: auto;">
                    <el-table
                        :data="tableData"
                        :height="tableHeight - 130"
                        force-scroll
                        v-loading="false"
                        highlight-current-row
                    >
                        <el-table-column
                            prop="eventType"
                            label="报警类型"
                        ></el-table-column>
                        <el-table-column
                            prop="broadcastContent"
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
                <el-pagination
                    ref="pagination"
                    :page-sizes="[30, 50, 100]"
                    :page-size="pageSize"
                    :current-page="pageNo"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total"
                    @size-change="onSizeChange"
                    @current-change="onCurrentChange"
                ></el-pagination>
            </h-layout-content>
        </h-layout>
        </div>
        <el-dialog
            title="报警配置"
            top="middle"
            :visible.sync="dialogVisible"
            :area="[444, 500]"
            size="small"
            :before-close="handleClose"
        >
            <el-form
                ref="saveStrategy"
                label-position="top"
                :model="checkForm"
                label-width="90px"
                content-width="400px"
            >
                <div style="margin-bottom: 5px">警情类型</div>
                <el-form-item label="" prop="eventType">
                    <el-select
                        v-model="checkForm.eventType"
                        placeholder="请选择警情类型"
                    >
                        <el-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <div style="margin-bottom: 10px">告警处理</div>
                <el-form-item label="" prop="radio">
                    <!-- 1-下发，0-不下发 -->
                    <el-radio
                        v-model="checkForm.radio"
                        class="radio"
                        :label="'1'"
                        @change="radioChange"
                    >
                        下发
                    </el-radio>
                    <el-radio
                        v-model="checkForm.radio"
                        class="radio"
                        :label="'0'"
                        @change="radioChange"
                    >
                        不下发
                    </el-radio>
                </el-form-item>

                <div style="margin-bottom: 5px">下发内容</div>
                <el-form-item label="" prop="broadcastContent">
                    <el-input
                        v-model="checkForm.broadcastContent"
                        type="input"
                        tips-placement="right"
                        placeholder=""
                    ></el-input>
                </el-form-item>

                <div style="margin-bottom: 5px">下发方式</div>
                <el-form-item label="" prop="typeOn">
                    <el-checkbox v-model="checkForm.onEmergent">紧急</el-checkbox>
                    <el-checkbox v-model="checkForm.onTTS">终端TTS播报</el-checkbox>
                    <el-checkbox v-model="checkForm.onTerminal">终端显示器显示</el-checkbox>
                    <el-checkbox v-model="checkForm.onLED">广告屏显示</el-checkbox>
                </el-form-item>
            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="handleOk">
                  下 发
                </el-button>
                <el-button @click="handleClose">取 消</el-button>
            </span>
        </el-dialog>
    </h-layout>
</template>

<script>
import OrgTree from '@/components/OrgTree';
import {getDealStrategy, saveDealStrategy} from "@/api/alarm";

export default {
    name: "AutomaticAlarm",
    props: {
        // 是否支持多选
        isNeedCheckBox: {default: false, type: Boolean},
    },
    components: {
        OrgTree,
    },
    data() {
        return {
            pageNo: 1,
            pageSize: 10,
            total: 0,
            orgIndexCode:'',
            indexCode: '', // tree的indexCode
            tableData: [],
            loading: false,
            dialogVisible: false,
            shouldSearch: false,
            tableHeight: null,
            tableWidth: null,
            options: [
                {
                    value: 0,
                    label:
                        '超速'
                },
                {
                    value: 1,
                    label: '夜间禁行'
                },
                {
                    value: 2,
                    label: '疲劳驾驶'
                }
            ],
            checkForm:{
                radio: '1',
                eventType: '',
                typeOn: '',
                onEmergent: 0,
                onTTS: 0,
                onTerminal: 0,
                onLED: 0,
            },
        }
    },
    created() {
    },
    mounted() {
        this.resize();
        window.addEventListener('resize', this.resize);
    },
    destroyed() {
        window.removeEventListener('resize', this.resize);
    },
    methods: {
        loadChildren (data){
            this.indexCode = data.indexCode
            this.handleQuery(this.indexCode);
        },
        handleSelectedNodes(node) {
            this.indexCode = node.indexCode
            this.handleQuery(this.indexCode);
        },
        handleQuery (orgIndexCode){
            const params = {
                orgIndexCode: orgIndexCode,
                pageNo: this.pageNo,
                pageSize: this.pageSize
            }
            getDealStrategy(params).then(res => {
                if (res.code === '0') {
                    this.total = res.data.total;
                    this.tableData = res.data.list;
                }
            });
        },
        editMaticAlarm(row) {
            console.log(row)
            // this.checkForm = row
        },
        // 保存
        handleOk() {
            if (this.indexCode === '' || this.indexCode === null) {
                this.$message({
                    type: 'warning',
                    message: '请至少选择一条数据'
                });
                return false;
            }
            const params ={
                broadcastContent: this.checkForm.broadcastContent,
                eventType: parseInt(this.checkForm.eventType),
                // userId:
                status: '1', // 是否启用：是1，否 0
                orgIndexCode: this.indexCode,
                onLED: this.checkForm.onLED === true ? '1' : '0',
                onEmergent: this.checkForm.onEmergent === true ? '1' : '0',
                onTTS: this.checkForm.onTTS === true ? '1' : '0',
                onTerminal: this.checkForm.onTerminal === true ? '1' : '0',
            }
            saveDealStrategy(params).then( de => {
                if (de.code === '0') {
                    this.$message({
                        type: 'success',
                        message: '下发成功！'
                    });
                    // this.$refs.saveStrategy.handleClose();
                } else {
                    this.$message({
                        type: 'warning',
                        message: '下发失败！'
                    });
                    // this.$refs.saveStrategy.handleClose();
                }
                this.handleClose();
            });
        },
        //  关闭对话框
        handleClose() {
            this.resetForm('saveStrategy');
            this.dialogVisible = false;
        },
        //  重置表格
        resetForm(formName) {
            if (this.$refs[formName] !== undefined) {
                this.$refs[formName].resetFields();
            }
        },
        radioChange(e) {
            this.isError = e === '0';
        },
        onCurrentChange(pageNo) {
            this.pageNo = pageNo;
            this.handleQuery(this.indexCode);
        },
        onSizeChange(pageSize) {
            this.pageSize = pageSize;
            this.handleQuery(this.indexCode);
        },
        resize() {
            this.tableHeight = this.$refs.pageBox.clientHeight;
            this.tableWidth = this.$refs.pageBox.clientWidth;
        },
    },
}
</script>

<style lang="scss" scoped>
.page-box {
    width: 100%;
}
.statistics-page .right-bar{
    padding-left: 8px;
}
::v-deep {
    .el-form-item{
        margin-bottom: 15px;
    }

}
</style>
