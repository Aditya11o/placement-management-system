const { connectRedis, getRedisClient } = require('../backend/src/config/redis');
const { clearCache } = require('../backend/src/middlewares/cacheMiddleware');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function testCache() {
    try {
        await connectRedis();
        const client = getRedisClient();

        const testKey = 'cache:/api/v1/announcements';
        await client.set(testKey, JSON.stringify({ data: 'test' }));
        console.log('Set test key:', testKey);

        const val = await client.get(testKey);
        console.log('Verified test key exists:', !!val);

        console.log('Running clearCache...');
        await clearCache('/api/v1/announcements');

        const valAfter = await client.get(testKey);
        console.log('Test key exists after clearCache:', !!valAfter);

        if (valAfter) {
            console.error('FAILED: Cache key still exists!');
            // Try matching manually
            const keys = await client.keys('cache:/api/v1/announcements*');
            console.log('Keys matching pattern:', keys);
        } else {
            console.log('SUCCESS: Cache key cleared.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Test error:', err);
        process.exit(1);
    }
}

testCache();
