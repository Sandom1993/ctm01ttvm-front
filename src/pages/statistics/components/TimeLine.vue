<template>
<!-- 警情流转记录组件 -->
  <div class="time-line-wrap">
    <span v-if="eventList.length === 0">暂无流转记录</span>
    <div
    :class="{'time-line-item': 1, 'last-item': index === eventList.length - 1}"
    v-for="(item, index) in eventList"
    :key="index">
      <span class="time">{{new Date(item.recordTime + 8 * 60 * 60 * 1000).toISOString().split('.')[0].split('T').join(' ')}}</span>
      <span class="valid text-bold">{{item.valid === -2 ? '处警' : '核警'}}</span>
      <span
      :class="{'valid-status': 1,
      'text-warning': item.valid === -1,
      'text-danger': item.valid === 0,
      'text-pass': item.valid === 1}" v-if="item.valid !== -2">{{validTrans[item.valid.toString()]}}</span>
      <span class="user text-bold">{{item.userId}}</span>
      <span class="remark">{{item.alarmRemark}}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TimeLine',
  props: {
    eventList: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      validTrans: {
        "0": '误报',
        '1': '有效',
        '-1': '存疑'
      }
    }
  }

}
</script>

<style lang="scss" scoped>
  .time-line-wrap {
    overflow: auto;
  }
  .time-line-item {
      margin-top:10px; // add by cy 2021.05.19
    position: relative;
    min-height: 60px; // update by cy 2021.05.19
    height: auto; // add by cy 2021.05.19
    padding-left: 30px;
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      overflow: auto;
      box-sizing: content-box;
      background-color: #ff992a;
      border: 4px solid #FFD6AA;
      // border:
    }
    &::after {
      content: '';
      position: absolute;
      top: 10px;
      left: 8px;
      border-left:1px silver dashed;
      // width: 1px;
      height: 100%;
    }
    span {
      font-family: MicrosoftYaHeiUI;
      font-size: 14px;
      color: rgba(0,0,0,0.50);
      letter-spacing: 0;
    }
    .text-bold {
      color: rgba(0,0,0,0.80);
      font-weight: bold;
    }
    .time {
      display: inline-block;
      min-width: 150px;
      width: 60%;
    };
    .valid {
      display: inline-block;
      text-align: center;
      width: 15%;
    }
    .valid-status {
      position: relative;
      display: inline-block;
      width: 40px;
      text-align: center;
      margin-left: 5px;
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 5px;
        width: 2px;
        height: 10px;
        background-color: #ccc;
      }
    }
    .user {
      display: inline-block;
      width: 30%;
      min-width: 60px;
      margin-top: 10px;
    }
    .remark {
      display: inline-block;

    }
  }
  .text {
    &-danger {
      color: red!important;
    }
    &-warning {
      color: rgb(255, 166, 0)!important;
    }
    &-pass {
      color: green!important;
    }
  }
  .last-item {
    &::after {
      content: '';
      border: none;
    }
  }
</style>
