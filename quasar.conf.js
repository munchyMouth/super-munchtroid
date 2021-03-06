const path = require('path')
// Configuration for your app

module.exports = function (ctx) {
  return {
    // app plugins (/src/plugins)
    boot: [
      'vue-electron-boot' // references /src/boot/vue-electron.boot.js
    ],
    plugins: [],
    css: [
      'app.styl'
    ],
    extras: [
      // ctx.theme.mat ? 'roboto-font' : null,
      'material-icons' // optional, you are not bound to it
      // 'ionicons',
      // 'mdi',
      // 'fontawesome'
    ],
    supportIE: false,
    build: {
      scopeHoisting: true,
      // vueRouterMode: 'history',
      // vueCompiler: true,
      // gzip: true,
      // analyze: true,
      // extractCSS: false,
      extendWebpack (cfg) {
        debugger
        cfg.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /node_modules/
        })
        cfg.resolve.alias = {
          ...cfg.resolve.alias,
          '@libs': path.resolve(__dirname, 'libs')
        }
        cfg.resolve.extensions.push('json')
      }
    },
    devServer: {
      https: true,
      port: 8080
      // open: true // opens browser window automatically
    },
    // framework: 'all' --- includes everything; for dev only!
    framework: {
      components: [
        'QAlert',
        'QField',
        'QInput',
        'QLayout',
        'QLayoutHeader',
        'QLayoutDrawer',
        'QPageContainer',
        'QPage',
        'QToolbar',
        'QToolbarTitle',
        'QBtn',
        'QIcon',
        'QList',
        'QListHeader',
        'QModal',
        'QItem',
        'QItemMain',
        'QItemSide',
        'QRadio',
        'QSearch',
        'QSlider',
        'QSpinner',
        'QCollapsible',
        'QTabs',
        'QTab',
        'QTabPane'
      ],
      directives: [
        'Ripple',
        'CloseOverlay'
      ],
      // Quasar plugins
      plugins: [
        'Notify',
        'Loading'
      ],
      iconSet: 'material-icons'
      // i18n: 'de' // Quasar language
    },
    // animations: 'all' --- includes all animations
    animations: [],
    ssr: {
      pwa: false
    },
    pwa: {
      // workboxPluginMode: 'InjectManifest',
      // workboxOptions: {},
      manifest: {
        // name: 'Quasar App',
        // short_name: 'Quasar-PWA',
        // description: 'Best PWA App in town!',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            'src': 'statics/icons/icon-128x128.png',
            'sizes': '128x128',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-192x192.png',
            'sizes': '192x192',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-256x256.png',
            'sizes': '256x256',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-384x384.png',
            'sizes': '384x384',
            'type': 'image/png'
          },
          {
            'src': 'statics/icons/icon-512x512.png',
            'sizes': '512x512',
            'type': 'image/png'
          }
        ]
      }
    },
    cordova: {
      // id: 'org.cordova.quasar.app'
    },
    electron: {
      // bundler: 'builder', // or 'packager'
      extendWebpack (cfg) {
        // do something with Electron process Webpack cfg
        cfg.resolve.alias = {
          ...cfg.resolve.alias,
          '@libs': path.resolve(__dirname, 'libs')
        }
        cfg.resolve.extensions.push('json')
      },
      packager: { // uncomment to build for windows
        platform: 'win32'
      },
      builder: {
        // https://www.electron.build/configuration/configuration
        win: {
          target: 'portable'
        }
      }
      // packager: {
      //   // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

      //   // OS X / Mac App Store
      //   // appBundleId: '',
      //   // appCategoryType: '',
      //   // osxSign: '',
      //   // protocol: 'myapp://path',

      //   // Window only
      //   // win32metadata: { ... }
      // },
      // builder: {
      //   // https://www.electron.build/configuration/configuration

      //   // appId: 'quasar-app'
      // }
    }
  }
}
