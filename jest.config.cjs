module.exports = {
  preset: 'ts-jest/presets/js-with-babel',  // Use Babel for handling both JS and TS
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': 'babel-jest',  // Transform TypeScript files using babel-jest
  },
  transformIgnorePatterns: [
    '/node_modules/',  // Ignore node_modules by default
  ],
  extensionsToTreatAsEsm: ['.ts'],  // Treat .ts files as ES modules
  testTimeout: 30000,  // Optional: Increase timeout for long-running tests
};
