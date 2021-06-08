<template>
  <div class="login">
    <embed src="image/background.svg" />
    <el-form ref="login" :model="login" :rules="login.rules" class="login-box">
      <div class="head">登录</div>
      <el-form-item label="帐号" prop="username">
        <el-input v-model="login.username" placeholder="请输入用户名/手机号"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="login.password" type="password" placeholder="请输入用户密码"></el-input>
      </el-form-item>
      <el-form-item label>
        <el-button class="regist-btn" plain @click="goRegist()">注册</el-button>
        <el-button class="login-btn" type="primary" @click="doLogin()">立即登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      login: {
        username: null,
        password: null,
        rules: {
          username: [
            { required: true, message: "帐号不能为空", trigger: "blur" }
          ],
          password: [
            { required: true, message: "密码不能为空", trigger: "blur" }
          ]
        }
      }
    };
  },
  methods: {
    doLogin() {
      this.$refs.login.validate(valid => {
        if (!valid) return false;
        this.apiAcc
          .login({
            username: this.login.username,
            password: this.login.password
          })
          .then(res => {
            if (!res.error && res.data) {
              this.$message.success(res.message);
              localStorage.setItem("token", res.data.token);
              localStorage.setItem("user", JSON.stringify(res.data.info));
              this.$router.push("/organ");
            } else {
              console.info(res);
              this.$message.error(res.message);
            }
          });
      });
    },
    goRegist() {
      if (this.$route.path != "/regist") this.$router.push("/regist");
    }
  }
};
</script>

<style scoped>
.login {
  width: 100%;
  height: 100vh;
  background: #eef0f3;
  user-select: none;
}
.login embed {
  width: 100%;
  height: 100vh;
}
.login .login-box {
  width: 360px;
  height: 380px;
  background-color: #ffffff;
  border-radius: 4px;
  margin: -220px -180px;
  position: absolute;
  left: 50%;
  top: 50%;
}
.login .login-box .head {
  line-height: 56px;
  color: #606266;
  font-size: 24px;
  text-align: left;
  border-bottom: 1px #dcdfe6 solid;
  margin-bottom: 18px;
  padding: 8px 30px 0;
}
.login .login-box .el-form-item {
  padding: 0 30px;
  box-sizing: border-box;
  margin-bottom: 8px;
}
.login .login-box .regist-btn {
  width: 25%;
  margin-top: 25px;
  display: inline-block;
}
.login .login-box .login-btn {
  width: calc(75% - 10px);
  margin-top: 25px;
  display: inline-block;
}
</style>
<style>
.login-box .el-form-item__error {
  line-height: 34px;
  text-align: right;
  position: absolute;
  right: 0;
  top: 0;
}
</style>