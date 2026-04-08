const prisma = require('./prisma');
const sendEmail = require('./emailUtils');

/**
 * Aggregates new jobs and reminders for students and sends a weekly digest.
 */
const sendStudentDigest = async () => {
  try {
    console.log('Starting weekly student digest distribution...');
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch new jobs posted in the last 7 days
    const newJobs = await prisma.job.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        status: 'open'
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const students = await prisma.user.findMany({
      where: { role: 'student' },
      include: {
        studentProfile: {
          select: { id: true }
        }
      }
    });

    for (const student of students) {
      if (!student.email) continue;

      // Personalized content (simplistic for now: top 5 jobs)
      await sendEmail({
        email: student.email,
        subject: '📅 Your Weekly Placement Digest',
        template: 'digest-student',
        context: {
          name: student.name || 'Student',
          newJobs: newJobs.map(job => ({
            id: job.id,
            title: job.title,
            company: job.companyName,
            salary: job.salary,
            deadline: new Date(job.deadline).toLocaleDateString()
          })),
          actionUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/jobs`
        }
      });
    }
  } catch (error) {
    console.error('Error in student digest cron:', error);
  }
};

/**
 * Aggregates weekly placement statistics and sends a digest to administrators.
 */
const sendAdminDigest = async () => {
  try {
    console.log('Starting weekly admin digest distribution...');
    
    // Stats aggregation
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [newJobsCount, newApplicationsCount, pendingVerificationsCount] = await Promise.all([
      prisma.job.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.application.count({ where: { appliedAt: { gte: sevenDaysAgo } } }),
      prisma.verification.count({ where: { status: 'Pending' } })
    ]);

    const admins = await prisma.user.findMany({
      where: { role: 'admin' }
    });

    for (const admin of admins) {
      if (!admin.email) continue;

      await sendEmail({
        email: admin.email,
        subject: '📊 Placement Cell Weekly Report',
        template: 'digest-admin',
        context: {
          name: admin.name || 'Admin',
          stats: {
            newJobs: newJobsCount,
            newApplications: newApplicationsCount,
            pendingVerifications: pendingVerificationsCount
          },
          actionUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/dashboard`
        }
      });
    }
  } catch (error) {
    console.error('Error in admin digest cron:', error);
  }
};

module.exports = { sendStudentDigest, sendAdminDigest };
