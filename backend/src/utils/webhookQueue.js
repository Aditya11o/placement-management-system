const { Queue, Worker } = require('bullmq');
const axios = require('axios');
const logger = require('./logger');

const IORedis = require('ioredis');

// Setup Redis connection options for BullMQ
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

let webhookQueue;
let webhookWorker;

// Only instantiate real queues and workers if we are not running tests
if (process.env.NODE_ENV !== 'test') {
    // Create the Queue
    webhookQueue = new Queue('webhook-queue', {
        connection,
        defaultJobOptions: {
            attempts: 5, // Retry external network calls more aggressively
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
            removeOnComplete: true,
        }
    });

    // Create the Worker
    webhookWorker = new Worker('webhook-queue', async (job) => {
        try {
            const { url, payload } = job.data;
            logger.info(`Dispatching webhook ${job.id} to ${url}`);

            await axios.post(url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'PMS-Webhook-Dispatcher/1.0'
                },
                timeout: 5000 // 5 second timeout so we don't hang
            });

            logger.info(`Successfully dispatched webhook ${job.id} to ${url}`);
        } catch (err) {
            logger.error(`Failed to dispatch webhook ${job.id}: ${err.message}`);
            throw err; // triggers BullMQ retry logic
        }
    }, { connection });

    webhookWorker.on('completed', job => {
        logger.info(`Webhook ${job.id} completed!`);
    });

    webhookWorker.on('failed', (job, err) => {
        logger.error(`Webhook ${job.id} failed deeply with ${err.message}`);
    });
} else {
    // Mock the queue during Jest tests so we don't open real Redis handle connections and hang tests
    webhookQueue = {
        add: async (name, payload) => {
            logger.info(`[TEST MOCK] Simulated dispatching webhook to ${payload.url}`);
        }
    };
}

module.exports = { webhookQueue, webhookWorker };
