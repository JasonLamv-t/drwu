<template>
  <div class="appo">
    <div class="head">
      <el-input
        v-model="search"
        size="medium"
        placeholder="搜索医生/用户"
        @keydown.enter.native="getDoctorList()"
      >
        <el-button slot="append" icon="el-icon-search" @click="getDoctorList()"></el-button>
      </el-input>
    </div>

    <el-table :data="appoList" border>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="医生" width="50">
        <template slot-scope="{ row }">
          <el-avatar :src="row.doctor.avatar" style="vertical-align: middle;" :size="26"></el-avatar>
        </template>
      </el-table-column>
      <el-table-column label width="120">
        <template slot-scope="{ row }">{{ row.doctor.name }}</template>
      </el-table-column>
      <el-table-column label="用户" width="50">
        <template slot-scope="{ row }">
          <el-avatar :src="row.client.avatar" style="vertical-align: middle;" :size="26"></el-avatar>
        </template>
      </el-table-column>
      <el-table-column label width="120">
        <template slot-scope="{ row }">{{ row.client.name }}</template>
      </el-table-column>
      <el-table-column prop="phone" label="用户联系电话" width></el-table-column>
      <el-table-column label="状态" width="120">
        <template slot-scope="{ $index, row }">
          <el-select v-model="row._status" @change="onStaChange($index, row)" size="mini">
            <el-option value="confirming">确认中</el-option>
            <el-option value="refused">拒绝</el-option>
            <el-option value="confirmed">已确认</el-option>
            <el-option value="end">已结束</el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column type="expand" label="详情">
        <template slot-scope="{ row }">
          <p>
            <span style="margin-right: 10px">医生姓名:</span>
            <span>{{ row.doctor.name }}</span>
          </p>
          <p>
            <span style="margin-right: 10px">用户姓名:</span>
            <span>{{ row.client.name }}</span>
          </p>
          <p>
            <span style="margin-right: 10px">用户电话:</span>
            <span>{{ row.phone }}</span>
          </p>
          <p>
            <span style="margin-right: 10px">预约时间:</span>
            <span>
              {{ row.startTime.replace("T", " ").replace(/[-]/g, "/").slice(2, 16) }}
              -
              {{ row.endTime.replace("T", " ").replace(/[-]/g, "/").slice(2, 16) }}
            </span>
          </p>
          <p>
            <span style="margin-right: 10px">预约状态:</span>
            <span>{{ row._status }}</span>
          </p>
          <p>
            <span style="margin-right: 10px">用户打分:</span>
            <span style="display: inline-block;">
              <el-rate
                :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                disabled-void-icon-class="el-icon-star-off"
                disabled-void-color="#cccccc"
                :value="row.comment.starts"
                allow-half
                show-text
                disabled
              ></el-rate>
            </span>
          </p>
          <p>
            <span style="margin-right: 10px">用户评论:</span>
            <span>{{ row.comment.text }}</span>
          </p>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      search: null,
      keyword: null,
      doctor: [],
      appoint: []
    };
  },
  computed: {
    user() {
      return JSON.parse(localStorage.getItem("user"));
    },
    isAdmin() {
      return this.user.organization.role == "admin";
    },
    isOwner() {
      return this.user.organization.role == "owner";
    },
    appoList() {
      return this.appoint.filter(
        data =>
          !this.search ||
          data.doctor.name.toLowerCase().includes(this.search.toLowerCase()) ||
          data.client.name.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  },
  watch: {
    search(newV) {
      newV += "";
      let array = ["*", "(", ")", "[", "]", "?", "\\"];
      for (let char of array) {
        if (newV.indexOf(char) != -1) {
          this.search = newV.replace(/\*|\(|\)|\[|\]|\?|\\/g, "");
          return;
        }
      }
    }
  },
  mounted() {
    this.getDoctorList();
  },
  methods: {
    getDoctorList() {
      this.apiOrg.getOrgMem().then(res => {
        if (res.error) return this.$message.error("获取医生列表失败");
        this.doctor = res.data || [];
        this.getAppoList();
      });
    },
    getAppoList() {
      this.appoint = [];
      this.doctor.forEach(item => {
        this.apiAppo.getDoctAppo({ doctor_id: item._id }).then(res => {
          res.data.forEach(row => {
            row._status = this.formatStatus(row.status);
          });
          this.appoint.push(...res.data);
        });
      });
    },
    onStaChange(index, row) {
      const _row = JSON.parse(JSON.stringify(row));
      _row.status = _row._status;
      _row._status = this.formatStatus(_row._status);
      this.$set(this.appoint, index, _row);

      this.apiAppo
        .putAppoSta({ appoint_id: _row._id }, { status: _row.status })
        .then(res => {
          console.info(res);
          if (res.error) return this.$message.error("状态修改失败");
          this.$message.success("状态修改成功");
        });
    },
    doAddDoctor(index, row) {
      this.apiOrg
        .postOrgMem({
          member_id: row._id,
          member_role: "member"
        })
        .then(res => {
          if (res.error) return this.$message.error("添加成员失败");
          this.$message.success("添加成员成功");
          this.getDoctorList();
          this.$set(this.result[index], "add", true);
        });
    },
    onDelDoctor(index, row) {
      const doDelDoctor = () => {
        this.apiOrg.delOrgMem({ member_id: row._id }).then(res => {
          if (res.error) return this.$message.error("移出成员失败");
          this.doctor.splice(index, 1);
          this.$message.success("移出成员成功");
        });
      };
      this.$confirm("此操作将移出该成员, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          doDelDoctor();
        })
        .catch(() => {
          this.$message.info("已取消操作");
        });
    },
    formatStatus(role) {
      if (!role) return "确认中";
      if (role == "confirming") return "确认中";
      if (role == "refused") return "拒绝";
      if (role == "confirmed") return "已确认";
      if (role == "end") return "已结束";
    }
  }
};
</script>

<style scoped>
.appo {
  padding: 0 25px;
  box-sizing: border-box;
  position: relative;
}
.appo .head {
  padding: 20px 0;
  text-align: right;
}
.appo .head > .el-button {
  float: left;
  margin-right: 16px;
}
.appo .head > .el-input {
  width: 200px;
}
.appo .head >>> .el-input-group__append {
  padding: 0 12px;
}
.appo .head >>> .el-radio-button__inner:hover {
  color: #606266;
}
.appo .head >>> .is-active .el-radio-button__inner:hover {
  color: white;
}
.appo .el-table >>> th {
  background: #f4f6f9;
}
.appo .el-table .el-link {
  font-weight: 400;
  font-size: 13px;
  user-select: none;
}
.appo .el-table .el-link::after {
  display: none;
}
.appo .el-table .el-link + .el-link {
  margin-left: 10px;
}
</style>

<style>
.add-doctor {
  text-align: left;
}
.add-doctor .el-dialog__header {
  border-bottom: 1px rgba(0, 0, 0, 0.1) solid;
}
</style>
