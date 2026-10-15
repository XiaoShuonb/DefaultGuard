import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'
import viteCompression from 'vite-plugin-compression'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import ElementPlus from 'unplugin-element-plus/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import tailwindcss from '@tailwindcss/vite'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

export default ({ mode }: { mode: string }) => {
  const root = process.cwd()
  const env = loadEnv(mode, root)
  const { VITE_VERSION, VITE_PORT, VITE_BASE_URL, VITE_API_PROXY_URL } = env

  return defineConfig({
    define: {
      __APP_VERSION__: JSON.stringify(VITE_VERSION),
      // Locale JSON is compiled to message ASTs by unplugin-vue-i18n. Vue
      // I18n 9 needs this feature flag at bundle time to execute those ASTs
      // without falling back to the CSP-incompatible Function constructor.
      __INTLIFY_JIT_COMPILATION__: true
    },
    base: VITE_BASE_URL,
    server: {
      port: Number(VITE_PORT),
      proxy: {
        '/api': {
          target: VITE_API_PROXY_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      },
      host: true
    },
    // 路径别名
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@views': resolvePath('src/views'),
        '@imgs': resolvePath('src/assets/images'),
        '@icons': resolvePath('src/assets/icons'),
        '@utils': resolvePath('src/utils'),
        '@stores': resolvePath('src/store'),
        '@styles': resolvePath('src/assets/styles')
      }
    },
    build: {
      target: 'es2015',
      outDir: 'dist',
      chunkSizeWarningLimit: 2000,
      // Production artifacts are optimized independently from the readable
      // Vue source under web/src. Source maps stay private by not emitting
      // them into the distributable image.
      sourcemap: false,
      cssCodeSplit: true,
      reportCompressedSize: true,
      minify: 'terser',
      terserOptions: {
        ecma: 2015,
        compress: {
          // Two passes provide stable medium-strength compression without
          // control-flow flattening, string encryption, or injected dead code.
          passes: 2,
          drop_console: true,
          drop_debugger: true,
          pure_getters: true
        },
        // Local identifiers are shortened, while public object property names
        // used by Vue, Element Plus, Axios, and backend DTOs remain
        // unchanged for runtime compatibility.
        mangle: {
          toplevel: false,
          safari10: true,
          keep_classnames: false,
          keep_fnames: false
        },
        format: {
          comments: false,
          beautify: false
        }
      },
      dynamicImportVarsOptions: {
        warnOnError: true,
        exclude: [],
        include: ['src/views/**/*.vue']
      }
    },
    plugins: [
      vue(),
      // Precompile locale JSON and ship the Vue I18n runtime-only build.
      // This removes runtime `new Function(...)` message compilation so the
      // application remains compatible with CSP `script-src 'self'` without
      // enabling `unsafe-eval`.
      VueI18nPlugin({
        include: [path.resolve(__dirname, './src/locales/langs/**')],
        runtimeOnly: true,
        compositionOnly: true,
        dropMessageCompiler: true
      }),
      tailwindcss(),
      // 自动按需导入 API
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
        dts: 'src/types/import/auto-imports.d.ts',
        resolvers: [ElementPlusResolver()],
        eslintrc: {
          enabled: true,
          filepath: './.auto-import.json',
          globalsPropValue: true
        }
      }),
      // 自动按需导入组件
      Components({
        dts: 'src/types/import/components.d.ts',
        resolvers: [ElementPlusResolver()]
      }),
      // 按需定制主题配置
      ElementPlus({
        useSource: true
      }),
      // 压缩
      viteCompression({
        verbose: false, // 是否在控制台输出压缩结果
        disable: false, // 是否禁用
        algorithm: 'gzip', // 压缩算法
        ext: '.gz', // 压缩后的文件名后缀
        threshold: 10240, // 只有大小大于该值的资源会被处理 10240B = 10KB
        deleteOriginFile: false // 压缩后是否删除原文件
      })
    ],
    // 依赖预构建：避免运行时重复请求与转换，提升首次加载速度
    optimizeDeps: {
      // 先完成首次页面依赖扫描再锁定预构建结果，避免访问新路由时重启优化器。
      holdUntilCrawlEnd: true,
      // 系统路由使用 import.meta.glob，默认只扫首页会遗漏尚未打开的页面依赖。
      entries: ['index.html', 'src/**/*.{js,ts,jsx,tsx,vue}'],
      include: [
        'element-plus/es',
        // Vite 不展开 include 里的通配符，因此显式预构建常用 Element Plus 样式入口。
        'element-plus/es/components/base/style/css',
        'element-plus/es/components/config-provider/style/css',
        'element-plus/es/components/alert/style/css',
        'element-plus/es/components/avatar/style/css',
        'element-plus/es/components/button/style/css',
        'element-plus/es/components/card/style/css',
        'element-plus/es/components/checkbox/style/css',
        'element-plus/es/components/col/style/css',
        'element-plus/es/components/descriptions/style/css',
        'element-plus/es/components/descriptions-item/style/css',
        'element-plus/es/components/dialog/style/css',
        'element-plus/es/components/divider/style/css',
        'element-plus/es/components/drawer/style/css',
        'element-plus/es/components/dropdown/style/css',
        'element-plus/es/components/dropdown-item/style/css',
        'element-plus/es/components/dropdown-menu/style/css',
        'element-plus/es/components/empty/style/css',
        'element-plus/es/components/form/style/css',
        'element-plus/es/components/form-item/style/css',
        'element-plus/es/components/icon/style/css',
        'element-plus/es/components/input/style/css',
        'element-plus/es/components/input-number/style/css',
        'element-plus/es/components/loading/style/css',
        'element-plus/es/components/menu/style/css',
        'element-plus/es/components/menu-item/style/css',
        'element-plus/es/components/message/style/css',
        'element-plus/es/components/message/style/index',
        'element-plus/es/components/message-box/style/css',
        'element-plus/es/components/message-box/style/index',
        'element-plus/es/components/notification/style/index',
        'element-plus/es/components/option/style/css',
        'element-plus/es/components/pagination/style/css',
        'element-plus/es/components/popover/style/css',
        'element-plus/es/components/radio/style/css',
        'element-plus/es/components/radio-group/style/css',
        'element-plus/es/components/result/style/css',
        'element-plus/es/components/row/style/css',
        'element-plus/es/components/scrollbar/style/css',
        'element-plus/es/components/select/style/css',
        'element-plus/es/components/sub-menu/style/css',
        'element-plus/es/components/switch/style/css',
        'element-plus/es/components/table/style/css',
        'element-plus/es/components/table-column/style/css',
        'element-plus/es/components/tab-pane/style/css',
        'element-plus/es/components/tabs/style/css',
        'element-plus/es/components/tag/style/css',
        'element-plus/es/components/timeline/style/css',
        'element-plus/es/components/timeline-item/style/css',
        'element-plus/es/components/tooltip/style/css'
      ]
    },
    css: {
      preprocessorOptions: {
        // sass variable and mixin
        scss: {
          additionalData: `
            @use "@styles/core/el-light.scss" as *;
            @use "@styles/core/mixin.scss" as *;
          `
        }
      },
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove()
                }
              }
            }
          }
        ]
      }
    }
  })
}

function resolvePath(paths: string) {
  return path.resolve(__dirname, paths)
}
