const { Queue, Worker } = require('bullmq');
const sendEmail = require('./sendEmail');
const logger = require('./logger');
const EmailTemplate = require('../models/EmailTemplate');

const IORedis = require('ioredis');

const ejs = require('ejs');
const path = require('path');

// Setup Redis connection options for BullMQ
// Requires ioredis compatible format with maxRetriesPerRequest set to null
const cloudinary = require('cloudinary').v2;
const config = require('../config/config');

cloudinary.config({
    cloud_name: config.get('cloudinary.cloud_name'),
    api_key: config.get('cloudinary.api_key'),
    api_secret: config.get('cloudinary.api_secret'),
});

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

const connection = new IORedis(config.get('redis.url'), redisOptions);

let emailQueue;
let emailWorker;

// Only instantiate real queues and workers if we are not running tests
if (config.get('env') !== 'test') {
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
            let subjectPayload = job.data.subject;

            if (job.data.template) {
                // 1. Try fetching from the database first
                const dbTemplate = await EmailTemplate.findOne({ name: job.data.template });

                if (dbTemplate) {
                    subjectPayload = dbTemplate.subject || job.data.subject;
                    let rawHtml = dbTemplate.htmlContent;

                    // Simple regex interpolation: replaces {{key}} with context[key]
                    if (job.data.context) {
                        for (const [key, value] of Object.entries(job.data.context)) {
                            const regex = new RegExp(`{{${key}}}`, 'g');
                            rawHtml = rawHtml.replace(regex, value);
                        }
                    }

                    // Wrap the custom HTML in the base wrapper layout
                    const wrapperPath = path.join(__dirname, '..', 'templates', 'emails', 'base.ejs');
                    htmlPayload = await ejs.renderFile(wrapperPath, { body: rawHtml });
                } else {
                    // 2. Fallback to static EJS file if DB template is missing
                    const templatePath = path.join(__dirname, '..', 'templates', 'emails', `${job.data.template}.ejs`);
                    const rawHtml = await ejs.renderFile(templatePath, job.data.context || {});
                    const wrapperPath = path.join(__dirname, '..', 'templates', 'emails', 'base.ejs');
                    htmlPayload = await ejs.renderFile(wrapperPath, { body: rawHtml });
                }
            }

            await sendEmail({
                email: job.data.email,
                subject: subjectPayload,
                message: job.data.message, // Fallback string payload
                html: htmlPayload // The compiled HTML UI
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
