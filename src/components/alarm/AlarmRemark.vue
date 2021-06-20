<template>
  <div class="wrap">
    <el-dropdown trigger="click" placement="bottom">
      <el-button type="primary">
        备注模板
        <i class="h-icon-angle_down_sm el-icon--right"></i>
      </el-button>
      <el-dropdown-menu slot="dropdown" class="template-dropdown">
        <el-dropdown-item @click.native="addTemplate">
          <el-button type="text" icon="h-icon-add">添加模板</el-button>
        </el-dropdown-item>
        <el-dropdown-item v-for="item of templates" :key="item.id">
          <div class="template-dropdown-item">
            <span
              class="template-dropdown-text"
              :title="item.messageContent"
              @click="selectTemp(item)"
            >
              {{ item.messageContent }}
            </span>
            <span class="template-dropdown-btn">
              <el-button
                icon="h-icon-edit"
                title="编辑"
                @click="editTemplate(item)"
              />
              <el-button
                icon="h-icon-delete"
                title="删除"
                @click="deleteTemplate(item)"
              />
            </span>
          </div>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <el-dialog
      :title="remarkTemplateTitle"
      :visible.sync="templateDialogVisible"
      :area="480"
    >
      <el-input
        v-model="remarkTemplate"
        type="textarea"
        style="width:100%;"
        :rows="4"
        :count="200"
      ></el-input>
      <div slot="footer" class="dialog-footer">
        <el-button
          type="primary"
          :loading="addTemplateloading"
          @click="addTemp()"
        >
          确定
        </el-button>
        <el-button @click="templateDialogVisible = false">
          取消
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import {
  getTxTTemp,
  addTxTTemp,
  deleteTxTTemp,
  updateTxTTemp
} from '@/api/location.js';

export default {
  name: 'AlarmRemark',
  data() {
    return {
      templates: [],
      templateDialogVisible: false,
      remarkTemplate: '',
      isAddTemplate: true,
      editTemplateId: null,
      addTemplateloading: false
    };
  },
  computed: {
    remarkTemplateTitle() {
      return this.isAddTemplate ? '添加模板' : '修改模板';
    }
  },
  created() {
    this.getTemplates();
  },
  methods: {
    deleteTemplate(template) {
      this.$confirm('删除模板?', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'question'
      }).then(() => {
        deleteTxTTemp([template.id]).then(json => {
          if (json.code === '0') {
            this.getTemplates();
            this.$message({
              type: 'success',
              message: '删除成功'
            });
          }
        });
      });
    },
    editTemplate(template) {
      this.editTemplateId = template.id;
      this.remarkTemplate = template.messageContent;
      this.isAddTemplate = false;
      this.templateDialogVisible = true;
    },
    addTemplate() {
      this.isAddTemplate = true;
      this.remarkTemplate = '';
      this.templateDialogVisible = true;
    },
    addTemp() {
      if (!this.remarkTemplate) {
        this.$message({
          type: 'warning',
          message: '模板不能为空'
        });
        return;
      }
      if (this.remarkTemplate.length > 200) {
        this.$message({
          type: 'warning',
          message: '模板内容长度不能超过200'
        });
        return;
      }
      this.addTemplateloading = true;
      if (this.isAddTemplate) {
        addTxTTemp({
          messageType: 1,
          messageContent: this.remarkTemplate
        })
          .then(json => {
            if (json.code === '0') {
              this.$message({
                type: 'success',
                message: '添加成功'
              });
              this.templateDialogVisible = false;
              this.getTemplates();
            }
          })
          .finally(() => {
            this.addTemplateloading = false;
          });
      } else {
        updateTxTTemp({
          id: this.editTemplateId,
          messageType: 1,
          messageContent: this.remarkTemplate
        })
          .then(json => {
            if (json.code === '0') {
              this.$message({
                type: 'success',
                message: '修改成功'
              });
              this.templateDialogVisible = false;
              this.getTemplates();
            }
          })
          .finally(() => {
            this.addTemplateloading = false;
          });
      }
    },
    selectTemp(template) {
      this.$emit('select-template', template.messageContent);
    },
    getTemplates() {
      getTxTTemp(1).then(json => {
        if (json.code === '0') {
          this.templates = json.data || [];
        }
      });
    }
  }
};
</script>
<style scoped>
.wrap {
  display: inline-block;
}
.template-dropdown {
  width: 360px;
  max-height: 400px;
  overflow: auto;
}
.template-dropdown-item {
  display: flex;
  justify-content: space-between;
}
.template-dropdown-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.template-dropdown-btn {
  display: none;
}
.template-dropdown-item:hover .template-dropdown-btn {
  display: block;
}
</style>
