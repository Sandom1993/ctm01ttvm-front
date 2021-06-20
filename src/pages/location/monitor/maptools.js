import Vue from 'vue';
import HUI from 'hui';
import mapStart from '../../../assets/png/map-start.png';
import mapAlarm from '../../../assets/png/map-alarm.png';
import mapEnd from '../../../assets/png/map-end.png';
import mapVehicle from '../../../assets/png/map-vehicle.png';
import mapVehicleRight from '../../../assets/png/map-vehicle-right.png';
import point from '../../../assets/png/point.png';
import offlinePic from '../../../assets/png/vehicle-offline.png';
import alarmPic from '../../../assets/png/vehicle-alarm.png';
import lowSpeedPic from '../../../assets/png/vehicle-lowspeed.png';
import licenseBlue from '../../../assets/png/license-blue.png';
import licenseGray from '../../../assets/png/license-gray.png';
import licenseOrange from '../../../assets/png/license-orange.png';
import { findAlarmPage } from '../../../api/location.js';
import { getAlarmTypeTree } from '../../../api/tree.js';
import clusterPic from '../../../assets/png/cluster.png';
import inverseClusterCenter from '../../../assets/png/inverseClusterCenter.gif';
import { toTimeNormalString } from '../../../components/util.js';

Vue.use(HUI);

let alarmArr = [];

export function getAlarmTree() {
  getAlarmTypeTree({ categories: [1, 2, 3, 4, 5, 6, 7] }).then(json => {
    if (json.code === '0') {
      const { data } = json;
      const arr = [];
      data.forEach(item => {
        arr.push({
          id: parseInt(item.id, 10),
          name: item.name
        });
        item.children.forEach(child => {
          arr.push({
            id: parseInt(child.id, 10),
            name: child.name
          });
        });
      });
      alarmArr = arr;
    }
  });
}

function getAlarmName(type) {
  const alarm = alarmArr.filter(item => item.id === type);
  return alarm.length > 0 ? alarm[0].name : `${type}`;
}

/**
 * LonLat转xy
 */
export function transLonLat(lonLat) {
  return lonLat.transform(
    new HGIS.Projection('EPSG:4326'),
    new HGIS.Projection('EPSG:900913')
  );
}

/**
 * xy转LonLat
 */
export function deTransLonLat(xy) {
  return xy.transform(
    new HGIS.Projection('EPSG:900913'),
    new HGIS.Projection('EPSG:4326')
  );
}

/**
 * 执行聚合
 */
export function testCluster(layer, lonlatArr) {
  // 生成聚合数据
  const vectors = [];
  lonlatArr.forEach(item => {
    if (item && item.longitude && item.latitude) {
      const geom = transLonLat(
        new HGIS.Geometry.Point(item.longitude / 360000, item.latitude / 360000)
      );
      const vector = new HGIS.Feature.Vector(geom);
      vectors.push(vector);
    }
  });
  const options = {
    // 单点样式
    separateStyle: {
      externalGraphic: clusterPic,
      graphicWidth: 40,
      graphicHeight: 40
    },
    // 聚合点样式
    inverseCenterStyle: {
      externalGraphic: inverseClusterCenter,
      graphicWidth: 60,
      graphicHeight: 60
    },
    isCenter: false, // 聚合点是否在聚合网格的中心位置
    clusterSize: 150, // 聚合网格大小
    isShowGrid: false // 是否显示聚合网格
  };
  const cluster = new HGIS.Cluster.Cluster(layer, vectors, options);
  // 執行聚合操作
  cluster.excute();
  return cluster;
}

/**
 * 根据经纬度获取地址信息
 */
export function getAddress(lonlat, str, cb) {
  let geocoder = null;
  if (!geocoder) {
    geocoder = new AMap.Geocoder({
      radius: 1000 // 范围
    });
  }
  geocoder.getAddress(lonlat, (status, result) => {
    if (status === 'complete' && result.regeocode) {
      const address = result.regeocode.formattedAddress;
      if (cb) {
        cb(address);
      }
      if (str) {
        document.getElementById(str).innerHTML = address;
        document.getElementById(str).title = address;
      }
      return address;
    }
    return '';
  });
}

/**
 * 生成marker gps:设备上报的经纬度
 */
export function createMarker(markerLayer, gps, status) {
  // status -0:离线 -1:在线 -2:告警 -3:低速
  let pic = mapVehicle;
  if (status === 0) {
    pic = offlinePic;
  } else if (status === 2) {
    pic = alarmPic;
  } else if (status === 3) {
    pic = lowSpeedPic;
  }
  const size = new HGIS.Size(40, 40);
  const offset = new HGIS.Pixel(-(size.w / 2), -(size.h / 2));
  const icon = new HGIS.Icon(pic, size, offset);
  const lonlat = transLonLat(
    new HGIS.LonLat(gps.longitude / 360000, gps.latitude / 360000)
  );
  const marker = new HGIS.Marker(lonlat, icon.clone());
  markerLayer.addMarker(marker);
  return marker;
}

/**
 * 给marker旋转方向
 * @param {*} id 要设置旋转的marker的id
 * @param {*} direction 旋转的方向角
 */
export function setMarkerRotation(id, direction) {
  const obj = document.getElementById(`${id}_innerImage`);
  if (obj) {
    try {
      obj.style = `position: relative;width: 40px;height: 40px;
            -webkit-transform: rotate(${direction}deg);
            -ms-transform: rotate(${direction}deg);`;
    } catch (exception) {
      obj.style.msTransform = `rotate(${direction}deg);`;
      obj.style.cssText = `position: relative;width: 40px;height: 40px;
          -ms-transform:rotate(${direction}deg);`;
    }
  }
}

/**
 *
 * @param {*} lonlat lonlat类型的经纬度
 * @param {*} text 要显示的文字
 * @param {*} label new HGIS.Symbolizer.TextTag
 */
export function createTextTag(lonlat, text, label) {
  const tagId = HGIS.Util.createUniqueID('TextTagId_');
  const style = {
    fontSize: '12px',
    fontFamily: 'Microsoft YaHei;',
    fontStyle: 'normal',
    textAlign: 'center',
    fontColor: '#000',
    height: '14px',
    width: 'auto'
  };
  const tag = label.create(tagId, lonlat, text, true, style);
  return tag;
}

/**
 *
 * @param {*} gps 接口或者websocket返回的gps对象
 * @param {*} status -0:离线 -1:在线 -2:告警 -3:低速 4-无定位
 * @param {*} vectorLayer 资源查询面板的vectorLayer resourceVectorLayer
 */
export function addVectorFeature(gps, status, vectorLayer) {
  let pic;
  let labelBkgColor;
  switch (status) {
    case 4:
    case 0:
    default:
      pic = offlinePic;
      labelBkgColor = '#8A8A8A';
      break;
    case 1:
      pic = mapVehicle;
      labelBkgColor = '#2080F7';
      break;
    case 2:
      pic = alarmPic;
      labelBkgColor = '#F54646';
      break;
    case 3:
      pic = lowSpeedPic;
      labelBkgColor = '#EA8824';
      break;
  }
  const style = {
    externalGraphic: pic,
    graphicWidth: 40,
    graphicHeight: 40,
    graphicXOffset: -20,
    graphicYOffset: -20,
    graphicZIndex: 11111,
    rotation: parseInt(gps.direction / 100, 10),
    // fontColor: '#333',
    label: gps.vehicleLicensePlate,
    labelAlign: 'ct',
    labelXOffset: 0,
    labelYOffset: -30,
    labelBorderColor: labelBkgColor,
    fontColor: '#fff',
    // backgroundGraphic: licenseBlue,
    labelBackgroundColor: labelBkgColor, // '#FEFDFB',
    labelBorderSize: 1
  };
  let feature = null;
  if (gps.longitude && gps.latitude) {
    const lonlat = transLonLat(
      new HGIS.LonLat(gps.longitude / 360000, gps.latitude / 360000)
    );
    const geometry = new HGIS.Geometry.Point(lonlat.lon, lonlat.lat);
    feature = new HGIS.Feature.Vector(geometry, { gps, status }, style);
    vectorLayer.addFeatures(feature);
  }
  return { feature };
}

/**
 *
 * @param {Array} dataArr 包含经纬度的信息
 * @param {*} vectorLayer new HGIS.Layer.Vector
 */
export function addVectorFeatures(dataArr, vectorLayer) {
  const arr = [];
  const features = [];
  for (let i = 0; i < dataArr.length; i += 1) {
    const style = {
      externalGraphic: mapVehicle,
      graphicWidth: 40,
      graphicHeight: 40,
      graphicXOffset: -20,
      graphicYOffset: -20,
      graphicZIndex: 11111,
      rotation: parseInt(dataArr[i].direction / 100, 10),
      label: dataArr[i].vehicleLicensePlate,
      labelAlign: 'lm',
      labelXOffset: 24,
      labelYOffset: 0,
      fontColor: '#333',
      labelBorderColor: '#ccc',
      labelBackgroundColor: 'rgba(255,255,255, 0.7)',
      labelBorderSize: 1
    };
    const lonlat = transLonLat(
      new HGIS.LonLat(
        dataArr[i].longitude / 360000,
        dataArr[i].latitude / 360000
      )
    );
    const geometry = new HGIS.Geometry.Point(lonlat.lon, lonlat.lat);
    const feature = new HGIS.Feature.Vector(geometry, null, style);
    features.push(feature);
    vectorLayer.addFeatures(feature);

    arr.push({
      feature,
      vehicleIndexCode: dataArr[i].vehicleIndexCode
    });
  }
  vectorLayer.addFeatures(features);
  return arr;
}

function showPopUp(map, param) {
  const anchor = {
    size: new HGIS.Size(0, 0),
    offset: new HGIS.Pixel(0, -8)
  };
  const titleHTML = `${getAlarmName(
    param.eventType
  )}<i id="m_closeInfoWindow" class="h-icon-close" title="关闭"></i>`;
  const contentHtml =
    '<div>' +
    `<div style="height:32px;line-height:32px; padding:0 16px;"><span style="display::inline-block;float:left;margin-right:8px;">报警时间:</span><span style="display:inline-block;width:180px;float:left;overflow: hidden;white-space: nowrap;text-overflow: ellipsis">${param.time
      .replace(/T/, ' ')
      .slice(0, 19)}</span></div>` +
    '<div style="height:32px;line-height:32px; padding:0 16px;"><span style="display:inline-block;float:left;margin-right:8px;">报警位置:</span><span id="alarmLocation" style="display:inline-block;width:180px;float:left;overflow: hidden;white-space: nowrap;text-overflow: ellipsis"></span></div>' +
    '</div>';
  const lonlat = transLonLat(
    new HGIS.LonLat(param.longitude / 360000, param.latitude / 360000)
  );
  let infoWindow = null;
  const info = map.popups.filter(item => typeof item.setContent === 'function');
  if (info.length > 0) {
    infoWindow = info[0];
    infoWindow.setContent(contentHtml);
    infoWindow.lonlat = lonlat;
    infoWindow.show();
  } else {
    infoWindow = new HGIS.Popup.InfoWindow(
      'alarmPopup',
      lonlat,
      new HGIS.Size(240, 120),
      titleHTML,
      contentHtml,
      anchor,
      true,
      () => {}
    );
    map.addPopup(infoWindow);
    infoWindow.show();
  }
  // 关闭
  document.getElementById('m_closeInfoWindow').addEventListener('click', () => {
    infoWindow.hide();
  });

  getAddress(
    [param.longitude / 360000, param.latitude / 360000],
    'alarmLocation'
  );
}

function addPopupMarker(map, param, markerArr, markerLayer) {
  // 在图层上添加 Marker
  const size = new HGIS.Size(16, 16);
  const offset = new HGIS.Pixel(-(size.w / 2), -size.h);
  const lonlat1 = transLonLat(
    new HGIS.LonLat(param.longitude / 360000, param.latitude / 360000)
  );
  const icon = new HGIS.Icon(mapAlarm, size, offset);
  const marker = new HGIS.Marker(lonlat1, icon);
  marker.events.register('click', marker, () => {
    showPopUp(map, param);
  });
  markerLayer.addMarker(marker);
  markerArr.push(marker);
}

export function addAlarmPoint(
  vehicleIndexCodes,
  beginTime,
  endTime,
  map,
  markerArr,
  markerLayer
) {
  const param = {
    vehicleIndexCodes: [vehicleIndexCodes],
    beginTime,
    endTime,
    eventTypes: [],
    level: null,
    orgIndexCodes: [],
    condition: {
      name: ''
    },
    pageNo: 1,
    pageSize: 1000
  };
  findAlarmPage(param).then(json => {
    if (json.code === '0') {
      const { list } = json.data;
      if (!list || list.length === 0) {
        const vm = new Vue();
        vm.$message.warning('无报警');
        return;
      }
      const arr = list.map(item => ({
        longitude: item.beginLongitude,
        latitude: item.beginLatitude,
        time: item.beginTime,
        eventType: item.eventType
      }));
      arr.forEach(item => {
        addPopupMarker(map, item, markerArr, markerLayer);
      });
    }
  });
}

export function createTrace(
  map,
  data,
  interval,
  step,
  isShowTrackFirst,
  isCenter,
  depart,
  isShowAlarm,
  vectorLayer,
  markerLayer,
  markerArr,
  tracktoolbar,
  label
) {
  let traceLayer = map.getLayersByName('轨迹')[0];
  if (!traceLayer) {
    traceLayer = new HGIS.Layer.Vector('轨迹');
    map.addLayer(traceLayer);
  } else {
    traceLayer.removeAllFeatures(); // 清除掉图层上之前的对象,销毁轨迹对象,清理图层
  }
  let lastTime = data[0].time; // 标记间隔
  const calback = node => {
    if (node[1] < data.length - 2) {
      const lastPoint = node[0];
      if (
        new Date(data[node[1] + 1].time).getTime() -
          new Date(lastPoint.time).getTime() >
        1000 * 60 * depart
      ) {
        addLine(lastPoint, data[node[1] + 1], vectorLayer);
      }
    }
    const lonlat = new HGIS.LonLat(node[0].longitude, node[0].latitude);
    let size;
    let offset;
    let icon;
    if (node[0].id === data[0].id || node[0].id === data[data.length - 1].id) {
      // 起点和终点添加标记
      createTextTag(lonlat, toTimeNormalString(node[0].time), label);
    }
    if (isShowTrackFirst === '0' && node[0].id === data[data.length - 1].id) {
      // 不先显示轨迹,手动添加终点
      size = new HGIS.Size(32, 32);
      offset = new HGIS.Pixel(-(size.w / 2), -size.h);
      icon = new HGIS.Icon(mapEnd, size, offset);
      const marker = new HGIS.Marker(lonlat, icon.clone());
      markerLayer.addMarker(marker);
      markerArr.push(marker);
    }
    if (
      interval !== '0' &&
      node[0].id !== data[0].id &&
      node[0].id !== data[data.length - 1].id
    ) {
      // 添加标记间隔
      const t1 =
        new Date(node[0].time).getTime() - new Date(lastTime).getTime();
      if (t1 > 1000 * 60 * parseInt(interval, 10)) {
        lastTime = node[0].time;
        size = new HGIS.Size(12, 12);
        offset = new HGIS.Pixel(-(size.w / 2), -(size.h - 2));
        icon = new HGIS.Icon(point, size, offset);
        const marker = new HGIS.Marker(lonlat, icon.clone());
        markerLayer.addMarker(marker);
        createTextTag(lonlat, toTimeNormalString(node[0].time), label);
        markerArr.push(marker);
      }
    }
    if (isCenter === '1') {
      // 居中回放
      map.panTo(new HGIS.LonLat(node[0].longitude, node[0].latitude));
    }
    tracktoolbar.addProgress();
    if (node[0].id === data[data.length - 1].id) {
      // 抛出结束播放的事件
      tracktoolbar.finishTrace();
    }
  };
  const trace = new HGIS.Biz.BayonetTrace(map, traceLayer, calback);
  // 启动样式
  const startStyle = {
    externalGraphic: mapStart,
    graphicWidth: 32,
    graphicHeight: 32,
    graphicXOffset: -16,
    graphicYOffset: -32,
    graphicZIndex: 15
  };
  // 结束后样式
  const endStyle = {
    externalGraphic: mapEnd,
    graphicWidth: 32,
    graphicHeight: 32,
    graphicXOffset: -16,
    graphicYOffset: -32,
    graphicZIndex: 15
  };
  // 移动中轨迹样式
  const moveStyle = {
    externalGraphic: mapVehicleRight,
    graphicWidth: 48,
    graphicHeight: 48,
    graphicXOffset: -24,
    graphicYOffset: -24,
    graphicZIndex: 11111,
    labelXOffset: 0,
    labelYOffset: 32,
    fontColor: 'blue'
  };
  trace._style.PointDraw = {
    // 传入位置点的显示样式
    pointRadius: 0,
    graphicName: 'circle',
    fillColor: '#fff',
    fillOpacity: 0.8,
    strokeWidth: 2,
    strokeOpacity: 1,
    strokeColor: '#F5A623',
    graphicZIndex: 10
  };
  trace._style.Line = {
    // 根据传入位置点构成道路的道路样式
    strokeWidth: 4,
    strokeOpacity: 1,
    strokeColor: '#2981DF',
    graphicZIndex: 5
  };
  trace._style.CompleteLine = {
    // 走过的路径样式
    strokeWidth: 4,
    strokeOpacity: 1,
    strokeColor: '#2981DF',
    graphicZIndex: 5
  };
  if (isShowTrackFirst === '0') {
    // 不先显示轨迹
    trace._style.Line.strokeOpacity = 0;
    trace._style.PointDraw.pointRadius = 0;
    endStyle.graphicWidth = 0;
    endStyle.graphicHeight = 0;
    trace.setPathShow(true);
  } else {
    trace.setPathShow(false); // 设置是否显示调用路径
  }
  trace.setTranceStep(step); // 总共的步数
  trace.setInterval(60); // 点移动间隔 60ms
  trace.setStopTime(0); // 停留时间
  trace.setStartStyle(startStyle); // 设置移动物体初始样式
  trace.setendStyle(endStyle); // 设置移动物体结束回放后的样式
  trace.setmoveStyle(moveStyle); // 先设置样式在设置路径
  // data.forEach((item) => {
  //   item.time = (new Date(item.time)).getTime();
  //   // item.latitude = parseInt(item.latitude, 10);
  //   // item.longitude = parseInt(item.longitude, 10);
  // });
  trace.setPath(data); // 设置路径
  if (isShowAlarm === '1') {
    const { vehicleIndexCode } = data[0];
    const beginTime = data[0].time;
    const endTime = data[data.length - 1].time;
    addAlarmPoint(
      vehicleIndexCode,
      beginTime,
      endTime,
      map,
      markerArr,
      markerLayer
    ); // vectorLayer,
  }
  return trace;
}

export function addLine(node1, node2, vectorLayer) {
  const point1 = new HGIS.Geometry.Point(node1.longitude, node1.latitude);
  const point2 = new HGIS.Geometry.Point(node2.longitude, node2.latitude);
  const geometry = new HGIS.Geometry.LinearRing([point1, point2]);
  const lineStyle = {
    strokeWidth: 10,
    strokeOpacity: 1,
    strokeColor: '#FF0000',
    graphicZIndex: 100
  };
  const lineStringVector = new HGIS.Feature.Vector(geometry, {}, lineStyle);
  vectorLayer.addFeatures(lineStringVector);
}

export function panTo(map, gps) {
  map.panTo(
    transLonLat(new HGIS.LonLat(gps.longitude / 360000, gps.latitude / 360000))
  );
}
