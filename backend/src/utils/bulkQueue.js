const { Queue, Worker } = require('bullmq');
const logger = require('./logger');

// Mongoose Models for Updates
const Student = require('../models/Student');
const Application = require('../models/Application');

const IORedis = require('ioredis');

// Setup Redis connection options
const config = require('../config/config');

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

const connection = new IORedis(config.get('redis.url'), redisOptions);

const XLSX = require('xlsx');

let bulkQueue;
let bulkWorker;

if (config.get('env') !== 'test') {
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
    const { type, records, options = {} } = job.data;
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
            // ── Validation Layer ────────────────────────────────────────────
            if (type === 'student_import') {
                const requiredFields = ['name', 'email', 'branch', 'cgpa', 'graduation_year'];
                for (const field of requiredFields) {
                    if (!row[field]) throw new Error(`Missing required field: ${field}`);
                }

                // Email format validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(row.email)) throw new Error(`Invalid email format: ${row.email}`);

                // Numeric validations
                const cgpa = Number(row.cgpa);
                if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) throw new Error(`Invalid CGPA: ${row.cgpa}. Must be 0-10.`);
                
                const gradYear = Number(row.graduation_year);
                if (isNaN(gradYear) || gradYear < 2000 || gradYear > 2100) throw new Error(`Invalid Graduation Year: ${row.graduation_year}`);

                // Duplicate Strategy
                const exists = await Student.findOne({ email: row.email });
                if (exists) {
                    if (options.duplicateStrategy === 'OVERWRITE') {
                        await Student.findByIdAndUpdate(exists._id, {
                            name: row.name,
                            branch: row.branch,
                            cgpa,
                            graduation_year: gradYear,
                            phone: row.phone || exists.phone,
                            gender: (row.gender || exists.gender).toUpperCase(),
                            marks_10th: Number(row.marks_10th) || exists.marks_10th,
                            marks_12th: Number(row.marks_12th) || exists.marks_12th,
                        });
                    } else {
                        throw new Error(`Student with email ${row.email} already exists (Skipped)`);
                    }
                } else {
                    // Create new
                    await Student.create({
                        name: row.name,
                        email: row.email,
                        password: 'Welcome@123',
                        branch: row.branch,
                        cgpa,
                        graduation_year: gradYear,
                        phone: row.phone || '',
                        gender: (row.gender || 'OTHER').toUpperCase(),
                        marks_10th: Number(row.marks_10th) || 0,
                        marks_12th: Number(row.marks_12th) || 0,
                        status: 'APPROVED'
                    });
                }
            } else if (type === 'students') {
                // Update Student Approval Status
                if (!row.email || !row.status) throw new Error('Missing email or status column');
                const updated = await Student.findOneAndUpdate(
                    { email: row.email },
                    { status: row.status.toUpperCase() },
                    { new: true, runValidators: true }
                );
                if (!updated) throw new Error(`Student ${row.email} not found`);

            } else if (type === 'applications') {
                // Update Application Statuses Mass
                if (!row.application_id || !row.status) throw new Error('Missing application_id or status column');
                const updated = await Application.findByIdAndUpdate(
                    row.application_id,
                    { status: row.status.toUpperCase() },
                    { new: true, runValidators: true }
                );
                if (!updated) throw new Error(`Application ${row.application_id} not found`);

            } else if (type === 'eligibility') {
                // Updating CGPA and Backlogs
                if (!row.email) throw new Error('Missing email column');
                const updateObj = {};
                if (row.cgpa !== undefined && row.cgpa !== '') {
                    const val = Number(row.cgpa);
                    if (isNaN(val) || val < 0 || val > 10) throw new Error(`Invalid CGPA: ${row.cgpa}`);
                    updateObj.cgpa = val;
                }
                if (row.backlogs_active !== undefined && row.backlogs_active !== '') {
                    const val = Number(row.backlogs_active);
                    if (isNaN(val) || val < 0) throw new Error(`Invalid Backlogs: ${row.backlogs_active}`);
                    updateObj.backlogs_active = val;
                }

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
            errors.push(`Row ${i + 2} (${row.email || row.application_id || 'Unknown'}): ${err.message}`);
            logger.error(`Bulk Job ${job.id} Row ${i + 2} failed: ${err.message}`);
        }

        // Update Progress in BullMQ
        if (i % 10 === 0 || i === records.length - 1) {
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
