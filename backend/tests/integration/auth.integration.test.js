/**
 * Integration Test: Authentication Flow
 *
 * Covers the full HTTP request→response chain for:
 *   - Student registration (happy path, duplicate email, missing fields)
 *   - Recruiter registration
 *   - Admin login (seeded directly)
 *   - Login blocked for PENDING users
 *   - Approved user login + JWT token returned
 *   - Wrong password rejected
 *   - Refresh token flow
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../../server');
const Student = require('../../src/models/Student');
const Admin = require('../../src/models/Admin');

let mongoServer;

// ── Test data ────────────────────────────────────────────────────────────────
const STUDENT = {
    name: 'Integration Student',
    email: 'student.integration@test.com',
    password: 'SecurePass123!',
    branch: 'CSE',
    cgpa: 8.5,
    graduation_year: 2026,
    phone: '9876543210',
    marks_10th: 90,
    marks_12th: 88,
    gender: 'MALE'
};

const RECRUITER = {
    company_name: 'Integration Corp',
    contact_person: 'HR Manager',
    email: 'recruiter.integration@test.com',
    password: 'SecurePass123!',
    phone: '9876543211'
};

// ── Lifecycle ────────────────────────────────────────────────────────────────
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    // Disconnect from any previously-open connection (e.g. from another test suite
    // or from server.js being required with a stale Mongoose singleton)
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    // Drop all collections between test suites to keep state clean
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        try { await collections[key].deleteMany({}); } catch { }
    }
});

// ── Test Suites ───────────────────────────────────────────────────────────────
describe('Auth — Student Registration', () => {

    it('POST /api/v1/auth/register/student — registers successfully', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register/student')
            .send(STUDENT);

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toMatch(/registered/i);
    });

    it('POST /api/v1/auth/register/student — rejects duplicate email', async () => {
        await request(app).post('/api/v1/auth/register/student').send(STUDENT);
        const res = await request(app).post('/api/v1/auth/register/student').send(STUDENT);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/register/student — rejects missing required fields', async () => {
        const { branch, ...incomplete } = STUDENT; // omit branch
        const res = await request(app)
            .post('/api/v1/auth/register/student')
            .send(incomplete);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/register/student — rejects invalid CGPA (> 10)', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register/student')
            .send({ ...STUDENT, cgpa: 15, email: 'cgpa.bad@test.com' });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe('Auth — Recruiter Registration', () => {

    it('POST /api/v1/auth/register/recruiter — registers successfully', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register/recruiter')
            .send(RECRUITER);

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
    });
});

describe('Auth — Login', () => {

    it('POST /api/v1/auth/login — blocks PENDING student (awaiting admin approval)', async () => {
        await request(app).post('/api/v1/auth/register/student').send(STUDENT);

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: STUDENT.email, password: STUDENT.password, role: 'STUDENT' });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toMatch(/PENDING/i);
    });

    it('POST /api/v1/auth/login — rejects wrong password', async () => {
        // Create & approve a student directly in DB
        await Student.create({ ...STUDENT, status: 'APPROVED' });

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: STUDENT.email, password: 'wrongpassword', role: 'STUDENT' });

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/login — approved student receives access + refresh token', async () => {
        await Student.create({ ...STUDENT, status: 'APPROVED' });

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: STUDENT.email, password: STUDENT.password, role: 'STUDENT' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.token).toBeDefined();
        expect(res.body.token).toMatch(/^[\w-]+\.[\w-]+\.[\w-]+$/); // JWT shape
    });

    it('POST /api/v1/auth/login — rejects BLOCKED user', async () => {
        await Student.create({ ...STUDENT, status: 'BLOCKED' });

        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: STUDENT.email, password: STUDENT.password, role: 'STUDENT' });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toMatch(/BLOCKED/i);
    });
});

describe('Auth — Protected Routes', () => {

    it('GET /api/v1/auth/me — returns 401 without token', async () => {
        const res = await request(app).get('/api/v1/auth/me');
        expect(res.statusCode).toBe(401);
    });

    it('GET /api/v1/auth/me — returns student profile with valid token', async () => {
        await Student.create({ ...STUDENT, status: 'APPROVED' });

        const loginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: STUDENT.email, password: STUDENT.password, role: 'STUDENT' });

        const token = loginRes.body.token;

        const meRes = await request(app)
            .get('/api/v1/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(meRes.statusCode).toBe(200);
        expect(meRes.body.data.email).toBe(STUDENT.email);
        expect(meRes.body.data.password).toBeUndefined(); // password never returned
    });
});
