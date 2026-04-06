const prisma = require('../utils/prisma');

// @desc    Get interviews for a specific student
// @route   GET /api/interviews/:studentId
// @access  Private
const getStudentInterviews = async (req, res, next) => {
  try {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.params.studentId } });
    const interviews = await prisma.interview.findMany({
      where: { studentId: profile.id },
      include: { job: { select: { title: true, companyName: true } } },
      orderBy: { date: 'asc' }
    });

    res.json({ message: 'Interviews found', data: interviews.map(i => ({ ...i, _id: i.id })) });
  } catch (error) {
    next(error);
  }
};

// @desc    Export interviews as ICS content
// @route   GET /api/interviews/:studentId/export
// @access  Private
const exportInterviewsICS = async (req, res, next) => {
  try {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.params.studentId } });
    const interviews = await prisma.interview.findMany({
      where: { studentId: profile.id },
      include: { job: { select: { title: true, companyName: true } } }
    });

    if (interviews.length === 0) {
      return res.status(404).json({ message: 'No interviews scheduled yet.' });
    }

    const formatDate = (date) => new Date(date).toISOString().replace(/-|:|\.\d+/g, '');

    let icsContent = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PMS//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'
    ];

    interviews.forEach((i) => {
      const start = new Date(i.date);
      const end = new Date(start.getTime() + 60 * 60 * 1000); 
      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:${i.id}@pms.com`);
      icsContent.push(`DTSTAMP:${formatDate(new Date())}`);
      icsContent.push(`DTSTART:${formatDate(start)}`);
      icsContent.push(`DTEND:${formatDate(end)}`);
      icsContent.push(`SUMMARY:Interview: ${i.job?.title || 'Job'} @ ${i.job?.companyName || 'Company'}`);
      icsContent.push(`DESCRIPTION:Round: ${i.round}. Mode: ${i.mode}`);
      icsContent.push(`LOCATION:${i.mode === 'Online' ? 'Remote Link' : 'On Campus'}`);
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
const getInterviewHistory = async (req, res, next) => {
  try {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.params.studentId } });
    const interviews = await prisma.interview.findMany({
      where: { studentId: profile.id },
      include: { job: { select: { title: true, companyName: true } } },
      orderBy: { date: 'desc' }
    });
    res.json(interviews.map(i => ({ ...i, _id: i.id })));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentInterviews,
  exportInterviewsICS,
  getInterviewHistory
};
