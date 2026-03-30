const RecruiterSettings = require('../models/RecruiterSettings');

// @desc    Get recruiter settings
// @route   GET /api/settings/recruiter
// @access  Private
const getRecruiterSettings = async (req, res, next) => {
  try {
    let settings = await RecruiterSettings.findOne({ user_id: req.user.id });
    
    if (!settings) {
      settings = await RecruiterSettings.create({
        user_id: req.user.id,
        notifications: {
          emailSummary: true,
          interviewAlerts: true,
          applicationAlerts: true
        }
      });
    }
    
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// @desc    Update recruiter settings
// @route   PUT /api/settings/recruiter
// @access  Private
const updateRecruiterSettings = async (req, res, next) => {
  try {
    let settings = await RecruiterSettings.findOne({ user_id: req.user.id });
    
    if (!settings) {
      settings = new RecruiterSettings({ user_id: req.user.id, ...req.body });
    } else {
      Object.assign(settings, req.body);
    }
    
    await settings.save();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecruiterSettings,
  updateRecruiterSettings
};
