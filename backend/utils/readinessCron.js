const prisma = require('./prisma');
const { calculateReadinessScore } = require('./readinessScore');
const sendEmail = require('./emailUtils');

/**
 * Runs the weekly readiness score update and sends notifications
 */
const runWeeklyReadinessCheck = async () => {
  try {
    console.log('Starting weekly readiness score check...');
    const students = await prisma.studentProfile.findMany({
      include: {
        user: { select: { email: true, name: true } },
        readinessHistory: {
          orderBy: { date: 'desc' },
          take: 1
        }
      }
    });

    for (const student of students) {
      if (!student.user?.email) continue;

      const { score: currentScore } = await calculateReadinessScore(student.id);
      const lastHistory = student.readinessHistory[0];
      const previousScore = lastHistory ? lastHistory.score : 0;
      const improvement = currentScore - previousScore;

      // Log history
      await prisma.readinessHistory.create({
        data: {
          studentId: student.id,
          score: currentScore
        }
      });

      // Send email if score is significant or has improved
      if (currentScore > 0) {
        let message = '';
        let subject = '';
        
        if (improvement > 0) {
          subject = `🚀 Big Progress! Your Readiness Score is now ${currentScore}`;
          message = `Great job! Your placement readiness improved by <strong>${improvement} points</strong> this week. You are now <strong>${currentScore}%</strong> ready for placements.`;
        } else if (currentScore < 80) {
          subject = `📈 Weekly Readiness Update: ${currentScore}%`;
          message = `Your placement readiness score is currently <strong>${currentScore}%</strong>. Boost it further by verifying your skills or completing your profile projects!`;
        } else {
          // If already high and stable
          continue; 
        }

        await sendEmail({
          email: student.user.email,
          subject: subject,
          template: 'notification',
          context: {
            name: student.user.name || 'Student',
            title: 'Readiness Report',
            message: message,
            actionUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/dashboard`,
            actionText: 'View Dashboard'
          }
        });
      }
    }
    console.log(`Weekly readiness check complete for ${students.length} students.`);
  } catch (error) {
    console.error('Error in weekly readiness cron task:', error);
  }
};

module.exports = { runWeeklyReadinessCheck };
