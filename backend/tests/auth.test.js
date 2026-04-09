const request = require('supertest');
const app = require('../app');
const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const { connect, close, clear } = require('./prisma-test-setup');

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
      
      // Verify database
      const user = await prisma.user.findUnique({ where: { email: testStudent.email } });
      expect(user).toBeDefined();
      expect(user.role).toBe('student');
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
      // Create admin manually
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Testing@1234', salt);
      
      await prisma.user.create({
        data: {
          name: 'System Admin',
          email: 'admin@tnu.in',
          password: hashedPassword,
          role: 'admin',
          status: 'active'
        }
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
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Testing@1234', salt);
      
      const user = await prisma.user.create({
        data: {
          name: 'OTP Admin',
          email: 'otp-admin@tnu.in',
          password: hashedPassword,
          role: 'admin',
          status: 'active',
          otp: '123456',
          otpExpires: new Date(Date.now() + 10000)
        }
      });

      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: 'otp-admin@tnu.in', otp: '123456' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      
      const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
      expect(updatedUser.otp).toBeNull();
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
    it('should send reset link', async () => {
      await request(app).post('/api/auth/register').send(testStudent);
      
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testStudent.email });
      
      expect(res.statusCode).toBe(200);
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        template: 'password-reset'
      }));

      const user = await prisma.user.findUnique({ where: { email: testStudent.email } });
      expect(user.reset_token).toBeDefined();
    });
  });
});
