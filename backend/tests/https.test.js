const request = require('supertest');
const { app } = require('../server');
const mongoose = require('mongoose');
const Student = require('../src/models/Student');
const fs = require('fs');
const path = require('path');
const config = require('../src/config/config');

// Mocks
jest.mock('../src/config/redis', () => ({
    getRedisClient: () => ({ isReady: true, get: jest.fn(), setEx: jest.fn(), del: jest.fn() }),
    connectRedis: jest.fn()
}));
jest.mock('../src/utils/socketManager', () => ({ initializeSocket: jest.fn() }));
jest.mock('../src/utils/logger', () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn(), http: jest.fn() }));

describe('HTTPS & Secure Cookies', () => {
    let dummyUser;

    beforeAll(async () => {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
        const mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());

        dummyUser = await Student.create({
            name: 'Secure Context Test',
            email: 'secure_ssl@test.com',
            password: 'StrongPassword123!',
            branch: 'CSE',
            cgpa: 9.0,
            graduation_year: 2024,
            phone: '1234567890',
            marks_10th: 90,
            marks_12th: 90,
            gender: 'MALE',
            status: 'APPROVED'
        });
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    it('should drop a regular cookie when HTTPS is false in development', async () => {
        config.set('https', false);
        config.set('env', 'development');

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'secure_ssl@test.com', password: 'StrongPassword123!', role: 'STUDENT' });

        expect(res.statusCode).toBe(200);

        // Assert the cookie string explicitly DOES NOT contain "Secure"
        const cookieStr = res.headers['set-cookie'][0];
        expect(cookieStr).not.toMatch(/Secure/i);
    });

    it('should drop a STRICT Secure cookie when HTTPS is toggled True locally', async () => {
        config.set('https', true);
        config.set('env', 'development');

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'secure_ssl@test.com', password: 'StrongPassword123!', role: 'STUDENT' });

        expect(res.statusCode).toBe(200);

        // Assert the cookie string securely flags the network transport layer via "Secure" HTTP spec
        const cookieStr = res.headers['set-cookie'][0];
        expect(cookieStr).toMatch(/Secure/i);
    });
});
