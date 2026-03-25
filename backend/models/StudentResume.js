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
