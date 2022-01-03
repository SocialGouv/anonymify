/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testTimeout: 60000,
  verbose: true,
  snapshotFormat: {
    printBasicPrototype: false,
  },
};
