import nextJest from "next/jest.js"

const createJestConfig = nextJest({
  dir: "./",
})

/** @type {import("jest").Config} */
const customJestConfig = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["**/*.test.ts?(x)"],
}

module.exports = createJestConfig(customJestConfig)
