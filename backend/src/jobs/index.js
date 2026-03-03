const initJobDeadlineCron = require('./jobDeadlineCron');
const initSessionCleanupCron = require('./sessionCleanupCron');
const initWeeklyDigestCron = require('./weeklyDigestCron');
const initDbBackupCron = require('./dbBackupCron');

const initCronJobs = () => {
    console.log('[CRON] Bootstrapping Scheduled Maintenance Workers...');

    // Mount the schedules
    initJobDeadlineCron();
    initSessionCleanupCron();
    initWeeklyDigestCron();
    initDbBackupCron(); // Factory function: creates and starts the cron task internally

    console.log('[CRON] All workers successfully scheduled in the background.');
};

module.exports = initCronJobs;
