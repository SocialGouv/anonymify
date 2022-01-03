/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest/presets/default-esm",
  testTimeout: 60000,
  verbose: true,
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  snapshotFormat: {
    printBasicPrototype: false,
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
