let map; // 地图对象
let vectorLayer; // 框选区域的图层
let markerLayer; // 打标记点的图层
let traceLayer; // 绘制轨迹的图层
// 初始化地图
export function initMap() {
  markerLayer = new HGIS.Layer.Vector('Markers');
  vectorLayer = new HGIS.Layer.Vector('Vector Layer');
  traceLayer = new HGIS.Layer.Vector('Vector Layer');
  const mapOption = {
    controls: [new HGIS.Control.Navigation({ autoActivate: false })],
    toolBox: {
      show: true
    },
    layers: [ markerLayer, vectorLayer, traceLayer ],
    mapLoaded() {
      const options = {
        map
      };
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
    markerLayer
  };
}

// 清空资源查询面板的地图
export function clearMap() {
  map.clear();
}
