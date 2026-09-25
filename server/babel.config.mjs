export default {
  presets: [['@babel/preset-typescript', {
    onlyRemoveTypeImports: false, // Remove type imports even if they don't explicitly use the import type syntax
  }]],
  ignore: [
    'src/@types/**/*',
    'src/**/*.test.ts',
    'src/**/*.d.ts',
    'src/__tests__/**/*',
    'src/db/factories/**/*', // Tools for creating test data
  ],
}
