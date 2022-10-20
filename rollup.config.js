import vue from '@vitejs/plugin-vue'
import PostCSS from 'rollup-plugin-postcss'
import Resolve from '@rollup/plugin-node-resolve'
import Commonjs from '@rollup/plugin-commonjs'
import Replace from '@rollup/plugin-replace'

export default {
  input: 'src/index.vue',
  // https://blog.csdn.net/summer_dou/article/details/123922964
  // external 选项用于确保外部化处理那些你不想打包进库的依赖,解决插件报错问题 (reading 'isCE')
  // Uncaught TypeError: Cannot read properties of null (reading 'isCE')
  external: ['vue'],
  output: {
    globals: {
      vue: 'Vue',
      'element-plus': 'ElementPlus',
    },
    format: 'umd',
    name: 'MyComponent',
    file: 'dist/MyComponent.js',
  },
  plugins: [
    /**
     * TODO: https://blog.csdn.net/riddle1981/article/details/127112195
     * 👆 这篇文章讲的不错，针对rollup 打包第三方依赖做了大量功课，很好，多读
     */
    // 如果你使用的这个三方库没有默认default，则需要配合@rollup/plugin-commonjs使用
    // 注意commonjs这个模块应当在任何插件调用前调用！
    Commonjs({
      include: /node_modules/
    }),
    // Uncaught ReferenceError: process is not defined
    // 打包后源码中包含 if (process.env.NODE_ENV !== "production") {} 等代码
    // 又因为 rollup 在打包时是不会处理process环境的，这种情况需要插件额外处理 @rollup/plugin-replace
    Replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    // Cannot use import statement outside a module 
    // rollup打包会处理相对路径，对于npm包的绝对路径引用是不会做任何处理的。这种情况可以用 @rollup/plugin-node-resolve 插件处理。
    Resolve(),
    vue(),
    // https://github.com/tuolib/ab-vue/blob/9d4a905efdb71a757a327a0081eae9addcedb12b/build/rollup.config.js#L60
    // Process only `<style module>` blocks.
    PostCSS({
      modules: {
        generateScopedName: '[local]___[hash:base64:5]',
      },
      // extract: true, // 分离 scss | css 文件
      include: /&module=.*\.(s?)css$/
    }),
    // Process all `<style>` blocks except `<style module>`.
    PostCSS({
      // extract: true, // 分离 scss | css 文件
      include: /(?<!&module=.*)\.(s?)css$/
    }),
  ]
}
