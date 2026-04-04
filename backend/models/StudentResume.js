const mongoose = require('mongoose');

const studentResumeSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resume_url: {
      type: String,
      required: true,
    },
    resume_name: {
      type: String,
      required: true,
    },
    isBuilt: {
      type: Boolean,
      default: false,
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    stats: {
      applications: { type: Number, default: 0 },
      shortlists: { type: Number, default: 0 },
    },
    upload_date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'student_resumes'
  }
);

const StudentResume = mongoose.model('StudentResume', studentResumeSchema);

module.exports = StudentResume;
