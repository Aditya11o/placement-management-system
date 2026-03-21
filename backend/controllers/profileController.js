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

module.exports = { getMyProfile, updateProfile };
