const webpack = require('webpack')
const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const path = require('path')

const relPath = (p) => path.join(__dirname, p)

module.exports = merge(common, {
  mode: 'development',
  output: {
    chunkFilename: '[name].js',
  },
  // Source maps support
  devtool: 'inline-source-map',
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: relPath('tsconfig.json')
      },
    }),
    new webpack.EnvironmentPlugin({
      'NODE_ENV': 'development',
      'NODE_DEBUG': undefined,
    }),
  ],
})
