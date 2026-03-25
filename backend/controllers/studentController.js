const StudentProfile = require('../models/StudentProfile');
const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');
const StudentSettings = require('../models/StudentSettings');
const StudentResume = require('../models/StudentResume');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get student dashboard data
// @route   GET /api/student/dashboard
// @access  Private
const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // 1. Stats
    const totalApplied = await Application.countDocuments({ student: studentId });
    const underReview = await Application.countDocuments({ student: studentId, status: { $in: ['Applied', 'Under Review'] } });
    const shortlisted = await Application.countDocuments({ student: studentId, status: 'Shortlisted' });
    const selected = await Application.countDocuments({ student: studentId, status: { $in: ['Selected', 'Accepted', 'Placed'] } });
    const rejected = await Application.countDocuments({ student: studentId, status: 'Rejected' });
    const totalJobs = await Job.countDocuments({ status: 'open', deadline: { $gte: new Date() } });

    // 2. Recent Applications (5)
    const recentApplications = await Application.find({ student: studentId })
      .populate('job', 'title companyName status deadline')
      .sort({ createdAt: -1 })
      .limit(5);

    // 3. Upcoming Interviews
    const upcomingInterviews = await Application.find({ 
      student: studentId, 
      interviewDate: { $gte: new Date() } 
    })
      .populate('job', 'title companyName location')
      .sort({ interviewDate: 1 });

    // 4. Recent Jobs (5)
    const recentJobs = await Job.find({ status: 'open', deadline: { $gte: new Date() } })
      .sort({ createdAt: -1 })
      .limit(5);

    // 5. Recent Notifications (5)
    const notifications = await Notification.find({ user_id: studentId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalJobs,
        applied: totalApplied,
        underReview,
        shortlisted,
        selected,
        rejected
      },
      applications: recentApplications,
      interviews: upcomingInterviews,
      jobs: recentJobs,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student resume URL
// @route   GET /api/student/resume
// @access  Private
const getStudentResume = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user_id: req.user.id });
    
    if (!profile || (!profile.resume_path && !profile.resume)) {
      return res.status(404).json({ message: 'No resume found' });
    }

    res.json({ 
      resume_url: profile.resume_path || profile.resume,
      success: true 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student profile
// @route   PUT /api/students/profile
// @access  Private
const updateStudentProfile = async (req, res, next) => {
  try {
    const { full_name, phone } = req.body;
    let profile = await StudentProfile.findOne({ user_id: req.user.id });

    if (!profile) {
      profile = new StudentProfile({
        user_id: req.user.id,
        full_name: full_name || req.user.name,
        email: req.user.email,
        phone
      });
    } else {
      if (full_name) profile.full_name = full_name;
      if (phone) profile.phone = phone;
    }

    await profile.save();

    // Also update User name if changed
    if (full_name) {
      const user = await User.findById(req.user.id);
      user.name = full_name;
      await user.save();
    }

    res.json({ success: true, message: 'Profile updated successfully', profile });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/students/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(current_password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    user.password = new_password;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notification settings
// @route   GET /api/students/notification-settings
// @access  Private
const getNotificationSettings = async (req, res, next) => {
  try {
    let settings = await StudentSettings.findOne({ user_id: req.user.id });
    if (!settings) {
      settings = await StudentSettings.create({ user_id: req.user.id });
    }
    res.json(settings.notifications);
  } catch (error) {
    next(error);
  }
};

// @desc    Update notification settings
// @route   PUT /api/students/notification-settings
// @access  Private
const updateNotificationSettings = async (req, res, next) => {
  try {
    let settings = await StudentSettings.findOne({ user_id: req.user.id });
    if (!settings) {
      settings = new StudentSettings({ user_id: req.user.id });
    }
    settings.notifications = { ...settings.notifications, ...req.body };
    await settings.save();
    res.json({ success: true, message: 'Notification settings updated', notifications: settings.notifications });
  } catch (error) {
    next(error);
  }
};

// @desc    Get privacy settings
// @route   GET /api/students/privacy-settings
// @access  Private
const getPrivacySettings = async (req, res, next) => {
  try {
    let settings = await StudentSettings.findOne({ user_id: req.user.id });
    if (!settings) {
      settings = await StudentSettings.create({ user_id: req.user.id });
    }
    res.json(settings.privacy);
  } catch (error) {
    next(error);
  }
};

// @desc    Update privacy settings
// @route   PUT /api/students/privacy-settings
// @access  Private
const updatePrivacySettings = async (req, res, next) => {
  try {
    let settings = await StudentSettings.findOne({ user_id: req.user.id });
    if (!settings) {
      settings = new StudentSettings({ user_id: req.user.id });
    }
    settings.privacy = { ...settings.privacy, ...req.body };
    await settings.save();
    res.json({ success: true, message: 'Privacy settings updated', privacy: settings.privacy });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload resume
// @route   POST /api/students/upload-resume
// @access  Private
const uploadStudentResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const resume_url = `/uploads/resumes/${req.file.filename}`;
    const resume_name = req.file.originalname;

    const resume = await StudentResume.create({
      student_id: req.user.id,
      resume_url,
      resume_name
    });

    // Also update StudentProfile resume_path for compatibility
    await StudentProfile.findOneAndUpdate(
      { user_id: req.user.id },
      { resume_path: resume_url },
      { upsert: true }
    );

    res.status(201).json({ success: true, message: 'Resume uploaded successfully', resume });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resume
// @route   DELETE /api/students/resume/:id
// @access  Private
const deleteStudentResume = async (req, res, next) => {
  try {
    const resume = await StudentResume.findOneAndDelete({ _id: req.params.id, student_id: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // If it was the primary resume, clear from profile
    const profile = await StudentProfile.findOne({ user_id: req.user.id });
    if (profile && profile.resume_path === resume.resume_url) {
      profile.resume_path = '';
      await profile.save();
    }

    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all resumes for student
// @route   GET /api/students/resume
// @access  Private
const getStudentResumes = async (req, res, next) => {
  try {
    const resumes = await StudentResume.find({ student_id: req.user.id }).sort({ upload_date: -1 });
    res.json(resumes);
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate account
// @route   PUT /api/students/deactivate
// @access  Private
const deactivateAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.status = 'inactive';
    await user.save();
    res.json({ success: true, message: 'Account deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete account
// @route   DELETE /api/students/delete-account
// @access  Private
const deleteAccount = async (req, res, next) => {
  try {
    // Delete all related data
    await Promise.all([
      User.findByIdAndDelete(req.user.id),
      StudentProfile.findOneAndDelete({ user_id: req.user.id }),
      StudentSettings.findOneAndDelete({ user_id: req.user.id }),
      StudentResume.deleteMany({ user_id: req.user.id }),
      Application.deleteMany({ student: req.user.id }),
      Notification.deleteMany({ user_id: req.user.id })
    ]);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getStudentResume, 
  getStudentDashboard,
  updateStudentProfile,
  changePassword,
  getNotificationSettings,
  updateNotificationSettings,
  getPrivacySettings,
  updatePrivacySettings,
  uploadStudentResume,
  deleteStudentResume,
  getStudentResumes,
  deactivateAccount,
  deleteAccount
};
