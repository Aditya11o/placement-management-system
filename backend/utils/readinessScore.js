const prisma = require('./prisma');

/**
 * Calculates a student's readiness score (0-100)
 * @param {string} studentProfileId - The ID of the student profile
 * @returns {Promise<{score: number, breakdown: object}>}
 */
const calculateReadinessScore = async (studentProfileId) => {
  const profile = await prisma.studentProfile.findUnique({
    where: { id: studentProfileId },
    include: {
      skillVerifications: { where: { status: 'Verified' } },
      applications: true,
      user: {
        include: {
          sentMessages: true, // Activity proxy? No, let's use experiences and mock interviews
          mentorshipBookings: { where: { status: 'completed' } }
        }
      }
    }
  });

  if (!profile) return { score: 0, breakdown: {} };

  const userId = profile.userId;

  // 1. Profile Completion (Max 25)
  let profileScore = 0;
  if (profile.profilePhoto) profileScore += 5;
  if (profile.resumePath) profileScore += 10;
  
  const essentialFields = ['rollNo', 'course', 'branch', 'phone', 'linkedin'];
  essentialFields.forEach(field => {
    if (profile[field]) profileScore += 2;
  });

  // 2. Academic Strength (Max 20)
  let academicScore = 0;
  const cgpa = profile.cgpa || 0;
  if (cgpa >= 9.0) academicScore = 20;
  else if (cgpa >= 8.0) academicScore = 15;
  else if (cgpa >= 7.0) academicScore = 10;
  else if (cgpa >= 6.0) academicScore = 5;
  else if (cgpa > 0) academicScore = 2;

  // 3. Skill Portfolio (Max 20)
  const verifiedSkillsCount = profile.skillVerifications.length;
  const skillScore = Math.min(verifiedSkillsCount * 5, 20);

  // 4. Activity Score (Max 15)
  // Need to count experiences and mock interviews
  const [mockInterviewCount, experienceCount] = await Promise.all([
    prisma.mockInterview.count({ where: { studentId: userId, status: 'completed' } }),
    prisma.experience.count({ where: { studentId: userId } })
  ]);

  let activityScore = 0;
  activityScore += Math.min(mockInterviewCount * 2, 6);
  activityScore += Math.min(experienceCount * 3, 6);
  if (profile.user.mentorshipBookings.length > 0) activityScore += 3;

  // 5. Application History (Max 20)
  let applicationScore = 0;
  const hasInterview = profile.applications.some(app => app.interviewDate || app.status === 'Shortlisted');
  const isPlaced = profile.applications.some(app => ['Selected', 'Accepted', 'Placed'].includes(app.status));

  if (hasInterview) applicationScore += 10;
  if (isPlaced) applicationScore += 10;

  const totalScore = Math.min(profileScore + academicScore + skillScore + activityScore + applicationScore, 100);

  // Update cached score in profile
  await prisma.studentProfile.update({
    where: { id: studentProfileId },
    data: { readinessScore: totalScore }
  });

  return {
    score: totalScore,
    breakdown: {
      profile: { score: profileScore, max: 25 },
      academic: { score: academicScore, max: 20 },
      skills: { score: skillScore, max: 20 },
      activity: { score: activityScore, max: 15 },
      placement: { score: applicationScore, max: 20 }
    }
  };
};

module.exports = { calculateReadinessScore };
