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
}
