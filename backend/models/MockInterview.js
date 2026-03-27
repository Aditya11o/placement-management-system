const mongoose = require('mongoose');

const mockInterviewSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mentor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    interview_type: {
      type: String,
      required: true,
      enum: ['Technical', 'HR', 'Aptitude', 'System Design', 'Group Discussion', 'Resume Clinic'],
    },
    interview_date: {
      type: Date,
      required: true,
    },
    interview_time: {
      type: String, // e.g. "09:00 AM"
      required: true,
    },
    meeting_link: {
      type: String,
      default: 'https://meet.google.com/mock-interview-link',
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
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
    collection: 'interviews'
  }
);

// Prevent double booking for same mentor at same time/date
mockInterviewSchema.index({ mentor_id: 1, interview_date: 1, interview_time: 1 }, { unique: true });

const MockInterview = mongoose.model('MockInterview', mockInterviewSchema);

module.exports = MockInterview;
