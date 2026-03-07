const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const Student = require('../src/models/Student');
const Recruiter = require('../src/models/Recruiter');
const Job = require('../src/models/Job');
const Application = require('../src/models/Application');
const Interview = require('../src/models/Interview');
const Notification = require('../src/models/Notification');

const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let studentToken, studentId;
let recruiterToken, recruiterId;
let otherRecruiterToken, otherRecruiterId;
let jobId, applicationId;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // 1. Create a Student
    const student = await Student.create({
        name: 'Interview Test Student',
        email: 'interview_student@example.com',
        password: 'password123',
        branch: 'CSE', cgpa: 8.5, graduation_year: 2025, phone: '1234567890',
        marks_10th: 90, marks_12th: 92, gender: 'MALE', status: 'APPROVED'
    });
    studentId = student._id;

    const studentLogin = await request(app).post('/api/v1/auth/login').send({
        email: student.email, password: 'password123', role: 'STUDENT'
    });
    studentToken = studentLogin.body.token;

    // 2. Create the Primary Recruiter
    const recruiter = await Recruiter.create({
        company_name: 'Interview Tech',
        contact_person: 'John Doe',
        email: 'interview_recruiter@example.com',
        password: 'password123', phone: '1234567890', status: 'APPROVED'
    });
    recruiterId = recruiter._id;

    const recruiterLogin = await request(app).post('/api/v1/auth/login').send({
        email: recruiter.email, password: 'password123', role: 'RECRUITER'
    });
    recruiterToken = recruiterLogin.body.token;

    // 3. Create a Secondary Recruiter (for authorization tests)
    const otherRecruiter = await Recruiter.create({
        company_name: 'Other Tech',
        contact_person: 'Jane Doe',
        email: 'other_recruiter@example.com',
        password: 'password123', phone: '1234567890', status: 'APPROVED'
    });
    otherRecruiterId = otherRecruiter._id;

    const otherRecruiterLogin = await request(app).post('/api/v1/auth/login').send({
        email: otherRecruiter.email, password: 'password123', role: 'RECRUITER'
    });
    otherRecruiterToken = otherRecruiterLogin.body.token;

    // 4. Create a Job & Application
    const job = await Job.create({
        package_lpa: 12.0, title: 'Backend Engineer',
        description: 'Test job for interviews',
        company_name: 'Interview Tech',
        min_cgpa: 7.0, eligible_branch: 'ALL', graduation_year: 2025,
        deadline: new Date(Date.now() + 86400000), recruiter_id: recruiterId, status: 'ACTIVE'
    });
    jobId = job._id;

    // VERY IMPORTANT: Interview API expects application to be SHORTLISTED
    const application = await Application.create({
        student_id: studentId,
        job_id: jobId,
        status: 'SHORTLISTED'
    });
    applicationId = application._id;
});

afterAll(async () => {
    await Student.deleteMany({});
    await Recruiter.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await Interview.deleteMany({});
    await Notification.deleteMany({});
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Interview Scheduling API', () => {

    let interviewId;

    it('should block non-job-owners from scheduling an interview', async () => {
        const res = await request(app)
            .post('/api/v1/interviews')
            .set('Authorization', `Bearer ${otherRecruiterToken}`)
            .send({
                application_id: applicationId,
                scheduled_at: new Date(Date.now() + 86400000), // Tomorrow
                location_type: 'VIRTUAL',
                location_details: 'https://zoom.us/test'
            });

        expect(res.statusCode).toBe(403);
    });

    it('should allow the job-owning recruiter to schedule an interview', async () => {
        const res = await request(app)
            .post('/api/v1/interviews')
            .set('Authorization', `Bearer ${recruiterToken}`)
            .send({
                application_id: applicationId,
                scheduled_at: new Date(Date.now() + 86400000),
                location_type: 'VIRTUAL',
                location_details: 'https://zoom.us/ok'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe('PROPOSED');

        interviewId = res.body.data._id;
    });

    it('should fetch upcoming interviews for the student', async () => {
        const res = await request(app)
            .get('/api/v1/interviews?upcoming=true')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.count).toBe(1);
    });

    it('should allow student to CONFIRM the interview', async () => {
        const res = await request(app)
            .put(`/api/v1/interviews/${interviewId}/respond`)
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ status: 'CONFIRMED' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe('CONFIRMED');
    });

    it('should allow recruiter to mark as COMPLETED', async () => {
        const res = await request(app)
            .put(`/api/v1/interviews/${interviewId}/status`)
            .set('Authorization', `Bearer ${recruiterToken}`)
            .send({ status: 'COMPLETED' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe('COMPLETED');
    });
});
