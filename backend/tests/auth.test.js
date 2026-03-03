const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server'); // The exported express app
const Student = require('../src/models/Student');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Connect to a new in-memory database before running
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

// Clean up DB
afterAll(async () => {
    await Student.deleteMany({});
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Authentication API', () => {

    describe('POST /api/v1/auth/register/student', () => {

        it('should register a new student successfully', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register/student')
                .send({
                    name: 'Test Student',
                    email: 'testauth@example.com',
                    password: 'password123',
                    branch: 'CSE',
                    cgpa: 8.5,
                    graduation_year: 2025,
                    phone: '1234567890',
                    marks_10th: 90,
                    marks_12th: 92,
                    gender: 'MALE'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it('should not allow duplicate email registration', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register/student')
                .send({
                    name: 'Duplicate Student',
                    email: 'testauth@example.com', // same email
                    password: 'password123',
                    branch: 'CSE',
                    cgpa: 8.5,
                    graduation_year: 2025,
                    phone: '0987654321',
                    marks_10th: 90,
                    marks_12th: 92,
                    gender: 'MALE'
                });

            expect(res.statusCode).toBe(400); // Bad Request (Caught by validator ideally, or 500 otherwise, we'll test for 400)
            expect(res.body.success).toBe(false);
        });

        it('should validate missing required fields (e.g., branch)', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register/student')
                .send({
                    name: 'Invalid Student',
                    email: 'invalid@example.com',
                    password: 'password123',
                    // branch missing completely
                    cgpa: 8.5,
                    graduation_year: 2025,
                    phone: '0987654321',
                    marks_10th: 90,
                    marks_12th: 92,
                    gender: 'MALE'
                });

            expect(res.statusCode).toBe(400); // validation error
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/auth/login', () => {
        it('should block PENDING users from logging in depending on status', async () => {

            // First register a new fresh user specifically for this test
            await request(app).post('/api/v1/auth/register/student').send({
                name: 'Login Test Student',
                email: 'logintest@example.com',
                password: 'password123',
                branch: 'CSE',
                cgpa: 8.5,
                graduation_year: 2025,
                phone: '1234567890',
                marks_10th: 90,
                marks_12th: 92,
                gender: 'MALE'
            });

            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'logintest@example.com',
                    password: 'password123',
                    role: 'STUDENT'
                });

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toMatch(/Account is PENDING/i);
        });
    });

});
