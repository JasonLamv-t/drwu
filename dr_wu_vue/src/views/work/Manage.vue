<template>
  <div class="manage">
    <div class="head">
      <el-button
        v-show="isOwner || isAdmin"
        type="primary"
        size="medium"
        @click="dialog = true"
      >添加医生</el-button>

      <el-input
        v-model="search"
        size="medium"
        placeholder="搜索医生"
        @keydown.enter.native="getDoctorList()"
      >
        <el-button slot="append" icon="el-icon-search" @click="getDoctorList()"></el-button>
      </el-input>
    </div>

    <el-table :data="doctorList" border>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="头像" width="50">
        <template slot-scope="{ row }">
          <el-avatar :src="row.avatar" style="vertical-align: middle;" :size="26"></el-avatar>
        </template>
      </el-table-column>
      <el-table-column label="姓名" width="120">
        <template slot-scope="{ row }">{{ row.realName || row.nickName || row.username }}</template>
      </el-table-column>
      <el-table-column label="性别" width="50">
        <template slot-scope="{ row }">{{ row.sex=='male'?'男':'女' }}</template>
      </el-table-column>
      <el-table-column prop="phone" label="联系电话" width></el-table-column>
      <el-table-column label="权限" width="120">
        <template slot-scope="{ $index, row }">
          <el-select
            v-model="row.organization._role"
            @change="onRoleChange($index, row)"
            size="mini"
          >
            <el-option value="member">成员</el-option>
            <el-option v-show="isAdmin || isOwner" value="admin">管理员</el-option>
            <el-option v-show="isOwner" value="owner">创建者</el-option>
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="管理" width="50">
        <template slot-scope="{ $index, row }">
          <el-link type="danger" @click="onDelDoctor($index, row)">移出</el-link>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      width="420px"
      class="add-doctor"
      title="添加医生"
      :visible.sync="dialog"
      :close-on-click-modal="false"
    >
      <el-input v-model="keyword" size="medium" placeholder="搜索要添加的医生">
        <el-button slot="append" icon="el-icon-search" @click="onSearchDoctor()"></el-button>
      </el-input>
      <el-table :data="result" style="margin-top: 20px" :show-header="false">
        <el-table-column label="头像" width="50">
          <template slot-scope="{ row }">
            <el-avatar :src="row.avatar" style="vertical-align: middle;" :size="26"></el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="姓名" width>
          <template slot-scope="{ row }">{{ row.realName || row.nickName || row.username }}</template>
        </el-table-column>
        <el-table-column label="管理" width="80" align="right">
          <template slot-scope="{ $index, row }">
            <el-link v-show="!row.add" type="primary" @click="doAddDoctor($index, row)">添加</el-link>
            <el-link v-show="row.add" type="info">已添加</el-link>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer"></span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      search: null,
      keyword: null,
      result: null,
      doctor: [],
      dialog: false
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
    doctorList() {
      return this.doctor.filter(
        data =>
          !this.search ||
          data.realName.toLowerCase().includes(this.search.toLowerCase()) ||
          data.nickname.toLowerCase().includes(this.search.toLowerCase()) ||
          data.username.toLowerCase().includes(this.search.toLowerCase())
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
    },
    keyword(newV) {
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
        this.doctor.forEach(row => {
          row.organization._role = this.formatRole(row.organization.role);
        });
      });
    },
    onSearchDoctor() {
      this.apiAcc
        .query({ keyword: this.keyword }, { isAssociated: false })
        .then(res => {
          if (res.error) return (this.result = []);
          this.result = res.data;
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
    onRoleChange(index, row) {
      const _row = JSON.parse(JSON.stringify(row));
      _row.organization.role = _row.organization._role;
      _row.organization._role = this.formatRole(_row.organization._role);
      this.$set(this.doctor, index, _row);

      this.apiOrg.putOrgMemRole({
        member_id: _row._id,
        member_role: _row.organization.role
      }).then(res=>{
        if(res.error) return this.$message.error('权限修改失败');
        this.$message.success("权限修改成功")
      })
    },
    formatRole(role) {
      if (!role) return "成员";
      if (role == "member") return "成员";
      if (role == "admin") return "管理员";
      if (role == "owner") return "创建者";
    }
  }
};
</script>

<style scoped>
.manage {
  padding: 0 25px;
  box-sizing: border-box;
  position: relative;
}
.manage .head {
  padding: 20px 0;
  text-align: right;
}
.manage .head > .el-button {
  float: left;
  margin-right: 16px;
}
.manage .head > .el-input {
  width: 200px;
}
.manage .head >>> .el-input-group__append {
  padding: 0 12px;
}
.manage .head >>> .el-radio-button__inner:hover {
  color: #606266;
}
.manage .head >>> .is-active .el-radio-button__inner:hover {
  color: white;
}
.manage .el-table >>> th {
  background: #f4f6f9;
}
.manage .el-table .el-link {
  font-weight: 400;
  font-size: 13px;
  user-select: none;
}
.manage .el-table .el-link::after {
  display: none;
}
.manage .el-table .el-link + .el-link {
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
