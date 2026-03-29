const Job = require('../models/Job');
const Profile = require('../models/Profile');
const Notification = require('../models/Notification');
const Application = require('../models/Application');
const { createAuditLog } = require('./auditLogController');

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (Recruiter)
const createJob = async (req, res, next) => {
  try {
    const { title, description, companyName, location, salary, jobType, eligibility, deadline } = req.body;

    // Auto-fetch profile for company name if not provided
    const profile = await Profile.findOne({ user: req.user.id });
    
    // Check recruiter/company information
    const finalCompanyName = companyName || profile?.recruiterDetails?.companyName || req.user.name || 'Your Organization';
    const finalLocation = location || profile?.recruiterDetails?.location || 'Remote';

    const job = await Job.create({
      recruiter: req.user.id,
      title,
      description,
      companyName: finalCompanyName,
      location: finalLocation,
      salary,
      jobType,
      eligibility,
      deadline,
    });

    // Audit Log
    await createAuditLog(
      req.user.id,
      'CREATE_JOB',
      'Job',
      job._id,
      `Created job: ${title} at ${finalCompanyName}`,
      req.ip
    );

    // Emit live socket event to all students
    const io = req.app.get('io');
    io.emit('new_job', { title, companyName: finalCompanyName });

    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs (Active & Approved)
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    const { jobType } = req.query;
    let query = { status: 'open', deadline: { $gte: new Date() } };

    if (jobType && jobType !== 'All Job Types') {
      query.jobType = jobType;
    }

    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .populate('recruiter', 'name email');
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs for admin
// @route   GET /api/jobs/admin
// @access  Private (Admin)
const adminGetJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({})
      .sort({ createdAt: -1 })
      .populate('recruiter', 'name email');
    
    // Get applicant counts for each job
    const jobsWithCounts = await Promise.all(jobs.map(async (job) => {
      const applicantCount = await Application.countDocuments({ job: job._id });
      return { ...job.toObject(), applicantCount };
    }));

    res.json(jobsWithCounts);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Close a job
// @route   PATCH /api/jobs/:id/status
// @access  Private (Admin/Recruiter)
const updateJobStatus = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404);
      return res.json({ message: 'Job not found' });
    }

    // Role check
    if (req.user.role === 'admin' || job.recruiter.toString() === req.user.id) {
      job.status = req.body.status || job.status;
      const updatedJob = await job.save();
      res.json(updatedJob);
    } else {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }
  } catch (error) {
    next(error);
  }
};
// @desc    Get matched jobs for student
// @route   GET /api/jobs/matched
// @access  Private (Student)
const getMatchedJobs = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      res.status(404);
      return res.json({ message: 'Profile not found' });
    }

    const { cgpa, branch } = profile.studentDetails;

    // Filter jobs by CGPA and branch
    const jobs = await Job.find({
      status: 'open',
      deadline: { $gte: new Date() },
      'eligibility.minCGPA': { $lte: cgpa || 0 },
      'eligibility.branches': { $in: [branch, 'All', ''] } // Match branch or "All"
    })
    .sort({ createdAt: -1 })
    .populate('recruiter', 'name email');

    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

const getRecruiterStats = async (req, res, next) => {
  try {
    const totalJobs = await Job.countDocuments({ recruiter: req.user.id });
    const jobs = await Job.find({ recruiter: req.user.id });
    const jobIds = jobs.map(job => job._id);

    const totalApplications = await Application.countDocuments({ job: { $in: jobIds } });
    const shortlistedCount = await Application.countDocuments({ job: { $in: jobIds }, status: 'Shortlisted' });
    const selectedCount = await Application.countDocuments({ job: { $in: jobIds }, status: 'Accepted' });

    res.json({
      totalJobs,
      totalApplications,
      shortlisted: shortlistedCount,
      selected: selectedCount
    });
  } catch (error) {
    next(error);
  }
};

const getRecruiterJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id }).sort({ createdAt: -1 });
    const jobsWithCounts = await Promise.all(jobs.map(async (job) => {
      const applicantCount = await Application.countDocuments({ job: job._id });
      return { ...job._doc, applicantCount };
    }));
    res.json(jobsWithCounts);
  } catch (error) {
    next(error);
  }
};

const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiter', 'name email');
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Increment views only if it's a student viewing
    if (req.user && req.user.role === 'student') {
      job.viewsCount += 1;
      await job.save();
    }

    res.json(job);
  } catch (error) {
    next(error);
  }
};

const getJobAnalytics = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const applicationCount = await Application.countDocuments({ job: job._id });
    const shortlistedCount = await Application.countDocuments({ job: job._id, status: 'Shortlisted' });
    const selectedCount = await Application.countDocuments({ job: job._id, status: 'Accepted' });

    res.json({
      views: job.viewsCount,
      applications: applicationCount,
      shortlisted: shortlistedCount,
      selected: selectedCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter/Admin)
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Authorization check
    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const {
      title,
      role,
      jobType,
      description,
      skills,
      eligibility,
      location,
      salary,
      deadline,
      openings,
      screeningQuestions
    } = req.body;

    // Update fields
    job.title = title || job.title;
    job.role = role || job.role;
    job.jobType = jobType || job.jobType;
    job.description = description || job.description;
    job.skills = skills || job.skills;
    job.eligibility = eligibility || job.eligibility;
    job.location = location || job.location;
    job.salary = salary || job.salary;
    job.deadline = deadline || job.deadline;
    job.openings = openings || job.openings;
    job.screeningQuestions = screeningQuestions || job.screeningQuestions;

    const updatedJob = await job.save();

    // Audit Log
    await createAuditLog(
      req.user.id,
      'UPDATE_JOB',
      'Job',
      job._id,
      `Updated job: ${job.title}`,
      req.ip
    );

    res.json(updatedJob);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter/Admin)
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check ownership or admin
    if (job.recruiter.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Delete associated applications
    await Application.deleteMany({ job: job._id });
    
    await Job.findByIdAndDelete(req.params.id);

    // Audit Log
    await createAuditLog(
      req.user.id,
      'DELETE_JOB',
      'Job',
      job._id,
      `Deleted job: ${job.title}`,
      req.ip
    );

    res.json({ message: 'Job and associated applications removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  createJob, 
  getJobs, 
  adminGetJobs, 
  updateJobStatus, 
  getMatchedJobs, 
  getRecruiterStats, 
  getRecruiterJobs, 
  updateJob,
  deleteJob, 
  getJobById, 
  getJobAnalytics 
};
