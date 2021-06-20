<template>
  <h-layout v-loading="pageLoading" class="page-wrap">
    <h-layout-header>
      <div class="breadcrumb-wrap">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item v-for="item in headPath" :key="item">
            {{ item }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </h-layout-header>
    <h-layout-content>
      <el-card class="box-card">
        <el-form content-width="400px" label-width="200px" class="form">
          <el-form-item :label="label">
            <el-input-number
              v-model="config.threshold"
              :min="minValue"
              :max="maxValue"
            ></el-input-number>
          </el-form-item>
        </el-form>
      </el-card>
    </h-layout-content>
    <h-layout-footer class="footer">
      <el-button type="primary" :loading="loading" @click="onSave">
        保存
      </el-button>
    </h-layout-footer>
  </h-layout>
</template>

<script>
import { findTimeConfigByType, updateTimeConfig } from '@/api/sysconfig';

export default {
  name: 'LongOffline',
  props: {
    crumb: {
      type: String,
      default: ''
    },
    type: {
      type: Number,
      default: 1
    },
    label: {
      type: String,
      default: ''
    },
    maxValue: {
      type: Number,
      default: 10
    },
    minValue: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      config: {
        id: null,
        threshold: 1
      },
      loading: false,
      pageLoading: false
    };
  },
  computed: {
    headPath() {
      const path = localStorage.portal_config_crumbs
        ? localStorage.portal_config_crumbs
        : `系统管理/应用配置中心/交运车辆监控配置/${this.crumb}`;
      return path.split('/');
    }
  },
  created() {
    this.pageLoading = true;
    findTimeConfigByType({
      type: this.type
    })
      .then(json => {
        if (json.code === '0') {
          this.config = json.data;
        }
      })
      .finally(() => {
        this.pageLoading = false;
      });
  },
  methods: {
    onSave() {
      this.loading = true;
      updateTimeConfig({
        id: this.config.id,
        type: this.type,
        threshold: this.config.threshold
      })
        .then(json => {
          if (json.code === '0') {
            this.$message.success('保存成功');
          }
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.page-wrap {
  background: #f5f5f5;
}

.form {
  width: 600px;
  margin: 20px auto;
}

.breadcrumb-wrap {
  height: 48px;
  box-shadow: 0 0.01rem 0.06rem rgba(0, 0, 0, 0.15);
  background-color: #fff;
  display: flex;
  align-items: center;
}

.breadcrumb-wrap > .el-breadcrumb {
  margin-left: 8px;
}

.footer {
  padding: 20px 0;
  text-align: center;
  background: #fff;
}
</style>
