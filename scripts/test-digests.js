const { sendStudentDigest, sendAdminDigest } = require('../backend/utils/digestCron');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function testDigests() {
    console.log('--- Testing Email Digest System ---');
    try {
        console.log('Testing Student Digest...');
        await sendStudentDigest();
        
        console.log('Testing Admin Digest...');
        await sendAdminDigest();
        
        console.log('--- Test Complete ---');
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        process.exit(0);
    }
}

testDigests();
