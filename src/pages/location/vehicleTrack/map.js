let map; // 地图对象
let vectorLayer; // 框选区域的图层
let traceLayer; // 绘制轨迹的图层
let markerLayer; // 打标记点的图层
let trackMarkerLayer; // 轨迹上的marker图层
let fenceSpeedLimitLayer; // 用于展示超速围栏的图层
let fenceAreaLimitLayer; // 用于展示越界围栏的图层

// 初始化地图
export function initMap(that, indexCode) {
  vectorLayer = new HGIS.Layer.Vector('Vector Layer');
  traceLayer = new HGIS.Layer.Vector('Trace Layer');
  // trackMarkerLayer = new HGIS.Layer.Markers('Trace Marker Layer')
  markerLayer = new HGIS.Layer.Vector('Markers');
  trackMarkerLayer = new HGIS.Layer.Vector('Trace Marker Layer');
  fenceSpeedLimitLayer = new HGIS.Layer.Vector('fence speed Layer');
  fenceAreaLimitLayer = new HGIS.Layer.Vector('fence area Layer');
  const mapOption = {
    controls: [new HGIS.Control.Navigation({ autoActivate: false })],
    toolBox: {
      show: true
    },
    layers: [vectorLayer, traceLayer, trackMarkerLayer, markerLayer, fenceSpeedLimitLayer, fenceAreaLimitLayer],
    mapLoaded() {
      const options = {
        map
      };
      if (indexCode) {
        that.searchGps();
      }
      const zoomAnimation = new HGIS.Control.ZoomAnimation(options);
      map.addControl(zoomAnimation);
    }
  };
  map = new HGIS.MapEx('map', mapOption);

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
  return {
    map,
    vectorLayer,
    traceLayer,
    markerLayer,
    trackMarkerLayer,
    fenceSpeedLimitLayer,
    fenceAreaLimitLayer
  };
}

// 清空资源查询面板的地图
export function clearMap() {
  map.clear();
}
// 居中
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
