module.exports = {
    preset: "jest-puppeteer",
    roots: ["<rootDir>/src"],
    testMatch: ["**/__tests__/**/*.+(ts|tsx|js)", "**/?(*.)+(spec|test).+(ts|tsx|js)"],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest",
    },
    globalSetup: "./jest.global-setup.js",
    globalTeardown: "./jest.global-teardown.js",
}
/*
    testEnvironment: "./puppeteer.environment.js",
*/
