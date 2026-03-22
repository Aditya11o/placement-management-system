const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    application_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    job_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    resume: {
      type: String, // URL
      required: true,
    },
    status: {
      type: String,
      enum: ['Applied', 'Shortlisted', 'Rejected', 'Selected', 'Under Review', 'Scheduled', 'Placed', 'Accepted', 'Declined'],
      default: 'Applied',
    },
    offerLetter: {
      type: String, // URL
    },
    feedback: {
      type: String,
    },
    interviewDate: {
      type: Date,
    },
    interviewLink: {
      type: String,
    },
    evaluation: {
      technical: { type: Number, min: 0, max: 10 },
      communication: { type: Number, min: 0, max: 10 },
      problemSolving: { type: Number, min: 0, max: 10 },
      overallFeedback: { type: String },
    },
    answers: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId },
        question: { type: String },
        answer: { type: String }
      }
    ],
  },
  {
    timestamps: { createdAt: 'applied_date', updatedAt: 'updated_at' },
  }
);

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
