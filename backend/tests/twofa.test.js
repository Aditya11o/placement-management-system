const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const Admin = require('../src/models/Admin');
const { generate2FASecret, verify2FAToken } = require('../src/utils/totp');
const speakeasy = require('speakeasy');
const jwt = require('jsonwebtoken');

const TEST_MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/pms_test_db';

let adminToken;
let adminId;

beforeAll(async () => {
    await mongoose.connect(TEST_MONGO_URI);

    // Create a test admin
    const admin = await Admin.create({
        name: 'Test Admin',
        email: 'admin2fa@example.com',
        password: 'password123'
    });
    adminId = admin._id;

    // Login to get token
    const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
            email: 'admin2fa@example.com',
            password: 'password123',
            role: 'ADMIN'
        });
    adminToken = res.body.token;
});

afterAll(async () => {
    await Admin.deleteMany({});
    await mongoose.connection.close();
});

describe('2FA Authentication Flow', () => {

    it('should generate 2FA secret and return QR code', async () => {
        const res = await request(app)
            .post('/api/v1/auth/2fa/generate')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.qrCodeUrl).toBeDefined();

        // Verify the secret was saved in DB but 2FA is not yet enabled
        const admin = await Admin.findById(adminId).select('+twofa_secret');
        expect(admin.twofa_secret).toBeDefined();
        expect(admin.twofa_enabled).toBe(false);
    });

    it('should fail to enable 2FA with an invalid token', async () => {
        const res = await request(app)
            .post('/api/v1/auth/2fa/enable')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ token: '000000' });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/Invalid 2FA token/);
    });

    it('should enable 2FA with a valid token', async () => {
        const admin = await Admin.findById(adminId).select('+twofa_secret');

        // Generate valid token manually
        const validToken = speakeasy.totp({
            secret: admin.twofa_secret,
            encoding: 'base32'
        });

        const res = await request(app)
            .post('/api/v1/auth/2fa/enable')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ token: validToken });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);

        // Verify it's enabled in DB
        const updatedAdmin = await Admin.findById(adminId);
        expect(updatedAdmin.twofa_enabled).toBe(true);
    });

    it('should require 2FA on login when enabled', async () => {
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'admin2fa@example.com',
                password: 'password123',
                role: 'ADMIN'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.requires2FA).toBe(true);
        expect(res.body.tempToken).toBeDefined();
        expect(res.body.token).toBeUndefined(); // Should NOT return standard auth token
    });

    it('should verify login with valid 2FA token and tempToken', async () => {
        // 1. Get temp token
        const loginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: 'admin2fa@example.com',
                password: 'password123',
                role: 'ADMIN'
            });

        const tempToken = loginRes.body.tempToken;

        // 2. Generate valid 2FA code
        const admin = await Admin.findById(adminId).select('+twofa_secret');
        const validToken = speakeasy.totp({
            secret: admin.twofa_secret,
            encoding: 'base32'
        });

        // 3. Verify
        const verifyRes = await request(app)
            .post('/api/v1/auth/2fa/verify-login')
            .send({
                tempToken,
                token: validToken
            });

        expect(verifyRes.statusCode).toBe(200);
        expect(verifyRes.body.success).toBe(true);
        expect(verifyRes.body.token).toBeDefined(); // Standard auth token returned now
    });

    it('should disable 2FA successfully', async () => {
        const admin = await Admin.findById(adminId).select('+twofa_secret');
        const validToken = speakeasy.totp({
            secret: admin.twofa_secret,
            encoding: 'base32'
        });

        const res = await request(app)
            .post('/api/v1/auth/2fa/disable')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                password: 'password123',
                token: validToken
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);

        const updatedAdmin = await Admin.findById(adminId).select('+twofa_secret');
        expect(updatedAdmin.twofa_enabled).toBe(false);
        expect(updatedAdmin.twofa_secret).toBeUndefined();
    });
});
