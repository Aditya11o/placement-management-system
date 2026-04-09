const cron = require('node-cron');
const prisma = require('./prisma');
const { sendEmail } = require('./emailUtils');
const { runWeeklyReadinessCheck } = require('./readinessCron');
const { 
  purgeExpiredOTPs, 
  runFullMaintenance 
} = require('./maintenanceCron');
const { processScheduledBroadcasts } = require('./broadcastCron');

const checkJobDeadlines = async () => {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const startOfDay = new Date(threeDaysFromNow.setHours(0, 0, 0, 0));
    const endOfDay = new Date(threeDaysFromNow.setHours(23, 59, 59, 999));

    const approachingJobs = await prisma.job.findMany({
      where: {
        deadline: { gte: startOfDay, lte: endOfDay },
        status: 'open'
      },
      include: { recruiter: { include: { user: { select: { email: true, name: true } } } } }
    });

    for (const job of approachingJobs) {
      const user = job.recruiter?.user;
      if (user?.email) {
        await sendEmail({
          email: user.email,
          subject: `Upcoming Deadline: ${job.title}`,
          template: 'notification',
          context: {
            name: user.name || 'Recruiter',
            title: 'Job Application Deadline Approaching',
            message: `Deadline: <strong>${new Date(job.deadline).toLocaleDateString()}</strong>.`,
            actionUrl: `http://localhost:5173/recruiter/jobs/${job.id}`,
            actionText: 'Review Applications'
          }
        });
      }
    }
  } catch (error) {
    console.error('Error in job deadline cron task:', error);
  }
};

const checkWatchlistReminders = async () => {
  try {
    const now = new Date();
    
    // Check for 24h and 4h reminders
    // We check for windows: [23h50m - 24h10m] and [3h50m - 4h10m]
    const checkWindow = (hours) => {
      const start = new Date(now.getTime() + (hours * 3600000) - 600000); // -10 mins
      const end = new Date(now.getTime() + (hours * 3600000) + 600000);   // +10 mins
      return { gte: start, lte: end };
    };

    const windows = [
      { label: '24 hours', time: 24 },
      { label: '4 hours', time: 4 }
    ];

    for (const win of windows) {
      const query = checkWindow(win.time);
      const items = await prisma.watchlist.findMany({
        where: {
          job: {
            deadline: query,
            status: 'open'
          }
        },
        include: {
          job: true,
          student: { include: { user: true } }
        }
      });

      for (const item of items) {
        const user = item.student.user;
        const job = item.job;

        if (user.email) {
          // Send Email
          await sendEmail({
            email: user.email,
            subject: `Hurry! ${job.title} deadline is in ${win.label}`,
            template: 'notification',
            context: {
              name: user.name,
              title: 'Watchlist Reminder',
              message: `The application deadline for <strong>${job.title}</strong> at <strong>${job.companyName}</strong> is in ${win.label}. Don't miss out!`,
              actionUrl: `http://localhost:5173/student/jobs/${job.id}`,
              actionText: 'Apply Now'
            }
          });

          // Create In-App Notification
          await prisma.notification.create({
            data: {
              userId: user.id,
              title: 'Watchlist Reminder',
              message: `${job.title} application closes in ${win.label}. Apply now!`,
              type: 'warning'
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('Error in watchlist reminder cron task:', error);
  }
};

const { sendStudentDigest, sendAdminDigest } = require('./digestCron');

const initCron = (io) => {
  // Broadcast check: every minute
  cron.schedule('* * * * *', () => {
    console.log('Running scheduled broadcast check...');
    processScheduledBroadcasts(io);
  });

  cron.schedule('0 0 * * *', () => {
    console.log('Running daily job deadline check...');
    checkJobDeadlines();
  });

  // Watchlist Reminders: Every hour
  cron.schedule('0 * * * *', () => {
    console.log('Running hourly watchlist reminder check...');
    checkWatchlistReminders();
  });

  // Weekly Readiness Report: Every Sunday at 00:00
  cron.schedule('0 0 * * 0', () => {
    console.log('Running weekly readiness check...');
    runWeeklyReadinessCheck();
  });

  // Student Digest: Every Monday at 09:00
  cron.schedule('0 9 * * 1', () => {
    console.log('Running weekly student digest...');
    sendStudentDigest();
  });

  // Admin Digest: Every Sunday at 18:00
  cron.schedule('0 18 * * 0', () => {
    console.log('Running weekly admin digest...');
    sendAdminDigest();
  });

  // MAINTENANCE TASKS
  
  // Daily OTP Cleanup: Every day at 01:00
  cron.schedule('0 1 * * *', () => {
    console.log('Running daily OTP cleanup...');
    purgeExpiredOTPs();
  });

  // Full Maintenance Cycle: Every Sunday at 03:00
  cron.schedule('0 3 * * 0', () => {
    console.log('Running weekly system maintenance cycle...');
    runFullMaintenance();
  });
  
  // Also run once on startup for debugging/initial check
  checkJobDeadlines();
};

module.exports = { initCron };
