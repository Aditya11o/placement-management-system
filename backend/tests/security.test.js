const request = require('supertest');
const { app } = require('../server');
const Student = require('../src/models/Student');
const mongoose = require('mongoose');

// We need an actual Express server instance to test rate limiting effectively,
// but to ensure we don't accidentally leave dangling Redis handles during testing
// we mock the Redis config to provide a simulated memory cache.
let mockRedisStorage = {};

jest.mock('../src/config/redis', () => ({
    getRedisClient: () => ({
        isReady: true,
        get: jest.fn(key => mockRedisStorage[key]),
        setEx: jest.fn((key, ttl, value) => { mockRedisStorage[key] = value; }),
        incr: jest.fn(key => {
            mockRedisStorage[key] = (mockRedisStorage[key] || 0) + 1;
            return mockRedisStorage[key];
        }),
        expire: jest.fn(),
        del: jest.fn(key => delete mockRedisStorage[key]),
    }),
    connectRedis: jest.fn()
}));

// We also mock the socketManager since server.js initializes it
jest.mock('../src/utils/socketManager', () => ({
    initializeSocket: jest.fn(),
    notifyUser: jest.fn(),
    notifyRole: jest.fn()
}));

// Mock logger
jest.mock('../src/utils/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    http: jest.fn()
}));

describe('Adaptive IP Blocklisting (Anti-DDoS)', () => {

    beforeAll(async () => {
        // We use an in-memory database configuration since this is an integration test
        // However, we just need a mock user for login attempts
        const { MongoMemoryServer } = require('mongodb-memory-server');

        // Ensure any stray Mongoose connections from loading server.js are killed
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }

        const mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());

        await Student.create({
            name: 'Security Test',
            email: 'secure_student@test.com',
            password: 'Password123!',
            branch: 'CSE',
            cgpa: 9.0,
            graduation_year: 2024,
            phone: '1234567890',
            marks_10th: 92,
            marks_12th: 95,
            gender: 'MALE',
            status: 'APPROVED'
        });

        // Set environment back to development to trigger the real middleware behaviors
        process.env.NODE_ENV = 'development';
    });

    afterAll(async () => {
        process.env.NODE_ENV = 'test';
        await mongoose.disconnect();
    });

    beforeEach(() => {
        // Reset the simulated Redis cache before each test
        mockRedisStorage = {};
        jest.clearAllMocks();
    });

    it('should temporarily ban an IP after 5 failed login attempts', async () => {
        const dummyIp = '192.168.1.100';

        // Attempt 4 failed logins
        for (let i = 0; i < 4; i++) {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .set('x-forwarded-for', dummyIp)
                .send({
                    email: 'secure_student@test.com',
                    password: 'WrongPassword!',
                    role: 'STUDENT'
                });
            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Invalid credentials');
        }

        // Check Redis state (4 strikes)
        expect(mockRedisStorage[`failed_login:${dummyIp}`]).toBe(4);
        expect(mockRedisStorage[`blocklist:${dummyIp}`]).toBeUndefined();

        // Attempt 5th failed login (Triggers Ban)
        const banRes = await request(app)
            .post('/api/v1/auth/login')
            .set('x-forwarded-for', dummyIp)
            .send({
                email: 'secure_student@test.com',
                password: 'WrongPassword!',
                role: 'STUDENT'
            });

        expect(banRes.statusCode).toBe(401);

        // Assert the IP was correctly placed on the blocklist and strikes wiped
        expect(mockRedisStorage[`blocklist:${dummyIp}`]).toBe('BANNED');
        expect(mockRedisStorage[`failed_login:${dummyIp}`]).toBeUndefined();

        // 6th Connection Attempt -> Entire API surface is now locked for this IP
        const blockedRes = await request(app)
            .get('/api/v1/jobs')
            .set('x-forwarded-for', dummyIp);

        expect(blockedRes.statusCode).toBe(403);
        expect(blockedRes.body.success).toBe(false);
        expect(blockedRes.body.message).toContain('Your IP Address has been temporarily banned');
    });

    it('should wipe strikes upon a successful login', async () => {
        const dummyIp = '10.0.0.5';

        // 1 failed attempt
        await request(app).post('/api/v1/auth/login')
            .set('x-forwarded-for', dummyIp)
            .send({ email: 'secure_student@test.com', password: 'Wrong', role: 'STUDENT' });

        expect(mockRedisStorage[`failed_login:${dummyIp}`]).toBe(1);

        // 1 successful attempt
        const successRes = await request(app).post('/api/v1/auth/login')
            .set('x-forwarded-for', dummyIp)
            .send({ email: 'secure_student@test.com', password: 'Password123!', role: 'STUDENT' });

        expect(successRes.statusCode).toBe(200);

        // Strikes should be cleared
        expect(mockRedisStorage[`failed_login:${dummyIp}`]).toBeUndefined();
    });

    it('should globally reject any route if IP is manually blocklisted via utility', async () => {
        const dummyIp = '203.0.113.195';

        // Simulating the banIp function having executed (or via Rate Limiting)
        mockRedisStorage[`blocklist:${dummyIp}`] = 'BANNED';

        // Try getting an announcement (which is normally open/public context)
        const res = await request(app)
            .get('/api/v1/announcements')
            .set('x-forwarded-for', dummyIp);

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toContain('banned');
    });
});
