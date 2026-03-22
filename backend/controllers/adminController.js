const User = require('../models/User');
const Profile = require('../models/Profile');
const { createAuditLog } = require('./auditLogController');

// @desc    Get all pending skill verifications
// @route   GET /api/admin/verifications
// @access  Private (Admin)
const getPendingVerifications = async (req, res, next) => {
  try {
    const profiles = await Profile.find({
      'studentDetails.verifiedSkills.status': 'Pending'
    }).populate('user', 'name email');

    const verifications = [];
    profiles.forEach(p => {
      p.studentDetails.verifiedSkills.forEach(v => {
        if (v.status === 'Pending') {
          verifications.push({
            profileId: p._id,
            userId: p.user._id,
            userName: p.user.name,
            userEmail: p.user.email,
            skill: v.skill,
            certificateUrl: v.certificateUrl,
            appliedAt: v.appliedAt,
            verificationId: v._id
          });
        }
      });
    });

    res.json(verifications);
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
    const profile = await Profile.findById(req.params.profileId);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const verification = profile.studentDetails.verifiedSkills.id(req.params.verificationId);
    if (!verification) return res.status(404).json({ message: 'Verification request not found' });

    verification.status = status;
    await profile.save();

    // Audit Log
    await createAuditLog(
      req.user.id,
      'VERIFY_SKILL',
      'Profile',
      profile._id,
      `Verified skill: ${verification.skill} as ${status}`,
      req.ip
    );

    res.json({ message: `Skill ${status.toLowerCase()} successfully` });
  } catch (error) {
    next(error);
  }
};
const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const CompanyProfile = require('../models/CompanyProfile');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const placedStudents = await Application.countDocuments({ status: 'Selected' });
    const totalInterviews = await Application.countDocuments({ 
      'interviewDate': { $exists: true, $ne: null } 
    });

    res.json({
      totalStudents,
      totalRecruiters,
      totalJobs,
      totalApplications,
      placedStudents,
      totalInterviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with profile data
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 }).lean();
    
    const usersWithProfiles = await Promise.all(users.map(async (user) => {
      let profile = null;
      if (user.role === 'student') {
        profile = await Profile.findOne({ user: user._id }).lean();
      } else if (user.role === 'recruiter') {
        profile = await CompanyProfile.findOne({ user: user._id }).lean();
      }
      return { ...user, profile };
    }));

    res.json(usersWithProfiles);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pending recruiters
// @route   GET /api/admin/pending-recruiters
// @access  Private (Admin)
const getPendingRecruiters = async (req, res, next) => {
  try {
    const recruiters = await User.find({ role: 'recruiter', status: 'pending' }).select('-password');
    res.json(recruiters);
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
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'recruiter') {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    user.status = status;
    user.isVerified = status === 'active';
    await user.save();

    // Audit Log
    await createAuditLog(
      req.user.id,
      'APPROVE_RECRUITER',
      'User',
      user._id,
      `Recruiter ${user.email} status set to ${status}`,
      req.ip
    );

    // Send notification email
    const { sendEmail } = require('../utils/emailUtils');
    try {
      await sendEmail({
        email: user.email,
        subject: `Recruiter Account ${status === 'active' ? 'Approved' : 'Rejected'}`,
        message: `<h1>Account Update</h1><p>Your recruiter account on Placement Management System has been <strong>${status === 'active' ? 'approved' : 'rejected'}</strong> by the administrator.</p>${status === 'active' ? '<p>You can now login and post job openings.</p>' : '<p>Please contact support for more information.</p>'}`,
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
const verifyUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.isVerified = req.body.isVerified ?? user.isVerified;
      user.status = req.body.status ?? user.status;
      await user.save();

      // Audit Log
      await createAuditLog(
        req.user.id,
        'VERIFY_USER',
        'User',
        user._id,
        `Updated user status: ${user.status}, Verified: ${user.isVerified}`,
        req.ip
      );

      res.json({ message: 'User verification status updated' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all scheduled interviews
// @route   GET /api/admin/interviews
// @access  Private (Admin)
const getInterviews = async (req, res, next) => {
  try {
    const interviews = await Application.find({
      'interview.date': { $exists: true, $ne: null }
    })
    .populate('student', 'name email')
    .populate('job', 'title companyName')
    .sort({ 'interview.date': 1 });

    res.json(interviews);
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed placement reports
// @route   GET /api/admin/reports/placements
// @access  Private (Admin)
const getPlacementReports = async (req, res, next) => {
  try {
    const placements = await Application.find({ status: 'Selected' })
      .populate('student', 'name email')
      .populate('job', 'title companyName salary')
      .sort({ updatedAt: -1 });

    res.json(placements);
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
      User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 }).limit(5),
      Job.find().populate('recruiter', 'name').sort({ createdAt: -1 }).limit(5)
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
        user: { name: j.recruiter?.name || 'Recruiter', role: 'Recruiter', initials: j.recruiter?.name?.[0] || 'R' },
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
    const jobs = await Job.find({ recruiter: req.params.id }).select('_id');
    const jobIds = jobs.map(j => j._id);

    const history = await Application.find({ job: { $in: jobIds } })
      .populate('student', 'name email')
      .populate('job', 'title salary')
      .sort({ updatedAt: -1 });

    res.json(history);
  } catch (error) {
    next(error);
  }
};

// @desc    Get advanced placement analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
const getAdvancedAnalytics = async (req, res, next) => {
  try {
    // 1. Department-wise Placement %
    const totalByBranch = await Profile.aggregate([
      { $match: { 'studentDetails.branch': { $exists: true, $ne: null } } },
      { $group: { _id: '$studentDetails.branch', total: { $sum: 1 } } }
    ]);

    const placedByBranch = await Application.aggregate([
      { $match: { status: 'Selected' } },
      {
        $lookup: {
          from: 'profiles',
          localField: 'student',
          foreignField: 'user',
          as: 'profile'
        }
      },
      { $unwind: '$profile' },
      { $group: { _id: '$profile.studentDetails.branch', placed: { $sum: 1 } } }
    ]);

    const deptPlacement = totalByBranch.map(dept => {
      const placed = placedByBranch.find(p => p._id === dept._id)?.placed || 0;
      return {
        department: dept._id,
        percentage: ((placed / dept.total) * 100).toFixed(1),
        total: dept.total,
        placed
      };
    });

    // 2. Salary Trends
    const salaryTrends = await Job.aggregate([
      { $group: {
          _id: null,
          min: { $min: '$salary' },
          max: { $max: '$salary' },
          avg: { $avg: '$salary' }
      }}
    ]);

    // 3. Top Hiring Companies
    const topHiring = await Application.aggregate([
      { $match: { status: 'Selected' } },
      {
        $lookup: {
          from: 'jobs',
          localField: 'job',
          foreignField: '_id',
          as: 'jobDetails'
        }
      },
      { $unwind: '$jobDetails' },
      { $group: { _id: '$jobDetails.companyName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      deptPlacement,
      salaryTrends: salaryTrends[0] || { min: 0, max: 0, avg: 0 },
      topHiring
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
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update admin profile
// @route   PATCH /api/admin/me
// @access  Private (Admin)
const updateAdminProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Admin not found' });

    user.name = req.body.name || user.name;
    user.profilePhoto = req.body.profilePhoto || user.profilePhoto;
    
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getAdminMe,
  updateAdminProfile,
  getPendingVerifications, 
  verifySkill, 
  getStats, 
  getUsers, 
  verifyUser, 
  getInterviews, 
  getPlacementReports, 
  getRecentActivities,
  getCompanyHistory,
  getAdvancedAnalytics,
  getPendingRecruiters,
  approveRecruiter
};
