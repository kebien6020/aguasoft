const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const webpack = require('webpack')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const MomentLocalesPlugin = require('moment-locales-webpack-plugin')

const relPath = (p) => path.join(__dirname, p)
const BUILD_WITH_STATS = process.env.BUILD_WITH_STATS || false

module.exports = {
  entry: relPath('./src/index.tsx'),
  output: {
    path: relPath('./dist'),
    publicPath: '/',
  },
  // Currently we need to add '.ts' to the resolve.extensions array.
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  // Add the loader for .ts files.
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          configFile: relPath('tsconfig.json'),
          // disable type checker - we will use it in fork plugin
          transpileOnly: true,
        }
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      },
    ]
  },
  plugins: [
    new MomentLocalesPlugin({
      localesToKeep: ['es'],
    }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: relPath('./index.html'),
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
