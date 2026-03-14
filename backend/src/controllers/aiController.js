const aiService = require('../services/aiService');
const Job = require('../models/Job');
const Student = require('../models/Student');
const logger = require('../utils/logger');

/**
 * @desc    Generate a job description
 * @route   POST /api/v1/ai/generate-job-description
 * @access  Private/Recruiter
 */
exports.generateDescription = async (req, res, next) => {
    try {
        const { title } = req.body;
        const description = await aiService.generateJobDescription(title);
        res.status(200).json({ success: true, data: description });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Generate mock interview questions
 * @route   POST /api/v1/ai/generate-mock-interview
 * @access  Private/Student
 */
exports.generateMockInterview = async (req, res, next) => {
    try {
        const questions = await aiService.generateInterviewQuestions(req.body);
        res.status(200).json({ success: true, data: questions });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Analyze resume against job description
 * @route   POST /api/v1/ai/analyze-resume
 * @access  Private/Student
 */
exports.analyzeResume = async (req, res, next) => {
    try {
        const { resumeUrl, jobData } = req.body;
        const analysis = await aiService.analyzeResumeFit(resumeUrl, jobData);
        res.status(200).json({ success: true, data: analysis });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get next best actions for student
 * @route   GET /api/v1/ai/next-actions
 * @access  Private/Student
 */
exports.getNextActions = async (req, res, next) => {
    try {
        const actions = await aiService.generateNextBestActions(req.body);
        res.status(200).json({ success: true, data: actions });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Get skill suggestions for student
 * @route   GET /api/v1/ai/skill-suggestions
 * @access  Private/Student
 */
exports.getSkillSuggestions = async (req, res, next) => {
    try {
        const { branch, currentSkills } = req.query;
        const suggestions = await aiService.generateSkillSuggestions(branch, currentSkills ? currentSkills.split(',') : []);
        res.status(200).json({ success: true, data: suggestions });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Summarize interview experience
 * @route   POST /api/v1/ai/summarize-experience
 * @access  Private/Student
 */
exports.summarizeExperience = async (req, res, next) => {
    try {
        const summary = await aiService.generateExperienceSummary(req.body);
        res.status(200).json({ success: true, data: summary });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Analyze verbal interview response
 * @route   POST /api/v1/ai/analyze-response
 * @access  Private/Student
 */
exports.analyzeInterviewResponse = async (req, res, next) => {
    try {
        const { question, transcript } = req.body;
        const analysis = await aiService.analyzeInterviewResponse(question, transcript);
        res.status(200).json({ success: true, data: analysis });
    } catch (err) {
        next(err);
    }
};

/**
 * @desc    Auto-tune resume for a specific job
 * @route   POST /api/v1/ai/auto-tune-resume
 * @access  Private/Student
 */
exports.autoTuneResume = async (req, res, next) => {
    try {
        const { jobId, resumeVersion } = req.body;

        if (!jobId || !resumeVersion) {
            return res.status(400).json({
                success: false,
                message: 'Please provide jobId and resumeVersion'
            });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        const student = await Student.findById(req.user._id);
        const resume = student.resume_versions.find(v => v.version === parseInt(resumeVersion));
        
        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume version not found'
            });
        }

        const optimizedContent = await aiService.autoTuneResume(resume.url, {
            title: job.title,
            description: job.description,
            skills: job.requirements || []
        });

        res.status(200).json({
            success: true,
            data: optimizedContent
        });

    } catch (err) {
        logger.error(`Resume Auto-Tune Error: ${err.message}`);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
