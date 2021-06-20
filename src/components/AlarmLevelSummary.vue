<template>
  <div class="alarm-level-summary">
    <slot name="left"></slot>
    <div v-if="showSummary">
      <span class="alarm-level-text">
        <alarm-level level="h" :text="`三级：${hCount}条`"></alarm-level>
      </span>
      <span class="alarm-level-text">
        <alarm-level level="m" :text="`二级：${mCount}条`"></alarm-level>
      </span>
      <span class="alarm-level-text">
        <alarm-level level="l" :text="`一级：${lCount}条`"></alarm-level>
      </span>
      <span class="alarm-level-text">
        <alarm-level level="w" :text="`预警：${wCount}条`"></alarm-level>
      </span>
    </div>
    <slot></slot>
  </div>
</template>

<script>
import AlarmLevel from '@/components/AlarmLevel';

export default {
  name: 'AlarmLevelSummary',
  components: {
    AlarmLevel
  },
  props: {
    hCount: {
      type: Number,
      default: 0
    },
    mCount: {
      type: Number,
      default: 0
    },
    lCount: {
      type: Number,
      default: 0
    },
    wCount: {
      type: Number,
      default: 0
    },
    showSummary: {
      type: Boolean,
      default: true
    }
  }
};
</script>

<style scoped lang="scss">
::v-deep .rm-focus {
  font-size: 16px;
}
</style>
