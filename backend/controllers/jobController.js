const Job = require('../models/Job');
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
    } else {
      res.status(401);
      res.json({ message: 'Not authorized' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createJob, getJobs, updateJobStatus };
