const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const Job = require('../models/Job');
const Profile = require('../models/Profile');
const { connect, close, clear } = require('./setup');
const jwt = require('jsonwebtoken');

beforeAll(async () => await connect());
afterAll(async () => await close());
beforeEach(async () => await clear());

const generateTestToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });

describe('Jobs API Integration', () => {
  let recruiterToken, studentToken, adminToken;
  let recruiterId, studentId, adminId;

  beforeEach(async () => {
    const recruiter = await User.create({ name: 'HR Recruiter', email: 'hr@google-corp.com', password: 'Testing@1234', role: 'recruiter', status: 'active' });
    const student = await User.create({ name: 'TNU Student', email: 'stud@tnu.in', password: 'Testing@1234', role: 'student', status: 'active' });
    const admin = await User.create({ name: 'TNU Admin', email: 'admin@tnu.in', password: 'Testing@1234', role: 'admin', status: 'active' });

    recruiterId = recruiter._id;
    studentId = student._id;
    adminId = admin._id;

    recruiterToken = generateTestToken(recruiterId);
    studentToken = generateTestToken(studentId);
    adminToken = generateTestToken(adminId);

    // Setup student profile for eligibility tests
    await Profile.create({ 
      user: studentId, 
      studentDetails: { cgpa: 8.5, branch: 'Computer Science' } 
    });
  });

  describe('POST /api/jobs', () => {
    it('should allow recruiter to create a job', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          title: 'Software Engineer',
          description: 'Looking for a highly skilled software engineer to join our team and build scalable applications.',
          companyName: 'Google',
          location: 'Remote',
          salary: '1200000',
          jobType: 'Full-time',
          eligibility: { minCGPA: 7.0, branches: ['Computer Science'] },
          deadline: new Date(Date.now() + 86400000).toISOString()
        });
      
      if (res.statusCode !== 201) console.log('APPLY JOB ERROR:', res.body);
      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe('Software Engineer');
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
      await Job.create({
        recruiter: recruiterId, 
        title: 'Eligible Job', 
        status: 'open',
        description: 'A great opportunity for computer science students with high CGPA.',
        companyName: 'Tech Corp',
        location: 'Kolkata',
        salary: '600000',
        jobType: 'Full-time',
        eligibility: { minCGPA: 8.0, branches: ['Computer Science'] },
        deadline: new Date(Date.now() + 86400000)
      });
      // Job 2: Ineligible (CGPA)
      await Job.create({
        recruiter: recruiterId, 
        title: 'Hard Job', 
        status: 'open',
        description: 'Demanding role requiring exceptional academic performance.',
        companyName: 'High Bar Inc',
        location: 'Bangalore',
        salary: '1500000',
        jobType: 'Full-time',
        eligibility: { minCGPA: 9.0, branches: ['Computer Science'] },
        deadline: new Date(Date.now() + 86400000)
      });
      // Job 3: Ineligible (Branch)
      await Job.create({
        recruiter: recruiterId, 
        title: 'Mech Job', 
        status: 'open',
        description: 'Core mechanical engineering role for eligible branches.',
        companyName: 'Heavy Indus',
        location: 'Pune',
        salary: '500000',
        jobType: 'Full-time',
        eligibility: { minCGPA: 7.0, branches: ['Mechanical Engineering'] },
        deadline: new Date(Date.now() + 86400000)
      });
    });

    it('should only return matched jobs for a student', async () => {
      const res = await request(app)
        .get('/api/jobs/matched')
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe('Eligible Job');
    });
  });

  describe('PATCH /api/jobs/:id/status', () => {
    it('should allow admin to close a job', async () => {
      const job = await Job.create({
        recruiter: recruiterId, 
        title: 'Open Job', 
        status: 'open',
        description: 'General opening that will be closed by admin shortly.',
        companyName: 'Temp Co',
        location: 'Noida',
        salary: '400000',
        jobType: 'Internship',
        deadline: new Date(Date.now() + 86400000)
      });

      const res = await request(app)
        .patch(`/api/jobs/${job._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'closed' });
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('closed');
    });
  });
});
