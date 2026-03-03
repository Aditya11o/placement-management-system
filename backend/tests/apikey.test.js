const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const Admin = require('../src/models/Admin');

const TEST_MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/pms_test_db';

let adminToken, adminId;
let rawApiKey;
let apiKeyId;

beforeAll(async () => {
    await mongoose.connect(TEST_MONGO_URI);
    await Admin.deleteMany({});

    // Create an Admin to own the keys
    const admin = await Admin.create({
        name: 'API Key Admin',
        email: 'api_admin@example.com',
        password: 'password123',
        sub_role: 'SUPER_ADMIN'
    });
    adminId = admin._id;

    const adminLogin = await request(app).post('/api/v1/auth/login').send({
        email: admin.email, password: 'password123', role: 'ADMIN'
    });
    adminToken = adminLogin.body.token;
});

afterAll(async () => {
    await Admin.deleteMany({});
    await mongoose.connection.close();
});

describe('API Key Authentication Lifecycle', () => {

    it('should generate a new API key natively', async () => {
        const res = await request(app)
            .post('/api/v1/admin/api-keys')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Integration Script' });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.raw_api_key).toBeDefined();

        rawApiKey = res.body.data.raw_api_key;
    });

    it('should list active API keys and obscure the raw string', async () => {
        const res = await request(app)
            .get('/api/v1/admin/api-keys')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.count).toBe(1);
        expect(res.body.data[0].name).toBe('Integration Script');
        expect(res.body.data[0].raw_api_key).toBeUndefined();
        expect(res.body.data[0].keyHash).toBeUndefined(); // Ensure hashes don't leak either

        apiKeyId = res.body.data[0]._id;
    });

    it('should allow GET /dashboard using X-API-Key instead of JWT', async () => {
        const res = await request(app)
            .get('/api/v1/admin/dashboard')
            .set('X-API-Key', rawApiKey); // Intentionally omitting Bearer JWT token

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.studentCount).toBeDefined();
    });

    it('should prevent API keys from calling API key management routes', async () => {
        const res = await request(app)
            .get('/api/v1/admin/api-keys')
            .set('X-API-Key', rawApiKey);

        expect(res.statusCode).toBe(403);
    });

    it('should reject invalid API keys', async () => {
        const res = await request(app)
            .get('/api/v1/admin/dashboard')
            .set('X-API-Key', 'pms_fake_invalid_key');

        expect(res.statusCode).toBe(401);
    });

    it('should revoke an API key', async () => {
        const res = await request(app)
            .delete(`/api/v1/admin/api-keys/${apiKeyId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);

        // Verify it was deleted via listing
        const listRes = await request(app)
            .get('/api/v1/admin/api-keys')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(listRes.body.count).toBe(0);
    });

    it('should block dashboard access after key revocation', async () => {
        const res = await request(app)
            .get('/api/v1/admin/dashboard')
            .set('X-API-Key', rawApiKey);

        expect(res.statusCode).toBe(401);
    });

});
