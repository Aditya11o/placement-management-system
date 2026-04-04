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
      type: String, // URL
      required: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentResume',
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
    timestamps: true,
  }
);

// Indexes
applicationSchema.index({ student: 1, job: 1 }, { unique: true });
applicationSchema.index({ job: 1, status: 1 });

// Compatibility with old code that might expect application_id or student_id as virtuals
applicationSchema.virtual('application_id').get(function() { return this._id.toString(); });
applicationSchema.virtual('student_id').get(function() { return this.student; });
applicationSchema.virtual('job_id').get(function() { return this.job; });
applicationSchema.virtual('applied_date').get(function() { return this.createdAt; });

applicationSchema.set('toJSON', { virtuals: true });
applicationSchema.set('toObject', { virtuals: true });

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
