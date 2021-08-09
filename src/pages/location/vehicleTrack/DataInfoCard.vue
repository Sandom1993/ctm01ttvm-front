<template>
  <div class="data-card-container">
    <div class="card gps">
      <img src="" alt="" />
      <span>{{gps}}<span>个</span></span>
      <span>GPS总数</span>
    </div>
    <div class="card ava">
      <img src="" alt="" />
      <span>{{ava}}<span>个</span></span>
      <span>有效个数</span>
    </div>
<!--    <div class="card unava">
      <img src="" alt="" />
      <span>{{unava}}<span>个</span></span>
      <span>无效个数</span>
    </div>
    <div class="card pop">
      <img src="" alt="" />
      <span>{{pop}}</span>
      <span>合格率</span>
    </div>
    <div class="card pot">
      <img src="" alt="" />
      <span>{{pot}}</span>
      <span>轨迹完整率</span>
    </div>
    <div class="card pov">
      <img src="" alt="" />
      <span>{{pov}}</span>
      <span>数据有效率</span>
    </div>-->
      <div class="card mil">
      <img src="" alt="" />
      <span>{{mil}}<span>km</span></span>
      <span>行驶里程数</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataInfoCard',
  props: {
    gps: {
      type: Number,
      default: null,
    },
    ava: {
      type: Number,
      default: null,
    },
    unava: {
      type: Number,
      default: null,
    },
    pop: {
      type: String,
      default: null,
    },
    pot: {
      type: String,
      default: null,
    },
    mil: {
      type: Number,
      default: null,
    },
  }
};
</script>

<style lang="scss" scoped>
  .data-card-container {
    background-color: white;;
    width: 422px;
    height: 128px;
    display: flex;
    // flex-direction: column;
    flex-wrap: wrap;
    justify-content: space-around;
    align-items: center;
    padding: 0 4px;
    .card {
      width: 130px;
      height: 112px;
      border-radius: 2px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      span:nth-child(2) {
        font-family: MicrosoftYaHeiUI-Bold;
        font-weight: bold;
        font-size: 24px;
        color: white;
        span {
          font-size: 11px;
          font-weight: normal;
        }
      }
      span:nth-child(3) {
        font-size: 14px;
        color: rgba(0,0,0,0.32);
        font-weight: bold;
      }
    }
    .gps {
      background: #58A0F9;
    }
    .ava {
      background: #17B687;
    }
    .unava {
      background: #FA885C;
    }
    .pop {
      background: #00A171;
    }
    .pot {
      background: #718FE8;
    }
    .mil {
      background: #EAC045;
    }
  }
</style>
