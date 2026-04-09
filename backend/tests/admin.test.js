const request = require('supertest');
const app = require('../app');
const prisma = require('../utils/prisma');
const { connect, close, clear } = require('./prisma-test-setup');
const jwt = require('jsonwebtoken');

jest.setTimeout(30000);

// Mock email utility
jest.mock('../utils/emailUtils', () => jest.fn().mockResolvedValue(true));

beforeAll(async () => await connect());
afterAll(async () => await close());

const generateTestToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1d' });

describe('Admin API Integration', () => {
  let adminToken, adminId;

  beforeEach(async () => {
    await clear();
    // Create Admin User
    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@tnu.in',
        password: 'hashedpassword',
        role: 'admin',
        status: 'active'
      }
    });
    adminId = admin.id;
    adminToken = generateTestToken(adminId);
    
    // Safety check: verify admin exists in DB
    const verify = await prisma.user.findUnique({ where: { id: adminId } });
    if (!verify) throw new Error('Failed to create admin for test');
  });

  describe('PATCH /api/admin/recruiters/:id/approve', () => {
    it('should allow admin to approve a recruiter', async () => {
      const recruiter = await prisma.user.create({
        data: {
          name: 'HR',
          email: 'hr@google-corp.com',
          password: 'hashedpassword',
          role: 'recruiter',
          status: 'pending'
        }
      });

      const res = await request(app)
        .patch(`/api/admin/recruiters/${recruiter.id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'active' });
      
      expect(res.statusCode).toBe(200);
      const updated = await prisma.user.findUnique({ where: { id: recruiter.id } });
      expect(updated.status).toBe('active');
      expect(updated.isVerified).toBe(true);
    });
  });

  describe('GET /api/admin/users', () => {
    it('should list all users', async () => {
      await prisma.user.create({ data: { name: 'S1', email: 's1@tnu.in', password: 'p', role: 'student' } });
      await prisma.user.create({ data: { name: 'R1', email: 'r1@comp.com', password: 'p', role: 'recruiter' } });

      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      // Pagination structure: { data, total, page, limit }
      expect(res.body.data.length).toBeGreaterThanOrEqual(3); // 2 new + 1 admin
    });
  });

  describe('PATCH /api/admin/users/bulk', () => {
    it('should bulk verify students', async () => {
      const s1 = await prisma.user.create({ data: { name: 'S1', email: 's1-bulk@tnu.in', password: 'p', role: 'student', isVerified: false } });
      const s2 = await prisma.user.create({ data: { name: 'S2', email: 's2-bulk@tnu.in', password: 'p', role: 'student', isVerified: false } });

      const res = await request(app)
        .patch('/api/admin/users/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userIds: [s1.id, s2.id],
          isVerified: true,
          status: 'active'
        });
      
      expect(res.statusCode).toBe(200);
      const updatedS1 = await prisma.user.findUnique({ where: { id: s1.id } });
      expect(updatedS1.isVerified).toBe(true);
    });
  });

  describe('Access Control', () => {
    it('should deny student from accessing admin routes', async () => {
      const student = await prisma.user.create({ data: { name: 'S1', email: 's1-access@tnu.in', password: 'p', role: 'student' } });
      const studentToken = generateTestToken(student.id);

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(res.statusCode).toBe(403);
    });
  });
});
