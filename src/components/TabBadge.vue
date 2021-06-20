<template>
  <span slot="label" class="tab-label">
    <slot></slot>
    <span v-if="showBadge && value > 0" class="badge">{{ number }}</span>
  </span>
</template>

<script>
export default {
  name: 'TabBadge',
  props: {
    value: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 99
    },
    showBadge: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    number() {
      if (this.value > this.max) {
        return this.max + '+';
      }
      return this.value;
    }
  }
};
</script>

<style lang="scss" scoped>
.tab-label {
  position: relative;
  .badge {
    position: absolute;
    top: -3px;
    line-height: 12px;
    right: -18px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #f5f5f5;
    color: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(0, 0, 0, 0.2);
    text-align: center;
    font-size: 10px;
  }
}

.is-active .tab-label .badge {
  color: #2080f7;
  border: 1px solid #2080f7;
  background: none;
}
</style>
