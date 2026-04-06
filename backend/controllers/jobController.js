const prisma = require('../utils/prisma');
const { parsePagination } = require('../utils/pagination');

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (Recruiter)
const createJob = async (req, res, next) => {
  try {
    const { title, description, companyName, location, salary, jobType, eligibility, deadline, screeningQuestions } = req.body;

    // Auto-fetch profile for company name if not provided
    const profile = await prisma.recruiterProfile.findUnique({ where: { userId: req.user.id } });
    
    const finalCompanyName = companyName || profile?.companyName || req.user.name || 'Your Organization';
    const finalLocation = location || profile?.location || 'Remote';

    // Generate human readable JOB-XXXX
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const jobId = `JOB-${random}`;

    const job = await prisma.job.create({
      data: {
        jobId,
        recruiterId: profile.id,
        title,
        description,
        companyName: finalCompanyName,
        location: finalLocation,
        salary,
        jobType: jobType.replace('-', '_'), // Compatibility with enum Full_time vs Full-time
        minCGPA: eligibility?.minCGPA || 0,
        branches: eligibility?.branches || [],
        deadline: new Date(deadline),
        screeningQuestions: screeningQuestions || []
      },
    });

    // Emit live socket event to all students
    const io = req.app.get('io');
    if (io) {
      io.emit('new_job', { title, companyName: finalCompanyName });
    }

    res.status(201).json({ ...job, _id: job.id });
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
    const { skip, limit, paginate } = parsePagination(req.query);
    
    let where = {
      status: 'open',
      deadline: { gte: new Date() }
    };

    if (jobType && jobType !== 'All Job Types') {
      where.jobType = jobType.replace('-', '_');
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { recruiter: { include: { user: { select: { name: true, email: true } } } } }
      }),
      prisma.job.count({ where })
    ]);

    const formattedJobs = jobs.map(job => ({ ...job, _id: job.id, recruiter: job.recruiter.user }));
    res.json(paginate(formattedJobs, total));
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs for admin
// @route   GET /api/jobs/admin
// @access  Private (Admin)
const adminGetJobs = async (req, res, next) => {
  try {
    const { skip, limit, paginate } = parsePagination(req.query);

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { 
          recruiter: { include: { user: { select: { name: true, email: true } } } },
          _count: { select: { applications: true } }
        }
      }),
      prisma.job.count()
    ]);
    
    const formattedJobs = jobs.map(job => ({
      ...job,
      _id: job.id,
      recruiter: job.recruiter.user,
      applicantCount: job._count.applications
    }));

    res.json(paginate(formattedJobs, total));
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Close a job
// @route   PATCH /api/jobs/:id/status
// @access  Private (Admin/Recruiter)
const updateJobStatus = async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { recruiter: true }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (req.user.role === 'admin' || job.recruiter.userId === req.user.id) {
      const updatedJob = await prisma.job.update({
        where: { id: req.params.id },
        data: { status: req.body.status }
      });
      res.json({ ...updatedJob, _id: updatedJob.id });
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
    const { skip, limit, paginate } = parsePagination(req.query);
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const { cgpa, branch } = profile;

    const where = {
      status: 'open',
      deadline: { gte: new Date() },
      minCGPA: { lte: cgpa || 0 },
      OR: [
        { branches: { has: branch } },
        { branches: { has: 'All' } },
        { branches: { isEmpty: true } }
      ]
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { recruiter: { include: { user: { select: { name: true, email: true } } } } }
      }),
      prisma.job.count({ where })
    ]);

    const formattedJobs = jobs.map(j => ({ ...j, _id: j.id, recruiter: j.recruiter.user }));
    res.json(paginate(formattedJobs, total));
  } catch (error) {
    next(error);
  }
};

const getRecruiterStats = async (req, res, next) => {
  try {
    const profile = await prisma.recruiterProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ message: 'Recruiter profile not found' });

    const [totalJobs, totalApplications, shortlistedCount, selectedCount] = await Promise.all([
      prisma.job.count({ where: { recruiterId: profile.id } }),
      prisma.application.count({ where: { job: { recruiterId: profile.id } } }),
      prisma.application.count({ where: { job: { recruiterId: profile.id }, status: 'Shortlisted' } }),
      prisma.application.count({ where: { job: { recruiterId: profile.id }, status: 'Accepted' } })
    ]);

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
    const { skip, limit, paginate } = parsePagination(req.query);
    const profile = await prisma.recruiterProfile.findUnique({ where: { userId: req.user.id } });
    
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where: { recruiterId: profile.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { _count: { select: { applications: true } } }
      }),
      prisma.job.count({ where: { recruiterId: profile.id } })
    ]);

    const jobsWithCounts = jobs.map(job => ({
      ...job,
      _id: job.id,
      applicantCount: job._count.applications
    }));

    res.json(paginate(jobsWithCounts, total));
  } catch (error) {
    next(error);
  }
};

const getJobById = async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { recruiter: { include: { user: { select: { name: true, email: true } } } } }
    });
    
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Increment views only if it's a student viewing
    if (req.user && req.user.role === 'student') {
      await prisma.job.update({
        where: { id: req.params.id },
        data: { viewsCount: { increment: 1 } }
      });
    }

    res.json({ ...job, _id: job.id, recruiter: job.recruiter.user });
  } catch (error) {
    next(error);
  }
};

const getJobAnalytics = async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { recruiter: true }
    });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.recruiter.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const [applicationCount, shortlistedCount, selectedCount] = await Promise.all([
      prisma.application.count({ where: { jobId: job.id } }),
      prisma.application.count({ where: { jobId: job.id, status: 'Shortlisted' } }),
      prisma.application.count({ where: { jobId: job.id, status: 'Accepted' } })
    ]);

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
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { recruiter: true }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiter.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedJob = await prisma.job.update({
      where: { id: req.params.id },
      data: {
        title: req.body.title,
        description: req.body.description,
        jobType: req.body.jobType ? req.body.jobType.replace('-', '_') : undefined,
        location: req.body.location,
        salary: req.body.salary,
        deadline: req.body.deadline ? new Date(req.body.deadline) : undefined,
        minCGPA: req.body.eligibility?.minCGPA,
        branches: req.body.eligibility?.branches,
        screeningQuestions: req.body.screeningQuestions
      }
    });

    res.json({ ...updatedJob, _id: updatedJob.id });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter/Admin)
const deleteJob = async (req, res, next) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { recruiter: true }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.recruiter.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await prisma.job.delete({ where: { id: req.params.id } });

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
