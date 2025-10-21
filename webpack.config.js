const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const fs = require('fs');
const libPath = path.join(__dirname, 'lib');
// 动态读取package.json以获取版本号
const packageJson = require('./package.json');
const version = packageJson.version;

// 自定义插件，用于生成synctest_out.min.js
class SynctestOutPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync('SynctestOutPlugin', (compilation, callback) => {
      const synctestMinPath = path.join(libPath, 'synctest.min.js');
      const synctestOutPath = path.join(libPath, 'synctest_out.min.js');
      
      try {
        // 读取synctest.min.js的内容
        const synctestMinContent = fs.readFileSync(synctestMinPath, 'utf8');
        
        // 生成synctest_out.min.js的内容，包裹在synctest__函数中，并动态使用package.json中的版本号
        const synctestOutContent = `/*
 * servermock synctest plugin 多平台同步测试：实现操作一个平台多个平台同步事件操作
 * version ${version}
 * @param  {[type]} synctest_origin server synctest监听的websocket源 默认"127.0.0.1:80"
 */
function synctest__(synctest_origin){
  ${synctestMinContent}
}`;
        
        // 写入synctest_out.min.js文件
        fs.writeFileSync(synctestOutPath, synctestOutContent, 'utf8');
        console.log('synctest_out.min.js 生成成功');
      } catch (error) {
        console.error('生成synctest_out.min.js时出错:', error);
      }
      
      callback();
    });
  }
}

module.exports = {
  mode: 'production',
  entry: {
    'synctest': './src/synctest.ts',
    'synctest.min': './src/synctest.ts'
  },
  output: {
    path: libPath,
    filename: '[name].js',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        include: /\.min\.js$/,
        terserOptions: {
          compress: {
            drop_console: false
          }
        }
      })
    ]
  },
  plugins: [
    new SynctestOutPlugin()
  ]
};