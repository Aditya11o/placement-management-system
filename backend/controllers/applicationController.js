const Application = require('../models/Application');
const Job = require('../models/Job');
const Profile = require('../models/Profile');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/emailUtils');

// @desc    Apply for a job
// @route   POST /api/applications/:jobId
// @access  Private (Student)
const applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      res.status(404);
      return res.json({ message: 'Job not found' });
    }

    // Check if profile exists and has resume
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile || !profile.studentDetails.resume) {
      res.status(400);
      return res.json({ message: 'Please complete your profile and upload a resume before applying' });
    }

    // Eligibility check (Basic)
    if (profile.studentDetails.cgpa < job.eligibility.minCGPA) {
       res.status(400);
       return res.json({ message: `Insufficient CGPA. Minimum required is ${job.eligibility.minCGPA}` });
    }

    const application = await Application.create({
      student: req.user.id,
      job: req.params.jobId,
      resume: profile.studentDetails.resume,
    });

    // Increment job application count
    job.applicationsCount += 1;
    await job.save();

    res.status(201).json(application);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'You have already applied for this job' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Get my applications
// @route   GET /api/applications/my
// @access  Private (Student)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate('job', 'title companyName status deadline')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get applicants for a job
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiter/Admin)
const getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      res.status(404);
      return res.json({ message: 'Job not found' });
    }

    // Auth check
    if (req.user.role !== 'admin' && job.recruiter.toString() !== req.user.id) {
      res.status(401);
      return res.json({ message: 'Not authorized' });
    }

    const applicants = await Application.find({ job: req.params.jobId })
      .populate('student', 'name email')
      .sort({ createdAt: -1 });

    const enrichedApplicants = await Promise.all(applicants.map(async (app) => {
      const profile = await Profile.findOne({ user: app.student._id });
      return {
        ...app.toObject(),
        studentProfile: profile
      };
    }));

    res.json(enrichedApplicants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all applications for admin
// @route   GET /api/applications/admin
// @access  Private (Admin)
const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find({})
      .populate('student', 'name email')
      .populate('job', 'title companyName')
      .sort({ createdAt: -1 });

    // Fetch profile data for each application
    const enrichedApplications = await Promise.all(applications.map(async (app) => {
      const profile = await Profile.findOne({ user: app.student._id });
      return {
        ...app.toObject(),
        studentProfile: profile
      };
    }));

    res.json(enrichedApplications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update application status
// @route   PATCH /api/applications/:id/status
// @access  Private (Recruiter)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, feedback, interviewDate, interviewLink, evaluation } = req.body;
    const application = await Application.findById(req.params.id).populate('student', 'name email');

    if (!application) {
      res.status(404);
      return res.json({ message: 'Application not found' });
    }

    application.status = status || application.status;
    application.feedback = feedback || application.feedback;
    application.interviewDate = interviewDate || application.interviewDate;
    application.interviewLink = interviewLink || application.interviewLink;
    application.evaluation = evaluation || application.evaluation;

    const updatedApplication = await application.save();

    // Send email to student
    try {
      await sendEmail({
        email: application.student.email,
        subject: `Application Status Updated - ${application.job?.title || 'Placement Portal'}`,
        message: `<h3>Hello ${application.student.name},</h3>
                 <p>Your application status for <strong>${application.job?.title || 'the job'}</strong> has been updated to <strong>${status}</strong>.</p>
                 ${feedback ? `<p><strong>Feedback:</strong> ${feedback}</p>` : ''}
                 ${interviewDate ? `<p><strong>Interview Date:</strong> ${new Date(interviewDate).toLocaleString()}</p>` : ''}
                 ${interviewLink ? `<p><strong>Interview Link:</strong> <a href="${interviewLink}">${interviewLink}</a></p>` : ''}
                 <p>Login to the portal for more details.</p>`,
      });
    } catch (err) {
      console.error('Email failed to send:', err);
    }

    // Create notification for student
    await Notification.create({
      recipient: application.student._id,
      message: `Your application status for ${application.job.title || 'a job'} has been updated to ${status}.`,
      type: 'application',
      link: `/applications/${application._id}`,
    });

    // Emit live socket event
    const io = req.app.get('io');
    io.to(application.student._id.toString()).emit('notification', {
      message: `Your application status for ${application.job.title || 'a job'} has been updated to ${status}.`,
      type: 'application',
    });

    res.json(updatedApplication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get scheduled interviews for current user
// @route   GET /api/applications/interviews
// @access  Private
const getScheduledInterviews = async (req, res) => {
  try {
    let query = { interviewDate: { $exists: true, $ne: null } };
    
    if (req.user.role === 'student') {
      query.student = req.user.id;
    } else if (req.user.role === 'recruiter') {
      const jobs = await Job.find({ recruiter: req.user.id });
      const jobIds = jobs.map(j => j._id);
      query.job = { $in: jobIds };
    }

    const interviews = await Application.find(query)
      .populate('student', 'name email')
      .populate('job', 'title companyName location')
      .sort({ interviewDate: 1 });

    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentStats = async (req, res) => {
  try {
    const totalApplied = await Application.countDocuments({ student: req.user.id });
    const underReview = await Application.countDocuments({ student: req.user.id, status: 'pending' });
    const shortlisted = await Application.countDocuments({ student: req.user.id, status: 'shortlisted' });
    const selected = await Application.countDocuments({ student: req.user.id, status: 'accepted' });
    const rejected = await Application.countDocuments({ student: req.user.id, status: 'rejected' });
    
    // For total jobs, we can count all open jobs
    const totalJobs = await Job.countDocuments({ status: 'Open', last_date: { $gte: new Date() } });

    res.json({
      totalJobs,
      applied: totalApplied,
      underReview,
      shortlisted,
      selected,
      rejected
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRecruiterApplicants = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id });
    const jobIds = jobs.map(j => j._id);
    
    const applicants = await Application.find({ job: { $in: jobIds } })
      .populate('student', 'name email')
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(applicants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Respond to offer (Accept/Decline)
// @route   PATCH /api/applications/:id/offer
// @access  Private (Student)
const respondToOffer = async (req, res) => {
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
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk update applications status
// @route   PATCH /api/applications/bulk-status
// @access  Private (Recruiter)
const bulkUpdateStatus = async (req, res) => {
  const { ids, status } = req.body;
  try {
    const result = await Application.updateMany(
      { _id: { $in: ids } },
      { $set: { status } }
    );

    // Fetch updated applications to send notifications (simplified)
    const applications = await Application.find({ _id: { $in: ids } }).populate('student', 'name email').populate('job', 'title');
    
    // Create notifications for all students
    const notifications = applications.map(app => ({
      recipient: app.student._id,
      message: `Your application status for ${app.job.title} has been updated to ${status}.`,
      type: 'application',
      link: `/applications/${app._id}`,
    }));
    await Notification.insertMany(notifications);

    res.json({ message: `${result.modifiedCount} applications updated`, result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get data for export
// @route   GET /api/applications/export/:jobId
// @access  Private (Recruiter)
const getExportData = async (req, res) => {
  try {
    const applications = await Application.find({ job: req.params.jobId, status: { $in: ['shortlisted', 'accepted', 'Selected'] } })
      .populate('student', 'name email')
      .populate('job', 'title');

    // Fetch full student profiles
    const exportData = await Promise.all(applications.map(async (app) => {
      const profile = await Profile.findOne({ user: app.student._id });
      return {
        StudentName: app.student.name,
        Email: app.student.email,
        Course: profile?.studentDetails.course,
        Branch: profile?.studentDetails.branch,
        CGPA: profile?.studentDetails.cgpa,
        Status: app.status,
        AppliedDate: app.applied_date
      };
    }));

    res.json(exportData);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
