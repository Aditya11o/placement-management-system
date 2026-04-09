const request = require('supertest');
const app = require('../app');
const prisma = require('../utils/prisma');
const { connect, close, clear } = require('./prisma-test-setup');
const jwt = require('jsonwebtoken');

beforeAll(async () => await connect());
afterAll(async () => await close());
beforeEach(async () => await clear());

const generateTestToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });

describe('Jobs API Integration', () => {
  let recruiterToken, studentToken, adminToken;
  let recruiterId, studentId, adminId;
  let recruiterProfileId;

  beforeEach(async () => {
    // 1. Create Users
    const recruiter = await prisma.user.create({
      data: {
        name: 'HR Recruiter',
        email: 'hr@google-corp.com',
        password: 'hashedpassword',
        role: 'recruiter',
        status: 'active',
        recruiterProfile: { create: { companyName: 'Google', location: 'Remote' } }
      },
      include: { recruiterProfile: true }
    });

    const student = await prisma.user.create({
      data: {
        name: 'TNU Student',
        email: 'stud@tnu.in',
        password: 'hashedpassword',
        role: 'student',
        status: 'active',
        studentProfile: { 
          create: { 
            cgpa: 8.5, 
            branch: 'Computer Science',
            academicVerified: true 
          } 
        }
      },
      include: { studentProfile: true }
    });

    const admin = await prisma.user.create({
      data: {
        name: 'TNU Admin',
        email: 'admin@tnu.in',
        password: 'hashedpassword',
        role: 'admin',
        status: 'active'
      }
    });

    recruiterId = recruiter.id;
    studentId = student.id;
    adminId = admin.id;
    recruiterProfileId = recruiter.recruiterProfile.id;

    recruiterToken = generateTestToken(recruiterId);
    studentToken = generateTestToken(studentId);
    adminToken = generateTestToken(adminId);
  });

  describe('POST /api/jobs', () => {
    it('should allow recruiter to create a job', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          title: 'Software Engineer',
          description: 'Looking for a highly skilled software engineer to join our team.',
          companyName: 'Google',
          location: 'Remote',
          salary: '1200000',
          jobType: 'Full-time',
          eligibility: { minCGPA: 7.0, branches: ['Computer Science'] },
          deadline: new Date(Date.now() + 86400000).toISOString()
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe('Software Engineer');
      
      // Check randomization logic in controller if needed, but usually we just check res.body
      expect(res.body).toHaveProperty('jobId'); 
    });

    it('should deny student from creating a job', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Hacked Job' });
      
      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/jobs/matched', () => {
    beforeEach(async () => {
      // Job 1: Eligible
      await prisma.job.create({
        data: {
          jobId: 'JOB-ELG1',
          recruiterId: recruiterProfileId,
          title: 'Eligible Job',
          description: 'A great opportunity.',
          companyName: 'Tech Corp',
          location: 'Kolkata',
          salary: '600000',
          jobType: 'Full_time',
          minCGPA: 8.0,
          branches: ['Computer Science'],
          deadline: new Date(Date.now() + 86400000),
          status: 'open'
        }
      });

      // Job 2: Ineligible (CGPA)
      await prisma.job.create({
        data: {
          jobId: 'JOB-INELG1',
          recruiterId: recruiterProfileId,
          title: 'Hard Job',
          description: 'High bar.',
          companyName: 'High Bar Inc',
          location: 'Bangalore',
          salary: '1500000',
          jobType: 'Full_time',
          minCGPA: 9.0,
          branches: ['Computer Science'],
          deadline: new Date(Date.now() + 86400000),
          status: 'open'
        }
      });

      // Job 3: Ineligible (Branch)
      await prisma.job.create({
        data: {
          jobId: 'JOB-INELG2',
          recruiterId: recruiterProfileId,
          title: 'Mech Job',
          description: 'Mechanical role.',
          companyName: 'Heavy Indus',
          location: 'Pune',
          salary: '500000',
          jobType: 'Full_time',
          minCGPA: 7.0,
          branches: ['Mechanical Engineering'],
          deadline: new Date(Date.now() + 86400000),
          status: 'open'
        }
      });
    });

    it('should only return matched jobs for a student', async () => {
      const res = await request(app)
        .get('/api/jobs/matched')
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(res.statusCode).toBe(200);
      // Prisma pagination returns { data, total, page, limit }
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toBe('Eligible Job');
    });
  });

  describe('PATCH /api/jobs/:id/status', () => {
    it('should allow admin to close a job', async () => {
      const job = await prisma.job.create({
        data: {
          jobId: 'JOB-TEMP',
          recruiterId: recruiterProfileId,
          title: 'Open Job',
          description: 'Temp job.',
          companyName: 'Temp Co',
          location: 'Noida',
          salary: '400000',
          jobType: 'Internship',
          deadline: new Date(Date.now() + 86400000),
          status: 'open'
        }
      });

      const res = await request(app)
        .patch(`/api/jobs/${job.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'closed' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('closed');
    });
  });
});
