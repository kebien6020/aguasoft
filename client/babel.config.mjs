import process from 'node:process'

export default {
  presets: [
    [
      '@babel/preset-react', {
        runtime: 'automatic',
        development: process.env.BABEL_ENV === 'development',
      },
    ],
    [
      '@babel/preset-typescript', {
        allowDeclareFields: true,
      },
    ],
  ],
  plugins: [
    [
      'babel-plugin-react-compiler', {
        target: '18',
      },
    ],
    // Optimize mui imports
    [
      'babel-plugin-import', {
        libraryName: '@mui/material',
        libraryDirectory: '',
        camel2DashComponentName: false,
      }, 'core',
    ],
    [
      'babel-plugin-import', {
        libraryName: '@mui/icons-material',
        libraryDirectory: '',
        camel2DashComponentName: false,
      }, 'icons',
    ],
  ],
}
