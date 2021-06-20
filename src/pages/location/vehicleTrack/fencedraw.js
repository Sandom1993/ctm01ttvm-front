import { ruleType } from '../../fence/someTrans';
/**
 * 画多边形围栏
 * @param {*} fenceLayer 图层
 * @param {Array} pointList 点位
 * @param {Number} type 1 限速 2 越线
 */
function drawGeoFence(fenceLayer, pointList, type, info = null) {
  const geometryPoint = [];
  pointList.forEach(item => {
    geometryPoint.push(
      new HGIS.Geometry.Point(
        item.longitude / 360000,
        item.latitude / 360000
      ).transform(
        new HGIS.Projection('EPSG:4326'),
        new HGIS.Projection('EPSG:900913')
      )
    );
  });
  const polygonGeom = new HGIS.Geometry.Polygon([
    new HGIS.Geometry.LinearRing([...geometryPoint, geometryPoint[0]])
  ]);
  const color = type === 1 ? '#F69A98' : '#58A0F9';
  const polygonFeature = new HGIS.Feature.Vector(
    polygonGeom,
    {
      longitude: pointList[0].longitude,
      latitude: pointList[0].latitude,
      speedlimit: info.speed,
      name: info.name,
      type: ruleType(info.type)
    },
    {
      strokeColor: color,
      // strokeOpacity: 0.2,
      strokeWidth: 2,
      strokeLinecap: 'square',
      strokeDashstyle: 'solid',
      fillColor: color,
      fillOpacity: 0.2
    }
  );
  fenceLayer.addFeatures([polygonFeature]);
  // map.addLayer(fenceLayer);
  // 缩放地图到vecLayer图层的范围
  // map.zoomToExtent(vecLayer.getDataExtent());
}

/**
 *
 * @param {*} map 地图
 * @param {*} fenceLayer 图层
 * @param {Object} center 圆心
 * @param {Number} radius 半径
 * @param {Number} type 1 限速 2 越线
 */
function drawCircleFence(map, fenceLayer, center, radius, type, info) {
  const centerPoint = new HGIS.Geometry.Point(
    center.longitude / 360000,
    center.latitude / 360000
  ).transform(
    new HGIS.Projection('EPSG:4326'),
    new HGIS.Projection('EPSG:900913')
  );
  const color = type === 1 ? '#F69A98' : '#58A0F9';
  const callback = function(res) {
    // 圆绘制完成后的回调函数
    /* console.log("拖动后的半径为:" + res.radius);
    console.log("拖动后的圆为:" + res.circle);	 */
  };
  // 圓心样式
  const centerStyle = {
    graphicName: 'circle',
    pointRadius: 0,
    fillColor: '#0000ff'
  };
  // 拖拽点的点样式
  const dragPointStyle = {
    graphicName: 'square',
    pointRadius: 0,
    fillColor: '#0000ff',
    strokeColor: '#0000ff'
  };
  const circleStyle = {
    fillColor: color,
    strokeColor: color,
    fillOpacity: 0.2,
    strokeWidth: 2,
    longitude: center.longitude,
    latitude: center.latitude,
    speedlimit: info.speed,
    name: info.name,
    type: ruleType(info.type)
  };
  const options = {
    center: centerPoint,
    radius: radius,
    isDragCenter: true,
    map: map,
    circleStyle,
    callback: callback,
    centerStyle: centerStyle,
    dragPointStyle: dragPointStyle
  };
  // const pointList = [];
  // for (let i = 0; i < 360; i += 90) {
  //   pointList.push(
  //     new HGIS.Geometry.Point(
  //       (center.longitude + radius * Math.cos((2 * Math.PI * i) / 360)) / 360000,
  //       (center.latitude + radius * Math.sin((2 * Math.PI * i) / 360)) / 360000
  //     ).transform(
  //       new HGIS.Projection('EPSG:4326'),
  //       new HGIS.Projection('EPSG:900913')
  //     )
  //   );
  // }
  // const polygonGeom = new HGIS.Geometry.Polygon([
  //   new HGIS.Geometry.LinearRing(pointList)
  // ]);
  // const polygonFeature = new HGIS.Feature.Vector(polygonGeom, null, {
  //   strokeColor: 'blue',
  //   strokeOpacity: 0.5,
  //   strokeWidth: 3,
  //   strokeLinecap: 'square',
  //   strokeDashstyle: 'solid',
  //   fillColor: 'green',
  //   fillOpacity: 0.5
  // });
  // fenceLayer.addFeatures([polygonFeature]);
  // map.addLayer(fenceLayer);
  const movedCircle = new HGIS.Plot.MovedCircle(fenceLayer, options);
}

/**
 * 隐藏图层
 * @param {*} fenceLayer fence图层
 */
function hidFence(fenceLayer) {
  fenceLayer.setVisibility(false);
}

/**
 * 显示图层
 * @param {*} fenceLayer fence图层
 */
function showFence(fenceLayer) {
  fenceLayer.setVisibility(true);
}

export { drawGeoFence, hidFence, showFence, drawCircleFence };
