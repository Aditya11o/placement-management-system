const cron = require('node-cron');
const Job = require('../models/Job');
const User = require('../models/User');
const { sendEmail } = require('./emailUtils');

const checkJobDeadlines = async () => {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    // Start of the day 3 days from now
    const startOfDay = new Date(threeDaysFromNow.setHours(0, 0, 0, 0));
    // End of the day 3 days from now
    const endOfDay = new Date(threeDaysFromNow.setHours(23, 59, 59, 999));

    const approachingJobs = await Job.find({
      deadline: { $gte: startOfDay, $lte: endOfDay },
      status: 'active'
    }).populate('recruiter', 'email name');

    for (const job of approachingJobs) {
      if (job.recruiter && job.recruiter.email) {
        await sendEmail({
          email: job.recruiter.email,
          subject: `Upcoming Deadline: ${job.title}`,
          template: 'notification',
          context: {
            name: job.recruiter.name || 'Recruiter',
            title: 'Job Application Deadline Approaching',
            message: `This is a friendly reminder that the application deadline for your job posting "<strong>${job.title}</strong>" is approaching in 3 days (<strong>${new Date(job.deadline).toLocaleDateString()}</strong>).<br><br>Please ensure you have reviewed all applications by then.`,
            actionUrl: `http://localhost:5173/recruiter/jobs/${job._id}`,
            actionText: 'Review Applications'
          }
        });
        console.log(`Deadline alert sent to ${job.recruiter.email} for job: ${job.title}`);
      }
    }
  } catch (error) {
    console.error('Error in job deadline cron task:', error);
  }
};

// Run every day at 00:00 (Midnight)
const initCron = () => {
  cron.schedule('0 0 * * *', () => {
    console.log('Running daily job deadline check...');
    checkJobDeadlines();
  });
  
  // Also run once on startup for debugging/initial check
  checkJobDeadlines();
};

module.exports = { initCron };
