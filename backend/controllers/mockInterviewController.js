const prisma = require('../utils/prisma');
const sendEmail = require('../utils/emailUtils');

// @desc    Book a mock interview
// @route   POST /api/mock-interviews/book
// @access  Private (Student)
const bookMockInterview = async (req, res, next) => {
  try {
    const { type, date, slot } = req.body;
    const mentorProfiles = await prisma.mentorProfile.findMany({ 
      where: { expertise: { has: type }, isActive: true } 
    });

    if (mentorProfiles.length === 0) return res.status(404).json({ message: 'No available mentors.' });

    const mentorIds = mentorProfiles.map(p => p.id);
    const scheduledDate = new Date(date);
    scheduledDate.setHours(0,0,0,0);

    const availableSlot = await prisma.mentorAvailability.findFirst({
      where: { mentorId: { in: mentorIds }, date: scheduledDate, timeSlot: slot, isBooked: false },
      include: { mentor: { include: { user: true } } }
    });

    if (!availableSlot) return res.status(404).json({ message: 'No slots available.' });

    const mentor = availableSlot.mentor;
    await prisma.mentorAvailability.update({ where: { id: availableSlot.id }, data: { isBooked: true } });

    const typeMapping = {
      'Technical Interview': 'Technical', 'HR Interview': 'HR',
      'Aptitude Prep': 'Aptitude', 'System Design': 'System Design',
      'Group Discussion': 'Group Discussion', 'Resume Clinic': 'Resume Clinic'
    };

    const mockInterview = await prisma.mockInterview.create({
      data: {
        studentId: req.user.id,
        mentorId: mentor.id,
        type: typeMapping[type] || type,
        date: scheduledDate,
        time: slot,
      }
    });

    await prisma.notification.createMany({
      data: [
        { userId: req.user.id, title: 'Mock Interview Booked', message: `Booked with ${mentor.user.name}`, type: 'interview' },
        { userId: mentor.userId, title: 'New Mock Interview Request', message: `Scheduled for ${date}`, type: 'interview' }
      ]
    });

    res.status(201).json({ success: true, data: { ...mockInterview, _id: mockInterview.id }, message: 'Mock interview booked successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get mock interview stats
// @route   GET /api/mock-interviews/stats
// @access  Private (Student)
const getMockInterviewStats = async (req, res, next) => {
  try {
    const [total, upcoming, completed] = await Promise.all([
      prisma.mockInterview.count({ where: { studentId: req.user.id } }),
      prisma.mockInterview.count({ where: { studentId: req.user.id, status: 'scheduled' } }),
      prisma.mockInterview.count({ where: { studentId: req.user.id, status: 'completed' } })
    ]);
    
    const completedInterviews = await prisma.mockInterview.findMany({ 
      where: { studentId: req.user.id, status: 'completed' } 
    });
    const totalScore = completedInterviews.reduce((acc, curr) => acc + (curr.performance?.overallScore || 0), 0);
    const avgPerformance = completedInterviews.length > 0 ? (totalScore / completedInterviews.length).toFixed(1) : 0;

    res.json({ total, upcoming, completed, avgPerformance });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upcoming mock interviews
// @route   GET /api/mock-interviews/upcoming
// @access  Private (Student)
const getUpcomingMockInterviews = async (req, res, next) => {
  try {
    const interviews = await prisma.mockInterview.findMany({ 
      where: { studentId: req.user.id, status: 'scheduled' },
      include: { mentor: { include: { user: { select: { name: true, profilePhoto: true, email: true } } } } },
      orderBy: { date: 'asc' }
    });
    res.json(interviews.map(i => ({ ...i, _id: i.id, mentor_id: { ...i.mentor.user, _id: i.mentor.id } })));
  } catch (error) {
    next(error);
  }
};

// @desc    Get past mock interview history
// @route   GET /api/mock-interviews/history
// @access  Private (Student)
const getMockInterviewHistory = async (req, res, next) => {
  try {
    const interviews = await prisma.mockInterview.findMany({ 
      where: { studentId: req.user.id, status: 'completed' },
      include: { mentor: { include: { user: { select: { name: true, profilePhoto: true } } } } },
      orderBy: { date: 'desc' }
    });
    res.json(interviews.map(i => ({ ...i, _id: i.id, mentor_id: { ...i.mentor.user, _id: i.mentor.id } })));
  } catch (error) {
    next(error);
  }
};

// @desc    Get mock interview analytics
// @route   GET /api/mock-interviews/analytics
// @access  Private (Student)
const getMockInterviewAnalytics = async (req, res, next) => {
  try {
    const latest = await prisma.mockInterview.findFirst({ 
      where: { studentId: req.user.id, status: 'completed' },
      orderBy: { date: 'desc' }
    });

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
    const interview = await prisma.mockInterview.update({
      where: { id },
      data: { status: 'cancelled' }
    });

    await prisma.mentorAvailability.updateMany({
      where: { mentorId: interview.mentorId, date: interview.date, timeSlot: interview.time },
      data: { isBooked: false }
    });

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
    const interview = await prisma.mockInterview.update({
      where: { id },
      data: {
        status: 'completed',
        performance: performance || undefined,
        feedback: feedback || undefined
      }
    });

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
