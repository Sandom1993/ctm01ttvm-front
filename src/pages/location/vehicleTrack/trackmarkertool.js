import mapVehicle from '../../../assets/png/map-vehicle.png';
import offlinePic from '../../../assets/png/vehicle-offline.png';
import alarmPic from '../../../assets/png/vehicle-alarm.png';
import lowSpeedPic from '../../../assets/png/vehicle-lowspeed.png';
import alarm from '@/utils/alarm';

/**
 * 生成marker gps:设备上报的经纬度
 */
// export function createMarker(markerLayer, gps, status, event = null) {
//   // status -0:离线 -1:在线 -2:告警 -3:低速
//   let pic = mapVehicle;
//   if (status === 0) {
//     pic = offlinePic;
//   } else if (status === 2) {
//     pic = alarmPic;
//   } else if (status === 3) {
//     pic = lowSpeedPic;
//   }
//   const size = new HGIS.Size(28, 28);
//   const offset = new HGIS.Pixel(-(size.w / 2), -(size.h / 2));
//   const icon = new HGIS.Icon(pic, size, offset);
//   const lonlat = transLonLat(
//     new HGIS.LonLat(gps.longitude / 360000, gps.latitude / 360000)
//   );
//   const marker = new HGIS.Marker(lonlat, icon.clone());
//   markerLayer.addMarker(marker);
//   try {
//     marker.icon.imageDiv.children[0].style = `position: relative;width: 28px;height: 28px;
//           -webkit-transform: rotate(${gps.direction / 100}deg);
//           -ms-transform: rotate(${gps.direction / 100}deg);`;
//   } catch (exception) {
//     marker.icon.imageDiv.style.msTransform = `rotate(${gps.direction / 100}deg);`;
//     marker.icon.imageDiv.style.cssText = `position: relative;width: 28px;height: 28px;
//         -ms-transform:rotate(${gps.direction / 100}deg);`;
//   }
//   return marker;
// }

// vector图层方式实现
export function createMarker(markerLayer, gps, status) {
  let pic = mapVehicle;
  let attributes = {};
  if (status === 0) {
    pic = offlinePic;
  } else if (status === 2) {
    pic = alarmPic;
    attributes = gps.alarm
  } else if (status === 3) {
    pic = lowSpeedPic;
  }
  // 位置信息
  const point = new HGIS.Geometry.Point(
    gps.longitude / 360000,
    gps.latitude / 360000
  ).transform(
    new HGIS.Projection('EPSG:4326'),
    new HGIS.Projection('EPSG:900913')
  );
  // 点样式
  const pointStyle = {
    graphicWidth: 28,
    graphicHeight: 28,
    graphicZIndex: 10000,
    externalGraphic: pic
  };
  const pointVector = new HGIS.Feature.Vector(point, Object.assign(attributes, {
      latitude: gps.latitude,
      longitude: gps.longitude
    }), {
    ...pointStyle,
    rotation: parseInt(gps.direction / 100, 10)
  });
  markerLayer.addFeatures([pointVector]);
  return pointVector
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
      obj.style = `position: relative;width: 20px;height: 20px;
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
 * LonLat转xy
 */
export function transLonLat(lonLat) {
  return lonLat.transform(
    new HGIS.Projection('EPSG:4326'),
    new HGIS.Projection('EPSG:900913')
  );
}

/**
 * 转换数据为Vector数组,便于进行数据回退,
 */
export function toVectorList(gps) {
  const vectorList = [];
  gps.forEach(item => {
    let pic = mapVehicle;
    let attributes = {};
    if (item.alarm) {
      pic = alarmPic;
      attributes = item.alarm
    } else {
      attributes = item;
    }
    // 位置信息
    const point = new HGIS.Geometry.Point(
      item.longitude / 360000,
      item.latitude / 360000
    ).transform(
      new HGIS.Projection('EPSG:4326'),
      new HGIS.Projection('EPSG:900913')
    );
    // 点样式
    const pointStyle = {
      graphicWidth: 28,
      graphicHeight: 28,
      graphicZIndex: 10000,
      externalGraphic: pic
    };
    const pointVector = new HGIS.Feature.Vector(point, Object.assign(attributes, {
      latitude: item.latitude,
      longitude: item.longitude
    }), {
      ...pointStyle,
      rotation: parseInt(item.direction / 100, 10)
    });
    vectorList.push(pointVector);
  })
  return vectorList
}

/**
 * 传入index,进行点位绘制
 */
export function redrawMarker(layer, vectorList, lastIndex, currentIndex) {
  // 点位无变化
  if (lastIndex === currentIndex) {
    return;
  }
  // 拓展数据
  if (lastIndex < currentIndex) {
    // 直接添加新的feature
    layer.addFeatures(vectorList.slice(lastIndex, currentIndex));
  }
  // 删除数据
  if (lastIndex > currentIndex) {
    // current 1/2 last
    // 全部删除后进行添加
    if (currentIndex <= lastIndex / 2) {
      layer.removeAllFeatures();
      layer.addFeatures(vectorList.slice(0, currentIndex));
    } else {
      // 调用removeFeatures()
      layer.removeFeatures(vectorList.slice(currentIndex, lastIndex));
    }
  }
}