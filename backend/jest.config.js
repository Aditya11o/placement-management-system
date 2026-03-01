module.exports = {
    testEnvironment: 'node',
    verbose: true,
    forceExit: true,
    projects: [
        // ── Unit / existing tests ─────────────────────────────────────────────
        {
            displayName: 'unit',
            testEnvironment: 'node',
            testMatch: ['**/tests/**/*.test.js'],          // *.test.js only
            testTimeout: 10000,
            forceExit: true
        },
        // ── Integration tests ─────────────────────────────────────────────────
        {
            displayName: 'integration',
            testEnvironment: 'node',
            testMatch: ['**/tests/integration/**/*.integration.test.js'],
            testTimeout: 30000,
            forceExit: true,
            // Runs mocks BEFORE each test file's module graph is resolved
            setupFilesAfterEnv: ['<rootDir>/tests/integration/setup.js']
        }
    ]
};
