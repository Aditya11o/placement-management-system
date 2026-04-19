const prisma = require('../utils/prisma');

// @desc    Get interviews for a specific student
// @route   GET /api/interviews/:studentId
// @access  Private
const getStudentInterviews = async (req, res, next) => {
  try {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.params.studentId } });
    const interviews = await prisma.interview.findMany({
      where: { application: { studentId: profile.id } },
      include: { application: { include: { job: { select: { title: true, companyName: true } } } } },
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
      where: { application: { studentId: profile.id } },
      include: { application: { include: { job: { select: { title: true, companyName: true } } } } }
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
      const job = i.application?.job;
      icsContent.push(`SUMMARY:Interview: ${job?.title || 'Job'} @ ${job?.companyName || 'Company'}`);
      icsContent.push(`DESCRIPTION:Round: ${i.type || 'Interview'}. Link: ${i.link || 'TBD'}`);
      icsContent.push(`LOCATION:${i.link ? i.link : 'On Campus'}`);
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
      where: { application: { studentId: profile.id } },
      include: { application: { include: { job: { select: { title: true, companyName: true } } } } },
      orderBy: { date: 'desc' }
    });
    res.json(interviews.map(i => ({ ...i, _id: i.id })));
  } catch (error) {
    next(error);
  }
};

// @desc    Select an interview slot
// @route   PATCH /api/interviews/:id/select-slot
// @access  Private (Student)
const selectInterviewSlot = async (req, res, next) => {
  try {
    const { slotId } = req.body;
    const interview = await prisma.interview.findUnique({
      where: { id: req.params.id },
      include: { application: true }
    });

    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    
    // Check authorization: must be the student
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile || interview.application.studentId !== profile.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (interview.selectedSlot) {
      return res.status(400).json({ message: 'A slot has already been selected.' });
    }

    // Validate slotId exists in availableSlots
    let slots = [];
    if (typeof interview.availableSlots === 'string') {
        slots = JSON.parse(interview.availableSlots);
    } else if (Array.isArray(interview.availableSlots)) {
        slots = interview.availableSlots;
    }
    
    const selectedSlot = slots.find(s => s.id === slotId);
    if (!selectedSlot) {
      return res.status(400).json({ message: 'Invalid slot selected.' });
    }

    const updatedInterview = await prisma.interview.update({
      where: { id: req.params.id },
      data: {
        selectedSlot: slotId,
        date: new Date(selectedSlot.time) // Assuming available slots have a `time` field
      }
    });

    res.json({ ...updatedInterview, _id: updatedInterview.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentInterviews,
  exportInterviewsICS,
  getInterviewHistory,
  selectInterviewSlot
};
