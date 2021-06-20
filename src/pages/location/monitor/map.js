import Vue from 'vue';
import Pop from './Pop.vue';
import {
  getAddress,
  transLonLat,
  testCluster,
  createTrace,
  addVectorFeatures,
  addVectorFeature
} from './maptools.js';
import {
  createAmapLayerXYZ,
  refresh,
  setTrafficLayerVisible
} from './trafficLayer.js';
import {
  getVehicleInfoMap,
  getVehicleInfo,
  resetVehicleInfoMap,
  getStatus,
  judgeStatus,
  refreshVehicleDot,
  clearVehicleInfo,
  closeVehicleJustUpdate
} from './vehicleInfo.js';

let map; // 地图对象
let vectorLayer; // 绘制轨迹的图层
let markerLayer; // 打标记点的图层
let resourceMarkerLayer; // 资源查询模块的图层  打标记点
let resourceVectorLayer; // 资源查询模块的图层
let label;
let mapOpt; // 地图配置参数
let infoWindow; // 地图的pop框
let selectFeature; // 定位监控的选择车辆事件
let isShowPopUp = false; // 地图上的popup是否显示

let modifyVectorLayer; // 过车查询模块的图层 修改图形

let features = []; // 批量播报存储feature vehicleIndexCode textTag
let control; // 批量播报

let framedCloud; // 轨迹回放的弹框
let trace; // 轨迹
const traceMarkers = []; // 轨迹上的marker

let modifyControl; // 过车查询的编辑控件
let drawControl; // 过车查询的绘制控件

const PopConstructor = Vue.extend(Pop);

// 初始化地图
export function initMap() {
  markerLayer = new HGIS.Layer.Markers('Markers');
  vectorLayer = new HGIS.Layer.Vector('Vector Layer');
  resourceMarkerLayer = new HGIS.Layer.Markers('Markers');
  resourceVectorLayer = new HGIS.Layer.Vector('Vector Layer');
  modifyVectorLayer = new HGIS.Layer.Vector('Vector Layer');
  const mapOption = {
    controls: [new HGIS.Control.Navigation({ autoActivate: false })],
    toolBox: {
      show: true
    },
    layers: [
      markerLayer,
      vectorLayer,
      resourceMarkerLayer,
      resourceVectorLayer,
      modifyVectorLayer
    ],
    mapLoaded() {
      const options = {
        map
      };
      const zoomAnimation = new HGIS.Control.ZoomAnimation(options);
      map.addControl(zoomAnimation);
      const AmaptrafficLayer = createAmapLayerXYZ();
      map.addLayers([AmaptrafficLayer]);
    }
  };
  map = new HGIS.MapEx('map', mapOption);

  label = new HGIS.Symbolizer.TextTag(map);

  // 测线测距
  mapOpt = new HGIS.Plot.MapOperate(map);

  // 声明比例尺控件 默认位置为地图左下角
  const scaleLine = new HGIS.Control.ScaleLineEx({
    topOutUnits: '千米',
    topInUnits: '米',
    bottomOutUnits: '',
    bottomInUnits: ''
  });
  map.addControl(scaleLine);

  // 导航条
  const panZoomBar = new HGIS.Control.PanZoomBarEx();
  map.addControl(panZoomBar);

  // 鹰眼
  const oelement = document.getElementById('overview');
  const ovsize = new HGIS.Size(160, 80);
  const overViewMap = new HGIS.Control.OverviewMapEx({
    size: ovsize,
    element: oelement,
    minRectSize: 30,
    maximized: true
  });
  map.addControl(overViewMap);
}
// 显示或者隐藏资源查询面板
export function setResourceLayerVisible(flag) {
  resourceMarkerLayer.setVisibility(flag);
  resourceVectorLayer.setVisibility(flag);
}
// 绑定地图的移动缩放事件
export function mapRegisterMove(onMoveend) {
  if (typeof onMoveend === 'function') {
    map.events.register('moveend', map, onMoveend);
  }
}

// 设置地图中心点
export function setMapCenter(gps) {
  const centerP = new HGIS.LonLat(
    gps.longitude / 360000,
    gps.latitude / 360000
  ).transform(
    new HGIS.Projection('EPSG:4326'),
    new HGIS.Projection('EPSG:900913')
  );
  map.setCenter(centerP);
}

// 删除vector图层上的数据
export function vectorLayerRemoveAll(f1, f2, f3) {
  if (modifyVectorLayer && f3) {
    modifyVectorLayer.removeAllFeatures();
  }
  if (vectorLayer && f1) {
    vectorLayer.removeAllFeatures();
  }
  if (resourceVectorLayer && f2) {
    resourceVectorLayer.removeAllFeatures();
  }
}

// 判断是否需要聚合
export function getIsCluster(clusterLevel) {
  return map.zoom > clusterLevel;
}

// 清空资源查询面板的地图
export function clearMap() {
  map.clear();
  resetVehicleInfoMap();
}

export function onlyClearMap() {
  map.clear();
}

// 资源查询面板选择车辆事件
export function openSelectFeature(onFeatureSelect) {
  if (selectFeature) {
    map.removeControl(selectFeature);
    selectFeature.destroy();
  }
  const callbacks = {
    click: f => {
      onFeatureSelect(f);
    }
  };
  selectFeature = new HGIS.Control.SelectFeature(resourceVectorLayer, {
    callbacks
  });
  map.addControl(selectFeature);
  selectFeature.activate();
}

// 删除地图上的点位
export function removeVectors(ids, clearData = true, clearPopup = false) {
  const featureArr = [];
  ids.forEach(item => {
    const info = getVehicleInfo(item);
    if (info) {
      if (info.vector) featureArr.push(info.vector);
      if (clearData) clearVehicleInfo(item);
      if (clearPopup && isShowPopUp && infoWindow.id.split('_')[1] === item) {
        closePopup();
      }
    }
  });
  resourceVectorLayer.removeFeatures(featureArr);
}
// 在地图vectorlayer上添加点位
export function addMapPoint(dataArr, vm) {
  // 不传dataArr则全量添加
  if (dataArr && dataArr.length > 0) {
    dataArr.forEach(item => {
      const status = getStatus(item.vehicleIndexCode)
        ? getStatus(item.vehicleIndexCode)
        : judgeStatus(item);
      const info = getVehicleInfo(item.vehicleIndexCode);
      if (info) {
        if (info.vector) resourceVectorLayer.removeFeatures(info.vector);
      }
      const { feature, tag } = addVectorFeature(
        item,
        status,
        resourceVectorLayer
      );
      refreshVehicleDot(item.vehicleIndexCode, feature, tag);
      // 是否刚更新状态
      if (!info.justUpdate) {
        return;
      }
      // 是更新过状态
      closeVehicleJustUpdate(item.vehicleIndexCode);
      // 移动 popup
      if (infoWindow && vm) {
        if (
          isShowPopUp &&
          infoWindow.id.split('_')[1] === item.vehicleIndexCode
        ) {
          vm.imgMarkerClick(item.vehicleIndexCode);
        }
      }
    });
  } else if (!dataArr) {
    const vehicleInfoMap = getVehicleInfoMap();
    const ids = Object.keys(vehicleInfoMap);
    ids.forEach(item => {
      if (vehicleInfoMap[item]) {
        const { feature, tag } = addVectorFeature(
          vehicleInfoMap[item].gps,
          vehicleInfoMap[item].status,
          resourceVectorLayer
        );
        refreshVehicleDot(item, feature, tag);
      }
    });
  }
}
export function trackActive() {
  document.getElementById('m_track').style.display = 'inline-block';
  document.getElementById('m_unTrack').style.display = 'none';
}
export function untrackActive() {
  document.getElementById('m_track').style.display = 'none';
  document.getElementById('m_unTrack').style.display = 'inline-block';
}
// 关闭popup
export function closePopup() {
  if (infoWindow) {
    infoWindow.hide();
    isShowPopUp = false;
    map.removePopup(infoWindow);
    infoWindow = null;
  }
}

function Popup(options) {
  const popConstructor = new PopConstructor({
    data: { option: options || {} }
  });
  document
    .getElementById('m_infoWindow_wrap')
    .appendChild(popConstructor.$mount().$el);
  return popConstructor;
}

// 打开popup
export function openPopup(option, vm) {
  const anchor = {
    size: new HGIS.Size(0, 0),
    offset: new HGIS.Pixel(0, 0)
  };

  const titleHTML = `${option.titleHTML}<i id="m_closeInfoWindow" class="h-icon-close" title="关闭"></i><i id="m_clearDot" class="rm-clear" title="清除" ></i>`;
  const contentHtml =
    '<div id="m_infoWindow_wrap" class="m_infoWindow_wrap"></div>';
  const lonlat = transLonLat(
    new HGIS.LonLat(option.location[0], option.location[1])
  );

  infoWindow = new HGIS.Popup.InfoWindow(
    option.id,
    lonlat,
    new HGIS.Size(350, 458),
    titleHTML,
    contentHtml,
    anchor,
    true,
    () => {}
  );
  map.addPopup(infoWindow);
  infoWindow.show();
  isShowPopUp = true;
  if (document.getElementById(infoWindow.id)) {
    document.getElementById(infoWindow.id).style.zIndex = 9999;
  }
  Popup(option);

  if (vm.isTracking !== option.vehicleIndexCode) {
    trackActive();
  }
  // 关闭
  document.getElementById('m_closeInfoWindow').addEventListener('click', () => {
    option.closeInfoWindow();
  });
  // 清除定位
  document.getElementById('m_clearDot').addEventListener('click', () => {
    infoWindow.hide();
    isShowPopUp = false;
    option.clearDot(option.vehicleIndexCode);
  });

  // 获取地址
  getAddress(option.location, 'deviceLocation');
}
// 执行聚合
export function getCluster() {
  resourceVectorLayer.removeAllFeatures();
  const vehicleInfoMap = getVehicleInfoMap();
  const ids = Object.keys(vehicleInfoMap);
  const gpsdataArr = [];
  ids.forEach(item => {
    if (vehicleInfoMap[item]) {
      gpsdataArr.push(vehicleInfoMap[item].gps);
    }
  });
  testCluster(resourceVectorLayer, gpsdataArr);
}
// 批量播报-添加点位
export function addPointWithoutPopup(dataArr, needLabel) {
  const featureArr = addVectorFeatures(dataArr, vectorLayer);
  if (needLabel) {
    const featureIds = featureArr.map(item => item.vehicleIndexCode);
    features = features
      .filter(item => featureIds.indexOf(item.id) === -1)
      .concat(featureArr);
  } else {
    const arr = features.map(item => item.feature);
    vectorLayer.removeFeatures(arr);
    features = featureArr;
  }
}
// 批量播报-删除点位
export function removeFeature(arr) {
  const arr1 = features.filter(item => arr.indexOf(item.vehicleIndexCode) > -1);
  vectorLayer.removeFeatures(arr1.map(item => item.feature));
  features = features.filter(item => arr.indexOf(item.vehicleIndexCode) === -1);
}
// 批量播报-绘制图形
export function drawFeature(type, onAddSquare) {
  switch (type) {
    case 1: // 圆
      control = new HGIS.Control.DrawFeature(
        vectorLayer,
        HGIS.Handler.RegularPolygon,
        {
          handlerOptions: {
            sides: 50, // 条边
            irregular: false
          }
        }
      );
      map.drawControls.circle = control;
      break;
    case 2: // 矩形
      control = new HGIS.Control.DrawFeature(
        vectorLayer,
        HGIS.Handler.RegularPolygon,
        {
          handlerOptions: {
            sides: 4, // 规则几何体的边数
            irregular: true
          }
        }
      );
      map.drawControls.rectangle = control;
      break;
    case 3: // 线
      control = new HGIS.Control.DrawFeature(vectorLayer, HGIS.Handler.Path);
      map.drawControls.polyline = control;
      break;
    case 4: // 多边形
      control = new HGIS.Control.DrawFeature(
        vectorLayer,
        HGIS.Handler.Polygon,
        {
          handlerOptions: {
            holeModifier: 'altKey'
          }
        }
      );
      map.drawControls.polygon = control;
      break;
    case 5: // 点
      control = new HGIS.Control.DrawFeature(vectorLayer, HGIS.Handler.Point);
      map.drawControls.point = control;
      break;
    default:
      break;
  }
  map.addControl(control);
  control.activate();

  const opts = { tipContent: '请在地图单击自由拖动绘制<br>释放结束绘制' };
  const mouseTip = new HGIS.Control.MouseTipControl(opts);
  map.drawControls.mouseTip = mouseTip;
  map.addControl(mouseTip);

  control.featureAdded = feature => {
    control.deactivate();
    map.drawControls.mouseTip.hide();
    onAddSquare(feature);
  };
}

// 轨迹回放-关闭轨迹点信息弹框
export function closePoint() {
  if (framedCloud) {
    framedCloud.hide();
    framedCloud.destroy();
    map.removePopup(framedCloud);
    framedCloud = null;
  }
}
// 轨迹回放 --打开轨迹点信息弹框
export function showPoint(param) {
  const contentHtml =
    '<div>' +
    `<div><span>时间 : </span> <span> ${param.time}</span><span style="float:right"><i id="m_closeFramedCloud" class="h-icon-close"></i></span></div>` +
    `<div><span>经度 : </span> <span> ${param.lon.toFixed(2)}</span></div>` +
    `<div><span>纬度 : </span> <span> ${param.lat.toFixed(2)}</span></div>` +
    `<div><span>速度 : </span> <span> ${param.speed}</span> km/h</div>` +
    `<div><span>方向角 : </span> <span> ${
      !param.direction || param.direction < 0 ? 0 : param.direction
    }°</span></div>` +
    '<div><span>位置 : </span> <span id="deviceLocation" style="vertical-align: middle;display:inline-block;width:216px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;"></span></div>' +
    '</div>';
  const lonlat = new HGIS.LonLat(param.lon, param.lat).transform(
    new HGIS.Projection('EPSG:4326'),
    new HGIS.Projection('EPSG:900913')
  );
  if (framedCloud) {
    framedCloud.setContentHTML(contentHtml);
    framedCloud.lonlat = lonlat;
    framedCloud.hide();
    framedCloud.show();
  } else {
    const anchor = new HGIS.Icon('', new HGIS.Size(0, 0), new HGIS.Pixel(0, 0));
    const popSize = new HGIS.Size(200, 200);
    framedCloud = new HGIS.Popup.FramedCloud(
      'FramedCloudId',
      lonlat,
      popSize,
      contentHtml,
      anchor,
      false,
      () => {}
    );
    map.addPopup(framedCloud);
  }
  // 获取地址
  const lonlat1 = [param.lon, param.lat];
  getAddress(lonlat1, 'deviceLocation');

  document
    .getElementById('m_closeFramedCloud')
    .addEventListener('click', () => {
      framedCloud.hide();
    });
}
// 轨迹回放 --清除轨迹
export function clearTrace(isStartTrace) {
  if (trace) {
    if (isStartTrace) {
      trace.stop();
    }
    trace.destory();
    trace = null;
  }
}
// 轨迹回放 --清空地图
export function traceClearMap(isStartTrace) {
  clearTrace(isStartTrace);
  vectorLayer.removeAllFeatures();
  label.removeAll();
  traceMarkers.forEach(item => {
    markerLayer.removeMarker(item);
  });
  closePoint();
}
export function addTrace(
  traceArr,
  interval,
  max,
  isShowTrackFirst,
  isCenter,
  depart,
  isShowAlarm,
  tracktoolbar
) {
  vectorLayer.removeAllFeatures();
  traceMarkers.forEach(item => {
    markerLayer.removeMarker(item);
  });
  if (trace) {
    trace.destory();
  }
  trace = createTrace(
    map,
    traceArr,
    interval,
    max,
    isShowTrackFirst,
    isCenter,
    depart,
    isShowAlarm,
    vectorLayer,
    markerLayer,
    traceMarkers,
    tracktoolbar,
    label
  );
}
// 轨迹的一些操作
export function restartTrace() {
  if (trace) {
    trace.restart();
  }
}
export function resumeTrace() {
  if (trace) {
    trace.resume();
  }
}
export function isCreateTrace() {
  return !!trace;
}
export function speedTrace(speedNum) {
  // flag -1-减速  1-加速
  trace.speed(speedNum);
}
export function pauseTrace() {
  if (trace) {
    trace.pause();
    return true;
  }
  return false;
}
export function stopTrace(isStart) {
  if (trace) {
    trace.stop();
    trace.speed(1);
    traceClearMap(isStart);
    return true;
  }
  return false;
}
export function startTrace() {
  if (trace) {
    trace.start();
    return true;
  }
  return false;
}

// 过车查询 -激活或者不激活编辑控件
export function setModifyContrl(flag) {
  if (modifyControl) {
    if (flag) {
      modifyControl.activate();
    } else {
      modifyControl.deactivate();
    }
  }
  modifyVectorLayer.setVisibility(true);
}
// 过车查询 -去查询结果页
export function hideModifyLayer() {
  vectorLayer.removeAllFeatures();
  modifyVectorLayer.setVisibility(false);
}
export function addModifyControls(getModifiedFeature, getNewFeature) {
  modifyControl = new HGIS.Control.ModifyFeature(modifyVectorLayer, {
    onModificationStart: getModifiedFeature,
    onModification: getNewFeature
  });
  map.addControl(modifyControl);
  modifyControl.mode =
    HGIS.Control.ModifyFeature.RESIZE | HGIS.Control.ModifyFeature.DRAG;
  modifyControl.activate();
}
export function addDrawContrls(addFeature) {
  if (drawControl !== undefined) {
    map.removeControl(drawControl);
    map.stopdraw();
  }

  drawControl = new HGIS.Control.DrawFeature(
    modifyVectorLayer,
    HGIS.Handler.RegularPolygon,
    {
      handlerOptions: {
        sides: 4, // 条边
        irregular: true
      }
    }
  );
  map.drawControls.polygon = drawControl;
  map.addControl(drawControl);
  drawControl.activate();

  const opts = { tipContent: '请在地图单击自由拖动绘制<br>释放结束绘制' };
  const mouseTip = new HGIS.Control.MouseTipControl(opts);
  map.drawControls.mouseTip = mouseTip;
  map.addControl(mouseTip);
  drawControl.featureAdded = addFeature;
}
export function finishDraw() {
  drawControl.deactivate();
  map.drawControls.mouseTip.hide();
}
export function resetModifyContrl() {
  if (modifyControl) {
    modifyControl.deactivate();
    modifyControl.activate();
  }
}

// 地图工具
export function measureDistance() {
  mapOpt.measureDistance();
  map.mapTip.setTipContent('单击确定位置,<br>双击结束绘制,<br>双按ESC退出测量');
}
export function measureArea() {
  mapOpt.measureArea();
  map.mapTip.setTipContent('单击确定位置,<br>双击结束绘制,<br>双按ESC退出测量');
}
export function refreshTrafficLayer() {
  setTrafficLayerVisible(false);
  refresh(map);
  setTrafficLayerVisible(true);
}
export function showTrafficLayer(flag) {
  if (flag) {
    refreshTrafficLayer();
  } else {
    setTrafficLayerVisible(false);
  }
}
