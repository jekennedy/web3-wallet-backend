module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverage: true,
  collectCoverageFrom: ['**/*.{ts,js}', '!**/node_modules/**', '!**/vendor/**'],
  coverageDirectory: 'coverage',
  testEnvironment: 'node',
};
