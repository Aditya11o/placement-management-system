const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    report_id: {
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
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CompanyProfile',
      required: true,
    },
    job_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    package: {
      type: String, // e.g. "12 LPA"
      required: true,
    },
    placement_date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Offered', 'Accepted', 'Joined', 'Rejected'],
      default: 'Offered',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
