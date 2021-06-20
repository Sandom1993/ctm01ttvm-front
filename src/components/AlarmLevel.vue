<template>
  <span>
    <span class="vehicle-status-icon" :class="cls"></span>
    <template v-if="txt">{{ txt }}</template>
  </span>
</template>

<script>
const levels = {
  h: {
    cls: 'red',
    text: '三级'
  },
  m: {
    cls: 'orange',
    text: '二级'
  },
  l: {
    cls: 'yellow',
    text: '一级'
  },
  w: {
    cls: 'blue',
    text: '预警'
  },
  unknown: {
    cls: 'blue'
  }
};
export default {
  name: 'AlarmLevel',
  props: {
    level: {
      type: String,
      default: 'unknown'
    },
    text: {
      type: String,
      default: ''
    }
  },
  computed: {
    cls() {
      return levels[this.level] ? levels[this.level].cls : '';
    },
    txt() {
      return this.text
        ? this.text
        : levels[this.level]
        ? levels[this.level].text
        : '';
    }
  }
};
</script>
