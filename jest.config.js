/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */
import { TS_TRANSFORM_PATTERN } from "ts-jest";

/** @type {import('jest').Config} */
export default {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["@testing-library/jest-dom", "<rootDir>/jest-setup.ts"],
  transform: {
    [TS_TRANSFORM_PATTERN]: [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.json",
        useESM: false,
      },
    ],
  },
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/demo/"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/*.d.ts",
  ],
  moduleNameMapper: {
    "#dialogist/(.*)": "<rootDir>/src/$1",
  },
};
