const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const Admin = require('../src/models/Admin');
const Student = require('../src/models/Student');
const Announcement = require('../src/models/Announcement');
const Log = require('../src/models/Log');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock utilities
jest.mock('../src/middlewares/cacheMiddleware', () => ({
    cache: () => (req, res, next) => next(), // bypass cache in tests
    clearCache: jest.fn().mockResolvedValue()
}));

jest.mock('../src/services/notifyDispatcher', () => ({
    dispatchToAll: jest.fn()
}));

let mongoServer;
let adminToken, adminId;
let studentToken;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // 1. Create Admin
    const admin = await Admin.create({
        name: 'Announce Admin',
        email: 'ann_admin@test.com',
        password: 'password123',
        sub_role: 'ADMIN',
        permissions: ['manage_announcements']
    });
    adminId = admin._id;
    const adminLogin = await request(app).post('/api/v1/auth/login').send({
        email: 'ann_admin@test.com', password: 'password123', role: 'ADMIN'
    });
    adminToken = adminLogin.body.token;

    // 2. Create Student
    const student = await Student.create({
        name: 'Announce Student', email: 'ann_student@test.com', password: 'password123', branch: 'CSE', cgpa: 9,
        graduation_year: 2025, phone: '1234567890', marks_10th: 90, marks_12th: 90, gender: 'MALE', status: 'APPROVED'
    });
    const studentLogin = await request(app).post('/api/v1/auth/login').send({
        email: 'ann_student@test.com', password: 'password123', role: 'STUDENT'
    });
    studentToken = studentLogin.body.token;
});

afterAll(async () => {
    await Admin.deleteMany({});
    await Student.deleteMany({});
    await Announcement.deleteMany({});
    await Log.deleteMany({});
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Announcement System API', () => {

    it('should create an announcement and broadcast it', async () => {
        const { clearCache } = require('../src/middlewares/cacheMiddleware');
        const { dispatchToAll } = require('../src/services/notifyDispatcher');

        const res = await request(app)
            .post('/api/v1/announcements')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                package_lpa: 12.0, title: 'Placement Drive Starting',
                message: 'Register by Friday'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.title).toBe('Placement Drive Starting');

        // Verify Side Effects
        expect(clearCache).toHaveBeenCalledWith('/api/v1/announcements');
        expect(dispatchToAll).toHaveBeenCalledWith('new_announcement', expect.any(Object));

        // Verify Audit Log
        const audit = await Log.findOne({ action: 'CREATE_ANNOUNCEMENT' });
        expect(audit).toBeDefined();
    });

    it('should allow any authenticated user to view announcements', async () => {
        const res = await request(app)
            .get('/api/v1/announcements')
            .set('Authorization', `Bearer ${studentToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.count).toBe(1);
        expect(res.body.data[0].title).toBe('Placement Drive Starting');
    });

    it('should prevent non-admins from creating announcements', async () => {
        const res = await request(app)
            .post('/api/v1/announcements')
            .set('Authorization', `Bearer ${studentToken}`)
            .send({ package_lpa: 12.0, title: 'Hack', message: 'Fail' });

        expect(res.statusCode).toBe(403);
    });

});
