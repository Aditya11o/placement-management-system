const Profile = require('../models/Profile');
const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/profile/me
// @access  Private
const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', 'name email role');
    if (!profile) {
      res.status(404);
      return res.json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  const { bio, avatar, studentDetails, recruiterDetails } = req.body;

  try {
    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      // Update
      profile.bio = bio || profile.bio;
      profile.avatar = avatar || profile.avatar;
      
      if (req.user.role === 'student' && studentDetails) {
        profile.studentDetails = { ...profile.studentDetails, ...studentDetails };
      }
      
      if (req.user.role === 'recruiter' && recruiterDetails) {
        profile.recruiterDetails = { ...profile.recruiterDetails, ...recruiterDetails };
      }

      const updatedProfile = await profile.save();
      res.json(updatedProfile);
    } else {
      res.status(404);
      res.json({ message: 'Profile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a resume
// @route   POST /api/profile/resumes
// @access  Private
const addResume = async (req, res) => {
  const { name, url, isDefault } = req.body;
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    if (isDefault) {
      profile.studentDetails.resumes.forEach(r => r.isDefault = false);
    }

    profile.studentDetails.resumes.push({ name, url, isDefault });
    await profile.save();
    res.json(profile.studentDetails.resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a resume
// @route   DELETE /api/profile/resumes/:id
// @access  Private
const deleteResume = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    profile.studentDetails.resumes = profile.studentDetails.resumes.filter(
      r => r._id.toString() !== req.params.id
    );
    await profile.save();
    res.json(profile.studentDetails.resumes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request skill verification
// @route   POST /api/profile/verify-skill
// @access  Private
const requestSkillVerification = async (req, res) => {
  const { skill, certificateUrl } = req.body;
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    profile.studentDetails.verifiedSkills.push({ skill, certificateUrl });
    await profile.save();
    res.json(profile.studentDetails.verifiedSkills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyProfile, updateProfile, addResume, deleteResume, requestSkillVerification };
