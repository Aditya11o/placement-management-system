const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const Recruiter = require('../src/models/Recruiter');
const Student = require('../src/models/Student');
const Job = require('../src/models/Job');
const Application = require('../src/models/Application');

const TEST_MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/pms_test_db';

// Extract the Mocked web hook queue from the instantiated file
const { webhookQueue } = require('../src/utils/webhookQueue');

let recruiterToken, recruiterId;
let studentToken, studentId;
let jobId;
let applicationId;

beforeAll(async () => {
    await mongoose.connect(TEST_MONGO_URI);

    // Setup Mock Spy on the Queue Add method
    jest.spyOn(webhookQueue, 'add');

    // 1. Create Recruiter WITH a webhook url configured
    const recruiter = await Recruiter.create({
        company_name: 'Webhook Corp',
        contact_person: 'Jane',
        email: 'jane@webhook.com',
        password: 'password123',
        phone: '1234567890',
        status: 'APPROVED',
        webhook_url: 'https://webhook.site/mock-url'
    });
    recruiterId = recruiter._id;

    const recruiterLogin = await request(app).post('/api/v1/auth/login').send({
        email: recruiter.email, password: 'password123', role: 'RECRUITER'
    });
    recruiterToken = recruiterLogin.body.token;

    // 2. Create Student
    const student = await Student.create({
        name: 'Web Student', email: 'stu@webo.com', password: 'password123', branch: 'CSE', cgpa: 9,
        graduation_year: 2025, phone: '1234567890', marks_10th: 90, marks_12th: 90, gender: 'MALE', status: 'APPROVED'
    });
    studentId = student._id;
    const studentLogin = await request(app).post('/api/v1/auth/login').send({
        email: student.email, password: 'password123', role: 'STUDENT'
    });
    studentToken = studentLogin.body.token;

    // 3. Create Job & Application
    const job = await Job.create({
        title: 'SDE', company_name: 'Webhook Corp', description: 'test', min_cgpa: 7, eligible_branch: 'ALL',
        graduation_year: 2025, deadline: new Date('2030-01-01'), recruiter_id: recruiterId, status: 'ACTIVE'
    });
    jobId = job._id;

    const application = await Application.create({
        job_id: jobId, student_id: studentId, status: 'SUBMITTED'
    });
    applicationId = application._id;
});

afterAll(async () => {
    await Recruiter.deleteMany({});
    await Student.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    webhookQueue.add.mockRestore(); // Restore mock
    await mongoose.connection.close();
});

describe('Webhook Support Features', () => {

    it('should allow recruiters to update their webhook_url natively', async () => {
        const res = await request(app)
            .put('/api/v1/auth/webhook')
            .set('Authorization', `Bearer ${recruiterToken}`)
            .send({ webhook_url: 'https://webhook.site/new-url' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.webhook_url).toBe('https://webhook.site/new-url');
    });

    it('should push a payload to the webhookQueue when a recruiter updates an application status', async () => {
        // Clear mock from previous actions if any
        webhookQueue.add.mockClear();

        const res = await request(app)
            .put(`/api/v1/applications/${applicationId}/status`)
            .set('Authorization', `Bearer ${recruiterToken}`)
            .send({ status: 'SHORTLISTED' });

        expect(res.statusCode).toBe(200);

        // Assert the queue received it exactly once
        expect(webhookQueue.add).toHaveBeenCalledTimes(1);

        // Assert the payload shape injected into BullMQ
        const [queueName, dispatchJob] = webhookQueue.add.mock.calls[0];

        expect(queueName).toBe('dispatch-webhook');
        expect(dispatchJob.url).toBe('https://webhook.site/new-url'); // Updated correctly in previous test
        expect(dispatchJob.payload.event).toBe('application_status_updated');
        expect(dispatchJob.payload.data.new_status).toBe('SHORTLISTED');
        expect(dispatchJob.payload.data.student_email).toBe('stu@webo.com');
    });
});
