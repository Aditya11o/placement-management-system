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
      student_id: req.user.id,
      mentor_id: mentor._id,
      interview_type: typeMapping[type] || type,
      interview_date: scheduledDate,
      interview_time: slot,
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
    const total = await MockInterview.countDocuments({ student_id: req.user.id });
    const upcoming = await MockInterview.countDocuments({ 
      student_id: req.user.id, 
      status: 'scheduled'
    });
    const completed = await MockInterview.countDocuments({ student_id: req.user.id, status: 'completed' });
    
    // Calculate average performance
    const completedInterviews = await MockInterview.find({ student_id: req.user.id, status: 'completed' });
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
      student_id: req.user.id, 
      status: 'scheduled',
      interview_date: { $gte: new Date().setHours(0,0,0,0) }
    })
    .populate('mentor_id', 'name profilePhoto email')
    .sort({ interview_date: 1 });

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
      student_id: req.user.id, 
      status: 'completed' 
    })
    .populate('mentor_id', 'name profilePhoto')
    .sort({ interview_date: -1 });

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
      student_id: req.user.id, 
      status: 'completed' 
    }).sort({ interview_date: -1 });

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

// @desc    Cancel a mock interview
// @route   PUT /api/interviews/cancel
// @access  Private (Student/Mentor)
const cancelMockInterview = async (req, res, next) => {
  try {
    const { id } = req.body;
    const interview = await MockInterview.findById(id);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    interview.status = 'cancelled';
    await interview.save();

    // Re-enable mentor availability if needed (optional but recommended)
    await MentorAvailability.findOneAndUpdate(
      { mentor_id: interview.mentor_id, date: interview.interview_date, time_slot: interview.interview_time },
      { is_booked: false }
    );

    res.json({ success: true, message: 'Interview cancelled successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark mock interview as completed
// @route   PUT /api/interviews/complete
// @access  Private (Mentor)
const completeMockInterview = async (req, res, next) => {
  try {
    const { id, performance, feedback } = req.body;
    const interview = await MockInterview.findById(id);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    interview.status = 'completed';
    if (performance) interview.performance = performance;
    if (feedback) interview.feedback = feedback;
    
    await interview.save();

    res.json({ success: true, message: 'Interview marked as completed.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookMockInterview,
  getMockInterviewStats,
  getUpcomingMockInterviews,
  getMockInterviewHistory,
  getMockInterviewAnalytics,
  cancelMockInterview,
  completeMockInterview
};
