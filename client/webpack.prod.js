const webpack = require('webpack')
const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

const detailedNames = process.env.DETAILED_NAMES || false

module.exports = merge(common, {
  mode: 'production',
  output: {
    filename: (detailedNames ? '[name]-' : '') + '[contenthash].js',
    chunkFilename: (detailedNames ? '[name]-' : '') + '[chunkhash].js',
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      'NODE_ENV': 'production',
      'NODE_DEBUG': '',
    }),
  ]
})
