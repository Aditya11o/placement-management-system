const mongoose = require('mongoose');

const mentorshipBookingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    alumni: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending',
    },
    requestedDate: {
      type: Date,
      required: true,
    },
    query: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    meetingLink: {
      type: String,
      default: '',
    },
    feedback: {
      type: String,
      default: '',
    }
  },
  {
    timestamps: true,
  }
);

const MentorshipBooking = mongoose.model('MentorshipBooking', mentorshipBookingSchema);

module.exports = MentorshipBooking;
