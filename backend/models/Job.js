const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    recruiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    location: String,
    salary: String,
    jobType: {
      type: String,
      enum: ['Full-time', 'Internship', 'Contract'],
      default: 'Full-time',
    },
    eligibility: {
      minCGPA: {
        type: Number,
        default: 0,
      },
      branches: [String],
      skills: [String],
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'pending'],
      default: 'pending', // Pending approval by Admin
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
