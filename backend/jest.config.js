module.exports = {
    testEnvironment: 'node',
    verbose: true,
    projects: [
        // ── Unit / existing tests ─────────────────────────────────────────────
        {
            displayName: 'unit',
            testEnvironment: 'node',
            testMatch: ['**/tests/**/*.test.js'],          // *.test.js only
            testPathIgnorePatterns: ['/node_modules/', '/tests/integration/'],
            testTimeout: 10000
        },
        // ── Integration tests ─────────────────────────────────────────────────
        {
            displayName: 'integration',
            testEnvironment: 'node',
            testMatch: ['**/tests/integration/**/*.integration.test.js'],
            testTimeout: 30000,
            // Runs mocks BEFORE each test file's module graph is resolved
            setupFilesAfterEnv: ['<rootDir>/tests/integration/setup.js']
        }
    ]
};
