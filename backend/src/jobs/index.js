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

    // Note: The backup job internally binds itself as a node-cron task
    // Since we exported the task itself, we call start()
    initDbBackupCron.start();

    console.log('[CRON] All workers successfully scheduled in the background.');
};

module.exports = initCronJobs;
