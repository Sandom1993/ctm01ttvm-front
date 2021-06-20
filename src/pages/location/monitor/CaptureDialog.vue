<template>
  <div>
    <el-dialog
      :area="408"
      title="抓拍"
      :modal="false"
      size="small"
      :visible.sync="dialogVisible"
      @closed="onClosed"
    >
      <el-form ref="form" :model="form" :rules="formRule">
        <el-form-item
          label="通道名称"
          :label-width="formLabelWidth"
          prop="channel"
        >
          <el-select v-model="form.channel">
            <el-option
              v-for="item in channels"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="图片类型"
          :label-width="formLabelWidth"
          prop="picType"
        >
          <el-select v-model="form.picType">
            <el-option label="JPG" value="0"></el-option>
            <el-option label="BMP" value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="图片尺寸"
          :label-width="formLabelWidth"
          prop="picSize"
        >
          <el-select v-model="form.picSize">
            <el-option label="CIF" value="0"></el-option>
            <el-option label="QCIF" value="1"></el-option>
            <el-option label="4CIF" value="2"></el-option>
            <el-option label="UXGA" value="3"></el-option>
            <el-option label="SVGA" value="4"></el-option>
            <el-option label="HD720p" value="5"></el-option>
            <el-option label="VGA" value="6"></el-option>
            <el-option label="XVGA" value="7"></el-option>
            <el-option label="HD900p" value="8"></el-option>
            <el-option label="HD1080p" value="9"></el-option>
            <el-option label="2560 × 1920" value="10"></el-option>
            <el-option label="1600 × 304" value="11"></el-option>
            <el-option label="2048 × 1536" value="12"></el-option>
            <el-option label="2448 × 2048" value="13"></el-option>
            <el-option label="2448 × 1200" value="14"></el-option>
            <el-option label="2448 × 800" value="15"></el-option>
            <el-option label="XGA" value="16"></el-option>
            <el-option label="SXGA" value="17"></el-option>
            <el-option label="WD1" value="18"></el-option>
            <el-option label="HD1080i" value="19"></el-option>
            <el-option label="576 × 576" value="20"></el-option>
            <el-option label="1536 × 1536" value="21"></el-option>
            <el-option label="1920 × 1920" value="22"></el-option>
            <el-option label="320 × 240" value="23"></el-option>
            <el-option label="720 × 720" value="24"></el-option>
            <el-option label="1024 × 768" value="25"></el-option>
            <el-option label="1280 × 1280" value="26"></el-option>
            <el-option label="1600 × 600" value="27"></el-option>
            <el-option label="2048 × 768" value="28"></el-option>
            <el-option label="160 × 120" value="79"></el-option>
            <el-option label="336 × 256" value="75"></el-option>
            <el-option label="384 × 256" value="78"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          label="图片质量"
          :label-width="formLabelWidth"
          prop="picQuality"
        >
          <el-select v-model="form.picQuality">
            <el-option label="最好" value="0"></el-option>
            <el-option label="较好" value="1"></el-option>
            <el-option label="一般" value="2"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="capture">确定</el-button>
        <el-button @click="dialogVisible = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { capturePicture } from '@/api/location.js';

export default {
  name: 'CaptrueDialog',
  props: {
    channels: {
      type: Array,
      default: () => {
        return [];
      }
    },
    vehicleIndexCode: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      formLabelWidth: '88px',
      dialogVisible: true,
      form: {
        channel: '',
        picType: '0',
        picSize: '25',
        picQuality: '2'
      },
      formRule: {
        channel: [{ required: true, message: '请选择', trigger: 'change' }],
        picType: [{ required: true, message: '请选择', trigger: 'change' }],
        picSize: [{ required: true, message: '请选择', trigger: 'change' }],
        picQuality: [{ required: true, message: '请选择', trigger: 'change' }]
      }
    };
  },
  created() {
    this.dialogVisible = true;
  },
  methods: {
    capture() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const param = {
            vehicleIndexCode: this.vehicleIndexCode,
            channelIndexCode: this.form.channel,
            picType: parseInt(this.form.picType, 10),
            picSize: parseInt(this.form.picSize, 10),
            picQuality: parseInt(this.form.picQuality, 10)
          };
          capturePicture(param).then(json => {
            if (json.code === '0') {
              this.$message({
                type: 'success',
                message: '抓拍成功'
              });
            }
            this.dialogVisible = false;
          });
        }
      });
    },
    onClosed() {
      this.$emit('update:visible', false);
    }
  }
};
</script>
<style scoped></style>
