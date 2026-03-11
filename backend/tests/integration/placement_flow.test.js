const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../server');
const Student = require('../../src/models/Student');
const Recruiter = require('../../src/models/Recruiter');
const Job = require('../../src/models/Job');
const Application = require('../../src/models/Application');

// Mock external services
jest.mock('../../src/utils/cloudinary', () => ({
    uploadToCloudinary: jest.fn().mockResolvedValue({ secure_url: 'http://mock-pdf-url.com/offer.pdf' })
}));

jest.mock('../../src/utils/emailQueue', () => ({
    emailQueue: {
        add: jest.fn().mockResolvedValue({})
    }
}));

jest.mock('../../src/services/notifyDispatcher', () => ({
    dispatchToUser: jest.fn().mockResolvedValue({}),
    dispatchToRole: jest.fn().mockResolvedValue({})
}));

// Mock Socket.io manager to avoid connection errors
jest.mock('../../src/utils/socketManager', () => ({
    initializeSocket: jest.fn(),
    getIO: jest.fn().mockReturnValue({
        to: jest.fn().mockReturnThis(),
        emit: jest.fn()
    })
}));

const TEST_MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/pms_integration_test';

describe('Placement Management System - Core Flow Integration', () => {
    let studentToken, recruiterToken, studentId, recruiterId, jobId, applicationId;

    beforeAll(async () => {
        // Connect to test database
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(TEST_MONGO_URI);
        }

        // Cleanup
        await Promise.all([
            Student.deleteMany({}),
            Recruiter.deleteMany({}),
            Job.deleteMany({}),
            Application.deleteMany({})
        ]);

        // 1. Setup Recruiter
        const recruiterRes = await request(app)
            .post('/api/v1/auth/register/recruiter')
            .send({
                company_name: 'Tech Corp',
                contact_person: 'HR Manager',
                email: 'hr@techcorp.com',
                password: 'password123',
                phone: '1234567890'
            });

        // Approve Recruiter via DB (no admin route for this in MVP or usually automated for tests)
        await Recruiter.findOneAndUpdate({ email: 'hr@techcorp.com' }, { status: 'APPROVED' });

        const recruitLogRes = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'hr@techcorp.com', password: 'password123', role: 'RECRUITER' });

        recruiterToken = recruitLogRes.body.token;
        recruiterId = recruitLogRes.body.user.id;

        // 2. Setup Student
        await request(app)
            .post('/api/v1/auth/register/student')
            .send({
                name: 'Job Seeker',
                email: 'seeker@example.com',
                password: 'password123',
                branch: 'CSE',
                cgpa: 9.0,
                graduation_year: 2025,
                phone: '0987654321',
                marks_10th: 95,
                marks_12th: 95,
                gender: 'MALE'
            });

        // Approve Student
        await Student.findOneAndUpdate({ email: 'seeker@example.com' }, { status: 'APPROVED' });

        const studLogRes = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'seeker@example.com', password: 'password123', role: 'STUDENT' });

        studentToken = studLogRes.body.token;
        studentId = studLogRes.body.user.id;
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('Step 1: Recruiter should create a Job', async () => {
        const res = await request(app)
            .post('/api/v1/jobs')
            .set('Authorization', `Bearer ${recruiterToken}`)
            .send({
                package_lpa: 12.0, title: 'Software Engineer Intern',
                description: 'Full stack development role',
                min_cgpa: 8.0,
                eligible_branch: 'CSE',
                graduation_year: 2025,
                deadline: new Date(Date.now() + 86400000).toISOString()
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        jobId = res.body.data._id;
    });

    it('Step 2: Student should apply to the Job', async () => {
        const res = await request(app)
            .post('/api/v1/applications')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ job_id: jobId });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        applicationId = res.body.data._id;
    });

    it('Step 3: Recruiter should select the Student and generate Offer Letter', async () => {
        const res = await request(app)
            .put(`/api/v1/applications/${applicationId}/status`)
            .set('Authorization', `Bearer ${recruiterToken}`)
            .send({ status: 'SELECTED' });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.status).toBe('SELECTED');

        // Re-fetch application to check for offer_letter_url (it's updated async in controller)
        // We wait a bit or use a more robust way to check async effects
        await new Promise(r => setTimeout(r, 1000));
        const updatedApp = await Application.findById(applicationId);
        expect(updatedApp.offer_letter_url).toBe('http://mock-pdf-url.com/offer.pdf');
    });

    it('Step 4: Student should view their applications with offer letter', async () => {
        const res = await request(app)
            .get('/api/v1/applications/my')
            .set('Authorization', `Bearer ${studentToken}`);

        const fs = require('fs');
        fs.writeFileSync('step_4_debug.json', JSON.stringify(res.body, null, 2));

        expect(res.statusCode).toBe(200);
        expect(res.body.data[0].offer_letter_url).toContain('mock-pdf-url.com');
    });
});
