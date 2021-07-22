<template>
    <div
        ref="warp"
        class="warp"
        @mouseenter="mouseenterVideo"
        @mouseleave="mouseleaveVideo"
    >
        <div
            id="playWind"
            class="video-window"
            :style="
        `width:${clientWidth ? clientWidth : width}px;height:${
          clientHeight ? clientHeight : height
        }px;`
      "
        ></div>
        <transition name="fade">
            <div v-if="coverUrl && !isPlaying" class="coverUrl-wrap">
                <img :src="coverUrl"/>
            </div>
        </transition>
        <div v-if="!isPlaying" class="play-btn">
            <img
                v-if="!videoWebsocketing"
                src="../assets/png/alarmaudit-playVideo.png"
                title="播放"
                @click="playVideo"
            />
            <span v-else class="loading"></span>
        </div>
        <span v-else-if="isFinishing || videoWebsocketing" class="play-btn">
      <span class="loading"></span>
    </span>
        <span v-else-if="!videoWebsocketing && showPlay" class="play-btn">
      <img
          src="../assets/png/alarmaudit-playVideo.png"
          title="播放"
          @click="resumeVideo"
      />
    </span>
        <span
            v-else-if="!videoWebsocketing && showPause && isShowToolbar"
            class="play-btn"
        >
      <img
          src="../assets/png/alarmaudit-pauseVideo.png"
          title="暂停"
          @click="pauseVideo"
      />
    </span>
        <transition name="slide-fade">
            <div v-show="isShowToolbar" class="tool-bar">
                <el-button
                    type="iconButton"
                    icon="rm-video-open-sound"
                    title="打开声音"
                    :disabled="!(isPlaying && !isOpenSound) || isFinishing"
                    @click="openSound"
                ></el-button>
                <el-button
                    type="iconButton"
                    icon="rm-video-close-sound"
                    :disabled="!(isPlaying && isOpenSound) || isFinishing"
                    title="关闭声音"
                    @click="closeSound"
                ></el-button>
                <el-button
                    type="iconButton"
                    icon="rm-video-capture-picture"
                    title="抓图"
                    :disabled="!isPlaying"
                    @click="capturePicture('JPEG')"
                ></el-button>
                <el-button
                    style="float:right"
                    type="iconButton"
                    icon="h-icon-download"
                    title="下载"
                    @click="downloadVideoByInterface"
                ></el-button>
            </div>
        </transition>
    </div>
</template>
<script>
import {Promise} from 'q';
import {setInterval, clearInterval} from 'timers';
import {getToken, getGS, getUserInfo} from '@/api/location.js';
import {findVideoPlaybackUrl} from '@/api/alarm.js';
import {startapp} from '@/components/checkTools.js';

export default {
    name: 'PlaybackVideo',
    props: {
        clientWidth: {
            type: Number,
            default: 0
        },
        clientHeight: {
            type: Number,
            default: 0
        },
        serviceIndexCode: {
            type: String,
            default: ''
        },
        beginTime: {
            type: String,
            default: ''
        },
        endTime: {
            type: String,
            default: ''
        },
        size: {
            type: Number,
            default: 0
        },
        streamStartTime: {
            type: String,
            default: ''
        },
        streamEndTime: {
            type: String,
            default: ''
        },
        recordIndexCode: {
            type: String,
            default: ''
        },
        cameraIndexCode: {
            type: String,
            default: ''
        },
        ngixinfo: {
            type: Object,
            default: () => {
            }
        },
        userInfo: {
            type: Object,
            default: () => {
            }
        },
        isDetail: {
            type: Boolean,
            default: false
        },
        coverUrl: {
            type: String,
            default: ''
        },
        isPlayApp: {
            type: Boolean,
            default: false
        },
        originVideoId: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            JSPluginObj: null,
            iWind: 0,
            isShowToolbar: false,
            isOpenSound: false, // 默认关闭声音
            width: 0,
            height: 0,
            isIE: null, // 浏览器是否为IE
            iErrorCode: null,
            isPlaying: false, // 正在播放中,包含暂停状态
            isFinishing: false, // 是否播放结束
            showPlay: false, // 是否显示开始播放按钮
            showPause: false, // 是否显示暂停按钮
            videoWebsocketing: false,
            timer: null
        };
    },
    watch: {
        width() {
            if (!this.JSPluginObj) {
                this.init();
            }
        },
        clientWidth() {
            if (!this.JSPluginObj) {
                this.init();
            }
        },
        beginTime() {
            if (this.JSPluginObj && this.isPlaying) {
                this.stopVideo(false);
            }
        },
        iErrorCode(val) {
            if (val === 1002) {
                // 播放结束
                this.isFinishing = true;
                this.stopVideo(false);
                this.iErrorCode = null;
            } else if (val === 1003) {
                // 链接被动断开
                this.init();
            }
        },
        videoWebsocketing(val) {
            if (!val) {
                clearInterval(this.timer);
            }
        }
    },
    mounted() {
        window.PluginEventHandler = (iWnd, iErrorCode) => {
            // console.log(iWnd, iErrorCode);
            this.iErrorCode = iErrorCode;
        };
        this.resize();
        window.addEventListener('resize', this.resize);

        this.init();
        this.checkIE();
        const _this = this;
        this.timer = setInterval(() => {
            _this.videoWebsocketing = _this.$root.videoWebsocketing;
        }, 10);
    },
    destroyed() {
        this.destroy();
    },
    methods: {
        checkIE() {
            if (this.isPlayApp) {
                this.isIE = true;
                return;
            }
            // if (/msie/.test(window.navigator.userAgent.toLowerCase())) {
            //   this.isIE = true;
            // } else {
            //   this.isIE = false;
            // }
            const {userAgent} = window.navigator; // 取得浏览器的userAgent字符串
            const isIE =
                userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1; // 判断是否IE<11浏览器
            const isEdge = userAgent.indexOf('Edge') > -1 && !isIE; // 判断是否IE的Edge浏览器
            const isIE11 =
                userAgent.indexOf('Trident') > -1 && userAgent.indexOf('rv:11.0') > -1;
            if (isIE) {
                this.isIE = true;
                return;
            }
            if (isEdge) {
                this.isIE = true;
                return;
            }
            if (isIE11) {
                this.isIE = true;
                return;
            }
            this.isIE = false;
        },
        mouseenterVideo() {
            this.isShowToolbar = true;
        },
        mouseleaveVideo() {
            this.isShowToolbar = false;
        },
        init() {
            if (this.clientWidth || this.width) {
                if (this.JSPluginObj) {
                    this.destroy();
                }
                this.initObj();
            }

        },
        initObj() {
            this.JSPluginObj = new JSPlugin({
                szId: 'playWind',
                iType: 2,
                iWidth: this.clientWidth ? this.clientWidth : this.width,
                iHeight: this.clientHeight ? this.clientHeight : this.height,
                iMaxSplit: 1,
                iCurrentSplit: 1,
                szBasePath:
                    process.env.NODE_ENV === 'production'
                        ? this.isDetail
                        ? './plugins/JSPlugin'
                        : '../irtsafedriving-web/static/plugins/JSPlugin'
                        : './plugins/JSPlugin', //
                oStyle: {
                    border: '#ccc',
                    borderSelect: '#ccc',
                    background: '#aaa'
                }
            });
            this.isPlaying = false;
            this.showPlay = true;
            this.showPause = false;
        },
        playVideo() {
            if (this.$root.videoWebsocketing) {
                this.$root.toPlay = true;
            }
            const p1 = new Promise(resolve => {
                const param = {
                    serviceIndexCode: this.serviceIndexCode,
                    beginTime: this.streamStartTime,
                    endTime: this.streamEndTime,
                    recordIndexCode: this.recordIndexCode,
                    netDomainId: this.$store.state.userInfo.domainId,
                    protocol: this.isIE ? 'rtsp' : 'wss'
                };
                findVideoPlaybackUrl(param)
                    .then(json => {
                        if (json.code === '0') {
                            if (!json.data) {
                                this.$message.error('获取短视频播放url失败');
                                return;
                            }
                            resolve(json.data);
                        } else {
                            this.$message.error('获取短视频播放url失败');
                        }
                    })
                    .catch(() => {
                        this.$message.error('获取短视频播放url失败');
                    });
            });
            const p2 = new Promise(resolve => {
                getToken().then(json => {
                    if (json.code === '0') {
                        resolve(json.data.token);
                    }
                });
            });
            Promise.all([p1, p2]).then(([playURL, token]) => {
                if (this.isIE) {
                    // IE
                    this.handleIE(playURL);
                } else {
                    // chrome
                    this.handleChrome(playURL, token);
                }
            });
        },
        handleIE(playURL) {
            getGS().then(json => {
                if (json.code === '0') {
                    const sg = json.data;
                    const linkPlaybackHref =
                        'btoolpplayerprotocol://ReqType:PlayBackUrl;language:zh_CN;WndCount:1;' +
                        `NginxIp:${this.ngixinfo.ip};` +
                        `NginxPort:${this.ngixinfo.port};` +
                        `UserID:${this.userInfo.userId};` +
                        `sg:${sg};` +
                        'protocol:https;' +
                        `CamList:_${this.toTimezoneString(
                            this.streamStartTime
                        )}_${this.toTimezoneString(this.streamEndTime)};` +
                        `url:${playURL};` +
                        'appType:vas;MiniUI:1;';
                    startapp(
                        'btoolpplayerprotocol',
                        `${this.ngixinfo.protocal}://${this.ngixinfo.ip}:${this.ngixinfo.port}`,
                        linkPlaybackHref
                    );
                } else {
                    this.$message({
                        message: '获取sg失败!',
                        type: 'error'
                    });
                }
            });
        },
        handleChrome(playURL, token) {
            const arr = playURL.split('/proxy/');
            const url = arr[0];
            const pURL = `ws://${arr[1]}`;
            const proxy = arr[1].split('/')[0];
            if (url && pURL && proxy && token) {
                this.showPlay = false;
                // console.log(this.JSPluginObj)
                //  update by chenying 2021.07.20
                if (!this.JSPluginObj) {
                    this.width = this.$refs.warp.clientWidth;
                    this.height = this.$refs.warp.clientHeight;
                    this.init();
                }
                this.JSPluginObj.JS_Play(
                    url,
                    {
                        // 'wss://10.41.6.111:6014/'
                        playURL: pURL, // 'ws://10.41.6.111:6001/EUrl/HRWO9So',
                        token,
                        mode: 'media',
                        proxy // '10.41.6.111:6001',
                    },
                    this.iWind,
                    this.streamStartTime,
                    this.streamEndTime
                )
                    .then(() => {
                        this.isPlaying = true;
                        this.isOpenSound = false;
                        this.showPause = true;
                        // console.log('playVideo success');
                    })
                    .catch(() => {
                        this.$message.warning('播放失败');
                        this.init();
                    });
            }
        },
        stopVideo(destroyFlag) {
            if (this.JSPluginObj) {
                this.$root.videoWebsocketing = true;
                this.showPause = false;
                this.JSPluginObj.JS_Stop(this.iWind)
                    .then(() => {
                        this.isPlaying = false;
                        this.isFinishing = false;
                        this.showPlay = true;
                        // console.log('stopVideo success');
                        // const root = this.$root;
                        // if (root.videoWebsocketing && root.toPlay) {
                        //   this.playVideo();
                        // }
                    })
                    .catch(() => {
                        this.$message.warning('停止播放失败');
                        this.init();
                    })
                    .finally(() => {
                        this.$root.videoWebsocketing = false;
                        if (destroyFlag) {
                            this.JSPluginObj.JS_DestroyWorker();
                        }
                    });
            }
        },
        pauseVideo() {
            if (this.JSPluginObj) {
                this.$root.videoWebsocketing = true;
                this.showPause = false;
                this.JSPluginObj.JS_Pause(this.iWind).then(
                    () => {
                        this.$root.videoWebsocketing = false;
                        this.showPlay = true;
                        // console.log('Pause success');
                    },
                    () => {
                        this.$message.warning('暂停失败');
                        this.init();
                    }
                );
            }
        },
        resumeVideo() {
            if (this.JSPluginObj) {
                this.$root.videoWebsocketing = true;
                this.showPlay = false;
                this.JSPluginObj.JS_Resume(this.iWind).then(
                    () => {
                        this.$root.videoWebsocketing = false;
                        this.showPause = true;
                        // console.log('Resume success');
                    },
                    () => {
                        this.$message.warning('继续播放失败');
                        this.init();
                    }
                );
            }
        },
        openSound() {
            const iRet = this.JSPluginObj.JS_OpenSound(this.iWind);
            if (iRet > -1) {
                this.isOpenSound = true;
            } else {
                this.$message.warning('打开声音失败');
            }
            // console.log(iRet);
        },
        closeSound() {
            const iRet = this.JSPluginObj.JS_CloseSound(this.iWind);
            if (iRet > -1) {
                this.isOpenSound = false;
            } else {
                this.$message.warning('关闭声音失败');
            }
            // console.log(iRet);
        },
        handleDownload() {
            const p1 = new Promise(resolve => {
                const param = {
                    serviceIndexCode: this.serviceIndexCode,
                    beginTime: this.streamStartTime,
                    endTime: this.streamEndTime,
                    recordIndexCode: this.recordIndexCode,
                    netDomainId: '0',
                    protocol: 'rtsp'
                };
                findVideoPlaybackUrl(param).then(json => {
                    if (json.code === '0') {
                        if (!json.data) {
                            this.$message.error('获取短视频url失败');
                            return;
                        }
                        resolve(json.data);
                    }
                });
            });
            const p2 = new Promise(resolve => {
                getToken().then(json1 => {
                    if (json1.code === '0') {
                        resolve(json1.data.token);
                    }
                });
            });
            Promise.all([p1, p2]).then(([url, token]) => {
                if (url && token) {
                    const downloadStr = `hikdl://iCamdoc:0:0@0:0/2/${
                        this.cameraIndexCode
                    }/video-${this.beginTime.slice(0, 10)}/range=${
                        this.streamStartTime
                    };${this.streamEndTime}
            <SegmentList>
              <RecordSegment>
                <BeginTime>${this.toTimezoneString(
                        this.streamStartTime
                    )}</BeginTime>
                <EndTime>${this.toTimezoneString(this.streamEndTime)}</EndTime>
                <RecordType>4</RecordType>
                <MediaDataLen>${this.size}</MediaDataLen>
                <IsLocked>0</IsLocked>
                <PlayURL>${url}$token:${token}</PlayURL>
              </RecordSegment>
            </SegmentList>`;
                    startapp(
                        'btooldownloadprotocol',
                        `${this.ngixinfo.protocal}://${this.ngixinfo.ip}:${this.ngixinfo.port}`,
                        downloadStr
                    );
                }
            });
        },
        downloadVideoByInterface() {
            const param = [
                {
                    beginTime: this.beginTime,
                    originVideoId: this.originVideoId
                }
            ];

            const params = {
                userId: this.$store.state.userInfo.userId,
                netDomainId: this.$store.state.userInfo.domainId,
                videoIdParams: param
            };
            const strToBase64 = btoa(JSON.stringify(params));
            this.handleDown(strToBase64);
        },
        handleDown(fields) {
            const p1 = new Promise(resolve => {
                getGS().then(json1 => {
                    if (json1.code === '0') {
                        resolve(json1.data);
                    }
                });
            });
            p1.then(sg => {
                const url = '/msa-web/multimedia/batchDownloadVideos.do';
                const time = `${new Date().getFullYear()}${new Date().getMonth() +
                1}${new Date().getDate()}${new Date().getHours()}${new Date().getMinutes()}${new Date().getSeconds()}`;
                const postLink = `btooldownloadprotocol://
        postUrl:${this.ngixinfo.protocal}://${this.ngixinfo.ip}:${
                    this.ngixinfo.port
                }${url};
        postFields:${fields};proxy:${this.ngixinfo.protocal}://${
                    this.ngixinfo.ip
                }:${this.ngixinfo.port};
        dlName:${btoa(time)};componentId:msa;dlSG:${sg};language:zh_CN;`;
                // const postLink = `btooldownloadprotocol://postUrl:http://10.41.6.115:8057${url};
                //   postFields:${fields};proxy:https://10.41.6.111:443;
                //   dlName:${btoa(time)};componentId:irtsafedriving;dlSG:${sg};language:zh_CN;`;
                startapp(
                    'btooldownloadprotocol',
                    `${this.ngixinfo.protocal}://${this.ngixinfo.ip}:${this.ngixinfo.port}`,
                    // 'http://10.41.6.115:8057',
                    postLink
                );
            });
        },
        resize() {
            if (this.$refs.warp) {
                this.$nextTick(() => {
                    this.width = this.$refs.warp.clientWidth;
                    this.height = this.$refs.warp.clientHeight;
                    this.resizeVideo(this.width, this.height);
                });
            }
        },
        resizeVideo(iWidth, iHeight) {
            if (this.JSPluginObj) {
                this.JSPluginObj.JS_Resize(iWidth, iHeight);
            }
        },
        capturePicture(szType) {
            this.JSPluginObj.JS_CapturePicture(this.iWind, 'img', szType).then(
                () => {
                    // console.log('CapturePicture success');
                },
                () => {
                    // console.log('CapturePicture failed');
                }
            );
        },
        destroy() {
            if (this.JSPluginObj && this.isPlaying) {
                this.stopVideo(true);
            }
        },
        toTimezoneString(dt) {
            const date = new Date(dt);
            if (date.toString() === 'Invalid Date') {
                return '';
            }
            // UTC+8 会返回 -480
            const tzo = date.getTimezoneOffset();
            const tzSign = tzo > 0 ? '-' : '+';
            const tzHour = String(Math.abs(tzo / 60) | 0);
            const tzMinute = String(Math.abs(tzo % 60) | 0);
            const timezone = tzo === 0 ? '+Z' : `${tzSign}${tzHour}:${tzMinute}`;
            return `${[date.getFullYear(), date.getMonth() + 1, date.getDate()].join(
                '-'
            )} ${[date.getHours(), date.getMinutes(), date.getSeconds()].join(
                ':'
            )}.${`000${date.getMilliseconds()}`.slice(-3)}${timezone}`
                .replace(/\b\d\b/g, '0$&')
                .replace(/\+Z/, 'Z')
                .replace(/\s/, 'T');
        }
    }
};
</script>
<style scoped>
.warp {
    position: relative;
    width: 100%;
    height: 100%;
}

.video-window {
    width: 600px;
    height: 400px;
}

.play-btn {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

.play-btn img {
    cursor: pointer;
}

.tool-bar {
    position: absolute;
    bottom: 0px;
    z-index: 1000;
    width: 100%;
    height: 32px;
    background-color: #fff;
    opacity: 0.8;
}

.el-button {
    width: 32px;
    height: 32px;
}

.warp .slide-fade-enter-active {
    transition: all 0.5s ease;
}

.warp .slide-fade-leave-active {
    transition: all 0.5s ease;
}

.warp .slide-fade-enter,
.slide-fade-leave-to {
    transform: translateY(32px);
    opacity: 0;
}

.loading {
    display: inline-block;
    width: 32px;
    height: 32px;
    background-repeat: no-repeat;
    background-image: url(../assets/png/loading_video.gif);
    background-position: left 0;
}

.coverUrl-wrap {
    position: relative;
    top: -100%;
    height: 100%;
    width: 100%;
}

.coverUrl-wrap img {
    height: 100%;
    width: 100%;
}

.warp .fade-leave-active {
    transition: opacity 0.5s;
}

.warp .fade-leave-to {
    opacity: 0;
}
</style>
