const prisma = require('../utils/prisma');
const { parsePagination } = require('../utils/pagination');
const { createAuditLog } = require('./auditLogController');

/**
 * Intelligent Match Scoring Logic (Non-AI)
 * Weights: Academic (30), Skills (50), Experience (20)
 */
const calculateMatchScore = (student, job) => {
  if (!student) return { score: 0, breakdown: null };

  let academicScore = 0;
  let skillScore = 0;
  let experienceScore = 0;

  // 1. Academic (30 pts)
  const cgpa = student.cgpa || 0;
  const minCGPA = job.minCGPA || 0;
  if (cgpa >= minCGPA) {
    // Proportional score up to 30
    academicScore = 15 + ((cgpa / 10) * 15);
  } else {
    // Penalty if below minimum but still give scale points
    academicScore = (cgpa / 10) * 10;
  }

  // 2. Skills (50 pts)
  const studentSkills = (student.skills || []).map(s => s.trim().toLowerCase());
  const requiredSkills = (job.requiredSkills || []).map(s => s.trim().toLowerCase());
  
  if (requiredSkills.length > 0) {
    const matched = requiredSkills.filter(s => studentSkills.includes(s));
    skillScore = (matched.length / requiredSkills.length) * 50;
  } else {
    // If no specific skills required, reward diversified skillsets
    skillScore = studentSkills.length >= 5 ? 50 : studentSkills.length * 10;
  }

  // 3. Experience/Projects (20 pts)
  // Assuming student.projects is an array
  const projectsCount = Array.isArray(student.projects) ? student.projects.length : 0;
  experienceScore = Math.min(projectsCount * 5, 20);

  const total = Math.min(Math.round(academicScore + skillScore + experienceScore), 100);

  return {
    score: total,
    breakdown: {
      academic: Math.round(academicScore),
      skills: Math.round(skillScore),
      experience: Math.round(experienceScore)
    },
    missingSkills: requiredSkills.filter(s => !studentSkills.includes(s))
  };
};

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (Recruiter)
const createJob = async (req, res, next) => {
  try {
    const { title, description, companyName, location, salary, jobType, eligibility, deadline, screeningQuestions, requiredSkills, selectionProcess } = req.body;

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
        min10th: eligibility?.min10th || 0,
        min12th: eligibility?.min12th || 0,
        maxBacklogs: eligibility?.maxBacklogs || 0,
        targetCourses: eligibility?.targetCourses || [],
        branches: eligibility?.branches || [],
        genderPreference: eligibility?.genderPreference || 'all',
        requiredSkills: requiredSkills || [],
        deadline: new Date(deadline),
        screeningQuestions: screeningQuestions || [],
        selectionProcess: selectionProcess || ["Applied", "Technical Round", "HR Round", "Selected"]
      },
    });

    // Emit live socket event to all students
    const io = req.app.get('io');
    if (io) {
      io.emit('new_job', { title, companyName: finalCompanyName });
    }

    await createAuditLog({
      userId: req.user.id,
      action: 'Job Posted',
      type: 'JOB',
      targetId: job.id,
      targetType: 'Job',
      details: { title, company: finalCompanyName }
    });

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

    // Fetch student profile first if student for watchlist and match scoring
    let studentProfile = null;
    if (req.user?.role === 'student') {
      studentProfile = await prisma.studentProfile.findUnique({ 
        where: { userId: req.user.id }
      });
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { 
          recruiter: { include: { user: { select: { name: true, email: true } } } },
          watchlist: studentProfile ? { where: { studentId: studentProfile.id } } : false
        }
      }),
      prisma.job.count({ where })
    ]);

    const formattedJobs = jobs.map(job => {
      const match = calculateMatchScore(studentProfile, job);
      return { 
        ...job, 
        _id: job.id, 
        recruiter: job.recruiter.user,
        matchScore: match.score,
        isWatched: job.watchlist?.length > 0,
        matchBreakdown: match.breakdown,
        missingSkills: match.missingSkills
      };
    });

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
      await createAuditLog({
        userId: req.user.id,
        action: `Job Status Updated to ${req.body.status}`,
        type: 'JOB',
        targetId: job.id,
        targetType: 'Job',
        details: { title: job.title, newStatus: req.body.status }
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

    const formattedJobs = jobs.map(j => {
      const match = calculateMatchScore(profile, j);
      return { 
        ...j, 
        _id: j.id, 
        recruiter: j.recruiter.user,
        matchScore: match.score,
        matchBreakdown: match.breakdown,
        missingSkills: match.missingSkills
      };
    });
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

    // If student, calculate match
    let match = { score: 0, breakdown: null };
    if (req.user?.role === 'student') {
      const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
      match = calculateMatchScore(profile, job);
    }

    res.json({ 
      ...job, 
      _id: job.id, 
      recruiter: job.recruiter.user,
      matchScore: match.score,
      matchBreakdown: match.breakdown,
      missingSkills: match.missingSkills
    });
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
        min10th: req.body.eligibility?.min10th,
        min12th: req.body.eligibility?.min12th,
        maxBacklogs: req.body.eligibility?.maxBacklogs,
        targetCourses: req.body.eligibility?.targetCourses,
        branches: req.body.eligibility?.branches,
        genderPreference: req.body.eligibility?.genderPreference,
        requiredSkills: req.body.requiredSkills,
        screeningQuestions: req.body.screeningQuestions,
        selectionProcess: req.body.selectionProcess
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

    await createAuditLog({
      userId: req.user.id,
      action: 'Job Deleted',
      type: 'JOB',
      targetId: req.params.id,
      targetType: 'Job',
      details: { title: job.title, company: job.companyName }
    });

    res.json({ message: 'Job and associated applications removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle save/unsave for a job
// @route   POST /api/jobs/watchlist/:id
// @access  Private (Student)
const toggleWatchlist = async (req, res, next) => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const existing = await prisma.watchlist.findUnique({
      where: {
        studentId_jobId: {
          studentId: student.id,
          jobId: req.params.id
        }
      }
    });

    if (existing) {
      await prisma.watchlist.delete({ where: { id: existing.id } });
      res.json({ saved: false });
    } else {
      await prisma.watchlist.create({
        data: {
          studentId: student.id,
          jobId: req.params.id
        }
      });
      await createAuditLog({
        userId: req.user.id,
        action: 'Job Saved to Watchlist',
        type: 'JOB',
        targetId: req.params.id,
        targetType: 'Job'
      });
      res.json({ saved: true });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get student watchlist
// @route   GET /api/jobs/watchlist
// @access  Private (Student)
const getWatchlist = async (req, res, next) => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const saved = await prisma.watchlist.findMany({
      where: { studentId: student.id },
      include: {
        job: {
          include: { 
            recruiter: { include: { user: { select: { name: true, email: true } } } },
            watchlist: { where: { studentId: student.id } }
          }
        }
      }
    });

    const formattedJobs = saved.map(item => {
      const job = item.job;
      const match = calculateMatchScore(student, job);
      return {
        ...job,
        _id: job.id,
        recruiter: job.recruiter.user,
        matchScore: match.score,
        isWatched: true,
        matchBreakdown: match.breakdown,
        missingSkills: match.missingSkills
      };
    });

    res.json(formattedJobs);
  } catch (error) {
    next(error);
  }
};

const getRecruiterROI = async (req, res, next) => {
  try {
    const profile = await prisma.recruiterProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        jobs: {
          include: {
            applications: {
              include: {
                student: {
                  select: { branch: true, course: true, cgpa: true, skills: true, projects: true }
                }
              }
            }
          }
        }
      }
    });

    if (!profile) return res.status(404).json({ message: 'Recruiter profile not found' });

    let totalViews = 0;
    let totalApplications = 0;
    let shortlisted = 0;
    let selected = 0;
    let accepted = 0;
    let placed = 0;
    let totalMatchScore = 0;
    let applicationsWithScore = 0;

    const timeToFillSamples = [];
    const branchSuccess = {};
    const jobPerformance = [];

    profile.jobs.forEach(job => {
      totalViews += job.viewsCount;
      const jobApps = job.applications;
      totalApplications += jobApps.length;

      let jobSelected = 0;
      let firstSelectionDate = null;

      jobApps.forEach(app => {
        if (['Shortlisted', 'Scheduled', 'Selected', 'Accepted', 'Placed'].includes(app.status)) shortlisted++;
        if (['Selected', 'Accepted', 'Placed'].includes(app.status)) {
          selected++;
          jobSelected++;
          
          // For branch distribution, we only care about successful outcomes
          const branch = app.student.branch || 'Unknown';
          branchSuccess[branch] = (branchSuccess[branch] || 0) + 1;

          if (!firstSelectionDate || app.createdAt < firstSelectionDate) {
            firstSelectionDate = app.createdAt;
          }
        }
        if (app.status === 'Accepted') accepted++;
        if (app.status === 'Placed') placed++;

        // Calculate match score for ROI quality metric
        const match = calculateMatchScore(app.student, job);
        totalMatchScore += match.score;
        applicationsWithScore++;
      });

      if (firstSelectionDate) {
        const days = Math.ceil((new Date(firstSelectionDate) - new Date(job.createdAt)) / (1000 * 60 * 60 * 24));
        timeToFillSamples.push(days);
      }

      jobPerformance.push({
        id: job.id,
        title: job.title,
        applications: jobApps.length,
        selected: jobSelected,
        conversionRate: jobApps.length > 0 ? ((jobSelected / jobApps.length) * 100).toFixed(1) : 0,
        timeToFill: firstSelectionDate ? Math.ceil((new Date(firstSelectionDate) - new Date(job.createdAt)) / (1000 * 60 * 60 * 24)) : null
      });
    });

    const avgTimeToFill = timeToFillSamples.length > 0 
      ? (timeToFillSamples.reduce((a, b) => a + b, 0) / timeToFillSamples.length).toFixed(1)
      : null;

    const avgMatchScore = applicationsWithScore > 0
      ? (totalMatchScore / applicationsWithScore).toFixed(1)
      : 0;

    res.json({
      kpis: {
        totalViews,
        totalApplications,
        shortlisted,
        selected,
        accepted,
        placed,
        avgTimeToFill,
        avgMatchScore,
        offerAcceptanceRate: selected > 0 ? ((accepted / selected) * 100).toFixed(1) : 0,
      },
      funnel: [
        { name: 'Views', value: totalViews },
        { name: 'Applications', value: totalApplications },
        { name: 'Shortlisted', value: shortlisted },
        { name: 'Selected', value: selected },
        { name: 'Accepted', value: accepted },
        { name: 'Placed', value: placed },
      ],
      branchDistribution: Object.entries(branchSuccess).map(([name, value]) => ({ name, value })),
      jobPerformance: jobPerformance.sort((a, b) => b.selected - a.selected).slice(0, 5)
    });
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
  getJobAnalytics,
  getRecruiterROI,
  toggleWatchlist,
  getWatchlist
};
