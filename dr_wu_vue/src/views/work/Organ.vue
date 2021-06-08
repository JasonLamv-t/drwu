<template>
  <div class="organ">
    <div class="label" v-if="!organ">
      <span>您当前未绑定机构，可以请管理员绑定或</span>
      <el-button type="text" @click="onCreateOrgan()">创建机构</el-button>
      <!-- <span>您当前未绑定机构，请管理员绑定。</span> -->
    </div>

    <el-button
      class="edit-btn"
      :type="!onEdit ? 'primary' : 'success'"
      @click="onEditOrgan()"
      v-if="canEditOrgan && organ"
    >
      <span v-show="!onEdit">编辑信息</span>
      <span v-show="onEdit">完成编辑</span>
    </el-button>

    <el-form class="info" v-if="organ">
      <el-form-item label="机构名称">
        <el-input v-model="organ.name" :disabled="!onEdit"></el-input>
      </el-form-item>

      <el-form-item label="机构简介">
        <el-input
          v-model="organ.introduce"
          type="textarea"
          :disabled="!onEdit"
          autosize
        >
        </el-input>
      </el-form-item>

      <el-form-item label="联系方式">
        <el-input v-model="organ.phone" :disabled="!onEdit"></el-input>
      </el-form-item>

      <el-form-item label="机构位置">
        <el-input
          v-model="organ.address"
          type="textarea"
          :disabled="!onEdit"
          autosize
        >
        </el-input>
      </el-form-item>

      <el-form-item label="服务时间">
        <el-input v-model="serviceTime" :disabled="!onEdit"></el-input>
      </el-form-item>

      <el-form-item label="更新时间">
        <el-input v-model="updateTime" :disabled="!onEdit"></el-input>
      </el-form-item>
    </el-form>

    <!-- 创建机构弹窗 -->
    <el-dialog
      title="创建机构"
      :visible.sync="dialog.createOrgan"
      :close-on-click-modal="false"
      class="create-organ"
      width="500px"
    >
      <el-form
        size="medium"
        :model="createOrgan"
        :rules="createOrgan.rules"
        ref="createOrgan"
      >
        <el-form-item label="机构名称" prop="name">
          <el-input v-model="createOrgan.name" placeholder="请输入机构名称">
          </el-input>
        </el-form-item>

        <el-form-item label="机构简介" prop="introduce">
          <el-input
            v-model="createOrgan.introduce"
            type="textarea"
            placeholder="请输入机构简介"
          >
          </el-input>
        </el-form-item>

        <el-form-item label="联系方式" prop="phone">
          <el-input
            v-model="createOrgan.phone"
            placeholder="请输入联系电话或手机号"
          >
          </el-input>
        </el-form-item>

        <el-form-item label="机构地址" prop="address">
          <el-input
            v-model="createOrgan.address"
            type="textarea"
            placeholder="请输入机构地址"
          >
          </el-input>
        </el-form-item>

        <el-form-item label="服务时间" prop="serviceTime">
          <el-time-select
            v-model="createOrgan.serviceTime.start"
            :picker-options="{
              start: '00:00',
              end: '24:00',
              maxTime: createOrgan.serviceTime.end,
            }"
            placeholder="服务开始时间"
          >
          </el-time-select>
          <span class="span">至</span>
          <el-time-select
            v-model="createOrgan.serviceTime.end"
            :picker-options="{
              start: '00:00',
              end: '24:00',
              minTime: createOrgan.serviceTime.start,
            }"
            placeholder="服务结束时间"
          >
          </el-time-select>
        </el-form-item>
      </el-form>

      <div class="foot">
        <el-button size="medium" @click="dialog.createOrgan = false">
          取消
        </el-button>
        <el-button size="medium" type="primary" @click="doCreateOrgan()">
          创建
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dialog: {
        createOrgan: false,
        bindOrgan: false,
      },
      createOrgan: {
        name: null,
        introduce: null,
        phone: null,
        address: null,
        serviceTime: {
          start: "00:00",
          end: "24:00",
        },
        rules: {
          name: [
            { required: true, message: "请输入机构名称", trigger: "blur" },
          ],
          introduce: [
            { required: true, message: "请输入机构简介", trigger: "blur" },
          ],
          phone: [
            {
              required: true,
              message: "请输入联系电话或手机号",
              trigger: "blur",
            },
            {
              required: true,
              validator: (rule, value, callback) => {
                if (!/^1\d{10}$|^0\d{2,3}-?\d{7,8}$/.test(value))
                  callback(new Error("电话或手机号格式错误"));
                else callback();
              },
              trigger: "blur",
            },
          ],
          address: [
            { required: true, message: "请输入机构地址", trigger: "blur" },
          ],
          serviceTime: [
            { required: true, message: "选择机构服务时间", trigger: "blur" },
          ],
        },
      },
      organ: {},
      onEdit: false,
    };
  },
  computed: {
    serviceTime() {
      if (!this.organ.serviceTime) return;
      return this.organ.serviceTime.start + " 至 " + this.organ.serviceTime.end;
    },
    createTime() {
      if (!this.organ.createTime) return;
      return this.organ.createTime.replace("T", " ").slice(0, 16);
    },
    updateTime() {
      if (!this.organ.updateTime) return;
      return this.organ.updateTime.replace("T", " ").slice(0, 16);
    },
    canEditOrgan() {
      const ownerBool =
        this.user.organization &&
        this.user.organization._id &&
        this.user.organization.role == "owner";
      const adminBool =
        this.user.organization &&
        this.user.organization._id &&
        this.user.organization.role == "admin";
      return ownerBool || adminBool;
    },
    user() {
      return JSON.parse(localStorage.getItem("user"));
    },
  },
  mounted() {
    this.getUserOrg();
  },
  methods: {
    onEditOrgan() {
      this.onEdit = !this.onEdit;
      if (!this.onEdit) {
        this.apiOrg.putOrg(this.organ).then((res) => {
          console.info(res);
        });
      }
    },
    onCreateOrgan() {
      this.dialog.createOrgan = true;
    },
    doCreateOrgan() {
      this.$refs.createOrgan.validate((valid) => {
        if (!valid) return this.$message.error("请完善相关信息");
        this.apiOrg
          .postOrg({
            name: this.createOrgan.name,
            introduce: this.createOrgan.introduce,
            phone: this.createOrgan.phone,
            address: this.createOrgan.address,
            serviceTime: this.createOrgan.serviceTime,
          })
          .then((res) => {
            if (!res.error) {
              this.$message.success(res.message);
              this.dialog.createOrgan = false;
              this.getUserOrg();
            } else {
              this.$message.error(res.message);
            }
          });
      });
    },
    getUserOrg() {
      this.apiOrg.getOrg().then((res) => {
        if (!res.error) this.organ = res.data;
        else console.info(res.message);
        // console.info(this.organ);
      });
    },
  },
};
</script>

<style scoped>
.organ {
  padding: 0 25px;
  box-sizing: border-box;
}
.organ .label {
  line-height: 56px;
  font-size: 14px;
  text-align: left;
}
.organ .label .el-button {
  margin: 0 5px;
}
.organ .edit-btn {
  position: fixed;
  left: 750px;
  top: 85px;
  margin: 20px 0;
  display: block;
}
.organ .info {
  max-width: 500px;
  margin-top: 10px;
}
.organ .info .el-form-item {
  margin-bottom: 5px;
}
</style>

<style>
.create-organ {
  text-align: left;
}
.create-organ .el-dialog__header {
  border-bottom: 1px solid #c5cdd4;
  user-select: none;
}
.create-organ .el-dialog__body {
  padding: 15px 20px;
}
.create-organ .el-form-item {
  margin-bottom: 5px;
}
.create-organ .el-form-item__label {
  width: 100%;
  text-align: left;
}
.create-organ .el-date-editor--time-select {
  width: calc(50% - 20px);
}
.create-organ .span {
  width: 40px;
  display: inline-block;
  text-align: center;
}
.create-organ .foot {
  text-align: right;
  margin: 40px 0 10px;
}
.create-organ .el-form-item__error {
  line-height: 34px;
  text-align: right;
  position: absolute;
  right: 0;
  top: 0;
}
.organ .info .is-disabled .el-input__inner,
.organ .info .is-disabled .el-textarea__inner {
  cursor: default;
  color: #606266;
  resize: none;
}
</style>