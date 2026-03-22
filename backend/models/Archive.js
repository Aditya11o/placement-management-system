const mongoose = require('mongoose');

const archiveSchema = new mongoose.Schema(
  {
    academicYear: {
      type: String,
      required: true,
      unique: true,
    },
    totalJobs: Number,
    totalApplications: Number,
    placedStudents: Number,
    averageSalary: Number,
    topCompanies: [String],
    departmentStats: [
      {
        dept: String,
        placed: Number,
        total: Number,
      }
    ],
    archivedData: {
      // Store raw JSON of critical metrics or links to a file
      type: Object,
    },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Archive = mongoose.model('Archive', archiveSchema);

module.exports = Archive;
