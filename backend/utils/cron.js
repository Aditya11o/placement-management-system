const cron = require('node-cron');
const prisma = require('../utils/prisma');
const { sendEmail } = require('./emailUtils');

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

const initCron = () => {
  cron.schedule('0 0 * * *', () => {
    console.log('Running daily job deadline check...');
    checkJobDeadlines();
  });
  
  // Also run once on startup for debugging/initial check
  checkJobDeadlines();
};

module.exports = { initCron };
