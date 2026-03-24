const Interview = require('../models/Interview');

// @desc    Get interviews for a specific student
// @route   GET /api/interviews/:studentId
// @access  Private
exports.getStudentInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ student_id: req.params.studentId }).sort({ interview_date: 1 });
    
    if (interviews.length === 0) {
      return res.json({ message: 'No interviews', data: [] });
    }
    
    res.json({ message: 'Interviews found', data: interviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Export interviews as ICS content
// @route   GET /api/interviews/:studentId/export
// @access  Private
exports.exportInterviewsICS = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ student_id: req.params.studentId });
    
    if (interviews.length === 0) {
      return res.status(404).json({ message: 'No interviews scheduled yet. Once interviews are scheduled, you can export them to your calendar.' });
    }

    const formatDate = (date) => {
      return new Date(date).toISOString().replace(/-|:|\.\d+/g, '');
    };

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Placement Management System//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    interviews.forEach((interview) => {
      const start = new Date(interview.interview_date);
      const end = new Date(start.getTime() + 60 * 60 * 1000); 
      
      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:${interview._id}@pms.com`);
      icsContent.push(`DTSTAMP:${formatDate(new Date())}`);
      icsContent.push(`DTSTART:${formatDate(start)}`);
      icsContent.push(`DTEND:${formatDate(end)}`);
      icsContent.push(`SUMMARY:Interview: ${interview.role} @ ${interview.company_name}`);
      icsContent.push(`DESCRIPTION:Round: ${interview.round}. Mode: ${interview.interview_mode}`);
      icsContent.push(`LOCATION:${interview.interview_mode === 'Online' ? 'Remote Link' : 'On Campus'}`);
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', 'attachment; filename=interviews.ics');
    res.send(icsContent.join('\r\n'));
  } catch (error) {
    next(error);
  }
};
// @desc    Get complete interview history for a student
// @route   GET /api/interviews/history/:studentId
// @access  Private
exports.getInterviewHistory = async (req, res, next) => {
  try {
    const interviews = await Interview.find({ student_id: req.params.studentId }).sort({ interview_date: -1 });
    res.json(interviews);
  } catch (error) {
    next(error);
  }
};
