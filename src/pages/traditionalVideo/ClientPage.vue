<template>
  <div id="playWnd" class="playWnd" :style="style"></div>
</template>
<script>
import { getNginxInfo, getGS } from '@/api/location.js';
const overToolPos = {
  leftNavList: null
};
export default {
  name: 'TraditionalPreview',
  props: {
    componentId: {
      type: String,
      required: true
    },
    componentName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      style: null
    };
  },
  created() {
    this.getStyle();
    this.loadJS(
      process.env.BASE_URL + 'plugins/JSPlugin/jsWebControl-1.0.0.min.js',
      () => {
        this.oWebControl = new WebControl(this.controlParam(true));
      }
    );
  },
  mounted() {
    this.initParentEventHandle();
    window.addEventListener('resize', this.resize);
    window.addEventListener('scroll', this.resize);
    window.showTabCallback = this.showTabCallback;
    window.hideTabCallback = this.hideTabCallback;
    window.showContentOverTool = this.showContentOverTool;
  },
  destroyed() {
    if (this.oWebControl != null) {
      this.oWebControl.JS_DestroyWnd().then(
        function() {},
        function() {}
      );
      this.oWebControl.JS_StopService('window').then(function() {
        this.oWebControl.JS_Disconnect().then(
          function() {},
          function() {}
        );
      });
    }
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('scroll', this.resize);
  },
  methods: {
    showTabCallback() {
      if (this.oWebControl != null) {
        this.oWebControl.JS_ShowWnd();
        this.oWebControl.JS_RepairPartWindow(
          0,
          0,
          this.getWinWidth(),
          this.getWinHeight()
        );
        this.resize();
      }
    },
    hideTabCallback() {
      if (this.oWebControl != null) {
        this.oWebControl.JS_HideWnd();
      }
    },
    showContentOverTool(param) {
      if (!this.oWebControl) {
        return;
      }
      let width = 0;
      let height = 0;
      let left = 0;
      let top = 0;
      const isExpand = param.isExtend;
      const toolPos = param.pos;

      let marginLeft = 0;
      if (window.parent) {
        const menuDom = window.parent.document.querySelector(
          '.m-menu-page.current .g-sdl'
        );
        if (menuDom) {
          marginLeft = menuDom.clientWidth;
        }
      }
      if (isExpand) {
        left = Math.max(Math.ceil(toolPos.left - marginLeft), 0);
        top = Math.max(parseInt(toolPos.top - 68), 0);
        width = parseInt(toolPos.width);
        height =
          top === 0
            ? toolPos.height + toolPos.top - 68
            : parseInt(toolPos.height);
        overToolPos[param.target] = {
          left: left,
          top: top,
          width: width,
          height: height
        };
        // 如果弹出对话框，因为遮罩原因，要隐藏播放控件
        if (
          param.target === 'aboutModal' ||
          param.target === 'pswdModal' ||
          param.target === 'logoutModal' ||
          param.target === 'leftNavList' ||
          param.target === 'dropDownSysControl' ||
          param.target === 'dropDownUsrControl' ||
          param.target === 'dropDownTabControl' ||
          param.target === 'navQuick'
        ) {
          this.oWebControl.JS_CuttingPartWindow(
            Math.max(parseInt(param.pos.left - marginLeft), 0),
            Math.max(parseInt(toolPos.top - 68), 0),
            param.pos.width,
            overToolPos[param.target].height
          );
        } else {
          this.oWebControl.JS_CuttingPartWindow(left, top, width, height, 0);
        }
      } else {
        const p = overToolPos[param.target];
        this.oWebControl.JS_RepairPartWindow(p.left, p.top, p.width, p.height);
      }
    },
    loadJS(src, callback) {
      const script = document.createElement('script');
      const head = document.getElementsByTagName('head')[0];
      let loaded;
      script.src = src;
      if (typeof callback === 'function') {
        script.onload = script.onreadystatechange = function() {
          if (
            !loaded &&
            (!script.readyState || /loaded|complete/.test(script.readyState))
          ) {
            script.onload = script.onreadystatechange = null;
            loaded = true;
            callback();
          }
        };
      }
      head.appendChild(script);
    },
    initParentEventHandle() {
      if (typeof window.addEventListener !== 'undefined') {
        window.addEventListener('message', this.dealMessage, false);
      } else if (typeof window.attachEvent !== 'undefined') {
        window.attachEvent('onmessage', this.dealMessage);
      }
    },
    dealMessage(e) {
      if (e.source !== window.parent) return; // 只接收父页面发来的消息
      const data = JSON.parse(e.data);
      if (data.method) {
        const callFunction = window[data.method];
        if (typeof callFunction === 'function') {
          let param = null;
          if (data.argument) {
            param = data.argument;
          }
          if (param) {
            callFunction(param);
          } else {
            callFunction();
          }
        }
      }
    },
    getWinWidth() {
      return window.innerWidth > 1280
        ? window.innerWidth
        : window.outerWidth - 9;
    },
    getWinHeight() {
      return window.innerHeight;
    },
    getStyle() {
      let marginLeft = '0px';
      if (window.parent) {
        const menuDom = window.parent.document.querySelector(
          '.m-menu-page.current .g-sdl'
        );
        if (menuDom) {
          marginLeft = menuDom.clientWidth + 'px';
        }
      }
      this.style = {
        marginLeft
      };
    },
    resize() {
      this.getStyle();
      if (this.oWebControl != null) {
        this.oWebControl.JS_Resize(this.getWinWidth(), this.getWinHeight());
      }
    },
    controlParam(newPort) {
      return {
        szPluginContainer: 'cbInfo',
        iServicePortStart: newPort ? 14600 : 15960, // 对应 LocalServiceConfig.xml 中的ServicePortStart值
        iServicePortEnd: newPort ? 14609 : 15969, // 对应 LocalServiceConfig.xml 中的ServicePortEnd值
        cbConnectSuccess: () => {
          this.setCallbacks();
          this.oWebControl
            .JS_StartService('window', {
              // dllPath: "./DllForTest.dll"
              dllPath: './ChromeContainer.dll'
              // dllPath: "./DllForTest-Win32.dll"
            })
            .then(
              () => {
                Promise.all([getNginxInfo(), getGS()]).then(res => {
                  this.ngixinfoCache = res[0].data;
                  this.sgCache = res[1].data;
                  this.oWebControl
                    .JS_CreateWnd(
                      'playWnd',
                      this.getWinWidth(),
                      this.getWinHeight()
                    )
                    .then(() => {
                      this.oWebControl.JS_RequestInterface({
                        funcName: 'startContainer',
                        arguments: {
                          nginxIp: this.ngixinfoCache.ip,
                          nginxPort: String(this.ngixinfoCache.port),
                          sg: this.sgCache,
                          protocol: this.ngixinfoCache.protocal,
                          language: 'zh_CN',
                          returnToBvideo: '0', // 是否开启缩略图入口，1开启，0关闭
                          isEnableDST: '0', // 是否开启夏令时，1开启，0关闭
                          componentId: this.componentId,
                          componentName: this.componentName,
                          components: JSON.stringify([
                            {
                              id: this.componentId,
                              name: encodeURI(this.componentName),
                              set: 1
                            }
                          ])
                        }
                      });
                    });
                  if (!!window.ActiveXObject || 'ActiveXObject' in window) {
                    this.oWebControl.JS_SetDocOffset({
                      left: 0,
                      top: 80
                    });
                  }
                });
              },
              e => {
                console.error(e);
              }
            );
        },
        cbConnectError: () => {
          if (newPort) {
            this.oWebControl = new WebControl(this.controlParam());
          } else {
            this.oWebControl = null;
            this.$confirm('未安装客户端,是否安装?', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              window.open(window.location.origin + '/portal/download');
            });
          }
        },
        cbConnectClose: function(bNormalClose) {
          // 连接异常断开：bNormalClose = false
          // JS_Disconnect正常断开：bNormalClose = true
          this.oWebControl = null;
        }
      };
    },
    setCallbacks() {
      this.oWebControl.JS_SetWindowControlCallback({
        cbIntegrationCallBack: oData => {
          window.showCBInfo(JSON.stringify(oData.responseMsg));
        }
      });
    }
  }
};
</script>

<style scoped lang="scss">
.playWnd {
  margin-left: 240px;
  margin-top: 68px;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
