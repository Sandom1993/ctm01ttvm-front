<template>
  <div class="alarm-multi-media">
    <div v-loading="loadingPic" class="alarm-pic-wrap">
      <div v-if="pics.length === 0" class="no-resource">
        <i class="h-icon-picture no-resource-icon"></i>
        此报警无图片
      </div>
      <template v-else>
        <el-carousel
          height="256px"
          :autoplay="false"
          indicator-position="none"
          :arrow="pics.length > 1 ? 'always' : 'never'"
        >
          <el-carousel-item v-for="(item, index) in pics" :key="item.thumbUrl">
            <img
              :src="item.thumbUrl"
              class="alarm-pic"
              :current-index="imgIndex"
              @click="previewImg(index)"
            />
          </el-carousel-item>
        </el-carousel>
      </template>
    </div>
    <div v-loading="loadingVideo" class="alarm-video-wrap">
      <div v-if="pics.length === 0" class="no-resource">
        <i class="h-icon-info_liveview no-resource-icon"></i>
        此报警无视频
      </div>
      <el-carousel
        v-else
        height="256px"
        :autoplay="false"
        indicator-position="none"
        :arrow="videos.length > 1 ? 'always' : 'never'"
      >
        <el-carousel-item v-for="item in videos" :key="item.thumbUrl">
          <!-- <img
            v-if="item.coverUrl"
            :src="item.coverUrl"
            class="video-cover-img"
          />
          <img
            src="../../assets/png/play.png"
            class="play-btn"
            @click="play(item)"
          /> -->
          <playback-video
            :service-index-code="item.serviceIndexCode"
            :begin-time="getTimezoneString(item.beginTime)"
            :end-time="getTimezoneString(item.endTime)"
            :size="item.size"
            :stream-start-time="getTimezoneString(item.streamStartTime)"
            :stream-end-time="getTimezoneString(item.streamEndTime)"
            :record-index-code="item.recordIndexCode"
            :camera-index-code="item.cameraIndexCode"
            :ngixinfo="ngixinfo"
            :user-info="userInfo"
            :cover-url="item.coverUrl"
            :auto-play="false"
            :is-play-app="false"
            is-detail
            :origin-video-id="item.originVideoId"
          ></playback-video>
        </el-carousel-item>
      </el-carousel>
    </div>
    <div v-loading="loadingSubAlarms" class="sub-alarm-wrap">
      <el-collapse v-if="subAlarms.length > 0" v-model="collapseValue">
        <el-collapse-item arrow-placement="right" name="subalarm">
          <template slot="title">
            <div class="sub-alarm-title">
              <div class="sub-alarm-num">{{ subAlarms.length }}条</div>
              <img src="../../assets/png/alarm-icon.png" />
              报警详情
            </div>
          </template>
          <div
            v-for="(item, index) in subAlarms"
            :key="index"
            class="sub-alarm-item"
            @click="onViewSubAlarm(item)"
          >
            <div class="sub-alarm-name">{{ item.alarmName }}</div>
            <div class="sub-alarm-time">
              {{ item.alarmTime | formateDateTime }}
            </div>
            <div class="sub-alarm-speed">
              {{ item.averageSpeed | formatSpeed }} km/h
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
    <h-img-preview
      v-if="pics.length > 0"
      :data="imgs"
      :visible.sync="showImgPreview"
    />
  </div>
</template>

<script>
import {
  findAlarmPics,
  findAlarmVideos,
  riskLedgerDetailQuery
} from '@/api/alarm.js';
import { toTimezoneString } from '@/components/util.js';
import { startapp } from '@/components/checkTools.js';
import { getNginxInfo, getGS, getUserInfo } from '@/api/location.js';
import PlaybackVideo from '@/components/PlaybackVideo';
import alarmUtils from '@/utils/alarm';

export default {
  name: 'AlarmMultiMedia',
  components: {
    PlaybackVideo
  },
  filters: {
    formatSpeed(value) {
      return alarmUtils.formatSpeed(value);
    }
  },
  props: {
    alarm: {
      type: Object,
      default: () => {
        return {};
      }
    },
    ngixinfo: {
      type: Object,
      default: () => {
        return {};
      }
    },
    sg: {
      type: String,
      default: ''
    },
    userInfo: {
      type: Object,
      default: () => {
        return {};
      }
    }
  },
  data() {
    return {
      collapseValue: 'subalarm',
      pics: [],
      videos: [],
      subAlarms: [],
      hasPic: false,
      hasVideo: false,
      loadingPic: false,
      loadingVideo: false,
      loadingSubAlarms: false,
      showImgPreview: false,
      imgIndex: 0
    };
  },
  computed: {
    imgs() {
      return this.pics.map(item => item.url);
    }
  },
  watch: {
    alarm(alarm) {
      this.pics = [];
      this.videos = [];
      this.hasPic = false;
      this.hasVideo = false;
      this.subAlarms = [];
      this.loadingPic = false;
      this.loadingVideo = false;
      this.loadingSubAlarms = false;
      this.showImgPreview = false;
      this.imgIndex = 0;
      if (alarm.isRiskEvent) {
        this.loadSubAlarms();
      } else {
        this.hasPic = true;
        this.loadAlarmPics({
          alarmId: this.alarm.alarmId,
          alarmTime: toTimezoneString(this.alarm.beginTime)
        });
        this.hasVideo = true;
        this.loadAlarmVideo({
          alarmId: this.alarm.alarmId,
          alarmTime: toTimezoneString(this.alarm.beginTime)
        });
      }
    }
  },
  methods: {
    loadAlarmPics(params) {
      this.loadingPic = true;
      this.pics = [];
      findAlarmPics({
        ...params,
        netDomainId: this.$store.state.userInfo.domainId
      })
        .then(json => {
          if (json.code === '0') {
            this.pics = json.data || [];
          }
        })
        .finally(() => {
          this.loadingPic = false;
        });
    },
    loadAlarmVideo(params) {
      this.loadingVideo = true;
      this.videos = [];
      findAlarmVideos({
        ...params,
        netDomainId: this.$store.state.userInfo.domainId,
        protocol: 'rtsp'
      })
        .then(json => {
          if (json.code === '0') {
            this.videos = json.data || [];
          }
        })
        .finally(() => {
          this.loadingVideo = false;
        });
    },
    loadSubAlarms() {
      this.loadingSubAlarms = true;
      riskLedgerDetailQuery({
        beginTime: toTimezoneString(this.alarm.beginTime),
        eventId: this.alarm.eventId,
        netDomainId: this.$store.state.userInfo.domainId
      })
        .then(json => {
          if (json.code === '0') {
            this.subAlarms = json.data.subAlarmDetailsDTOs || [];
            const alarm = this.subAlarms[0];
            if (alarm) {
              this.onViewSubAlarm(alarm);
            }
          }
        })
        .finally(() => {
          this.loadingSubAlarms = false;
        });
    },
    play(video) {
      const playVideo = (ngixinfo, userInfo, sg) => {
        const href = `btoolpplayerprotocol://ReqType:PlayBackUrl;language:zh_CN;WndCount:1;NginxIp:${
          ngixinfo.ip
        };NginxPort:${String(ngixinfo.port)};UserID:${
          userInfo.userId
        };sg:${sg};protocol:${ngixinfo.protocal};CamList:${
          video.cameraIndexCode
        }_${toTimezoneString(video.streamStartTime)}_${toTimezoneString(
          video.streamEndTime
        )};url:${video.url};appType:vas;MiniUI:1;`;
        // console.log(this.href);
        startapp(
          'btoolpplayerprotocol',
          `${ngixinfo.protocal}://${ngixinfo.ip}:${ngixinfo.port}`,
          href
        );
      };
      if (this.ngixinfo && this.ngixinfo.ip) {
        playVideo(this.ngixinfo, this.userInfo, this.sg);
      } else if (this.ngixinfoCache) {
        playVideo(this.ngixinfoCache, this.userInfoCache, this.sgCache);
      } else {
        Promise.all([getNginxInfo(), getGS(), getUserInfo()]).then(res => {
          this.ngixinfoCache = res[0].data;
          this.sgCache = res[1].data;
          this.userInfoCache = res[2].data;
          playVideo(this.ngixinfoCache, this.userInfoCache, this.sgCache);
        });
      }
    },
    onViewSubAlarm(alarm) {
      this.$emit('update-sub-alarm', alarm);
      this.hasPic = true;
      this.loadAlarmPics({
        alarmId: alarm.alarmId,
        alarmTime: toTimezoneString(alarm.alarmTime)
      });
      this.hasVideo = true;
      this.loadAlarmVideo({
        alarmId: alarm.alarmId,
        alarmTime: toTimezoneString(alarm.alarmTime)
      });
    },
    previewImg(index) {
      this.showImgPreview = true;
      this.imgIndex = index;
    },
    getTimezoneString(time) {
      if (!time) {
        return '';
      }
      return toTimezoneString(time);
    }
  }
};
</script>

<style lang="scss" scoped>
.alarm-multi-media {
  padding-top: 8px;
  overflow: auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.alarm-pic-wrap {
  margin-bottom: 4px;
  height: 256px;
  position: relative;
  background: #dcdcdc;
}

.no-resource {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.no-resource-icon {
  font-size: 64px;
  display: block;
}

.alarm-pic {
  width: 100%;
  height: 100%;
}

.alarm-video-wrap {
  height: 256px;
  margin-bottom: 4px;
  background: #dcdcdc;
  position: relative;
}

.video-cover-img {
  display: block;
  width: 100%;
  height: 100%;
}

.play-btn {
  position: absolute;
  width: 60px;
  height: 60px;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  margin: auto;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  cursor: pointer;
}

.sub-alarm-wrap {
  flex: 1;
  margin: 0 1px 8px 0;
  padding-top: 9px;
  border: 1px solid #dedede;
  overflow: auto;
  &::v-deep {
    .el-collapse-item__header,
    .el-collapse {
      border: none;
    }
    .el-collapse-item__wrap {
      background: none;
      border: none;
    }
    .el-collapse-item__content {
      padding: 0;
    }
  }
}

.sub-alarm-title {
  line-height: 24px;
  img {
    display: inline-block;
    vertical-align: bottom;
    margin: 0 8px 0 20px;
  }
}

.sub-alarm-num {
  float: right;
}

.sub-alarm-item {
  margin: 0 8px 4px 16px;
  background: #f9fafc;
  padding: 8px 24px 8px 44px;
  position: relative;
  cursor: pointer;
  &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: -4px;
    left: 23px;
    right: 0;
    border-left: 1px dashed #dedede;
  }
  &:last-child::after {
    bottom: 0;
  }
}

.sub-alarm-time {
  color: rgba(0, 0, 0, 0.9);
  font-weight: bold;
  position: relative;
  z-index: 1;
  &::after {
    content: '';
    position: absolute;
    width: 10px;
    height: 10px;
    top: 0;
    bottom: 0;
    left: -26px;
    margin: auto 0;
    background: #d94f4f;
    border-radius: 50%;
  }
}

.sub-alarm-name {
  float: right;
}
</style>
