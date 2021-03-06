/* eslint-env node */

/** @typedef {import('ts-jest')} */
/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: [
    '<rootDir>/server/dist',
    '<rootDir>/client/dist',
  ],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
  setupFilesAfterEnv: ['jest-extended', './jest.setup.ts'],
}
