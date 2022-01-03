/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testTimeout: 120000,
  verbose: true,
  snapshotFormat: {
    printBasicPrototype: false,
  },
};
