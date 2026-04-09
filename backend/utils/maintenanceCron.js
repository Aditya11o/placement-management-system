const prisma = require('./prisma');
const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');

/**
 * Purges Audit Logs older than 90 days
 */
const purgeOldLogs = async () => {
  try {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 90);

    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: { lt: threshold }
      }
    });

    console.log(`[Maintenance] Purged ${result.count} audit logs older than 90 days.`);
    return result.count;
  } catch (error) {
    console.error('[Maintenance] Error purging audit logs:', error);
  }
};

/**
 * Purges Notifications older than 30 days
 */
const purgeOldNotifications = async () => {
  try {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 30);

    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: { lt: threshold }
      }
    });

    console.log(`[Maintenance] Purged ${result.count} notifications older than 30 days.`);
    return result.count;
  } catch (error) {
    console.error('[Maintenance] Error purging notifications:', error);
  }
};

/**
 * Clears expired OTPs from user records
 */
const purgeExpiredOTPs = async () => {
  try {
    const result = await prisma.user.updateMany({
      where: {
        otpExpires: { lt: new Date() }
      },
      data: {
        otp: null,
        otpExpires: null
      }
    });

    if (result.count > 0) {
      console.log(`[Maintenance] Cleared expired OTPs for ${result.count} users.`);
    }
    return result.count;
  } catch (error) {
    console.error('[Maintenance] Error purging expired OTPs:', error);
  }
};

/**
 * Runs PostgreSQL VACUUM ANALYZE to optimize performance
 */
const optimizeDatabase = async () => {
  try {
    console.log('[Maintenance] Starting database optimization (VACUUM ANALYZE)...');
    // VACUUM cannot be run in a transaction, but executeRawUnsafe handles it. 
    // Note: Some managed DBs might restrict this, but it's standard for maintenance.
    await prisma.$executeRawUnsafe('VACUUM ANALYZE');
    console.log('[Maintenance] Database optimization complete.');
  } catch (error) {
    console.error('[Maintenance] Error optimizing database:', error);
  }
};

/**
 * Creates a zip backup of the codebase
 */
const createCodebaseBackup = async () => {
  try {
    const timestamp = new Date().toISOString().replace(/[:T]/g, '-').split('.')[0];
    const backupDir = path.join(__dirname, '..', '..', 'backup');
    const fileName = `pms_auto_backup_${timestamp}.zip`;
    const filePath = path.join(backupDir, fileName);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const zip = new AdmZip();
    const rootDir = path.join(__dirname, '..', '..');

    // Add Backend (excluding node_modules and uploads)
    zip.addLocalFolder(path.join(rootDir, 'backend'), 'backend', (name) => {
      const excluded = ['node_modules', 'uploads', '.git', 'backup'];
      return !excluded.some(ex => name.includes(ex));
    });

    // Add Frontend (excluding node_modules)
    zip.addLocalFolder(path.join(rootDir, 'frontend'), 'frontend', (name) => {
      const excluded = ['node_modules', '.git'];
      return !excluded.some(ex => name.includes(ex));
    });

    zip.writeZip(filePath);
    console.log(`[Maintenance] Automated codebase backup created: ${fileName}`);
    return fileName;
  } catch (error) {
    console.error('[Maintenance] Error creating codebase backup:', error);
  }
};

/**
 * Main function to run the full maintenance cycle
 */
const runFullMaintenance = async () => {
  console.log('--- STARTING SYSTEM MAINTENANCE CYCLE ---');
  await purgeExpiredOTPs();
  await purgeOldNotifications();
  await purgeOldLogs();
  await optimizeDatabase();
  await createCodebaseBackup();
  console.log('--- SYSTEM MAINTENANCE CYCLE COMPLETE ---');
};

module.exports = {
  purgeOldLogs,
  purgeOldNotifications,
  purgeExpiredOTPs,
  optimizeDatabase,
  createCodebaseBackup,
  runFullMaintenance
};
