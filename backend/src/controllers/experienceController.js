const InterviewExperience = require('../models/InterviewExperience');
const logger = require('../utils/logger');

/**
 * @desc    Share a new interview experience
 * @route   POST /api/v1/experiences
 * @access  Private (Student)
 */
exports.shareExperience = async (req, res, next) => {
    try {
        req.body.student = req.user.id;

        const experience = await InterviewExperience.create(req.body);

        res.status(201).json({
            success: true,
            data: experience
        });
    } catch (error) {
        logger.error(`Experience Controller Error (shareExperience): ${error.message}`);
        next(error);
    }
};

/**
 * @desc    Get all interview experiences with filters and pagination
 * @route   GET /api/v1/experiences
 * @access  Private (Authenticated)
 */
exports.getExperiences = async (req, res, next) => {
    try {
        const { company, role, difficulty, page = 1, limit = 10 } = req.query;
        
        const query = {};
        if (company) query.company_name = new RegExp(company, 'i');
        if (role) query.role = new RegExp(role, 'i');
        if (difficulty) query.difficulty = difficulty;

        const skip = (page - 1) * limit;
        
        const experiences = await InterviewExperience.find(query)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate('student', 'name profile_picture');

        const total = await InterviewExperience.countDocuments(query);

        res.status(200).json({
            success: true,
            count: experiences.length,
            pagination: {
                total,
                page: Number(page),
                pages: Math.ceil(total / limit)
            },
            data: experiences
        });
    } catch (error) {
        logger.error(`Experience Controller Error (getExperiences): ${error.message}`);
        next(error);
    }
};

/**
 * @desc    Upvote an interview experience
 * @route   POST /api/v1/experiences/:id/vote
 * @access  Private (Student)
 */
exports.voteExperience = async (req, res, next) => {
    try {
        const experience = await InterviewExperience.findById(req.params.id);

        if (!experience) {
            return res.status(404).json({ success: false, message: 'Experience not found' });
        }

        const studentId = req.user.id;
        const index = experience.upvotes.indexOf(studentId);

        if (index === -1) {
            // Upvote
            experience.upvotes.push(studentId);
        } else {
            // Remove upvote
            experience.upvotes.splice(index, 1);
        }

        await experience.save();

        res.status(200).json({
            success: true,
            upvotes: experience.upvotes.length
        });
    } catch (error) {
        logger.error(`Experience Controller Error (voteExperience): ${error.message}`);
        next(error);
    }
};

/**
 * @desc    Get aggregated prep kit for a company
 * @route   GET /api/v1/experiences/prep-kit/:companyName
 * @access  Private (Authenticated)
 */
exports.getPrepKit = async (req, res, next) => {
    try {
        const { companyName } = req.params;

        const experiences = await InterviewExperience.find({ 
            company_name: new RegExp(`^${companyName}$`, 'i') 
        }).populate('student', 'name');

        if (experiences.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No interview experiences found for ${companyName}`
            });
        }

        res.status(200).json({
            success: true,
            data: {
                companyName,
                experienceCount: experiences.length,
                summary: "Standard Prep Kit: Review previous student experiences for common questions and difficulty levels.",
                experiences: experiences.length > 5 ? experiences.slice(0, 5) : experiences
            }
        });

    } catch (error) {
        logger.error(`Experience Controller Error (getPrepKit): ${error.message}`);
        next(error);
    }
};
