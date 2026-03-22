const MockInterview = require('../models/MockInterview');
const User = require('../models/User');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/emailUtils');

// @desc    Book a mock interview
// @route   POST /api/mock-interviews/book
// @access  Private (Student)
const bookMockInterview = async (req, res) => {
  try {
    const { type, date, slot } = req.body;

    // 1. Find an available mentor or admin
    const mentors = await User.find({ role: { $in: ['mentor', 'admin'] }, status: 'active' });
    if (mentors.length === 0) {
      return res.status(404).json({ message: 'No available mentors at the moment.' });
    }

    // Pick a random mentor for now (could be more complex logic)
    const mentor = mentors[Math.floor(Math.random() * mentors.length)];

    // 2. Check for double booking
    const scheduledAt = new Date(date);
    const existing = await MockInterview.findOne({ 
      mentor: mentor._id, 
      scheduledAt, 
      slot,
      status: 'Scheduled' 
    });

    if (existing) {
      return res.status(400).json({ message: 'The selected slot is already booked for this mentor. Please try another time.' });
    }

    // 3. Create booking
    const mockInterview = await MockInterview.create({
      student: req.user.id,
      mentor: mentor._id,
      type,
      scheduledAt,
      slot,
    });

    // 4. Send Notification & Email
    await Notification.create({
      recipient: req.user.id,
      message: `Your ${type} mock interview is scheduled for ${date} at ${slot}.`,
      type: 'interview',
      link: '/mock-interviews'
    });

    try {
      await sendEmail({
        email: req.user.email,
        subject: `Mock Interview Scheduled: ${type}`,
        message: `<h3>Mock Interview Booking Confirmed</h3>
                 <p>Your ${type} mock interview has been scheduled with <strong>${mentor.name}</strong>.</p>
                 <p><strong>Date:</strong> ${date}</p>
                 <p><strong>Time:</strong> ${slot}</p>
                 <p><strong>Mode:</strong> Online</p>
                 <p>Please be ready 5 minutes before the start time.</p>`
      });
    } catch (err) {
      console.error('Failed to send booking email:', err);
    }

    res.status(201).json(mockInterview);
  } catch (error) {
    next(error);
  }
};

// @desc    Get mock interview stats
// @route   GET /api/mock-interviews/stats
// @access  Private (Student)
const getMockInterviewStats = async (req, res, next) => {
  try {
    const total = await MockInterview.countDocuments({ student: req.user.id });
    const upcoming = await MockInterview.countDocuments({ student: req.user.id, status: 'Scheduled', scheduledAt: { $gte: new Date() } });
    const completed = await MockInterview.countDocuments({ student: req.user.id, status: 'Completed' });
    
    // Calculate average performance
    const completedInterviews = await MockInterview.find({ student: req.user.id, status: 'Completed' });
    const totalScore = completedInterviews.reduce((acc, curr) => acc + (curr.performance.overallScore || 0), 0);
    const avgPerformance = completedInterviews.length > 0 ? (totalScore / completedInterviews.length).toFixed(1) : 0;

    res.json({
      total,
      upcoming,
      completed,
      avgPerformance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming mock interviews
// @route   GET /api/mock-interviews/upcoming
// @access  Private (Student)
const getUpcomingMockInterviews = async (req, res, next) => {
  try {
    const interviews = await MockInterview.find({ 
      student: req.user.id, 
      status: 'Scheduled'
    })
    .populate('mentor', 'name profilePhoto')
    .sort({ scheduledAt: 1 });

    res.json(interviews);
  } catch (error) {
    next(error);
  }
};

// @desc    Get past mock interview history
// @route   GET /api/mock-interviews/history
// @access  Private (Student)
const getMockInterviewHistory = async (req, res, next) => {
  try {
    const interviews = await MockInterview.find({ 
      student: req.user.id, 
      status: 'Completed' 
    })
    .populate('mentor', 'name')
    .sort({ scheduledAt: -1 });

    res.json(interviews);
  } catch (error) {
    next(error);
  }
};

// @desc    Get mock interview analytics
// @route   GET /api/mock-interviews/analytics
// @access  Private (Student)
const getMockInterviewAnalytics = async (req, res, next) => {
  try {
    const latest = await MockInterview.findOne({ 
      student: req.user.id, 
      status: 'Completed' 
    }).sort({ scheduledAt: -1 });

    res.json(latest ? latest.performance : { communication: 0, technical: 0, confidence: 0 });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookMockInterview,
  getMockInterviewStats,
  getUpcomingMockInterviews,
  getMockInterviewHistory,
  getMockInterviewAnalytics
};
