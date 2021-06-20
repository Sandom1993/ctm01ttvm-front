import Vue from 'vue';
import HUI from 'hui';

let socket;
const vm = new Vue();

Vue.use(HUI);

function install(CenterUrl) {
  vm.$confirm(
    '检测到未安装插件助手,请点击确定立即安装?否则无法正常使用播放和下载功能',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'question'
    }
  ).then(() => {
    if (CenterUrl) {
      window.open(`${CenterUrl}/portal/download`);
    } else {
      window.open(`${window.location.origin}/portal/download`);
    }
  });
}

export function checkapp(name) {
  const jsonObj = `{"comment":{"commenttype":"checkapp", "context":"${name}"}}`;
  socket.send(jsonObj);
}

export function checkBtools(CenterUrl, name, CmdLine) {
  const host = 'wss://127.0.0.1:18001/WebS_Js';
  try {
    socket = new WebSocket(host);
    socket.addEventListener('open', () => {
      // const status = socket.readyState;
      if (name) {
        checkapp(name);
        const jsonObj = `{"comment":{"commenttype":"startapp", "context":"btoolsprotocol", "commentcmd":"btoolsprotocol://CenterUrl:${CenterUrl}/portal;Toollist:PROT_${name};CmdLine:${CmdLine}"}}`;
        socket.send(jsonObj);
      }
    });
    socket.addEventListener('message', msg => {
      const str = msg.data;
      const obj = JSON.parse(str);
      if (
        obj.comment &&
        obj.comment.resultCode &&
        obj.comment.resultCode !== '1'
      ) {
        vm.$message.warning('检测到没有安装控件,插件助手已开始安装');
      }
    });
    socket.onclose = () => {
      const status = socket.readyState;
      if (status === 3) {
        install(CenterUrl);
      }
    };
  } catch (exception) {
    install(CenterUrl);
  }
}

export function startapp(name, CenterUrl, CmdLine) {
  checkBtools(CenterUrl, name, CmdLine);
  // checkapp(name);
  // const jsonObj = `{"comment":{"commenttype":"startapp", "context":"btoolsprotocol", "commentcmd":"btoolsprotocol://CenterUrl:${CenterUrl}/portal;Toollist:PROT_${name};CmdLine:${CmdLine}"}}`;
  // socket.send(jsonObj);
}
