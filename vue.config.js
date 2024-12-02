const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: "/prototype/",
  
  pluginOptions: {
    vuetify: { }
  },

  configureWebpack: {
    resolve: {
      fallback: {
        path: false,
        fs: false,
      }
    }
  },

  chainWebpack(config) {
    config.plugin('html').tap(args => {
      args[0].title = 'Sugarlens - Prototype';
      return args;
    });
  },
})
