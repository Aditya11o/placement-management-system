const prisma = require('../utils/prisma');

/**
 * @desc    Create an institutional event
 * @route   POST /api/settings/calendar/events
 * @access  Private (Admin)
 */
const createEvent = async (req, res, next) => {
  try {
    const { title, description, startDate, endDate, category, priority, isGlobal } = req.body;

    const event = await prisma.academicEvent.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        category,
        priority: priority || 'MEDIUM',
        isGlobal: isGlobal ?? true,
        createdById: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregated calendar events for a date range
 * @route   GET /api/settings/calendar
 * @access  Private (Authenticated)
 */
const getCalendarEvents = async (req, res, next) => {
  try {
    const { start, end } = req.query; // Expecting ISO strings

    if (!start || !end) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    // 1. Fetch AcademicEvents
    const academicEvents = await prisma.academicEvent.findMany({
      where: {
        OR: [
          {
            startDate: { gte: startDate, lte: endDate },
          },
          {
            endDate: { gte: startDate, lte: endDate },
          },
          {
            AND: [
              { startDate: { lte: startDate } },
              { endDate: { gte: endDate } },
            ],
          },
        ],
      },
      include: {
        createdBy: {
          select: { name: true }
        }
      }
    });

    // 2. Fetch Placement Drives
    const drives = await prisma.placementDrive.findMany({
      where: {
        OR: [
          { startDate: { gte: startDate, lte: endDate } },
          { endDate: { gte: startDate, lte: endDate } },
        ],
      },
    });

    // 3. Fetch Job Deadlines
    const jobs = await prisma.job.findMany({
      where: {
        deadline: { gte: startDate, lte: endDate },
      },
      select: {
        id: true,
        title: true,
        companyName: true,
        deadline: true,
      },
    });

    // Transform into a unified format
    const events = [
      ...academicEvents.map(e => ({
        id: e.id,
        title: e.title,
        description: e.description,
        start: e.startDate,
        end: e.endDate || e.startDate,
        type: 'academic',
        category: e.category,
        priority: e.priority,
        meta: { createdBy: e.createdBy?.name }
      })),
      ...drives.map(d => ({
        id: d.id,
        title: `Drive: ${d.name}`,
        description: d.description,
        start: d.startDate,
        end: d.endDate,
        type: 'drive',
        category: 'PLACEMENT',
        priority: 'HIGH'
      })),
      ...jobs.map(j => ({
        id: j.id,
        title: `Deadline: ${j.title} (${j.companyName})`,
        start: j.deadline,
        end: j.deadline,
        type: 'job',
        category: 'PLACEMENT',
        priority: 'MEDIUM'
      }))
    ];

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an event
 * @route   DELETE /api/settings/calendar/events/:id
 * @access  Private (Admin)
 */
const deleteEvent = async (req, res, next) => {
  try {
    await prisma.academicEvent.delete({
      where: { id: req.params.id },
    });

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an event
 * @route   PUT /api/settings/calendar/events/:id
 * @access  Private (Admin)
 */
const updateEvent = async (req, res, next) => {
  try {
    const { title, description, startDate, endDate, category, priority, isGlobal } = req.body;

    const event = await prisma.academicEvent.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        category,
        priority,
        isGlobal,
      },
    });

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getCalendarEvents,
  deleteEvent,
  updateEvent,
};
