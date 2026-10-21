/** @type {import('ts-jest').InitialOptionsTsJest} */
export default {
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
    "^.+\\.jsx?$": "babel-jest",
  },
  testMatch: ["<rootDir>/__tests__/*.(spec|test).[jt]s?(x)"],
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
  collectCoverageFrom: [
    "<rootDir>/src/**/*.[jt]s?(x)",
    "<rootDir>/__tests__/*.[jt]s?(x)",
    "<rootDir>/__tests__/helpers/*.[jt]s?(x)",
    "!**/*.d.ts",
  ],
};
