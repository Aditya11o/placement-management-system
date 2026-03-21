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
      enum: ['Applied', 'Shortlisted', 'Rejected', 'Selected', 'Under Review'],
      default: 'Applied',
    },
  },
  {
    timestamps: { createdAt: 'applied_date', updatedAt: 'updated_at' },
  }
);

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
