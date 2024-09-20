module.exports = {
    preset: 'ts-jest',
    transform: {
        '^.+\\.(ts|tsx)?$': 'ts-jest',
        '^.+\\.(js|jsx)$': 'babel-jest',
        '^.+\\.vue$': 'vue-jest',
    },
    moduleNameMapper: {
        "^@components/(.*)$": "<rootDir>/src/.vuepress/components/$1"
    },
    moduleFileExtensions: [
        "js",
        "ts",
    ],
    testMatch: [
        "**/*.test.(js|jsx|ts|tsx|vue)"
    ],
    transformIgnorePatterns: [
        "/node_modules"
    ],
    testEnvironment: "jsdom",
    "verbose": true,
};
