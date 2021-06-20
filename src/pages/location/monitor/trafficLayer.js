/* eslint-disable */
HGIS.Layer.Amap = HGIS.Class(HGIS.Layer.XYZ, {
  name: 'Amap',
  url: null,
  wrapDateLine: true,
  amapLayer: null, // 高德地图图层
  rqv: 0, // int型，请求版本号，如果大于0，会加到请求url里。主要目的是为了跳过浏览器缓存
  maxExtentleft: -20037508.34,
  maxExtentbottom: -20037508.34,
  maxExtentright: 20037508.34,
  maxExtenttop: 20037508.34,

  initialize(name, url, amapLayer, options) {
    if (!url) {
      // 未定义地图url则重新指定url
      const tmpUrl = amapLayer.getTileUrl(3418, 1684, 12);
      url = tmpUrl
        .replace(/&x=3418/, '&x=${x}')
        .replace(/&y=1684/, '&y=${y}')
        .replace(/&z=12/, '&z=${z}');
    }

    HGIS.Layer.XYZ.prototype.initialize.apply(this, [name, url, options]);

    this.amapLayer = amapLayer;
  },

  getXYZ(bounds) {
    const res = this.getServerResolution();
    const x = Math.round(
      (bounds.left - this.maxExtentleft) / (res * this.tileSize.w)
    );
    const y = Math.round(
      (this.maxExtenttop - bounds.top) / (res * this.tileSize.h)
    );
    const z = this.map.zoom;

    return {
      x,
      y,
      z
    };
  },

  getURL(bounds) {
    const xyz = this.getXYZ(bounds);
    let currUrl = this.amapLayer.getTileUrl(xyz.x, xyz.y, xyz.z);
    if (this.rqv > 0) {
      currUrl = `${currUrl}&rqv=${this.rqv}`;
    }
    return currUrl;
  },

  refresh() {
    this.rqv = this.rqv + 1;
    this.redraw();
  },

  clone(obj) {
    if (obj == null) {
      obj = new HGIS.Layer.Amap(
        this.name,
        this.url,
        this.amapLayer,
        this.getOptions()
      );
    }
    obj = HGIS.Layer.XYZ.prototype.clone.apply(this, [obj]);
    return obj;
  },

  CLASS_NAME: 'HGIS.Layer.Amap'
});
// 高德路况地图
const trafficUrls =
  'https://tm.amap.com/trafficengine/mapabc/traffictile?v=1.0&t=1&x=${x}&y=${y}&z=${z}';
let AmaptrafficLayer;
let rqv;

export function createAmapLayerXYZ() {
  AmaptrafficLayer = new HGIS.Layer.XYZ(
    '高德路况图',
    `${trafficUrls}&rqv=${rqv}`,
    {
      isBaseLayer: false,
      sphericalMercator: true,
      visibility: false, // 默认不显示,
      tileOptions: {
        eventListeners: {
          loaderror(event) {
            // 没有路况图片时，不显示
            event.object.imgDiv.style.display = 'none';
          }
        }
      }
    }
  );
  return AmaptrafficLayer;
}

export function createAmapLayer() {
  AmaptrafficLayer = new HGIS.Layer.Amap(
    '高德路况图',
    null,
    new AMap.TileLayer.Traffic(),
    {
      isBaseLayer: false,
      visibility: false, // 默认不显示,
      zoomOffset: 0,
      tileOptions: {
        eventListeners: {
          // 没有路况图片时，不显示
          loaderror(event) {
            event.object.imgDiv.style.display = 'none';
          }
        }
      }
    }
  );
}

export function refresh(map) {
  map.removeLayer(AmaptrafficLayer);
  rqv += 1;
  createAmapLayerXYZ();
  map.addLayers([AmaptrafficLayer]);
  AmaptrafficLayer.setVisibility(true);
}

export function setTrafficLayerVisible(flag) {
  AmaptrafficLayer.setVisibility(flag);
}
