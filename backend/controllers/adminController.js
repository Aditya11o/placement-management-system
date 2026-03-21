const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalRecruiters = await User.countDocuments({ role: 'recruiter' });
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const placedStudents = await Application.countDocuments({ status: 'Selected' });

    res.json({
      totalStudents,
      totalRecruiters,
      totalJobs,
      totalApplications,
      placedStudents,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify/Update user status
// @route   PATCH /api/admin/users/:id/verify
// @access  Private (Admin)
const verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.isVerified = req.body.isVerified ?? user.isVerified;
      user.status = req.body.status ?? user.status;
      await user.save();
      res.json({ message: 'User verification status updated' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Send broadcast to all students
// @route   POST /api/admin/broadcast
// @access  Private (Admin)
const sendBroadcast = async (req, res) => {
  const { message, type } = req.body;

  try {
    const students = await User.find({ role: 'student' });
    const notifications = students.map((student) => ({
      recipient: student._id,
      message,
      type: type || 'broadcast',
      sender: req.user.id,
    }));

    await Notification.insertMany(notifications);

    // Emit live socket event to all students
    const io = req.app.get('io');
    io.emit('broadcast', { message, type: type || 'broadcast' });

    res.json({ message: 'Broadcast sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all scheduled interviews
// @route   GET /api/admin/interviews
// @access  Private (Admin)
const getInterviews = async (req, res) => {
  try {
    const interviews = await Application.find({
      'interview.date': { $exists: true, $ne: null }
    })
    .populate('student', 'name email')
    .populate('job', 'title companyName')
    .sort({ 'interview.date': 1 });

    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get detailed placement reports
// @route   GET /api/admin/reports/placements
// @access  Private (Admin)
const getPlacementReports = async (req, res) => {
  try {
    const placements = await Application.find({ status: 'Selected' })
      .populate('student', 'name email')
      .populate('job', 'title companyName salary')
      .sort({ updatedAt: -1 });

    res.json(placements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats, getUsers, verifyUser, sendBroadcast, getInterviews, getPlacementReports };
