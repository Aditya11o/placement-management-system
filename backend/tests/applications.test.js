const request = require('supertest');
const app = require('../app');
const prisma = require('../utils/prisma');
const { connect, close, clear } = require('./prisma-test-setup');
const jwt = require('jsonwebtoken');

jest.setTimeout(30000);

jest.mock('../utils/emailUtils', () => jest.fn().mockResolvedValue(true));

beforeAll(async () => await connect());
afterAll(async () => await close());
beforeEach(async () => await clear());

const generateTestToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });

describe('Applications API Integration', () => {
  let recruiterToken, studentToken;
  let recruiterId, studentId, jobId;
  let studentProfileId, recruiterProfileId;

  beforeEach(async () => {
    // 1. Create Recruiter
    const recruiter = await prisma.user.create({
      data: {
        name: 'HR Recruiter',
        email: 'hr@google-corp.com',
        password: 'hashedpassword',
        role: 'recruiter',
        status: 'active',
        recruiterProfile: { create: { companyName: 'Google' } }
      },
      include: { recruiterProfile: true }
    });

    // 2. Create Student
    const student = await prisma.user.create({
      data: {
        name: 'TNU Student',
        email: 'stud@tnu.in',
        password: 'hashedpassword',
        role: 'student',
        status: 'active',
        studentProfile: { 
          create: { 
            cgpa: 9.0, 
            branch: 'Computer Science',
            academicVerified: true,
            resumePath: 'http://resume.com'
          } 
        }
      },
      include: { studentProfile: true }
    });
    
    recruiterId = recruiter.id;
    studentId = student.id;
    studentProfileId = student.studentProfile.id;
    recruiterProfileId = recruiter.recruiterProfile.id;
    
    recruiterToken = generateTestToken(recruiterId);
    studentToken = generateTestToken(studentId);

    // 3. Create a job
    const job = await prisma.job.create({
      data: {
        jobId: 'JOB-APP-1',
        recruiterId: recruiterProfileId,
        title: 'Dev Role',
        description: 'Exciting opportunity.',
        companyName: 'Google',
        location: 'Bangalore',
        salary: '1800000',
        jobType: 'Full_time',
        minCGPA: 7.0,
        branches: ['Computer Science'],
        deadline: new Date(Date.now() + 86400000),
        status: 'open'
      }
    });
    jobId = job.id;
  });

  describe('POST /api/applications/:jobId', () => {
    it('should allow student to apply for a job', async () => {
      const res = await request(app)
        .post(`/api/applications/${jobId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send();
      
      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('Applied');
    });

    it('should prevent applying if CGPA is low', async () => {
      // Update profile to low CGPA directly in DB
      await prisma.studentProfile.update({
        where: { id: studentProfileId },
        data: { cgpa: 6.0 }
      });

      const res = await request(app)
        .post(`/api/applications/${jobId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send();
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/eligibility requirements/i);
    });

    it('should prevent double application', async () => {
      await request(app).post(`/api/applications/${jobId}`).set('Authorization', `Bearer ${studentToken}`).send();
      const res = await request(app).post(`/api/applications/${jobId}`).set('Authorization', `Bearer ${studentToken}`).send();
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/already applied/i);
    });
  });

  describe('PATCH /api/applications/:id/status', () => {
    it('should allow recruiter to update status', async () => {
      const application = await prisma.application.create({
        data: {
          studentId: studentProfileId,
          jobId: jobId,
          resume: 'url',
          statusHistory: []
        }
      });

      const res = await request(app)
        .patch(`/api/applications/${application.id}/status`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({ status: 'Shortlisted', feedback: 'Great profile' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('Shortlisted');
    });
  });

  describe('PATCH /api/applications/:id/offer', () => {
    it('should allow student to accept offer', async () => {
      const application = await prisma.application.create({
        data: {
          studentId: studentProfileId,
          jobId: jobId,
          resume: 'url',
          status: 'Selected'
        }
      });

      const res = await request(app)
        .patch(`/api/applications/${application.id}/offer`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ response: 'Accepted' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('Accepted');

      const profile = await prisma.studentProfile.findUnique({ where: { id: studentProfileId } });
      expect(profile.placementStatus).toBe('Placed');
    });
  });
});
