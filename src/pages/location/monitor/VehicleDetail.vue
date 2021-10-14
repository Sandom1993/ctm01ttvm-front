<template>
    <div v-if="visible" ref="vehicleDetail" class="vehicle-detail">
        <div ref="title" class="title">
            <i class="h-icon-angle_left" @click="hideVehicleDetail"></i>
            <span>详情</span>
        </div>
        <div ref="header">
            <div class="info-item">
                <span class="info-label">所属单位</span>
                <span class="info-value">{{ vehicleOrgName }}</span>
            </div>
            <!--      <div class="info-item">-->
            <!--        <span class="info-label">车辆状态</span>-->
            <!--        <span class="info-value">{{ veDetails.status }}</span>-->
            <!--      </div>-->
            <div class="info-item">
                <span class="info-label">SIM卡号</span>
                <span class="info-value">{{ veDetails.simNo }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">设备号码</span>
                <span class="info-value">{{ veDetails.deviceActiveCode }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">车牌颜色</span>
                <span class="info-value">{{ getLicenseColor(veDetails.vehicleLicenseColor) }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">VIN码</span>
                <span class="info-value">{{ veDetails.vinNo }}</span>
            </div>
            <div class="info-item">
                <span class="info-label">通道数</span>
                <span class="info-value">{{ veDetails.cameraNum }}</span>
            </div>
        </div>
        <div>
            <el-tabs v-model="activeName" class="info-tab" @tab-click="handleClickTab">
                <!--        <el-tab-pane label="基础状态" name="1">-->
                <!--          <div class="info-item-wrap">-->
                <!--            <div class="info-item">-->
                <!--              <span class="info-label">VIN码</span>-->
                <!--              <span class="info-value"></span>-->
                <!--            </div>-->
                <!--            <div class="info-item">-->
                <!--              <span class="info-label">通道数</span>-->
                <!--              <span class="info-value">4</span>-->
                <!--            </div>-->
                <!--          </div>-->
                <!--          <div class="info-item">-->
                <!--            <span class="info-label">经纬度</span>-->
                <!--            <span class="info-value"></span>-->
                <!--          </div>-->
                <!--          <div class="info-item-wrap">-->
                <!--            <div class="info-item">-->
                <!--              <span class="info-label">设备号码</span>-->
                <!--              <span class="info-value">123123</span>-->
                <!--            </div>-->
                <!--            <div class="info-item">-->
                <!--              <span class="info-label">方向</span>-->
                <!--              <span class="info-value"></span>-->
                <!--            </div>-->
                <!--          </div>-->
                <!--&lt;!&ndash;          <div class="info-item-wrap">&ndash;&gt;-->
                <!--&lt;!&ndash;            <div class="info-item">&ndash;&gt;-->
                <!--&lt;!&ndash;              <span class="info-label">高度</span>&ndash;&gt;-->
                <!--&lt;!&ndash;              <span class="info-value"></span>&ndash;&gt;-->
                <!--&lt;!&ndash;            </div>&ndash;&gt;-->
                <!--&lt;!&ndash;            <div class="info-item">&ndash;&gt;-->
                <!--&lt;!&ndash;              <span class="info-label">油量</span>&ndash;&gt;-->
                <!--&lt;!&ndash;              <span class="info-value"></span>&ndash;&gt;-->
                <!--&lt;!&ndash;            </div>&ndash;&gt;-->
                <!--&lt;!&ndash;          </div>&ndash;&gt;-->
                <!--&lt;!&ndash;          <div class="info-item-wrap">&ndash;&gt;-->
                <!--&lt;!&ndash;            <div class="info-item">&ndash;&gt;-->
                <!--&lt;!&ndash;              <span class="info-label">车门</span>&ndash;&gt;-->
                <!--&lt;!&ndash;              <span class="info-value"></span>&ndash;&gt;-->
                <!--&lt;!&ndash;            </div>&ndash;&gt;-->
                <!--&lt;!&ndash;            <div class="info-item">&ndash;&gt;-->
                <!--&lt;!&ndash;              <span class="info-label">电路</span>&ndash;&gt;-->
                <!--&lt;!&ndash;              <span class="info-value"></span>&ndash;&gt;-->
                <!--&lt;!&ndash;            </div>&ndash;&gt;-->
                <!--&lt;!&ndash;          </div>&ndash;&gt;-->
                <!--          <div class="info-item-wrap">-->
                <!--            <div class="info-item">-->
                <!--              <span class="info-label">运营状态</span>-->
                <!--              <span class="info-value"></span>-->
                <!--            </div>-->
                <!--            <div class="info-item">-->
                <!--              <span class="info-label">超速状态</span>-->
                <!--              <span class="info-value">123123</span>-->
                <!--            </div>-->
                <!--          </div>-->
                <!--&lt;!&ndash;          <div class="info-item-wrap">&ndash;&gt;-->
                <!--&lt;!&ndash;            <div class="info-item">&ndash;&gt;-->
                <!--&lt;!&ndash;              <span class="info-label">超速状态</span>&ndash;&gt;-->
                <!--&lt;!&ndash;              <span class="info-value">123123</span>&ndash;&gt;-->
                <!--&lt;!&ndash;            </div>&ndash;&gt;-->
                <!--&lt;!&ndash;            <div class="info-item">&ndash;&gt;-->
                <!--&lt;!&ndash;              <span class="info-label">线路行驶</span>&ndash;&gt;-->
                <!--&lt;!&ndash;              <span class="info-value"></span>&ndash;&gt;-->
                <!--&lt;!&ndash;            </div>&ndash;&gt;-->
                <!--&lt;!&ndash;          </div>&ndash;&gt;-->
                <!--        </el-tab-pane>-->
                <!--        <el-tab-pane label="设备存储报警" name="2">-->
                <!--          <div class="info-item">-->
                <!--            <span class="info-label">信号丢失</span>-->
                <!--            <span class="info-value">123123</span>-->
                <!--          </div>-->
                <!--          <div class="info-item">-->
                <!--            <span class="info-label">信号遮挡</span>-->
                <!--            <span class="info-value">123123</span>-->
                <!--          </div>-->
                <!--          <div class="info-item">-->
                <!--            <span class="info-label">灾备存储</span>-->
                <!--            <span class="info-value">123123</span>-->
                <!--          </div>-->
                <!--          <div class="info-item">-->
                <!--            <span class="info-label">其他视频故障</span>-->
                <!--            <span class="info-value">123123</span>-->
                <!--          </div>-->
                <!--          <div class="info-item">-->
                <!--            <span class="info-label">录像达到存储阈值</span>-->
                <!--            <span class="info-value">123123</span>-->
                <!--          </div>-->
                <!--        </el-tab-pane>-->
                <!--        <el-tab-pane label="司机/运营" name="3">-->
                <!--          <div class="info-item">-->
                <!--            <span class="info-label">当前司机</span>-->
                <!--            <span class="info-value"></span>-->
                <!--          </div>-->
                <!--          <div class="info-item">-->
                <!--            <span class="info-label">司机工号</span>-->
                <!--            <span class="info-value"></span>-->
                <!--          </div>-->
                <!--          <div class="info-item">-->
                <!--            <span class="info-label">身份证号</span>-->
                <!--            <span class="info-value"></span>-->
                <!--          </div>-->
                <!--          <div class="info-item">-->
                <!--            <span class="info-label">发证日期</span>-->
                <!--            <span class="info-value"></span>-->
                <!--          </div>-->
                <!--          <div class="info-item">-->
                <!--            <span class="info-label">发证机构</span>-->
                <!--            <span class="info-value"></span>-->
                <!--          </div>-->
                <!--          <div class="info-item">-->
                <!--            <span class="info-label">从业资格</span>-->
                <!--            <span class="info-value"></span>-->
                <!--          </div>-->
                <!--          <div class="info-item">-->
                <!--            <span class="info-label">证件状态</span>-->
                <!--            <span class="info-value"></span>-->
                <!--          </div>-->
                <!--        </el-tab-pane>-->
                <el-tab-pane label="限速区域" name="1">
                    <div class="area-info-wrap">
                        <!--            <div class="info-item-wrap">-->
                        <!--              <div class="info-item">-->
                        <!--                <span class="info-label">是否启动分段限速</span>-->
                        <!--                <span class="info-value">已启用</span>-->
                        <!--              </div>-->
                        <!--              <div class="info-item">-->
                        <!--                <span class="info-label">默认限速值</span>-->
                        <!--                <span class="info-value">60 km/h</span>-->
                        <!--              </div>-->
                        <!--            </div>-->
                        <div class="info-item-wrap" style="margin-bottom: 16px">
                            <el-button icon="h-icon-add" @click="handleAdd">添加</el-button>
                        </div>
                        <!--            <div class="info-item-wrap">-->
                        <!--            </div>-->
                    </div>
                    <div class="table-box">
                        <el-table
                            v-loading="speedLoading"
                            :data="tableData"
                            style="width: 100%"
                            :height="tableHeight"
                        >
                            <el-table-column prop="shapeName" label="区域名称" show-overflow-tooltip>
                                <template slot-scope="scope">
                                    <span style="color: #1d73de">{{ scope.row.shapeName }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="limitSpeed" show-overflow-tooltip label="限速值（km/h）">
                                <template slot-scope="scope">
                                    <span>{{ scope.row.limitSpeed + ' km/h' }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column
                                prop="action"
                                label="操作"
                                width="100"
                            >
                                <template slot-scope="scope">
                                    <el-button
                                        icon="h-icon-edit"
                                        @click="handleEdit(scope.row)"
                                    />
                                    <el-button
                                        icon="h-icon-delete"
                                        @click="handleDelete(scope.row)"
                                    />
                                </template>
                            </el-table-column>
                        </el-table>
                        <el-pagination
                            ref="pagination"
                            style="margin-top: 8px"
                            :page-size="pageSize"
                            :current-page="pageNo"
                            layout="prev, pager, next, jumper"
                            :total="total"
                            @current-change="limitSpeedCurrentChange"
                        ></el-pagination>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="越线区域" name="2">
                    <div class="area-info-wrap">
                        <!--            <div class="info-item-wrap">-->
                        <!--              <div class="info-item">-->
                        <!--                <span class="info-label">是否启动分段限速</span>-->
                        <!--                <span class="info-value">已启用</span>-->
                        <!--              </div>-->
                        <!--              <div class="info-item">-->
                        <!--                <span class="info-label">默认限速值</span>-->
                        <!--                <span class="info-value">60 km/h</span>-->
                        <!--              </div>-->
                        <!--            </div>-->
                        <div class="info-item-wrap" style="margin-bottom: 16px">
                            <el-button icon="h-icon-add" @click="handleAdd">添加</el-button>
                        </div>
                    </div>
                    <div class="table-box">
                        <el-table
                            v-loading="speedLoading"
                            :data="tableData"
                            style="width: 100%"
                            :height="tableHeight"
                        >
                            <el-table-column prop="shapeName" label="区域名称" show-overflow-tooltip>
                                <template slot-scope="scope">
                                    <span style="color: #1d73de">{{ scope.row.shapeName }}</span>
                                </template>
                            </el-table-column>
                            <!--              <el-table-column prop="limitSpeed" show-overflow-tooltip label="限速值（km/h）">-->
                            <!--                <template slot-scope="scope">-->
                            <!--                  <span>{{ scope.row.limitSpeed + ' km/h' }}</span>-->
                            <!--                </template>-->
                            <!--              </el-table-column>-->
                            <el-table-column
                                prop="action"
                                label="操作"
                                width="100"
                            >
                                <template slot-scope="scope">
                                    <el-button
                                        icon="h-icon-edit"
                                        @click="handleEdit(scope.row)"
                                    />
                                    <el-button
                                        icon="h-icon-delete"
                                        @click="handleDelete(scope.row)"
                                    />
                                </template>
                            </el-table-column>
                        </el-table>
                        <el-pagination
                            ref="pagination"
                            style="margin-top: 8px"
                            :page-size="pageSize"
                            :current-page="pageNo"
                            layout="prev, pager, next, jumper"
                            :total="total"
                            @current-change="overlineCurrentChange"
                        ></el-pagination>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script>
import {pageFenceByVehicle, deleteFenceInfo} from '@/api/fence';
import {getVehicleDetail} from '@/api/location';

export default {
    name: 'VehicleDetail',
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        vehicleIndexCode: {
            type: String,
            default: ''
        },
        vehicleOrgName: {
            type: String,
            default: ''
        },
        vehicleInfo: {
            type: Object,
            default: () => {
                return {};
            }
        }
    },
    data() {
        return {
            activeName: '1',
            option: null,
            speedLoading: false,
            pageSize: 10,
            pageNo: 1,
            total: 0,
            ruleTypes: [],
            veDetails: {},
            tableHeight: 0,
            tableData: []
        };
    },
    watch: {
        vehicleIndexCode(value) {
            // TODO 加载车辆信息
            this.$nextTick(() => {
                if (this.visible) {
                    this.ruleTypes = [120, 121];
                    this.handleQuery();
                    this.getVehicleDetail();
                    this.resize();
                }
            });
        },
        visible(val) {
            // this.$nextTick(() => {
            //   if (val) {
            //     this.ruleTypes = [120, 121];
            //     this.handleQuery();
            //     this.getVehicleDetail();
            //     this.resize();
            //   }
            // });
        }
    },
    mounted() {
        window.addEventListener('resize', this.resize);
    },
    destroyed() {
        window.removeEventListener('resize', this.resize);
    },
    methods: {
        //  限速区域页码 change
        limitSpeedCurrentChange(pageNo) {
            if (this.activeName === '1') {
                this.pageNo = pageNo;
                this.handleQuery();
            }
        },
        //  越线区域页码 change
        overlineCurrentChange(pageNo) {
            if (this.activeName === '2') {
                this.pageNo = pageNo;
                this.handleQuery();
            }
        },
        getLicenseColor(val) {
            switch (val) {
                case 1:
                    return '蓝色';
                case 2:
                    return '黄色';
                case 3:
                    return '黑色';
                case 4:
                    return '白色';
                case 5:
                    return '绿色';
                case 9:
                    return '其他';
            }
        },
        getVehicleDetail() {
            const {vehicleIndexCode} = this;
            getVehicleDetail({vehicleIndexCode: vehicleIndexCode}).then(res => {
                this.veDetails = res.data;
            });
        },
        resize() {
            this.tableHeight = this.$refs.vehicleDetail.clientHeight - (this.$refs.title.clientHeight + this.$refs.header.clientHeight + 177);
        },
        handleClickTab(data) {
            switch (data.label) {
                case '限速区域':
                    this.ruleTypes = [120, 121];
                    this.handleQuery();
                    break;
                case '越线区域':
                    this.ruleTypes = [122, 123];
                    this.handleQuery();
                    break;
            }
        },
        handleAdd() {
            window.top.goToApp({
                url: '/brtfence-web/vehicle',
                name: '电子围栏'
            });
        },
        handleEdit(row) {
            window.top.goToApp({
                url: '/brtfence-web/vehicle',
                name: '电子围栏'
            });
        },
        handleQuery() {
            this.speedLoading = true;
            const {pageNo, pageSize, ruleTypes, vehicleIndexCode} = this;
            const params = {pageNo, pageSize, ruleTypes, vehicleIndexCode};
            pageFenceByVehicle(params).then(res => {
                if (res.code === '0') {
                    this.total = res.data.total;
                    this.tableData = res.data.list.map(item => {
                        item.ruleList.forEach(index => {
                            if (index.ruleType === 120) {
                                item.limitSpeed = index.rule.speed;
                            }
                        });
                        return item;
                    });
                    this.speedLoading = false;
                }
            });
        },
        handleDelete(r) {
            // console.log(r)
            // let ruleList ={};
            // r.ruleList.forEach( item => {
            //     ruleList = {
            //         shapeRuleType: item.shapeRuleType,
            //         ruleType: item.ruleType,
            //         shapeRuleIndexCode: item.shapeRuleIndexCode,
            //         rule: item.rule,
            //         vehicleIndexCodes: item.vehicleIndexCodes
            //     }
            // });
            const params = {
                shapeIndexCode: r.shapeIndexCode,
                shapeName: r.shapeName,
                shapeType: r.shapeType,
                ruleList: r.ruleList
            }
            // console.log(params)
            this.$confirm('是否确认解绑该电子围栏?', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'question'
            })
                .then(() => {
                    deleteFenceInfo(params).then(r => {
                        if (r.code === '0') {
                            this.$message({
                                type: 'success',
                                message: '解绑成功!'
                            });
                        }
                        this.handleQuery();
                    });
                })
                .catch(() => {
                    this.$message({
                        type: 'success',
                        message: '已取消解绑!'
                    });
                });
        },
        hideVehicleDetail() {
            this.$emit('update:visible', false);
        }
    }
};
</script>
<style lang="scss" scoped>
.vehicle-detail {
    font-size: 14px;
    position: absolute;
    left: 8px;
    bottom: 24px;
    top: 8px;
    width: 427px;
    background: #fff;
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.2);
    border-radius: 2px;
    z-index: 5;
    overflow: auto;
}

.title {
    line-height: 24px;
    padding: 12px 0;
    border-bottom: 1px solid #e8e8e8;
    margin-bottom: 19px;

    i {
        margin: 0 7px 0 10px;
        vertical-align: bottom;
        cursor: pointer;
    }
}

.info-item {
    display: flex;
}

.info-item-wrap {
    display: flex;

    .info-item {
        flex: 1;
    }
}

.info-label {
    display: inline-block;
    width: 70px;
    text-align: right;
    color: rgba(0, 0, 0, 0.4);
    margin: 0 16px 24px;
}

.info-value {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 16px;
}

.info-tab::v-deep {
    .el-tabs__header {
        margin-bottom: 24px;
    }

    .el-tabs__item {
        padding: 0 8px;
    }
}

.area-info-wrap {
    padding: 0 25px 0 34px;

    .info-item {
        flex: auto;
    }

    .info-label {
        margin-left: 0;
        width: auto;
    }

    .info-value {
        color: #368cf7;
    }
}

.table-box {
    padding: 0 16px;
    /*position: fixed;*/
    /*bottom: 24px;*/
}
</style>
