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
                <el-button icon="h-icon-add" @click="addMaticAlarm">
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
                            width="180"
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
                                    size="small"
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
            :area="[444, 450]"
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
                            v-for="item in alarmTypes"
                            :key="item.eventType"
                            :label="item.name"
                            :value="item.eventType"
                        ></el-option>
                    </el-select>
                </el-form-item>
                <div style="margin-bottom: 10px">告警处理</div>
                <el-form-item label="" prop="status">
                    <!-- 1-下发，0-不下发 -->
                    <el-radio
                        v-model="checkForm.status"
                        class="radio"
                        :label="'1'"
                        @change="radioChange"
                    >
                        下发
                    </el-radio>
                    <el-radio
                        v-model="checkForm.status"
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
                <el-form-item class="my-form-item" label="" prop="onEmergent">
                    <el-checkbox
                        v-model="checkForm.onEmergent"
                    >
                        紧急
                    </el-checkbox>
                </el-form-item>

                <el-form-item class="my-form-item" label="" prop="onTTS">
                    <el-checkbox
                        v-model="checkForm.onTTS"
                    >
                        终端TTS播报
                    </el-checkbox>
                </el-form-item>

                <el-form-item class="my-form-item" label="" prop="onTerminal">
                    <el-checkbox
                        v-model="checkForm.onTerminal"
                    >
                        终端显示器显示
                    </el-checkbox>
                </el-form-item>

                <el-form-item class="my-form-item" label="" prop="onLED">
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
import {getAllAlarmTypes, getDealStrategy, saveDealStrategy} from "@/api/alarm";

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
            // status: 1, // <!-- 1-开启，0-关闭 -->
            loading: false,
            dialogVisible: false,
            shouldSearch: false,
            tableHeight: null,
            tableWidth: null,
            alarmTypes:[],
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
            isChangeStatus: false,
            checkForm: {
                status: '1',
                eventType: '',
                onEmergent: 0,
                onTTS: 0,
                onTerminal: 0,
                onLED: 0,
            },
            // alist : [
            //     {
            //         broadcastContent : 'neirnongaklshalkfjhaklsjhdfklajshdf',
            //         eventType: 2,
            //         id: 102,
            //         onEmergent: 1,
            //         onLED: 0,
            //         onTTS: 1,
            //         onTerminal: 0,
            //         orgIndexCode: '54858754a5sdf5a4sdf9wefra2ds1f',
            //         status: 1,
            //         userId: 'admin'
            //     },
            //     {
            //         broadcastContent : 'awer243wefrs中文中文',
            //         eventType: 1,
            //         id: 102,
            //         onEmergent: 1,
            //         onLED: 0,
            //         onTTS: 1,
            //         onTerminal: 1,
            //         orgIndexCode: '54858754a5sdf5a4sdf9wefra2ds1f',
            //         status: 0,
            //         userId: 'admin'
            //     }
            // ]
        }
    },
    created() {
        getAllAlarmTypes().then(json => {
            if (json.code === '0') {
                this.alarmTypes = json.data;
            }
        });
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
            getDealStrategy(params).then(res => {
                if (res.code === '0') {
                    this.total = res.data.total;
                    res.data.list.forEach(item => {
                        this.alarmTypes.forEach(it => {
                            if (item.eventType === it.eventType) {
                                this.$set(item,'eventTypeName',it.name)
                            }
                        })

                        this.$set(item, 'onLED', item.onLED === 1 ? true : false);
                        this.$set(item, 'onEmergent', item.onEmergent === 1 ? true : false);
                        this.$set(item, 'onTerminal', item.onTerminal === 1 ? true : false);
                        this.$set(item, 'onTTS', item.onTTS === 1 ? true : false);

                    })
                    this.tableData = [...res.data.list];
                }
            });
        },
        // 编辑
        editMaticAlarm(row) {
            this.$set(row,'status',row.status.toString());
            this.indexCode = row.orgIndexCode;
            this.dialogVisible = true ;
            // this.isAdd = false ;
            this.checkForm = row ;
        },
        // 新增
        addMaticAlarm() {
            this.dialogVisible = true ;
            // this.isAdd = true;
            this.checkForm = {
                    status: '1',
                    eventType: '',
                    onEmergent: 0,
                    onTTS: 0,
                    onTerminal: 0,
                    onLED: 0,
            }
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
                status: this.checkForm.status, // 是否启用：是1，否 0
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
                // 刷新数据
                this.handleQuery(this.indexCode);
            });
        },
        //  关闭对话框
        handleClose() {
            this.$refs.saveStrategy.resetFields();
            // this.resetForm('saveStrategy');
            this.dialogVisible = false;
        },
        //  重置表格
        // resetForm(formName) {
        //     if (this.$refs[formName] !== undefined) {
        //         this.$refs[formName].resetFields();
        //     }
        // },
        radioChange(e) {
            this.isError = e === '0';
        },
        // 修改状态
        changeSwitch(row) {
            // if(this.isChangeStatus) {
                this.indexCode = row.orgIndexCode;
                this.checkForm = row;
                console.log(row.status)
            this.$nextTick(() => {
                const params ={
                    broadcastContent: row.broadcastContent,
                    eventType: parseInt(row.eventType),
                    status: row.status, // 是否启用：是1，否 0
                    orgIndexCode: row.orgIndexCode,
                    onLED: row.onLED === true ? '1' : '0',
                    onEmergent: row.onEmergent === true ? '1' : '0',
                    onTTS: row.onTTS === true ? '1' : '0',
                    onTerminal: row.onTerminal === true ? '1' : '0',
                }
                saveDealStrategy(params);
            })
            const that = this;
            setTimeout(function() {
                that.handleQuery(row.orgIndexCode);
            },3000)

        },
        handleBeforeChange(value) {
            this.$confirm('是否确认修改自动处警方式？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'question'
            })
                .then(() => {
                    // this.isChangeStatus = true;
                    this.changeSwitch();
                    done();
                })
                .catch(() => {});
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

<style>
.my-form-item{float: left; max-width: 120px;}
.my-form-item .el-form-item__content{
    max-width: 120px;
    float: left;
}
</style>
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
