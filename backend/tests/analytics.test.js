const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const Student = require('../src/models/Student');
const Admin = require('../src/models/Admin');
const Job = require('../src/models/Job');
const Application = require('../src/models/Application');
const Recruiter = require('../src/models/Recruiter');

const TEST_MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/pms_test_db';

let adminToken;
let studentToken;

beforeAll(async () => {
    await mongoose.connect(TEST_MONGO_URI);

    await mongoose.connection.collection('admins').deleteMany({});
    await mongoose.connection.collection('students').deleteMany({});
    await mongoose.connection.collection('recruiters').deleteMany({});
    await mongoose.connection.collection('jobs').deleteMany({});
    await mongoose.connection.collection('applications').deleteMany({});

    // 1. Create an Admin
    await Admin.create({
        name: 'Analytics Admin',
        email: 'analytics_admin@example.com',
        password: 'password123'
    });

    const adminLogin = await request(app).post('/api/v1/auth/login').send({
        email: 'analytics_admin@example.com',
        password: 'password123',
        role: 'ADMIN'
    });
    adminToken = adminLogin.body.token;

    // 2. Create a Student
    const studentObj = await Student.create({
        name: 'Analytics Student',
        email: 'analytics_student@example.com',
        password: 'password123',
        branch: 'CSE',
        cgpa: 9.0,
        graduation_year: 2024,
        phone: '1234567890',
        marks_10th: 90,
        marks_12th: 90,
        gender: 'MALE',
        status: 'APPROVED'
    });

    const studentLogin = await request(app).post('/api/v1/auth/login').send({
        email: 'analytics_student@example.com',
        password: 'password123',
        role: 'STUDENT'
    });
    studentToken = studentLogin.body.token;

    // 3. Create a Recruiter
    const recruiterObj = await Recruiter.create({
        company_name: 'Tech Analytics Corp',
        contact_person: 'John Doe',
        email: 'recruiter_analytics@example.com',
        password: 'password123',
        phone: '1234567890',
        status: 'APPROVED'
    });

    // 4. Create a Job
    const jobObj = await Job.create({
        title: 'Software Engineer',
        description: 'Great role',
        company_name: 'Tech Analytics Corp',
        min_cgpa: 7.5,
        eligible_branch: 'ALL',
        graduation_year: 2024,
        deadline: new Date(Date.now() + 86400000), // tomorrow
        recruiter_id: recruiterObj._id
    });

    // 5. Create an Application and select the student
    await Application.create({
        student_id: studentObj._id,
        job_id: jobObj._id,
        status: 'SELECTED'
    });
});

afterAll(async () => {
    await Admin.deleteMany({});
    await Student.deleteMany({});
    await Recruiter.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await mongoose.connection.close();
});

describe('Analytics & Reporting API', () => {

    describe('Authorization Checks', () => {
        it('should block non-admins from accessing overview stats', async () => {
            const res = await request(app)
                .get('/api/v1/analytics/overview')
                .set('Authorization', `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(403);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toMatch(/Role STUDENT is not permitted/i);
        });

        it('should block unauthenticated access', async () => {
            const res = await request(app)
                .get('/api/v1/analytics/overview');

            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('Admin Analytics Data Retrieval', () => {
        it('should return overview stats for admins', async () => {
            const res = await request(app)
                .get('/api/v1/analytics/overview')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.totalStudents).toBeGreaterThanOrEqual(1);
            expect(res.body.data.totalRecruiters).toBeGreaterThanOrEqual(1);
            expect(res.body.data.activeJobs).toBeGreaterThanOrEqual(1);
            expect(res.body.data.totalApplications).toBeGreaterThanOrEqual(1);
        });

        it('should return valid placement stats calculations', async () => {
            const res = await request(app)
                .get('/api/v1/analytics/placements')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);

            // We placed exactly 1 student above in setup out of 1 test student
            expect(res.body.data.totalPlaced).toBe(1);
            expect(res.body.data.totalEligibleStudents).toBe(1); // the 1 APPROVED student
            expect(res.body.data.placementRate).toBe(100);
        });

        it('should return branch placement stats array', async () => {
            const res = await request(app)
                .get('/api/v1/analytics/branch-placements')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);

            // Look for our CSE branch in the returned array
            const cseStats = res.body.data.find(b => b.branch === 'CSE');
            expect(cseStats).toBeDefined();
            expect(cseStats.totalStudents).toBeGreaterThanOrEqual(1);
            expect(cseStats.placedStudents).toBeGreaterThanOrEqual(1);
            expect(cseStats.placementRate).toBeGreaterThanOrEqual(0); // 100 in isolated test
        });

        it('should return top hiring companies', async () => {
            const res = await request(app)
                .get('/api/v1/analytics/top-companies')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThanOrEqual(1);

            const topCo = res.body.data[0];
            expect(topCo.company_name).toBe('Tech Analytics Corp');
            expect(topCo.totalHires).toBe(1);
        });
    });

});
