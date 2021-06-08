<template>
  <div class="article">
    <div class="box">
      <div
        class="cover"
        v-show="article.cover"
        :style="{backgroundImage: 'url('+article.cover+')'}"
      ></div>
      <h1 class="title">{{ article.title }}</h1>
      <p class="info">
        <span>作者：{{ article.author_name }}</span>
        <span>标签：{{ article.tag | tagFormat }}</span>
        <span>阅读量：{{ article.readCount }}</span>
        <span>更新时间：{{ (article.updatedAt+'').replace('T', ' ').slice(0, 16) }}</span>
      </p>
      <div class="content" v-html="article.content"></div>
      <p class="star">
        <el-button round size="medium" icon="el-icon-star-on">点个赞</el-button>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    article_id: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      article: {}
    };
  },
  mounted() {
    this.getArticleDetail();
  },
  methods: {
    getArticleDetail() {
      const article_id = this.article_id;
      this.apiArt.getArtDet({ article_id }).then(res => {
        this.article = res.data;
        console.info(this.article);
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

<style>
.article {
  padding: 25px 0 50px;
  background: #f0f2f5;
}
.article .box {
  width: 100%;
  max-width: 768px;
  /* min-height: 200vh; */
  margin: 0 auto;
  padding: 0 0 30px;
  box-sizing: border-box;
  border: 1px solid #dcdfe6;
  background: white;
}
.article .box .cover {
  max-width: 100%;
  padding: 20% 0;
  overflow: hidden;
  vertical-align: middle;
  background-size: 100% auto;
  background-position: center;
  position: relative;
}
.article .box .cover::after {
  content: "";
  display: block;
  width: 100%;
  max-width: 100%;
  padding: 20% 50%;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.08);
  position: absolute;
  top: 0;
}
.article .box > .title {
  margin: 30px 20px 0;
  line-height: 50px;
  text-align: left;
}
.article .box > .info {
  margin: 0 20px;
  line-height: 50px;
  text-align: left;
  font-size: 14px;
  color: #707277;
  border-bottom: 1px solid #dcdfe6;
}
.article .box > .info span {
  display: inline-block;
  margin-right: 30px;
}
.article .box > .info span:last-child {
  float: right;
  margin-right: 0;
}
.article .box > .content {
  text-align: left;
  padding: 20px 0 50px;
  margin: 0 20px;
  box-sizing: border-box;
}
.article .box > .star i {
  font-size: 24px;
  margin-right: 5px;
  vertical-align: middle;
}
.article .box > .star span {
  vertical-align: middle;
}
</style>