const mongoose = require('mongoose');
const Job = require('../src/models/Job');
const Session = require('../src/models/Session');
const initJobDeadlineCron = require('../src/jobs/jobDeadlineCron');
const initSessionCleanupCron = require('../src/jobs/sessionCleanupCron');

// Mock node-cron to intercept the scheduled functions instead of waiting for time
jest.mock('node-cron', () => {
    return {
        schedule: jest.fn((pattern, callback) => {
            // we will extract this callback in our tests to fire it manually
            return { start: jest.fn(), stop: jest.fn() };
        }),
    };
});

const cron = require('node-cron');

const { MongoMemoryServer } = require('mongodb-memory-server');

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

describe('Scheduled Cron Workers Logic', () => {

    beforeEach(async () => {
        await Job.deleteMany({});
        await Session.deleteMany({});
        jest.clearAllMocks();
    });

    it('jobDeadlineCron should correctly set expired ACTIVE jobs to INACTIVE', async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        // 1. Create a dummy recruiter ID needed for schema
        const dummyId = new mongoose.Types.ObjectId();

        // 2. Create an EXPIRED active job
        const expiredJob = await Job.create({
            package_lpa: 12.0, title: 'Close Me', company_name: 'Tech', description: 'test',
            min_cgpa: 7, eligible_branch: 'ALL', graduation_year: 2025,
            deadline: yesterday, status: 'ACTIVE', recruiter_id: dummyId
        });

        // 3. Create a FUTURE active job (should NOT close)
        const futureJob = await Job.create({
            package_lpa: 12.0, title: 'Keep Me', company_name: 'Tech', description: 'test',
            min_cgpa: 7, eligible_branch: 'ALL', graduation_year: 2025,
            deadline: tomorrow, status: 'ACTIVE', recruiter_id: dummyId
        });

        // 4. Initialize and extract the cron callback
        initJobDeadlineCron();
        const scheduledCallback = cron.schedule.mock.calls[0][1];

        // 5. Fire the callback (simulating midnight)
        await scheduledCallback();

        // 6. Assertions
        const updatedExpiredJob = await Job.findById(expiredJob._id);
        const updatedFutureJob = await Job.findById(futureJob._id);

        expect(updatedExpiredJob.status).toBe('CLOSED');
        expect(updatedFutureJob.status).toBe('ACTIVE');
    });

    it('sessionCleanupCron should delete expired sessions', async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const dummyId = new mongoose.Types.ObjectId();

        // 1. Create expired session
        const expiredSession = await Session.create({
            user_id: dummyId,
            user_model: 'Student',
            refresh_token: 'old_token',
            expires_at: yesterday
        });

        // 2. Create valid session
        const validSession = await Session.create({
            user_id: dummyId,
            user_model: 'Student',
            refresh_token: 'new_token',
            expires_at: tomorrow
        });

        // 3. Initialize and extract the cron callback
        initSessionCleanupCron();
        const scheduledCallback = cron.schedule.mock.calls[0][1];

        // 4. Fire the callback (simulating 2 AM)
        await scheduledCallback();

        // 5. Assertions
        const remainingExpired = await Session.findById(expiredSession._id);
        const remainingValid = await Session.findById(validSession._id);

        expect(remainingExpired).toBeNull();
        expect(remainingValid).not.toBeNull();
    });
});
