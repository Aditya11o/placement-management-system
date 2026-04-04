const User = require('../models/User');
const Profile = require('../models/Profile');
const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const CompanyProfile = require('../models/CompanyProfile');
const Application = require('../models/Application');
const AdminProfile = require('../models/AdminProfile');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const { createAuditLog } = require('./auditLogController');
const cloudinary = require('../utils/cloudinary');
const sendEmail = require('../utils/emailUtils');

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

// @desc    Bulk verify student skills
// @route   PATCH /api/admin/verifications/bulk
// @access  Private (Admin)
const bulkVerifySkills = async (req, res, next) => {
  const { requests, status } = req.body; // requests: [{ profileId, verificationId }]
  try {
    let updatedCount = 0;
    
    // Group updates by profile profileId for efficiency
    const profileUpdates = new Map();
    requests.forEach(req => {
      if (!profileUpdates.has(req.profileId)) profileUpdates.set(req.profileId, []);
      profileUpdates.get(req.profileId).push(req.verificationId);
    });

    for (const [profileId, vIds] of profileUpdates.entries()) {
      const profile = await Profile.findById(profileId);
      if (profile) {
        vIds.forEach(vId => {
          const v = profile.studentDetails.verifiedSkills.id(vId);
          if (v && v.status === 'Pending') {
            v.status = status;
            updatedCount++;
          }
        });
        await profile.save();
      }
    }

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

    // Application Status Breakdown
    const appBreakdown = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Jobs per Company (Top 5)
    const jobsPerCompany = await Job.aggregate([
      { $group: { _id: '$companyName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalStudents,
      totalRecruiters,
      totalJobs,
      totalApplications,
      placedStudents,
      totalInterviews,
      appBreakdown,
      jobsPerCompany
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 }).lean();
    
    const usersWithProfiles = await Promise.all(users.map(async (user) => {
      let profile = null;
      try {
        if (user.role === 'student') {
          // Look in both specialized StudentProfile and legacy Profile
          profile = await StudentProfile.findOne({ user_id: user._id }).lean();
          if (!profile) {
            const legacyProfile = await Profile.findOne({ user: user._id }).lean();
            if (legacyProfile && legacyProfile.studentDetails) {
              // Map legacy to new format for frontend consistency
              profile = {
                ...legacyProfile.studentDetails,
                _id: legacyProfile._id
              };
            }
          }
        } else if (user.role === 'recruiter') {
          // Recruiters use RecruiterProfile which links to CompanyProfile
          const recruiterProfile = await RecruiterProfile.findOne({ user: user._id }).populate('company').lean();
          if (recruiterProfile) {
            profile = {
              ...recruiterProfile,
              companyName: recruiterProfile.company?.company_name,
              website: recruiterProfile.company?.website,
              location: recruiterProfile.company?.location,
              industry: recruiterProfile.company?.industry,
              companyLogo: recruiterProfile.company?.company_logo
            };
          } else {
            // Check legacy
            const legacyProfile = await Profile.findOne({ user: user._id }).lean();
            if (legacyProfile && legacyProfile.recruiterDetails) {
              profile = {
                ...legacyProfile.recruiterDetails,
                _id: legacyProfile._id
              };
            }
          }
        }
      } catch (profileErr) {
        console.error(`Error fetching profile for user ${user._id}:`, profileErr);
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
    const user = await User.findById(req.params.id);
    if (user) {
      user.isVerified = req.body.isVerified ?? user.isVerified;
      user.status = req.body.status ?? user.status;
      user.name = req.body.name || user.name;
      
      // Handle Profile update if provided
      if (user.role === 'student' && (req.body.course || req.body.cgpa)) {
        let profile = await StudentProfile.findOne({ user_id: user._id });
        if (!profile) {
          profile = await Profile.findOne({ user: user._id });
        }
        
        if (profile) {
          if (profile.studentDetails) {
            // Legacy format
            profile.studentDetails.course = req.body.course || profile.studentDetails.course;
            profile.studentDetails.cgpa = req.body.cgpa || profile.studentDetails.cgpa;
          } else {
            // New format
            profile.course = req.body.course || profile.course;
            profile.current_cgpa = req.body.cgpa || profile.current_cgpa;
          }
          await profile.save();
        }
      } else if (user.role === 'recruiter') {
        let recruiterProfile = await RecruiterProfile.findOne({ user: user._id });
        if (recruiterProfile) {
          let company = await CompanyProfile.findById(recruiterProfile.company);
          if (company) {
            if (req.body.companyName) company.company_name = req.body.companyName;
            if (req.body.website !== undefined) company.website = req.body.website;
            if (req.body.industry !== undefined) company.industry = req.body.industry;
            if (req.body.location !== undefined) company.location = req.body.location;
            await company.save();
          }
        }
      }

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

      res.json({ message: 'User updated successfully' });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
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
    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { 
          ...(isVerified !== undefined && { isVerified }),
          ...(status !== undefined && { status })
        } 
      }
    );

    // Audit Log
    await createAuditLog(
      req.user.id,
      'BULK_UPDATE_USERS',
      'User',
      null,
      `Updated ${result.modifiedCount} users to status: ${status}, verified: ${isVerified}`,
      req.ip
    );

    res.json({ message: `Successfully updated ${result.modifiedCount} users` });
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
    const users = await User.find({ _id: { $in: userIds } }).select('email name');
    
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

    // Audit Log
    await createAuditLog(
        req.user.id,
        'BULK_SEND_EMAIL',
        'User',
        null,
        `Sent bulk email "${subject}" to ${users.length} users`,
        req.ip
      );

    res.json({ message: `Emails sent to ${users.length} users` });
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
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password: password || 'Password@123',
      role: 'student',
      isVerified: true,
      status: 'active'
    });

    // Create Student Profile
    await StudentProfile.create({
      user_id: user._id,
      course,
      department: branch,
      current_cgpa: cgpa || 0,
      skills: []
    });

    res.status(201).json({ message: 'Student created successfully', user });
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

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const tempPassword = password || 'Password@123';
    
    // Create base user
    const user = await User.create({
      name,
      email,
      password: tempPassword,
      role: 'recruiter',
      isVerified: true,
      status: 'active'
    });

    // Create related Company and Recruiter profiles
    const company = await CompanyProfile.create({
      company_id: 'COMP' + Date.now().toString().slice(-6),
      recruiter_id: user._id,
      company_name: companyName,
      website: website || '',
      industry: industry || '',
      location: location || ''
    });

    await RecruiterProfile.create({
      user: user._id,
      company: company._id,
      recruiter_id: 'REC' + Date.now().toString().slice(-6),
      full_name: name
    });

    res.status(201).json({ message: 'Recruiter created successfully', user });
  } catch (error) {
    next(error);
  }
};

// @desc    Run automated verification on all students
// @route   POST /api/admin/verify-batch
// @access  Private (Admin)
const runVerificationBatch = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'student', isVerified: false });
    let updatedCount = 0;

    for (const student of students) {
      let profile = await StudentProfile.findOne({ user_id: student._id });
      if (!profile) profile = await Profile.findOne({ user: student._id });

      if (profile) {
        const cgpa = profile.current_cgpa || profile.studentDetails?.cgpa || 0;
        const skills = profile.skills || profile.studentDetails?.skills || [];
        
        // Simple logic: If CGPA > 0 and has profile data, approve
        if (cgpa > 0) {
          student.isVerified = true;
          student.status = 'active';
          await student.save();
          updatedCount++;
        }
      }
    }

    res.json({ 
      message: `Batch verification complete. ${updatedCount} students verified out of ${students.length} pending.`,
      updatedCount 
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
    // 4. Yearly Placement Trends (Past 5 Years)
    const currentYear = new Date().getFullYear();
    const yearlyTrends = await StudentProfile.aggregate([
      { $match: { passing_year: { $gte: currentYear - 4, $lte: currentYear + 1 } } },
      { $group: {
          _id: '$passing_year',
          total: { $sum: 1 },
          placed: { $sum: { $cond: [{ $eq: ['$placement_status', 'Placed'] }, 1, 0] } }
      }},
      { $sort: { _id: 1 } }
    ]);

    // 5. Salary Distribution (Density)
    const salaryDistribution = await Job.aggregate([
      {
        $bucket: {
          groupBy: '$salary',
          boundaries: [0, 3, 6, 10, 15, 25, 100],
          default: '25L+',
          output: {
            count: { $sum: 1 },
            avgSalary: { $avg: '$salary' }
          }
        }
      }
    ]);

    // 6. Course-wise Breakdown
    const courseStats = await StudentProfile.aggregate([
      { $group: {
          _id: '$course',
          total: { $sum: 1 },
          placed: { $sum: { $cond: [{ $eq: ['$placement_status', 'Placed'] }, 1, 0] } }
      }},
      { $sort: { total: -1 } }
    ]);

    // 7. Overall Placement Status (Pie Chart)
    const statusBreakdown = await StudentProfile.aggregate([
      { $group: { _id: '$placement_status', count: { $sum: 1 } } }
    ]);

    res.json({
      deptPlacement,
      salaryTrends: salaryTrends[0] || { min: 0, max: 0, avg: 0 },
      topHiring,
      yearlyTrends,
      salaryDistribution,
      courseStats,
      statusBreakdown
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
    let adminProfile = await AdminProfile.findOne({ user: user._id });
    
    if (!adminProfile) {
      adminProfile = new AdminProfile({
        user: user._id,
        admin_id: 'ADM-' + Math.floor(100000 + Math.random() * 900000),
        full_name: user.name,
        email: user.email,
        phone: 'Not provided',
        password: user.password || 'default'
      });
      await adminProfile.save();
    }
    res.json({ ...user.toObject(), phone: adminProfile.phone, admin_id: adminProfile.admin_id });
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

    if (req.body.name) user.name = req.body.name;
    
    if (req.body.profilePhoto) {
      if (req.body.profilePhoto.startsWith('data:image')) {
        const uploadRes = await cloudinary.uploader.upload(req.body.profilePhoto, {
          folder: 'pms/profiles'
        });
        user.profilePhoto = uploadRes.secure_url;
      } else {
        user.profilePhoto = req.body.profilePhoto;
      }
    }
    
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) return res.status(400).json({ message: 'Email is already in use' });
      user.email = req.body.email;
    }
    
    const updatedUser = await user.save();

    let adminProfile = await AdminProfile.findOne({ user: user._id });
    if (adminProfile) {
      adminProfile.full_name = updatedUser.name;
      adminProfile.email = updatedUser.email;
      if (req.body.phone !== undefined) adminProfile.phone = req.body.phone;
      await adminProfile.save();
    }

    res.json({ ...updatedUser.toObject(), phone: adminProfile?.phone || req.body.phone });
  } catch (error) {
    next(error);
  }
};

// @desc    Get global system settings
// @route   GET /api/admin/settings
// @access  Private (Admin)
const getSystemSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// @desc    Update global system settings
// @route   PATCH /api/admin/settings
// @access  Private (Admin)
const updateSystemSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings({});
    
    const updatableFields = [
      'studentRegistration', 'recruiterRegistration', 'jobApproval',
      'emailNotifications', 'maintenanceMode', 'portalName', 'universityName'
    ];
    
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });
    
    settings.updatedBy = req.user.id;
    await settings.save();
    
    await createAuditLog(req.user.id, 'UPDATE_SETTINGS', 'System', null, { changes: req.body });
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// @desc    Unlock a locked user account (reset login attempts & lockout)
// @route   PATCH /api/admin/users/:id/unlock
// @access  Private (Admin)
const unlockUserAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('+loginAttempts +lockUntil');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // Audit Log
    await createAuditLog(
      req.user.id,
      'UNLOCK_USER',
      'User',
      user._id,
      `Admin unlocked account for: ${user.email}`,
      req.ip
    );

    res.json({ message: `Account for ${user.email} has been unlocked successfully` });
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
  approveRecruiter,
  createStudent,
  createRecruiter,
  runVerificationBatch,
  getSystemSettings,
  updateSystemSettings,
  unlockUserAccount,
  bulkUpdateUsers,
  bulkSendEmail,
  bulkVerifySkills
};
