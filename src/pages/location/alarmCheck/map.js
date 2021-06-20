import Pop from './Pop.vue';
import Vue from 'vue';
import { getAddress, transLonLat } from '../monitor/maptools';
import { trackActive } from '../monitor/map';
let map; // 地图对象
let vectorLayer; // 框选区域的图层
let infoWindow; // 地图的pop框
// eslint-disable-next-line no-unused-vars
let isShowPopUp = false; // 地图上的popup是否显示
let markerLayer; // 打标记点的图层
let traceLayer; // 绘制轨迹的图层
let pointLayer; // 绘制点的图层
const PopConstructor = Vue.extend(Pop);
// 初始化地图
export function initMap() {
  markerLayer = new HGIS.Layer.Vector('Markers');
  vectorLayer = new HGIS.Layer.Vector('Vector Layer');
  traceLayer = new HGIS.Layer.Vector('Vector Layer');
  pointLayer = new HGIS.Layer.Vector('PointMarkers');
  // map.destroy()
  const mapOption = {
    controls: [new HGIS.Control.Navigation({ autoActivate: false })],
    toolBox: {
      show: true
    },
    layers: [ markerLayer, vectorLayer, traceLayer, pointLayer ],
    mapLoaded() {
      const options = {
        map
      };
      const zoomAnimation = new HGIS.Control.ZoomAnimation(options);
      map.addControl(zoomAnimation);
    }
  };
  map = new HGIS.MapEx('track-map', mapOption);

  // 声明比例尺控件 默认位置为地图左下角
  // const scaleLine = new HGIS.Control.ScaleLineEx({
  //   topOutUnits: '千米',
  //   topInUnits: '米',
  //   bottomOutUnits: '',
  //   bottomInUnits: ''
  // });
  // map.addControl(scaleLine);

  // 导航条
  // const panZoomBar = new HGIS.Control.PanZoomBarEx();
  // map.addControl(panZoomBar);

  // // 鹰眼
  // const oelement = document.getElementById('overview');
  // const ovsize = new HGIS.Size(160, 80);
  // const overViewMap = new HGIS.Control.OverviewMapEx({
  //   size: ovsize,
  //   element: oelement,
  //   minRectSize: 30,
  //   maximized: true
  // });
  // map.addControl(overViewMap);
  return {
    map,
    vectorLayer,
    traceLayer,
    pointLayer,
    markerLayer
  };
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
  infoWindow = undefined
  const anchor = {
    size: new HGIS.Size(0, 0),
    offset: new HGIS.Pixel(0, 0)
  };
  const titleHTML = `<div style="color: #333333;height: 36px;line-height: 36px;width: 100%;padding: 0 12px;display: flex;align-items: center;justify-content: space-between;border-bottom: 1px solid #e0e0e0;">
  <div style="font-size: 14px;font-family: 'Microsoft YaHei',serif;">${option.titleHTML} <span style="margin-left: 30px">${option.time}</span></div>
  <i id="m_closeInfoWindow" class="h-icon-close" style="cursor: pointer;" title="关闭"></i></div>`;
  const contentHtml =
    '<div id="m_infoWindow_wrap" class="m_infoWindow_wrap"></div>';
  const lonlat = transLonLat(
    new HGIS.LonLat(option.location[0], option.location[1])
  );
  infoWindow = new HGIS.Popup.InfoWindow(
    option.id,
    lonlat,
    new HGIS.Size(292, 398),
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
    // option.closeInfoWindow();
    closePopup()
  });

  // 获取地址
  // getAddress(option.location, 'deviceLocation');
}

// 清空资源查询面板的地图
export function clearMap() {
  map.clear();
}
