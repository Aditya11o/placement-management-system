const prisma = require('../utils/prisma');

// @desc    Get recruiter settings
// @route   GET /api/settings/recruiter
// @access  Private
const getRecruiterSettings = async (req, res, next) => {
  try {
    const profile = await prisma.recruiterProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    let settings = await prisma.recruiterSettings.findUnique({ where: { recruiterId: profile.id } });
    if (!settings) {
      settings = await prisma.recruiterSettings.create({ data: { recruiterId: profile.id } });
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
    const profile = await prisma.recruiterProfile.findUnique({ where: { userId: req.user.id } });
    const settings = await prisma.recruiterSettings.upsert({
      where: { recruiterId: profile.id },
      update: req.body,
      create: { recruiterId: profile.id, ...req.body }
    });
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecruiterSettings,
  updateRecruiterSettings
};
