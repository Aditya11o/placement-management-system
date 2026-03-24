const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    issue_type: {
      type: String,
      enum: [
        'Account Management',
        'Job Applications',
        'Interview Support',
        'Resume Builder',
        'Technical Issues',
        'Other Queries'
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open',
    },
    screenshot_path: {
      type: String,
    },
    response: {
      type: String,
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
