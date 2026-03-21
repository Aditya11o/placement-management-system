const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    job_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CompanyProfile',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    skills_required: [
      {
        type: String,
        trim: true,
      },
    ],
    min_cgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    course: {
      type: String,
      required: true,
    },
    job_type: {
      type: String,
      required: true,
      enum: ['Full-time', 'Internship', 'Contract', 'PPO'],
    },
    location: {
      type: String,
      required: true,
    },
    salary: {
      type: String, // Can be text like "12 LPA" or specific formatting
      required: true,
    },
    last_date: {
      type: Date,
      required: true,
    },
    openings: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Open', 'Closed', 'Paused', 'Archived'],
      default: 'Open',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
