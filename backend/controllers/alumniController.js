const Profile = require('../models/Profile');
const Job = require('../models/Job');
const MentorshipBooking = require('../models/MentorshipBooking');
const User = require('../models/User');

// @desc    Get dashboard stats for alumni
// @route   GET /api/alumni/dashboard
// @access  Private (Alumni/Mentor only)
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Active referrals
    const referralsGiven = await Job.countDocuments({ recruiter: userId, isAlumniPost: true });
    
    // Mentorship hours (dummy calculation based on completed sessions, assuming 1hr per session)
    const completedSessions = await MentorshipBooking.countDocuments({ alumni: userId, status: 'completed' });
    
    // Student impact (students booked + applicants on referrals)
    // We'll count unique students who booked + dummy math for referrals
    const uniqueStudents = await MentorshipBooking.distinct('student', { alumni: userId });
    
    // Sum of applicationsCount for their referrals
    const referralJobs = await Job.find({ recruiter: userId, isAlumniPost: true });
    const applicantsOnReferrals = referralJobs.reduce((acc, job) => acc + (job.applicationsCount || 0), 0);

    const studentImpact = uniqueStudents.length + applicantsOnReferrals;

    res.json({
      referralsGiven,
      mentorshipHours: completedSessions,
      studentImpact
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update alumni profile details
// @route   PUT /api/alumni/profile
// @access  Private
exports.updateAlumniProfile = async (req, res) => {
  try {
    const { company, designation, graduationYear, expertise, isAvailableForMentorship, linkedin, github } = req.body;
    
    let profile = await Profile.findOne({ user: req.user._id });
    
    if (!profile) {
      profile = new Profile({ user: req.user._id });
    }

    profile.alumniDetails = {
      ...profile.alumniDetails,
      company,
      designation,
      graduationYear,
      expertise,
      isAvailableForMentorship,
      socialLinks: { linkedin, github }
    };

    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get Alumni Directory for Students
// @route   GET /api/alumni/directory
// @access  Private (Students)
exports.getDirectory = async (req, res) => {
  try {
    // Find all profiles where user is an alumni or mentor
    const alumniUsers = await User.find({ role: { $in: ['alumni', 'mentor'] }, status: 'active' }).select('_id name email profilePhoto');
    const alumniIds = alumniUsers.map(u => u._id);

    const profiles = await Profile.find({ user: { $in: alumniIds } })
      .populate('user', 'name email profilePhoto role');

    res.json(profiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all active job referrals by this alumni
// @route   GET /api/alumni/referrals
// @access  Private
exports.getReferrals = async (req, res) => {
  try {
    const referrals = await Job.find({ recruiter: req.user._id, isAlumniPost: true }).sort('-createdAt');
    res.json(referrals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a job referral
// @route   POST /api/alumni/referrals
// @access  Private
exports.createReferral = async (req, res) => {
  try {
    const { title, description, companyName, location, salary, jobType, deadline, eligibility } = req.body;
    
    // Generate random Job ID if not passed
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const referral = new Job({
      job_id: `REF-${random}`,
      recruiter: req.user._id,
      title,
      description,
      companyName,
      location,
      salary,
      jobType,
      deadline,
      eligibility,
      isAlumniPost: true,
      status: 'open'
    });

    await referral.save();
    res.status(201).json(referral);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Book mentorship session
// @route   POST /api/alumni/mentorship/request
// @access  Private (Student)
exports.bookMentorship = async (req, res) => {
  try {
    const { alumniId, requestedDate, query } = req.body;
    
    const count = await MentorshipBooking.countDocuments({ student: req.user._id, alumni: alumniId, status: 'pending' });
    if (count > 0) {
      return res.status(400).json({ message: 'You already have a pending request with this mentor.' });
    }

    const booking = new MentorshipBooking({
      student: req.user._id,
      alumni: alumniId,
      requestedDate,
      query,
      status: 'pending'
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get Mentorship Requests (Incoming for Alumni, Outgoing for Student)
// @route   GET /api/alumni/mentorship/requests
// @access  Private
exports.getMentorshipRequests = async (req, res) => {
  try {
    let requests = [];
    if (req.user.role === 'student') {
      requests = await MentorshipBooking.find({ student: req.user._id })
        .populate('alumni', 'name profilePhoto email')
        .sort('-createdAt');
    } else {
      requests = await MentorshipBooking.find({ alumni: req.user._id })
        .populate('student', 'name profilePhoto email')
        .sort('-createdAt');
    }
    
    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update Mentorship Status (Accept/Reject)
// @route   PUT /api/alumni/mentorship/:id
// @access  Private (Alumni)
exports.updateMentorshipStatus = async (req, res) => {
  try {
    const { status, meetingLink, feedback } = req.body;
    const booking = await MentorshipBooking.findById(req.params.id);

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    // Ensure only the assigned alumni can update
    if (booking.alumni.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = status || booking.status;
    if (meetingLink) booking.meetingLink = meetingLink;
    if (feedback) booking.feedback = feedback;

    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
