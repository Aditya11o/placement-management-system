const aiService = require('../services/aiService');
const logger = require('../utils/logger');

/**
 * @desc    Generate a job description using AI
 * @route   POST /api/v1/ai/generate-job-description
 * @access  Private (Recruiter)
 */
exports.generateDescription = async (req, res, next) => {
    try {
        const { title } = req.body;

        if (!title || typeof title !== 'string' || title.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid job title.'
            });
        }

        // Generate the description
        const description = await aiService.generateJobDescription(title);

        res.status(200).json({
            success: true,
            description
        });

    } catch (error) {
        logger.error(`AI Controller Error (generateDescription): ${error.message}`);
        console.error('FULL AI ERROR TRACE:', error);

        // Pass to global error handler specifically tracking external API failures
        if (error.message && error.message.includes('not configured')) {
            return res.status(503).json({
                success: false,
                message: 'AI Service is currently unavailable or unconfigured.'
            });
        }

        next(error);
    }
};
