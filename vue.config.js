const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  devServer: {
    host: 'localhost', // 修改绑定IP地址
    port: 9090,
    // 其他配置...
  },
  transpileDependencies: true,
})


