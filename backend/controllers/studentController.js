const StudentProfile = require('../models/StudentProfile');

// @desc    Get student resume URL
// @route   GET /api/student/resume
// @access  Private
const getStudentResume = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user_id: req.user.id });
    
    if (!profile || (!profile.resume_path && !profile.resume)) {
      return res.status(404).json({ message: 'No resume found' });
    }

    res.json({ 
      resume_url: profile.resume_path || profile.resume,
      success: true 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStudentResume };
