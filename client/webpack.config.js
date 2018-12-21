const path = require('path')

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
       loader: 'ts-loader',
       options: {
         configFile: relPath('tsconfig.json')
       }
     },
     {
       test: /\.(png|svg|jpg|gif)$/,
       use: [
         'file-loader'
       ]
     },
   ]
 }
};
