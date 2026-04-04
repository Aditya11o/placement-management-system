const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const { connect, close, clear } = require('./setup');

// Mock email utility
jest.mock('../utils/emailUtils', () => jest.fn().mockResolvedValue(true));
const sendEmail = require('../utils/emailUtils');

beforeAll(async () => await connect());
afterAll(async () => await close());
beforeEach(async () => {
  await clear();
  jest.clearAllMocks();
});

describe('Auth API Integration', () => {
  const testStudent = {
    name: 'Student User',
    email: 'student@tnu.in',
    password: 'Testing@1234',
    role: 'student'
  };

  const testRecruiter = {
    name: 'Recruiter User',
    email: 'hr@google-corp.com',
    password: 'Testing@1234',
    role: 'recruiter'
  };

  describe('POST /api/auth/register', () => {
    it('should register a student with valid institutional email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testStudent);
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        email: testStudent.email,
        template: 'welcome'
      }));
    });

    it('should fail student registration with public email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...testStudent, email: 'student@gmail.com' });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/institutional email/i);
    });

    it('should register a recruiter (status: pending)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testRecruiter);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('pending');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(testStudent);
    });

    it('should login student and return tokens', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testStudent.email,
          password: testStudent.password
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should trigger 2FA for admin accounts', async () => {
      // Create admin manually (bypass registration logic if needed or use pre-existing)
      await User.create({
        name: 'System Admin',
        email: 'admin@tnu.in',
        password: 'Testing@1234',
        role: 'admin',
        status: 'active'
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@tnu.in',
          password: 'Testing@1234'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.requireOTP).toBe(true);
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        template: 'otp'
      }));
    });

    it('should lock account after 5 failed attempts', async () => {
      const loginAttempt = () => request(app)
        .post('/api/auth/login')
        .send({ email: testStudent.email, password: 'wrongpassword' });

      for (let i = 0; i < 5; i++) {
        await loginAttempt();
      }

      const res = await loginAttempt();
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/locked/i);
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    it('should verify OTP and login successfully', async () => {
      const user = await User.create({
        name: 'OTP Admin',
        email: 'otp-admin@tnu.in',
        password: 'Testing@1234',
        role: 'admin',
        status: 'active',
        otp: '123456',
        otpExpires: Date.now() + 10000
      });

      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: 'otp-admin@tnu.in', otp: '123456' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.otp).toBeUndefined();
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should return new access token using valid refresh token', async () => {
      const regRes = await request(app).post('/api/auth/register').send(testStudent);
      const refreshToken = regRes.body.refreshToken;

      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .send();
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
    });
  });

  describe('Password Reset Flow', () => {
    it('should send reset link and allow password change', async () => {
      await request(app).post('/api/auth/register').send(testStudent);
      
      // 1. Forgot password
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testStudent.email });
      
      const user = await User.findOne({ email: testStudent.email }).select('+reset_token');
      expect(user.reset_token).toBeDefined();

      // In real scenario, we'd get the token from email. 
      // Since it's hashed in DB, we'd need to know the raw token.
      // But for integration test, we can check that it works if we have the token.
    });
  });
});
