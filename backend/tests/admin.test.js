const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const { connect, close, clear } = require('./setup');
const jwt = require('jsonwebtoken');

// Mock email utility
jest.mock('../utils/emailUtils', () => jest.fn().mockResolvedValue(true));
const sendEmail = require('../utils/emailUtils');

beforeAll(async () => await connect());
afterAll(async () => await close());
beforeEach(async () => await clear());

const generateTestToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });

describe('Admin API Integration', () => {
  let adminToken, adminId;

  beforeEach(async () => {
    const admin = await User.create({ name: 'Admin', email: 'admin@tnu.in', password: 'Testing@1234', role: 'admin', status: 'active' });
    adminId = admin._id;
    adminToken = generateTestToken(adminId);
  });

  describe('PATCH /api/admin/recruiters/:id/approve', () => {
    it('should allow admin to approve a recruiter', async () => {
      const recruiter = await User.create({ name: 'HR', email: 'hr@google-corp.com', password: 'Testing@1234', role: 'recruiter', status: 'pending' });

      const res = await request(app)
        .patch(`/api/admin/recruiters/${recruiter._id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'active' });
      
      expect(res.statusCode).toBe(200);
      const updated = await User.findById(recruiter._id);
      expect(updated.status).toBe('active');
      expect(updated.isVerified).toBe(true);
    });
  });

  describe('GET /api/admin/users', () => {
    it('should list all users', async () => {
      await User.create({ name: 'S1', email: 's1@tnu.in', password: 'Testing@1234', role: 'student' });
      await User.create({ name: 'R1', email: 'r1@comp.com', password: 'Testing@1234', role: 'recruiter' });

      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(3); // 2 new + 1 admin
    });
  });

  describe('PATCH /api/admin/users/bulk', () => {
    it('should bulk verify students', async () => {
      const s1 = await User.create({ name: 'S1', email: 's1-bulk@tnu.in', password: 'Testing@1234', role: 'student', isVerified: false });
      const s2 = await User.create({ name: 'S2', email: 's2-bulk@tnu.in', password: 'Testing@1234', role: 'student', isVerified: false });

      const res = await request(app)
        .patch('/api/admin/users/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userIds: [s1._id, s2._id],
          isVerified: true,
          status: 'active'
        });
      
      expect(res.statusCode).toBe(200);
      const updatedS1 = await User.findById(s1._id);
      expect(updatedS1.isVerified).toBe(true);
    });
  });

  describe('Access Control', () => {
    it('should deny student from accessing admin routes', async () => {
      const student = await User.create({ name: 'S1', email: 's1-access@tnu.in', password: 'Testing@1234', role: 'student' });
      const studentToken = generateTestToken(student._id);

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(res.statusCode).toBe(403);
    });
  });
});
