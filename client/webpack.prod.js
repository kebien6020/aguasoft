const merge = require('webpack-merge')
const common = require('./webpack.common.js')

const detailedNames = process.env.DETAILED_NAMES || false

module.exports = merge(common, {
  mode: 'production',
  output: {
    filename: (detailedNames ? '[name]-' : '') + '[hash].js',
    chunkFilename: (detailedNames ? '[name]-' : '') + '[chunkhash].js',
  }
})
