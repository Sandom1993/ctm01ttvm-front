<template>
  <el-scrollbar
    wrap-style="height:100%;overflow-x:hidden;"
    view-style="padding-left:0;margin:0px;"
    tag="ul"
  >
    <li
      v-for="item in regions"
      :key="item.id + '_' + item.beginTime"
      style="margin-bottom:16px;"
    >
      <div class="wrap">
        <div class="line">
          <span class="name">
            {{ item.areaName }}
          </span>
          <span class="add-delete">
            <el-button icon="h-icon-add" @click="addRegion()"></el-button>
            <el-button
              icon="h-icon-delete"
              @click="deleteRegion(item.id)"
            ></el-button>
          </span>
        </div>
        <div class="line">
          选择范围
          <span class="required">
            *
          </span>
        </div>
        <div class="select-wrap">
          <div title="画矩形" class="draw-circle">
            <el-button
              :disabled="item.gpsPoints.length > 0"
              type="iconButton"
              icon="rm-square"
              @click="drawPolygonTrigger(item.id)"
            ></el-button>
          </div>
        </div>
        <div class="line">
          选择时段
          <span class="required">
            *
          </span>
        </div>
        <el-date-picker
          v-model="item.beginTime"
          placeholder="选中日期"
          type="datetime"
          @change="handleChangeTime"
        ></el-date-picker>
        <el-date-picker
          v-model="item.endTime"
          placeholder="选中日期"
          type="datetime"
          @change="handleChangeTime"
        ></el-date-picker>
      </div>
    </li>
  </el-scrollbar>
</template>
<script>
import { toTimezoneString } from '@/components/util.js';

export default {
  name: 'RegionRule',
  props: {
    regions: {
      type: Array,
      default: () => []
    },
    maxNum: {
      type: Number,
      default: 4
    },
    map: {
      type: Object,
      default: () => ({})
    },
    vectorLayer: {
      type: Object,
      default: () => ({})
    },
    modifyFeature: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      beginTime: '',
      endTime: '',
      control: null,
      id: null,
      regionArr: [], // 全部的规则
      featureMap: [], // 绘制的图形集合
      modifiedFeatureId: '' // 正在修改的featureId
    };
  },
  watch: {
    regions: {
      handler(val) {
        this.regionArr = val;
      },
      deep: true
    },
    vectorLayer(val) {
      if (val) {
        this.addModifyControl();
      }
    }
  },
  mounted() {
    this.regionArr = this.regions;
  },
  methods: {
    addModifyControl() {
      const modifyFeatureNew = new HGIS.Control.ModifyFeature(
        this.vectorLayer,
        {
          onModificationStart: this.getModifiedFeature,
          onModification: this.getNewFeature
        }
      );
      this.map.addControl(modifyFeatureNew);
      modifyFeatureNew.mode =
        HGIS.Control.ModifyFeature.RESIZE | HGIS.Control.ModifyFeature.DRAG;
      modifyFeatureNew.activate();
      this.$emit('update:modifyFeature', modifyFeatureNew);
    },
    // 修改图形
    getModifiedFeature(feature) {
      this.modifiedFeatureId = feature.id;
    },
    // 获取修改之后的图形
    getNewFeature(feature) {
      this.regionArr.forEach(item1 => {
        if (item1.geoId === this.modifiedFeatureId) {
          const points = feature.geometry.getVertices();
          const pointsArr = [];
          const arr = [];
          points.forEach(item => {
            const point = item.clone();
            pointsArr.push(
              point.transform(
                new HGIS.Projection('EPSG:900913'),
                new HGIS.Projection('EPSG:4326')
              )
            );
          });
          pointsArr.forEach(item => {
            arr.push({
              longitude: item.x * 360000,
              latitude: item.y * 360000
            });
          });
          const cItem = item1;
          cItem.gpsPoints = arr;
          cItem.geoId = feature.id;
        }
      });
      const cItem = this.featureMap.find(
        el => el.feature.id === this.modifiedFeatureId
      );
      cItem.feature = feature;
    },
    // 添加规则
    addRegion() {
      if (this.regionArr.length >= this.maxNum) {
        this.$message({
          type: 'warning',
          message: `最多只能添加${this.maxNum}个区域`
        });
        return;
      }
      const index = this.regionArr.length + 1;
      const region = {
        id: index,
        areaName: `区域${index}`,
        gpsPoints: [],
        beginTime: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          new Date().getDate(),
          new Date().getHours() > 1
            ? new Date().getHours() - 1
            : new Date().getHours(),
          new Date().getMinutes(),
          new Date().getSeconds()
        ),
        endTime: new Date()
      };
      this.regionArr.push(region);
      this.beginTime = this.getBeginTime(this.regionArr);
      this.endTime = this.getEndTime(this.regionArr);
      this.$emit('getRegions', this.regionArr, this.beginTime, this.endTime);
    },
    // 删除规则
    deleteRegion(index) {
      if (this.regionArr.length === 1) {
        this.$message({
          type: 'warning',
          message: '无法删除最后一个区域'
        });
        return;
      }
      this.regionArr.splice(index - 1, 1);
      this.beginTime = this.getBeginTime(this.regionArr);
      this.endTime = this.getEndTime(this.regionArr);
      this.regionArr.forEach((item, i) => {
        const cItem = item;
        cItem.id = i + 1;
        cItem.areaName = `区域${i + 1}`;
      });
      this.$emit('getRegions', this.regionArr, this.beginTime, this.endTime);
      this.deleteRegionHandler(index);
    },
    deleteRegionHandler(index) {
      if (this.modifyFeature) {
        this.modifyFeature.deactivate();
        this.modifyFeature.activate();
      }
      const feature = this.featureMap.filter(item => item.id === index);
      if (feature.length > 0) {
        this.vectorLayer.removeFeatures([feature[0].feature]);
        this.featureMap = this.featureMap.filter(item => item.id !== index);
        this.featureMap.forEach((item, i) => {
          const cItem = item;
          cItem.id = i + 1;
        });
      }
    },
    addFeature(feature) {
      const { id } = this;
      const points = feature.geometry.getVertices();
      const pointsArr = [];
      const arr = [];
      points.forEach(item => {
        const point = item.clone();
        pointsArr.push(
          point.transform(
            new HGIS.Projection('EPSG:900913'),
            new HGIS.Projection('EPSG:4326')
          )
        );
      });
      pointsArr.forEach(item => {
        arr.push({
          longitude: item.x * 360000,
          latitude: item.y * 360000
        });
      });
      this.regionArr[id - 1].gpsPoints = arr;
      this.regionArr[id - 1].geoId = feature.id;
      this.control.deactivate();
      this.map.drawControls.mouseTip.hide();
      this.beginTime = this.getBeginTime(this.regionArr);
      this.endTime = this.getEndTime(this.regionArr);
      this.$emit('getRegions', this.regionArr, this.beginTime, this.endTime);
      this.addFeatureHandler(this.id, feature);
    },
    addFeatureHandler(id, feature) {
      if (this.modifyFeature) {
        this.modifyFeature.deactivate();
        this.modifyFeature.activate();
      }
      this.featureMap = this.featureMap.filter(item => item.id !== id);
      this.featureMap.push({
        id,
        feature
      });
    },
    drawPolygonTrigger(id) {
      this.id = id;
      if (this.control !== undefined) {
        this.map.removeControl(this.control);
        this.map.stopdraw();
      }

      this.control = new HGIS.Control.DrawFeature(
        this.vectorLayer,
        HGIS.Handler.RegularPolygon,
        {
          handlerOptions: {
            sides: 4, // 条边
            irregular: true
          }
        }
      );
      this.map.drawControls.polygon = this.control;
      this.map.addControl(this.control);
      this.control.activate();

      const opts = { tipContent: '请在地图单击自由拖动绘制<br>释放结束绘制' };
      const mouseTip = new HGIS.Control.MouseTipControl(opts);
      this.map.drawControls.mouseTip = mouseTip;
      this.map.addControl(mouseTip);
      this.control.featureAdded = this.addFeature;
    },
    // 获取规则的最早时间
    getBeginTime(arr) {
      let d1 = new Date(arr[0].beginTime);
      for (let el of arr) {
        const d = new Date(el.beginTime);
        d1 = d.getTime() > d1.getTime() ? d : d1;
      }
      return toTimezoneString(d1);
    },
    // 获取规则的最晚时间
    getEndTime(arr) {
      let d1 = new Date(arr[0].endTime);
      for (let el of arr) {
        const d = new Date(el.endTime);
        d1 = d.getTime() > d1.getTime() ? d : d1;
      }
      return toTimezoneString(d1);
    },
    // 修改区域时间时响应修改所有规则的最早最晚时间
    handleChangeTime() {
      this.beginTime = this.getBeginTime(this.regionArr);
      this.endTime = this.getEndTime(this.regionArr);
      this.$emit('getRegions', this.regionArr, this.beginTime, this.endTime);
    }
  }
};
</script>
<style scoped>
.wrap {
  font-size: 12px;
}
.line {
  height: 32px;
  line-height: 32px;
}
.name {
  font-size: 14px;
}
.add-delete {
  float: right;
}
.el-date-editor.el-input {
  width: 100%;
  margin-bottom: 4px;
}
</style>
