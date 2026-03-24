const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company_name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    interview_date: {
      type: Date,
      required: true,
    },
    interview_time: {
      type: String,
      required: true,
    },
    interview_mode: {
      type: String,
      enum: ['Online', 'Offline'],
      default: 'Online',
    },
    round: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Completed', 'Missed'],
      default: 'Upcoming',
    },
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;
