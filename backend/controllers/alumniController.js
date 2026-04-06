const prisma = require('../utils/prisma');

// @desc    Get dashboard stats for alumni
// @route   GET /api/alumni/dashboard
// @access  Private (Alumni/Mentor only)
const getDashboardStats = async (req, res) => {
  try {
    const profile = await prisma.alumniProfile.findUnique({ where: { userId: req.user.id } });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    const [referralsGiven, completedSessions] = await Promise.all([
      prisma.job.count({ where: { alumniId: profile.id, isAlumniPost: true } }),
      prisma.mentorshipBooking.count({ where: { alumniId: profile.id, status: 'completed' } })
    ]);
    
    const uniqueStudents = await prisma.mentorshipBooking.groupBy({
      by: ['studentId'],
      where: { alumniId: profile.id }
    });
    
    const referralJobs = await prisma.job.findMany({ where: { alumniId: profile.id, isAlumniPost: true } });
    const applicantsOnReferrals = referralJobs.reduce((acc, job) => acc + (job.applicationsCount || 0), 0);

    res.json({
      referralsGiven,
      mentorshipHours: completedSessions,
      studentImpact: uniqueStudents.length + applicantsOnReferrals
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update alumni profile details
// @route   PUT /api/alumni/profile
// @access  Private
const updateAlumniProfile = async (req, res) => {
  try {
    const { company, designation, graduationYear, expertise, isAvailableForMentorship, linkedin, github } = req.body;
    
    const profile = await prisma.alumniProfile.upsert({
      where: { userId: req.user.id },
      update: {
        company, designation, graduationYear: parseInt(graduationYear), expertise,
        isAvailableForMentorship: !!isAvailableForMentorship, linkedin, github
      },
      create: {
        userId: req.user.id,
        company, designation, graduationYear: parseInt(graduationYear), expertise,
        isAvailableForMentorship: !!isAvailableForMentorship, linkedin, github
      }
    });

    res.json({ ...profile, _id: profile.id });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get Alumni Directory for Students
// @route   GET /api/alumni/directory
// @access  Private (Students)
const getDirectory = async (req, res) => {
  try {
    const profiles = await prisma.alumniProfile.findMany({
      include: { user: { select: { name: true, email: true, profilePhoto: true, role: true } } }
    });
    res.json(profiles.map(p => ({ ...p, _id: p.id, user: { ...p.user, _id: p.userId } })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all active job referrals by this alumni
// @route   GET /api/alumni/referrals
// @access  Private
const getReferrals = async (req, res) => {
  try {
    const profile = await prisma.alumniProfile.findUnique({ where: { userId: req.user.id } });
    const referrals = await prisma.job.findMany({
      where: { alumniId: profile?.id, isAlumniPost: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(referrals.map(r => ({ ...r, _id: r.id })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a job referral
// @route   POST /api/alumni/referrals
// @access  Private
const createReferral = async (req, res) => {
  try {
    const { title, description, companyName, location, salary, jobType, deadline, eligibility } = req.body;
    const profile = await prisma.alumniProfile.findUnique({ where: { userId: req.user.id } });
    const recruiter = await prisma.recruiterProfile.findFirst(); // Fallback recruiter if needed, or link to a generic admin

    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const referral = await prisma.job.create({
      data: {
        jobId: `REF-${random}`,
        recruiterId: recruiter.id, // Linking to a recruiter profile for compatibility
        alumniId: profile.id,
        title, description, companyName, location, salary,
        jobType: jobType.replace(' ', '_'),
        deadline: new Date(deadline),
        isAlumniPost: true,
        status: 'open'
      }
    });

    res.status(201).json({ ...referral, _id: referral.id });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Book mentorship session
// @route   POST /api/alumni/mentorship/request
// @access  Private (Student)
const bookMentorship = async (req, res) => {
  try {
    const { alumniId, requestedDate, query } = req.body;
    
    const existing = await prisma.mentorshipBooking.findFirst({
      where: { studentId: req.user.id, alumniId, status: 'pending' }
    });
    if (existing) return res.status(400).json({ message: 'Pending request exists.' });

    const booking = await prisma.mentorshipBooking.create({
      data: { studentId: req.user.id, alumniId, requestedDate: new Date(requestedDate), query, status: 'pending' }
    });

    res.status(201).json({ ...booking, _id: booking.id });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get Mentorship Requests (Incoming for Alumni, Outgoing for Student)
// @route   GET /api/alumni/mentorship/requests
// @access  Private
const getMentorshipRequests = async (req, res) => {
  try {
    let requests = [];
    if (req.user.role === 'student') {
      requests = await prisma.mentorshipBooking.findMany({
        where: { studentId: req.user.id },
        include: { alumni: { include: { user: { select: { name: true, profilePhoto: true, email: true } } } } },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      const profile = await prisma.alumniProfile.findUnique({ where: { userId: req.user.id } });
      requests = await prisma.mentorshipBooking.findMany({
        where: { alumniId: profile?.id },
        include: { student: { select: { name: true, profilePhoto: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      });
    }
    
    res.json(requests.map(r => ({ ...r, _id: r.id })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update Mentorship Status (Accept/Reject)
// @route   PUT /api/alumni/mentorship/:id
// @access  Private (Alumni)
const updateMentorshipStatus = async (req, res) => {
  try {
    const { status, meetingLink, feedback } = req.body;
    const profile = await prisma.alumniProfile.findUnique({ where: { userId: req.user.id } });
    
    const booking = await prisma.mentorshipBooking.update({
      where: { id: req.params.id },
      data: { status, meetingLink, feedback }
    });

    res.json({ ...booking, _id: booking.id });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
  updateAlumniProfile,
  getDirectory,
  getReferrals,
  createReferral,
  bookMentorship,
  getMentorshipRequests,
  updateMentorshipStatus
};
