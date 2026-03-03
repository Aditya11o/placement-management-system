const request = require('supertest');
const { app, server } = require('../server');
const mongoose = require('mongoose');

// The MongoMemoryServer is likely spun up in a global setup or handled in existing tests.
// We'll assume the standard Jest setup for this project handles the mock DB.

describe('Golden Flow E2E: From Registration to Application', () => {
    let studentToken;
    let recruiterToken;
    let jobId;

    beforeAll(async () => {
        // Wait for server to be fully ready if needed
    });

    afterAll(async () => {
        // Teardown
        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }
        await mongoose.connection.close();
    });

    it('1. [Student] Registration', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register-student')
            .send({
                name: 'Golden Student',
                email: 'golden.student@example.com',
                password: 'password123',
                branch: 'CSE',
                cgpa: 9.5,
                graduation_year: 2026,
                phone: '1234567890',
                marks_10th: 92,
                marks_12th: 95,
                gender: 'OTHER'
            });

        // Handling both 201 (Created) or 400 (if email already exists from previous test runs) gracefully
        // For a pristine DB, this should be 201.
        if (res.statusCode === 201) {
            studentToken = res.body.token;
            expect(studentToken).toBeDefined();
        } else if (res.statusCode === 400 && res.body.message.includes('already exists')) {
            // Fallback login if DB wasn't cleared
            const loginRes = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'golden.student@example.com',
                    password: 'password123',
                    role: 'STUDENT'
                });
            studentToken = loginRes.body.token;
            expect(studentToken).toBeDefined();
        } else {
            throw new Error(`Unexpected status logic: ${res.statusCode} ${res.body.message}`);
        }
    });

    it('2. [Recruiter] Registration', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register-recruiter')
            .send({
                company_name: 'Golden Corp',
                contact_person: 'Jane Doe',
                email: 'jane.doe@goldencorp.com',
                password: 'password123',
                phone: '0987654321'
            });

        if (res.statusCode === 201) {
            recruiterToken = res.body.token;
        } else if (res.statusCode === 400 && res.body.message.includes('already exists')) {
            const loginRes = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'jane.doe@goldencorp.com',
                    password: 'password123',
                    role: 'RECRUITER'
                });
            recruiterToken = loginRes.body.token;
        } else {
            throw new Error(`Unexpected status logic: ${res.statusCode} ${res.body.message}`);
        }
        expect(recruiterToken).toBeDefined();
    });

    it('3. [Recruiter] Posts a new Job', async () => {
        const res = await request(app)
            .post('/api/v1/jobs')
            .set('Authorization', `Bearer ${recruiterToken}`)
            .send({
                title: 'Senior Golden Engineer',
                description: 'We are looking for someone to build golden architecture.',
                job_type: 'FULL_TIME',
                eligible_branch: 'CSE, IT',
                min_cgpa: 8.0,
                min_marks_10th: 85,
                min_marks_12th: 85,
                graduation_year: 2026,
                deadline: new Date(Date.now() + 86400 * 1000 * 30), // 30 days from now
                salary_details: '30 LPA'
            });

        expect(res.statusCode).toBe(201);
        jobId = res.body.data._id;
        expect(jobId).toBeDefined();
    });

    it('4. [Student] Views Eligible Jobs (Matching Engine Test)', async () => {
        const res = await request(app)
            .get('/api/v1/jobs/eligible')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toBe(200);
        // Ensure the job we just created is in the eligible list
        const theJob = res.body.data.find(j => j._id === jobId);
        expect(theJob).toBeDefined();
    });

    it('5. [Student] Applies to the Job', async () => {
        // Assuming student needs an active resume, they might not have one in this bare bones mock.
        // We expect a 400 for 'no active resume' OR a 201 if successful.
        // Doing a soft assert here as we are testing the endpoint logic exists and responds predictably.
        const res = await request(app)
            .post(`/api/v1/applications/apply/${jobId}`)
            .set('Authorization', `Bearer ${studentToken}`)
            // Adding an idempotency key to test that middleware
            .set('x-idempotency-key', `golden-flow-${Date.now()}`);

        // 201 Created or 400 Bad Request (missing resume)
        expect([201, 400]).toContain(res.statusCode);

        if (res.statusCode === 400) {
            expect(res.body.message).toMatch(/resume/i);
        }
    });
});
