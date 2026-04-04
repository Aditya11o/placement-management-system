const Application = require('../models/Application');
const Job = require('../models/Job');
const Profile = require('../models/Profile');
const StudentResume = require('../models/StudentResume');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Apply for a job
// @route   POST /api/applications/:jobId
// @access  Private (Student)
const applyForJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const { resumeId } = req.body || {};
    
    // Check if profile exists and has resume
    const profile = await Profile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(400).json({ message: 'Profile not found' });
    }

    // Check for existing application
    const existingApplication = await Application.findOne({
      student: req.user.id,
      job: req.params.jobId
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    // Eligibility check (Basic)
    if (profile.studentDetails.cgpa < job.eligibility.minCGPA) {
       return res.status(400).json({ message: `Insufficient CGPA. Minimum required is ${job.eligibility.minCGPA}` });
    }

    let finalResumeUrl = profile.studentDetails.resume || '';
    let finalResumeId = resumeId;

    if (resumeId) {
      const selectedResume = await StudentResume.findById(resumeId);
      if (selectedResume && selectedResume.student_id.toString() === req.user.id) {
        finalResumeUrl = selectedResume.resume_url;
      }
    } else {
      // Find primary or latest
      const primaryResume = await StudentResume.findOne({ student_id: req.user.id, isPrimary: true });
      if (primaryResume) {
        finalResumeId = primaryResume._id;
        finalResumeUrl = primaryResume.resume_url;
      } else if (profile.studentDetails.resume) {
        finalResumeUrl = profile.studentDetails.resume;
      }
    }

    if (!finalResumeUrl && !finalResumeId) {
      return res.status(400).json({ message: 'Please upload or build a resume before applying' });
    }

    const application = await Application.create({
      student: req.user.id,
      job: req.params.jobId,
      resume: finalResumeUrl,
      resumeId: finalResumeId
    });

    // Increment application count in Job
    job.applicationsCount += 1;
    await job.save();

    // Increment application stats in StudentResume if applicable
    if (finalResumeId) {
      await StudentResume.findByIdAndUpdate(finalResumeId, { $inc: { 'stats.applications': 1 } });
    }

    // Create notification for student
    await Notification.create({
      recipient: req.user.id,
      sender: req.user.id,
      type: 'status_update',
      title: 'Application Submitted',
      message: `Your application for ${job.title} at ${job.companyName} has been submitted successfully.`
    });

    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};
