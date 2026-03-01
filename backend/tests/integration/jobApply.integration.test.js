/**
 * Integration Test: Job Apply Flow
 *
 * Covers the full HTTP request→response chain for:
 *   - Recruiter creates a job
 *   - Student applies to a job (happy path)
 *   - Duplicate application prevention
 *   - Eligibility engine guard (ineligible student rejected)
 *   - Unauthenticated apply attempt rejected
 *   - Applying to a non-existent job rejected
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { app } = require('../../server');
const Student = require('../src/models/Student');
const Recruiter = require('../src/models/Recruiter');
const Job = require('../src/models/Job');

let mongoServer;
let recruiterToken, studentToken, ineligibleStudentToken;
let jobId;

// ── Seed helpers ─────────────────────────────────────────────────────────────
const seedRecruiter = async () => {
    const reg = await request(app).post('/api/v1/auth/register/recruiter').send({
        company_name: 'JobTest Corp', contact_person: 'HR', phone: '9999900000',
        email: 'recruiter.jobs@test.com', password: 'Pass1234!'
    });
    // Directly approve via DB
    await Recruiter.findOneAndUpdate({ email: 'recruiter.jobs@test.com' }, { status: 'APPROVED' });

    const login = await request(app).post('/api/v1/auth/login')
        .send({ email: 'recruiter.jobs@test.com', password: 'Pass1234!', role: 'RECRUITER' });
    return login.body.accessToken;
};

const seedStudent = async (overrides = {}, email = 'student.jobs@test.com') => {
    await Student.create({
        name: 'Job Test Student', email, password: 'Pass1234!',
        branch: 'CSE', cgpa: 8.5, graduation_year: 2026,
        phone: '9000000001', marks_10th: 90, marks_12th: 90,
        gender: 'MALE', status: 'APPROVED', ...overrides
    });
    const login = await request(app).post('/api/v1/auth/login')
        .send({ email, password: 'Pass1234!', role: 'STUDENT' });
    return login.body.accessToken;
};

// ── Lifecycle ─────────────────────────────────────────────────────────────────
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Seed users
    recruiterToken = await seedRecruiter();
    studentToken = await seedStudent();
    ineligibleStudentToken = await seedStudent(
        { cgpa: 4.0, email: 'ineligible.student@test.com' },
        'ineligible.student@test.com'
    );
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// ── Test Suites ───────────────────────────────────────────────────────────────
describe('Jobs — Create Job (Recruiter)', () => {

    it('POST /api/v1/jobs — creates a job successfully', async () => {
        const res = await request(app)
            .post('/api/v1/jobs')
            .set('Authorization', `Bearer ${recruiterToken}`)
            .send({
                title: 'Software Engineer Intern',
                description: 'Build cool stuff.',
                location: 'Bangalore',
                package_lpa: 12,
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                min_cgpa: 7.0,
                allowed_branches: ['CSE', 'IT'],
                graduation_year: 2026
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('_id');
        jobId = res.body.data._id; // save for downstream tests
    });

    it('POST /api/v1/jobs — rejects non-recruiter (student)', async () => {
        const res = await request(app)
            .post('/api/v1/jobs')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ title: 'Hack', description: 'nope' });

        expect(res.statusCode).toBe(403);
    });

    it('POST /api/v1/jobs — rejects unauthenticated request', async () => {
        const res = await request(app).post('/api/v1/jobs').send({ title: 'Ghost' });
        expect(res.statusCode).toBe(401);
    });
});

describe('Jobs — Apply to Job (Student)', () => {

    it('POST /api/v1/applications/apply — eligible student applies successfully', async () => {
        expect(jobId).toBeDefined(); // ensure job was created

        const res = await request(app)
            .post('/api/v1/applications/apply')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ job_id: jobId });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('_id');
    });

    it('POST /api/v1/applications/apply — prevents duplicate application', async () => {
        const res = await request(app)
            .post('/api/v1/applications/apply')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ job_id: jobId });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/already applied/i);
    });

    it('POST /api/v1/applications/apply — ineligible student (low CGPA) is rejected', async () => {
        const res = await request(app)
            .post('/api/v1/applications/apply')
            .set('Authorization', `Bearer ${ineligibleStudentToken}`)
            .send({ job_id: jobId });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/not eligible/i);
    });

    it('POST /api/v1/applications/apply — rejects unauthenticated apply attempt', async () => {
        const res = await request(app)
            .post('/api/v1/applications/apply')
            .send({ job_id: jobId });

        expect(res.statusCode).toBe(401);
    });

    it('POST /api/v1/applications/apply — rejects apply to non-existent job', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await request(app)
            .post('/api/v1/applications/apply')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ job_id: fakeId });

        expect(res.statusCode).toBe(400);
    });

    it('GET /api/v1/applications/my-applications — student can view own applications', async () => {
        const res = await request(app)
            .get('/api/v1/applications/my-applications')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
});
