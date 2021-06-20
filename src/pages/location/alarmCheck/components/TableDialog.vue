<template>
    <el-dialog title="提示" :visible.sync="dialogVisible" size="small">
        你好啊
        <span slot="footer" class="dialog-footer">
      <el-button type="primary" @click="handleClose">确 定</el-button>
      <el-button @click="handleClose">取 消</el-button>
    </span>
    </el-dialog>
<!--    <el-dialog-->
<!--        :area="[dialogWidth, dialogHeight]"-->
<!--        size="small"-->
<!--        title="收货地址"-->
<!--        :visible.sync="dialogFormVisible"-->
<!--        :before-close="handleClose"-->
<!--    >-->
<!--        <div class="dialog-box">chieaohlkhadhceshi</div>-->
<!--&lt;!&ndash;        <el-form ref="form" label-position="top" :model="form" label-width="80px">&ndash;&gt;-->
<!--&lt;!&ndash;            <el-form-item label="活动名称">&ndash;&gt;-->
<!--&lt;!&ndash;                <el-input v-model="form.name" tips="123"></el-input>&ndash;&gt;-->
<!--&lt;!&ndash;            </el-form-item>&ndash;&gt;-->
<!--&lt;!&ndash;            <el-form-item label="活动区域">&ndash;&gt;-->
<!--&lt;!&ndash;                <el-select v-model="form.region" placeholder="请选择活动区域">&ndash;&gt;-->
<!--&lt;!&ndash;                    <el-option label="区域一" value="shanghai"></el-option>&ndash;&gt;-->
<!--&lt;!&ndash;                    <el-option label="区域二" value="beijing"></el-option>&ndash;&gt;-->
<!--&lt;!&ndash;                </el-select>&ndash;&gt;-->
<!--&lt;!&ndash;            </el-form-item>&ndash;&gt;-->
<!--&lt;!&ndash;        </el-form>&ndash;&gt;-->
<!--    </el-dialog>-->
</template>

<script>
export default {
    name: "TableDialog",
    props: {
        dialogVisible: {
            type: Boolean,
            default: function() {
                return false;
            }
        },
        rowData: {
            type: Object,
            default: function() {
                return {};
            }
        },
        tableHeight: {
            type: Number,
            default: function() {
                return 0;
            }
        },
        tableWidth: {
            type: Number,
            default: function() {
                return 0;
            }
        },
    },
    data() {
        return {
            dialogWidth: 0,
            dialogHeight: 0,
            // tableData:[]
        }
    },
    watch: {
        tableHeight(val) {
            this.dialogHeight = val * 0.75;
        },
        tableWidth(val) {
            this.dialogWidth = val * 0.75;
        },
    },
    created() {
        // console.log(this.rowData)
    },
    methods: {
        handleClose() {
            // this.map.destroy();
            // this.tableData = [];
            this.$emit('on-close');
        }
    }
}
</script>

<style scoped>

</style>
