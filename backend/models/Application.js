const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    resume: {
      type: String, // Mirroring the resume at the time of application
      required: true,
    },
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'],
      default: 'Applied',
    },
    feedback: String,
    interviewDate: Date,
    interviewLink: String,
  },
  {
    timestamps: true,
  }
);

// Ensure a student can only apply once per job
applicationSchema.index({ student: 1, job: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
