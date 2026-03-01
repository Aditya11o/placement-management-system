const { Queue, Worker } = require('bullmq');
const logger = require('./logger');

// Mongoose Models for Updates
const Student = require('../models/Student');
const Application = require('../models/Application');

const IORedis = require('ioredis');

// Setup Redis connection options
const redisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
        return Math.min(times * 100, 3000);
    },
    reconnectOnError(err) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
            return true;
        }
        return false;
    }
};

const connection = process.env.REDIS_URL
    ? new IORedis(process.env.REDIS_URL, redisOptions)
    : new IORedis({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
        ...redisOptions
    });

let bulkQueue;
let bulkWorker;

if (process.env.NODE_ENV !== 'test') {
    // 1. Create the high-throughput queue
    bulkQueue = new Queue('bulk-ops-queue', {
        connection,
        defaultJobOptions: {
            attempts: 1, // Don't retry bulk data failures automatically, better to report them out
            removeOnComplete: false, // Keep completed logs so Admin can see progress and success counts
            removeOnFail: false
        }
    });

    // 2. Worker runtime processing logic
    bulkWorker = new Worker('bulk-ops-queue', async (job) => {
        const { type, records } = job.data;
        logger.info(`Started bulk job ${job.id} of type [${type}] with ${records.length} records.`);

        // Track stats for the final report
        let successCount = 0;
        let failCount = 0;
        let errors = [];

        // Progress update at start
        await job.updateProgress({ percent: 0, processed: 0, total: records.length });

        for (let i = 0; i < records.length; i++) {
            const row = records[i];
            try {
                if (type === 'students') {
                    // Update Student Approval Status
                    if (!row.email || !row.status) throw new Error('Missing email or status column');
                    const updated = await Student.findOneAndUpdate(
                        { email: row.email },
                        { status: row.status },
                        { new: true, runValidators: true }
                    );
                    if (!updated) throw new Error(`Student ${row.email} not found`);

                } else if (type === 'applications') {
                    // Update Application Statuses Mass
                    if (!row.application_id || !row.status) throw new Error('Missing application_id or status column');
                    const updated = await Application.findByIdAndUpdate(
                        row.application_id,
                        { status: row.status },
                        { new: true, runValidators: true }
                    );
                    if (!updated) throw new Error(`Application ${row.application_id} not found`);

                } else if (type === 'eligibility') {
                    // Updating CGPA and Backlogs
                    if (!row.email) throw new Error('Missing email column');
                    // Build dynamic update object based on what was provided in CSV
                    const updateObj = {};
                    if (row.cgpa !== undefined && row.cgpa !== '') updateObj.cgpa = Number(row.cgpa);
                    if (row.backlogs_active !== undefined && row.backlogs_active !== '') updateObj.backlogs_active = Number(row.backlogs_active);

                    if (Object.keys(updateObj).length > 0) {
                        const updated = await Student.findOneAndUpdate(
                            { email: row.email },
                            updateObj,
                            { new: true, runValidators: true }
                        );
                        if (!updated) throw new Error(`Student ${row.email} not found`);
                    } else {
                        throw new Error(`Row ${row.email} had no updateable metrics provided`);
                    }
                } else {
                    throw new Error(`Unknown bulk operation type: ${type}`);
                }

                successCount++;
            } catch (err) {
                failCount++;
                errors.push(`Row ${i + 2} (${row.email || row.application_id || 'Unknown'}): ${err.message}`); // +2 for 1-index + header row
                logger.error(`Bulk Job ${job.id} Row ${i + 2} failed: ${err.message}`);
            }

            // Update Progress in BullMQ
            if (i % 10 === 0 || i === records.length - 1) { // Throttle progress updates to avoid Redis flooding
                await job.updateProgress({
                    percent: Math.round(((i + 1) / records.length) * 100),
                    processed: i + 1,
                    total: records.length
                });
            }
        }

        logger.info(`Completed bulk job ${job.id}. Success: ${successCount}, Fail: ${failCount}`);

        // This object becomes the `returnvalue` attached to the job upon completion
        return {
            total_processed: records.length,
            success_count: successCount,
            fail_count: failCount,
            errors: errors.slice(0, 100) // Cap error storage to top 100 so Redis doesn't bloat
        };

    }, { connection, concurrency: 2 }); // Allow up to 2 large CSVs to process at the exact same time

    bulkWorker.on('completed', job => {
        logger.info(`Bulk Job ${job.id} completed!`);
    });

    bulkWorker.on('failed', (job, err) => {
        logger.error(`Bulk Job ${job.id} crashed catastrophically: ${err.message}`);
    });

} else {
    // Mock for Jest testing
    bulkQueue = {
        add: async (name, payload) => {
            logger.info(`[TEST MOCK] Simulated adding ${payload.records.length} records to bulk ops queue.`);
            return { id: `mocked-test-job-id-${Math.floor(Math.random() * 1000)}` }; // Return fake job object
        },
        getJob: async (id) => {
            // Mock a completed job state
            return {
                id,
                finishedOn: Date.now(),
                progress: { percent: 100, processed: 5, total: 5 },
                returnvalue: { success_count: 5, fail_count: 0, total_processed: 5, errors: [] },
                failedReason: null,
                isCompleted: async () => true,
                isFailed: async () => false,
                isActive: async () => false,
            };
        }
    };
}

module.exports = { bulkQueue, bulkWorker };
