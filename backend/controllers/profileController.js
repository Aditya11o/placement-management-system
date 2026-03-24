const StudentProfile = require('../models/StudentProfile');
const RecruiterProfile = require('../models/RecruiterProfile');
const AdminProfile = require('../models/AdminProfile');
const User = require('../models/User');
const cloudinary = require('../utils/cloudinary');

// Helper to get the correct model based on role
const getProfileModel = (role) => {
  switch (role?.toLowerCase()) {
    case 'student':
    case 'alumni':
    case 'mentor':
      return StudentProfile;
    case 'recruiter':
      return RecruiterProfile;
    case 'admin':
      return AdminProfile;
    default:
      return null;
  }
};

// @desc    Get current user profile
// @route   GET /api/profile/me
// @access  Private
const getMyProfile = async (req, res, next) => {
  try {
    const Model = getProfileModel(req.user.role);
    if (!Model) return res.status(400).json({ message: 'Invalid user role' });

    const query = req.user.role === 'student' ? { user_id: req.user.id } : { user: req.user.id };
    const populateField = req.user.role === 'student' ? 'user_id' : 'user';
    
    let profile = await Model.findOne(query).populate(populateField, 'name email role');
    
    // If no profile exists yet, return user info and isNew flag
    if (!profile) {
      return res.json({ 
        user: { 
          _id: req.user.id, 
          name: req.user.name, 
          email: req.user.email, 
          role: req.user.role 
        },
        isNew: true 
      });
    }

    // Map user_id to user for frontend compatibility
    if (req.user.role === 'student') {
      const profileObj = profile.toObject();
      profileObj.user = profileObj.user_id;
      return res.json(profileObj);
    }
    
    res.json(profile);
  } catch (error) {
    console.error('GetMyProfile Error:', error);
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const Model = getProfileModel(req.user.role);
    if (!Model) return res.status(400).json({ message: 'Invalid user role' });

    let updateData = {};

    // Handle multipart/form-data for studentDetails/recruiterDetails
    if (req.body.studentDetails) {
      updateData = typeof req.body.studentDetails === 'string' 
        ? JSON.parse(req.body.studentDetails) 
        : req.body.studentDetails;
    } else if (req.body.recruiterDetails) {
      updateData = typeof req.body.recruiterDetails === 'string' 
        ? JSON.parse(req.body.recruiterDetails) 
        : req.body.recruiterDetails;
    } else {
      updateData = { ...req.body };
    }

    // Ensure full_name is present (synced from user)
    if (!updateData.full_name && req.user.name) {
      updateData.full_name = req.user.name;
    }

    // Handle profile photo upload
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'profiles',
          public_id: `user_${req.user.id}_avatar`,
          overwrite: true
        });
        updateData.profile_photo = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary Upload Error:', uploadError);
      }
    }

    // Ensure user reference is set exactly as per schema
    if (req.user.role === 'student') {
      updateData.user_id = req.user.id;
      // Sync email
      updateData.email = req.user.email;
    } else {
      updateData.user = req.user.id;
    }
    
    // Recalculate completion for students

    const query = req.user.role === 'student' ? { user_id: req.user.id } : { user: req.user.id };

    // Find the profile first
    let profile = await Model.findOne(query);

    if (!profile) {
      // Create new if not exists
      profile = new Model(updateData);
    } else {
      // Update existing
      Object.assign(profile, updateData);
    }

    // Save triggers the pre-save hook in StudentProfile for completion calculation
    await profile.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    next(error);
  }
};

// @desc    Add a project
// @route   POST /api/profile/projects
// @access  Private
const addProject = async (req, res, next) => {
  const { title, description, technologies, link, startDate, endDate } = req.body;
  
  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }

  try {
    const projectData = {
      title,
      description,
      technologies: Array.isArray(technologies) ? technologies : technologies?.split(',').map(s => s.trim()),
      link,
      startDate,
      endDate
    };

    let profile = await StudentProfile.findOne({ user_id: req.user.id });
    
    if (!profile) {
      profile = new StudentProfile({
        user_id: req.user.id,
        full_name: req.user.name,
        email: req.user.email,
        placement_status: 'Unplaced',
        projects: [projectData]
      });
    } else {
      profile.projects.push(projectData);
    }

    // Save triggers recalculation
    await profile.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Project added successfully',
      projects: profile.projects 
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload a resume
// @route   POST /api/profile/upload-resume
// @access  Private
const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const filePath = `/uploads/resumes/${req.file.filename}`;

    let profile = await StudentProfile.findOne({ user_id: req.user.id });

    if (!profile) {
      profile = new StudentProfile({
        user_id: req.user.id,
        full_name: req.user.name,
        email: req.user.email,
        resume_path: filePath,
        updated_at: new Date()
      });
    } else {
      profile.resume_path = filePath;
      profile.updated_at = new Date();
    }

    // Save triggers recalculation
    await profile.save();

    res.status(201).json({ 
      success: true, 
      message: 'Resume uploaded successfully',
      resume_path: filePath,
      profile_completion: profile.profile_completion
    });
  } catch (error) {
    next(error);
  }
};

// Compatibility and Helpers
const addResume = async (req, res, next) => {
  const { name, url, isDefault } = req.body;
  try {
    const profile = await StudentProfile.findOne({ user_id: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    if (!profile.resumes) profile.resumes = [];
    if (isDefault) {
      profile.resumes.forEach(r => r.isDefault = false);
    }

    profile.resumes.push({ name, url, isDefault });
    await profile.save();
    res.json(profile.resumes);
  } catch (error) {
    next(error);
  }
};

const deleteResume = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user_id: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    if (profile.resumes) {
      profile.resumes = profile.resumes.filter(
        r => r._id.toString() !== req.params.id
      );
    }
    await profile.save();
    res.json(profile.resumes || []);
  } catch (error) {
    next(error);
  }
};

const requestSkillVerification = async (req, res, next) => {
  const { skill, certificateUrl } = req.body;
  try {
    const profile = await StudentProfile.findOne({ user_id: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    if (!profile.verifiedSkills) profile.verifiedSkills = [];
    profile.verifiedSkills.push({ skill, certificateUrl });
    await profile.save();
    res.json(profile.verifiedSkills);
  } catch (error) {
    next(error);
  }
};

const updateResume = async (req, res, next) => {
    const { url } = req.body;
    try {
      const profile = await StudentProfile.findOne({ user: req.user.id });
      if (!profile) return res.status(404).json({ message: 'Profile not found' });
  
      if (!profile.resumes) profile.resumes = [];
      profile.resumes.unshift({
        name: 'Primary Resume',
        url,
        isDefault: true,
        uploadedAt: new Date()
      });
      
      profile.resumes.forEach((r, idx) => {
        if (idx !== 0) r.isDefault = false;
      });
  
      await profile.save();
      res.json(profile);
    } catch (error) {
      next(error);
    }
};

const updateProject = async (req, res, next) => {
  const { title, description, technologies, link, startDate, endDate } = req.body;
  const { projectId } = req.params;

  try {
    const profile = await StudentProfile.findOne({ user_id: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const projectIndex = profile.projects.findIndex(p => p._id.toString() === projectId);
    if (projectIndex === -1) return res.status(404).json({ message: 'Project not found' });

    profile.projects[projectIndex] = {
      ...profile.projects[projectIndex].toObject(),
      title,
      description,
      technologies: Array.isArray(technologies) ? technologies : technologies?.split(',').map(s => s.trim()),
      link,
      startDate: startDate || profile.projects[projectIndex].startDate,
      endDate: endDate || profile.projects[projectIndex].endDate
    };

    await profile.save();

    res.json({
      success: true,
      message: 'Project updated successfully',
      projects: profile.projects
    });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  const { projectId } = req.params;

  try {
    const profile = await StudentProfile.findOne({ user_id: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    profile.projects = profile.projects.filter(p => p._id.toString() !== projectId);
    
    await profile.save();

    res.json({
      success: true,
      message: 'Project deleted successfully',
      projects: profile.projects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student profile by ID
// @route   GET /api/profile/student/profile/:id
// @access  Private
const getStudentProfileById = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user_id: req.params.id }).select('full_name email phone address city state linkedin github portfolio dob gender profile_photo');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

// @desc    Get student skills by ID
// @route   GET /api/profile/student/skills/:id
// @access  Private
const getStudentSkillsById = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user_id: req.params.id }).select('skills');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile.skills || []);
  } catch (error) {
    next(error);
  }
};

// @desc    Get student projects by ID
// @route   GET /api/profile/student/projects/:id
// @access  Private
const getStudentProjectsById = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user_id: req.params.id }).select('projects');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile.projects || []);
  } catch (error) {
    next(error);
  }
};

// @desc    Get student academic info by ID
// @route   GET /api/profile/student/academic/:id
// @access  Private
const getStudentAcademicById = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user_id: req.params.id }).select('course department passing_year current_cgpa tenth_percentage twelfth_percentage');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getMyProfile, 
  updateProfile, 
  addResume, 
  deleteResume, 
  requestSkillVerification, 
  updateResume,
  addProject,
  uploadResume,
  updateProject,
  deleteProject,
  getStudentProfileById,
  getStudentSkillsById,
  getStudentProjectsById,
  getStudentAcademicById
};
