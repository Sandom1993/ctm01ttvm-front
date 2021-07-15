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
                            prop="eventTypeName"
                            label="报警类型"
                            width="100"
                        >
                            <template slot-scope="scope">
                                {{
                                    scope.row.eventTypeName
                                }}
                            </template>

                        </el-table-column>
                        <el-table-column
                            prop="broadcastContent"
                            label="内容"
                        ></el-table-column>

                        <el-table-column
                            width="480"
                            prop=""
                            label="下发方式"
                        >
                            <template slot-scope="scope">
                                <el-checkbox
                                    v-model="scope.row.onEmergent"
                                >
                                    紧急
                                </el-checkbox>

                                <el-checkbox
                                    v-model="scope.row.onTTS"
                                >
                                    终端TTS播报
                                </el-checkbox>

                                <el-checkbox
                                    v-model="scope.row.onTerminal"

                                >
                                    终端显示器显示
                                </el-checkbox>

                                <el-checkbox
                                    v-model="scope.row.onLED"
                                >
                                    广告屏显示
                                </el-checkbox>
                            </template>
                        </el-table-column>

                        <el-table-column
                            prop="status"
                            label="自动触警"
                            width="100"
                        >
                            <template slot-scope="scope">
                                <el-switch
                                    :width="43"
                                    v-model="scope.row.status"
                                    :active-value="1"
                                    :inactive-value="0"
                                    active-color="rgb(19,206,102)"
                                    inactive-color="#B9B9B9"
                                    @change="changeSwitch(scope.row)"/>
                            </template>
                        </el-table-column>

                        <el-table-column label="操作" width="100" fixed="right">
                            <template slot-scope="scope">
                                <el-button type="link" @click="editMaticAlarm(scope.row)">编辑</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                <el-pagination
                    ref="pagination"
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
                    <el-checkbox
                        v-model="checkForm.onEmergent"
                    >
                        紧急
                    </el-checkbox>

                    <el-checkbox
                        v-model="checkForm.onTTS"
                    >
                        终端TTS播报
                    </el-checkbox>

                    <el-checkbox
                        v-model="
                        checkForm.onTerminal"
                    >
                        终端显示器显示
                    </el-checkbox>

                    <el-checkbox
                        v-model="checkForm.onLED"
                    >
                        广告屏显示
                    </el-checkbox>
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
            checkList: [],
            tableData: [],
            status: 1,
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
            alist : [
                {
                    broadcastContent : 'neirnongaklshalkfjhaklsjhdfklajshdf',
                    eventType: 2,
                    id: 102,
                    onEmergent: 1,
                    onLED: 0,
                    onTTS: 1,
                    onTerminal: 0,
                    orgIndexCode: '54858754a5sdf5a4sdf9wefra2ds1f',
                    status: 1,
                    userId: 'admin'
                },
                {
                    broadcastContent : 'awer243wefrs中文中文',
                    eventType: 1,
                    id: 102,
                    onEmergent: 1,
                    onLED: 0,
                    onTTS: 1,
                    onTerminal: 1,
                    orgIndexCode: '54858754a5sdf5a4sdf9wefra2ds1f',
                    status: 0,
                    userId: 'admin'
                }
            ]
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
            this.$nextTick(() => {
                this.indexCode = data.indexCode
                console.log('treeLoad')
                this.handleQuery(this.indexCode);
            })
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
            console.log(params)
            // getDealStrategy(params).then(res => {
            //     if (res.code === '0') {
            //         this.total = res.data.total;
            //         this.tableData = res.data.list;
            //     }
            // });
            this.alist.forEach(item => {
                if (item.eventType === 0){
                    this.$set(item,'eventTypeName','超速')
                } else if (item.eventType === 1) {
                    this.$set(item,'eventTypeName','夜间禁行')
                } else if (item.eventType === 2) {
                    this.$set(item,'eventTypeName','疲劳驾驶')
                }

                this.$set(item, 'onLED', item.onLED === 1 ? true : false);
                this.$set(item, 'onEmergent', item.onEmergent === 1 ? true : false);
                this.$set(item, 'onTerminal', item.onTerminal === 1 ? true : false);
                this.$set(item, 'onTTS', item.onTTS === 1 ? true : false);

            })
            // console.log(this.alist)

            this.tableData = [...this.alist]
            console.log(this.tableData)
        },
        editMaticAlarm(row) {

            this.$set(row,'radio',row.status.toString());
            // this.$set(row,'onEmergent',row.onEmergent === 1 ? true : false);
            // this.$set(row,'onTerminal',row.onTerminal === 1 ? true : false);
            // this.$set(row,'onTTS',row.onTTS === 1 ? true : false);

            this.indexCode = row.orgIndexCode;
            this.checkForm = row;
            console.log(this.checkForm)
            this.dialogVisible = true ;
            // this.checkForm = row
        },
        // 保存
        handleOk() {
            console.log(this.status)
            // console.log(this.indexCode)
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
                status: this.status, // 是否启用：是1，否 0
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
        // 修改状态
        changeSwitch(row) {
            this.indexCode = row.orgIndexCode;
            this.status =row.status
            // this.handleOk();
        },
        onCurrentChange(pageNo) {
            this.pageNo = pageNo;
            this.handleQuery(this.indexCode);
        },
        onSizeChange(pageSize) {
            this.pageSize = pageSize;
            console.log('pageLoad')
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

    .el-checkbox+.el-checkbox{
        margin-left: 8px!important;
    }
    //.el-checkbox__inner:hover {
    //    cursor: not-allowed;
    //}
    //label.el-checkbox:hover {
    //    cursor: not-allowed;
    //}
}
</style>
