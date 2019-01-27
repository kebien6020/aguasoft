const merge = require('webpack-merge')
const common = require('./webpack.common.js')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')

module.exports = merge(common, {
  mode: 'development',
  output: {
    chunkFilename: '[name].js',
  },
  // Source maps support
  devtool: 'inline-source-map',
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      tsconfig: relPath('tsconfig.json'),
    }),
  ],
})
