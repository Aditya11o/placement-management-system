const redis = require('redis');
require('dotenv').config();

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
console.log(`Connecting to Redis at: ${redisUrl.split('@').pop()}`); // Log only host for security

const unbanIp = async (ip) => {
    const client = redis.createClient({
        url: redisUrl
    });

    client.on('error', (err) => console.error('Redis Client Error', err));

    try {
        await client.connect();
        console.log('Connected to Redis.');

        const blockKey = `blocklist:${ip}`;
        console.log(`Searching for key: ${blockKey}`);

        const deleted = await client.del(blockKey);

        if (deleted) {
            console.log(`✅ Successfully unbanned IP: ${ip}`);
        } else {
            console.log(`⚠️  IP: ${ip} was not found in the blocklist.`);
        }
    } catch (err) {
        console.error(`❌ Error during unban process: ${err.message}`);
    } finally {
        if (client.isOpen) {
            await client.disconnect();
            console.log('Disconnected from Redis.');
        }
    }
};

const targetIp = process.argv[2] || '::1';
unbanIp(targetIp).then(() => console.log('Process finished.'));
