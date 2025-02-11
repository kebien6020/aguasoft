const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const webpack = require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const relPath = (p) => path.join(__dirname, p)
const BUILD_WITH_STATS = process.env.BUILD_WITH_STATS || false

/** @type {import('webpack').Configuration} */
module.exports = {
  entry: relPath('./src/index.tsx'),
  output: {
    path: relPath('./dist'),
    publicPath: '/',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      'react/jsx-runtime': 'react/jsx-runtime.js',
    },
    fallback: {
      // All of these are required because webpack 5 removed node polyfills and react-pdf uses some of them
      stream: require.resolve('stream-browserify'), // Needed by react-pdf, blob-stream, restructure
      zlib: require.resolve('browserify-zlib'), // Needed by react-pdf
      util: require.resolve('util'), // Needed by blob-stream, restructure
      assert: require.resolve('assert'), // Needed by browserify-zlib
      process: require.resolve('process/browser'), // Needed by assert
      buffer: require.resolve('buffer'), // Needed by react-pdf
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'babel-loader'
      },
      {
        test: /\.(png|svg|jpg|gif|ttf)$/,
        use: [
          'file-loader'
        ]
      },
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: relPath('./index.html'),
      // CleanWebpackPlugin is removing dist/index.html in dev but is not
      // being emitted again
      cache: false,
    }),
    // Work around for Buffer is undefined:
    // https://github.com/webpack/changelog-v5/issues/10
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ].concat(BUILD_WITH_STATS ? [
    new BundleAnalyzerPlugin({
      analyzerMode: 'disabled', // use yarn analyze
      generateStatsFile: true,
      statsFilename: '../stats.json'
    }),
  ] : []),
  optimization: {
    splitChunks: {
      chunks: 'all'
    }
  }
};
