const prisma = require('../utils/prisma');
const sendEmail = require('../utils/emailUtils');
const { parsePagination } = require('../utils/pagination');

// @desc    Apply for a job
// @route   POST /api/applications/:jobId
// @access  Private (Student)
const applyForJob = async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.jobId } });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(400).json({ message: 'Profile not found' });

    // Check for existing application
    const existing = await prisma.application.findUnique({
      where: {
        studentId_jobId: {
          studentId: req.user.id,
          jobId: req.params.jobId
        }
      }
    });

    if (existing) return res.status(400).json({ message: 'You have already applied for this job' });

    // Eligibility check
    if (profile.cgpa < job.minCGPA) {
       return res.status(400).json({ message: `Insufficient CGPA. Minimum required is ${job.minCGPA}` });
    }

    const { resumeId } = req.body || {};
    let finalResumeUrl = profile.resumePath || '';

    if (resumeId) {
      const selectedResume = await prisma.studentResume.findUnique({ where: { id: resumeId } });
      if (selectedResume && selectedResume.studentId === profile.id) {
        finalResumeUrl = selectedResume.url;
      }
    }

    const application = await prisma.application.create({
      data: {
        studentId: req.user.id,
        jobId: req.params.jobId,
        resume: finalResumeUrl,
        resumeId: resumeId
      }
    });

    // Update stats
    await prisma.job.update({
      where: { id: req.params.jobId },
      data: { applicationsCount: { increment: 1 } }
    });

    if (resumeId) {
      await prisma.studentResume.update({
        where: { id: resumeId },
        data: { applicationsCount: { increment: 1 } }
      });
    }

    res.status(201).json({ ...application, _id: application.id });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my applications
// @route   GET /api/applications/my
// @access  Private (Student)
const getMyApplications = async (req, res, next) => {
  try {
    const { status } = req.query;
    const { skip, limit, paginate } = parsePagination(req.query);
    
    const where = { studentId: req.user.id };
    if (status && status !== 'Any Status') {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: { job: { select: { title: true, companyName: true, status: true, deadline: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.application.count({ where })
    ]);

    const formattedApps = applications.map(app => ({ ...app, _id: app.id, student: req.user.id, job: { ...app.job, _id: app.jobId } }));
    res.json(paginate(formattedApps, total));
  } catch (error) {
    next(error);
  }
};

// @desc    Get applicants for a job
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter/Admin)
const getJobApplicants = async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.jobId } });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (req.user.role !== 'admin' && job.recruiterId !== req.user.id) {
       // This needs recruiter profile check since recruiterId in Job is Profile ID, not User ID
       const recruiterProfile = await prisma.recruiterProfile.findUnique({ where: { userId: req.user.id } });
       if (!recruiterProfile || job.recruiterId !== recruiterProfile.id) {
         return res.status(401).json({ message: 'Not authorized' });
       }
    }

    const { skip, limit, paginate } = parsePagination(req.query);
    const where = { jobId: req.params.jobId };

    const [applicants, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: { 
          student: { select: { name: true, email: true, profilePhoto: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.application.count({ where })
    ]);

    // Fetch StudentProfiles for these students
    const studentIds = applicants.map(a => a.studentId);
    const profiles = await prisma.studentProfile.findMany({
      where: { userId: { in: studentIds } }
    });
    const profileMap = new Map(profiles.map(p => [p.userId, p]));

    const enriched = applicants.map(app => ({
      ...app,
      _id: app.id,
      student: { ...app.student, _id: app.studentId },
      studentProfile: profileMap.get(app.studentId) || null
    }));

    res.json(paginate(enriched, total));
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for admin
// @route   GET /api/applications/admin
// @access  Private (Admin)
const getAllApplications = async (req, res, next) => {
  try {
    const { skip, limit, paginate } = parsePagination(req.query);

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        include: { 
          student: { select: { name: true, email: true } },
          job: { select: { title: true, companyName: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.application.count()
    ]);

    const studentIds = applications.map(a => a.studentId);
    const profiles = await prisma.studentProfile.findMany({
      where: { userId: { in: studentIds } }
    });
    const profileMap = new Map(profiles.map(p => [p.userId, p]));

    const enriched = applications.map(app => ({
      ...app,
      _id: app.id,
      student: { ...app.student, _id: app.studentId },
      job: { ...app.job, _id: app.jobId },
      studentProfile: profileMap.get(app.studentId) || null
    }));

    res.json(paginate(enriched, total));
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PATCH /api/applications/:id/status
// @access  Private (Recruiter)
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, feedback, interviewDate, interviewLink, evaluation } = req.body;
    
    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: {
        status,
        feedback,
        interviewDate: interviewDate ? new Date(interviewDate) : undefined,
        interviewLink,
        evaluation
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        job: { select: { title: true, companyName: true } }
      }
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Email notification
    try {
      const statusColors = {
        'Applied': '#64748b',
        'Shortlisted': '#2563eb',
        'Interviewing': '#7c3aed',
        'Selected': '#10b981',
        'Rejected': '#ef4444'
      };

      await sendEmail({
        email: application.student.email,
        subject: `Application Update: ${application.job?.title || 'Placement Portal'}`,
        template: 'status-update',
        context: {
          name: application.student.name,
          jobTitle: application.job?.title || 'Job Application',
          companyName: application.job?.companyName || 'Placement Cell',
          status: status,
          statusColor: statusColors[status] || '#000613',
          dashboardUrl: 'http://localhost:5173/student/applications'
        }
      });
    } catch (err) {
      console.error('Email failed to send:', err);
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: application.student.id,
        title: 'Application Status Updated',
        message: `Your application status for ${application.job?.title || 'a job'} has been updated to ${status}.`,
        type: 'INTERVIEW',
        link: `/student/applications`,
      }
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(application.student.id).emit('notification', {
        message: `Your application status for ${application.job.title || 'a job'} has been updated to ${status}.`,
        type: 'application',
      });
    }

    res.json({ ...application, _id: application.id });
  } catch (error) {
    next(error);
  }
};

// @desc    Get scheduled interviews for current user
// @route   GET /api/applications/interviews
// @access  Private
const getScheduledInterviews = async (req, res, next) => {
  try {
    const { skip, limit, paginate } = parsePagination(req.query);
    const where = { interviewDate: { not: null } };
    
    if (req.user.role === 'student') {
      where.studentId = req.user.id;
    } else if (req.user.role === 'recruiter') {
      // Find jobs via recruiter profile
      const recruiterProfile = await prisma.recruiterProfile.findUnique({ where: { userId: req.user.id } });
      where.job = { recruiterId: recruiterProfile.id };
    }

    const [interviews, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          student: { select: { name: true, email: true } },
          job: { select: { title: true, companyName: true, location: true } }
        },
        orderBy: { interviewDate: 'asc' },
        skip,
        take: limit
      }),
      prisma.application.count({ where })
    ]);

    const formatted = interviews.map(i => ({ ...i, _id: i.id, student: { ...i.student, _id: i.studentId }, job: { ...i.job, _id: i.jobId } }));
    res.json(paginate(formatted, total));
  } catch (error) {
    next(error);
  }
};

const getStudentStats = async (req, res, next) => {
  try {
    const [totalApplied, underReview, shortlisted, selected, rejected, totalJobs] = await Promise.all([
      prisma.application.count({ where: { studentId: req.user.id } }),
      prisma.application.count({ where: { studentId: req.user.id, status: { in: ['Applied', 'Under Review'] } } }),
      prisma.application.count({ where: { studentId: req.user.id, status: 'Shortlisted' } }),
      prisma.application.count({ where: { studentId: req.user.id, status: { in: ['Selected', 'Accepted'] } } }),
      prisma.application.count({ where: { studentId: req.user.id, status: 'Rejected' } }),
      prisma.job.count({ where: { status: 'open', deadline: { gte: new Date() } } })
    ]);

    res.json({
      totalJobs,
      applied: totalApplied,
      underReview,
      shortlisted,
      selected,
      rejected
    });
  } catch (error) {
    next(error);
  }
};

const getRecruiterApplicants = async (req, res, next) => {
  try {
    const { skip, limit, paginate } = parsePagination(req.query);
    const recruiterProfile = await prisma.recruiterProfile.findUnique({ where: { userId: req.user.id } });
    const where = { job: { recruiterId: recruiterProfile.id } };
    
    const [applicants, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          student: { select: { name: true, email: true } },
          job: { select: { title: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.application.count({ where })
    ]);

    const formatted = applicants.map(a => ({ ...a, _id: a.id, student: { ...a.student, _id: a.studentId }, job: { ...a.job, _id: a.jobId } }));
    res.json(paginate(formatted, total));
  } catch (error) {
    next(error);
  }
};

// @desc    Respond to offer (Accept/Decline)
// @route   PATCH /api/applications/:id/offer
// @access  Private (Student)
const respondToOffer = async (req, res, next) => {
  const { response } = req.body; // 'Accepted' or 'Declined'
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (application.student.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    application.status = response;
    await application.save();

    // If accepted, update student status to 'Placed'
    if (response === 'Accepted') {
      const profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        profile.studentDetails.placementStatus = 'Placed';
        await profile.save();
      }
    }

    res.json(application);
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk update applications status
// @route   PATCH /api/applications/bulk-status
// @access  Private (Recruiter)
const bulkUpdateStatus = async (req, res, next) => {
  const { ids, status } = req.body;
  try {
    // Verify ownership: all applications must belong to the recruiter's own jobs
    if (req.user.role === 'recruiter') {
      const recruiterJobs = await Job.find({ recruiter: req.user.id }).select('_id');
      const recruiterJobIds = recruiterJobs.map(j => j._id.toString());

      const applications = await Application.find({ _id: { $in: ids } }).select('job');
      const unauthorized = applications.filter(app => !recruiterJobIds.includes(app.job.toString()));

      if (unauthorized.length > 0) {
        return res.status(403).json({ message: 'Not authorized to update applications for jobs you do not own' });
      }
    }

    const result = await Application.updateMany(
      { _id: { $in: ids } },
      { $set: { status } }
    );

    // Fetch updated applications to send notifications
    const applications = await Application.find({ _id: { $in: ids } }).populate('student', 'name email').populate('job', 'title');
    
    // Create notifications for all students
    const notifications = applications.map(app => ({
      user_id: app.student._id,
      title: 'Bulk Status Update',
      message: `Your application status for ${app.job.title} has been updated to ${status}.`,
      type: 'interview',
      link: `/student/applications`,
    }));
    await Notification.insertMany(notifications);

    res.json({ message: `${result.modifiedCount} applications updated`, result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get data for export
// @route   GET /api/applications/export/:jobId
// @access  Private (Recruiter)
const getExportData = async (req, res, next) => {
  try {
    const applications = await Application.find({ job: req.params.jobId, status: { $in: ['shortlisted', 'accepted', 'Selected'] } })
      .populate('student', 'name email')
      .populate('job', 'title');

    // Batch: fetch all profiles in one query
    const studentIds = applications.map(a => a.student._id);
    const profiles = await Profile.find({ user: { $in: studentIds } });
    const profileMap = new Map(profiles.map(p => [p.user.toString(), p]));

    const exportData = applications.map(app => {
      const profile = profileMap.get(app.student._id.toString());
      return {
        StudentName: app.student.name,
        Email: app.student.email,
        Course: profile?.studentDetails?.course,
        Branch: profile?.studentDetails?.branch,
        CGPA: profile?.studentDetails?.cgpa,
        Status: app.status,
        AppliedDate: app.applied_date
      };
    });

    res.json(exportData);
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  applyForJob, 
  getMyApplications, 
  getJobApplicants, 
  getAllApplications,
  updateApplicationStatus, 
  getScheduledInterviews,
  getStudentStats,
  getRecruiterApplicants,
  respondToOffer,
  bulkUpdateStatus,
  getExportData
};
