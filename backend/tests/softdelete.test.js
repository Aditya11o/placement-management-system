const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Student = require('../src/models/Student');

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

afterEach(async () => {
    // We cannot use deleteMany() because the plugin intercepts it.
    // We must physically drop the BSON collection to clean the DB for the next test.
    try {
        await mongoose.connection.db.dropCollection('students');
    } catch (err) { }
});

describe('Mongoose Soft Delete Plugin', () => {

    it('should inject a deletedAt field', async () => {
        const student = await Student.create({
            name: 'John Doe',
            email: 'john@test.com',
            password: 'password123',
            branch: 'CSE',
            cgpa: 9.0,
            graduation_year: 2024,
            phone: '1234567890',
            marks_10th: 90,
            marks_12th: 90,
            gender: 'MALE'
        });

        const doc = await Student.findById(student._id).lean();
        expect(doc).toHaveProperty('deletedAt');
        expect(doc.deletedAt).toBeNull();
    });

    it('should set deletedAt when calling softDelete() instead of wiping the BSON physically', async () => {
        const student = await Student.create({
            name: 'Jane Doe',
            email: 'jane@test.com',
            password: 'password123',
            branch: 'ECE',
            cgpa: 8.5,
            graduation_year: 2025,
            phone: '0987654321',
            marks_10th: 95,
            marks_12th: 95,
            gender: 'FEMALE'
        });

        // Trigger the explicit soft-delete method
        await student.softDelete();

        // Normal query should not find her
        const normalFind = await Student.findOne({ email: 'jane@test.com' });
        expect(normalFind).toBeNull();

        // But bypassing the interceptor SHOULD find her in the BSON tree
        const bypassFind = await Student.findWithDeleted({ email: 'jane@test.com' });
        expect(bypassFind.length).toBe(1);
        expect(bypassFind[0].deletedAt).not.toBeNull();
    });

    it('findWithDeleted() and restore() utilities should work correctly', async () => {
        const student = await Student.create({
            name: 'Alice Smith',
            email: 'alice@test.com',
            password: 'password123',
            branch: 'IT',
            cgpa: 9.3,
            graduation_year: 2026,
            phone: '1112223333',
            marks_10th: 88,
            marks_12th: 89,
            gender: 'FEMALE'
        });

        // Nuke it softly
        await Student.softDelete({ email: 'alice@test.com' });

        const res1 = await Student.find({ email: 'alice@test.com' });
        expect(res1.length).toBe(0);

        // Resurrect it
        await Student.restore({ email: 'alice@test.com' });

        const res2 = await Student.find({ email: 'alice@test.com' });
        expect(res2.length).toBe(1);
        expect(res2[0].deletedAt).toBeNull();
    });

});
