const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');

// @desc    Get student dashboard data
// @route   GET /api/student/dashboard
// @access  Private
const getStudentDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const [totalApplied, underReview, shortlisted, selected, rejected, totalJobs] = await Promise.all([
      prisma.application.count({ where: { studentId: profile.id } }),
      prisma.application.count({ where: { studentId: profile.id, status: { in: ['Applied', 'Under Review'] } } }),
      prisma.application.count({ where: { studentId: profile.id, status: 'Shortlisted' } }),
      prisma.application.count({ where: { studentId: profile.id, status: { in: ['Selected', 'Accepted', 'Placed'] } } }),
      prisma.application.count({ where: { studentId: profile.id, status: 'Rejected' } }),
      prisma.job.count({ where: { status: 'open', deadline: { gte: new Date() } } })
    ]);

    const recentApplications = await prisma.application.findMany({
      where: { studentId: profile.id },
      include: { job: { select: { title: true, companyName: true, status: true, deadline: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const upcomingInterviews = await prisma.application.findMany({
      where: { studentId: profile.id, interviewDate: { gte: new Date() } },
      include: { job: { select: { title: true, companyName: true, location: true } } },
      orderBy: { interviewDate: 'asc' }
    });

    const recentJobs = await prisma.job.findMany({
      where: { status: 'open', deadline: { gte: new Date() } },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({
      stats: { totalJobs, applied: totalApplied, underReview, shortlisted, selected, rejected },
      applications: recentApplications.map(a => ({ ...a, _id: a.id, job: { ...a.job, _id: a.jobId } })),
      interviews: upcomingInterviews.map(i => ({ ...i, _id: i.id, job: { ...i.job, _id: i.jobId } })),
      jobs: recentJobs.map(j => ({ ...j, _id: j.id })),
      notifications: notifications.map(n => ({ ...n, _id: n.id }))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student resume URL
// @route   GET /api/student/resume
// @access  Private
const getStudentResume = async (req, res, next) => {
  try {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile || !profile.resumePath) return res.status(404).json({ message: 'No resume found' });
    res.json({ resume_url: profile.resumePath, success: true });
  } catch (error) {
    next(error);
  }
};

const updateStudentProfile = async (req, res, next) => {
  try {
    const { name, phone, branch, course, cgpa } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name }
    });

    const profile = await prisma.studentProfile.upsert({
      where: { userId: req.user.id },
      update: { phone, branch, course, cgpa: parseFloat(cgpa) },
      create: { userId: req.user.id, phone, branch, course, cgpa: parseFloat(cgpa) }
    });

    res.json({ success: true, message: 'Profile updated successfully', profile: { ...profile, _id: profile.id } });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/students/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid current password' });

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notification settings
// @route   GET /api/students/notification-settings
// @access  Private
const getNotificationSettings = async (req, res, next) => {
  try {
    const profile = await prisma.studentProfile.findUnique({ 
        where: { userId: req.user.id },
        include: { settings: true }
    });
    if (!profile.settings) {
       const settings = await prisma.studentSettings.create({ data: { studentId: profile.id } });
       return res.json(settings);
    }
    res.json(profile.settings);
  } catch (error) {
    next(error);
  }
};

const updateNotificationSettings = async (req, res, next) => {
  try {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const settings = await prisma.studentSettings.upsert({
      where: { studentId: profile.id },
      update: req.body,
      create: { studentId: profile.id, ...req.body }
    });
    res.json({ success: true, message: 'Settings updated', settings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get privacy settings
// @route   GET /api/students/privacy-settings
// @access  Private
const getPrivacySettings = async (req, res, next) => {
  try {
    let settings = await StudentSettings.findOne({ user_id: req.user.id });
    if (!settings) {
      settings = await StudentSettings.create({ user_id: req.user.id });
    }
    res.json(settings.privacy);
  } catch (error) {
    next(error);
  }
};

// @desc    Update privacy settings
// @route   PUT /api/students/privacy-settings
// @access  Private
const updatePrivacySettings = async (req, res, next) => {
  try {
    let settings = await StudentSettings.findOne({ user_id: req.user.id });
    if (!settings) {
      settings = new StudentSettings({ user_id: req.user.id });
    }
    settings.privacy = { ...settings.privacy, ...req.body };
    await settings.save();
    res.json({ success: true, message: 'Privacy settings updated', privacy: settings.privacy });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload resume
// @route   POST /api/students/upload-resume
// @access  Private
const uploadStudentResume = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { makePrimary } = req.body;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const url = `/uploads/resumes/${req.file.filename}`;
    const name = req.file.originalname;

    if (makePrimary === 'true' || makePrimary === true) {
      await prisma.studentResume.updateMany({
        where: { studentId: profile.id },
        data: { isDefault: false }
      });
    }

    const resume = await prisma.studentResume.create({
      data: {
        studentId: profile.id,
        url,
        name,
        isDefault: makePrimary === 'true' || makePrimary === true
      }
    });

    if (makePrimary === 'true' || makePrimary === true) {
      await prisma.studentProfile.update({
        where: { id: profile.id },
        data: { resumePath: url }
      });
    }

    res.status(201).json({ success: true, message: 'Resume uploaded successfully', resume: { ...resume, _id: resume.id } });
  } catch (error) {
    next(error);
  }
};

// @desc    Create built resume (structured data)
// @route   POST /api/students/build-resume
// @access  Private
const createBuiltResume = async (req, res, next) => {
  try {
    const { resume_name, content, makePrimary } = req.body;
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });

    if (makePrimary) {
      await prisma.studentResume.updateMany({
        where: { studentId: profile.id },
        data: { isDefault: false }
      });
    }

    const resume = await prisma.studentResume.create({
      data: {
        studentId: profile.id,
        name: resume_name,
        url: 'built-resume',
        isDefault: !!makePrimary
      }
    });

    if (makePrimary) {
      await prisma.studentProfile.update({
        where: { id: profile.id },
        data: { resumePath: 'built-resume' }
      });
    }

    res.status(201).json({ success: true, message: 'Resume built successfully', resume: { ...resume, _id: resume.id } });
  } catch (error) {
    next(error);
  }
};

// @desc    Set primary resume
// @route   PATCH /api/students/resume/:id/primary
// @access  Private
const setPrimaryResume = async (req, res, next) => {
  try {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const resume = await prisma.studentResume.findUnique({ where: { id: req.params.id } });
    
    if (!resume || resume.studentId !== profile.id) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    await prisma.studentResume.updateMany({
      where: { studentId: profile.id },
      data: { isDefault: false }
    });

    await prisma.studentResume.update({
      where: { id: req.params.id },
      data: { isDefault: true }
    });

    await prisma.studentProfile.update({
      where: { id: profile.id },
      data: { resumePath: resume.url }
    });

    res.json({ success: true, message: 'Primary resume updated' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete resume
// @route   DELETE /api/students/resume/:id
// @access  Private
const deleteStudentResume = async (req, res, next) => {
  try {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const resume = await prisma.studentResume.findUnique({ where: { id: req.params.id } });
    
    if (!resume || resume.studentId !== profile.id) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    await prisma.studentResume.delete({ where: { id: req.params.id } });

    if (profile.resumePath === resume.url) {
      await prisma.studentProfile.update({
        where: { id: profile.id },
        data: { resumePath: '' }
      });
    }

    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all resumes for student
// @route   GET /api/students/resume
// @access  Private
const getStudentResumes = async (req, res, next) => {
  try {
    const profile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    const resumes = await prisma.studentResume.findMany({
      where: { studentId: profile.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(resumes.map(r => ({ ...r, _id: r.id })));
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate account
// @route   PUT /api/students/deactivate
// @access  Private
const deactivateAccount = async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { status: 'inactive' }
    });
    res.json({ success: true, message: 'Account deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.user.id } });
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getStudentResume, 
  getStudentDashboard,
  updateStudentProfile,
  changePassword,
  getNotificationSettings,
  updateNotificationSettings,
  getPrivacySettings,
  updatePrivacySettings,
  uploadStudentResume,
  createBuiltResume,
  setPrimaryResume,
  deleteStudentResume,
  getStudentResumes,
  deactivateAccount,
  deleteAccount
};
