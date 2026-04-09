const prisma = require('../utils/prisma');
const sendEmail = require('../utils/emailUtils');
const { parsePagination } = require('../utils/pagination');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { createAuditLog } = require('./auditLogController');
const { checkEligibility } = require('../services/eligibilityService');

// @desc    Apply for a job
// @route   POST /api/applications/:jobId
// @access  Private (Student)
const applyForJob = async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.jobId } });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(400).json({ message: 'Profile not found' });

    if (!profile.academicVerified) {
      return res.status(403).json({ message: 'Academic verification required. Please contact the Placement Office for profile authentication.' });
    }

    // Check for existing application
    const existing = await prisma.application.findUnique({
      where: {
        studentId_jobId: {
          studentId: profile.id,
          jobId: req.params.jobId
        }
      }
    });

    if (existing) return res.status(400).json({ message: 'You have already applied for this job' });
    
    const settings = await prisma.systemSettings.findFirst() || {};
    const appCount = await prisma.application.count({ where: { studentId: profile.id } });
    
    const eligibility = checkEligibility(profile, job, appCount, settings);
    
    if (!eligibility.isEligible) {
      return res.status(400).json({ 
        message: 'You do not meet the eligibility requirements for this position.',
        reasons: eligibility.reasons,
        criteria: eligibility.criteria
      });
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
        studentId: profile.id,
        jobId: req.params.jobId,
        resume: finalResumeUrl,
        resumeId: resumeId || null,
        statusHistory: [
          { status: 'Applied', date: new Date().toISOString(), comment: 'Application submitted successfully.' }
        ]
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

// @desc    Check eligibility for a job
// @route   GET /api/applications/check-eligibility/:jobId
// @access  Private (Student)
const checkStudentEligibility = async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.jobId } });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(400).json({ message: 'Profile not found' });

    const settings = await prisma.systemSettings.findFirst() || {};
    const appCount = await prisma.application.count({ where: { studentId: profile.id } });

    const result = checkEligibility(profile, job, appCount, settings);
    res.json(result);
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
    
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const where = { studentId: profile.id };
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
    
    // Fetch existing application to preserve history
    const existingApp = await prisma.application.findUnique({
      where: { id: req.params.id },
      select: { statusHistory: true, status: true }
    });

    if (!existingApp) return res.status(404).json({ message: 'Application not found' });

    const newHistoryEntry = { 
      status, 
      date: new Date().toISOString(), 
      comment: feedback || `Status changed from ${existingApp.status} to ${status}` 
    };

    const updatedHistory = Array.isArray(existingApp.statusHistory) 
      ? [...existingApp.statusHistory, newHistoryEntry] 
      : [newHistoryEntry];

    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: {
        status,
        feedback,
        interviewDate: interviewDate ? new Date(interviewDate) : undefined,
        interviewLink,
        evaluation,
        statusHistory: updatedHistory
      },
      include: {
        student: { select: { id: true, userId: true, user: { select: { name: true, email: true } } } },
        job: { select: { title: true, companyName: true } }
      }
    });

    if (!application) {
      return res.status(404).json({ message: 'Application update failed' });
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
        email: application.student.user.email,
        subject: `Application Update: ${application.job?.title || 'Placement Portal'}`,
        template: 'status-update',
        context: {
          name: application.student.user.name,
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
        userId: application.student.userId,
        title: 'Application Status Updated',
        message: `Your application status for ${application.job?.title || 'a job'} has been updated to ${status}.`,
        type: 'INTERVIEW',
      }
    });

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(application.student.userId).emit('notification', {
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
      const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
      if (!profile) return res.status(404).json({ message: 'Student profile not found' });
      where.studentId = profile.id;
    } else if (req.user.role === 'recruiter') {
      const recruiterProfile = await prisma.recruiterProfile.findUnique({ where: { userId: req.user.id } });
      if (!recruiterProfile) return res.status(404).json({ message: 'Recruiter profile not found' });
      where.job = { recruiterId: recruiterProfile.id };
    }

    const [interviews, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          student: { include: { user: { select: { name: true, email: true } } } },
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
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const [totalApplied, underReview, shortlisted, selected, rejected, totalJobs] = await Promise.all([
      prisma.application.count({ where: { studentId: profile.id } }),
      prisma.application.count({ where: { studentId: profile.id, status: { in: ['Applied', 'Under_Review'] } } }),
      prisma.application.count({ where: { studentId: profile.id, status: 'Shortlisted' } }),
      prisma.application.count({ where: { studentId: profile.id, status: { in: ['Selected', 'Accepted'] } } }),
      prisma.application.count({ where: { studentId: profile.id, status: 'Rejected' } }),
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

// @desc    Respond to offer (Accept/Decline)
// @route   PATCH /api/applications/:id/offer
// @access  Private (Student)
const respondToOffer = async (req, res, next) => {
  const { response } = req.body; // 'Accepted' or 'Declined'
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { job: true }
    });

    if (!application) return res.status(404).json({ message: 'Application not found' });

    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile || application.studentId !== profile.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const newHistoryEntry = { status: response, date: new Date().toISOString(), comment: `Student ${response.toLowerCase()} the offer.` };
    const updatedHistory = Array.isArray(application.statusHistory) 
      ? [...application.statusHistory, newHistoryEntry] 
      : [newHistoryEntry];

    const updatedApp = await prisma.application.update({
      where: { id: req.params.id },
      data: { 
        status: response,
        statusHistory: updatedHistory
      }
    });

    // If accepted, update student status to 'Interned' or 'Placed' based on job type
    if (response === 'Accepted') {
      const isInternship = application.job.jobType === 'Internship';
      await prisma.studentProfile.update({
        where: { userId: req.user.id },
        data: { placementStatus: isInternship ? 'Interned' : 'Placed' }
      });
    }

    res.json({ ...updatedApp, _id: updatedApp.id });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload offer letter
// @route   PATCH /api/applications/:id/offer-letter
// @access  Private (Student/Recruiter)
const uploadOfferLetter = async (req, res, next) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { 
        job: true,
        student: { select: { email: true, name: true, id: true } }
      }
    });

    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Authorization check
    if (req.user.role === 'student' && application.studentId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to upload offer for this application' });
    }
    
    if (req.user.role === 'recruiter') {
      const recruiterProfile = await prisma.recruiterProfile.findUnique({ where: { userId: req.user.id } });
      if (application.job.recruiterId !== recruiterProfile.id) {
        return res.status(403).json({ message: 'Not authorized to upload offer for this job' });
      }
    }

    if (!req.file) return res.status(400).json({ message: 'Please upload a file' });

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'offer-letters',
      public_id: `offer_${application.id}_${Date.now()}`,
      resource_type: 'auto'
    });

    const newHistoryEntry = { 
      status: 'Selected', 
      date: new Date().toISOString(), 
      comment: `Offer letter uploaded by ${req.user.role}. Verification pending by TPO.` 
    };
    
    const updatedHistory = Array.isArray(application.statusHistory) 
      ? [...application.statusHistory, newHistoryEntry] 
      : [newHistoryEntry];

    const updatedApp = await prisma.application.update({
      where: { id: req.params.id },
      data: {
        offerLetter: result.secure_url,
        status: 'Selected', // Ensure status is Selected if offer is uploaded
        statusHistory: updatedHistory
      }
    });

    // Notify student if recruiter uploaded
    if (req.user.role === 'recruiter') {
      await prisma.notification.create({
        data: {
          userId: application.studentId,
          title: 'Offer Letter Received',
          message: `Congratulations! ${application.job.companyName} has uploaded your offer letter for ${application.job.title}.`,
          type: 'SUCCESS',
          link: '/student/applications'
        }
      });
    }

    // Create Audit Log
    await createAuditLog(
      req.user.id,
      'OFFER_LETTER_UPLOAD',
      'Application',
      application.id,
      `Offer letter uploaded for application ${application.id}`,
      req.ip
    );

    res.json({ ...updatedApp, _id: updatedApp.id });
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
    const recruiterProfile = await prisma.recruiterProfile.findUnique({ where: { userId: req.user.id } });
    
    // Verify ownership: all applications must belong to the recruiter's own jobs
    const applications = await prisma.application.findMany({
      where: { id: { in: ids } },
      include: { 
        job: true,
        student: { select: { userId: true } }
      }
    });

    const unauthorized = applications.filter(app => app.job.recruiterId !== recruiterProfile.id);

    if (unauthorized.length > 0 && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update some of these applications' });
    }

    const result = await prisma.application.updateMany({
      where: { id: { in: ids } },
      data: { status }
    });

    // Notify students
    for (const app of applications) {
      await prisma.notification.create({
        data: {
          userId: app.student.userId,
          title: 'Bulk Application Update',
          message: `Your application status for ${app.job?.title || 'a job'} has been updated to ${status}.`,
          type: 'INTERVIEW'
        }
      });
    }
    
    // Add student to include in findMany above to make this work

    res.json({ message: `${result.count} applications updated`, count: result.count });
  } catch (error) {
    next(error);
  }
};

// @desc    Get data for export
// @route   GET /api/applications/export/:jobId
// @access  Private (Recruiter)
const getExportData = async (req, res, next) => {
  try {
    const recruiterProfile = await prisma.recruiterProfile.findUnique({ where: { userId: req.user.id } });
    const job = await prisma.job.findUnique({ where: { id: req.params.jobId } });

    if (req.user.role !== 'admin' && job.recruiterId !== recruiterProfile.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const applications = await prisma.application.findMany({
      where: { 
        jobId: req.params.jobId, 
        status: { in: ['Selected', 'Accepted', 'Shortlisted'] } 
      },
      include: {
        student: { select: { name: true, email: true } }
      }
    });

    const studentIds = applications.map(a => a.studentId);
    const profiles = await prisma.studentProfile.findMany({
      where: { userId: { in: studentIds } }
    });
    const profileMap = new Map(profiles.map(p => [p.userId, p]));

    const exportData = applications.map(app => {
      const profile = profileMap.get(app.studentId);
      return {
        StudentName: app.student.name,
        Email: app.student.email,
        Course: profile?.course || 'N/A',
        Branch: profile?.branch || 'N/A',
        CGPA: profile?.cgpa || 0,
        Status: app.status,
        AppliedDate: app.createdAt
      };
    });

    res.json(exportData);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applicants for a recruiter's jobs
// @route   GET /api/applications/recruiter
// @access  Private (Recruiter)
const getRecruiterApplicants = async (req, res, next) => {
  try {
    const recruiterProfile = await prisma.recruiterProfile.findUnique({ where: { userId: req.user.id } });
    if (!recruiterProfile) return res.status(404).json({ message: 'Recruiter profile not found' });

    const { skip, limit, paginate } = parsePagination(req.query);
    const where = { job: { recruiterId: recruiterProfile.id } };

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          student: { select: { name: true, email: true, profilePhoto: true } },
          job: { select: { title: true, companyName: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.application.count({ where })
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

module.exports = { 
  applyForJob, 
  checkStudentEligibility,
  getMyApplications, 
  getJobApplicants, 
  getAllApplications,
  updateApplicationStatus, 
  getScheduledInterviews,
  getStudentStats,
  getRecruiterApplicants,
  respondToOffer,
  uploadOfferLetter,
  bulkUpdateStatus,
  getExportData
};
