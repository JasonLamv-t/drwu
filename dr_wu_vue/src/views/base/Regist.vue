<template>
  <div class="regist">
    <embed src="image/background.svg" />
    <el-form ref="regist" :model="regist" :rules="regist.rules" class="regist-box">
      <div class="head">注册医生</div>
      <!-- 用户名 -->
      <el-form-item v-show="regist.step == 1" label="用户名" prop="username">
        <el-input v-model="regist.username" placeholder="6 - 16位数字、字母、下划线、连字符"></el-input>
      </el-form-item>
      <!-- 密码 -->
      <el-form-item v-show="regist.step == 1" label="密码" prop="password">
        <el-input v-model="regist.password" type="password" placeholder="6 - 20位字符串，至少包含字母跟数字"></el-input>
      </el-form-item>
      <!-- 手机号 -->
      <el-form-item v-show="regist.step == 2" label="手机号" prop="phone">
        <el-input v-model="regist.phone" placeholder="请输入手机号">
          <el-button slot="append" class="code-btn" :disabled="regist.down>0" @click="getCode()">
            <span>{{ regist.down>0?'已发送('+regist.down+')':'获取验证码' }}</span>
          </el-button>
        </el-input>
      </el-form-item>
      <!-- 验证码 -->
      <el-form-item v-show="regist.step == 2" label="验证码" prop="code">
        <el-input v-model="regist.code" placeholder="请输入验证码"></el-input>
      </el-form-item>
      <!-- 真实姓名 -->
      <el-form-item v-show="regist.step == 3" label="真实姓名" prop="realName">
        <el-input v-model="regist.realName" placeholder="请输入真实姓名"></el-input>
      </el-form-item>
      <!-- 性别 -->
      <el-form-item v-show="regist.step == 3" label="性别" prop="sex">
        <el-radio-group v-model="regist.sex" style="width: 100%;text-align: left;">
          <el-radio label="male">男</el-radio>
          <el-radio label="female">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 步骤 -->
      <el-form-item label>
        <el-button v-show="regist.step>1" class="prev-btn" plain @click="onPrev()">上一步</el-button>
        <el-button v-show="regist.step<3" class="next-btn" type="primary" @click="onNext()">下一步</el-button>
        <el-button v-show="regist.step==3" class="next-btn" type="primary" @click="doRegist()">创建账号</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
// import jwt from "jsonwebtoken";
export default {
  data() {
    return {
      regist: {
        step: 1,
        down: 0,
        code: null,
        vcode: Date.now(),
        username: null,
        password: null,
        phone: null,
        nickname: null,
        realName: null,
        sex: "male",
        type: "user",
        rules: {
          username: [
            { required: true, message: "用户名不能为空", trigger: "blur" },
            {
              min: 6,
              max: 16,
              message: "长度在 6 到 16 个字符",
              trigger: "blur"
            },
            {
              required: true,
              validator: (rule, value, callback) => {
                if (!/^[-0-9a-zA-Z_]{1,}$/.test(value))
                  callback(
                    new Error("用户名只能包含数字、字母、下划线、连字符")
                  );
                else callback();
              },
              trigger: "blur"
            }
          ],
          password: [
            { required: true, message: "密码不能为空", trigger: "blur" },
            {
              min: 6,
              max: 20,
              message: "长度在 6 到 20 个字符",
              trigger: "blur"
            },
            {
              required: true,
              validator: (rule, value, callback) => {
                if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,23}$/.test(value))
                  callback(new Error("密码应至少包含字母跟数字"));
                else callback();
              },
              trigger: "blur"
            }
          ],
          phone: [
            { required: true, message: "手机号不能为空", trigger: "blur" },
            {
              required: true,
              validator: (rule, value, callback) => {
                if (!/^1\d{10}$/.test(value))
                  callback(new Error("手机号格式错误"));
                else callback();
              },
              trigger: "blur"
            }
          ],
          code: [
            { required: true, message: "验证码不能为空", trigger: "blur" },
            {
              required: true,
              validator: (rule, value, callback) => {
                if (value != this.regist.vcode)
                  callback(new Error("验证码错误"));
                else callback();
              },
              trigger: "blur"
            }
          ],
          realName: [
            { required: true, message: "真实姓名不能为空", trigger: "blur" }
          ]
        }
      }
    };
  },
  methods: {
    // 注册
    doRegist() {
      this.$refs.regist.validate(valid => {
        if (!valid) return false;
        this.apiAcc
          .regist({
            username: this.regist.username,
            password: this.regist.password,
            phone: this.regist.phone,
            nickname: this.regist.realName,
            realName: this.regist.realName,
            sex: this.regist.sex,
            type: "doctor"
          })
          .then(res => {
            if (res.message == "注册成功") {
              this.$message.success(res.message);
              localStorage.setItem("token", res.data.token);
              localStorage.setItem("user", JSON.stringify(res.data.info));
              this.$router.push("/organ");
            }
          });
      });
    },
    // 获取验证码
    getCode() {
      this.$refs.regist.validateField(["phone"], valid => {
        if (valid) return;
        this.apiAcc
          .code({
            phone: this.regist.phone
          })
          .then(res => {
            if (!res) return this.$message.error("短信发送失败");
            this.regist.vcode = res.data.code;
            this.$message.success(res.message);
            this.$set(this.regist, "down", 60);
            let interval = setInterval(() => {
              this.$set(this.regist, "down", this.regist.down - 1);
              if (this.regist.down < 1) clearInterval(interval);
            }, 1000);
          });
      });
    },
    // 上一步
    onPrev() {
      this.regist.step -= 1;
    },
    // 下一步
    onNext() {
      if (this.regist.step == 1) {
        let count = 2;
        this.$refs.regist.validateField(["username", "password"], valid => {
          if (!valid && !--count) this.regist.step += 1;
        });
        return;
      }
      if (this.regist.step == 2) {
        let count = 2;
        this.$refs.regist.validateField(["phone", "code"], valid => {
          if (!valid && !--count) this.regist.step += 1;
        });
        return;
      }
      if (this.regist.step == 3) {
        let count = 1;
        this.$refs.regist.validateField(["realName"], valid => {
          if (!valid && !--count) this.regist.step += 1;
        });
        return;
      }
    }
  }
};
</script>

<style scoped>
.regist {
  width: 100%;
  height: 100vh;
  background: #eef0f3;
  user-select: none;
}
.regist embed {
  width: 100%;
  height: 100vh;
}
.regist .regist-box {
  width: 360px;
  height: 380px;
  background-color: #ffffff;
  border-radius: 4px;
  margin: -220px -180px;
  position: absolute;
  left: 50%;
  top: 50%;
}
.regist .regist-box .head {
  line-height: 56px;
  color: #606266;
  font-size: 24px;
  text-align: left;
  border-bottom: 1px #dcdfe6 solid;
  margin-bottom: 18px;
  padding: 8px 30px 0;
}
.regist .regist-box .el-form-item {
  min-height: 81px;
  padding: 0 30px;
  box-sizing: border-box;
  margin-bottom: 8px;
}
.regist .regist-box .code-btn.is-disabled:hover {
  color: unset !important;
  background: unset !important;
}
.regist .regist-box .prev-btn {
  width: calc(30% - 5px);
  margin-top: 25px;
  float: left;
}
.regist .regist-box .next-btn {
  width: calc(70% - 5px);
  margin-top: 25px;
  float: right;
}
</style>
<style>
.regist-box .el-form-item__error {
  line-height: 34px;
  text-align: right;
  position: absolute;
  right: 0;
  top: 0;
}
</style>