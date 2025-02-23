import { join } from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import process from 'node:process'


const relPath = (p) => join(import.meta.dirname, p)
const BUILD_WITH_STATS = process.env.BUILD_WITH_STATS || false

/** @type {import('webpack').Configuration} */
export default {
  entry: relPath('./src/index.tsx'),
  output: {
    path: relPath('./dist'),
    publicPath: '/',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'babel-loader',
      },
      {
        test: /\.(png|svg|jpg|gif|ttf)$/,
        use: ['file-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: relPath('./index.html'),
      // CleanWebpackPlugin is removing dist/index.html in dev but is not
      // being emitted again
      cache: false,
    }),
  ].concat(BUILD_WITH_STATS ? [
    new BundleAnalyzerPlugin({
      analyzerMode: 'disabled',
      generateStatsFile: true,
      statsFilename: './stats.json',
      defaultSizes: 'gzip',
    }),
  ] : []),
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
}
