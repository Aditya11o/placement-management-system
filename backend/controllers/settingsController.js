const Settings = require('../models/Settings');

// @desc    Get portal settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if not exists
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update portal settings
// @route   PUT /api/settings
// @access  Private (Admin)
const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
    }

    const { portalName, logo, primaryColor, secondaryColor, contactEmail, universityName } = req.body;

    settings.portalName = portalName || settings.portalName;
    settings.logo = logo || settings.logo;
    settings.primaryColor = primaryColor || settings.primaryColor;
    settings.secondaryColor = secondaryColor || settings.secondaryColor;
    settings.contactEmail = contactEmail || settings.contactEmail;
    settings.universityName = universityName || settings.universityName;
    settings.updatedBy = req.user.id;

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSettings, updateSettings };
