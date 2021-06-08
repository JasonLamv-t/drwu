module.exports = {
  devServer: {
    open: true,//自动打开
    port: 9200,//端口号
    proxy: {
      //配置跨域
      '^/api/v1': {
        target: 'https://drwu.top/api/v1', //跨域的地址
        changOrigin: true, //是否跨域
        pathRewrite: { //当前的名字
          '^/api/v1/': '/'
        }
      },
    }
  },
}