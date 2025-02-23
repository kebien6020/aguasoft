import webpack from 'webpack'
import { merge } from 'webpack-merge'
import common from './webpack.common.js'
import process from 'node:process'

const { EnvironmentPlugin } = webpack

const detailedNames = process.env.DETAILED_NAMES || false

export default merge(common, {
  mode: 'production',
  output: {
    filename: (detailedNames ? '[name]-' : '') + '[contenthash].js',
    chunkFilename: (detailedNames ? '[name]-' : '') + '[chunkhash].js',
  },
  plugins: [
    new EnvironmentPlugin({
      NODE_ENV: 'production',
      NODE_DEBUG: '',
    }),
  ],
  optimization: {
    ...(detailedNames ? { moduleIds: 'named' } : {}),
  },
})
