const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const Admin = require('../src/models/Admin');
const Log = require('../src/models/Log');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let superAdminToken, superAdminId;
let regularAdminToken, regularAdminId;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // 1. Create a SUPER_ADMIN
    const superAdmin = await Admin.create({
        name: 'Super Admin',
        email: 'super@pms.com',
        password: 'password123',
        sub_role: 'SUPER_ADMIN'
    });
    superAdminId = superAdmin._id;

    const superLogin = await request(app).post('/api/v1/auth/login').send({
        email: 'super@pms.com',
        password: 'password123',
        role: 'ADMIN'
    });
    superAdminToken = superLogin.body.token;

    // 2. Create a regular ADMIN
    const regularAdmin = await Admin.create({
        name: 'Regular Admin',
        email: 'admin@pms.com',
        password: 'password123',
        sub_role: 'ADMIN',
        permissions: [] // Start with no permissions
    });
    regularAdminId = regularAdmin._id;

    const adminLogin = await request(app).post('/api/v1/auth/login').send({
        email: 'admin@pms.com',
        password: 'password123',
        role: 'ADMIN'
    });
    regularAdminToken = adminLogin.body.token;
});

afterAll(async () => {
    await Admin.deleteMany({});
    await Log.deleteMany({});
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('RBAC & Permission Management API', () => {

    describe('GET /api/v1/rbac/permissions', () => {
        it('should return the full permission manifest', async () => {
            const res = await request(app)
                .get('/api/v1/rbac/permissions')
                .set('Authorization', `Bearer ${superAdminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.permissions).toBeDefined();
            expect(res.body.data.sub_roles).toBeDefined();
        });
    });

    describe('GET /api/v1/rbac/me', () => {
        it('should return implicit ALL_PERMISSIONS for SUPER_ADMIN', async () => {
            const res = await request(app)
                .get('/api/v1/rbac/me')
                .set('Authorization', `Bearer ${superAdminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.isSuperAdmin).toBe(true);
            expect(res.body.data.permissions.length).toBeGreaterThan(5);
        });

        it('should return restricted permissions for regular ADMIN', async () => {
            const res = await request(app)
                .get('/api/v1/rbac/me')
                .set('Authorization', `Bearer ${regularAdminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.isSuperAdmin).toBe(false);
            expect(res.body.data.permissions).toEqual([]);
        });
    });

    describe('SUPER_ADMIN Only Operations', () => {
        it('should allow SUPER_ADMIN to list all admins', async () => {
            const res = await request(app)
                .get('/api/v1/rbac/admins')
                .set('Authorization', `Bearer ${superAdminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.count).toBe(2);
        });

        it('should block regular ADMIN from listing admins (missing manage_admins)', async () => {
            const res = await request(app)
                .get('/api/v1/rbac/admins')
                .set('Authorization', `Bearer ${regularAdminToken}`);

            expect(res.statusCode).toBe(403);
        });

        it('should grant specific permissions to a regular admin', async () => {
            const res = await request(app)
                .post(`/api/v1/rbac/admins/${regularAdminId}/permissions`)
                .set('Authorization', `Bearer ${superAdminToken}`)
                .send({ permissions: ['manage_jobs', 'view_analytics'] });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.permissions).toContain('manage_jobs');
            expect(res.body.data.permissions).toContain('view_analytics');

            // Verify Audit Log
            const audit = await Log.findOne({ action: 'GRANT_PERMISSIONS', target_id: regularAdminId });
            expect(audit).toBeDefined();
        });

        it('should reject granting invalid permission keys', async () => {
            const res = await request(app)
                .post(`/api/v1/rbac/admins/${regularAdminId}/permissions`)
                .set('Authorization', `Bearer ${superAdminToken}`)
                .send({ permissions: ['hack_database', 'delete_everything'] });

            expect(res.statusCode).toBe(400);
        });

        it('should allow changing sub-role to PLACEMENT_COORDINATOR with defaults', async () => {
            const res = await request(app)
                .put(`/api/v1/rbac/admins/${regularAdminId}/sub-role`)
                .set('Authorization', `Bearer ${superAdminToken}`)
                .send({ sub_role: 'PLACEMENT_COORDINATOR' });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.sub_role).toBe('PLACEMENT_COORDINATOR');
            expect(res.body.data.permissions.length).toBeGreaterThan(2);
            expect(res.body.data.permissions).toContain('manage_students');
        });

        it('should prevent an admin from changing their own sub-role', async () => {
            const res = await request(app)
                .put(`/api/v1/rbac/admins/${superAdminId}/sub-role`)
                .set('Authorization', `Bearer ${superAdminToken}`)
                .send({ sub_role: 'ADMIN' });

            expect(res.statusCode).toBe(403);
            expect(res.body.message).toMatch(/Cannot change your own sub_role/i);
        });

        it('should revoke permissions from an admin', async () => {
            const res = await request(app)
                .delete(`/api/v1/rbac/admins/${regularAdminId}/permissions`)
                .set('Authorization', `Bearer ${superAdminToken}`)
                .send({ permissions: ['manage_students'] });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.permissions).not.toContain('manage_students');
        });
    });
});
