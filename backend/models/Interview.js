const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    interview_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    application_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    interview_date: {
      type: Date,
      required: true,
    },
    interview_time: {
      type: String, // e.g. "10:30 AM"
      required: true,
    },
    mode: {
      type: String,
      required: true,
      enum: ['Online', 'In-person'],
    },
    meeting_link: {
      type: String,
    },
    location: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Rescheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;
