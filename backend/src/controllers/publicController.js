const Student = require('../models/Student');
const logger = require('../utils/logger');

/**
 * @desc    Get public portfolio by slug
 * @route   GET /api/v1/public/portfolio/:slug
 * @access  Public
 */
exports.getPublicPortfolio = async (req, res, next) => {
    try {
        const student = await Student.findOne({ 
            public_profile_slug: req.params.slug,
            status: 'APPROVED' // Only show approved students
        })
        .select('name branch cgpa skills projects internships profile_image_url gamification.badges portfolio_theme')
        .populate('placement_details.job_id', 'company_name title');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Portfolio not found or private.'
            });
        }

        res.status(200).json({
            success: true,
            data: student
        });

    } catch (error) {
        logger.error(`Public Controller Error (getPublicPortfolio): ${error.message}`);
        next(error);
    }
};
