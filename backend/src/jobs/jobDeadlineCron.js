const cron = require('node-cron');
const Job = require('../models/Job');

// Run every midnight (00:00)
const initJobDeadlineCron = () => {
    cron.schedule('0 0 * * *', async () => {
        try {
            console.log('[CRON] Running Expired Job Scraper...');
            const now = new Date();

            // Find all jobs that are ACTIVE but their deadline has passed
            const expiredJobs = await Job.find({
                status: 'ACTIVE',
                deadline: { $lt: now }
            });

            if (expiredJobs.length > 0) {
                console.log(`[CRON] Found ${expiredJobs.length} expired jobs. Closing them.`);

                // Update them to INACTIVE
                const jobIds = expiredJobs.map(job => job._id);
                await Job.updateMany(
                    { _id: { $in: jobIds } },
                    { $set: { status: 'INACTIVE' } }
                );

                console.log(`[CRON] Successfully closed ${jobIds.length} jobs.`);
            } else {
                console.log('[CRON] No expired jobs found.');
            }
        } catch (error) {
            console.error('[CRON ERROR] jobDeadlineCron failed:', error);
        }
    });
};

module.exports = initJobDeadlineCron;
