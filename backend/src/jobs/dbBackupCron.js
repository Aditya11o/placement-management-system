const cron = require('node-cron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const logger = require('../utils/logger');

/**
 * Factory function — call this to create AND start the backup cron task.
 * NOT executed at module load time — only called by jobs/index.js during real server startup.
 * This prevents the node-cron internal scheduler timer from leaking into Jest test processes.
 */
module.exports = function initDbBackupCron() {
    // Run every day at 03:00 AM
    const dbBackupCron = cron.schedule('0 3 * * *', async () => {
        logger.info('[CRON] Initiating automated database BSON backup...');

        const DB_URI = process.env.MONGO_URI;
        if (!DB_URI) {
            logger.error('[CRON BACKUP] Failed: MONGODB_URI is not defined.');
            return;
        }

        try {
            const backupsDir = path.join(__dirname, '..', '..', 'backups');

            // Ensure backups directory exists
            if (!fs.existsSync(backupsDir)) {
                fs.mkdirSync(backupsDir, { recursive: true });
            }

            const dateStr = new Date().toISOString().replace(/:/g, '-').split('.')[0];
            const archiveName = `pms-backup-${dateStr}.zip`;
            const archivePath = path.join(backupsDir, archiveName);

            // Temporary folder for mongodump raw BSON
            const tempDumpPath = path.join(backupsDir, `temp-dump-${dateStr}`);

            // 1. Execute mongodump BSON extraction
            await new Promise((resolve, reject) => {
                const dumpProcess = spawn('mongodump', [
                    `--uri=${DB_URI}`,
                    `--out=${tempDumpPath}`
                ]);

                dumpProcess.on('error', (err) => {
                    logger.error(`[CRON BACKUP] mongodump spawn error: ${err.message}`);
                    reject(err);
                });

                dumpProcess.on('close', (code) => {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error(`mongodump child process exited with code ${code}`));
                    }
                });
            });

            logger.info(`[CRON BACKUP] Database successfully dumped to temporary directory.`);

            // 2. Compress the dumped BSON folder into a ZIP archive
            await new Promise((resolve, reject) => {
                const output = fs.createWriteStream(archivePath);
                const archive = archiver('zip', {
                    zlib: { level: 9 } // Maximum compression
                });

                output.on('close', () => {
                    logger.info(`[CRON BACKUP] Archive constructed: ${archive.pointer()} total bytes.`);
                    resolve();
                });

                archive.on('error', (err) => reject(err));

                archive.pipe(output);

                // Append files from our temp dump directory into the zip root
                archive.directory(tempDumpPath, false);
                archive.finalize();
            });

            // 3. Clean up the temporary BSON folder silently
            fs.rmSync(tempDumpPath, { recursive: true, force: true });
            logger.info(`[CRON BACKUP] Temporary dump payload deleted. Final archive saved at ${archiveName}`);

            // 4. Enforce 7-Day Rolling Retention Policy
            const files = fs.readdirSync(backupsDir);
            const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 Days
            const now = Date.now();

            let deletedCount = 0;
            files.forEach(file => {
                if (file.endsWith('.zip')) {
                    const filePath = path.join(backupsDir, file);
                    const stats = fs.statSync(filePath);

                    if (now - stats.mtimeMs > MAX_AGE_MS) {
                        fs.unlinkSync(filePath);
                        deletedCount++;
                    }
                }
            });

            if (deletedCount > 0) {
                logger.info(`[CRON BACKUP] Retention Policy enforced: Deleted ${deletedCount} stale backup archives.`);
            }

            logger.info('[CRON BACKUP] Nightly Backup sequence completed successfully.');

        } catch (error) {
            logger.error(`[CRON BACKUP] Fatal error during snapshot pipeline: ${error.message}`);
        }
    }, {
        scheduled: false // Do not auto-start; caller invokes .start() after creation
    });

    dbBackupCron.start();
};
