/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testTimeout: 120000,
  snapshotFormat: {
    printBasicPrototype: false,
  },
};
