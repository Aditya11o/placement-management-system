const { Queue, Worker } = require('bullmq');
const sendEmail = require('./sendEmail');
const logger = require('./logger');

const IORedis = require('ioredis');

const ejs = require('ejs');
const path = require('path');

// Setup Redis connection options for BullMQ
// Requires ioredis compatible format with maxRetriesPerRequest set to null
const redisOptions = {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
        return Math.min(times * 100, 3000); // Reconnect after max 3 seconds
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

let emailQueue;
let emailWorker;

// Only instantiate real queues and workers if we are not running tests
if (process.env.NODE_ENV !== 'test') {
    // Create the Queue
    emailQueue = new Queue('email-queue', {
        connection,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
            removeOnComplete: true,
        }
    });

    // Create the Worker
    emailWorker = new Worker('email-queue', async (job) => {
        try {
            logger.info(`Processing email job ${job.id} to ${job.data.email}`);

            let htmlPayload = null;

            // Dynamically render EJS template if specified
            if (job.data.template) {
                const templatePath = path.join(__dirname, '..', 'templates', 'emails', `${job.data.template}.ejs`);

                // We wrap the raw template inside our base wrapper layout
                const rawHtml = await ejs.renderFile(templatePath, job.data.context || {});
                const wrapperPath = path.join(__dirname, '..', 'templates', 'emails', 'base.ejs');
                htmlPayload = await ejs.renderFile(wrapperPath, { body: rawHtml });
            }

            await sendEmail({
                email: job.data.email,
                subject: job.data.subject,
                message: job.data.message, // Fallback string payload
                html: htmlPayload // The compiled EJS UI
            });
            logger.info(`Successfully processed email job ${job.id} to ${job.data.email}`);
        } catch (err) {
            logger.error(`Failed to process email job ${job.id}: ${err.message}`);
            throw err; // triggers BullMQ retry logic
        }
    }, { connection });

    // Handle worker events safely
    emailWorker.on('completed', job => {
        logger.info(`Email job ${job.id} has completed!`);
    });

    emailWorker.on('failed', (job, err) => {
        logger.error(`Email job ${job.id} has failed with ${err.message}`);
    });
} else {
    // Mock the queue during Jest tests so we don't open real Redis handle connections and hang tests
    emailQueue = {
        add: async (name, payload) => {
            logger.info(`[TEST MOCK] Simulated adding job to queue for ${payload.email}`);
        }
    };
}

module.exports = { emailQueue, emailWorker };
