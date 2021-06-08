<template>
  <div class="commun">
    <div class="head">
      <el-radio-group v-model="status" size="medium">
        <!-- <el-radio-button label="audit">待审核</el-radio-button> -->
        <el-radio-button label="release">已发布</el-radio-button>
        <el-radio-button label="banned">已删除</el-radio-button>
      </el-radio-group>
      <el-radio-group v-model="status" size="medium">
        <el-radio-button label="editor">写文章</el-radio-button>
      </el-radio-group>
      <el-input
        v-model="search"
        size="medium"
        placeholder="搜索文章"
        @keydown.enter.native="getArticleList()"
      >
        <el-button
          slot="append"
          icon="el-icon-search"
          @click="getArticleList()"
        ></el-button>
      </el-input>
    </div>

    <el-table v-show="status != 'editor'" :data="article" border>
      <el-table-column type="index"></el-table-column>
      <el-table-column prop="title" label="标题" width="180"></el-table-column>
      <el-table-column prop="tag" label="标签" width>
        <template slot-scope="{ row }">{{ row.tag | tagFormat }}</template>
      </el-table-column>
      <el-table-column prop="author_name" label="作者" width="100"></el-table-column>
      <el-table-column prop="updatedAt" label="更新日期" width="160">
        <template slot-scope="{ row }">{{ (row.updatedAt+'').replace('T', ' ').slice(0, 16) }}</template>
      </el-table-column>
      <el-table-column label="管理文章" width="130">
        <template slot-scope="{ $index, row }">
          <el-link type="info" @click="onViewArticle($index, row)">查看</el-link>
          <el-link type="info" @click="onEditArticle($index, row)">编辑</el-link>
          <el-link
            v-show="status == 'release'"
            type="danger"
            @click="onDeleteArticle($index, row)"
          >删除</el-link>
        </template>
      </el-table-column>
    </el-table>

    <quill-editor v-show="status == 'editor'" v-model="editor.content" :options="option"></quill-editor>

    <el-form v-show="status == 'editor'" size="medium" @submit.native.prevent>
      <el-form-item label="文章标题">
        <el-input v-model="editor.title" type="textarea" :autosize="{ minRows: 2, maxRows: 4}"></el-input>
      </el-form-item>

      <el-form-item label="文章封面">
        <el-upload
          action="#"
          ref="article-cover"
          list-type="picture-card"
          :class="editor.cover.btn?'':'none'"
          :on-change="onCoverChange"
          :on-remove="onCoverRemove"
          :auto-upload="false"
          :limit="1"
        ></el-upload>
        <div v-show="editor.cover.value && editor.cover.before" class="cover-img">
          <img :src="editor.cover.value" />
          <span class="el-icon-delete" @click="onCoverRemove()"></span>
        </div>
      </el-form-item>

      <el-form-item label="文章标签" size="small">
        <el-tag
          closable
          :key="tag"
          v-for="tag in editor.tag"
          :disable-transitions="false"
          @close="delNewTag(tag)"
        >{{tag}}</el-tag>
        <el-input
          ref="tagInput"
          v-if="editor.input.visible"
          v-model="editor.input.value"
          @keyup.enter.native="addNewTag()"
          @blur="addNewTag()"
        ></el-input>
        <el-button v-if="!editor.input.visible && editor.tag.length < 3" @click="showTagInput">添加标签</el-button>
      </el-form-item>

      <el-form-item>
        <el-button v-show="!editor.id" type="primary" @click="doCreateArticle()">发布</el-button>
        <el-button v-show="editor.id" type="primary" @click="doEditArticle()">完成</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import cloudbase from "@cloudbase/js-sdk";
import { quillEditor } from "vue-quill-editor";
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

export default {
  components: {
    quillEditor
  },
  data() {
    return {
      status: "release",
      oldStatus: "release",
      search: null,
      option: {
        modules: {
          toolbar: [
            ["bold", "italic", "underline", "strike"], // 加粗 斜体 下划线 删除线
            ["blockquote", "code-block"], // 引用  代码块
            // [{ header: 1 }, { header: 2 }], // 1、2 级标题
            [{ list: "ordered" }, { list: "bullet" }], // 有序、无序列表
            [{ script: "sub" }, { script: "super" }], // 上标/下标
            // [{ indent: "-1" }, { indent: "+1" }], // 缩进
            [{ header: [1, 2, 3, 4, false] }], // 标题
            [{ color: [] }, { background: [] }], // 字体颜色、字体背景颜色
            [{ align: [] }], // 对齐方式
            ["clean"], // 清除文本格式
            ["link", "image", "video"] // 链接、图片、视频
          ] //工具菜单栏配置
        },
        placeholder: "请在这里输入文章内容", //提示
        readyOnly: false, //是否只读
        theme: "snow", //主题 snow/bubble
        syntax: true //语法检测
      },
      editor: {
        id: null,
        content: null,
        title: null,
        tag: [],
        input: {
          visible: false,
          value: null
        },
        cover: {
          btn: true,
          value: null
        }
      },
      article: [],
      cloud: {
        app: null,
        auth: null,
        login: null,
        state: null,
        count: 0
      }
    };
  },
  computed: {
    user() {
      return JSON.parse(localStorage.getItem("user"));
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
    status(newV, oldV) {
      this.getArticleList();
      this.oldStatus = oldV;
    }
  },
  mounted() {
    // this.initCloudbase();
    this.getArticleList();
  },
  methods: {
    showTagInput() {
      this.editor.input.visible = true;
      this.$nextTick(() => {
        this.$refs.tagInput.$refs.input.focus();
      });
    },
    addNewTag() {
      let inputValue = this.editor.input.value;
      if (inputValue && !this.editor.tag.includes(inputValue)) {
        this.editor.tag.push(inputValue);
      }
      this.editor.input.visible = false;
      this.editor.input.value = null;
    },
    delNewTag(tag) {
      this.editor.tag.splice(this.editor.tag.indexOf(tag), 1);
    },
    onCoverChange(file) {
      this.editor.cover.btn = false;
      let reader = new FileReader();
      reader.readAsDataURL(file.raw);
      reader.onload = () => {
        this.editor.cover.value = reader.result;
      };
    },
    onCoverRemove() {
      setTimeout(() => (this.editor.cover.btn = true), 300);
      this.editor.cover.value = null;
      this.editor.cover.before = false;
    },
    initCloudbase() {
      this.cloud.app = cloudbase.init({
        env: "dr-wu-dev-5gqygxzde55c9ac4"
      });
      this.cloud.auth = this.cloud.app.auth();
      const login = async () => {
        // 匿名登录成功检测登录状态isAnonymousAuth字段为true
        await this.cloud.auth.anonymousAuthProvider().signIn();
        this.cloud.login = await this.cloud.auth.getLoginState();
        this.cloud.state = this.cloud.login.isAnonymousAuth;
        console.info(this.cloud);
      };
      login();
    },
    getArticleList() {
      const status = this.status;
      const keyword = this.search ? this.search : "^(.*)$";
      this.apiArt.getArt({ status, keyword }).then(res => {
        // console.info(res);
        if (!res.error) {
          this.article = res.data;
        }
      });
    },
    getArticleDetail(article_id) {
      this.apiArt.refArtDet({ article_id }).then(res => {
        // console.info(res);
        if (!res.error) this.editor.content = res.data.content;
        this.status = "editor";
      });
    },
    doCreateArticle() {
      if (!this.editor.title) return this.$message.error("文章标题不能为空");
      if (!this.editor.content) return this.$message.error("文章内容不能为空");
      // let reg = /<img src=".*?">/i;
      this.apiArt
        .postArt({
          author_id: this.user._id,
          author_name: this.user.realName,
          title: this.editor.title,
          tag: this.editor.tag,
          content: this.editor.content,
          cover: this.editor.cover.value
        })
        .then(res => {
          if (!res.error) {
            this.$message.success(res.message);
            this.editor = {
              id: null,
              content: null,
              title: null,
              tag: [],
              input: {
                visible: false,
                value: null
              },
              cover: {
                btn: true,
                value: null
              }
            };
            this.status = "release";
            this.getArticleList();
          }
        });
    },
    doEditArticle() {
      if (!this.editor.title) return this.$message.error("文章标题不能为空");
      if (!this.editor.content) return this.$message.error("文章内容不能为空");
      // let reg = /<img src=".*?">/i;
      this.apiArt
        .putArt(
          {
            article_id: this.editor.id
          },
          {
            title: this.editor.title,
            tag: this.editor.tag,
            content: this.editor.content,
            cover: this.editor.cover.value
          }
        )
        .then(res => {
          if (!res.error) {
            this.$message.success(res.message);
            this.editor = {
              id: null,
              content: null,
              title: null,
              tag: [],
              input: {
                visible: false,
                value: null
              },
              cover: {
                btn: true,
                value: null
              }
            };
            this.status = this.oldStatus;
            this.getArticleList();
          }
        });
    },
    onViewArticle(index, row) {
      window.open("/#/article/" + row._id);
    },
    onEditArticle(index, row) {
      console.info(row);
      this.editor.id = row._id;
      this.editor.title = row.title;
      this.editor.tag = row.tag ? row.tag : [];
      this.editor.cover.value = row.cover;
      this.editor.cover.before = true;
      this.getArticleDetail(row._id);
    },
    onDeleteArticle(index, row) {
      const doDeleteArticle = () => {
        this.apiArt.delArt({ article_id: row._id }).then(res => {
          if (!res.error) {
            this.$message.success(res.message);
            this.getArticleList();
          }
        });
      };
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          doDeleteArticle();
        })
        .catch(() => {
          this.$message.info("已取消删除");
        });
    }
  },
  filters: {
    tagFormat(list) {
      if (!list) return null;
      let result = "";
      list.forEach(item => {
        result += item + "，";
      });
      return result.slice(0, -1);
    }
  }
};
</script>

<style scoped>
.commun {
  padding: 0 25px;
  box-sizing: border-box;
  position: relative;
}
.commun .head {
  padding: 20px 0;
  text-align: right;
}
.commun .head .el-radio-group {
  float: left;
  margin-right: 16px;
}
.commun .head .el-input {
  width: 200px;
}
.commun .head >>> .el-input-group__append {
  padding: 0 12px;
}
.commun .head >>> .el-radio-button__inner:hover {
  color: #606266;
}
.commun .head >>> .is-active .el-radio-button__inner:hover {
  color: white;
}
.commun .el-table >>> th {
  background: #f4f6f9;
}
.commun .el-table .el-link {
  font-weight: 400;
  font-size: 13px;
  user-select: none;
}
.commun .el-table .el-link::after {
  display: none;
}
.commun .el-table .el-link + .el-link {
  margin-left: 10px;
}
.commun .quill-editor {
  height: calc(100vh - 198px);
  width: calc(100% - 266px);
  line-height: normal !important;
  text-align: left;
  position: absolute;
  left: 25px;
}
.commun .el-form {
  width: 200px;
  height: calc(100vh - 156px);
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 5px 12px;
  box-sizing: border-box;
  position: absolute;
  right: 25px;
}
.commun .el-form .el-form-item {
  margin-bottom: 5px;
}
.commun .el-form >>> .el-form-item__label {
  width: 100%;
  text-align: left;
}
.commun .el-form >>> .el-upload--picture-card {
  width: 100%;
  height: 90px;
}
.commun .el-form >>> .el-upload-list__item {
  width: 100%;
  height: 90px;
  margin: 0 0 -14px;
}
.commun .el-form >>> .el-upload-list__item img {
  height: unset;
  transform: translateY(calc(-50% + 45px));
}
.commun .el-form >>> .none .el-upload--picture-card {
  display: none;
}
.commun .el-form .cover-img {
  width: 100%;
  height: 90px;
  margin-top: -90px;
  overflow: hidden;
  position: relative;
}
.commun .el-form .cover-img > img {
  width: 100%;
  height: unset;
  transform: translateY(calc(-50% + 45px));
}
.commun .el-form .cover-img > span {
  display: block;
  width: 100%;
  height: 90px;
  line-height: 90px;
  font-size: 20px;
  color: transparent;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
  position: absolute;
  left: 0;
  top: 0;
}
.commun .el-form .cover-img > span:hover {
  background: rgba(0, 0, 0, 0.5);
  color: white;
}
.commun .el-form .el-button,
.commun .el-form .el-input,
.commun .el-form .el-tag {
  width: 100%;
  margin: 5px 0;
}
.commun .el-form .el-button--primary {
  margin-top: 25px;
}
.commun .el-form >>> .el-textarea__inner {
  resize: none;
}
</style>

<style>
.el-message-box__wrapper {
  outline: none;
}

.ql-toolbar.ql-snow {
  border-radius: 4px 4px 0 0;
  border-color: #dcdfe6;
}

.ql-container.ql-snow {
  border-radius: 0 0 4px 4px;
  border-color: #dcdfe6;
}

.ql-snow .ql-formats {
  margin-right: 0 !important;
}

.ql-snow .ql-picker-label {
  outline: none;
}

.ql-snow .ql-picker-options * {
  outline: none;
}

.ql-snow .ql-tooltip {
  transform: translate(100px, 10px);
}

.ql-snow .ql-tooltip[data-mode="link"]::before {
  content: "链接地址:";
}
.ql-snow .ql-tooltip.ql-editing a.ql-action::after {
  border-right: 0px;
  content: "保存";
  padding-right: 0px;
}

.ql-snow .ql-tooltip[data-mode="video"]::before {
  content: "视频地址:";
}

.ql-snow .ql-picker.ql-header {
  width: 60px;
}
.ql-snow .ql-picker.ql-header .ql-picker-label::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: "文本";
  font-size: 14px;
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="1"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="1"]::before {
  content: "标题1";
  font-size: 14px;
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="2"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="2"]::before {
  content: "标题2";
  font-size: 14px;
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="3"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="3"]::before {
  content: "标题3";
  font-size: 14px;
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value="4"]::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value="4"]::before {
  content: "标题4";
  font-size: 14px;
}
</style>