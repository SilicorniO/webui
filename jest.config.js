module.exports = {
    preset: "jest-puppeteer",
    roots: ["<rootDir>/src"],
    testMatch: ["**/?(*.)+(spec|test).+(ts|tsx|js)"],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest",
    },
}
/*
    globalSetup: "./jest.global-setup.js",
    globalTeardown: "./jest.global-teardown.js",
    testEnvironment: "./puppeteer.environment.js",
*/
