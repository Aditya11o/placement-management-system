const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const Student = require('../src/models/Student');
const Recruiter = require('../src/models/Recruiter');
const Job = require('../src/models/Job');
const Application = require('../src/models/Application');
const Notification = require('../src/models/Notification');

const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let studentToken;
let studentId;
let recruiterToken;
let recruiterId;
let jobId;
let applicationId;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // 1. Create a Student
    const student = await Student.create({
        name: 'Notification Test Student',
        email: 'notify_student@example.com',
        password: 'password123',
        branch: 'CSE',
        cgpa: 8.5,
        graduation_year: 2025,
        phone: '1234567890',
        marks_10th: 90,
        marks_12th: 92,
        gender: 'MALE',
        status: 'APPROVED'
    });
    studentId = student._id;

    const studentLogin = await request(app).post('/api/v1/auth/login').send({
        email: 'notify_student@example.com',
        password: 'password123',
        role: 'STUDENT'
    });
    studentToken = studentLogin.body.token;

    // 2. Create a Recruiter
    const recruiter = await Recruiter.create({
        company_name: 'Notify Tech',
        contact_person: 'Jane Doe',
        email: 'notify_recruiter@example.com',
        password: 'password123',
        phone: '1234567890',
        status: 'APPROVED'
    });
    recruiterId = recruiter._id;

    const recruiterLogin = await request(app).post('/api/v1/auth/login').send({
        email: 'notify_recruiter@example.com',
        password: 'password123',
        role: 'RECRUITER'
    });
    recruiterToken = recruiterLogin.body.token;

    // 3. Create a Job
    const job = await Job.create({
        title: 'Backend Engineer',
        description: 'Test job',
        company_name: 'Notify Tech',
        min_cgpa: 7.0,
        eligible_branch: 'ALL',
        graduation_year: 2025,
        deadline: new Date(Date.now() + 86400000), // tomorrow
        recruiter_id: recruiterId,
        status: 'ACTIVE'
    });
    jobId = job._id;

    // 4. Create an Application directly matching the job and student
    const application = await Application.create({
        student_id: studentId,
        job_id: jobId,
        status: 'SUBMITTED'
    });
    applicationId = application._id;
});

afterAll(async () => {
    await Student.deleteMany({});
    await Recruiter.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await Notification.deleteMany({});
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Notification API & Flow', () => {

    let createdNotificationId;

    it('should trigger a notification when application status is updated', async () => {
        // Recruiter changes status to SHORTLISTED
        const res = await request(app)
            .put(`/api/v1/applications/${applicationId}/status`)
            .set('Authorization', `Bearer ${recruiterToken}`)
            .send({ status: 'SHORTLISTED' });

        expect(res.statusCode).toBe(200);

        // Verify notification in DB
        const notifications = await Notification.find({ recipientId: studentId });
        expect(notifications.length).toBe(1);
        expect(notifications[0].title).toMatch(/Application Update/);
        expect(notifications[0].message).toMatch(/SHORTLISTED/);
        expect(notifications[0].isRead).toBe(false);

        createdNotificationId = notifications[0]._id;
    });

    it('should fetch paginated notifications for the student', async () => {
        // Force create a second notification to test pagination metrics
        await Notification.create({
            recipientId: studentId,
            recipientModel: 'Student',
            title: 'System Alert',
            message: 'Welcome to PMS',
            type: 'INFO',
            isRead: false
        });

        const res = await request(app)
            .get('/api/v1/notifications?limit=1')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.count).toBe(1); // Due to limit=1
        expect(res.body.pagination.total).toBe(2);
        expect(res.body.totalUnread).toBe(2);
    });

    it('should mark a specific notification as read', async () => {
        const res = await request(app)
            .put(`/api/v1/notifications/${createdNotificationId}/read`)
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.isRead).toBe(true);

        // Verify unread count goes down
        const getRes = await request(app)
            .get('/api/v1/notifications')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(getRes.body.totalUnread).toBe(1); // Was 2, now 1
    });

    it('should not allow another user to mark notification as read', async () => {
        // Recruiter tries to mark student's notification read
        const res = await request(app)
            .put(`/api/v1/notifications/${createdNotificationId}/read`)
            .set('Authorization', `Bearer ${recruiterToken}`);

        expect(res.statusCode).toBe(403);
    });

    it('should mark all user notifications as read', async () => {
        const res = await request(app)
            .put('/api/v1/notifications/read-all')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);

        // Verify all are read now
        const getRes = await request(app)
            .get('/api/v1/notifications')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(getRes.body.totalUnread).toBe(0);
    });

});
