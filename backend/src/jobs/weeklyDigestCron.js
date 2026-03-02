const cron = require('node-cron');
const Student = require('../models/Student');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Admin = require('../models/Admin');
const { emailQueue } = require('../utils/emailQueue');

// Run every Friday at 5:00 PM
const initWeeklyDigestCron = () => {
    cron.schedule('0 17 * * 5', async () => {
        try {
            console.log('[CRON] Aggregating Weekly System Digest...');
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);

            // 1. Gather stats
            const newStudents = await Student.countDocuments({ created_at: { $gte: lastWeek } });
            const newJobs = await Job.countDocuments({ created_at: { $gte: lastWeek } });
            const newPlacements = await Application.countDocuments({
                status: 'SELECTED',
                offer_letter_generated_at: { $gte: lastWeek }
            });

            const activeJobsCount = await Job.countDocuments({ status: 'ACTIVE' });

            // 2. Format Email
            const digestMessage = `
            <h3>Weekly Placement Management System Digest</h3>
            <p>Here is your summary of the platform's activity over the last 7 days:</p>
            <ul>
                <li><strong>New Students Registered:</strong> ${newStudents}</li>
                <li><strong>New Job Postings:</strong> ${newJobs}</li>
                <li><strong>New Placements (Offers Accepted):</strong> ${newPlacements}</li>
            </ul>
            <p>Log in to the admin dashboard for detailed insights.</p>
            `;

            // 3. Find Admins and Students
            const admins = await Admin.find({}).select('email name');
            const students = await Student.find({}).select('email name');

            // 4. Queue Emails for Admins
            for (const admin of admins) {
                await emailQueue.add('weekly-digest-email', {
                    email: admin.email,
                    subject: 'Weekly PMS Activity Digest',
                    message: digestMessage // The email worker must support HTML or gracefully degrade
                });
            }
            console.log(`[CRON] Queued weekly digest for ${admins.length} admins.`);

            // 5. Queue Emails for Students (Job Digest)
            for (const student of students) {
                await emailQueue.add('weekly-job-digest-email', {
                    email: student.email,
                    subject: 'Weekly Job Digest - Placement Management System',
                    template: 'alert',
                    context: {
                        title: 'Weekly Job Digest',
                        name: student.name,
                        message: `There are currently ${activeJobsCount} active job postings available on the portal matching your criteria! Log in now to view them and apply before the deadlines.`,
                        cta: {
                            text: 'View Job Postings',
                            url: `${process.env.FRONTEND_URL}/jobs`
                        }
                    }
                });
            }

            console.log(`[CRON] Queued weekly job digest for ${students.length} students.`);
        } catch (error) {
            console.error('[CRON ERROR] weeklyDigestCron failed:', error);
        }
    });
};

module.exports = initWeeklyDigestCron;
