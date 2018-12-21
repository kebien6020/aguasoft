const path = require('path')
// `CheckerPlugin` is optional. Use it if you want async error reporting.
// We need this plugin to detect a `--watch` mode.
const { CheckerPlugin } = require('awesome-typescript-loader')

const relPath = (p) => path.join(__dirname, p)

module.exports = {
  mode: 'development',
  entry: relPath('./src/index.tsx'),
  output: {
    path: relPath('./dist'),
    filename: 'bundle.js'
  },
  // Currently we need to add '.ts' to the resolve.extensions array.
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  // Source maps support
  devtool: 'source-map',
  // Add the loader for .ts files.
 module: {
   rules: [
     {
       test: /\.tsx?$/,
       loader: 'awesome-typescript-loader',
       options: {
         configFileName: relPath('tsconfig.json')
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
     new CheckerPlugin()
 ]
};
