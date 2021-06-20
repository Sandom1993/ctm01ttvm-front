<template>
  <div class="tree-wrap">
    <div class="title">非标视频车辆列表</div>
    <div class="inner">
      <vehicle-tree
        ref="resourceTree"
        tree-key="indexCode"
        tree-type="7"
        :check-limit="2000"
        :is-need-online="true"
        :is-need-search-type="true"
        :is-need-check-box="false"
        :render-content="renderContent"
      ></vehicle-tree>
    </div>
  </div>
</template>
<script>
import VehicleTree from '@/components/Tree';

export default {
  name: 'NonStandardVideo',
  components: {
    VehicleTree
  },
  methods: {
    renderContent(h, { node, data, store }) {
      return (
        <span style='white-space: normal; margin-left: 6px; vertical-align: middle;'>
          <span>
            <span>{node.label}</span>
          </span>
          {!data.parent ? (
            <span style='float: right; margin-right: 5px;'>
              <el-button
                size='mini'
                icon='rm-play'
                on-click={() => this.onPreview(data)}
                title='实时预览'
              ></el-button>
              <el-button
                size='mini'
                icon='rm-playBack'
                on-click={() => this.onPlayBack(data)}
                title='历史回放'
              ></el-button>
            </span>
          ) : (
            ''
          )}
        </span>
      );
    },
    onPreview(data) {
      window.open(`http://${data.remark}/realtime/${data.name}`);
    },
    onPlayBack(data) {
      window.open(`http://${data.remark}/history/${data.name}`);
    }
  }
};
</script>

<style src="@/pages/location/monitor/monitor.scss" lang="scss" scoped></style>
<style src="@/pages/location/location.css"></style>
