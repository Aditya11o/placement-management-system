const prisma = require('../utils/prisma');
const sendEmail = require('../utils/emailUtils');

// @desc    Advance application to next stage
// @route   PATCH /api/applications/:id/advance
// @access  Private (Recruiter/Admin)
const advanceApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { feedback, scheduledDate, location, evaluationData } = req.body;

    const application = await prisma.application.findUnique({
      where: { id },
      include: { 
        job: true,
        student: { select: { name: true, email: true, id: true, userId: true } }
      }
    });

    if (!application) return res.status(404).json({ message: 'Application not found' });
    if (application.isTerminal) return res.status(400).json({ message: 'Application is already in a terminal state' });

    const rounds = application.job.selectionProcess || ["Applied", "Technical Round", "HR Round", "Selected"];
    const currentIndex = application.currentStageIndex;
    const currentStageName = rounds[currentIndex] || 'Current Round';
    const nextIndex = currentIndex + 1;

    if (nextIndex >= rounds.length) {
      return res.status(400).json({ message: 'Already at the final round' });
    }

    const nextStage = rounds[nextIndex];
    const isFinal = nextIndex === rounds.length - 1;

    // Update status based on stage
    let status = 'Shortlisted';
    if (isFinal && nextStage.toLowerCase().includes('select')) {
      status = 'Selected';
    } else if (nextIndex > 0) {
      status = 'Scheduled'; 
    }

    const updatedApp = await prisma.$transaction(async (tx) => {
      // 1. Log the round being completed which triggered this advancement
      await tx.interview.create({
        data: {
          applicationId: id,
          type: currentStageName,
          status: 'completed',
          feedback: feedback || `Advanced from ${currentStageName}`,
          date: new Date(),
        }
      });

      // 2. Update the application to the next stage
      return await tx.application.update({
        where: { id },
        data: {
          currentStage: nextStage,
          currentStageIndex: nextIndex,
          status: status,
          evaluation: evaluationData || application.evaluation || {},
          isTerminal: status === 'Selected' || status === 'Rejected',
          statusHistory: {
            push: {
              status: nextStage,
              date: new Date().toISOString(),
              comment: feedback || `Advanced to ${nextStage}`
            }
          }
        }
      });
    });

    // Notify Student
    await prisma.notification.create({
      data: {
        userId: application.student.userId,
        title: 'Promotion to Next Round!',
        message: `Congratulations! You have been moved to the ${nextStage} for ${application.job.title} at ${application.job.companyName}.`,
        type: 'SUCCESS',
        link: '/student/applications'
      }
    });

    // Email Notification
    try {
      await sendEmail({
        email: application.student.email,
        subject: `Interview Update: ${nextStage} for ${application.job.title}`,
        template: 'status-update',
        context: {
          name: application.student.name,
          jobTitle: application.job.title,
          companyName: application.job.companyName,
          status: nextStage,
          statusColor: '#2563eb',
          dashboardUrl: 'http://localhost:5173/student/applications'
        }
      });
    } catch (e) { console.error('Email failed'); }


    res.json({ ...updatedApp, _id: updatedApp.id });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject application from current stage
// @route   PATCH /api/applications/:id/reject-pipeline
// @access  Private (Recruiter/Admin)
const rejectApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true, student: true }
    });

    if (!application) return res.status(404).json({ message: 'Application not found' });

    const updatedApp = await prisma.application.update({
      where: { id },
      data: {
        status: 'Rejected',
        isTerminal: true,
        statusHistory: {
          push: {
            status: 'Rejected',
            date: new Date().toISOString(),
            comment: feedback || `Application rejected at ${application.currentStage}`
          }
        }
      }
    });

    res.json({ ...updatedApp, _id: updatedApp.id });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pipeline data for a job
// @route   GET /api/applications/job/:jobId/pipeline
// @access  Private (Recruiter/Admin)
const getJobPipeline = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { selectionProcess: true }
    });

    if (!job) return res.status(404).json({ message: 'Job not found' });

    const applications = await prisma.application.findMany({
      where: { jobId },
      include: {
        interviews: { orderBy: { createdAt: 'desc' }, take: 3 },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePhoto: true
          }
        }
      }
    });

    // Fetch student profiles for matching scores
    const studentIds = applications.map(a => a.student.id);
    const profiles = await prisma.studentProfile.findMany({
      where: { userId: { in: studentIds } },
      select: { 
        userId: true, 
        cgpa: true, 
        skills: true, 
        course: true, 
        branch: true,
        academicVerified: true 
      }
    });
    
    const profileMap = new Map(profiles.map(p => [p.userId, p]));

    const rounds = job.selectionProcess || ["Applied", "Technical Round", "HR Round", "Selected"];
    
    // Group applications by stage
    const pipeline = rounds.map(stage => ({
      stage,
      applicants: applications
        .filter(app => app.currentStage === stage && app.status !== 'Rejected')
        .map(app => ({
          ...app,
          _id: app.id,
          student: {
            ...app.student,
            _id: app.student.id,
            profile: profileMap.get(app.student.id) || null
          }
        }))
    }));

    // Add a specialized column for Rejections
    pipeline.push({
      stage: 'Rejected',
      applicants: applications
        .filter(app => app.status === 'Rejected')
        .map(app => ({
          ...app,
          _id: app.id,
          student: {
            ...app.student,
            _id: app.student.id,
            profile: profileMap.get(app.student.id) || null
          }
        }))
    });

    res.json({ rounds, pipeline });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  advanceApplication,
  rejectApplication,
  getJobPipeline
};
