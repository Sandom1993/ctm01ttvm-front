<template>
  <div class="card-container">
    <span class="plateno"><i class="h-icon-car"></i><span>{{plateNo}}</span></span>
    <span class="time">{{startTime}}—{{endTime}}</span>
    <i @click="close" :class="myClass"></i>
  </div>
</template>

<script>
export default {
  name: 'SelectedCar2d',
  data: function() {
    return {
      plateNo: '暂无数据',
      startTime: '暂无数据',
      endTime: '暂无数据',
      myClass: 'h-icon-angle_down'
    }
  },
  methods: {
    setParams(plateNo, startTime, endTime) {
      this.plateNo = plateNo;
      this.startTime = startTime;
      this.endTime = endTime;
    },
    close () {
      this.myClass = this.myClass === 'h-icon-angle_down down' ? 'h-icon-angle_down' : 'h-icon-angle_down down'
      this.$emit('close')
    }
  },
};
</script>

<style lang="scss" scoped>
  .card-container {
    background-color: white;
    width: 422px;
    height: 46px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    font-size: 14px;
    box-shadow: 0 2px 5px 0 ;
    .time {
      color: #FF952C;
    }
    .plateno {
      display: flex;
      align-items: center;
      span {
        line-height: 14px;
      }
    }
    .h-icon-angle_down {
      transition: all 0.5s;
    }
    .down {
      transform: rotate(180deg);
    }
  }
</style>
