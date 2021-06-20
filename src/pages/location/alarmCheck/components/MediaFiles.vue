<template>
  <el-dialog
    title="提示"
    :visible.sync="dialogVisible"
    :area="[dialogWidth, dialogHeight]"
    top="10%"
    size="small"
    :before-close="handleClose"
  >
    <el-tabs v-model="activeName">
      <el-tab-pane label="图片" name="image">
        <div
          v-loading="loadingImage"
          class="h-demo-carousel"
          style="height: 450px"
        >
          <h-img-carousel
            ref="carousel"
            :data="pics"
            :view-data.sync="viewData"
            :current-index.sync="currentIndex"
            no-transition
          />
        </div>
        <h-img-snippets-btn-group theme="light-gray">
          <el-button icon="h-icon-search" @click="prev">
            上一个
          </el-button>
          <el-button icon="h-icon-search" @click="next">
            下一个
          </el-button>
          <h-img-snippets-zoom
            :scale="viewData.ratio"
            @zoom-out="zoomOut"
            @zoom-in="zoomIn"
          />
          <el-button icon="h-icon-search" @click="reset">
            适当尺寸
          </el-button>
          <el-button icon="h-icon-search" @click="selected(0)">
            首页
          </el-button>
          <el-button
            icon="h-icon-search"
            @click="selected(pics.length > 0 ? pics.length - 1 : 0)"
          >
            尾页
          </el-button>
        </h-img-snippets-btn-group>
        <h-album
          ref="album"
          theme="light-gray"
          :data="pics"
          :current-index.sync="currentIndex"
          always-center
        />
      </el-tab-pane>
      <el-tab-pane label="视频" name="video">
        <div class="alarm-multi-media">
          <div v-loading="loadingVideo" class="alarm-video-wrap">
            <div v-if="videos.length === 0" class="no-resource">
              <i class="h-icon-info_liveview no-resource-icon"></i>
              此报警无视频
            </div>
            <el-carousel
              v-else
              height="450px"
              :autoplay="false"
              indicator-position="none"
              :arrow="videos.length > 1 ? 'always' : 'never'"
            >
              <el-carousel-item v-for="item in videos" :key="item.thumbUrl">
                <playback-video
                  :service-index-code="item.serviceIndexCode"
                  :begin-time="getTimezoneString(item.beginTime)"
                  :end-time="getTimezoneString(item.endTime)"
                  :size="item.size"
                  :stream-start-time="getTimezoneString(item.streamStartTime)"
                  :stream-end-time="getTimezoneString(item.streamEndTime)"
                  :record-index-code="item.recordIndexCode"
                  :camera-index-code="item.cameraIndexCode"
                  :ngixinfo="ngixinfoTemp"
                  :user-info="userInfoTemp"
                  :cover-url="item.coverUrl"
                  :auto-play="false"
                  :is-play-app="false"
                  is-detail
                  :origin-video-id="item.originVideoId"
                ></playback-video>
              </el-carousel-item>
            </el-carousel>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script>
import { toTimezoneString } from '../../../../components/util.js';
// eslint-disable-next-line no-unused-vars
import { findAlarmPics, findAlarmVideos } from '../../../../api/alarm.js';
import PlaybackVideo from '@/components/PlaybackVideo';
import Vue from 'vue';
import Album from '@hui-pro/album';
import ImgCarousel from '@hui-pro/img-carousel';
import ImgSnippets from '@hui-pro/img-snippets';
import '@hui-pro/album/theme/index.scss';
import '@hui-pro/img-carousel/theme/index.scss';
import '@hui-pro/img-snippets/theme/index.scss';
Vue.use(Album);
Vue.use(ImgCarousel);
Vue.use(ImgSnippets);
export default {
  name: 'MediaFiles',
  components: {
    PlaybackVideo
  },
  props: {
    dialogVisible: {
      type: Boolean,
      default: function() {
        return false;
      }
    },
    mediaFilesData: {
      type: Object,
      default: function() {
        return {};
      }
    },
    filesBool: {
      type: Boolean,
      default: function() {
        return false;
      }
    },
    tableHeight: {
      type: Number,
      default: function() {
        return 0;
      }
    },
    tableWidth: {
      type: Number,
      default: function() {
        return 0;
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
      activeName: 'image',
      ngixinfoTemp: null,
      userInfoTemp: null,
      pics: [],
      videos: [],
      loadingPic: false,
      loadingVideo: false,
      loadingImage: false,
      urls: [
        {
          url: require('../../../../assets/logo.png'),
          title: '图片2'
        }
      ],
      dataWithVideo: [
        {
          url: require('../../../../assets/png/defaultDriver.png'),
          title: '图片1'
        },
        {
          url: require('../../../../assets/png/alarm-icon.png'),
          title: '图片2'
        }
      ],
      scale: 1,
      viewData: {},
      currentIndex: 0,
      dialogWidth: 0,
      dialogHeight: 0
    };
  },
  watch: {
    filesBool(val) {
      this.$nextTick(() => {
        this.selected(0);
      });
      this.activeName = 'image';
    },
    tableHeight(val) {
      this.dialogHeight = val * 0.74;
    },
    tableWidth(val) {
      this.dialogWidth = val * 0.56;
    },
    mediaFilesData: {
      handler(e) {
        this.pics = [];
        this.loadingImage = true;
        this.ngixinfoTemp = JSON.parse(JSON.stringify(this.ngixinfo));
        this.userInfoTemp = JSON.parse(JSON.stringify(this.userInfo));
        const imgParams = {
          alarmId: e.alarmId,
          alarmTime: toTimezoneString(e.beginTime),
          netDomainId: this.$store.state.userInfo.domainId
        };
        findAlarmPics(imgParams).then(res => {
          this.pics = [...res.data] || [];
          this.loadingImage = false;
        });
        const videoParams = {
          alarmId: e.alarmId,
          alarmTime: toTimezoneString(e.beginTime),
          netDomainId: this.$store.state.userInfo.domainId,
          protocol: 'rtsp'
        };
        findAlarmVideos(videoParams).then(res => {
          this.videos = [...res.data] || [];
        });
      },
      deep: true
    }
  },
  methods: {
    getTimezoneString(time) {
      if (!time) {
        return '';
      }
      return toTimezoneString(time);
    },
    handleClose() {
      this.reset();
      this.$emit('on-media-close');
    },
    prev() {
      this.$refs.carousel.$prev();
    },
    next() {
      this.$refs.carousel.$next();
    },
    selected(index) {
      this.$refs.carousel.$selected(index);
      this.$refs.album.$selected(index);
    },
    handleOnPrev(item) {
      this.$refs.album.$prev();
    },
    handleOnNext(item) {
      this.$refs.album.$next();
    },
    zoomIn(type) {
      this.$refs.carousel.$zoomIn();
    },
    zoomOut(type) {
      this.$refs.carousel.$zoomOut();
    },
    reset() {
      this.$refs.album.$reset();
      this.$refs.carousel.$resetImgView();
      this.scale = 1;
    }
  }
};
</script>

<style lang="scss" scoped>
.alarm-multi-media {
  /*padding-top: 8px;*/
  margin-top: 8px;
  /*overflow: auto;*/
  height: 450px;
  display: flex;
  flex-direction: column;
}
.no-resource {
  height: 450px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.no-resource-icon {
  font-size: 64px;
  display: block;
}
.alarm-video-wrap {
  height: 100%;
  margin-bottom: 4px;
  background: #dcdcdc;
  position: relative;
}
</style>
