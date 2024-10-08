module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 30000, // Set a timeout (30 seconds) for Puppeteer tests
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};
