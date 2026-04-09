const prisma = require('../utils/prisma');
const { cloudinary, uploadToCloudinary } = require('../utils/cloudinary');
const { createAuditLog } = require('./auditLogController');



// Helper to get the correct prisma model accessor based on role
const getProfileModel = (role) => {
  switch (role?.toLowerCase()) {
    case 'student':
    case 'alumni':
    case 'mentor':
      return 'studentProfile';
    case 'recruiter':
      return 'recruiterProfile';
    case 'admin':
      return 'adminProfile';
    default:
      return null;
  }
};

// @desc    Get current user profile
// @route   GET /api/profile/me
// @access  Private
const getMyProfile = async (req, res, next) => {
  try {
    const modelName = getProfileModel(req.user.role);
    if (!modelName) return res.status(400).json({ message: 'Invalid user role' });

    let profile;
    if (req.user.role === 'recruiter') {
      profile = await prisma.recruiterProfile.findUnique({
        where: { userId: req.user.id },
        include: { user: { select: { name: true, email: true, role: true, profilePhoto: true } } }
      });
    } else if (req.user.role === 'admin') {
      profile = await prisma.adminProfile.findUnique({
        where: { userId: req.user.id },
        include: { user: { select: { name: true, email: true, role: true, profilePhoto: true } } }
      });
    } else if (req.user.role === 'mentor') {
      profile = await prisma.mentorProfile.findUnique({
        where: { userId: req.user.id },
        include: { user: { select: { name: true, email: true, role: true, profilePhoto: true } } }
      });
    } else {
      profile = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id },
        include: { 
          user: { select: { name: true, email: true, role: true, profilePhoto: true } },
          resumes: true
        }
      });
    }
    
    if (!profile) {
      return res.json({ 
        user: { 
          _id: req.user.id, 
          id: req.user.id,
          name: req.user.name, 
          email: req.user.email, 
          role: req.user.role,
          profilePhoto: req.user.profilePhoto
        },
        isNew: true 
      });
    }

    // Adapt for frontend compatibility
    const profileJson = { ...profile };
    profileJson._id = profile.id;
    if (profile.user) {
      profileJson.user._id = profile.userId;
      profileJson.user_id = profile.userId; // compatibility with some views
    }

    return res.json(profileJson);
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
    const modelName = getProfileModel(req.user.role);
    if (!modelName) return res.status(400).json({ message: 'Invalid user role' });

    let updateData = {};
    if (req.body.studentDetails) {
      updateData = typeof req.body.studentDetails === 'string' ? JSON.parse(req.body.studentDetails) : req.body.studentDetails;
    } else if (req.body.recruiterDetails) {
      updateData = typeof req.body.recruiterDetails === 'string' ? JSON.parse(req.body.recruiterDetails) : req.body.recruiterDetails;
    } else {
      updateData = { ...req.body };
    }

    // Clean up fields that shouldn't be in the profile update
    const { id, _id, userId, user, createdAt, updatedAt, ...cleanUpdateData } = updateData;

    // Handle profile photo upload
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, {
          folder: 'profiles',
          public_id: `user_${req.user.id}_avatar`,
          overwrite: true
        }, 'avatar');
        cleanUpdateData.profilePhoto = result.secure_url;
        // Also update user's profile photo
        await prisma.user.update({
          where: { id: req.user.id },
          data: { profilePhoto: result.secure_url }
        });
      } catch (uploadError) {
        console.error('Cloudinary Upload Error:', uploadError);
      }
    }

    let profile;
    if (req.user.role === 'student') {
      profile = await prisma.studentProfile.upsert({
        where: { userId: req.user.id },
        update: cleanUpdateData,
        create: { ...cleanUpdateData, userId: req.user.id }
      });
    } else if (req.user.role === 'recruiter') {
      profile = await prisma.recruiterProfile.upsert({
        where: { userId: req.user.id },
        update: cleanUpdateData,
        create: { ...cleanUpdateData, userId: req.user.id }
      });
    } else if (req.user.role === 'admin') {
      profile = await prisma.adminProfile.upsert({
        where: { userId: req.user.id },
        update: cleanUpdateData,
        create: { ...cleanUpdateData, userId: req.user.id }
      });
    }
    await createAuditLog({
      userId: req.user.id,
      action: 'Profile Updated',
      type: 'PROFILE'
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: { ...profile, _id: profile.id }
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

    let profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    
    if (!profile) {
      profile = await prisma.studentProfile.create({
        data: {
          userId: req.user.id,
          projects: [projectData]
        }
      });
    } else {
      const projects = Array.isArray(profile.projects) ? [...profile.projects, projectData] : [projectData];
      profile = await prisma.studentProfile.update({
        where: { userId: req.user.id },
        data: { projects }
      });
    }

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

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'pms/resumes',
      resource_type: 'auto',
      public_id: `resume_${req.user.id}_${Date.now()}`,
    }, 'standard');

    const resumeUrl = result.secure_url;

    const profile = await prisma.studentProfile.upsert({
      where: { userId: req.user.id },
      update: { resumePath: resumeUrl },
      create: { userId: req.user.id, resumePath: resumeUrl }
    });
    await createAuditLog({
      userId: req.user.id,
      action: 'Resume Uploaded',
      type: 'PROFILE',
      details: { resumeUrl: resumeUrl }
    });

    res.status(201).json({ 
      success: true, 
      message: 'Resume uploaded successfully',
      resume_path: resumeUrl,
      profile_completion: profile.profileCompletion
    });
  } catch (error) {
    next(error);
  }
};

// Compatibility and Helpers
const addResume = async (req, res, next) => {
  const { name, url, isDefault } = req.body;
  try {
    if (isDefault) {
      // Unset other defaults
      await prisma.studentResume.updateMany({
        where: { student: { userId: req.user.id } },
        data: { isDefault: false }
      });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const resume = await prisma.studentResume.create({
      data: {
        name,
        url,
        isDefault: !!isDefault,
        studentId: profile.id
      }
    });

    const resumes = await prisma.studentResume.findMany({
      where: { studentId: profile.id }
    });

    res.json(resumes.map(r => ({ ...r, _id: r.id })));
  } catch (error) {
    next(error);
  }
};

const deleteResume = async (req, res, next) => {
  try {
    await prisma.studentResume.delete({
      where: { id: req.params.id }
    });
    
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const resumes = await prisma.studentResume.findMany({ where: { studentId: profile.id } });
    
    res.json(resumes.map(r => ({ ...r, _id: r.id })));
  } catch (error) {
    next(error);
  }
};

const requestSkillVerification = async (req, res, next) => {
  const { skill, certificateUrl } = req.body;
  // This would typically go into a verification queue or AuditLog in PG
  res.status(501).json({ message: 'Skill verification refactored to notification system soon.' });
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
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    let projects = Array.isArray(profile.projects) ? profile.projects : [];
    // Note: In Mongo, projects had _id. In JSONB, they might not unless we add them.
    // For now, assume based on index or title if id isn't present in JSON.
    const projectIndex = projects.findIndex(p => p.id === projectId || p._id === projectId);
    
    if (projectIndex === -1) return res.status(404).json({ message: 'Project not found' });

    projects[projectIndex] = {
      ...projects[projectIndex],
      title,
      description,
      technologies: Array.isArray(technologies) ? technologies : technologies?.split(',').map(s => s.trim()),
      link,
      startDate: startDate || projects[projectIndex].startDate,
      endDate: endDate || projects[projectIndex].endDate
    };

    const updatedProfile = await prisma.studentProfile.update({
      where: { userId: req.user.id },
      data: { projects }
    });

    res.json({
      success: true,
      message: 'Project updated successfully',
      projects: updatedProfile.projects
    });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  const { projectId } = req.params;

  try {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    let projects = Array.isArray(profile.projects) ? profile.projects : [];
    projects = projects.filter(p => (p.id !== projectId && p._id !== projectId));
    
    const updatedProfile = await prisma.studentProfile.update({
      where: { userId: req.user.id },
      data: { projects }
    });

    res.json({
      success: true,
      message: 'Project deleted successfully',
      projects: updatedProfile.projects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student profile by ID
// @route   GET /api/profile/student/profile/:id
// @access  Private (Admin, Recruiter, or Self)
const getStudentProfileById = async (req, res, next) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.params.id },
      select: { full_name: true, phone: true, address: true, city: true, state: true, linkedin: true, github: true, portfolio: true, dob: true, gender: true, profilePhoto: true }
    });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json({ ...profile, _id: req.params.id });
  } catch (error) {
    next(error);
  }
};

const getStudentSkillsById = async (req, res, next) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.params.id },
      select: { skills: true }
    });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile.skills || []);
  } catch (error) {
    next(error);
  }
};

const getStudentProjectsById = async (req, res, next) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.params.id },
      select: { projects: true }
    });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile.projects || []);
  } catch (error) {
    next(error);
  }
};

const getStudentAcademicById = async (req, res, next) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.params.id },
      select: { course: true, department: true, passingYear: true, current_cgpa: true, tenthPercentage: true, twelfthPercentage: true }
    });
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
