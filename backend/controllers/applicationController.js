const Application = require('../models/Application');
const Job = require('../models/Job');
const Profile = require('../models/Profile');
const Notification = require('../models/Notification');

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
    res.json(applicants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update application status
// @route   PATCH /api/applications/:id/status
// @access  Private (Recruiter)
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, feedback, interviewDate, interviewLink } = req.body;
    const application = await Application.findById(req.params.id).populate('student', 'name email');

    if (!application) {
      res.status(404);
      return res.json({ message: 'Application not found' });
    }

    application.status = status || application.status;
    application.feedback = feedback || application.feedback;
    application.interviewDate = interviewDate || application.interviewDate;
    application.interviewLink = interviewLink || application.interviewLink;

    const updatedApplication = await application.save();

    // Create notification for student
    await Notification.create({
      recipient: application.student._id,
      message: `Your application status for ${application.job.title || 'a job'} has been updated to ${status}.`,
      type: 'application',
      link: `/applications/${application._id}`,
    });

    res.json(updatedApplication);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { applyForJob, getMyApplications, getJobApplicants, updateApplicationStatus };
