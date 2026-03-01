const request = require('supertest');
const mongoose = require('mongoose');

const { app } = require('../server');
const Admin = require('../src/models/Admin');
const { bulkQueue } = require('../src/utils/bulkQueue'); // Gets the mocked version 

const TEST_MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/pms_test_db';

let adminToken, adminId;

beforeAll(async () => {
    await mongoose.connect(TEST_MONGO_URI);
    await Admin.deleteMany({});

    const admin = await Admin.create({
        name: 'Bulk Admin',
        email: 'bulk@example.com',
        password: 'password123',
    });
    adminId = admin._id;

    const adminLogin = await request(app).post('/api/v1/auth/login').send({
        email: admin.email, password: 'password123', role: 'ADMIN'
    });
    adminToken = adminLogin.body.token;

    // Spy on Queue Adds
    jest.spyOn(bulkQueue, 'add');
});

afterAll(async () => {
    await Admin.deleteMany({});
    bulkQueue.add.mockRestore();
    await mongoose.connection.close();
});

describe('Bulk Operations CSV API', () => {

    it('should reject requests without a file', async () => {
        const res = await request(app)
            .post('/api/v1/admin/bulk')
            .set('Authorization', `Bearer ${adminToken}`)
            .field('type', 'students');

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/valid CSV/);
    });

    it('should reject invalid bulk types', async () => {
        // Create an arbitrary small CSV buffer in memory
        const csvBuffer = Buffer.from('email,status\ntest@test.com,APPROVED\n');

        const res = await request(app)
            .post('/api/v1/admin/bulk')
            .set('Authorization', `Bearer ${adminToken}`)
            .field('type', 'invalid_hack_type')
            .attach('file', csvBuffer, { filename: 'test.csv', contentType: 'text/csv' });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/Invalid bulk type/);
    });

    it('should accept a valid CSV, parse it, and enqueue it to BullMQ', async () => {
        bulkQueue.add.mockClear();

        // 3 rows of data
        const csvContent =
            `email,status
stu1@test.com,APPROVED
stu2@test.com,REJECTED
stu3@test.com,APPROVED`;
        const csvBuffer = Buffer.from(csvContent);

        const res = await request(app)
            .post('/api/v1/admin/bulk')
            .set('Authorization', `Bearer ${adminToken}`)
            .field('type', 'students') // Form field
            .attach('file', csvBuffer, { filename: 'students_update.csv', contentType: 'text/csv' });

        // Multer finishes -> streamifier pushes to fast-csv -> end event fires 202
        expect(res.statusCode).toBe(202);
        expect(res.body.success).toBe(true);
        expect(res.body.data.total_rows).toBe(3); // Prove fast-csv accurately streamed it
        expect(res.body.data.job_id).toBeDefined();

        // Prove it actually dispatched to BullMQ
        expect(bulkQueue.add).toHaveBeenCalledTimes(1);

        // Assert the parsed JSON mapping structure inside BullMQ matches the CSV headers exactly
        const [queueName, dispatchJob] = bulkQueue.add.mock.calls[0];
        expect(queueName).toBe('bulk-students');
        expect(dispatchJob.type).toBe('students');
        expect(dispatchJob.records.length).toBe(3);
        expect(dispatchJob.records[0].email).toBe('stu1@test.com');
        expect(dispatchJob.records[0].status).toBe('APPROVED');
    });

    it('should retrieve a mocked job status', async () => {
        const res = await request(app)
            .get('/api/v1/admin/bulk/mocked-job-123')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        // Specifically testing that the mock endpoint logic routes correctly
        expect(res.body.data.status).toBe('completed');
    });

});
