const MockInterview = require('../models/MockInterview');
const User = require('../models/User');
const MentorProfile = require('../models/MentorProfile');
const MentorAvailability = require('../models/MentorAvailability');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/emailUtils');

// @desc    Book a mock interview
// @route   POST /api/mock-interviews/book
// @access  Private (Student)
const bookMockInterview = async (req, res, next) => {
  try {
    const { type, date, slot } = req.body;

    // 1. Find mentors with the required expertise
    const mentorProfiles = await MentorProfile.find({ 
      expertise: type, 
      is_active: true 
    });

    if (mentorProfiles.length === 0) {
      return res.status(404).json({ message: 'No available mentors with this expertise at the moment.' });
    }

    const mentorIds = mentorProfiles.map(p => p.user_id);
    const scheduledDate = new Date(date);
    scheduledDate.setHours(0,0,0,0);

    // 2. Find an available slot among these mentors
    const availableSlot = await MentorAvailability.findOne({
      mentor_id: { $in: mentorIds },
      date: scheduledDate,
      time_slot: slot,
      is_booked: false
    }).populate('mentor_id', 'name email');

    if (!availableSlot) {
      return res.status(404).json({ message: 'No mentors available for selected time. Please choose another slot.' });
    }

    const mentor = availableSlot.mentor_id;

    // 3. Mark slot as booked and create mock interview
    availableSlot.is_booked = true;
    await availableSlot.save();

    // Map frontend full titles to model enums
    const typeMapping = {
      'Technical Interview': 'Technical',
      'HR Interview': 'HR',
      'Aptitude Prep': 'Aptitude',
      'System Design': 'System Design',
      'Group Discussion': 'Group Discussion',
      'Resume Clinic': 'Resume Clinic'
    };

    const mockInterview = await MockInterview.create({
      student: req.user.id,
      mentor: mentor._id,
      type: typeMapping[type] || type,
      scheduledAt: scheduledDate,
      slot,
    });

    // 4. Send Notifications
    // To Student
    await Notification.create({
      user_id: req.user.id,
      title: 'Mock Interview Booked',
      message: `Your ${type} mock interview has been successfully booked with ${mentor.name} for ${date} at ${slot}.`,
      type: 'interview',
      link: '/student/mock-interviews'
    });

    // To Mentor
    await Notification.create({
      user_id: mentor._id,
      title: 'New Mock Interview Request',
      message: `A new ${type} mock interview has been scheduled with a student for ${date} at ${slot}.`,
      type: 'interview',
      link: '/mentor/interviews'
    });

    // 5. Send Email to Student
    try {
      await sendEmail({
        email: req.user.email,
        subject: `Mock Interview Confirmed: ${type}`,
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

    res.status(201).json({
      success: true,
      data: mockInterview,
      message: 'Mock interview booked successfully.'
    });
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
    const upcoming = await MockInterview.countDocuments({ 
      student: req.user.id, 
      status: 'Scheduled'
    });
    const completed = await MockInterview.countDocuments({ student: req.user.id, status: 'Completed' });
    
    // Calculate average performance
    const completedInterviews = await MockInterview.find({ student: req.user.id, status: 'Completed' });
    const totalScore = completedInterviews.reduce((acc, curr) => acc + (curr.performance?.overallScore || 0), 0);
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
    .populate('mentor', 'name profilePhoto email')
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
    .populate('mentor', 'name profilePhoto')
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

    if (latest && latest.performance) {
      res.json({
        communication: latest.performance.communication || 0,
        technical: latest.performance.technical || 0,
        confidence: latest.performance.confidence || 0,
        overallScore: latest.performance.overallScore || 0
      });
    } else {
      res.json({ communication: 0, technical: 0, confidence: 0, overallScore: 0 });
    }
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
