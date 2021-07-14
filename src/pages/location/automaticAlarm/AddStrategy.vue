<template>
    <el-dialog
        title="提示"
        :visible.sync="dialogVisible"
        :area="[dialogWidth, dialogHeight]"
        top="10%"
        size="small"
        :before-close="handleClose"
    >

    </el-dialog>
</template>

<script>
export default {
    name: 'AddStrategy',
    components: {},
    data() {
        return {}
    },
    created() {
    },
    methods: {
        handleClose() {

        },
    },
}
</script>

<style lang="scss" scoped>
::v-deep {
}
</style>
