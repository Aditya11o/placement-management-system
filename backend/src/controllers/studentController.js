const Student = require('../models/Student');
const Log = require('../models/Log');
const Notification = require('../models/Notification');
const Job = require('../models/Job');

/**
 * @desc    Get current student profile
 * @route   GET /api/v1/students/profile
 * @access  Private/Student
 */
exports.getStudentProfile = async (req, res) => {
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
exports.updateStudentProfile = async (req, res) => {
    try {
        const { name, phone, graduation_year, branch, cgpa, gender, marks_10th, marks_12th, backlogs_active, skills } = req.body;

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
            skills
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
exports.getStudents = async (req, res) => {
    // advancedResults middleware will handle the query and attaching it to res.advancedResults
    res.status(200).json(res.advancedResults);
};

/**
 * @desc    Invite student to apply for a job
 * @route   POST /api/v1/students/:id/invite
 * @access  Private/Recruiter
 */
exports.inviteStudent = async (req, res) => {
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
