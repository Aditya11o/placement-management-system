const Profile = require('../models/Profile');
const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/profile/me
// @access  Private
const getMyProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', 'name email role');
    if (!profile) {
      res.status(404);
      return res.json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

const calculateProfileCompletion = (profile) => {
  const details = profile.studentDetails || {};
  let score = 0;
  
  if (details.phone || (details.city && details.state)) score += 20;
  if (details.cgpa || details.passingYear) score += 20;
  if (details.skills && details.skills.length > 0) score += 20;
  if (details.projects && details.projects.length > 0) score += 20;
  if (details.resumes && details.resumes.length > 0) score += 20;
  
  return score;
};

// @desc    Update profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    console.log('Backend: Update Profile Received');
    console.log('Backend req.body:', req.body);
    console.log('Backend req.file:', req.file);

    let { bio, avatar, studentDetails, recruiterDetails } = req.body;
    
    // Support multipart/form-data where complex objects are stringified
    if (typeof studentDetails === 'string') {
      console.log('Parsing studentDetails string...');
      studentDetails = JSON.parse(studentDetails);
    }
    if (typeof recruiterDetails === 'string') recruiterDetails = JSON.parse(recruiterDetails);

    let profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Handle File Upload if present
    if (req.file) {
      const cloudinary = require('../utils/cloudinary');
      const fs = require('fs');
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'avatars',
          resource_type: 'image',
        });
        profile.avatar = result.secure_url;
        // Clean up local file
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        console.error('Cloudinary Upload Error:', uploadError);
        // Continue without avatar if upload fails, or handle as error
      }
    } else if (avatar !== undefined) {
      profile.avatar = avatar;
    }

    if (bio !== undefined) profile.bio = bio;
    
    if (req.user.role === 'student' && studentDetails) {
      console.log('UpdateProfile: Updating studentDetails...');
      Object.keys(studentDetails).forEach(key => {
        profile.studentDetails[key] = studentDetails[key];
      });
      profile.studentDetails.profile_completion = calculateProfileCompletion(profile);
    }
    
    if (req.user.role === 'recruiter' && recruiterDetails) {
      console.log('UpdateProfile: Updating recruiterDetails...');
      Object.keys(recruiterDetails).forEach(key => {
        profile.recruiterDetails[key] = recruiterDetails[key];
      });
    }

    const updatedProfile = await profile.save();
    console.log('UpdateProfile: Profile saved successfully');
    res.json({ 
      success: true, 
      message: 'Profile updated successfully',
      profile: updatedProfile 
    });
  } catch (error) {
    console.error('UpdateProfile Controller Error:', error);
    next(error);
  }
};
// @route   POST /api/profile/resumes
// @access  Private
const addResume = async (req, res, next) => {
  const { name, url, isDefault } = req.body;
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    if (isDefault) {
      profile.studentDetails.resumes.forEach(r => r.isDefault = false);
    }

    profile.studentDetails.resumes.push({ name, url, isDefault });
    profile.studentDetails.profile_completion = calculateProfileCompletion(profile);
    await profile.save();
    res.json(profile.studentDetails.resumes);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a resume
// @route   DELETE /api/profile/resumes/:id
// @access  Private
const deleteResume = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    profile.studentDetails.resumes = profile.studentDetails.resumes.filter(
      r => r._id.toString() !== req.params.id
    );
    profile.studentDetails.profile_completion = calculateProfileCompletion(profile);
    await profile.save();
    res.json(profile.studentDetails.resumes);
  } catch (error) {
    next(error);
  }
};

// @desc    Request skill verification
// @route   POST /api/profile/verify-skill
// @access  Private
const requestSkillVerification = async (req, res, next) => {
  const { skill, certificateUrl } = req.body;
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    profile.studentDetails.verifiedSkills.push({ skill, certificateUrl });
    await profile.save();
    res.json(profile.studentDetails.verifiedSkills);
  } catch (error) {
    next(error);
  }
};

// @desc    Update primary resume
// @route   POST /api/profile/student/resume
// @access  Private
const updateResume = async (req, res, next) => {
  const { url } = req.body;
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    profile.studentDetails.resumes.unshift({
      name: 'Primary Resume',
      url,
      isDefault: true,
      uploadedAt: new Date()
    });
    
    // Ensure only one default
    profile.studentDetails.resumes.forEach((r, idx) => {
      if (idx !== 0) r.isDefault = false;
    });

    profile.studentDetails.profile_completion = calculateProfileCompletion(profile);

    await profile.save();
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

module.exports = { getMyProfile, updateProfile, addResume, deleteResume, requestSkillVerification, updateResume };
