const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    job_id: {
      type: String,
      unique: true,
    },
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
    location: {
      type: String,
      required: true,
    },
    salary: {
      type: String,
      required: true,
    },
    jobType: {
      type: String,
      required: true,
      enum: ['Full-time', 'Internship', 'Contract', 'PPO'],
    },
    eligibility: {
      minCGPA: { type: Number, default: 0 },
      branches: [String],
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'paused', 'archived'],
      default: 'open',
    },
    applicationsCount: {
      type: Number,
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    screeningQuestions: [
      {
        question: { type: String, required: true },
        type: { type: String, enum: ['text', 'boolean'], default: 'text' }
      }
    ],
    isAlumniPost: {
      type: Boolean,
      default: false,
    },
    mentorInfo: {
      linkedIn: String,
      company: String,
    }
  },
  {
    timestamps: true,
  }
);

// Indexes
jobSchema.index({ status: 1, deadline: 1 });
jobSchema.index({ recruiter: 1 });

// Pre-save hook to generate job_id
jobSchema.pre('save', async function() {
  if (this.isNew && !this.job_id) {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.job_id = `JOB-${random}`;
  }
});

// Virtuals for compatibility with snake_case code if any
jobSchema.virtual('job_type').get(function() { return this.jobType; });
jobSchema.virtual('last_date').get(function() { return this.deadline; });
jobSchema.virtual('created_at').get(function() { return this.createdAt; });

jobSchema.set('toJSON', { virtuals: true });
jobSchema.set('toObject', { virtuals: true });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
