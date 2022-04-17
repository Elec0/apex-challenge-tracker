/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: [
    "<rootDir>"
  ],
  modulePaths: [
    "<rootDir>"
  ],
  moduleDirectories: [
    "node_modules",
    "<rootDir>"
  ],
  moduleNameMapper: {
    "\\.(html)$": "<rootDir>/test/helpers/fileMock.js"
  },
  transformIgnorePatterns: [`<rootDir>/node_modules/`, "<rootDir>/content/"],
};