const Archive = require('../models/Archive');
const Job = require('../models/Job');
const Application = require('../models/Application');
const StudentProfile = require('../models/StudentProfile');

// @desc    Archive current academic year
// @route   POST /api/admin/archive
// @access  Private/Admin
const archiveYear = async (req, res) => {
  try {
    const { academicYear } = req.body;

    const existingArchive = await Archive.findOne({ academicYear });
    if (existingArchive) {
      return res.status(400).json({ message: 'Academic year already archived' });
    }

    // Aggregating statistics
    const totalJobs = await Job.countDocuments();
    const totalApplications = await Application.countDocuments();
    const placedStudents = await StudentProfile.countDocuments({ placement_status: 'Placed' });
    
    // Calculate average salary (assuming salary is in Job model and we take placed applications)
    const placedApps = await Application.find({ status: 'Placed' }).populate('job_id');
    const totalSalary = placedApps.reduce((sum, app) => sum + (app.job_id?.salary || 0), 0);
    const averageSalary = placedApps.length > 0 ? Math.round(totalSalary / placedApps.length) : 0;

    // Get top companies
    const companyStats = await Job.aggregate([
      { $group: { _id: '$companyName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    const topCompanies = companyStats.map(c => c._id);

    // Create Archive
    const archive = await Archive.create({
      academicYear,
      totalJobs,
      totalApplications,
      placedStudents,
      averageSalary,
      topCompanies,
      closedBy: req.user._id,
      archivedData: {
        // You could store more detailed snapshots here
      }
    });

    res.status(201).json(archive);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all archives
// @route   GET /api/admin/archives
// @access  Private/Admin
const getArchives = async (req, res) => {
  try {
    const archives = await Archive.find().sort({ academicYear: -1 });
    res.json(archives);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  archiveYear,
  getArchives,
};
