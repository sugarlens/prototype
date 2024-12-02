const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: "/prototype/",
  
  pluginOptions: {
    vuetify: { }
  },

  chainWebpack(config) {
    config.plugin('html').tap(args => {
      args[0].title = 'Sugarlens - Prototype';
      return args;
    });
  },
})
