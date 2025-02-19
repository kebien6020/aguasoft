import webpack from 'webpack'
import { merge } from 'webpack-merge'
import common from './webpack.common.js'

const { EnvironmentPlugin } = webpack

export default merge(common, {
  mode: 'development',
  output: {
    chunkFilename: '[name].js',
  },
  // Source maps support
  devtool: 'inline-source-map',
  plugins: [
    new EnvironmentPlugin({
      NODE_ENV: 'development',
      NODE_DEBUG: '',
    }),
  ],
})
