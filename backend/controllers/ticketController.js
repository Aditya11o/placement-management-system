const Ticket = require('../models/Ticket');

// @desc    Create a new support ticket
// @route   POST /api/tickets
// @access  Private (Student)
const createTicket = async (req, res, next) => {
  try {
    const { subject, description, priority } = req.body;
    const ticket = await Ticket.create({
      student: req.user._id,
      subject,
      description,
      priority,
    });
    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tickets (Admin) or user's tickets (Student)
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query.student = req.user._id;
    }
    const tickets = await Ticket.find(query).populate('student', 'name email').sort({ createdAt: -1 });
    res.json(tickets);
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
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (status) ticket.status = status;
    if (response) ticket.response = response;
    if (status === 'resolved') ticket.resolvedAt = Date.now();

    await ticket.save();
    res.json(ticket);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTicket,
  getTickets,
  updateTicket,
};
