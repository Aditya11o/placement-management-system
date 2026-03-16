const Student = require('../models/Student');
const Log = require('../models/Log');
const Notification = require('../models/Notification');
const Job = require('../models/Job');
const InterviewExperience = require('../models/InterviewExperience');
const Application = require('../models/Application');

/**
 * @desc    Get current student profile
 * @route   GET /api/v1/students/profile
 * @access  Private/Student
 */
exports.getStudentProfile = async (req, res, next) => {
    try {
        const student = await Student.findById(req.user._id).select('-password');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student record not found'
            });
        }

        res.status(200).json({
            success: true,
            data: student
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

/**
 * @desc    Update student profile details
 * @route   PUT /api/v1/students/profile
 * @access  Private/Student
 */
exports.updateStudentProfile = async (req, res, next) => {
    try {
        const { name, phone, graduation_year, branch, cgpa, gender, marks_10th, marks_12th, backlogs_active, skills, projects, internships } = req.body;

        // Prevent updating sensitive fields like email or status via this endpoint
        const fieldsToUpdate = {
            name,
            phone,
            graduation_year,
            branch,
            cgpa,
            gender,
            marks_10th,
            marks_12th,
            backlogs_active,
            skills,
            projects,
            internships
        };

        const student = await Student.findByIdAndUpdate(
            req.user._id,
            { $set: fieldsToUpdate },
            { new: true, runValidators: true }
        ).select('-password');

        await Log.create({
            user_id: student._id,
            user_role: 'STUDENT',
            action: 'UPDATE_PROFILE',
            description: 'Student updated profile information'
        });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: student
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

/**
 * @desc    Get all students (for recruiters/admins)
 * @route   GET /api/v1/students
 * @access  Private/Recruiter,Admin
 */
exports.getStudents = async (req, res, next) => {
    // advancedResults middleware will handle the query and attaching it to res.advancedResults
    res.status(200).json(res.advancedResults);
};

/**
 * @desc    Invite student to apply for a job
 * @route   POST /api/v1/students/:id/invite
 * @access  Private/Recruiter
 */
exports.inviteStudent = async (req, res, next) => {
    try {
        const { jobId } = req.body;
        const student = await Student.findById(req.params.id);
        const job = await Job.findById(jobId);

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Check if already invited or applied (optional, but good for UX)
        // For simplicity, we just send the notification

        await Notification.create({
            recipientId: student._id,
            recipientModel: 'Student',
            title: 'Job Invitation 💼',
            message: `${req.user.name} from ${job.company_name || 'their company'} has invited you to apply for the position: ${job.title}.`,
            type: 'INFO',
            link: `/jobs/${job._id}`,
            metadata: {
                jobId: job._id,
                recruiterId: req.user._id,
                type: 'INVITATION'
            },
            actions: [
                {
                    label: 'View Job',
                    url: `/jobs/${job._id}`,
                    method: 'GET',
                    color: 'indigo'
                }
            ]
        });

        await Log.create({
            user_id: req.user._id,
            user_role: 'RECRUITER',
            action: 'INVITE_STUDENT',
            description: `Recruiter invited student ${student.name} to apply for job ${job.title}`
        });

        res.status(200).json({
            success: true,
            message: `Invitation sent to ${student.name}`
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

/**
 * @desc    Get gamified readiness score for the logged-in student
 * @route   GET /api/v1/students/readiness-score
 * @access  Private/Student
 */
exports.getReadinessScore = async (req, res, next) => {
    try {
        const student = await Student.findById(req.user._id);
        const appCount = await Application.countDocuments({ student: req.user._id });
        const expCount = await InterviewExperience.countDocuments({ student: req.user._id });

        let score = 0;
        const breakdown = [];
        const actions = [];

        // 1. Profile Completion (50%)
        const basics = ['name', 'email', 'phone', 'branch', 'cgpa', 'marks_10th', 'marks_12th'];
        basics.forEach(field => {
            if (student[field]) score += 5;
            else actions.push({ task: `Add your ${field.replace('_', ' ')}`, points: 5, category: 'PROFILE' });
        });
        
        if (student.graduation_year) score += 5;
        else actions.push({ task: 'Add graduation year', points: 5, category: 'PROFILE' });

        if (student.profile_image_url) score += 10;
        else actions.push({ task: 'Upload a profile picture', points: 10, category: 'PROFILE' });

        // 2. Preparation (30%)
        const activeResume = student.resume_versions?.find(v => v.is_active);
        if (activeResume) score += 15;
        else actions.push({ task: 'Upload and activate a resume', points: 15, category: 'PREP' });

        if (student.skills?.length >= 3) score += 15;
        else actions.push({ task: 'List at least 3 skills', points: 15, category: 'PREP' });

        // 3. Engagement (20%)
        if (appCount >= 3) score += 10;
        else actions.push({ task: 'Apply to at least 3 jobs', points: 10, category: 'ENGAGEMENT' });

        if (expCount >= 1) score += 10;
        else actions.push({ task: 'Share an interview experience', points: 10, category: 'ENGAGEMENT' });

        // Status determination
        let label = 'Entry Level';
        if (score > 85) label = 'Elite Candidate';
        else if (score > 70) label = 'Placement Ready';
        else if (score > 40) label = 'Polish Needed';

        res.status(200).json({
            success: true,
            data: {
                score,
                label,
                recommendations: actions.sort((a, b) => b.points - a.points).slice(0, 3)
            }
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

/**
 * @desc    Get alumni directory (placed students)
 * @route   GET /api/v1/students/alumni
 * @access  Private/Student
 */
exports.getAlumniDirectory = async (req, res, next) => {
    try {
        const alumni = await Student.find({ is_placed: true })
            .select('name profile_image_url branch graduation_year placement_details skills public_profile_slug')
            .sort('-placement_details.placed_at');

        res.status(200).json({
            success: true,
            count: alumni.length,
            data: alumni
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

/**
 * @desc    Get detailed career analytics and trajectory
 * @route   GET /api/v1/students/career-analytics
 * @access  Private/Student
 */
exports.getCareerAnalytics = async (req, res, next) => {
    try {
        const applications = await Application.find({ 
            student_id: req.user._id,
            'scorecards.0': { $exists: true } // Only applications with feedback
        }).sort('applied_at');

        if (applications.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No performance data available yet. Complete more interviews to see analytics.',
                data: {
                    trajectory: [],
                    readiness: { technical: 0, communication: 0, culture: 0 },
                    benchmarks: { technical: 4, communication: 4, culture: 3.5 }
                }
            });
        }

        // 1. Trajectory (Overall Score over Time)
        const trajectory = applications.map(app => {
            // Average overall score if multiple scorecards exist for one app
            const avgOverall = app.scorecards.reduce((acc, s) => acc + s.overall, 0) / app.scorecards.length;
            return {
                date: app.applied_at,
                score: parseFloat(avgOverall.toFixed(2)),
                job: app.job_id // Could populate if needed
            };
        });

        // 2. Domain Readiness Breakdown
        let totalTech = 0, totalComm = 0, totalCult = 0, totalCards = 0;
        applications.forEach(app => {
            app.scorecards.forEach(s => {
                totalTech += s.technical;
                totalComm += s.communication;
                totalCult += s.culture;
                totalCards++;
            });
        });

        const readiness = {
            technical: parseFloat((totalTech / totalCards).toFixed(2)),
            communication: parseFloat((totalComm / totalCards).toFixed(2)),
            culture: parseFloat((totalCult / totalCards).toFixed(2))
        };

        // 3. Market Benchmarks (Static for now, could be dynamic averages)
        const benchmarks = {
            technical: 4.2,
            communication: 4.0,
            culture: 3.8
        };

        res.status(200).json({
            success: true,
            data: {
                trajectory,
                readiness,
                benchmarks,
                totalAssessments: totalCards
            }
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

/**
 * @desc    Update student's portfolio theme
 * @route   PUT /api/v1/students/portfolio-theme
 * @access  Private/Student
 */
exports.updatePortfolioTheme = async (req, res, next) => {
    try {
        const { theme } = req.body;
        
        if (!['MINIMALIST', 'CREATIVE', 'TECHNICAL', 'EXECUTIVE'].includes(theme)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid theme selected'
            });
        }

        const student = await Student.findByIdAndUpdate(
            req.user._id,
            { $set: { portfolio_theme: theme } },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: `Theme updated to ${theme}`,
            data: { portfolio_theme: student.portfolio_theme }
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

/**
 * @desc    Get currently online peers (placeholder for real-time presence)
 * @route   GET /api/v1/students/online-peers
 * @access  Private/Student
 */
exports.getOnlinePeers = async (req, res, next) => {
    try {
        // In a real app, this would query a Redis store or similar for active sessions
        // Mocking with some "recently active" students for now
        const peers = await Student.find({ 
            _id: { $ne: req.user._id },
            status: 'APPROVED'
        }).limit(5).select('name profile_image_url branch is_placed skills');

        res.status(200).json({
            success: true,
            count: peers.length,
            data: peers.map(p => ({ ...p.toObject(), isOnline: Math.random() > 0.5 }))
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

/**
 * @desc    Get placement probability and recommended jobs
 * @route   GET /api/v1/students/placement-predictor
 * @access  Private/Student
 */
exports.getPlacementPredictor = async (req, res, next) => {
    try {
        const student = await Student.findById(req.user._id);
        
        // Advanced "prediction" logic for premium dashboard
        const cgpa = student.cgpa || 0;
        const skillsCount = student.skills?.length || 0;
        
        // Logic for Odds
        const massOdds = Math.min(98, 40 + (cgpa * 5) + (skillsCount * 2));
        const dreamOdds = Math.min(85, 20 + (cgpa * 8) + (skillsCount * 4));
        const superDreamOdds = Math.min(60, 5 + (cgpa * 5) + (skillsCount * 6));

        // Logic for Timeline
        const graduationYear = student.graduation_year || new Date().getFullYear() + 1;
        const currentYear = new Date().getFullYear();
        const daysToReady = Math.max(0, (graduationYear - currentYear) * 180 + (100 - (cgpa * 10)));
        
        // Logic for Skill Gaps (Mocked vs common requirements)
        const commonDreamSkills = ['React', 'Node.js', 'MongoDB', 'Docker', 'System Design'];
        const skillGaps = commonDreamSkills.filter(s => !student.skills?.includes(s)).slice(0, 2);

        res.status(200).json({
            success: true,
            data: {
                odds: {
                    mass: massOdds,
                    dream: dreamOdds,
                    superDream: superDreamOdds
                },
                timeline: {
                    daysToReady: Math.round(daysToReady),
                    progress: Math.min(100, (skillsCount / 10) * 100)
                },
                skillGaps: skillGaps.length > 0 ? skillGaps : ['Advanced System Design', 'Cloud Architecture']
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
