const Student = require('../models/Student');
const Log = require('../models/Log');

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
