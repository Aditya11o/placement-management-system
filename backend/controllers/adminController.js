const prisma = require('../utils/prisma');
const sendEmail = require('../utils/emailUtils');
const { createAuditLog } = require('./auditLogController');
const { parsePagination } = require('../utils/pagination');

// @desc    Get all pending skill verifications
// @route   GET /api/admin/verifications
// @access  Private (Admin)
const getPendingVerifications = async (req, res, next) => {
  try {
    const verifications = await prisma.skillVerification.findMany({
      where: { status: 'Pending' },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } }
          }
        }
      }
    });

    const formatted = verifications.map(v => ({
      id: v.id,
      _id: v.id,
      userId: v.student.userId,
      userName: v.student.user.name,
      userEmail: v.student.user.email,
      skill: v.skill,
      certificateUrl: v.certificateUrl,
      appliedAt: v.createdAt
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk verify student skills
// @route   PATCH /api/admin/verifications/bulk
// @access  Private (Admin)
const bulkVerifySkills = async (req, res, next) => {
  const { requests, status } = req.body; // requests: [{ profileId, verificationId }]
  try {
    await prisma.skillVerification.updateMany({
      where: { id: { in: requests.map(r => r.verificationId) } },
      data: { status }
    });
    const updatedCount = requests.length;

    // Audit Log
    await createAuditLog(
      req.user.id,
      'BULK_VERIFY_SKILLS',
      'Profile',
      null,
      `Bulk ${status.toLowerCase()}ed ${updatedCount} skill verifications`,
      req.ip
    );

    res.json({ message: `Successfully ${status.toLowerCase()}ed ${updatedCount} skills` });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify student skill
// @route   PATCH /api/admin/verifications/:profileId/:verificationId
// @access  Private (Admin)
const verifySkill = async (req, res, next) => {
  const { status } = req.body; // 'Verified' or 'Rejected'
  try {
    const verification = await prisma.skillVerification.findUnique({
      where: { id: req.params.verificationId }
    });
    if (!verification) return res.status(404).json({ message: 'Verification request not found' });

    await prisma.skillVerification.update({
      where: { id: req.params.verificationId },
      data: { status }
    });

    // Audit Log
    await createAuditLog(
      req.user.id,
      'VERIFY_SKILL',
      'SkillVerification',
      req.params.verificationId,
      `Verified skill: ${verification.skill} as ${status}`,
      req.ip
    );

    res.json({ message: `Skill ${status.toLowerCase()} successfully` });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getStats = async (req, res, next) => {
  try {
    const whereClause = req.adminLevel === 'DEPT_ADMIN' ? {
      studentProfile: { branch: req.adminScope }
    } : {};
    
    const [totalStudents, totalRecruiters, totalJobs, totalApplications, placedStudents, totalInterviews] = await Promise.all([
      prisma.user.count({ where: { role: 'student', ...whereClause } }),
      prisma.user.count({ where: { role: 'recruiter' } }),
      prisma.job.count(),
      prisma.application.count({
        where: req.adminLevel === 'DEPT_ADMIN' ? { student: { branch: req.adminScope } } : {}
      }),
      prisma.application.count({ 
        where: req.adminLevel === 'DEPT_ADMIN' 
          ? { status: 'Selected', student: { branch: req.adminScope } } 
          : { status: 'Selected' } 
      }),
      prisma.application.count({ 
        where: req.adminLevel === 'DEPT_ADMIN'
          ? { NOT: { interviewDate: null }, student: { branch: req.adminScope } }
          : { NOT: { interviewDate: null } }
      })
    ]);

    const appBreakdown = await prisma.application.groupBy({
      by: ['status'],
      _count: { _all: true }
    });

    const jobsPerCompany = await prisma.job.groupBy({
      by: ['companyName'],
      _count: { _all: true },
      orderBy: { _count: { companyName: 'desc' } },
      take: 5
    });

    res.json({
      totalStudents,
      totalRecruiters,
      totalJobs,
      totalApplications,
      placedStudents,
      totalInterviews,
      appBreakdown: appBreakdown.map(b => ({ _id: b.status, count: b._count._all })),
      jobsPerCompany: jobsPerCompany.map(c => ({ _id: c.companyName, count: c._count._all }))
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { skip, limit, paginate } = parsePagination(req.query);

    const filter = req.adminLevel === 'DEPT_ADMIN' ? {
       role: 'student',
       studentProfile: { branch: req.adminScope }
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: filter,
        skip,
        take: limit > 0 ? limit : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          studentProfile: {
            select: {
              id: true, course: true, branch: true, cgpa: true, skills: true,
              academicVerified: true, profileCompletion: true, resumePath: true
            }
          },
          recruiterProfile: true
        }
      }),
      prisma.user.count({ where: filter })
    ]);

    const formatted = users.map(user => {
      let profile = null;
      if (user.role === 'student' && user.studentProfile) {
        profile = { ...user.studentProfile, _id: user.studentProfile.id };
      } else if (user.role === 'recruiter' && user.recruiterProfile) {
        profile = { ...user.recruiterProfile, _id: user.recruiterProfile.id };
      }
      return { ...user, _id: user.id, profile };
    });

    res.json(paginate(formatted, total));
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pending recruiters
// @route   GET /api/admin/pending-recruiters
// @access  Private (Admin)
const getPendingRecruiters = async (req, res, next) => {
  try {
    const recruiters = await prisma.user.findMany({
      where: { role: 'recruiter', status: 'pending' },
      select: {
        id: true, name: true, email: true, status: true, isVerified: true,
        recruiterProfile: true
      }
    });
    res.json(recruiters.map(r => ({ ...r, _id: r.id })));
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject recruiter account
// @route   PATCH /api/admin/recruiters/:id/approve
// @access  Private (Admin)
const approveRecruiter = async (req, res, next) => {
  const { status } = req.body; // 'active' or 'blacklisted'
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user || user.role !== 'recruiter') {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        status: status,
        isVerified: status === 'active'
      }
    });

    // Audit Log
    await createAuditLog(
      req.user.id,
      'APPROVE_RECRUITER',
      'User',
      updatedUser.id,
      `Recruiter ${updatedUser.email} status set to ${status}`,
      req.ip
    );

    // Send notification email
    // Notify recruiter
    try {
      await sendEmail({
        email: user.email,
        subject: `Recruiter Account ${status === 'active' ? 'Approved' : 'Approved'}`,
        template: 'status-update',
        context: {
          name: user.name,
          jobTitle: 'Recruiter Dashboard',
          companyName: 'Placement Cell',
          status: status === 'active' ? 'Approved' : 'Rejected',
          statusColor: status === 'active' ? '#10b981' : '#ef4444',
          dashboardUrl: 'http://localhost:5173/login'
        }
      });
    } catch (err) {
      console.error('Email failed to send:', err);
    }

    res.json({ message: `Recruiter ${status === 'active' ? 'approved' : 'rejected'} successfully` });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify/Update user status
// @route   PATCH /api/admin/users/:id/verify
// @access  Private (Admin)
// @desc    Update user status / profile data
// @route   PATCH /api/admin/users/:id/verify
// @access  Private (Admin)
const verifyUser = async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        isVerified: req.body.isVerified,
        status: req.body.status,
        name: req.body.name
      }
    });

    if (user.role === 'student' && (req.body.course || req.body.cgpa)) {
      await prisma.studentProfile.update({
        where: { userId: user.id },
        data: {
          course: req.body.course,
          cgpa: req.body.cgpa
        }
      });
    } else if (user.role === 'recruiter') {
      const profile = await prisma.recruiterProfile.findUnique({ where: { userId: user.id } });
      if (profile) {
        await prisma.recruiterProfile.update({
          where: { id: profile.id },
          data: {
            companyName: req.body.companyName,
            companyWebsite: req.body.website,
            location: req.body.location
          }
        });
      }
    }

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk update user status/verification
// @route   PATCH /api/admin/users/bulk
// @access  Private (Admin)
const bulkUpdateUsers = async (req, res, next) => {
  const { userIds, isVerified, status } = req.body;
  try {
    const result = await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: {
        isVerified,
        status
      }
    });

    res.json({ message: `Successfully updated ${result.count} users` });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk send email to users
// @route   POST /api/admin/users/bulk-email
// @access  Private (Admin)
const bulkSendEmail = async (req, res, next) => {
  const { userIds, subject, message, title } = req.body;
  try {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { email: true, name: true }
    });
    
    // Process in batches to prevent SMTP flooding
    const batchSize = 10;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      await Promise.all(batch.map(user => 
        sendEmail({
          email: user.email,
          subject,
          template: 'notification',
          context: {
            name: user.name,
            title: title || 'Admin Message',
            message: message.replace(/\n/g, '<br>'),
            actionText: 'Go to Dashboard',
            actionUrl: 'http://localhost:5173/login'
          }
        })
      ));
    }

    res.json({ message: `Emails sent to ${users.length} users` });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk verify student academic records
// @route   PATCH /api/admin/students/bulk-academic-verify
// @access  Private (Admin)
const bulkVerifyAcademics = async (req, res, next) => {
  const { studentIds, isVerified } = req.body;
  try {
    const result = await prisma.studentProfile.updateMany({
      where: { userId: { in: studentIds } },
      data: {
        academicVerified: isVerified,
        verifiedAt: isVerified ? new Date() : null
      }
    });

    res.json({ message: `Successfully updated ${result.count} academic verification records` });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student compliance statistics
// @route   GET /api/admin/students/compliance
// @access  Private (Admin)
const getComplianceStats = async (req, res, next) => {
  try {
    const [totalStudents, unverified, missingResume, incompleteProfile] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.studentProfile.count({ where: { academicVerified: false } }),
      prisma.studentProfile.count({ where: { OR: [{ resumePath: '' }, { resumePath: null }] } }),
      prisma.studentProfile.count({ where: { profileCompletion: { lt: 80 } } })
    ]);

    res.json({
      totalStudents,
      unverified,
      missingResume,
      incompleteProfile,
      healthScore: Math.round(((totalStudents - unverified) / totalStudents) * 100) || 0
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Create a new student manually
// @route   POST /api/admin/students
// @access  Private (Admin)
const createStudent = async (req, res, next) => {
  const { name, email, password, course, branch, cgpa } = req.body;
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: password || 'Password@123',
        role: 'student',
        isVerified: true,
        status: 'active',
        studentProfile: {
          create: {
            course,
            branch,
            cgpa: parseFloat(cgpa) || 0
          }
        }
      }
    });

    res.status(201).json({ message: 'Student created successfully', user: { ...user, _id: user.id } });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin manually create a recruiter
// @route   POST /api/admin/recruiters
// @access  Private (Admin)
const createRecruiter = async (req, res, next) => {
  try {
    const { name, email, password, companyName, website, industry, location } = req.body;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const tempPassword = password || 'Password@123';
    
    // Create recruiter with profiles in one go
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: tempPassword,
        role: 'recruiter',
        isVerified: true,
        status: 'active',
        recruiterProfile: {
          create: {
            companyName: companyName,
            companyWebsite: website || '',
            location: location || ''
          }
        }
      }
    });

    res.status(201).json({ message: 'Recruiter created successfully', user: { ...user, _id: user.id } });
  } catch (error) {
    next(error);
  }
};

// @desc    Run automated verification on all students
// @route   POST /api/admin/verify-batch
// @access  Private (Admin)
const runVerificationBatch = async (req, res, next) => {
  try {
    const result = await prisma.user.updateMany({
      where: { 
        role: 'student', 
        isVerified: false,
        studentProfile: { cgpa: { gt: 0 } }
      },
      data: {
        isVerified: true,
        status: 'active'
      }
    });

    res.json({ 
      message: `Batch verification complete. ${result.count} students verified.`,
      updatedCount: result.count 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all scheduled interviews
// @route   GET /api/admin/interviews
// @access  Private (Admin)
const getInterviews = async (req, res, next) => {
  try {
    const interviews = await prisma.application.findMany({
      where: { interviewDate: { not: null } },
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        job: { select: { title: true, companyName: true } }
      },
      orderBy: { interviewDate: 'asc' }
    });

    const formatted = interviews.map(i => ({
      ...i,
      _id: i.id,
      student: { name: i.student.user.name, email: i.student.user.email },
      job: { title: i.job.title, companyName: i.job.companyName }
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed placement reports
// @route   GET /api/admin/reports/placements
// @access  Private (Admin)
const getPlacementReports = async (req, res, next) => {
  try {
    const placements = await prisma.application.findMany({
      where: { status: { in: ['Selected', 'Accepted'] } },
      include: {
        student: { 
          include: { 
            user: { select: { name: true, email: true } } 
          } 
        },
        job: { select: { title: true, companyName: true, salary: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const formatted = placements.map(p => ({
      ...p,
      _id: p.id,
      student: { ...p.student.user, _id: p.studentId, profile: p.student },
      job: { ...p.job, _id: p.jobId }
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify offer letter and mark as Placed
// @route   PATCH /api/admin/applications/:id/verify-offer
// @access  Private (Admin)
const verifyOfferLetter = async (req, res, next) => {
  const { status, remarks } = req.body; // 'Verified' or 'Rejected'
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: { job: true, student: { select: { userId: true } } }
    });

    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Authorization Check
    if (req.adminLevel === 'DEPT_ADMIN' && application.student.branch !== req.adminScope) {
      return res.status(403).json({ message: 'Not authorized to verify students outside your department scope' });
    }

    const updatedApp = await prisma.application.update({
      where: { id: req.params.id },
      data: {
        status: status === 'Verified' ? 'Placed' : 'Selected',
        feedback: remarks,
        statusHistory: {
          push: { 
            status: status === 'Verified' ? 'Placed' : 'Offer_Rejected', 
            date: new Date().toISOString(), 
            comment: `Offer letter ${status.toLowerCase()} by Admin. ${remarks || ''}` 
          }
        }
      }
    });

    if (status === 'Verified') {
      // Update student profile to Placed
      await prisma.studentProfile.update({
        where: { userId: application.studentId },
        data: { 
          placementStatus: application.job.jobType === 'Internship' ? 'Interned' : 'Placed'
        }
      });

      // Update Audit Log
      await createAuditLog(
        req.user.id,
        'VERIFY_OFFER',
        'Application',
        application.id,
        `Offer verified for student ${application.studentId} at ${application.job.companyName}`,
        req.ip
      );
    }

    res.json({ message: `Offer letter ${status.toLowerCase()} successfully`, application: updatedApp });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent system activities
// @route   GET /api/admin/activities
// @access  Private (Admin)
const getRecentActivities = async (req, res, next) => {
  try {
    const [users, jobs] = await Promise.all([
      prisma.user.findMany({
        where: { role: { not: 'admin' } },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.job.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    const activities = [
      ...users.map(u => ({
        date: u.createdAt,
        type: u.role === 'student' ? 'Student Registered' : 'Recruiter Registered',
        desc: `New ${u.role} account: ${u.email}`,
        user: { name: u.name, role: u.role.charAt(0).toUpperCase() + u.role.slice(1), initials: u.name[0] },
        status: u.isVerified ? 'Verified' : 'Pending'
      })),
      ...jobs.map(j => ({
        date: j.createdAt,
        type: 'Job Posted',
        desc: `${j.title}`,
        user: { name: j.companyName, role: 'Recruiter', initials: j.companyName[0] },
        status: j.status === 'open' ? 'Published' : 'Draft'
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    res.json(activities);
  } catch (error) {
    next(error);
  }
};

// @desc    Get company placement history
// @route   GET /api/admin/recruiters/:id/history
// @access  Private (Admin)
const getCompanyHistory = async (req, res, next) => {
  try {
    const history = await prisma.application.findMany({
      where: { job: { recruiterId: req.params.id } },
      include: {
        student: { select: { name: true, userId: true } },
        job: { select: { title: true, salary: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const studentIds = history.map(h => h.studentId);
    const users = await prisma.user.findMany({
       where: { id: { in: studentIds } },
       select: { email: true, id: true }
    });
    const userMap = new Map(users.map(u => [u.id, u.email]));

    const formatted = history.map(h => ({
      ...h,
       _id: h.id,
       student: { name: h.student.name, email: userMap.get(h.student.userId) },
       job: { ...h.job, _id: h.jobId }
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Get advanced placement analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getAdvancedAnalytics = async (req, res, next) => {
  try {
    // 1. Department Placement Mix (By Branch)
    const deptPlacement = await prisma.studentProfile.groupBy({
      by: ['branch'],
      _count: { _all: true },
    });

    // 2. Salary Aggregates
    const salaryAggr = await prisma.job.aggregate({
      _min: { salary: true },
      _max: { salary: true },
      _avg: { salary: true }
    });

    // 3. Top Hiring Companies
    const topHiring = await prisma.application.groupBy({
      by: ['jobId'],
      _count: { _all: true },
      where: { status: 'Selected' }
    });

    // 4. Yearly Trends (Overall intake vs placed)
    const yearlyTrends = await prisma.studentProfile.groupBy({
      by: ['passingYear'],
      _count: { _all: true }
    });

    // 5. COHORT ANALYTICS: Success per (Branch x Year)
    const cohortResults = await prisma.studentProfile.groupBy({
      by: ['branch', 'passingYear', 'placementStatus'],
      _count: { _all: true }
    });

    // 6. Branch Comparison - Selection Rates
    const branchComparison = await prisma.studentProfile.groupBy({
      by: ['branch', 'placementStatus'],
      _count: { _all: true }
    });

    // 7. Overall Placement Status
    const statusBreakdown = await prisma.studentProfile.groupBy({
      by: ['placementStatus'],
      _count: { _all: true }
    });

    // Format Yearly Trends to include "placed" counts
    const formattedYearly = await Promise.all(yearlyTrends.map(async (y) => {
      const placed = await prisma.studentProfile.count({
        where: { passingYear: y.passingYear, placementStatus: { in: ['Placed', 'Interned'] } }
      });
      return { _id: y.passingYear, total: y._count._all, placed };
    }));

    res.json({
      deptPlacement: deptPlacement.map(d => ({ _id: d.branch, total: d._count._all })),
      salaryTrends: { 
        min: parseFloat(salaryAggr._min.salary) || 0, 
        max: parseFloat(salaryAggr._max.salary) || 0, 
        avg: parseFloat(salaryAggr._avg.salary) || 0 
      },
      topHiring: topHiring.map(h => ({ _id: h.jobId, count: h._count._all })),
      yearlyTrends: formattedYearly.sort((a, b) => (a._id || 0) - (b._id || 0)),
      statusBreakdown: statusBreakdown.map(s => ({ _id: s.placementStatus, count: s._count._all })),
      cohortAnalytics: cohortResults,
      branchComparison: branchComparison
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in admin
// @route   GET /api/admin/me
// @access  Private (Admin)
const getAdminMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { adminProfile: true }
    });
    
    if (!user.adminProfile) {
      const profile = await prisma.adminProfile.create({
        data: { userId: user.id }
      });
      return res.json({ ...user, _id: user.id, adminProfile: profile });
    }
    res.json({ ...user, _id: user.id });
  } catch (error) {
    next(error);
  }
};

// @desc    Update admin profile
// @route   PATCH /api/admin/me
// @access  Private (Admin)
const updateAdminProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: req.body.name,
        profilePhoto: req.body.profilePhoto,
        email: req.body.email
      },
      include: { adminProfile: true }
    });

    res.json({ ...user, _id: user.id });
  } catch (error) {
    next(error);
  }
};

// @desc    Get global system settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
const getSystemSettings = async (req, res, next) => {
  try {
    let settings = await prisma.systemSettings.findFirst();
    if (!settings) {
      settings = await prisma.systemSettings.create({ data: {} });
    }
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

const updateSystemSettings = async (req, res, next) => {
  try {
    const settings = await prisma.systemSettings.findFirst();
    const updated = await prisma.systemSettings.update({
      where: { id: settings.id },
      data: req.body
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};
const unlockUserAccount = async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        loginAttempts: 0,
        lockUntil: null
      }
    });

    res.json({ message: `Account for ${user.email} has been unlocked successfully` });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getAdminMe, updateAdminProfile,
  getStats, getUsers, verifyUser, 
  getInterviews, getPlacementReports, getRecentActivities,
  getPendingVerifications, verifySkill, getCompanyHistory, getAdvancedAnalytics,
  getPendingRecruiters, approveRecruiter,
  createStudent, createRecruiter, runVerificationBatch,
  getSystemSettings, updateSystemSettings,
  unlockUserAccount, bulkUpdateUsers, bulkSendEmail, bulkVerifySkills,
  bulkVerifyAcademics, getComplianceStats, verifyOfferLetter,
  getAdminTeam, inviteAdmin, updateAdminLevel
};
