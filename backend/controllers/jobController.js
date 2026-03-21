const Job = require('../models/Job');
const Profile = require('../models/Profile');
const Notification = require('../models/Notification');

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (Recruiter)
const createJob = async (req, res) => {
  try {
    const { title, description, companyName, location, salary, jobType, eligibility, deadline } = req.body;

    const job = await Job.create({
      recruiter: req.user.id,
      title,
      description,
      companyName,
      location,
      salary,
      jobType,
      eligibility,
      deadline,
    });

    // Emit live socket event to all students
    const io = req.app.get('io');
    io.emit('new_job', { title, companyName });

    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all jobs (Active & Approved)
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ status: 'open', deadline: { $gte: new Date() } })
      .sort({ createdAt: -1 })
      .populate('recruiter', 'name email');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve/Close a job
// @route   PATCH /api/jobs/:id/status
// @access  Private (Admin/Recruiter)
const updateJobStatus = async (req, res) => {
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
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get matched jobs for student
// @route   GET /api/jobs/matched
// @access  Private (Student)
const getMatchedJobs = async (req, res) => {
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
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createJob, getJobs, updateJobStatus, getMatchedJobs };
