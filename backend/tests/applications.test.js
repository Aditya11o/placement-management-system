const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Job = require('../models/Job');
const Profile = require('../models/Profile');
const Application = require('../models/Application');
const { connect, close, clear } = require('./setup');
const jwt = require('jsonwebtoken');

jest.mock('../utils/emailUtils', () => jest.fn().mockResolvedValue(true));

beforeAll(async () => await connect());
afterAll(async () => await close());
beforeEach(async () => await clear());

const generateTestToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });

describe('Applications API Integration', () => {
  let recruiterToken, studentToken;
  let recruiterId, studentId, jobId;

  beforeEach(async () => {
    const recruiter = await User.create({ name: 'HR Recruiter', email: 'hr@google-corp.com', password: 'Testing@1234', role: 'recruiter', status: 'active' });
    const student = await User.create({ name: 'TNU Student', email: 'stud@tnu.in', password: 'Testing@1234', role: 'student', status: 'active' });
    
    recruiterId = recruiter._id;
    studentId = student._id;
    recruiterToken = generateTestToken(recruiterId);
    studentToken = generateTestToken(studentId);

    // Setup profile with CGPA
    await Profile.create({ user: studentId, studentDetails: { cgpa: 9.0, resume: 'http://resume.com', branch: 'Computer Science' } });

    // Create a job
    const job = await Job.create({
      recruiter: recruiterId, 
      title: 'Dev Role', 
      status: 'open',
      description: 'Exciting opportunity for budding developers to join our elite team.',
      companyName: 'Google',
      location: 'Bangalore',
      salary: '1800000',
      jobType: 'Full-time',
      eligibility: { minCGPA: 7.0, branches: ['Computer Science'] },
      deadline: new Date(Date.now() + 86400000)
    });
    jobId = job._id;
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
      // Update profile to low CGPA
      await Profile.findOneAndUpdate({ user: studentId }, { 'studentDetails.cgpa': 6.0 });

      const res = await request(app)
        .post(`/api/applications/${jobId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send();
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/insufficient cgpa/i);
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
      const appDoc = await Application.create({ student: studentId, job: jobId, resume: 'url' });

      const res = await request(app)
        .patch(`/api/applications/${appDoc._id}/status`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({ status: 'Shortlisted', feedback: 'Great profile' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('Shortlisted');
    });
  });

  describe('PATCH /api/applications/:id/offer', () => {
    it('should allow student to accept offer', async () => {
      const appDoc = await Application.create({ student: studentId, job: jobId, resume: 'url', status: 'Selected' });

      const res = await request(app)
        .patch(`/api/applications/${appDoc._id}/offer`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ response: 'Accepted' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('Accepted');

      const profile = await Profile.findOne({ user: studentId });
      expect(profile.studentDetails.placementStatus).toBe('Placed');
    });
  });
});
