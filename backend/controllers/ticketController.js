const prisma = require('../utils/prisma');

// @desc    Create a new support ticket
// @route   POST /api/tickets
// @access  Private (Student)
const createTicket = async (req, res, next) => {
  try {
    const { subject, message, issue_type } = req.body;
    const ticket = await prisma.ticket.create({
      data: {
        userId: req.user.id,
        subject: subject || issue_type,
        message,
        issueType: issue_type,
        screenshotPath: req.file ? req.file.path : ''
      }
    });
    res.status(201).json({ ...ticket, _id: ticket.id });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tickets (Admin) or user's tickets (Student)
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res, next) => {
  try {
    const where = req.user.role !== 'admin' ? { userId: req.user.id } : {};
    const tickets = await prisma.ticket.findMany({
      where,
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tickets.map(t => ({ ...t, _id: t.id, user: { ...t.user, _id: t.userId } })));
  } catch (error) {
    next(error);
  }
};

// @desc    Update ticket status/response (Admin)
// @route   PATCH /api/tickets/:id
// @access  Private (Admin)
const updateTicket = async (req, res, next) => {
  try {
    const { status, response } = req.body;
    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: {
        status,
        response,
        resolvedAt: status === 'resolved' ? new Date() : undefined
      }
    });

    res.json({ ...ticket, _id: ticket.id });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTicket, getTickets, updateTicket };
