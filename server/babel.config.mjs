export default {
  presets: [['@babel/preset-typescript']],
  ignore: [
    'src/@types/**/*',
    'src/**/*.test.ts',
    'src/**/*.d.ts',
    'src/__tests__/**/*',
    'src/db/factories/**/*', // Tools for creating test data
  ],
}
