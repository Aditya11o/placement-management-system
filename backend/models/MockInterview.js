const mongoose = require('mongoose');

const mockInterviewSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Should have role 'mentor' or 'admin'
    },
    type: {
      type: String,
      required: true,
      enum: ['Technical', 'HR', 'Aptitude', 'System Design', 'Group Discussion', 'Resume Clinic'],
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    slot: {
      type: String, // e.g. "09:00 AM"
      required: true,
    },
    mode: {
      type: String,
      default: 'Online',
    },
    meetingLink: {
      type: String,
      default: 'https://meet.google.com/mock-interview-link',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'No-show'],
      default: 'Scheduled',
    },
    performance: {
      communication: { type: Number, min: 0, max: 100, default: 0 },
      technical: { type: Number, min: 0, max: 100, default: 0 },
      confidence: { type: Number, min: 0, max: 100, default: 0 },
      overallScore: { type: Number, min: 0, max: 100, default: 0 },
    },
    feedback: {
      type: String,
    },
    mentorNote: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

// Prevent double booking for same mentor at same time/date
mockInterviewSchema.index({ mentor: 1, scheduledAt: 1, slot: 1 }, { unique: true });

const MockInterview = mongoose.model('MockInterview', mockInterviewSchema);

module.exports = MockInterview;
