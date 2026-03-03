const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const Student = require('../src/models/Student');
const Recruiter = require('../src/models/Recruiter');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock external utilities to avoid actual API calls during tests
jest.mock('../src/utils/cloudinary', () => ({
    uploadToCloudinary: jest.fn().mockResolvedValue({
        secure_url: 'https://cloudinary.com/test-url.pdf',
        public_id: 'test_public_id'
    })
}));

jest.mock('../src/utils/resumeAnalyzer', () => ({
    extractSkillsFromResume: jest.fn().mockResolvedValue(['JavaScript', 'Node.js', 'React'])
}));

let mongoServer;
let studentToken, studentId;
let recruiterToken, recruiterId;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // 1. Create a Student
    const student = await Student.create({
        name: 'Upload Test Student',
        email: 'upload_stu@test.com',
        password: 'password123',
        branch: 'CSE', cgpa: 8.5, graduation_year: 2025, phone: '1234567890',
        marks_10th: 90, marks_12th: 92, gender: 'MALE', status: 'APPROVED'
    });
    studentId = student._id;

    const studentLogin = await request(app).post('/api/v1/auth/login').send({
        email: 'upload_stu@test.com', password: 'password123', role: 'STUDENT'
    });
    studentToken = studentLogin.body.token;

    // 2. Create a Recruiter
    const recruiter = await Recruiter.create({
        company_name: 'Upload Tech',
        contact_person: 'Jane Doe',
        email: 'upload_rec@test.com',
        password: 'password123', phone: '1234567890', status: 'APPROVED'
    });
    recruiterId = recruiter._id;

    const recruiterLogin = await request(app).post('/api/v1/auth/login').send({
        email: 'upload_rec@test.com', password: 'password123', role: 'RECRUITER'
    });
    recruiterToken = recruiterLogin.body.token;
});

afterAll(async () => {
    await Student.deleteMany({});
    await Recruiter.deleteMany({});
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('File Upload API (Resume & Logo)', () => {

    describe('Student Resume Versioning', () => {

        let versionId1, versionId2;

        it('should upload first resume and extract skills', async () => {
            const buffer = Buffer.from('fake-pdf-content');
            const res = await request(app)
                .post('/api/v1/upload/resume')
                .set('Authorization', `Bearer ${studentToken}`)
                .attach('resume', buffer, 'resume_v1.pdf');

            expect(res.statusCode).toBe(201);
            expect(res.body.data.version).toBe(1);
            expect(res.body.data.skills).toContain('JavaScript');

            const updatedStudent = await Student.findById(studentId);
            expect(updatedStudent.resume_versions.length).toBe(1);
            versionId1 = updatedStudent.resume_versions[0]._id;
        });

        it('should upload second resume and set as active', async () => {
            const buffer = Buffer.from('fake-pdf-content-v2');
            const res = await request(app)
                .post('/api/v1/upload/resume')
                .set('Authorization', `Bearer ${studentToken}`)
                .field('label', 'Final Version')
                .attach('resume', buffer, 'resume_v2.pdf');

            expect(res.statusCode).toBe(201);
            expect(res.body.data.version).toBe(2);
            expect(res.body.data.label).toBe('Final Version');

            const updatedStudent = await Student.findById(studentId);
            expect(updatedStudent.resume_versions.length).toBe(2);

            // Check rotation/activation
            const v1 = updatedStudent.resume_versions.id(versionId1);
            const v2 = updatedStudent.resume_versions.find(v => v.version === 2);
            expect(v1.is_active).toBe(false);
            expect(v2.is_active).toBe(true);

            versionId2 = v2._id;
        });

        it('should fetch resume history', async () => {
            const res = await request(app)
                .get('/api/v1/upload/resume/history')
                .set('Authorization', `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.count).toBe(2);
            expect(res.body.data[0].version).toBe(2); // Newest first
        });

        it('should switch active resume version back to v1', async () => {
            const res = await request(app)
                .put(`/api/v1/upload/resume/history/${versionId1}/activate`)
                .set('Authorization', `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.is_active).toBe(true);
            expect(res.body.data.version).toBe(1);

            const updatedStudent = await Student.findById(studentId);
            expect(updatedStudent.resume_versions.id(versionId2).is_active).toBe(false);
        });

        it('should delete a non-active resume version', async () => {
            // v2 is currently inactive
            const res = await request(app)
                .delete(`/api/v1/upload/resume/history/${versionId2}`)
                .set('Authorization', `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.remainingVersions).toBe(1);

            const updatedStudent = await Student.findById(studentId);
            expect(updatedStudent.resume_versions.length).toBe(1);
        });

        it('should prevent deleting the active resume version', async () => {
            // v1 is active
            const res = await request(app)
                .delete(`/api/v1/upload/resume/history/${versionId1}`)
                .set('Authorization', `Bearer ${studentToken}`);

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toMatch(/Cannot delete the currently active/i);
        });
    });

    describe('Recruiter Logo Upload', () => {
        it('should upload company logo', async () => {
            const buffer = Buffer.from('fake-image-data');
            const res = await request(app)
                .post('/api/v1/upload/logo')
                .set('Authorization', `Bearer ${recruiterToken}`)
                .attach('logo', buffer, 'company_logo.png');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toBe('https://cloudinary.com/test-url.pdf'); // matches mock

            const updatedRec = await Recruiter.findById(recruiterId);
            expect(updatedRec.logo_url).toBeDefined();
        });
    });

});
