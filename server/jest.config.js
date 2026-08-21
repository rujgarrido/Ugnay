/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/src/tests'],
  testMatch: ['**/**/*.test.ts', '**/*.test.ts'],
  clearMocks: true,
  globals: {
  'ts-jest': {
    tsconfig: 'tsconfig.check.json',
  },
},
};
