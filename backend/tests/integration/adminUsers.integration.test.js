/**
 * Integration Test: Admin User Management Flow
 *
 * Covers the full HTTP request→response chain for:
 *   - Non-admins cannot access admin routes (role guard)
 *   - Admin approves a PENDING student
 *   - Admin blocks a user
 *   - Admin views user list with filtering
 *   - RBAC sub-role gate: PLACEMENT_COORDINATOR without manage_api_keys is rejected
 *   - SUPER_ADMIN can grant permissions to another admin
 *   - Audit log is written and readable after admin action
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../../server');
const Student = require('../../src/models/Student');
const Admin = require('../../src/models/Admin');

let mongoServer;
let superAdminToken, coordinatorToken, studentToken;
let pendingStudentId;

// ── Seed helpers ──────────────────────────────────────────────────────────────
const loginAdmin = async (email, password) => {
    const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password, role: 'ADMIN' });
    return res.body.token;
};

// ── Lifecycle ────────────────────────────────────────────────────────────────
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    await mongoose.connect(mongoServer.getUri());

    // Seed a SUPER_ADMIN directly in DB (no public register route for admins)
    await Admin.create({
        name: 'Super Admin',
        email: 'super.admin@test.com',
        password: 'SuperPass123!',
        sub_role: 'SUPER_ADMIN',
        permissions: []  // SUPER_ADMIN bypasses all checks
    });
    superAdminToken = await loginAdmin('super.admin@test.com', 'SuperPass123!');

    // Seed a PLACEMENT_COORDINATOR (limited permissions — no manage_api_keys)
    await Admin.create({
        name: 'Coordinator',
        email: 'coordinator@test.com',
        password: 'CoordPass123!',
        sub_role: 'PLACEMENT_COORDINATOR',
        permissions: ['manage_students', 'manage_recruiters', 'view_analytics', 'view_logs']
    });
    coordinatorToken = await loginAdmin('coordinator@test.com', 'CoordPass123!');

    // Seed a PENDING student
    const student = await Student.create({
        name: 'Pending Student',
        email: 'pending.student@test.com',
        password: 'Pass1234!',
        branch: 'ME', cgpa: 7.5, graduation_year: 2026,
        phone: '9000000200', marks_10th: 75, marks_12th: 78,
        gender: 'MALE', status: 'PENDING'
    });
    pendingStudentId = student._id.toString();

    // Seed an approved student for role-guard tests
    await Student.create({
        name: 'Approved Student', email: 'approved.admin.test@test.com',
        password: 'Pass1234!', branch: 'CSE', cgpa: 8.0,
        graduation_year: 2026, phone: '9000000201',
        marks_10th: 90, marks_12th: 88, gender: 'FEMALE', status: 'APPROVED'
    });
    const sLogin = await request(app).post('/api/v1/auth/login')
        .send({ email: 'approved.admin.test@test.com', password: 'Pass1234!', role: 'STUDENT' });
    studentToken = sLogin.body.token;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// ── Test Suites ───────────────────────────────────────────────────────────────
describe('Admin — Role Guard', () => {

    it('GET /api/v1/admin/users — unauthenticated request is rejected', async () => {
        const res = await request(app)
            .get('/api/v1/admin/users?role=STUDENT');
        expect(res.statusCode).toBe(401);
    });

    it('GET /api/v1/admin/users — student cannot access admin routes', async () => {
        const res = await request(app)
            .get('/api/v1/admin/users?role=STUDENT')
            .set('Authorization', `Bearer ${studentToken}`);
        expect(res.statusCode).toBe(403);
    });
});

describe('Admin — User Management', () => {

    it('GET /api/v1/admin/users?role=STUDENT — admin can list students', async () => {
        const res = await request(app)
            .get('/api/v1/admin/users?role=STUDENT')
            .set('Authorization', `Bearer ${superAdminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.some(s => s.email === 'pending.student@test.com')).toBe(true);
    });

    it('PUT /api/v1/admin/users/status — admin approves PENDING student', async () => {
        const res = await request(app)
            .put('/api/v1/admin/users/status')
            .set('Authorization', `Bearer ${superAdminToken}`)
            .send({ id: pendingStudentId, role: 'STUDENT', status: 'APPROVED' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe('APPROVED');

        // Verify the student can now login
        const loginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'pending.student@test.com', password: 'Pass1234!', role: 'STUDENT' });
        expect(loginRes.statusCode).toBe(200);
        expect(loginRes.body.token).toBeDefined();
    });

    it('PUT /api/v1/admin/users/status — admin blocks a student', async () => {
        const res = await request(app)
            .put('/api/v1/admin/users/status')
            .set('Authorization', `Bearer ${superAdminToken}`)
            .send({ id: pendingStudentId, role: 'STUDENT', status: 'BLOCKED' });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.status).toBe('BLOCKED');

        // Blocked user cannot login
        const loginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'pending.student@test.com', password: 'Pass1234!', role: 'STUDENT' });
        expect(loginRes.statusCode).toBe(403);
        expect(loginRes.body.message).toMatch(/BLOCKED/i);
    });

    it('PUT /api/v1/admin/users/status — rejects invalid status value', async () => {
        const res = await request(app)
            .put('/api/v1/admin/users/status')
            .set('Authorization', `Bearer ${superAdminToken}`)
            .send({ id: pendingStudentId, role: 'STUDENT', status: 'HACKED' });

        expect(res.statusCode).toBe(400);
    });
});

describe('Admin — RBAC Granular Permissions', () => {

    it('POST /api/v1/admin/api-keys — PLACEMENT_COORDINATOR without manage_api_keys is denied', async () => {
        const res = await request(app)
            .post('/api/v1/admin/api-keys')
            .set('Authorization', `Bearer ${coordinatorToken}`)
            .send({ name: 'Sneaky Key' });

        expect(res.statusCode).toBe(403);
        expect(res.body.message).toMatch(/manage_api_keys/i);
    });

    it('POST /api/v1/admin/api-keys — SUPER_ADMIN can generate API key', async () => {
        const res = await request(app)
            .post('/api/v1/admin/api-keys')
            .set('Authorization', `Bearer ${superAdminToken}`)
            .send({ name: 'Test Key' });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.raw_api_key).toBeDefined();
    });

    it('GET /api/v1/rbac/me — coordinator can see their own permissions', async () => {
        const res = await request(app)
            .get('/api/v1/rbac/me')
            .set('Authorization', `Bearer ${coordinatorToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.sub_role).toBe('PLACEMENT_COORDINATOR');
        expect(Array.isArray(res.body.data.permissions)).toBe(true);
        expect(res.body.data.isSuperAdmin).toBe(false);
    });

    it('GET /api/v1/rbac/me — SUPER_ADMIN sees all permissions', async () => {
        const res = await request(app)
            .get('/api/v1/rbac/me')
            .set('Authorization', `Bearer ${superAdminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.sub_role).toBe('SUPER_ADMIN');
        expect(res.body.data.isSuperAdmin).toBe(true);
    });

    it('GET /api/v1/rbac/admins — coordinator without manage_admins is denied', async () => {
        const res = await request(app)
            .get('/api/v1/rbac/admins')
            .set('Authorization', `Bearer ${coordinatorToken}`);

        expect(res.statusCode).toBe(403);
    });

    it('GET /api/v1/rbac/admins — SUPER_ADMIN can list all admins', async () => {
        const res = await request(app)
            .get('/api/v1/rbac/admins')
            .set('Authorization', `Bearer ${superAdminToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.some(a => a.email === 'super.admin@test.com')).toBe(true);
    });
});

describe('Admin — Audit Log API', () => {

    it('GET /api/v1/logs — SUPER_ADMIN can read audit logs', async () => {
        const res = await request(app)
            .get('/api/v1/logs')
            .set('Authorization', `Bearer ${superAdminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.pagination).toBeDefined();
    });

    it('GET /api/v1/logs?user_role=STUDENT — audit log filters by role', async () => {
        const res = await request(app)
            .get('/api/v1/logs?user_role=STUDENT')
            .set('Authorization', `Bearer ${superAdminToken}`);

        expect(res.statusCode).toBe(200);
        // All returned logs should be for STUDENT role
        res.body.data.forEach(log => {
            expect(log.user_role).toBe('STUDENT');
        });
    });

    it('GET /api/v1/logs/stats — returns 4 aggregation series', async () => {
        const res = await request(app)
            .get('/api/v1/logs/stats')
            .set('Authorization', `Bearer ${superAdminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data).toHaveProperty('actionBreakdown');
        expect(res.body.data).toHaveProperty('roleBreakdown');
        expect(res.body.data).toHaveProperty('dailyActivity');
        expect(res.body.data).toHaveProperty('topUsers');
    });

    it('GET /api/v1/logs — student cannot access audit logs', async () => {
        const res = await request(app)
            .get('/api/v1/logs')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toBe(403);
    });
});
