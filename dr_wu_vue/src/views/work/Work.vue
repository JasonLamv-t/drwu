<template>
  <div class="work">
    <el-header class="head">
      <span>DRWU</span>
      <span class="el-icon-switch-button exit" @click="doExit()"></span>
    </el-header>

    <el-menu
      class="menu"
      background-color="#303a42"
      text-color="#f0f2f5"
      :default-active="$route.path"
      router
    >
      <el-menu-item v-for="item in menu" :key="item.path" :index="item.path">
        <i class="el-icon-menu"></i>
        <span slot="title">{{ item.name }}</span>
      </el-menu-item>
    </el-menu>

    <div class="main">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menu: [
        {
          name: "机构信息",
          path: "/organ",
          show: "all",
        },
        {
          name: "医生管理",
          path: "/manage",
          show: "owner admin",
        },
        {
          name: "预约管理",
          path: "/appoint",
          show: "all",
        },
        // {
        //   name: "在线答复",
        //   path: "/online",
        //   show: "all"
        // },
        {
          name: "社区管理",
          path: "/commun",
          show: "all",
        },
      ],
    };
  },
  computed: {
    user() {
      return JSON.parse(localStorage.getItem("user"));
    },
  },
  mounted() {
    this.initMenu();
  },
  methods: {
    doExit() {
      this.$router.push("/");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    initMenu() {
      const organBool = this.user.organization && this.user.organization._id;
      const ownerBool = organBool && this.user.organization.role == "owner";
      const adminBool = organBool && this.user.organization.role == "admin";
      if (!organBool) {
        this.menu = [
          {
            name: "机构信息",
            path: "/organ",
            show: "all",
          },
        ];
      }
      else if (!ownerBool && !adminBool) {
        let index = -1;
        this.menu.forEach((item, idx) => {
          if (item.path == "/manage") index = idx;
        });
        this.menu.splice(index, 1);
      }
    },
  },
};
</script>

<style scoped>
.work {
  width: 100%;
  min-width: 1024px;
  height: 100vh;
}
.work .head {
  height: 56px !important;
  text-align: left;
  line-height: 56px;
  font-size: 24px;
  font-weight: 600;
  color: #d3d5da;
  cursor: default;
  padding: 0 23px;
  background: #303a42;
  border-bottom: 1px solid #23272b;
}
.work .head .exit {
  float: right;
  line-height: 56px;
  cursor: pointer;
}
.work .menu {
  width: 180px;
  height: calc(100vh - 56px);
  text-align: left;
  user-select: none;
  display: inline-block;
  border-right: none;
}
.work .menu i {
  vertical-align: top;
  line-height: 56px;
}
.work .main {
  width: calc(100% - 180px);
  height: calc(100vh - 56px);
  overflow-y: scroll;
  display: inline-block;
  vertical-align: top;
}
</style>